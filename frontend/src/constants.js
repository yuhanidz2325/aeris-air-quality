// ── Shared constants for AERIS Air Quality Dashboard ──────────────────────────
// Single source of truth — import from here instead of defining locally.

/**
 * Configuration for each pollutant:
 * label    — display name
 * unit     — measurement unit
 * color    — chart / UI color
 * batas    — safe-limit threshold (used for ReferenceLine in charts)
 */
export const POLUTAN_CONFIG = {
  pm25: { label: 'PM2.5', unit: 'µg/m³', color: '#1D9E75', batas: 55 },
  pm10: { label: 'PM10',  unit: 'µg/m³', color: '#378ADD', batas: 150 },
  co:   { label: 'CO',    unit: 'µg/m³', color: '#EF9F27', batas: 10000 },
  no2:  { label: 'NO₂',  unit: 'µg/m³', color: '#534AB7', batas: 200 },
  o3:   { label: 'O₃',   unit: 'µg/m³', color: '#E24B4A', batas: 235 },
};

/**
 * ISPU category thresholds per pollutant.
 * Used by anomaly detection severity classification and ISPU calculation.
 * Values are concentration breakpoints (µg/m³) for each severity level.
 */
export const ISPU_THRESHOLDS = {
  pm25: { low: 55,    medium: 100,   high: 150 },
  pm10: { low: 150,   medium: 250,   high: 350 },
  co:   { low: 10000, medium: 20000, high: 30000 },
  no2:  { low: 200,   medium: 400,   high: 600 },
  o3:   { low: 235,   medium: 400,   high: 600 },
};

/**
 * ISPU category display config (colors, labels).
 * Used in App.jsx IspuPanel and HeroSummary.
 */
export const ISPU_CATEGORY_CONFIG = {
  'Baik':               { bg: '#E1F5EE', border: '#5DCAA5', text: '#085041', dot: '#1D9E75' },
  'Sedang':             { bg: '#E6F1FB', border: '#85B7EB', text: '#0C447C', dot: '#378ADD' },
  'Tidak Sehat':        { bg: '#FAEEDA', border: '#EF9F27', text: '#633806', dot: '#BA7517' },
  'Sangat Tidak Sehat': { bg: '#FCEBEB', border: '#F09595', text: '#791F1F', dot: '#E24B4A' },
  'Berbahaya':          { bg: '#2C2C2A', border: '#444441', text: '#F1EFE8', dot: '#888780' },
};
