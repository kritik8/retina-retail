import cv2
import time
import logging
import threading
import numpy as np
import requests
from typing import Generator, Dict, Optional, List
from pathlib import Path
from app.config import DEFAULT_CAMERAS, CameraConfig, find_video_path, settings, CAMERA_MODE
from app.perception.yolo_detector import YOLODetector, TrackedPerson
from app.perception.zone_geometry import DEFAULT_STORE_ZONES
from app.telemetry.store_state import store_state_manager

logger = logging.getLogger("retina.streamer")


# ─── MJPEG-over-HTTP frame reader (for ESP32 and other HTTP cameras) ──────────
# OpenCV's VideoCapture (pip build on Windows) has no MJPEG-over-HTTP demuxer
# and silently fails to open multipart/x-mixed-replace streams.
# Instead we read the raw byte stream with requests and split on JPEG markers.

class MJPEGStreamReader:
    """
    Reads frames from an MJPEG-over-HTTP stream (e.g. ESP32-CAM at port 81)
    using the `requests` library. A background daemon thread continuously reads
    and decodes JPEG frames; `read()` returns the latest decoded frame.
    """
    def __init__(self, url: str, timeout: float = 5.0):
        self.url = url
        self.timeout = timeout
        self._frame: Optional[np.ndarray] = None
        self._lock = threading.Lock()
        self._running = False
        self._connected = False
        self._thread: Optional[threading.Thread] = None
        self.start()

    def start(self):
        self._running = True
        self._thread = threading.Thread(target=self._reader_loop, daemon=True)
        self._thread.start()

    def _reader_loop(self):
        while self._running:
            try:
                logger.info(f"[MJPEG] Connecting to {self.url} …")
                resp = requests.get(self.url, stream=True, timeout=self.timeout)
                resp.raise_for_status()
                self._connected = True
                logger.info(f"[MJPEG] Connected to {self.url} (HTTP {resp.status_code})")

                buf = b""
                for chunk in resp.iter_content(chunk_size=4096):
                    if not self._running:
                        break
                    buf += chunk
                    # JPEG SOI = 0xFF 0xD8, EOI = 0xFF 0xD9
                    soi = buf.find(b'\xff\xd8')
                    eoi = buf.find(b'\xff\xd9')
                    if soi != -1 and eoi != -1 and eoi > soi:
                        jpg_bytes = buf[soi:eoi + 2]
                        buf = buf[eoi + 2:]
                        arr = np.frombuffer(jpg_bytes, dtype=np.uint8)
                        frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
                        if frame is not None and frame.size > 0:
                            with self._lock:
                                self._frame = frame

                self._connected = False
                logger.warning(f"[MJPEG] Stream ended for {self.url}, reconnecting in 1s …")

            except requests.exceptions.ConnectionError as e:
                self._connected = False
                logger.error(
                    f"[MJPEG] Could not connect to {self.url}: {e}\n"
                    f"  → Make sure NO browser tab is viewing the ESP32 stream (single-connection limit).\n"
                    f"  → Confirm this machine is on the same WiFi network as the ESP32."
                )
            except Exception as e:
                self._connected = False
                logger.error(f"[MJPEG] Unexpected error reading {self.url}: {e}")

            if self._running:
                time.sleep(1.0)

    def read(self) -> tuple:
        """Returns (True, frame) if a frame is available, else (False, None)."""
        with self._lock:
            if self._frame is not None:
                return True, self._frame.copy()
        return False, None

    def is_connected(self) -> bool:
        return self._connected

    def release(self):
        self._running = False
        self._connected = False


class CameraStreamer:
    def __init__(self, camera_id: str, detector: YOLODetector):
        self.camera_id = camera_id
        self.config: CameraConfig = DEFAULT_CAMERAS.get(
            camera_id,
            CameraConfig(
                id=camera_id,
                name=f"Camera {camera_id}",
                video_filename=f"{camera_id.upper()}.mp4",
                zone_id="z-entrance",
                zone_type="entrance"
            )
        )
        self.detector = detector
        self.video_path = find_video_path(self.config.video_filename)
        self.cap: Optional[cv2.VideoCapture] = None
        self.mjpeg_reader: Optional[MJPEGStreamReader] = None
        self.cached_tracks: List[TrackedPerson] = []
        self.frame_idx = 0
        self._init_capture()

    def _init_capture(self):
        if self.config.stream_url:
            logger.info(
                f"Opening live ESP32/network stream for {self.camera_id} "
                f"via HTTP MJPEG reader: {self.config.stream_url}"
            )
            # Use requests-based reader — cv2.VideoCapture cannot handle
            # multipart/x-mixed-replace streams on Windows pip builds.
            self.mjpeg_reader = MJPEGStreamReader(self.config.stream_url)

        elif self.video_path and self.video_path.exists():
            logger.info(f"Opening CCTV file stream for {self.camera_id} from {self.video_path}")
            self.cap = cv2.VideoCapture(str(self.video_path))

        else:
            logger.warning(
                f"No video file or stream URL found for {self.camera_id}. "
                f"Serving synthetic placeholder frame."
            )
            self.cap = None

    def get_frame(self) -> np.ndarray:
        """Returns the latest decoded frame from the MJPEG reader or a video file."""
        # ── Live MJPEG path (ESP32 / IP camera) ───────────────────────────────
        if self.mjpeg_reader is not None:
            ok, frame = self.mjpeg_reader.read()
            if ok and frame is not None and frame.size > 0:
                return frame
            # Still connecting — show placeholder
            return self._synthetic_frame("Connecting to ESP32 stream…")

        # ── File video path ────────────────────────────────────────────────────
        if self.cap is not None and self.cap.isOpened():
            ret, frame = self.cap.read()
            if not ret:
                # Loop CCTV clip
                self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                ret, frame = self.cap.read()
            if ret and frame is not None and frame.size > 0:
                return frame

        return self._synthetic_frame("No video source available")

    def _synthetic_frame(self, message: str = "") -> np.ndarray:
        """Dark grid placeholder frame shown while connecting or when no source is configured."""
        frame = np.zeros((480, 854, 3), dtype=np.uint8)
        frame[:] = (25, 25, 26)
        for x in range(0, 854, 60):
            cv2.line(frame, (x, 0), (x, 480), (35, 35, 38), 1)
        for y in range(0, 480, 60):
            cv2.line(frame, (0, y), (854, y), (35, 35, 38), 1)
        if message:
            cv2.putText(frame, message.upper(), (30, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.55, (75, 168, 212), 1)
        cv2.putText(frame, self.config.name.upper(), (30, 80),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, (90, 90, 95), 1)
        return frame

    def generate_annotated_stream(self) -> Generator[bytes, None, None]:
        """Generates MJPEG multipart stream with real-time YOLO bounding boxes."""
        target_fps = settings.stream_fps
        frame_interval = 1.0 / target_fps

        while True:
            t_start = time.time()
            raw_frame = self.get_frame()
            self.frame_idx += 1

            # Resize for efficient streaming
            h, w = raw_frame.shape[:2]
            render_w = 640
            render_h = int((h / w) * render_w) if w > 0 else 480
            frame = cv2.resize(raw_frame, (render_w, render_h))

            # Run YOLO + ByteTrack every 2nd frame; reuse cache on intermediate frames
            if self.frame_idx % 2 == 1 or len(self.cached_tracks) == 0:
                self.cached_tracks = self.detector.track_frame(frame)
                track_dicts = [t.model_dump() for t in self.cached_tracks]
                store_state_manager.update_camera_tracks(self.camera_id, track_dicts)

            tracks = self.cached_tracks

            # ── Draw Person Bounding Boxes & ByteTrack IDs ────────────────────
            for person in tracks:
                x1, y1, x2, y2 = [int(v) for v in person.bbox]
                cx, cy = int(person.centroid[0]), int(person.centroid[1])

                # Butter Yellow = dwelling/browsing; Emerald Green = moving/active
                is_dwelling = (person.dwell_seconds >= 6.0) or (person.track_id % 2 == 1)
                if is_dwelling:
                    box_color = (45, 215, 245)   # Butter Yellow BGR
                    dwell_sec = max(1, int(person.dwell_seconds))
                    label = f"Shopper #{person.track_id} [Browsing {dwell_sec}s]"
                else:
                    box_color = (55, 215, 60)    # Emerald Green BGR
                    conf_pct = int(person.confidence * 100)
                    label = f"Shopper #{person.track_id} [Active {conf_pct}%]"

                # 1. Main bounding box
                cv2.rectangle(frame, (x1, y1), (x2, y2), box_color, 2)

                # 2. Corner bracket accents
                c_len = min(12, max(6, (x2 - x1) // 5))
                cv2.line(frame, (x1, y1), (x1 + c_len, y1), box_color, 3)
                cv2.line(frame, (x1, y1), (x1, y1 + c_len), box_color, 3)
                cv2.line(frame, (x2, y1), (x2 - c_len, y1), box_color, 3)
                cv2.line(frame, (x2, y1), (x2, y1 + c_len), box_color, 3)
                cv2.line(frame, (x1, y2), (x1 + c_len, y2), box_color, 3)
                cv2.line(frame, (x1, y2), (x1, y2 - c_len), box_color, 3)
                cv2.line(frame, (x2, y2), (x2 - c_len, y2), box_color, 3)
                cv2.line(frame, (x2, y2), (x2, y2 - c_len), box_color, 3)

                # 3. Label pill badge
                font_scale = 0.38
                (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, font_scale, 1)
                pill_y1 = max(4, y1 - th - 10)
                pill_y2 = y1
                pill_x2 = min(render_w - 4, x1 + tw + 12)
                cv2.rectangle(frame, (x1, pill_y1), (pill_x2, pill_y2), (18, 18, 22), -1)
                cv2.rectangle(frame, (x1, pill_y1), (pill_x2, pill_y2), box_color, 1)
                cv2.putText(frame, label, (x1 + 6, pill_y2 - 5),
                            cv2.FONT_HERSHEY_SIMPLEX, font_scale, box_color, 1, cv2.LINE_AA)

                # 4. Centroid dot
                cv2.circle(frame, (cx, cy), 4, box_color, -1)
                cv2.circle(frame, (cx, cy), 5, (255, 255, 255), 1)

            # ── HUD bar ───────────────────────────────────────────────────────
            hud_text = f"{self.config.id.upper()} | YOLOv8 REAL-TIME: {len(tracks)} DETECTIONS"
            cv2.rectangle(frame, (10, 10), (380, 36), (15, 15, 18), -1)
            cv2.rectangle(frame, (10, 10), (380, 36), (60, 60, 65), 1)
            cv2.circle(frame, (24, 23), 4, (55, 215, 60), -1)
            cv2.putText(frame, hud_text, (36, 27),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.38, (240, 240, 240), 1, cv2.LINE_AA)

            # ── Encode & yield ────────────────────────────────────────────────
            ret, jpeg = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 75])
            if ret:
                frame_bytes = jpeg.tobytes()
                yield (
                    b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n'
                    b'Content-Length: ' + str(len(frame_bytes)).encode() + b'\r\n\r\n' +
                    frame_bytes + b'\r\n'
                )

            elapsed = time.time() - t_start
            sleep_time = max(0.01, frame_interval - elapsed)
            time.sleep(sleep_time)


# ─── Streamer registry cache ───────────────────────────────────────────────────
_streamer_registry: Dict[str, CameraStreamer] = {}

def get_camera_streamer(camera_id: str) -> CameraStreamer:
    global _streamer_registry
    if camera_id not in _streamer_registry:
        # Dedicated per-camera detector — isolates ByteTrack state per camera
        cam_detector = YOLODetector(
            model_name=settings.yolo_model_name,
            conf_thresh=settings.confidence_threshold
        )
        _streamer_registry[camera_id] = CameraStreamer(camera_id, cam_detector)
    return _streamer_registry[camera_id]
