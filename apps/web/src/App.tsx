import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/features/auth/AuthContext';
import { DashboardLayout } from '@/features/dashboard/DashboardLayout';
import { OverviewPage } from '@/features/dashboard/overview/OverviewPage';
import { LiveMonitorPage } from '@/features/dashboard/live-monitor/LiveMonitorPage';
import { QueueIntelligencePage } from '@/features/dashboard/queue-intelligence/QueueIntelligencePage';
import { PredictiveIntelligencePage } from '@/features/dashboard/predictive-intelligence/PredictiveIntelligencePage';
import { BottleneckDiagnosisPage } from '@/features/dashboard/bottleneck-diagnosis/BottleneckDiagnosisPage';
import { WhatIfSimulatorPage } from '@/features/dashboard/what-if-simulator/WhatIfSimulatorPage';
import { ShopperAnalyticsPage } from '@/features/dashboard/shopper-analytics/ShopperAnalyticsPage';
import { InventoryPage } from '@/features/dashboard/inventory/InventoryPage';
import { DevicesPage } from '@/features/dashboard/devices/DevicesPage';
import { SettingsPage } from '@/features/dashboard/settings/SettingsPage';
import { StoreMapPage } from '@/features/dashboard/store-map/StoreMapPage';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Dashboard — no auth wall, open directly for SIH demo */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Navigate to="/dashboard/overview" replace />} />
                <Route path="overview" element={<OverviewPage />} />
                <Route path="live-monitor" element={<LiveMonitorPage />} />
                <Route path="queue-intelligence" element={<QueueIntelligencePage />} />
                <Route path="predictive-intelligence" element={<PredictiveIntelligencePage />} />
                <Route path="bottleneck-diagnosis" element={<BottleneckDiagnosisPage />} />
                <Route path="what-if-simulator" element={<WhatIfSimulatorPage />} />
                {/* Secondary pages — routes still work if linked */}
                <Route path="shopper-analytics" element={<ShopperAnalyticsPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="devices" element={<DevicesPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="store-map" element={<StoreMapPage />} />
              </Route>

              {/* Catch-all → dashboard */}
              <Route path="*" element={<Navigate to="/dashboard/overview" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
