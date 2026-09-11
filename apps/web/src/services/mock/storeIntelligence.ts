import type {
  StoreState,
  Prediction,
  BottleneckDiagnosis,
  SimulationRequest,
  SimulationResult,
  Recommendation,
  SimulationTimeSeriesPoint,
} from '@/types';
import { apiClient } from '@/services/api/client';

// Simulated delay helper to mirror real network behavior
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockIntelligenceService = {
  /**
   * Fetches current snapshot of store state metrics.
   * Connects to live Python backend if online, else returns mock state.
   */
  async getStoreState(): Promise<StoreState> {
    const isOnline = await apiClient.checkHealth();
    if (isOnline) {
      try {
        return await apiClient.getStoreState();
      } catch (err) {
        console.warn('API getStoreState failed, using local store state fallback', err);
      }
    }

    await delay(120);
    return {
      occupancy: 42,
      queueLength: 8,
      incomingRate: 14.2, // people/min
      outgoingRate: 8.8, // people/min
      serviceRate: 3.1, // checkouts/min
      density: 74, // % area saturation
      congestionRisk: 'HIGH',
    };
  },

  /**
   * Fetches multi-step queue forecast and key drivers over a given horizon.
   * Connects to live Python backend if online, else returns mock prediction.
   */
  async getPrediction(horizonMinutes = 15): Promise<Prediction> {
    const isOnline = await apiClient.checkHealth();
    if (isOnline) {
      try {
        return await apiClient.getPrediction(horizonMinutes);
      } catch (err) {
        console.warn('API getPrediction failed, using local prediction fallback', err);
      }
    }

    await delay(150);

    // Current time base for labels
    const now = new Date();
    const formatTime = (minutesOffset: number) => {
      const d = new Date(now.getTime() + minutesOffset * 60000);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    };

    // Historical queue depths (last 15 minutes)
    const historicalSeries = [
      { t: formatTime(-15), value: 3 },
      { t: formatTime(-12), value: 4 },
      { t: formatTime(-9), value: 5 },
      { t: formatTime(-6), value: 6 },
      { t: formatTime(-3), value: 7 },
      { t: formatTime(0), value: 8 }, // Current queue
    ];

    // Forecast queue depths with qualitative uncertainty bands
    const forecastSeries = [
      { t: formatTime(0), value: 8, upperBand: 8, lowerBand: 8 },
      { t: formatTime(3), value: 11, upperBand: 13, lowerBand: 9 },
      { t: formatTime(6), value: 16, upperBand: 19, lowerBand: 13 },
      { t: formatTime(9), value: 21, upperBand: 25, lowerBand: 17 },
      { t: formatTime(12), value: 25, upperBand: 30, lowerBand: 20 },
      { t: formatTime(15), value: 28, upperBand: 34, lowerBand: 22 },
    ];

    return {
      horizonMinutes,
      predictedQueue: 28,
      risk: 'HIGH',
      timeToThreshold: 7, // minutes until queue exceeds 15 people
      reliability: 'Moderate', // Qualitative label, no fake %
      drivers: [
        { label: 'Incoming shopper velocity spike', changePercent: 31 },
        { label: 'Checkout service capacity deficit', changePercent: -18 },
        { label: 'Aisle 3 promotional area spillover', changePercent: 14 },
      ],
      historicalSeries,
      forecastSeries,
    };
  },

  /**
   * Fetches automated root-factor bottleneck diagnosis.
   * Connects to live Python backend if online, else returns mock diagnosis.
   */
  async getDiagnosis(): Promise<BottleneckDiagnosis> {
    const isOnline = await apiClient.checkHealth();
    if (isOnline) {
      try {
        return await apiClient.getDiagnosis();
      } catch (err) {
        console.warn('API getDiagnosis failed, using local diagnosis fallback', err);
      }
    }

    await delay(160);
    return {
      primaryBottleneck: 'checkout',
      bottleneckZoneId: 'z-checkout',
      bottleneckZoneName: 'Main Checkout & POS',
      severity: 'HIGH',
      arrivalRate: 14.2, // people/min entering queue area
      serviceRate: 3.1, // people/min completed at open registers
      imbalance: 11.1, // net accumulation rate (people/min)
      contributingFactors: [
        {
          label: 'Checkout Capacity Deficit',
          score: 82,
          detail: 'Only 1 active register servicing high incoming traffic.',
        },
        {
          label: 'Incoming Footfall Surge',
          score: 61,
          detail: 'Sustained shopper ingress from Main Entrance over last 12 min.',
        },
        {
          label: 'Aisle Congestion Spillover',
          score: 34,
          detail: 'Dwell time in front aisles slowing forward movement to register.',
        },
        {
          label: 'Entrance Funneling',
          score: 17,
          detail: 'Minor velocity friction near outer gate.',
        },
      ],
      timeline: [
        {
          time: '12:00',
          status: 'Normal Flow',
          description: 'Queue steady at 3 customers, service rate meeting demand.',
          risk: 'NORMAL',
        },
        {
          time: '12:04',
          status: 'Elevated Inflow',
          description: 'Entrance sensor recorded +28% ingress increase.',
          risk: 'MODERATE',
        },
        {
          time: '12:07',
          status: 'Bottleneck Detected',
          description: 'Queue growth rate crossed 1.8 persons/min threshold.',
          risk: 'HIGH',
        },
        {
          time: '12:10',
          status: 'Critical Alert Predicted',
          description: 'Projected wait time exceeds 6.5 mins without counter opening.',
          risk: 'CRITICAL',
        },
      ],
      recommendation:
        'Observed flow imbalance indicates checkout capacity is the primary contributing factor. Adding 1-2 active registers is simulated to restore normal flow within 6 minutes.',
    };
  },

  /**
   * Runs what-if counter / routing simulation.
   * Connects to live Python backend if online, else returns mock simulation.
   */
  async runSimulation(req: SimulationRequest): Promise<SimulationResult> {
    const isOnline = await apiClient.checkHealth();
    if (isOnline) {
      try {
        return await apiClient.runSimulation(req);
      } catch (err) {
        console.warn('API runSimulation failed, using local simulation fallback', err);
      }
    }

    await delay(200);

    const baseCapacity = 3.1;
    const addedPerCounter = 2.2;
    const counters = req.additionalCounters || 1;

    let simulatedCapacity = baseCapacity;
    let reductionPct = 68;
    let peakSim = 9;
    let thresholdAvoided = true;

    if (req.interventionType === 'add_checkout') {
      simulatedCapacity = Number((baseCapacity + counters * addedPerCounter).toFixed(1));
      reductionPct = counters === 1 ? 64 : counters === 2 ? 78 : 86;
      peakSim = counters === 1 ? 11 : counters === 2 ? 8 : 6;
      thresholdAvoided = true;
    } else if (req.interventionType === 'increase_staffing') {
      simulatedCapacity = 4.8;
      reductionPct = 48;
      peakSim = 14;
      thresholdAvoided = true;
    } else if (req.interventionType === 'redirect_checkout') {
      simulatedCapacity = 4.5;
      reductionPct = 42;
      peakSim = 16;
      thresholdAvoided = false;
    } else {
      simulatedCapacity = 3.8;
      reductionPct = 28;
      peakSim = 19;
      thresholdAvoided = false;
    }

    // Generate minute-by-minute time series from t=0 to t=15
    const times = [0, 2, 4, 6, 8, 10, 12, 15];
    const baselineSeries: SimulationTimeSeriesPoint[] = times.map((t) => {
      const val = Math.min(30, Math.round(8 + (t / 15) * 20));
      return { t, value: val };
    });

    const simulationSeries: SimulationTimeSeriesPoint[] = times.map((t) => {
      let val = 8;
      if (t === 2) val = 9;
      else if (t === 4) val = peakSim;
      else if (t === 6) val = Math.max(3, peakSim - 2);
      else if (t === 8) val = Math.max(3, peakSim - 4);
      else if (t === 10) val = Math.max(3, peakSim - 5);
      else if (t === 12) val = Math.max(2, peakSim - 6);
      else val = Math.max(2, peakSim - 6);
      return { t, value: val };
    });

    return {
      baseline: {
        peakQueue: 28,
        timeSeries: baselineSeries,
      },
      simulation: {
        peakQueue: peakSim,
        timeSeries: simulationSeries,
      },
      queueReductionPercent: reductionPct,
      thresholdAvoided,
      timeToThreshold: thresholdAvoided ? undefined : 8,
      additionalCounters: counters,
      baseCapacity,
      simulatedCapacity,
    };
  },

  /**
   * Fetches latest operational recommendation based on store state and diagnosis.
   */
  async getRecommendation(): Promise<Recommendation> {
    await delay(100);
    return {
      action: 'Open Counter 2 (Main POS)',
      rationale:
        'Incoming shopper flow (+31%) is exceeding current single-counter capacity. Opening 1 additional register is projected to reduce peak queue by 64% and avoid critical threshold.',
      interventionType: 'add_checkout',
      suggestedCounters: 1,
    };
  },
};
