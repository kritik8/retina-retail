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
            self.cap = cv2.VideoCapture(self.config.stream_url)
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

            # Draw Zone Boundary Overlay
            assigned_zone = DEFAULT_STORE_ZONES.get(self.config.zone_id)
            if assigned_zone:
                poly_pts = np.array([
                    [int(p[0] * render_w), int(p[1] * render_h)]
                    for p in assigned_zone.polygon
                ], np.int32)
                cv2.polylines(frame, [poly_pts], isClosed=True, color=assigned_zone.color_bgr, thickness=2)

                # Zone label tag
                tag_x, tag_y = poly_pts[0]
                cv2.putText(
                    frame,
                    f"ZONE: {assigned_zone.name}",
                    (max(10, tag_x), max(20, tag_y - 6)),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.4,
                    assigned_zone.color_bgr,
                    1
                )

            # Draw Person Bounding Boxes & ByteTrack IDs
            for person in tracks:
                x1, y1, x2, y2 = [int(v) for v in person.bbox]
                cx, cy = int(person.centroid[0]), int(person.centroid[1])

                # Color: Butter yellow / Sage green / Warning red for high dwell
                box_color = (75, 168, 212) if person.dwell_seconds < 25 else (72, 72, 158)

                # Bounding box
                cv2.rectangle(frame, (x1, y1), (x2, y2), box_color, 2)

                # Label tag
                label = f"Shopper #{person.track_id} ({int(person.confidence * 100)}%)"
                cv2.rectangle(frame, (x1, max(0, y1 - 18)), (x1 + len(label) * 7 + 6, y1), box_color, -1)
                cv2.putText(
                    frame,
                    label,
                    (x1 + 3, max(12, y1 - 4)),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.35,
                    (20, 20, 20),
                    1
                )

                # Centroid dot
                cv2.circle(frame, (cx, cy), 3, (255, 255, 255), -1)

            # Top Camera Header HUD
            cv2.rectangle(frame, (10, 10), (310, 36), (20, 20, 20), -1)
            cv2.rectangle(frame, (10, 10), (310, 36), (60, 60, 60), 1)
            cv2.putText(
                frame,
                f"{self.config.id.upper()} · LIVE DETECTIONS: {len(tracks)}",
                (18, 28),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.42,
                (78, 154, 74),
                1
            )

            # Encode to JPEG
            ret, jpeg = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
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
_global_detector: Optional[YOLODetector] = None

def get_camera_streamer(camera_id: str) -> CameraStreamer:
    global _global_detector, _streamer_registry
    if _global_detector is None:
        _global_detector = YOLODetector(model_name=settings.yolo_model_name)

    if camera_id not in _streamer_registry:
        _streamer_registry[camera_id] = CameraStreamer(camera_id, _global_detector)

    return _streamer_registry[camera_id]
