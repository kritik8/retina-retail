import React, { useState } from 'react';
import type { StoreZone, ZoneCategory } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2, Save, RotateCcw, Check } from 'lucide-react';
import { defaultKiranaLayout } from '@/lib/mockLayouts';

interface ZoneEditorProps {
  zones: StoreZone[];
  onSaveLayout: (newZones: StoreZone[]) => Promise<void>;
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string) => void;
}

export const ZoneEditor: React.FC<ZoneEditorProps> = ({
  zones,
  onSaveLayout,
  selectedZoneId,
  onSelectZone,
}) => {
  const [editedZones, setEditedZones] = useState<StoreZone[]>(zones);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const selectedZone = editedZones.find((z) => z.id === selectedZoneId) || editedZones[0];

  const handleUpdateZone = (id: string, updates: Partial<StoreZone>) => {
    setEditedZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, ...updates } : z))
    );
  };

  const handleAddZone = () => {
    const newZone: StoreZone = {
      id: `zone-${Date.now()}`,
      name: `New Store Zone ${editedZones.length + 1}`,
      x: 20,
      y: 20,
      width: 30,
      height: 25,
      cameraId: null,
      category: 'aisle',
      density: 20,
      shopperCount: 0,
    };
    setEditedZones((prev) => [...prev, newZone]);
    onSelectZone(newZone.id);
  };

  const handleDeleteZone = (id: string) => {
    if (editedZones.length <= 1) {
      alert('At least one zone must remain on the store floor plan.');
      return;
    }
    setEditedZones((prev) => prev.filter((z) => z.id !== id));
  };

  const handleResetPreset = () => {
    setEditedZones(defaultKiranaLayout.zones);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveLayout(editedZones);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="rounded-[10px] p-6 space-y-6"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-base font-semibold" style={{ color: 'var(--fg)' }}>Floor Plan Layout Editor</h3>
          <p className="font-sans text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>
            Configure rectangular store zones, assign camera nodes, and calibrate grid coordinates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleResetPreset} variant="outline" size="sm" className="gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Preset</span>
          </Button>

          <Button onClick={handleAddZone} variant="secondary" size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Zone</span>
          </Button>

          <Button onClick={handleSave} isLoading={isSaving} variant="primary" size="sm" className="gap-1.5">
            {saveSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saveSuccess ? 'Saved!' : 'Save Layout'}</span>
          </Button>
        </div>
      </div>

      {/* Selected Zone Editing Form */}
      {selectedZone && (
        <div
          className="p-4 rounded-lg space-y-4"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <h4 className="font-mono text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--accent-fg)' }}>
              Editing: {selectedZone.name}
            </h4>
            <Button
              onClick={() => handleDeleteZone(selectedZone.id)}
              variant="danger"
              size="sm"
              className="px-2.5 py-1 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Zone Name"
              value={selectedZone.name}
              onChange={(e) => handleUpdateZone(selectedZone.id, { name: e.target.value })}
            />

            <div>
              <label
                className="block font-mono text-[10px] font-semibold uppercase tracking-widest mb-1.5"
                style={{ color: 'var(--fg-muted)' }}
              >
                Category
              </label>
              <select
                value={selectedZone.category}
                onChange={(e) => handleUpdateZone(selectedZone.id, { category: e.target.value as ZoneCategory })}
                className="w-full px-3 py-2 rounded-lg text-xs transition-colors duration-150 outline-none"
                style={{
                  background: 'var(--bg-elevated)',
                  color: 'var(--fg)',
                  border: '1px solid var(--border)',
                }}
              >
                <option value="entrance">Entrance</option>
                <option value="aisle">Aisle</option>
                <option value="checkout">Checkout / POS</option>
                <option value="storage">Storage / Dairy</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label
                className="block font-mono text-[10px] font-semibold uppercase tracking-widest mb-1.5"
                style={{ color: 'var(--fg-muted)' }}
              >
                Assigned Edge Camera
              </label>
              <select
                value={selectedZone.cameraId || ''}
                onChange={(e) => handleUpdateZone(selectedZone.id, { cameraId: e.target.value || null })}
                className="w-full px-3 py-2 rounded-lg text-xs transition-colors duration-150 outline-none"
                style={{
                  background: 'var(--bg-elevated)',
                  color: 'var(--fg)',
                  border: '1px solid var(--border)',
                }}
              >
                <option value="">None (Unmonitored)</option>
                <option value="cam-01">Main Entrance Optics #1 (cam-01)</option>
                <option value="cam-02">Aisle A3 Rice & Grains (cam-02)</option>
                <option value="cam-03">Checkout POS Queue Sensor (cam-03)</option>
                <option value="cam-04">Backroom Inventory Gateway (cam-04)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="X Pos (%)"
                type="number"
                min={0}
                max={90}
                value={selectedZone.x}
                onChange={(e) => handleUpdateZone(selectedZone.id, { x: Number(e.target.value) })}
              />
              <Input
                label="Y Pos (%)"
                type="number"
                min={0}
                max={90}
                value={selectedZone.y}
                onChange={(e) => handleUpdateZone(selectedZone.id, { y: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
