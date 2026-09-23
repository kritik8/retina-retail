// ─── Cloudflare R2 Camera Video Configuration ─────────────────────────────────
//
// Public bucket base: https://pub-68d2604e65f74d62b6735ef7a371c82a.r2.dev
// Object path layout: CAM Videos/CAM {N}.mp4  (folder + filenames have spaces)
//
// R2 does NOT support renaming via the public URL or dashboard — files stay at
// their uploaded keys. Both path segments must be percent-encoded so spaces
// don't break the browser URL parser.
//
// CORS: The R2 bucket CORS policy must allow:
//   - https://<your-deployed-frontend>.pages.dev  (production domain)
//   - http://localhost:5173  (Vite dev server)
// See: Cloudflare dashboard -> R2 -> bucket -> Settings -> CORS policy
// ─────────────────────────────────────────────────────────────────────────────

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

/**
 * Single source of truth for camera -> video URL mapping.
 * Update filenames here if the R2 objects are ever renamed/moved.
 */
export const CAMERA_VIDEO_CONFIG: CameraVideoConfig[] = [
  {
    cameraId: 'cam-1',
    name: 'Beauty & Skincare Section',
    r2Url: r2Url('CAM Videos', 'CAM 1.mp4'),
    // => https://pub-68d2604e65f74d62b6735ef7a371c82a.r2.dev/CAM%20Videos/CAM%201.mp4
  },
  {
    cameraId: 'cam-2',
    name: 'Main Entrance',
    r2Url: r2Url('CAM Videos', 'CAM 2.mp4'),
    // => https://pub-68d2604e65f74d62b6735ef7a371c82a.r2.dev/CAM%20Videos/CAM%202.mp4
  },
  {
    cameraId: 'cam-3',
    name: 'Accessories & Display Wall',
    r2Url: r2Url('CAM Videos', 'CAM 3.mp4'),
    // => https://pub-68d2604e65f74d62b6735ef7a371c82a.r2.dev/CAM%20Videos/CAM%203.mp4
  },
  {
    cameraId: 'cam-4',
    name: 'Checkout Counter',
    r2Url: r2Url('CAM Videos', 'CAM 4.mp4'),
    // => https://pub-68d2604e65f74d62b6735ef7a371c82a.r2.dev/CAM%20Videos/CAM%204.mp4
  },
  {
    cameraId: 'cam-5',
    name: 'Fragrance & Gifting Aisle',
    r2Url: r2Url('CAM Videos', 'CAM 5.mp4'),
    // => https://pub-68d2604e65f74d62b6735ef7a371c82a.r2.dev/CAM%20Videos/CAM%205.mp4
  },
];

/** Quick lookup: cameraId -> R2 URL string */
export const CAMERA_R2_URL: Record<string, string> = Object.fromEntries(
  CAMERA_VIDEO_CONFIG.map((c) => [c.cameraId, c.r2Url])
);
