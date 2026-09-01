import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/features/auth/AuthContext';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { LoginPage } from '@/features/auth/LoginPage';
import { OnboardingPage } from '@/features/onboarding/OnboardingPage';
import { DashboardLayout } from '@/features/dashboard/DashboardLayout';
import { OverviewPage } from '@/features/dashboard/overview/OverviewPage';
import { StoreMapPage } from '@/features/dashboard/store-map/StoreMapPage';
import { ShopperAnalyticsPage } from '@/features/dashboard/shopper-analytics/ShopperAnalyticsPage';
import { InventoryPage } from '@/features/dashboard/inventory/InventoryPage';
import { QueueIntelligencePage } from '@/features/dashboard/queue-intelligence/QueueIntelligencePage';
import { DevicesPage } from '@/features/dashboard/devices/DevicesPage';
import { SettingsPage } from '@/features/dashboard/settings/SettingsPage';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Onboarding Route */}
              <Route
                path="/onboarding"
                element={
                  <AuthGuard requireShop={false}>
                    <OnboardingPage />
                  </AuthGuard>
                }
              />

              {/* Protected Dashboard Routes */}
              <Route
                path="/dashboard"
                element={
                  <AuthGuard requireShop={true}>
                    <DashboardLayout />
                  </AuthGuard>
                }
              >
                <Route index element={<Navigate to="/dashboard/overview" replace />} />
                <Route path="overview" element={<OverviewPage />} />
                <Route path="store-map" element={<StoreMapPage />} />
                <Route path="shopper-analytics" element={<ShopperAnalyticsPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="queue-intelligence" element={<QueueIntelligencePage />} />
                <Route path="devices" element={<DevicesPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Default Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/dashboard/overview" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
