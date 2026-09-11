import time
import math
from typing import Dict, List, Any, Optional
from pydantic import BaseModel
from app.telemetry.store_state import store_state_manager

class ForecastPoint(BaseModel):
    t: str
    value: int
    upperBand: int
    lowerBand: int

class HistoricalPoint(BaseModel):
    t: str
    value: int

class PredictionDriver(BaseModel):
    label: str
    changePercent: Optional[int] = None

class PredictionResponse(BaseModel):
    predictedQueue: int
    timeToThreshold: int
    risk: str  # NORMAL, MODERATE, HIGH, CRITICAL
    reliability: str  # High, Moderate, Low
    historicalSeries: List[HistoricalPoint]
    forecastSeries: List[ForecastPoint]
    drivers: List[PredictionDriver]

class BottleneckFactor(BaseModel):
    label: str
    score: int
    detail: str

class TimelineStep(BaseModel):
    time: str
    status: str
    risk: str
    description: str

class DiagnosisResponse(BaseModel):
    primaryBottleneck: str
    bottleneckZoneId: str
    bottleneckZoneName: str
    severity: str
    arrivalRate: float
    serviceRate: float
    imbalance: float
    contributingFactors: List[BottleneckFactor]
    timeline: List[TimelineStep]
    recommendation: str

class SimulationSeriesPoint(BaseModel):
    t: int
    value: int

class SimulationSubSeries(BaseModel):
    peakQueue: int
    timeSeries: List[SimulationSeriesPoint]

class SimulationResponse(BaseModel):
    queueReductionPercent: int
    thresholdAvoided: bool
    baseCapacity: float
    simulatedCapacity: float
    baseline: SimulationSubSeries
    simulation: SimulationSubSeries

from typing import Optional

def generate_prediction(horizon_minutes: int = 15) -> PredictionResponse:
    state = store_state_manager.get_live_state()
    current_q = state.queueLength
    in_rate = state.incomingRate
    srv_rate = state.serviceRate
    net_growth_per_min = max(0.4, in_rate - srv_rate)

    predicted_peak = int(current_q + net_growth_per_min * horizon_minutes)
    time_to_15 = max(3, int((15 - current_q) / max(0.2, net_growth_per_min)))

    risk = "HIGH" if predicted_peak >= 18 else "MODERATE" if predicted_peak >= 12 else "NORMAL"

    # 4 Historical points (past 12 mins in 3-min steps)
    historical: List[HistoricalPoint] = [
        HistoricalPoint(t="-12m", value=max(2, current_q - 6)),
        HistoricalPoint(t="-9m", value=max(3, current_q - 4)),
        HistoricalPoint(t="-6m", value=max(4, current_q - 3)),
        HistoricalPoint(t="-3m", value=max(6, current_q - 1)),
        HistoricalPoint(t="0m", value=current_q),
    ]

    # Forecast points (forward in 3-min intervals)
    forecast: List[ForecastPoint] = []
    steps = max(3, horizon_minutes // 3)
    for i in range(1, steps + 1):
        minutes_ahead = i * 3
        expected = int(current_q + net_growth_per_min * minutes_ahead)
        uncertainty = int(1.2 + 0.5 * i)
        forecast.append(ForecastPoint(
            t=f"+{minutes_ahead}m",
            value=expected,
            upperBand=expected + uncertainty + 1,
            lowerBand=max(1, expected - uncertainty)
        ))

    drivers = [
        PredictionDriver(label="Entrance inflow velocity (+31% vs 30m avg)", changePercent=31),
        PredictionDriver(label="Single active cashier throughput deficit (-42%)", changePercent=-42),
        PredictionDriver(label="Aisle 1 dwell conversion into queue line", changePercent=18),
    ]

    return PredictionResponse(
        predictedQueue=predicted_peak,
        timeToThreshold=time_to_15,
        risk=risk,
        reliability="Moderate",
        historicalSeries=historical,
        forecastSeries=forecast,
        drivers=drivers
    )

def generate_diagnosis() -> DiagnosisResponse:
    state = store_state_manager.get_live_state()
    in_rate = state.incomingRate
    srv_rate = state.serviceRate
    imbalance = round(in_rate - srv_rate, 1)

    factors = [
        BottleneckFactor(
            label="Single Cashier Throughput Saturation",
            score=82,
            detail="Processing capacity capped at 3.1 customers/min against 4.8/min arrival surge."
        ),
        BottleneckFactor(
            label="Staples Aisle 1 Dwell Spillage",
            score=58,
            detail="Shopper dwell in Aisle 1 exceeding 4.2 mins, cascading directly into register lane."
        ),
        BottleneckFactor(
            label="Peak Grocery Inflow Surge",
            score=44,
            detail="Sustained entrance velocity observed between 18:00 and 18:30."
        ),
    ]

    timeline = [
        TimelineStep(time="18:10", status="Nominal Flow", risk="NORMAL", description="Store occupancy 12 shoppers, queue clear."),
        TimelineStep(time="18:18", status="Entrance Inflow Surge", risk="MODERATE", description="Footfall spiked to +4.8 shoppers/min."),
        TimelineStep(time="18:24", status="Queue Accumulation", risk="HIGH", description="Queue length reached 8 customers; service rate deficit detected."),
        TimelineStep(time="18:32 (Projected)", status="Threshold Breach", risk="CRITICAL", description="Queue projected to cross SLA limit of 15 customers."),
    ]

    return DiagnosisResponse(
        primaryBottleneck="Main POS Register & Checkout Lanes",
        bottleneckZoneId="z-checkout",
        bottleneckZoneName="Main POS Checkout Area",
        severity="HIGH",
        arrivalRate=in_rate,
        serviceRate=srv_rate,
        imbalance=imbalance,
        contributingFactors=factors,
        timeline=timeline,
        recommendation="Open 1 additional checkout counter to add +2.2 checkouts/min capacity and neutralize the +1.7/min flow accumulation deficit."
    )

def generate_simulation(intervention_type: str = "add_checkout", additional_counters: int = 1) -> SimulationResponse:
    state = store_state_manager.get_live_state()
    current_q = state.queueLength
    base_cap = state.serviceRate
    added_cap = additional_counters * 2.2 if intervention_type == "add_checkout" else 1.8
    sim_cap = round(base_cap + added_cap, 1)

    # Baseline trajectory (No action)
    base_series = [
        SimulationSeriesPoint(t=0, value=current_q),
        SimulationSeriesPoint(t=4, value=current_q + 6),
        SimulationSeriesPoint(t=8, value=current_q + 11),
        SimulationSeriesPoint(t=12, value=current_q + 16),
        SimulationSeriesPoint(t=15, value=current_q + 20),
    ]

    # Simulated trajectory (With added capacity)
    sim_series = [
        SimulationSeriesPoint(t=0, value=current_q),
        SimulationSeriesPoint(t=4, value=max(5, current_q - 1)),
        SimulationSeriesPoint(t=8, value=max(4, current_q - 3)),
        SimulationSeriesPoint(t=12, value=max(3, current_q - 5)),
        SimulationSeriesPoint(t=15, value=max(3, current_q - 5)),
    ]

    base_peak = base_series[-1].value
    sim_peak = sim_series[-1].value
    reduction = int(((base_peak - sim_peak) / base_peak) * 100)

    return SimulationResponse(
        queueReductionPercent=reduction,
        thresholdAvoided=sim_peak < 15,
        baseCapacity=base_cap,
        simulatedCapacity=sim_cap,
        baseline=SimulationSubSeries(peakQueue=base_peak, timeSeries=base_series),
        simulation=SimulationSubSeries(peakQueue=sim_peak, timeSeries=sim_series)
    )
