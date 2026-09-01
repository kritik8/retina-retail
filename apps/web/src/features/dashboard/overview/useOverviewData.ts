import { useQuery } from '@tanstack/react-query';
import { generateMockOverviewData, type OverviewTelemetry } from '@/lib/mockData';

/**
 * Custom Data Hook for Overview Page.
 * Swapping from mock generator to Supabase Realtime or REST endpoint later
 * only requires updating the queryFn inside this hook.
 */
export function useOverviewData() {
  return useQuery<OverviewTelemetry>({
    queryKey: ['overviewTelemetry'],
    queryFn: async () => {
      // Simulated 150ms network latency
      await new Promise((resolve) => setTimeout(resolve, 150));
      return generateMockOverviewData();
    },
    refetchInterval: 4000, // Live poll every 4 seconds
    staleTime: 2000,
  });
}
