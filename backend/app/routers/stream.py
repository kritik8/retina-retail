from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse, FileResponse
from typing import List, Dict
from app.config import DEFAULT_CAMERAS, CameraConfig, find_video_path
from app.perception.video_streamer import get_camera_streamer

router = APIRouter(prefix="/api", tags=["Video Streams"])

@router.get("/cameras", response_model=List[CameraConfig])
def list_cameras():
    """Returns list of active configured camera vision nodes."""
    return list(DEFAULT_CAMERAS.values())

@router.get("/video/{camera_id}")
def get_raw_video(camera_id: str):
    """Streams raw MP4 CCTV video for direct HTML5 video playback."""
    if camera_id not in DEFAULT_CAMERAS:
        camera_id = "cam-1"
    config = DEFAULT_CAMERAS[camera_id]
    video_path = find_video_path(config.video_filename)
    if video_path and video_path.exists():
        return FileResponse(str(video_path), media_type="video/mp4")
    raise HTTPException(status_code=404, detail=f"Video file for {camera_id} not found")

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
