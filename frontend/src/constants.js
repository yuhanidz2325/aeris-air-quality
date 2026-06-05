export const POLUTAN_CONFIG = {
  pm25: { label: 'PM2.5', unit: 'µg/m³', color: '#16A34A', batas: 55    },
  pm10: { label: 'PM10',  unit: 'µg/m³', color: '#2563EB', batas: 150   },
  co:   { label: 'CO',    unit: 'µg/m³', color: '#D97706', batas: 10000 },
  no2:  { label: 'NO₂',   unit: 'µg/m³', color: '#7C3AED', batas: 200   },
  o3:   { label: 'O₃',    unit: 'µg/m³', color: '#BE123C', batas: 235   },
};

export const ISPU_THRESHOLDS = {
  pm25: { low: 55,    medium: 100,   high: 150   },
  pm10: { low: 150,   medium: 250,   high: 350   },
  co:   { low: 10000, medium: 20000, high: 30000 },
  no2:  { low: 200,   medium: 400,   high: 600   },
  o3:   { low: 235,   medium: 400,   high: 600   },
};

export const ISPU_CATEGORY_CONFIG = {
  'Baik':               { bg: '#DCFCE7', border: '#86EFAC', text: '#14532D', dot: '#22C55E' },
  'Sedang':             { bg: '#FEF9C3', border: '#FDE047', text: '#713F12', dot: '#EAB308' },
  'Tidak Sehat':        { bg: '#FEF3C7', border: '#FCD34D', text: '#78350F', dot: '#F59E0B' },
  'Sangat Tidak Sehat': { bg: '#FEE2E2', border: '#FCA5A5', text: '#7F1D1D', dot: '#EF4444' },
  'Berbahaya':          { bg: '#1E1B4B', border: '#4338CA', text: '#E0E7FF', dot: '#818CF8' },
};

// Tambahan yang diperlukan (opsional)
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:8000"
};

export const TIME_SEGMENTS = {
  PAGI: { label: "Pagi", hours: "06:00 - 11:59", icon: "🌅" },
  SIANG: { label: "Siang", hours: "12:00 - 17:59", icon: "☀️" },
  SORE_MALAM: { label: "Sore/Malam", hours: "18:00 - 05:59", icon: "🌙" }
};