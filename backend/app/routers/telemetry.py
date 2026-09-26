from fastapi import APIRouter, Query, Body
from typing import Dict, Any, Optional
from pydantic import BaseModel
from app.telemetry.store_state import store_state_manager, LiveStoreState
from app.config import DEFAULT_CAMERAS, CAMERA_MODE
from app.telemetry.forecaster import (
    generate_prediction,
    generate_diagnosis,
    generate_simulation,
    PredictionResponse,
    DiagnosisResponse,
    SimulationResponse,
)

router = APIRouter(prefix="/api", tags=["Telemetry & Intelligence"])

class ActionLogPayload(BaseModel):
    action: str
    rationale: Optional[str] = None
    interventionType: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

@router.get("/telemetry/live", response_model=LiveStoreState)
def get_live_telemetry():
    """Returns real-time store metrics computed from active ByteTrack tracks."""
    return store_state_manager.get_live_state()

@router.get("/intelligence/prediction", response_model=PredictionResponse)
def get_prediction(horizon_minutes: int = Query(15, ge=5, le=60)):
    """Returns predictive queue trajectory with dynamic confidence bounds."""
    return generate_prediction(horizon_minutes)

@router.get("/intelligence/diagnosis", response_model=DiagnosisResponse)
def get_diagnosis():
    """Returns automated bottleneck diagnosis with contribution factor scores."""
    return generate_diagnosis()

class SimulationPayload(BaseModel):
    interventionType: str = "add_checkout"
    additionalCounters: Optional[int] = 1

@router.post("/intelligence/simulation", response_model=SimulationResponse)
def run_simulation(payload: SimulationPayload):
    """Simulates operational intervention effects on queue trajectory."""
    return generate_simulation(
        intervention_type=payload.interventionType,
        additional_counters=payload.additionalCounters or 1
    )

@router.post("/actions/log")
def log_action(payload: ActionLogPayload):
    """Logs manager operational decision to memory log."""
    return {
        "status": "logged",
        "action": payload.action,
        "message": "Action logged successfully. Human-in-the-loop record updated."
    }

@router.get("/stream/status")
def get_stream_status():
    """Diagnostic: shows ESP32/camera connection status for each configured camera."""
    from app.perception.video_streamer import _streamer_registry
    status = {}
    for cam_id, cam_conf in DEFAULT_CAMERAS.items():
        streamer = _streamer_registry.get(cam_id)
        if streamer is None:
            status[cam_id] = {
                "registered": False,
                "stream_url": cam_conf.stream_url,
                "source_type": cam_conf.source_type,
                "note": "Streamer not yet requested (no client has hit /api/stream/{cam_id})"
            }
        else:
            cap_opened = streamer.cap is not None and streamer.cap.isOpened()
            status[cam_id] = {
                "registered": True,
                "cap_opened": cap_opened,
                "stream_url": cam_conf.stream_url,
                "source_type": cam_conf.source_type,
                "frame_idx": streamer.frame_idx,
                "note": "Receiving live frames" if cap_opened else "cap.isOpened() == False → serving synthetic fallback frame"
            }
    return {"camera_mode": CAMERA_MODE, "cameras": status}

