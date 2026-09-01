import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { supabase, isConfiguredSupabase } from '@/lib/supabase';
import type { StoreZone, StoreLayoutConfig } from '@/types';
import { defaultKiranaLayout } from '@/lib/mockLayouts';
import { DigitalTwinCanvas } from './components/DigitalTwinCanvas';
import { ZoneEditor } from './components/ZoneEditor';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Layers,
  Edit3,
  Eye,
  Camera,
  Users,
  Activity,
  Sparkles,
} from 'lucide-react';

export const StoreMapPage: React.FC = () => {
  const { shop } = useAuth();
  const [zones, setZones] = useState<StoreZone[]>(defaultKiranaLayout.zones);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(zones[0]?.id || null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch layout from Supabase or localStorage
  useEffect(() => {
    async function loadLayout() {
      if (!shop?.id) return;

      if (isConfiguredSupabase) {
        try {
          const { data } = await supabase
            .from('store_layouts')
            .select('layout_json')
            .eq('shop_id', shop.id)
            .maybeSingle();

          if (data?.layout_json?.zones?.length) {
            setZones(data.layout_json.zones);
            setSelectedZoneId(data.layout_json.zones[0]?.id || null);
          }
        } catch (err) {
          console.error('Error fetching store layout:', err);
        }
      } else {
        const localLayout = localStorage.getItem(`retina_layout_${shop.id}`);
        if (localLayout) {
          const parsed = JSON.parse(localLayout);
          if (parsed.zones?.length) {
            setZones(parsed.zones);
            setSelectedZoneId(parsed.zones[0]?.id || null);
          }
        }
      }
    }

    loadLayout();
  }, [shop?.id]);

  // Live simulation update for zone density & shopper counts
  useEffect(() => {
    const interval = setInterval(() => {
      setZones((prev) =>
        prev.map((z) => {
          const delta = Math.floor(Math.random() * 7 - 3);
          const newCount = Math.max(0, (z.shopperCount || 5) + delta);
          const newDensity = Math.min(100, Math.max(10, Math.round(newCount * 5.5)));
          return {
            ...z,
            shopperCount: newCount,
            density: newDensity,
          };
        })
      );
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const handleSaveLayout = async (newZones: StoreZone[]) => {
    setZones(newZones);
    if (!shop?.id) return;

    const layoutData: StoreLayoutConfig = { zones: newZones };

    if (isConfiguredSupabase) {
      await supabase.from('store_layouts').upsert({
        shop_id: shop.id,
        layout_json: layoutData,
        updated_at: new Date().toISOString(),
      });
    } else {
      localStorage.setItem(`retina_layout_${shop.id}`, JSON.stringify(layoutData));
    }
  };

  const selectedZone = zones.find((z) => z.id === selectedZoneId) || zones[0];

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
              Store Digital Twin & Live Map
            </h1>
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-semibold tracking-wider"
              style={{ background: 'var(--accent-subtle)', color: 'var(--accent-fg)', border: '1px solid var(--accent-border)' }}
            >
              <Sparkles className="w-3 h-3" /> Flagship Engine
            </span>
          </div>
          <p className="font-sans text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>
            Real-time 2D floor plan with animated heatmap density for{' '}
            <span className="font-semibold" style={{ color: 'var(--fg)' }}>{shop?.shop_name}</span>.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsEditMode(false)}
            variant={!isEditMode ? 'primary' : 'outline'}
            size="sm"
            className="gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Twin</span>
          </Button>

          <Button
            onClick={() => setIsEditMode(true)}
            variant={isEditMode ? 'primary' : 'outline'}
            size="sm"
            className="gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Floor Plan</span>
          </Button>
        </div>
      </div>

      {/* Main Floor Plan Canvas Component */}
      <DigitalTwinCanvas
        zones={zones}
        selectedZoneId={selectedZoneId}
        onSelectZone={(id) => setSelectedZoneId(id)}
        isEditMode={isEditMode}
      />

      {/* Zone Editor or Selected Zone Details */}
      {isEditMode ? (
        <ZoneEditor
          zones={zones}
          onSaveLayout={handleSaveLayout}
          selectedZoneId={selectedZoneId}
          onSelectZone={(id) => setSelectedZoneId(id)}
        />
      ) : (
        selectedZone && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="font-serif text-base flex items-center gap-2" style={{ color: 'var(--fg)' }}>
                  <Layers className="w-4 h-4" style={{ color: 'var(--fg-subtle)' }} />
                  <span>Zone Telemetry: {selectedZone.name}</span>
                </CardTitle>
                <CardDescription style={{ color: 'var(--fg-muted)' }}>Live edge sensor metrics for selected floor section</CardDescription>
              </div>
              <span
                className="px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-semibold tracking-wider"
                style={
                  (selectedZone.density || 30) >= 80
                    ? { background: 'var(--status-err-bg)', color: 'var(--status-err)', border: '1px solid var(--status-err-border)' }
                    : (selectedZone.density || 30) >= 55
                    ? { background: 'var(--status-warn-bg)', color: 'var(--status-warn)', border: '1px solid var(--status-warn-border)' }
                    : { background: 'var(--status-ok-bg)', color: 'var(--status-ok)', border: '1px solid var(--status-ok-border)' }
                }
              >
                {(selectedZone.density || 30) >= 80
                  ? 'High Congestion'
                  : (selectedZone.density || 30) >= 55
                  ? 'Moderate Flow'
                  : 'Optimal Flow'}
              </span>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-lg space-y-1" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-widest block" style={{ color: 'var(--fg-subtle)' }}>Live Shoppers</span>
                  <div className="font-serif text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--fg)' }}>
                    <Users className="w-4 h-4" style={{ color: 'var(--fg-subtle)' }} />
                    <span>{selectedZone.shopperCount || 0}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg space-y-1" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-widest block" style={{ color: 'var(--fg-subtle)' }}>Heatmap Density</span>
                  <div className="font-serif text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--fg)' }}>
                    <Activity className="w-4 h-4" style={{ color: 'var(--status-ok)' }} />
                    <span>{selectedZone.density || 30}%</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg space-y-1" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-widest block" style={{ color: 'var(--fg-subtle)' }}>Assigned Camera</span>
                  <div className="font-sans text-xs font-semibold flex items-center gap-2 mt-1" style={{ color: 'var(--fg)' }}>
                    <Camera className="w-3.5 h-3.5" style={{ color: 'var(--fg-subtle)' }} />
                    <span>{selectedZone.cameraId ? `Camera Node (${selectedZone.cameraId})` : 'Unmonitored Zone'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
};
