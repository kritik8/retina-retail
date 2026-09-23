import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import stream, telemetry
from app.perception.video_streamer import get_stream_diagnostics

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

app = FastAPI(
    title="RetinaRetail - Edge Vision & Predictive Intelligence API",
    description="Standalone Python perception and queue intelligence service powered by YOLOv8 and ByteTrack.",
    version="1.0.0"
)

# Enable CORS for local dev and cloud frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(stream.router)
app.include_router(telemetry.router)

@app.get("/api/health", tags=["Health"])
def health_check():
    cameras = get_stream_diagnostics()
    detector_states = [item["detector"]["detector_state"] for item in cameras.values()]
    active_states = [state for state in detector_states if state != "not_initialized"]
    if not active_states:
        vision_state = "not_initialized"
    elif any(state == "ready" for state in active_states):
        vision_state = "ready"
    elif any(state == "inference_failed" for state in active_states):
        vision_state = "inference_failed"
    else:
        vision_state = "model_load_failed"
    vision_available = vision_state == "ready" and any(
        item["camera_state"] == "connected" for item in cameras.values()
    )
    return {
        "status": "online",
        "service": "RetinaRetail-Vision-Engine",
        "version": "1.0.0",
        "yolo_enabled": vision_state == "ready",
        "vision_state": vision_state,
        "vision_available": vision_available,
        "cameras": cameras,
    }

@app.get("/", tags=["Health"])
def root():
    return {
        "message": "RetinaRetail Backend API is running.",
        "docs": "/docs",
        "health": "/api/health"
    }
