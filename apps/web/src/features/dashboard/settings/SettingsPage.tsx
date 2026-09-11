import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  User,
  Sliders,
  Camera,
  CheckCircle2,
  Save,
  Bell,
  Sun,
  Moon,
  Gauge,
  Info,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/components/useTheme';
import { useAuth } from '@/features/auth/useAuth';
import {
  mockSettingsService,
  type AppSettings,
  type CameraZoneMapping,
} from '@/services/mock/settings';

export const SettingsPage: React.FC = () => {
  const { setTheme, isDark } = useTheme();
  const { user, shop } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'store_config'>('profile');
  const [settings, setSettings] = useState<AppSettings>(mockSettingsService.getSettings());
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    const data = mockSettingsService.getSettings();
    // Prepopulate from auth shop if available
    if (shop) {
      data.profile.storeName = shop.shop_name || data.profile.storeName;
      data.profile.businessType = shop.business_type || data.profile.businessType;
      data.profile.address = shop.address || data.profile.address;
      data.profile.city = shop.city || data.profile.city;
      data.profile.state = shop.state || data.profile.state;
      data.profile.pincode = shop.pincode || data.profile.pincode;
    }
    if (user?.email) {
      data.profile.email = user.email;
    }
    if (user?.user_metadata?.full_name) {
      data.profile.managerName = user.user_metadata.full_name;
    }
    setSettings({ ...data });
  }, [shop, user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await mockSettingsService.saveSettings(settings);
      setSaveSuccess('Settings saved successfully!');
      setTimeout(() => setSaveSuccess(null), 3500);
    } catch (err) {
      console.error('Failed to save settings', err);
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfileField = (field: keyof AppSettings['profile'], value: string) => {
    setSettings((prev) => ({
      ...prev,
      profile: { ...prev.profile, [field]: value },
    }));
  };

  const updatePreferenceField = (
    field: keyof AppSettings['preferences'],
    value: string | number | boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, [field]: value },
    }));
  };

  const updateCameraZoneType = (
    id: string,
    zoneType: CameraZoneMapping['zoneType']
  ) => {
    setSettings((prev) => ({
      ...prev,
      hardware: {
        ...prev.hardware,
        cameraMappings: prev.hardware.cameraMappings.map((cam) =>
          cam.id === id ? { ...cam, zoneType } : cam
        ),
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
              Settings & Store Configuration
            </h1>
            <span
              className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold uppercase tracking-wider"
              style={{
                background: 'var(--accent-subtle)',
                color: 'var(--accent-fg)',
                border: '1px solid var(--accent-border)',
              }}
            >
              Ops Control
            </span>
          </div>
          <p className="text-xs font-sans mt-1" style={{ color: 'var(--fg-muted)' }}>
            Manage store profile, threshold alarms, edge camera zone mapping, and dashboard preferences.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            variant="primary"
            size="sm"
            className="gap-2 font-medium"
            style={{
              background: 'var(--accent)',
              color: 'var(--accent-fg)',
              border: '1px solid var(--accent-hover)',
            }}
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </Button>
        </div>
      </div>

      {/* 2. Feedback Notification */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3.5 rounded-xl text-xs font-medium flex items-center justify-between gap-2"
            style={{
              background: 'var(--status-ok-bg)',
              borderColor: 'var(--status-ok-border)',
              color: 'var(--status-ok)',
              borderWidth: 1,
              borderStyle: 'solid',
            }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{saveSuccess}</span>
            </div>
            <span className="text-[11px] font-mono">Synced to local state</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Section Navigation Tabs */}
      <div
        className="flex text-xs font-medium"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <button
          onClick={() => setActiveTab('profile')}
          className="px-4 py-3 flex items-center gap-2 transition-all"
          style={{
            borderBottom: activeTab === 'profile' ? '2px solid var(--fg)' : '2px solid transparent',
            color: activeTab === 'profile' ? 'var(--fg)' : 'var(--fg-muted)',
            fontWeight: activeTab === 'profile' ? 600 : 400,
          }}
        >
          <User className="w-4 h-4" />
          <span>Profile & Store Details</span>
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className="px-4 py-3 flex items-center gap-2 transition-all"
          style={{
            borderBottom: activeTab === 'preferences' ? '2px solid var(--fg)' : '2px solid transparent',
            color: activeTab === 'preferences' ? 'var(--fg)' : 'var(--fg-muted)',
            fontWeight: activeTab === 'preferences' ? 600 : 400,
          }}
        >
          <Sliders className="w-4 h-4" />
          <span>Alerts & Preferences</span>
        </button>

        <button
          onClick={() => setActiveTab('store_config')}
          className="px-4 py-3 flex items-center gap-2 transition-all"
          style={{
            borderBottom: activeTab === 'store_config' ? '2px solid var(--fg)' : '2px solid transparent',
            color: activeTab === 'store_config' ? 'var(--fg)' : 'var(--fg-muted)',
            fontWeight: activeTab === 'store_config' ? 600 : 400,
          }}
        >
          <Camera className="w-4 h-4" />
          <span>Edge Cameras & Zone Config</span>
        </button>
      </div>

      {/* 4. Tab Content */}
      <AnimatePresence mode="wait">
        {/* TAB 1: PROFILE */}
        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Store Information */}
            <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <CardHeader>
                <CardTitle className="font-serif text-base flex items-center gap-2" style={{ color: 'var(--fg)' }}>
                  <Store className="w-4 h-4" style={{ color: 'var(--fg-subtle)' }} />
                  <span>Store Organization</span>
                </CardTitle>
                <CardDescription style={{ color: 'var(--fg-muted)' }}>Primary retail establishment profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Store / Business Name"
                  value={settings.profile.storeName}
                  onChange={(e) => updateProfileField('storeName', e.target.value)}
                />

                <div className="space-y-1.5">
                  <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-subtle)' }}>
                    Business Format
                  </label>
                  <select
                    value={settings.profile.businessType}
                    onChange={(e) => updateProfileField('businessType', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg text-xs"
                    style={{
                      background: 'var(--bg-subtle)',
                      color: 'var(--fg)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <option value="kirana">Kirana Store</option>
                    <option value="supermarket">Supermarket & Hypermarket</option>
                    <option value="pharmacy">Pharmacy & Health</option>
                    <option value="other">Specialty Retail</option>
                  </select>
                </div>

                <Input
                  label="Street Address"
                  value={settings.profile.address}
                  onChange={(e) => updateProfileField('address', e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="City"
                    value={settings.profile.city}
                    onChange={(e) => updateProfileField('city', e.target.value)}
                  />
                  <Input
                    label="State"
                    value={settings.profile.state}
                    onChange={(e) => updateProfileField('state', e.target.value)}
                  />
                  <Input
                    label="Pincode"
                    value={settings.profile.pincode}
                    onChange={(e) => updateProfileField('pincode', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Manager / Account Lead */}
            <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <CardHeader>
                <CardTitle className="font-serif text-base flex items-center gap-2" style={{ color: 'var(--fg)' }}>
                  <User className="w-4 h-4" style={{ color: 'var(--fg-subtle)' }} />
                  <span>Operations Manager Profile</span>
                </CardTitle>
                <CardDescription style={{ color: 'var(--fg-muted)' }}>Authorized personnel and notification recipient</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Manager Full Name"
                  value={settings.profile.managerName}
                  onChange={(e) => updateProfileField('managerName', e.target.value)}
                />

                <Input
                  label="Email Address"
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) => updateProfileField('email', e.target.value)}
                />

                <Input
                  label="Operational Role"
                  value={settings.profile.role}
                  onChange={(e) => updateProfileField('role', e.target.value)}
                  helperText="Displayed across intelligence reports and decision logs."
                />

                <div
                  className="p-3.5 rounded-xl text-xs space-y-1"
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                    color: 'var(--fg-muted)',
                  }}
                >
                  <strong className="block font-medium" style={{ color: 'var(--fg)' }}>Security & Access:</strong>
                  <span>Role controls access to live edge camera feeds, What-If simulation models, and parameter calibrations.</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* TAB 2: PREFERENCES & ALERTS */}
        {activeTab === 'preferences' && (
          <motion.div
            key="preferences"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Queue Congestion Alert Thresholds */}
            <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <CardHeader>
                <CardTitle className="font-serif text-base flex items-center gap-2" style={{ color: 'var(--fg)' }}>
                  <Gauge className="w-4 h-4" style={{ color: 'var(--fg-subtle)' }} />
                  <span>Queue Congestion Thresholds</span>
                </CardTitle>
                <CardDescription style={{ color: 'var(--fg-muted)' }}>
                  Define what queue depth triggers each risk severity level
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--fg-subtle)' }}>
                      Moderate Risk Threshold (customers waiting)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={settings.preferences.queueThresholdModerate}
                      onChange={(e) =>
                        updatePreferenceField(
                          'queueThresholdModerate',
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg text-xs"
                      style={{
                        background: 'var(--bg-subtle)',
                        color: 'var(--fg)',
                        border: '1px solid var(--border)',
                      }}
                    />
                    <p className="text-[11px] mt-1" style={{ color: 'var(--fg-subtle)' }}>
                      Prompts advisory badge on dashboard (default: 5).
                    </p>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--status-warn)' }}>
                      High Risk Threshold (customers waiting)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={settings.preferences.queueThresholdHigh}
                      onChange={(e) =>
                        updatePreferenceField(
                          'queueThresholdHigh',
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg text-xs"
                      style={{
                        background: 'var(--bg-subtle)',
                        color: 'var(--fg)',
                        border: '1px solid var(--border)',
                      }}
                    />
                    <p className="text-[11px] mt-1" style={{ color: 'var(--fg-subtle)' }}>
                      Triggers Action Center widget alert (default: 10).
                    </p>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--status-err)' }}>
                      Critical Risk Threshold (customers waiting)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={settings.preferences.queueThresholdCritical}
                      onChange={(e) =>
                        updatePreferenceField(
                          'queueThresholdCritical',
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg text-xs"
                      style={{
                        background: 'var(--bg-subtle)',
                        color: 'var(--fg)',
                        border: '1px solid var(--border)',
                      }}
                    />
                    <p className="text-[11px] mt-1" style={{ color: 'var(--fg-subtle)' }}>
                      Flags critical flow impedance across all pages (default: 15).
                    </p>
                  </div>
                </div>

                <div
                  className="pt-3 flex items-center justify-between"
                  style={{ borderTop: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4" style={{ color: 'var(--fg-subtle)' }} />
                    <div>
                      <span className="text-xs font-semibold block" style={{ color: 'var(--fg)' }}>
                        Critical Alert Notifications
                      </span>
                      <span className="text-[11px]" style={{ color: 'var(--fg-muted)' }}>
                        Receive immediate banner for projected threshold breaches
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.preferences.notifyCriticalAlerts}
                    onChange={(e) =>
                      updatePreferenceField('notifyCriticalAlerts', e.target.checked)
                    }
                    className="w-4 h-4 rounded cursor-pointer"
                    style={{ accentColor: 'var(--accent)' }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dashboard & Units Preferences */}
            <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <CardHeader>
                <CardTitle className="font-serif text-base flex items-center gap-2" style={{ color: 'var(--fg)' }}>
                  <Sliders className="w-4 h-4" style={{ color: 'var(--fg-subtle)' }} />
                  <span>UI & System Preferences</span>
                </CardTitle>
                <CardDescription style={{ color: 'var(--fg-muted)' }}>Default view, visual theme, and measurement units</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Theme Selector */}
                <div className="space-y-1.5">
                  <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-subtle)' }}>
                    Color Theme Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className="p-3 rounded-xl flex items-center gap-2.5 transition-all text-xs"
                      style={{
                        background: isDark ? 'var(--accent-subtle)' : 'var(--bg-subtle)',
                        border: `1px solid ${isDark ? 'var(--accent)' : 'var(--border)'}`,
                        color: isDark ? 'var(--accent-fg)' : 'var(--fg-muted)',
                        fontWeight: isDark ? 600 : 400,
                      }}
                    >
                      <Moon className="w-4 h-4" />
                      <span>Dark Theme</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      className="p-3 rounded-xl flex items-center gap-2.5 transition-all text-xs"
                      style={{
                        background: !isDark ? 'var(--accent-subtle)' : 'var(--bg-subtle)',
                        border: `1px solid ${!isDark ? 'var(--accent)' : 'var(--border)'}`,
                        color: !isDark ? 'var(--accent-fg)' : 'var(--fg-muted)',
                        fontWeight: !isDark ? 600 : 400,
                      }}
                    >
                      <Sun className="w-4 h-4" />
                      <span>Light Theme</span>
                    </button>
                  </div>
                </div>

                {/* Default Landing Page */}
                <div className="space-y-1.5">
                  <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-subtle)' }}>
                    Default Landing Page
                  </label>
                  <select
                    value={settings.preferences.defaultLandingPage}
                    onChange={(e) => updatePreferenceField('defaultLandingPage', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg text-xs"
                    style={{
                      background: 'var(--bg-subtle)',
                      color: 'var(--fg)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <option value="/dashboard/overview">Overview Dashboard</option>
                    <option value="/dashboard/predictive-intelligence">Predictive Store Intelligence</option>
                    <option value="/dashboard/bottleneck-diagnosis">Bottleneck Diagnosis</option>
                    <option value="/dashboard/what-if-simulator">What-If Simulator</option>
                    <option value="/dashboard/store-map">Store Digital Twin</option>
                    <option value="/dashboard/queue-intelligence">Queue Intelligence</option>
                  </select>
                </div>

                {/* Density Units */}
                <div className="space-y-1.5">
                  <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-subtle)' }}>
                    Density & Area Units
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => updatePreferenceField('units', 'metric')}
                      className="p-3 rounded-xl flex items-center justify-between text-xs transition-all"
                      style={{
                        background: settings.preferences.units === 'metric' ? 'var(--accent-subtle)' : 'var(--bg-subtle)',
                        border: `1px solid ${settings.preferences.units === 'metric' ? 'var(--accent)' : 'var(--border)'}`,
                        color: settings.preferences.units === 'metric' ? 'var(--accent-fg)' : 'var(--fg-muted)',
                        fontWeight: settings.preferences.units === 'metric' ? 600 : 400,
                      }}
                    >
                      <span>Metric (people / m²)</span>
                      {settings.preferences.units === 'metric' && <Check className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => updatePreferenceField('units', 'imperial')}
                      className="p-3 rounded-xl flex items-center justify-between text-xs transition-all"
                      style={{
                        background: settings.preferences.units === 'imperial' ? 'var(--accent-subtle)' : 'var(--bg-subtle)',
                        border: `1px solid ${settings.preferences.units === 'imperial' ? 'var(--accent)' : 'var(--border)'}`,
                        color: settings.preferences.units === 'imperial' ? 'var(--accent-fg)' : 'var(--fg-muted)',
                        fontWeight: settings.preferences.units === 'imperial' ? 600 : 400,
                      }}
                    >
                      <span>Imperial (people / sq ft)</span>
                      {settings.preferences.units === 'imperial' && <Check className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* TAB 3: STORE & CAMERA CONFIG */}
        {activeTab === 'store_config' && (
          <motion.div
            key="store_config"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="space-y-6"
          >
            {/* Top Quick Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <CardContent className="p-4 space-y-2">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-widest block" style={{ color: 'var(--fg-subtle)' }}>
                    Physical Checkout Counters Installed
                  </span>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={settings.hardware.numberOfCounters}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          hardware: {
                            ...prev.hardware,
                            numberOfCounters: parseInt(e.target.value) || 1,
                          },
                        }))
                      }
                      className="w-24 px-3 py-2 rounded-lg text-sm font-mono font-bold"
                      style={{
                        background: 'var(--bg-subtle)',
                        color: 'var(--fg)',
                        border: '1px solid var(--border)',
                      }}
                    />
                    <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                      Total POS station lanes in this branch
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <CardContent className="p-4 space-y-2">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-widest block" style={{ color: 'var(--fg-subtle)' }}>
                    Active Edge Cameras Online
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-2xl font-bold" style={{ color: 'var(--status-ok)' }}>
                      {settings.hardware.cameraMappings.length} Nodes
                    </span>
                    <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                      ByteTrack nodes streaming live telemetry
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Camera Zone Mappings Table */}
            <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3">
                <div>
                  <CardTitle className="font-serif text-base flex items-center gap-2" style={{ color: 'var(--fg)' }}>
                    <Camera className="w-4 h-4" style={{ color: 'var(--fg-subtle)' }} />
                    <span>Camera Node to Store Zone Assignments</span>
                  </CardTitle>
                  <CardDescription style={{ color: 'var(--fg-muted)' }}>
                    Configure which camera monitors each functional store zone (Entrance, Aisle, Checkout POS, Storage)
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr
                        className="font-mono text-[10px] uppercase tracking-widest"
                        style={{
                          borderBottom: '1px solid var(--border)',
                          background: 'var(--bg-subtle)',
                          color: 'var(--fg-subtle)',
                        }}
                      >
                        <th className="text-left p-3 font-semibold">Node ID</th>
                        <th className="text-left p-3 font-semibold">Camera Name</th>
                        <th className="text-left p-3 font-semibold">Assigned Zone Type</th>
                        <th className="text-center p-3 font-semibold">FPS</th>
                        <th className="text-center p-3 font-semibold">Resolution</th>
                        <th className="text-right p-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settings.hardware.cameraMappings.map((cam) => (
                        <tr
                          key={cam.id}
                          className="transition-colors"
                          style={{ borderBottom: '1px solid var(--border)' }}
                        >
                          <td className="p-3 font-mono font-bold" style={{ color: 'var(--fg)' }}>
                            {cam.cameraId}
                          </td>
                          <td className="p-3 font-medium" style={{ color: 'var(--fg)' }}>
                            {cam.name}
                          </td>
                          <td className="p-3">
                            <select
                              value={cam.zoneType}
                              onChange={(e) =>
                                updateCameraZoneType(
                                  cam.id,
                                  e.target.value as CameraZoneMapping['zoneType']
                                )
                              }
                              className="px-2.5 py-1.5 rounded-lg text-xs font-medium"
                              style={{
                                background: 'var(--bg-subtle)',
                                color: 'var(--fg)',
                                border: '1px solid var(--border)',
                              }}
                            >
                              <option value="entrance">Entrance Gate</option>
                              <option value="aisle">Product Aisle</option>
                              <option value="checkout">Checkout POS Queue</option>
                              <option value="storage">Storage / Inventory</option>
                              <option value="other">General Floor</option>
                            </select>
                          </td>
                          <td className="p-3 text-center font-mono" style={{ color: 'var(--fg-muted)' }}>
                            {cam.streamFps} FPS
                          </td>
                          <td className="p-3 text-center font-mono" style={{ color: 'var(--fg-subtle)' }}>
                            {cam.resolution}
                          </td>
                          <td className="p-3 text-right">
                            <span
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold"
                              style={{
                                background: 'var(--status-ok-bg)',
                                color: 'var(--status-ok)',
                                border: '1px solid var(--status-ok-border)',
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full animate-pulse"
                                style={{ background: 'var(--status-ok)' }}
                              />
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div
              className="p-4 rounded-xl text-xs flex items-center gap-2.5"
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                color: 'var(--fg-muted)',
              }}
            >
              <Info className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
              <span>
                These camera-to-zone mappings dynamically feed the real-time YOLO perception pipeline in Phase 3.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
