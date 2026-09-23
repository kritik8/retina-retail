import cv2
import time
import logging
import numpy as np
from typing import Generator, Dict, Optional, List
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit
from app.config import DEFAULT_CAMERAS, CameraConfig, find_video_path, settings
from app.perception.yolo_detector import YOLODetector, TrackedPerson
from app.perception.zone_geometry import (
    CAMERA_INTERIOR_ROIS,
    DEFAULT_STORE_ZONES,
    is_point_in_polygon,
)
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
        self.camera_state = "initializing"
        self.last_camera_error: Optional[str] = None
        self.last_successful_frame_at: Optional[float] = None
        self.last_native_frame_size: Optional[Dict[str, int]] = None
        self.last_inference_frame_size: Optional[Dict[str, int]] = None
        self._last_frame_is_live = False
        self._last_summary_log_at = 0.0
        self._init_capture()

    def _source_identifier(self) -> str:
        if self.config.stream_url:
            parsed = urlsplit(self.config.stream_url)
            hostname = parsed.hostname or "unknown-host"
            netloc = f"{hostname}:{parsed.port}" if parsed.port else hostname
            return urlunsplit((parsed.scheme, netloc, parsed.path, "", ""))
        if self.video_path:
            return f"file:{self.video_path.name}"
        return "unconfigured"

    def get_diagnostics(self) -> Dict:
        return {
            "camera_id": self.camera_id,
            "source_identifier": self._source_identifier(),
            "source_type": self.config.source_type,
            "camera_state": self.camera_state,
            "last_camera_error": self.last_camera_error,
            "last_successful_frame_at": self.last_successful_frame_at,
            "native_frame_size": self.last_native_frame_size,
            "inference_frame_size": self.last_inference_frame_size,
            "detector": self.detector.get_diagnostics(),
        }

    def _init_capture(self):
        if self.config.stream_url:
            logger.info("Opening live network/ESP32 stream for %s from %s", self.camera_id, self._source_identifier())
            self.cap = cv2.VideoCapture(self.config.stream_url)
        elif self.video_path and self.video_path.exists():
            logger.info("Opening CCTV stream for %s from %s", self.camera_id, self._source_identifier())
            self.cap = cv2.VideoCapture(str(self.video_path))
        else:
            logger.error("No video file or stream URL found for %s; vision is unavailable.", self.camera_id)
            self.cap = None
            self.camera_state = "unavailable"
            self.last_camera_error = "No configured video file or stream URL is available"
            return

        if self.cap.isOpened():
            self.camera_state = "connected"
            self.last_camera_error = None
        else:
            self.camera_state = "unavailable"
            self.last_camera_error = "OpenCV could not open the configured video source"
            logger.error("Could not open camera source for %s.", self.camera_id)

    def _build_unavailable_frame(self) -> np.ndarray:
        """Render a non-analytic placeholder when a camera frame is unavailable."""
        frame = np.zeros((480, 854, 3), dtype=np.uint8)
        frame[:] = (25, 25, 26)
        cv2.putText(
            frame,
            f"VISION UNAVAILABLE - {self.config.name.upper()}",
            (30, 50),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (75, 168, 212),
            1,
        )
        return frame

    def _filter_tracks_to_interior(
        self,
        tracks: List[TrackedPerson],
        frame_width: int,
        frame_height: int,
    ) -> List[TrackedPerson]:
        """Keep detections whose foot point is inside the configured camera ROI."""
        roi = CAMERA_INTERIOR_ROIS.get(self.camera_id)
        if roi is None:
            return tracks

        interior_tracks: List[TrackedPerson] = []
        for track in tracks:
            x1, _, x2, y2 = track.bbox
            foot_x = ((x1 + x2) / 2.0) / frame_width
            foot_y = y2 / frame_height
            if is_point_in_polygon(foot_x, foot_y, roi):
                interior_tracks.append(track)
        return interior_tracks

    def get_frame(self) -> np.ndarray:
        """Reads next frame with auto-looping for files and auto-reconnect for live streams."""
        self._last_frame_is_live = False
        if self.cap is not None and self.cap.isOpened():
            ret, frame = self.cap.read()
            if not ret:
                if self.config.stream_url:
                    self.camera_state = "reconnecting"
                    self.last_camera_error = "Frame read failed; reconnecting to live stream"
                    logger.warning("Frame read failed for %s; reconnecting.", self.camera_id)
                    self.cap.release()
                    time.sleep(0.5)
                    self.cap = cv2.VideoCapture(self.config.stream_url)
                    ret, frame = self.cap.read()
                else:
                    # Loop back to beginning of CCTV clip
                    self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    ret, frame = self.cap.read()
            if ret and frame is not None and frame.size > 0:
                h, w = frame.shape[:2]
                self._last_frame_is_live = True
                self.camera_state = "connected"
                self.last_camera_error = None
                self.last_successful_frame_at = time.time()
                self.last_native_frame_size = {"width": w, "height": h}
                return frame

        self.camera_state = "unavailable"
        if self.last_camera_error is None:
            self.last_camera_error = "No valid frame is available from the configured source"
            logger.error("No valid frame is available for %s.", self.camera_id)
        return self._build_unavailable_frame()

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
            self.last_inference_frame_size = {"width": render_w, "height": render_h}

            # Run YOLO + ByteTrack every 2nd frame for low latency, reusing cache on intermediate frames
            if not self._last_frame_is_live:
                self.cached_tracks = []
                store_state_manager.update_camera_tracks(self.camera_id, [])
            elif self.frame_idx % 2 == 1 or len(self.cached_tracks) == 0:
                detected_tracks = self.detector.track_frame(frame)
                self.cached_tracks = self._filter_tracks_to_interior(
                    detected_tracks,
                    frame_width=frame.shape[1],
                    frame_height=frame.shape[0],
                )
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
            detector_state = self.detector.get_diagnostics()["detector_state"].upper()
            hud_text = f"{self.config.id.upper()} | {detector_state}: {len(tracks)} DETECTIONS"
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

            now = time.time()
            if now - self._last_summary_log_at >= 30.0:
                diagnostics = self.get_diagnostics()
                logger.info(
                    "Camera summary id=%s state=%s native=%s inference=%s detector=%s raw_people=%s",
                    self.camera_id,
                    diagnostics["camera_state"],
                    diagnostics["native_frame_size"],
                    diagnostics["inference_frame_size"],
                    diagnostics["detector"]["detector_state"],
                    diagnostics["detector"]["raw_person_detection_count"],
                )
                self._last_summary_log_at = now

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
            conf_thresh=settings.confidence_threshold,
            iou_threshold=settings.iou_threshold,
            imgsz=settings.yolo_imgsz,
            tracker=settings.yolo_tracker,
            track_history_len=settings.track_history_len,
            enable_gpu=settings.enable_gpu,
        )
        _streamer_registry[camera_id] = CameraStreamer(camera_id, cam_detector)

    return _streamer_registry[camera_id]


def get_stream_diagnostics() -> Dict[str, Dict]:
    """Reports active stream diagnostics without creating cameras or loading models."""
    diagnostics: Dict[str, Dict] = {}
    for camera_id, config in DEFAULT_CAMERAS.items():
        streamer = _streamer_registry.get(camera_id)
        if streamer is not None:
            diagnostics[camera_id] = streamer.get_diagnostics()
        else:
            source = config.stream_url or f"file:{config.video_filename}"
            parsed = urlsplit(source)
            if parsed.scheme and parsed.hostname:
                netloc = f"{parsed.hostname}:{parsed.port}" if parsed.port else parsed.hostname
                source = urlunsplit((parsed.scheme, netloc, parsed.path, "", ""))
            diagnostics[camera_id] = {
                "camera_id": camera_id,
                "source_identifier": source.split("?", 1)[0],
                "source_type": config.source_type,
                "camera_state": "not_initialized",
                "detector": {"detector_state": "not_initialized"},
            }
    return diagnostics
