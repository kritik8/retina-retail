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
      if (!shop?.id) {
        return;
      }

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Store Digital Twin & Live Map
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Sparkles className="w-3 h-3" /> Flagship Engine
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time top-down 2D floor plan with animated heatmap density and edge camera zones for{' '}
            <span className="text-indigo-400 font-semibold">{shop?.shop_name}</span>.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsEditMode(false)}
            variant={!isEditMode ? 'primary' : 'outline'}
            size="sm"
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>Live Twin Mode</span>
          </Button>

          <Button
            onClick={() => setIsEditMode(true)}
            variant={isEditMode ? 'primary' : 'outline'}
            size="sm"
            className="gap-2"
          >
            <Edit3 className="w-4 h-4" />
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
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Zone Telemetry: {selectedZone.name}</span>
                </CardTitle>
                <CardDescription>Live edge sensor metrics for selected floor section</CardDescription>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  (selectedZone.density || 30) >= 80
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    : (selectedZone.density || 30) >= 55
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}
              >
                {(selectedZone.density || 30) >= 80
                  ? 'High Congestion'
                  : (selectedZone.density || 30) >= 55
                  ? 'Moderate Footfall'
                  : 'Optimal Flow'}
              </span>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 font-semibold uppercase block">Live Shoppers</span>
                  <div className="text-2xl font-extrabold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-400" />
                    <span>{selectedZone.shopperCount || 0} People</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 font-semibold uppercase block">Heatmap Density</span>
                  <div className="text-2xl font-extrabold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    <span>{selectedZone.density || 30}%</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 font-semibold uppercase block">Assigned Camera</span>
                  <div className="text-sm font-semibold text-white flex items-center gap-2 mt-1">
                    <Camera className="w-4 h-4 text-sky-400" />
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
