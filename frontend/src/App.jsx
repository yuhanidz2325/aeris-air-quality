import LandingPage from './pages/LandingPage';
import React, { useState, useEffect, useRef } from 'react';
import CardPredict from './components/CardPredict';
import TrendChart from './components/TrendChart';
import GrafikTren from './components/GrafikTren';
import Edukasi from './components/Edukasi';
import Prediksi from './components/Prediksi';
import KondisiData from './components/KondisiData';
import DeteksiAnomali from './components/DeteksiAnomali';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const BASE_URL = import.meta.env.VITE_API_URL;

const ISPU_CONFIG = {
  "Baik":              { bg: "#E1F5EE", border: "#5DCAA5", text: "#085041", dot: "#1D9E75" },
  "Sedang":            { bg: "#E6F1FB", border: "#85B7EB", text: "#0C447C", dot: "#378ADD" },
  "Tidak Sehat":       { bg: "#FAEEDA", border: "#EF9F27", text: "#633806", dot: "#BA7517" },
  "Sangat Tidak Sehat":{ bg: "#FCEBEB", border: "#F09595", text: "#791F1F", dot: "#E24B4A" },
  "Berbahaya":         { bg: "#2C2C2A", border: "#444441", text: "#F1EFE8", dot: "#888780" },
};

function getIspuConfig(category) {
  return ISPU_CONFIG[category] || ISPU_CONFIG["Baik"];
}

const TABS = [
  { key: 'beranda',  label: 'Beranda',      icon: '🏠' },
  { key: 'grafik',   label: 'Grafik & Tren', icon: '📈' },
  { key: 'anomali',  label: 'Anomali',       icon: '⚠️' },
  { key: 'prediksi', label: 'Prediksi',      icon: '🔮' },
  { key: 'data',     label: 'Kondisi Data',  icon: '🗄️' },
  { key: 'edukasi', label: 'Edukasi', icon: '📚' },
];

function IspuPanel({ ispuStatus }) {
  if (!ispuStatus || ispuStatus.length === 0) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
        {["PM2.5","PM10","CO","NO₂","O₃"].map(p => (
          <div key={p} style={{ background: '#F1EFE8', border: '0.5px solid #D3D1C7', borderRadius: 8, padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: '#888780', marginBottom: 2 }}>{p}</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: '#D3D1C7' }}>—</div>
            <div style={{ fontSize: 10, color: '#D3D1C7', marginTop: 3 }}>Memuat...</div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
      {ispuStatus.map((item) => {
        const cfg = getIspuConfig(item.category);
        return (
          <div key={item.parameter} style={{ background: cfg.bg, border: `0.5px solid ${cfg.border}`, borderRadius: 8, padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: cfg.text, marginBottom: 2 }}>{item.parameter?.toUpperCase()}</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: cfg.text, lineHeight: 1.1 }}>{Math.round(item.value)}</div>
            <div style={{ fontSize: 10, color: cfg.text, marginTop: 3 }}>{item.category}</div>
          </div>
        );
      })}
    </div>
  );
}

function SegmentPanel({ segment }) {
  const now = new Date().getHours();
  const segments = [
    { key: "PAGI",       label: "Pagi",       icon: "☀️",  time: "06:00 – 11:59 WIB" },
    { key: "SIANG",      label: "Siang",      icon: "🌤️", time: "12:00 – 17:59 WIB" },
    { key: "SORE_MALAM", label: "Sore/Malam", icon: "🌙",  time: "18:00 – 05:59 WIB" },
  ];
  const activeKey = now >= 6 && now < 12 ? "PAGI" : now >= 12 && now < 18 ? "SIANG" : "SORE_MALAM";
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
      {segments.map(seg => {
        const isActive = activeKey === seg.key;
        return (
          <div key={seg.key} style={{ borderRadius: 8, padding: 12, border: isActive ? '1.5px solid #1D9E75' : '0.5px solid #D3D1C7', background: isActive ? '#E1F5EE' : '#F1EFE8' }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#2C2C2A' }}>{seg.icon} {seg.label}</div>
            <div style={{ fontSize: 10, color: '#888780', margin: '2px 0 6px' }}>{seg.time}</div>
            {segment === seg.key
              ? <span style={{ fontSize: 13, color: '#1D9E75' }}>Model aktif saat ini</span>
              : <span style={{ fontSize: 11, color: '#888780' }}>—</span>}
            {isActive && (
              <span style={{ display: 'inline-block', fontSize: 10, padding: '2px 8px', borderRadius: 20, marginTop: 6, background: '#E1F5EE', color: '#085041', border: '0.5px solid #5DCAA5' }}>Sekarang</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Hero Summary Card Component
function HeroSummary({ statusData, loading }) {
  const category  = statusData?.ispu_status?.[0]?.category ?? "Baik";
  const ispuValue = statusData?.ispu_status?.[0]?.value ?? "—";
  const isAnomali = statusData?.anomaly_detected === true;
  const pollutants = statusData?.pollutants || {};
  
  // Cari polutan dominan (nilai ISPU tertinggi)
  const dominantPolutan = statusData?.ispu_status?.[0]?.parameter ?? "—";
  
  // Prediksi trend (simplified)
  const predTrend = "Stabil";
  
  // Jumlah anomali (simulasi)
  const anomalyCount = isAnomali ? 2 : 0;
  
  const cfg = getIspuConfig(category);

  return (
    <div style={{
      background: `linear-gradient(135deg, ${cfg.bg} 0%, #FFFFFF 100%)`,
      border: `1.5px solid ${cfg.border}`,
      borderRadius: 16,
      padding: 24,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 120, height: 120, borderRadius: '50%',
        background: `${cfg.dot}15`,
        zIndex: 0
      }} />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              Kualitas Udara Surabaya Hari Ini
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                fontSize: 16, fontWeight: 700, color: cfg.text,
                padding: '4px 16px', borderRadius: 8,
                background: cfg.bg, border: `1px solid ${cfg.border}`
              }}>
                {loading ? 'Memuat...' : category}
              </span>
              {isAnomali && (
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  padding: '3px 10px', borderRadius: 20,
                  background: '#FAEEDA', color: '#633806',
                  border: '0.5px solid #EF9F27',
                  animation: 'pulse 2s infinite'
                }}>
                  ⚠️ Anomali Terdeteksi
                </span>
              )}
            </div>
          </div>
          
          {/* ISPU Value - Large */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 42, fontWeight: 700, color: cfg.text, lineHeight: 1 }}>
              {loading ? '—' : Math.round(ispuValue)}
            </div>
            <div style={{ fontSize: 12, color: '#888780', marginTop: 4 }}>Nilai ISPU</div>
          </div>
        </div>

        {/* Summary Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Polutan Dominan', value: dominantPolutan, icon: '🎯', color: '#378ADD' },
            { label: 'Prediksi 3 Jam', value: predTrend, icon: '📊', color: '#1D9E75' },
            { label: 'Anomali Hari Ini', value: `${anomalyCount} titik`, icon: '🔍', color: isAnomali ? '#F59E0B' : '#1D9E75' },
            { label: 'Status', value: isAnomali ? 'Waspada' : 'Aman', icon: isAnomali ? '⚠️' : '✅', color: isAnomali ? '#F59E0B' : '#1D9E75' },
          ].map((item) => (
            <div key={item.label} style={{
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 12,
              padding: 14,
              borderLeft: `3px solid ${item.color}`
            }}>
              <div style={{ fontSize: 16, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#1F2937' }}>{loading ? '...' : item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Sparkline Mini Chart Component
function SparklineChart({ data, color, height = 40 }) {
  if (!data || data.length === 0) return null;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((val - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height, overflow: 'visible' }}>
      <defs>
        <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.05 }} />
        </linearGradient>
      </defs>
      <polygon
        points={`0,100 ${points} 100,100`}
        fill={`url(#grad-${color})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function TabBeranda({ statusData, loading }) {
  const category   = statusData?.ispu_status?.[0]?.category ?? "Baik";
  const ispuValue  = statusData?.ispu_status?.[0]?.value ?? "—";
  const ispuStatus = statusData?.ispu_status ?? [];
  const segment    = statusData?.segment ?? "";
  const isAnomali  = statusData?.anomaly_detected === true;
  const pollutants = statusData?.pollutants || {};

  const sectionTitle = { fontSize: 11, fontWeight: 500, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 };

  // Mock sparkline data (akan diganti dengan data history real)
  const sparklineData = {
    pm25: [35, 38, 42, 39, 45, 41, 38, 42, 44, 40],
    pm10: [60, 65, 70, 68, 72, 69, 66, 71, 68, 65],
    co: [800, 850, 900, 870, 920, 880, 860, 910, 890, 870],
    no2: [45, 48, 52, 50, 55, 51, 49, 53, 50, 48],
    o3: [120, 125, 130, 128, 135, 132, 127, 133, 130, 128],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      
      {/* HERO SUMMARY CARD */}
      <HeroSummary statusData={statusData} loading={loading} />

      {/* ISPU Panel */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 20px' }}>
        <div style={sectionTitle}>Panel ISPU Terkini per Polutan</div>
        <IspuPanel ispuStatus={ispuStatus} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
          {Object.entries(ISPU_CONFIG).map(([label, cfg]) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#5F5E5A' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }}></span>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Segmentasi Waktu */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 20px' }}>
        <div style={sectionTitle}>Segmentasi Waktu</div>
        <SegmentPanel segment={segment} />
      </div>

      {/* Pollutant Cards with Sparklines */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 20px' }}>
        <div style={sectionTitle}>Polutan Terkini dengan Tren</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {[
            { key: 'pm25', label: 'PM2.5', value: pollutants.pm25, unit: 'µg/m³', color: '#1D9E75' },
            { key: 'pm10', label: 'PM10', value: pollutants.pm10, unit: 'µg/m³', color: '#378ADD' },
            { key: 'co', label: 'CO', value: pollutants.co, unit: 'µg/m³', color: '#EF9F27' },
            { key: 'no2', label: 'NO₂', value: pollutants.no2, unit: 'µg/m³', color: '#534AB7' },
            { key: 'o3', label: 'O₃', value: pollutants.o3, unit: 'µg/m³', color: '#E24B4A' },
          ].map((p) => (
            <div key={p.key} style={{
              background: '#F8FAFC',
              border: '1px solid #E5E7EB',
              borderRadius: 12,
              padding: 14,
              borderTop: `3px solid ${p.color}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>{p.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#1F2937', lineHeight: 1.1 }}>
                    {loading ? '—' : Math.round(p.value || 0)}
                  </div>
                  <div style={{ fontSize: 11, color: '#888780' }}>{p.unit}</div>
                </div>
                <div style={{ fontSize: 18 }}>{p.color === '#1D9E75' ? '🌿' : p.color === '#378ADD' ? '💨' : p.color === '#EF9F27' ? '🔶' : p.color === '#534AB7' ? '🟣' : '🔴'}</div>
              </div>
              {/* Mini Sparkline */}
              <div style={{ height: 35, marginTop: 8 }}>
                <SparklineChart data={sparklineData[p.key]} color={p.color} height={35} />
              </div>
              <div style={{ fontSize: 10, color: '#888780', textAlign: 'center', marginTop: 4 }}>
                Tren 10 jam terakhir
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prediksi & Ringkasan */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 16px' }}>
          <div style={sectionTitle}>Prediksi PM2.5 — 3 Jam Ke Depan</div>
          <CardPredict baseUrl={BASE_URL} />
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 16px' }}>
          <div style={sectionTitle}>Ringkasan Hari Ini</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Kategori ISPU', val: loading ? '...' : category },
              { label: 'Nilai ISPU',    val: loading ? '...' : Math.round(ispuValue) },
              { label: 'Anomali',       val: loading ? '...' : (isAnomali ? 'Terdeteksi' : 'Tidak ada') },
              { label: 'Segmen Aktif',  val: loading ? '...' : (segment || '—') },
            ].map(item => (
              <div key={item.label} style={{ background: '#F1EFE8', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 11, color: '#888780', marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#2C2C2A' }}>{item.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tren 7 Hari */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 16px' }}>
        <div style={sectionTitle}>Tren PM2.5 — 7 Hari Terakhir</div>
        <TrendChart baseUrl={BASE_URL} />
      </div>
    </div>
  );
}

function TabPlaceholder({ icon, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', background: '#FFFFFF', border: '0.5px solid #D3D1C7', borderRadius: 12 }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 500, color: '#2C2C2A', marginBottom: 6 }}>Tab {label}</div>
      <div style={{ fontSize: 13, color: '#888780' }}>Sedang dalam pengerjaan </div>
    </div>
  );
}

function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeTab, setActiveTab]   = useState('beranda');
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isSyncing, setIsSyncing]   = useState(false);
  const [nextRefresh, setNextRefresh] = useState(60);
  const syncTimeoutRef = useRef(null);

  async function loadStatus() {
    setIsSyncing(true);
    try {
      const res  = await fetch(`${BASE_URL}/status/surabaya`);
      const data = await res.json();
      setStatusData(data);
      setLastUpdate(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error("Gagal fetch status:", err);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }

  // Countdown timer for next refresh
  useEffect(() => {
    if (nextRefresh > 0) {
      const timer = setTimeout(() => setNextRefresh(nextRefresh - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      loadStatus();
      setNextRefresh(60);
    }
  }, [nextRefresh]);

  useEffect(() => {
    loadStatus();
  }, []);

  if (!showDashboard) {
  return (
    <LandingPage
      onEnter={() => setShowDashboard(true)}
    />
  );
}
  return (
    <div style={{ minHeight: '100vh', background: '#F6FAF8', color: '#1F2937'}}>

      <nav style={{ background: '#FFFFFF', borderBottom: '0.5px solid #E5E7EB', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: '#E1F5EE', border: '0.5px solid #5DCAA5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💨</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#2C2C2A' }}>Aeris — Pemantauan Kualitas Udara</div>
            <div style={{ fontSize: 11, color: '#888780' }}>Kota Surabaya · -7.2575, 112.7521</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* LIVE Badge with pulse animation */}
          <span style={{ 
            fontSize: 11, 
            padding: '3px 10px', 
            borderRadius: 20, 
            fontWeight: 600, 
            background: '#FCEBEB', 
            color: '#E24B4A', 
            border: '0.5px solid #F09595', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 6,
            animation: 'pulse 2s infinite'
          }}>
            <span style={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              background: '#E24B4A', 
              display: 'inline-block',
              animation: 'pulseDot 2s infinite'
            }}></span>
            LIVE
          </span>
          {/* Syncing indicator */}
          {isSyncing && (
            <span style={{ 
              fontSize: 11, 
              padding: '3px 10px', 
              borderRadius: 20, 
              fontWeight: 500, 
              background: '#E6F1FB', 
              color: '#0C447C', 
              border: '0.5px solid #85B7EB',
              display: 'flex',
              alignItems: 'center',
              gap: 5
            }}>
              <span style={{ 
                width: 10, 
                height: 10, 
                border: '2px solid #85B7EB', 
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                display: 'inline-block'
              }}></span>
              Sinkronisasi...
            </span>
          )}
          {/* Last update time */}
          <span style={{ 
            fontSize: 11, 
            padding: '3px 10px', 
            borderRadius: 20, 
            background: '#F1EFE8', 
            color: '#5F5E5A',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            🕐 {lastUpdate ? `${lastUpdate} WIB` : 'Memuat...'}
          </span>
          {/* Next refresh countdown */}
          <span style={{ fontSize: 11, color: '#888780' }}>
            Refresh dalam {nextRefresh}s
          </span>
        </div>
      </nav>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '220px 1fr',
          minHeight: 'calc(100vh - 72px)'
        }}
      >
        {/* Sidebar kiri */}
        <aside
          style={{
            background: '#F8FCFA',
            borderRight: '0.5px solid #D3D1C7',
            padding: '20px 14px'
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: '#888780',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 14,
              paddingLeft: 8
            }}
          >
            Navigasi
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            }}
          >
            {TABS.map((tab) => {
              const active = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    width: '100%',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: 10,
                    padding: '12px 14px',
                    textAlign: 'left',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: active
                      ? '#DDF4EA'
                      : 'transparent',
                    color: active
                      ? '#15803D'
                      : '#4B5563',
                    fontWeight: active ? 600 : 400
                  }}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Content kanan */}
        <main
          style={{
            padding: '18px 24px'
          }}
        >
          {activeTab === 'beranda' && (
            <TabBeranda
              statusData={statusData}
              loading={loading}
            />
          )}

          {activeTab === 'grafik' && (
            <GrafikTren baseUrl={BASE_URL} />
          )}

          {activeTab === 'anomali' && (
            <DeteksiAnomali baseUrl={BASE_URL} />
          )}

          {activeTab === 'prediksi' && (
            <Prediksi />
          )}

          {activeTab === 'data' && (
            <KondisiData lastUpdate={lastUpdate} />
          )}

          {activeTab === 'edukasi' && <Edukasi />}
        </main>
      </div>


      <div style={{ padding: '8px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: '#888780' }}>🔄 Auto-refresh tiap 60 menit · Sumber data: Open-Meteo Air Quality API</span>
        <span style={{ fontSize: 11, color: '#888780' }}>Kelompok Aeris · PENS 2026</span>
      </div>

    </div>
  );
}

export default App;