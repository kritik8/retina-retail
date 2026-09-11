export interface StoreProfileSettings {
  storeName: string;
  managerName: string;
  email: string;
  role: string;
  businessType: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface StorePreferencesSettings {
  theme: 'dark' | 'light' | 'system';
  defaultLandingPage: string;
  queueThresholdModerate: number;
  queueThresholdHigh: number;
  queueThresholdCritical: number;
  notifyCriticalAlerts: boolean;
  units: 'metric' | 'imperial';
}

export interface CameraZoneMapping {
  id: string;
  name: string;
  cameraId: string;
  zoneType: 'entrance' | 'aisle' | 'checkout' | 'storage' | 'other';
  streamFps: number;
  resolution: string;
}

export interface StoreHardwareSettings {
  numberOfCounters: number;
  expectedCameras: number;
  cameraMappings: CameraZoneMapping[];
}

export interface AppSettings {
  profile: StoreProfileSettings;
  preferences: StorePreferencesSettings;
  hardware: StoreHardwareSettings;
}

const STORAGE_KEY = 'retina_app_settings';

const defaultSettings: AppSettings = {
  profile: {
    storeName: 'Kritik Sports & Retail',
    managerName: 'Kratik (Store Manager)',
    email: 'kratik@retinaretail.ai',
    role: 'Store Operations Lead',
    businessType: 'supermarket',
    address: 'Plot 42, Commercial Sector A, MP Nagar',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    pincode: '462011',
  },
  preferences: {
    theme: 'dark',
    defaultLandingPage: '/dashboard/overview',
    queueThresholdModerate: 5,
    queueThresholdHigh: 10,
    queueThresholdCritical: 15,
    notifyCriticalAlerts: true,
    units: 'metric',
  },
  hardware: {
    numberOfCounters: 4,
    expectedCameras: 5,
    cameraMappings: [
      {
        id: 'cam-01',
        name: 'Main Entrance Optics #1',
        cameraId: 'RET-89A1',
        zoneType: 'entrance',
        streamFps: 30,
        resolution: '1080p',
      },
      {
        id: 'cam-02',
        name: 'Aisle A3 Rice & Grains',
        cameraId: 'RET-89A2',
        zoneType: 'aisle',
        streamFps: 28,
        resolution: '1080p',
      },
      {
        id: 'cam-03',
        name: 'Checkout POS Queue Sensor',
        cameraId: 'RET-89A3',
        zoneType: 'checkout',
        streamFps: 30,
        resolution: '1080p',
      },
      {
        id: 'cam-04',
        name: 'Backroom Inventory Gateway',
        cameraId: 'RET-89A4',
        zoneType: 'storage',
        streamFps: 25,
        resolution: '720p',
      },
      {
        id: 'cam-05',
        name: 'Side Exit Pedestrian Sensor',
        cameraId: 'RET-89A5',
        zoneType: 'entrance',
        streamFps: 20,
        resolution: '720p',
      },
    ],
  },
};

export const mockSettingsService = {
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return { ...defaultSettings, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Failed to read settings from localStorage', e);
    }
    return defaultSettings;
  },

  async saveSettings(settings: AppSettings): Promise<AppSettings> {
    // Simulated async network delay for drop-in backend API swap
    await new Promise((resolve) => setTimeout(resolve, 150));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to persist settings', e);
    }
    return settings;
  },

  async updateProfile(profile: Partial<StoreProfileSettings>): Promise<AppSettings> {
    const current = this.getSettings();
    const updated: AppSettings = {
      ...current,
      profile: { ...current.profile, ...profile },
    };
    return this.saveSettings(updated);
  },

  async updatePreferences(preferences: Partial<StorePreferencesSettings>): Promise<AppSettings> {
    const current = this.getSettings();
    const updated: AppSettings = {
      ...current,
      preferences: { ...current.preferences, ...preferences },
    };
    return this.saveSettings(updated);
  },

  async updateHardware(hardware: Partial<StoreHardwareSettings>): Promise<AppSettings> {
    const current = this.getSettings();
    const updated: AppSettings = {
      ...current,
      hardware: { ...current.hardware, ...hardware },
    };
    return this.saveSettings(updated);
  },
};
