import cv2
import numpy as np
import time
import math
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
    def __init__(self, model_name: str = "yolov8n.pt", conf_thresh: float = 0.35):
        self.model_name = model_name
        self.conf_thresh = conf_thresh
        self.model = None
        self.track_first_seen: Dict[int, float] = {}
        self.track_centroids_history: Dict[int, List[List[float]]] = {}
        self.use_fallback = False
        self.lock = threading.Lock()

        self._load_model()

    def _load_model(self):
        try:
            from ultralytics import YOLO
            logger.info(f"Loading YOLO model: {self.model_name}")
            self.model = YOLO(self.model_name)
            logger.info("YOLO model initialized with ByteTrack support.")
        except Exception as e:
            logger.warning(f"Could not load YOLO model: {e}. Falling back to lightweight tracker.")
            self.use_fallback = True

    def track_frame(self, frame: np.ndarray) -> List[TrackedPerson]:
        """Runs YOLO + ByteTrack tracking on a single BGR frame."""
        now = time.time()
        tracked_persons: List[TrackedPerson] = []

        if not self.use_fallback and self.model is not None:
            try:
                with self.lock:
                    # Class 0 = person in COCO dataset
                    results = self.model.track(
                        source=frame,
                        persist=True,
                        classes=[0],
                        conf=self.conf_thresh,
                        imgsz=384,
                        verbose=False,
                        tracker="bytetrack.yaml"
                    )

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
                                if len(self.track_centroids_history[track_id]) > 30:
                                    self.track_centroids_history[track_id].pop(0)

                                tracked_persons.append(TrackedPerson(
                                    track_id=int(track_id),
                                    bbox=[float(x1), float(y1), float(x2), float(y2)],
                                    confidence=round(conf, 2),
                                    centroid=[cx, cy],
                                    dwell_seconds=round(dwell, 1)
                                ))
                            return tracked_persons
            except Exception as e:
                logger.debug(f"YOLO inference step warning: {e}")

        # No real detections available — return empty (no fake synthetic tracks)
        return self._fallback_detect(frame, now)

    def _fallback_detect(self, frame: np.ndarray, now: float) -> List[TrackedPerson]:
        """
        Returns an empty list.
        The old sin-wave mathematical fake bounding boxes have been removed.
        When YOLO is unavailable or the stream has no frame, we show nothing
        rather than misleading synthetic detections.
        """
        return []

import math

