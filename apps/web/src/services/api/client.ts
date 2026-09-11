import type {
  StoreState,
  Prediction,
  BottleneckDiagnosis,
  SimulationRequest,
  SimulationResult,
} from '@/types';

export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

class RetinaApiClient {
  private isOnlineCache: boolean | null = null;
  private lastCheckTime: number = 0;

  public async checkHealth(): Promise<boolean> {
    const now = Date.now();
    // Cache health check result for 10 seconds
    if (this.isOnlineCache !== null && now - this.lastCheckTime < 10000) {
      return this.isOnlineCache;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000),
      });
      this.isOnlineCache = res.ok;
    } catch {
      this.isOnlineCache = false;
    }
    this.lastCheckTime = now;
    return this.isOnlineCache;
  }

  public async getStoreState(): Promise<StoreState> {
    const res = await fetch(`${API_BASE_URL}/api/telemetry/live`);
    if (!res.ok) throw new Error('Failed to fetch store state from API');
    const data = await res.json();
    return {
      occupancy: data.occupancy,
      queueLength: data.queueLength,
      incomingRate: data.incomingRate,
      outgoingRate: data.outgoingRate,
      serviceRate: data.serviceRate,
      density: data.density,
      congestionRisk: data.queueLength >= 15 ? 'CRITICAL' : data.queueLength >= 10 ? 'HIGH' : data.queueLength >= 5 ? 'MODERATE' : 'NORMAL',
    };
  }

  public async getPrediction(horizonMinutes: number = 15): Promise<Prediction> {
    const res = await fetch(
      `${API_BASE_URL}/api/intelligence/prediction?horizon_minutes=${horizonMinutes}`
    );
    if (!res.ok) throw new Error('Failed to fetch prediction from API');
    return await res.json();
  }

  public async getDiagnosis(): Promise<BottleneckDiagnosis> {
    const res = await fetch(`${API_BASE_URL}/api/intelligence/diagnosis`);
    if (!res.ok) throw new Error('Failed to fetch diagnosis from API');
    return await res.json();
  }

  public async runSimulation(req: SimulationRequest): Promise<SimulationResult> {
    const res = await fetch(`${API_BASE_URL}/api/intelligence/simulation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interventionType: req.interventionType,
        additionalCounters: req.additionalCounters,
      }),
    });
    if (!res.ok) throw new Error('Failed to run simulation on API');
    return await res.json();
  }

  public async logAction(payload: {
    action: string;
    rationale?: string;
    interventionType?: string;
    details?: Record<string, any>;
  }): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/actions/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn('Could not post action log to backend:', e);
    }
  }

  public getCameraStreamUrl(cameraId: string): string {
    return `${API_BASE_URL}/api/stream/${cameraId}`;
  }
}

export const apiClient = new RetinaApiClient();
