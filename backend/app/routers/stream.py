from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import List, Dict
from app.config import DEFAULT_CAMERAS, CameraConfig
from app.perception.video_streamer import get_camera_streamer

router = APIRouter(prefix="/api", tags=["Video Streams"])

@router.get("/cameras", response_model=List[CameraConfig])
def list_cameras():
    """Returns list of active configured camera vision nodes."""
    return list(DEFAULT_CAMERAS.values())

@router.get("/stream/{camera_id}")
def stream_camera_feed(camera_id: str):
    """Streams live MJPEG video with real-time YOLO + ByteTrack detections."""
    if camera_id not in DEFAULT_CAMERAS:
        # Fallback to cam-1 if unknown
        camera_id = "cam-1"

    streamer = get_camera_streamer(camera_id)
    return StreamingResponse(
        streamer.generate_annotated_stream(),
        media_type="multipart/x-mixed-replace; boundary=frame",
        headers={
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
        }
    )
