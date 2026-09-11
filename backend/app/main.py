import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import stream, telemetry

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
    return {
        "status": "online",
        "service": "RetinaRetail-Vision-Engine",
        "version": "1.0.0",
        "yolo_enabled": True
    }

@app.get("/", tags=["Health"])
def root():
    return {
        "message": "RetinaRetail Backend API is running.",
        "docs": "/docs",
        "health": "/api/health"
    }
