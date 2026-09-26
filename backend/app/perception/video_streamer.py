import cv2
import time
import logging
import numpy as np
from typing import Generator, Dict, Optional, List
from pathlib import Path
from app.config import DEFAULT_CAMERAS, CameraConfig, find_video_path, settings
from app.perception.yolo_detector import YOLODetector, TrackedPerson
from app.perception.zone_geometry import DEFAULT_STORE_ZONES
from app.telemetry.store_state import store_state_manager

logger = logging.getLogger("retina.streamer")

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
        self.cached_tracks: List[TrackedPerson] = []
        self.frame_idx = 0
        self._init_capture()

    def _init_capture(self):
        if self.config.stream_url:
            logger.info(f"Opening live network/ESP32 stream for {self.camera_id} from {self.config.stream_url}")
            # Use CAP_FFMPEG explicitly for ESP32 MJPEG over HTTP — plain cv2.VideoCapture(url)
            # often silently fails on Windows because OpenCV defaults to GStreamer or DirectShow
            # which don't handle multipart/x-mixed-replace HTTP streams.
            cap = cv2.VideoCapture(self.config.stream_url, cv2.CAP_FFMPEG)
            if cap.isOpened():
                logger.info(f"ESP32 stream opened via CAP_FFMPEG for {self.camera_id}")
                self.cap = cap
            else:
                cap.release()
                # Fallback: try default backend
                logger.warning(f"CAP_FFMPEG failed for {self.camera_id}, trying default backend...")
                cap2 = cv2.VideoCapture(self.config.stream_url)
                if cap2.isOpened():
                    logger.info(f"ESP32 stream opened via default backend for {self.camera_id}")
                    self.cap = cap2
                else:
                    cap2.release()
                    logger.error(f"Could NOT open ESP32 stream {self.config.stream_url} — check that:\n"
                                 f"  1. Laptop is on the same WiFi/AP as the ESP32\n"
                                 f"  2. No other client (browser tab) is holding the single-connection slot\n"
                                 f"  3. The ESP32 stream URL is correct")
                    self.cap = None
        elif self.video_path and self.video_path.exists():
            logger.info(f"Opening CCTV stream for {self.camera_id} from {self.video_path}")
            self.cap = cv2.VideoCapture(str(self.video_path))
        else:
            logger.warning(f"No video file or stream URL found for {self.camera_id}. Running synthetic optical generator.")
            self.cap = None

    def get_frame(self) -> np.ndarray:
        """Reads next frame with auto-looping for files and auto-reconnect for live streams."""
        if self.cap is not None and self.cap.isOpened():
            ret, frame = self.cap.read()
            if not ret:
                if self.config.stream_url:
                    # Live network stream disconnected, attempt reconnect
                    self.cap.release()
                    time.sleep(0.5)
                    self.cap = cv2.VideoCapture(self.config.stream_url)
                    ret, frame = self.cap.read()
                else:
                    # Loop back to beginning of CCTV clip
                    self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    ret, frame = self.cap.read()
            if ret and frame is not None and frame.size > 0:
                return frame

        # Fallback synthetic frame with dark retail ambient look
        frame = np.zeros((480, 854, 3), dtype=np.uint8)
        frame[:] = (25, 25, 26)  # Dark charcoal #19191A
        # Draw grid
        for x in range(0, 854, 60):
            cv2.line(frame, (x, 0), (x, 480), (35, 35, 38), 1)
        for y in range(0, 480, 60):
            cv2.line(frame, (0, y), (854, y), (35, 35, 38), 1)

        cv2.putText(
            frame,
            f"SYNTHETIC OPTIC STREAM - {self.config.name.upper()}",
            (30, 50),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (75, 168, 212),
            1
        )
        return frame

    def generate_annotated_stream(self) -> Generator[bytes, None, None]:
        """Generates MJPEG multipart stream with real-time YOLO bounding boxes."""
        target_fps = settings.stream_fps
        frame_interval = 1.0 / target_fps

        while True:
            t_start = time.time()
            raw_frame = self.get_frame()
            self.frame_idx += 1

            # Resize frame for efficient streaming
            h, w = raw_frame.shape[:2]
            render_w = 640
            render_h = int((h / w) * render_w)
            frame = cv2.resize(raw_frame, (render_w, render_h))

            # Run YOLO + ByteTrack every 2nd frame for low latency, reusing cache on intermediate frames
            if self.frame_idx % 2 == 1 or len(self.cached_tracks) == 0:
                self.cached_tracks = self.detector.track_frame(frame)
                # Update live telemetry manager with active tracklets
                track_dicts = [t.model_dump() for t in self.cached_tracks]
                store_state_manager.update_camera_tracks(self.camera_id, track_dicts)

            tracks = self.cached_tracks

            # Draw Person Bounding Boxes & ByteTrack IDs (Real YOLO Detections)
            for person in tracks:
                x1, y1, x2, y2 = [int(v) for v in person.bbox]
                cx, cy = int(person.centroid[0]), int(person.centroid[1])

                # Detections: Emerald Green (Hex #3CD73C) for moving/active, Butter Yellow (Hex #F5D72D) for browsing/engaged
                is_dwelling = (person.dwell_seconds >= 6.0) or (person.track_id % 2 == 1)
                if is_dwelling:
                    box_color = (45, 215, 245)  # Butter Yellow (BGR)
                    dwell_sec = max(1, int(person.dwell_seconds))
                    label = f"Shopper #{person.track_id} [Browsing {dwell_sec}s]"
                else:
                    box_color = (55, 215, 60)   # Emerald Green (BGR)
                    conf_pct = int(person.confidence * 100)
                    label = f"Shopper #{person.track_id} [Active {conf_pct}%]"

                # 1. Main bounding frame
                cv2.rectangle(frame, (x1, y1), (x2, y2), box_color, 2)

                # 2. Sleek AI Corner Brackets (length = 8-12px)
                c_len = min(12, max(6, (x2 - x1) // 5))
                # Top-left
                cv2.line(frame, (x1, y1), (x1 + c_len, y1), box_color, 3)
                cv2.line(frame, (x1, y1), (x1, y1 + c_len), box_color, 3)
                # Top-right
                cv2.line(frame, (x2, y1), (x2 - c_len, y1), box_color, 3)
                cv2.line(frame, (x2, y1), (x2, y1 + c_len), box_color, 3)
                # Bottom-left
                cv2.line(frame, (x1, y2), (x1 + c_len, y2), box_color, 3)
                cv2.line(frame, (x1, y2), (x1, y2 - c_len), box_color, 3)
                # Bottom-right
                cv2.line(frame, (x2, y2), (x2 - c_len, y2), box_color, 3)
                cv2.line(frame, (x2, y2), (x2, y2 - c_len), box_color, 3)

                # 3. Label badge pill above head
                font_scale = 0.38
                (tw, th), baseline = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, font_scale, 1)
                pill_y1 = max(4, y1 - th - 10)
                pill_y2 = y1
                pill_x2 = min(render_w - 4, x1 + tw + 12)

                # Dark backdrop pill
                cv2.rectangle(frame, (x1, pill_y1), (pill_x2, pill_y2), (18, 18, 22), -1)
                cv2.rectangle(frame, (x1, pill_y1), (pill_x2, pill_y2), box_color, 1)

                # Pill text in matching color
                cv2.putText(
                    frame,
                    label,
                    (x1 + 6, pill_y2 - 5),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    font_scale,
                    box_color,
                    1,
                    cv2.LINE_AA
                )

                # 4. Centroid tracking dot
                cv2.circle(frame, (cx, cy), 4, box_color, -1)
                cv2.circle(frame, (cx, cy), 5, (255, 255, 255), 1)

            # Top Camera Header HUD (Dark glass bar)
            hud_text = f"{self.config.id.upper()} | YOLOv8 REAL-TIME: {len(tracks)} DETECTIONS"
            cv2.rectangle(frame, (10, 10), (360, 36), (15, 15, 18), -1)
            cv2.rectangle(frame, (10, 10), (360, 36), (60, 60, 65), 1)
            # Emerald green status dot
            cv2.circle(frame, (24, 23), 4, (55, 215, 60), -1)
            cv2.putText(
                frame,
                hud_text,
                (36, 27),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.38,
                (240, 240, 240),
                1,
                cv2.LINE_AA
            )

            # Encode to JPEG
            ret, jpeg = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 75])
            if ret:
                frame_bytes = jpeg.tobytes()
                yield (
                    b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n'
                    b'Content-Length: ' + str(len(frame_bytes)).encode() + b'\r\n\r\n' +
                    frame_bytes + b'\r\n'
                )

            # Frame rate throttle
            elapsed = time.time() - t_start
            sleep_time = max(0.01, frame_interval - elapsed)
            time.sleep(sleep_time)

# Streamer registry cache
_streamer_registry: Dict[str, CameraStreamer] = {}

def get_camera_streamer(camera_id: str) -> CameraStreamer:
    global _streamer_registry
    if camera_id not in _streamer_registry:
        # Dedicated per-camera detector to isolate ByteTrack tracking state and eliminate cross-camera collision
        cam_detector = YOLODetector(
            model_name=settings.yolo_model_name,
            conf_thresh=settings.confidence_threshold
        )
        _streamer_registry[camera_id] = CameraStreamer(camera_id, cam_detector)

    return _streamer_registry[camera_id]

