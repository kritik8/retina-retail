export interface DeviceStatusItem {
  id: string;
  name: string;
  type: 'camera' | 'sensor';
  status: 'online' | 'offline';
  fps?: number;
  lastHeartbeat: string;
}

export interface HourlyFootfallData {
  hour: string;
  footfall: number;
  average: number;
}

export interface CounterWaitData {
  counter: string;
  waitTimeMins: number;
  queueLength: number;
  status: 'optimal' | 'warning' | 'congested';
}

export interface AIInsightItem {
  id: string;
  type: 'warning' | 'inventory' | 'trend' | 'device';
  title: string;
  detail: string;
  timestamp: string;
  severity: 'high' | 'medium' | 'info';
}

export interface OverviewTelemetry {
  footfallToday: number;
  footfallChangePct: number;
  footfallSparkline: number[];
  avgQueueWaitMins: number;
  queueThresholdMins: number;
  activeStockAlerts: number;
  devicesOnline: number;
  totalDevices: number;
  devicesList: DeviceStatusItem[];
  storeHealthScore: number;
  healthStatus: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical';
  healthBreakdown: {
    footfallScore: number;
    queueScore: number;
    stockScore: number;
  };
  hourlyFootfall: HourlyFootfallData[];
  counterWaitTimes: CounterWaitData[];
  aiInsights: AIInsightItem[];
}

// Generate realistic simulated live telemetry data
export function generateMockOverviewData(): OverviewTelemetry {
  const now = new Date();
  
  // Base values with slight random fluctuations
  const baseFootfall = 1420 + Math.floor(Math.random() * 35);
  const queueWait = parseFloat((2.3 + (Math.random() * 0.8 - 0.4)).toFixed(1));
  const stockAlertsCount = Math.max(1, 3 + Math.floor(Math.random() * 2 - 1));

  // Hourly footfall for last 24 hours
  const hourlyFootfall: HourlyFootfallData[] = Array.from({ length: 24 }, (_, i) => {
    const hourNum = (now.getHours() - 23 + i + 24) % 24;
    const hourLabel = `${hourNum.toString().padStart(2, '0')}:00`;
    
    // Retail curve peak around 12:00-14:00 and 17:00-20:00
    let factor = 0.2;
    if (hourNum >= 11 && hourNum <= 14) factor = 0.85;
    else if (hourNum >= 17 && hourNum <= 20) factor = 0.95;
    else if (hourNum >= 9 && hourNum <= 21) factor = 0.55;

    const footfall = Math.floor(factor * 120 + Math.random() * 20);
    const average = Math.floor(factor * 110 + 10);
    return { hour: hourLabel, footfall, average };
  });

  // Extract sparkline history (last 12 hours)
  const footfallSparkline = hourlyFootfall.slice(-12).map((d) => d.footfall);

  // Counter wait times
  const counterWaitTimes: CounterWaitData[] = [
    { counter: 'Express Counter 1', waitTimeMins: parseFloat((1.8 + Math.random() * 0.4).toFixed(1)), queueLength: 2, status: 'optimal' },
    { counter: 'Main Checkout 2', waitTimeMins: parseFloat((5.2 + Math.random() * 0.6).toFixed(1)), queueLength: 7, status: 'congested' },
    { counter: 'Main Checkout 3', waitTimeMins: parseFloat((3.4 + Math.random() * 0.5).toFixed(1)), queueLength: 4, status: 'warning' },
    { counter: 'Pharmacy POS 4', waitTimeMins: parseFloat((1.2 + Math.random() * 0.3).toFixed(1)), queueLength: 1, status: 'optimal' },
  ];

  // Devices
  const devicesList: DeviceStatusItem[] = [
    { id: 'cam-01', name: 'Main Entrance Optics #1', type: 'camera', status: 'online', fps: 30, lastHeartbeat: '2s ago' },
    { id: 'cam-02', name: 'Aisle A3 Rice & Grains', type: 'camera', status: 'online', fps: 28, lastHeartbeat: '4s ago' },
    { id: 'cam-03', name: 'Checkout POS Queue Sensor', type: 'camera', status: 'online', fps: 30, lastHeartbeat: '1s ago' },
    { id: 'cam-04', name: 'Backroom Inventory Gateway', type: 'camera', status: 'online', fps: 25, lastHeartbeat: '5s ago' },
    { id: 'cam-05', name: 'Side Exit Pedestrian Sensor', type: 'sensor', status: 'offline', fps: 0, lastHeartbeat: '14m ago' },
  ];

  const devicesOnline = devicesList.filter((d) => d.status === 'online').length;

  // Composite Store Health Score calculation (0-100)
  // Queue penalty: if > 3.0 min -> lower score
  // Stock penalty: stock alerts count
  // Device availability: online / total
  const queueScore = Math.max(40, 100 - (queueWait > 3.0 ? (queueWait - 3.0) * 15 : 0));
  const stockScore = Math.max(50, 100 - stockAlertsCount * 12);
  const deviceScore = Math.round((devicesOnline / devicesList.length) * 100);
  const footfallScore = 92;

  const storeHealthScore = Math.round(
    footfallScore * 0.25 + queueScore * 0.35 + stockScore * 0.25 + deviceScore * 0.15
  );

  let healthStatus: OverviewTelemetry['healthStatus'] = 'Good';
  if (storeHealthScore >= 88) healthStatus = 'Excellent';
  else if (storeHealthScore >= 75) healthStatus = 'Good';
  else if (storeHealthScore >= 55) healthStatus = 'Needs Attention';
  else healthStatus = 'Critical';

  // AI Insights Feed
  const aiInsights: AIInsightItem[] = [
    {
      id: 'ins-1',
      type: 'warning',
      title: 'Queue Bottleneck Detected',
      detail: 'Main Checkout 2 queue has exceeded 5.0 min wait time threshold for the last 12 minutes. Recommend opening Counter 4.',
      timestamp: 'Just now',
      severity: 'high',
    },
    {
      id: 'ins-2',
      type: 'inventory',
      title: 'Shelf Stock Out Alert',
      detail: 'Shelf A3 (Rice & Grains) stock level dropped below 15%. Optical camera confidence: 94%.',
      timestamp: '8m ago',
      severity: 'medium',
    },
    {
      id: 'ins-3',
      type: 'trend',
      title: 'Peak Footfall Velocity',
      detail: 'Store shopper footfall is 18.4% higher than the 7-day average for Tuesday afternoon.',
      timestamp: '22m ago',
      severity: 'info',
    },
    {
      id: 'ins-4',
      type: 'device',
      title: 'Edge Node Sensor Heartbeat Timeout',
      detail: 'Side Exit Pedestrian Sensor (#cam-05) offline for 14 minutes. Re-establishing mesh link.',
      timestamp: '35m ago',
      severity: 'medium',
    },
  ];

  return {
    footfallToday: baseFootfall,
    footfallChangePct: 18.4,
    footfallSparkline,
    avgQueueWaitMins: queueWait,
    queueThresholdMins: 3.0,
    activeStockAlerts: stockAlertsCount,
    devicesOnline,
    totalDevices: devicesList.length,
    devicesList,
    storeHealthScore,
    healthStatus,
    healthBreakdown: {
      footfallScore: Math.round(footfallScore),
      queueScore: Math.round(queueScore),
      stockScore: Math.round(stockScore),
    },
    hourlyFootfall,
    counterWaitTimes,
    aiInsights,
  };
}
