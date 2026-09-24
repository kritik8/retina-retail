import math
from typing import List, Tuple, Dict, Optional
from pydantic import BaseModel

class Point(BaseModel):
    x: float
    y: float

class ZonePolygon(BaseModel):
    id: str
    name: str
    zone_type: str  # entrance, aisle, checkout, storage
    polygon: List[Tuple[float, float]]  # Normalized points [(x1,y1), (x2,y2), ...]
    color_bgr: Tuple[int, int, int] = (75, 168, 212)

def is_point_in_polygon(x: float, y: float, polygon: List[Tuple[float, float]]) -> bool:
    """Ray casting algorithm for point in 2D polygon check."""
    n = len(polygon)
    inside = False
    p1x, p1y = polygon[0]
    for i in range(n + 1):
        p2x, p2y = polygon[i % n]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y
    return inside

# Normalized interior ROIs keyed by camera ID. Coordinates are measured against
# the resized inference/render frame, where (0, 0) is top-left and (1, 1) is
# bottom-right.
#
# NEEDS CALIBRATION — visually verify these placeholders against representative
# frames before relying on them in production.
CAMERA_INTERIOR_ROIS: Dict[str, List[Tuple[float, float]]] = {
    # Cam 1 has no exterior view; keep the entire visible frame.
    "cam-1": [
        (0.001, 0.001),
        (0.999, 0.001),
        (0.999, 0.999),
        (0.001, 0.999),
    ],
    "cam-2": [
        (0.00, 0.00),
        (1.00, 0.00),
        (1.00, 1.00),
        (0.00, 1.00),
    ],
    # Calibrated diagonal boundary: keep the interior left of the threshold.
    "cam-3": [
        (0.00, 0.00),
        (0.65, 0.00),
        (0.40, 1.00),
        (0.00, 1.00),
    ],
    # Cam 4 is staff/storage only; a degenerate ROI excludes all foot points.
    "cam-4": [
        (0.00, 0.00),
    ],
    "cam-5": [
        (0.00, 0.00),
        (0.40, 0.00),
        (0.40, 1.00),
        (0.00, 1.00),
    ],
}

# Pre-defined zone geometries for store layout
DEFAULT_STORE_ZONES: Dict[str, ZonePolygon] = {
    "z-entrance": ZonePolygon(
        id="z-entrance",
        name="Entrance & Pedestrian Gate",
        zone_type="entrance",
        polygon=[(0.05, 0.40), (0.45, 0.40), (0.45, 0.95), (0.05, 0.95)],
        color_bgr=(88, 122, 78)  # Sage green
    ),
    "z-aisle-1": ZonePolygon(
        id="z-aisle-1",
        name="Aisle 1 - Staples & Grains",
        zone_type="aisle",
        polygon=[(0.50, 0.20), (0.95, 0.20), (0.95, 0.85), (0.50, 0.85)],
        color_bgr=(75, 168, 212)  # Butter yellow
    ),
    "z-aisle-2": ZonePolygon(
        id="z-aisle-2",
        name="Aisle 2 - Snacks & FMCG",
        zone_type="aisle",
        polygon=[(0.10, 0.10), (0.90, 0.10), (0.90, 0.70), (0.10, 0.70)],
        color_bgr=(75, 168, 212)
    ),
    "z-checkout": ZonePolygon(
        id="z-checkout",
        name="Main POS Checkout Area",
        zone_type="checkout",
        polygon=[(0.00, 0.00), (0.40, 0.00), (0.40, 1.00), (0.00, 1.00)],
        color_bgr=(72, 72, 158)  # Rose/Red for queue zone
    ),
}

class TripwireGate:
    """Tripwire line tracking for directional flow counting."""
    def __init__(self, y_threshold: float = 0.55):
        self.y_threshold = y_threshold
        self.inflow_count = 0
        self.outflow_count = 0
        self.track_positions: Dict[int, List[float]] = {}  # track_id -> [prev_y, curr_y]

    def update(self, track_id: int, normalized_y: float):
        if track_id not in self.track_positions:
            self.track_positions[track_id] = [normalized_y, normalized_y]
            return

        prev_y = self.track_positions[track_id][1]
        self.track_positions[track_id] = [prev_y, normalized_y]

        # Crossed downwards (Inflow to store)
        if prev_y < self.y_threshold and normalized_y >= self.y_threshold:
            self.inflow_count += 1
        # Crossed upwards (Outflow / Egress)
        elif prev_y > self.y_threshold and normalized_y <= self.y_threshold:
            self.outflow_count += 1
