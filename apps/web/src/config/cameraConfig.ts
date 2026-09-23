// ─── Camera Configuration (Cloudflare R2 & ESP32 Hardware Stream) ─────────
//
// CAMERA_MODE: 'demo' (5 R2-hosted beauty store videos) or 'hardware' (1 live ESP32-CAM feed)
// Controlled by environment variable VITE_CAMERA_MODE ('demo' | 'hardware')
// ─────────────────────────────────────────────────────────────────────────────

export const CAMERA_MODE: 'demo' | 'hardware' = (
  (import.meta.env.VITE_CAMERA_MODE as string) || 'demo'
).toLowerCase().trim() as 'demo' | 'hardware';

const R2_BASE = 'https://pub-68d2604e65f74d62b6735ef7a371c82a.r2.dev';

// Individually percent-encode each path segment (so spaces -> %20)
const r2Url = (folder: string, filename: string) =>
  `${R2_BASE}/${encodeURIComponent(folder)}/${encodeURIComponent(filename)}`;

export interface CameraVideoConfig {
  /** Internal camera ID used throughout the app (cam-1 ... cam-5) */
  cameraId: string;
  /** Display name shown in the UI */
  name: string;
  /** Fully-qualified, percent-encoded Cloudflare R2 public URL */
  r2Url: string;
}

export interface CameraItem {
  id: string;
  name: string;
  zone: string;
  description: string;
  position: string;
  r2Url?: string;
  isLiveHardware?: boolean;
}

// 5 R2-hosted Demo Cameras
export const DEMO_CAMERAS: CameraItem[] = [
  {
    id: 'cam-1',
    name: 'Beauty & Skincare Section',
    zone: 'Zone A — Skincare & Face Products',
    description: 'Primary skincare and face product aisle. Tracks dwell time and engagement at product shelves.',
    position: 'Ceiling mount, aisle mid-point',
    r2Url: r2Url('CAM Videos', 'CAM 1.mp4'),
  },
  {
    id: 'cam-2',
    name: 'Main Entrance',
    zone: 'Zone B — Store Entry',
    description: 'Store entrance and entry corridor. Captures all incoming footfall.',
    position: 'Front entrance, overhead',
    r2Url: r2Url('CAM Videos', 'CAM 2.mp4'),
  },
  {
    id: 'cam-3',
    name: 'Accessories & Display Wall',
    zone: 'Zone C — Accessories',
    description: 'Wall display and accessories section. Monitors browsing and pickup patterns.',
    position: 'Back wall camera, angled',
    r2Url: r2Url('CAM Videos', 'CAM 3.mp4'),
  },
  {
    id: 'cam-4',
    name: 'Checkout Counter',
    zone: 'Zone D — Billing & Checkout',
    description: 'Checkout area. Tracks queue depth and billing wait times.',
    position: 'Ceiling above checkout desk',
    r2Url: r2Url('CAM Videos', 'CAM 4.mp4'),
  },
  {
    id: 'cam-5',
    name: 'Fragrance & Gifting Aisle',
    zone: 'Zone E — Fragrances & Gifts',
    description: 'Premium fragrance and gift product section. Monitors dwell and conversion.',
    position: 'Side wall mount, eye-level angle',
    r2Url: r2Url('CAM Videos', 'CAM 5.mp4'),
  },
];

// Single Live ESP32 Hardware Camera
export const HARDWARE_CAMERAS: CameraItem[] = [
  {
    id: 'cam-1',
    name: 'CAM-1 · Live Hardware Feed',
    zone: 'Zone A — Live Hardware Sensor',
    description: 'Direct ESP32-CAM WiFi AP stream (192.168.4.1) with real-time YOLOv8 person tracking.',
    position: 'ESP32-CAM Optical Sensor (AP Mode)',
    isLiveHardware: true,
  },
];

/** Active camera list according to VITE_CAMERA_MODE */
export const ACTIVE_CAMERAS: CameraItem[] =
  CAMERA_MODE === 'hardware' ? HARDWARE_CAMERAS : DEMO_CAMERAS;

/** Legacy / Demo video config compatibility */
export const CAMERA_VIDEO_CONFIG: CameraVideoConfig[] = DEMO_CAMERAS.map((c) => ({
  cameraId: c.id,
  name: c.name,
  r2Url: c.r2Url || '',
}));

/** Quick lookup: cameraId -> R2 URL string */
export const CAMERA_R2_URL: Record<string, string> = Object.fromEntries(
  DEMO_CAMERAS.map((c) => [c.id, c.r2Url || ''])
);

/** Zone Metadata Lookup */
export const CAMERA_ZONE_INFO: Record<string, { zoneName: string; areaType: string }> =
  CAMERA_MODE === 'hardware'
    ? {
        'cam-1': { zoneName: 'Zone A · Live ESP32 Sensor', areaType: 'Hardware Stream (AP 192.168.4.1)' },
      }
    : {
        'cam-1': { zoneName: 'Zone A · Skincare & Cosmetics', areaType: 'Display Shelves' },
        'cam-2': { zoneName: 'Zone B · Store Entry', areaType: 'Threshold & Turnstiles' },
        'cam-3': { zoneName: 'Zone C · Accessories Wall', areaType: 'Perimeter Racks' },
        'cam-4': { zoneName: 'Zone D · Checkout Queue', areaType: 'POS Counters 1-4' },
        'cam-5': { zoneName: 'Zone E · Fragrances & Gifts', areaType: 'Feature Gondola' },
      };

