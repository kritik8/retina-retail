import os
from pathlib import Path
from pydantic import BaseModel
from typing import Dict, List, Optional

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
except ImportError:
    pass

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent

# Video footage search paths
CCTV_DIRS = [
    PROJECT_ROOT / "CCTV Footage",
    PROJECT_ROOT / "cctv-footage",
    BASE_DIR / "footage",
]

class CameraConfig(BaseModel):
    id: str
    name: str
    video_filename: str
    zone_id: str
    zone_type: str  # entrance, aisle, checkout, storage, general
    fps: int = 25
    resolution: str = "1080p"
    tripwire_y: float = 0.55  # normalized horizontal gate for inflow/outflow crossing
    source_type: str = "file"  # "file" | "esp32" | "rtsp"
    stream_url: Optional[str] = None  # e.g. "http://192.168.1.100:81/stream" or "rtsp://..."

# Default ESP32 IP from environment (e.g. ESP32_CAM_IP="192.168.1.50" or ESP32_STREAM_URL)
ESP32_CAM_IP = os.getenv("ESP32_CAM_IP", "")
ESP32_DEFAULT_URL = f"http://{ESP32_CAM_IP}:81/stream" if ESP32_CAM_IP else os.getenv("ESP32_STREAM_URL", "")

# Default 5-camera CCTV mapping matching physical Kirana layout
DEFAULT_CAMERAS: Dict[str, CameraConfig] = {
    "cam-1": CameraConfig(
        id="cam-1",
        name="Entrance & Pedestrian Gate (Cam 1)",
        video_filename="CAM 1.mp4",
        zone_id="z-entrance",
        zone_type="entrance",
        tripwire_y=0.60,
        source_type="esp32" if (ESP32_DEFAULT_URL or os.getenv("CAM_1_STREAM_URL")) else "file",
        stream_url=os.getenv("CAM_1_STREAM_URL", ESP32_DEFAULT_URL or None)
    ),
    "cam-2": CameraConfig(
        id="cam-2",
        name="Aisle 1 - Grains & Staples (Cam 2)",
        video_filename="CAM 2.mp4",
        zone_id="z-aisle-1",
        zone_type="aisle",
        tripwire_y=0.50,
        source_type="esp32" if os.getenv("CAM_2_STREAM_URL") else "file",
        stream_url=os.getenv("CAM_2_STREAM_URL")
    ),
    "cam-3": CameraConfig(
        id="cam-3",
        name="Aisle 2 - Snacks & FMCG (Cam 3)",
        video_filename="CAM 3.mp4",
        zone_id="z-aisle-2",
        zone_type="aisle",
        tripwire_y=0.50,
        source_type="esp32" if os.getenv("CAM_3_STREAM_URL") else "file",
        stream_url=os.getenv("CAM_3_STREAM_URL")
    ),
    "cam-4": CameraConfig(
        id="cam-4",
        name="Promo & Perimeter Zone (Cam 4)",
        video_filename="CAM 4.mp4",
        zone_id="z-promo",
        zone_type="general",
        tripwire_y=0.50,
        source_type="esp32" if os.getenv("CAM_4_STREAM_URL") else "file",
        stream_url=os.getenv("CAM_4_STREAM_URL")
    ),
    "cam-5": CameraConfig(
        id="cam-5",
        name="Main POS Checkout Queue (Cam 5)",
        video_filename="CAM 5.mp4",
        zone_id="z-checkout",
        zone_type="checkout",
        tripwire_y=0.45,
        source_type="esp32" if os.getenv("CAM_5_STREAM_URL") else "file",
        stream_url=os.getenv("CAM_5_STREAM_URL")
    ),
}

class AppSettings(BaseModel):
    host: str = "0.0.0.0"
    port: int = 8000
    yolo_model_name: str = "yolov8n.pt"
    confidence_threshold: float = 0.35
    iou_threshold: float = 0.45
    track_history_len: int = 30
    stream_fps: int = 15
    enable_gpu: bool = False  # Auto-fallback to CPU

def find_video_path(filename: str) -> Optional[Path]:
    """Finds the absolute path to a CCTV video file across known directories."""
    for cctv_dir in CCTV_DIRS:
        candidate = cctv_dir / filename
        if candidate.exists():
            return candidate
    return None

settings = AppSettings()
