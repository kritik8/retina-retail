import numpy as np
import time
import logging
import threading
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

logger = logging.getLogger("retina.yolo")

class TrackedPerson(BaseModel):
    track_id: int
    bbox: List[float]  # [x1, y1, x2, y2]
    confidence: float
    centroid: List[float]  # [cx, cy]
    zone_id: Optional[str] = None
    dwell_seconds: float = 0.0

class YOLODetector:
    """YOLO + ByteTrack wrapper that never substitutes synthetic people on failure."""

    def __init__(
        self,
        model_name: str = "yolov8n.pt",
        conf_thresh: float = 0.35,
        iou_threshold: float = 0.45,
        imgsz: int = 384,
        tracker: str = "bytetrack.yaml",
        track_history_len: int = 30,
        enable_gpu: bool = False,
    ):
        self.model_name = model_name
        self.conf_thresh = conf_thresh
        self.iou_threshold = iou_threshold
        self.imgsz = imgsz
        self.tracker = tracker
        self.track_history_len = track_history_len
        self.enable_gpu = enable_gpu
        self.model = None
        self.track_first_seen: Dict[int, float] = {}
        self.track_centroids_history: Dict[int, List[List[float]]] = {}
        self.lock = threading.Lock()
        self.model_state = "initializing"
        self.last_error: Optional[str] = None
        self.last_inference_at: Optional[float] = None
        self.last_inference_latency_ms: Optional[float] = None
        self.last_inference_fps: Optional[float] = None
        self.last_raw_detection_count = 0
        self.last_track_ids: List[int] = []
        self.last_detection_confidences: List[float] = []
        self._last_summary_log_at = 0.0
        self._last_logged_error: Optional[str] = None

        self._load_model()

    def _load_model(self):
        try:
            from ultralytics import YOLO
            logger.info(
                "Loading YOLO model=%s conf=%.2f iou=%.2f imgsz=%s tracker=%s "
                "history=%s device=%s",
                self.model_name,
                self.conf_thresh,
                self.iou_threshold,
                self.imgsz,
                self.tracker,
                self.track_history_len,
                "gpu:0" if self.enable_gpu else "auto",
            )
            self.model = YOLO(self.model_name)
            self.model_state = "ready"
            self.last_error = None
            logger.info("YOLO model initialized with ByteTrack support.")
        except Exception as e:
            self.model = None
            self.model_state = "model_load_failed"
            self.last_error = str(e)
            logger.exception("Could not load YOLO model; detections are disabled.")

    def get_diagnostics(self) -> Dict[str, Any]:
        """Returns a snapshot suitable for health and troubleshooting endpoints."""
        with self.lock:
            return {
                "detector_state": self.model_state,
                "model_name": self.model_name,
                "confidence_threshold": self.conf_thresh,
                "iou_threshold": self.iou_threshold,
                "imgsz": self.imgsz,
                "tracker": self.tracker,
                "track_history_len": self.track_history_len,
                "device": "gpu:0" if self.enable_gpu else "auto",
                "last_error": self.last_error,
                "last_inference_at": self.last_inference_at,
                "last_inference_latency_ms": self.last_inference_latency_ms,
                "approximate_inference_fps": self.last_inference_fps,
                "raw_person_detection_count": self.last_raw_detection_count,
                "track_ids": self.last_track_ids.copy(),
                "detection_confidences": self.last_detection_confidences.copy(),
            }

    def _record_inference_failure(self, error: Exception) -> None:
        message = str(error)
        self.model_state = "inference_failed"
        self.last_error = message
        self.last_raw_detection_count = 0
        self.last_track_ids = []
        self.last_detection_confidences = []
        if message != self._last_logged_error:
            logger.exception("YOLO inference failed; returning zero detections.")
            self._last_logged_error = message

    def track_frame(self, frame: np.ndarray) -> List[TrackedPerson]:
        """Runs YOLO + ByteTrack tracking on a single BGR frame."""
        now = time.time()
        tracked_persons: List[TrackedPerson] = []

        if self.model is None or self.model_state == "model_load_failed":
            return tracked_persons

        try:
            with self.lock:
                started = time.perf_counter()
                track_kwargs: Dict[str, Any] = {
                    "source": frame,
                    "persist": True,
                    "classes": [0],  # COCO class 0 = person
                    "conf": self.conf_thresh,
                    "iou": self.iou_threshold,
                    "imgsz": self.imgsz,
                    "verbose": False,
                    "tracker": self.tracker,
                }
                # Omitting device preserves Ultralytics' current automatic device selection.
                if self.enable_gpu:
                    track_kwargs["device"] = 0
                results = self.model.track(**track_kwargs)
                elapsed = time.perf_counter() - started
                self.last_inference_at = time.time()
                self.last_inference_latency_ms = round(elapsed * 1000.0, 2)
                self.last_inference_fps = round(1.0 / elapsed, 2) if elapsed > 0 else None
                self.model_state = "ready"
                self.last_error = None
                self._last_logged_error = None

                if results and len(results) > 0:
                    boxes = results[0].boxes
                    if boxes is not None and len(boxes) > 0:
                        coords = boxes.xyxy.cpu().numpy()
                        track_ids = (
                            boxes.id.cpu().numpy().astype(int)
                            if boxes.id is not None
                            else list(range(1, len(coords) + 1))
                        )
                        confs = boxes.conf.cpu().numpy()
                        self.last_raw_detection_count = len(coords)
                        self.last_track_ids = [int(track_id) for track_id in track_ids]
                        self.last_detection_confidences = [round(float(conf), 4) for conf in confs]

                        for i, track_id in enumerate(track_ids):
                            x1, y1, x2, y2 = coords[i]
                            cx = float((x1 + x2) / 2.0)
                            cy = float((y1 + y2) / 2.0)
                            conf = float(confs[i])

                            if track_id not in self.track_first_seen:
                                self.track_first_seen[track_id] = now
                                self.track_centroids_history[track_id] = []

                            dwell = now - self.track_first_seen[track_id]
                            self.track_centroids_history[track_id].append([cx, cy])
                            if len(self.track_centroids_history[track_id]) > self.track_history_len:
                                self.track_centroids_history[track_id].pop(0)

                            tracked_persons.append(TrackedPerson(
                                track_id=int(track_id),
                                bbox=[float(x1), float(y1), float(x2), float(y2)],
                                confidence=round(conf, 2),
                                centroid=[cx, cy],
                                dwell_seconds=round(dwell, 1)
                            ))
                    else:
                        self.last_raw_detection_count = 0
                        self.last_track_ids = []
                        self.last_detection_confidences = []
                else:
                    self.last_raw_detection_count = 0
                    self.last_track_ids = []
                    self.last_detection_confidences = []

                if now - self._last_summary_log_at >= 30.0:
                    logger.info(
                        "YOLO summary model=%s raw_people=%s latency_ms=%s fps=%s",
                        self.model_name,
                        self.last_raw_detection_count,
                        self.last_inference_latency_ms,
                        self.last_inference_fps,
                    )
                    self._last_summary_log_at = now
                return tracked_persons
        except Exception as e:
            with self.lock:
                self._record_inference_failure(e)
            return []

import math
