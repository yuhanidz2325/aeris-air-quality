import React, { useState, useEffect } from 'react';
import CardPredict from './components/CardPredict';
import TrendChart from './components/TrendChart';

const BASE_URL = "https://web-production-8b53f.up.railway.app";

// ── Warna ISPU sesuai standar KLHK ──────────────────────────
const ISPU_CONFIG = {
  "Baik":             { bg: "#E1F5EE", border: "#5DCAA5", text: "#085041", dot: "#1D9E75" },
  "Sedang":           { bg: "#E6F1FB", border: "#85B7EB", text: "#0C447C", dot: "#378ADD" },
  "Tidak Sehat":      { bg: "#FAEEDA", border: "#EF9F27", text: "#633806", dot: "#BA7517" },
  "Sangat Tidak Sehat":{ bg: "#FCEBEB", border: "#F09595", text: "#791F1F", dot: "#E24B4A" },
  "Berbahaya":        { bg: "#2C2C2A", border: "#444441", text: "#F1EFE8", dot: "#888780" },
};

function getIspuConfig(category) {
  return ISPU_CONFIG[category] || ISPU_CONFIG["Baik"];
}

// ── Panel ISPU 5 polutan ─────────────────────────────────────
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
          <div key={item.parameter} style={{
            background: cfg.bg,
            border: `0.5px solid ${cfg.border}`,
            borderRadius: 8, padding: '10px 8px', textAlign: 'center'
          }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: cfg.text, marginBottom: 2 }}>
              {item.parameter}
            </div>
            <div style={{ fontSize: 22, fontWeight: 500, color: cfg.text, lineHeight: 1.1 }}>
              {Math.round(item.value)}
            </div>
            <div style={{ fontSize: 10, color: cfg.text, marginTop: 3 }}>
              {item.category}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Panel segmentasi waktu ───────────────────────────────────
function SegmentPanel({ segment }) {
  const now = new Date().getHours();
  const segments = [
    { key: "PAGI",       label: "Pagi",       icon: "☀️",  time: "06:00 – 11:59 WIB", range: [6, 12] },
    { key: "SIANG",      label: "Siang",      icon: "🌤️", time: "12:00 – 17:59 WIB", range: [12, 18] },
    { key: "SORE_MALAM", label: "Sore/Malam", icon: "🌙", time: "18:00 – 05:59 WIB", range: [18, 6] },
  ];

  const activeKey = now >= 6 && now < 12 ? "PAGI" : now >= 12 && now < 18 ? "SIANG" : "SORE_MALAM";

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
      {segments.map(seg => {
        const isActive = activeKey === seg.key;
        return (
          <div key={seg.key} style={{
            borderRadius: 8, padding: 12,
            border: isActive ? '1.5px solid #1D9E75' : '0.5px solid #D3D1C7',
            background: isActive ? '#E1F5EE' : '#F1EFE8',
          }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#2C2C2A' }}>
              {seg.icon} {seg.label}
            </div>
            <div style={{ fontSize: 10, color: '#888780', margin: '2px 0 6px' }}>{seg.time}</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: '#2C2C2A' }}>
              {segment === seg.key ? (
                <span style={{ fontSize: 13, color: '#1D9E75' }}>Segmen aktif saat ini</span>
              ) : (
                <span style={{ fontSize: 11, color: '#888780' }}>—</span>
              )}
            </div>
            {isActive && (
              <span style={{
                display: 'inline-block', fontSize: 10, padding: '2px 8px',
                borderRadius: 20, marginTop: 6,
                background: '#E1F5EE', color: '#085041', border: '0.5px solid #5DCAA5'
              }}>Sekarang</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Komponen utama App ───────────────────────────────────────
function App() {
  const [statusData, setStatusData]   = useState(null);
  const [loading, setLoading]         = useState(true);
  const [lastUpdate, setLastUpdate]   = useState(null);

  async function loadStatus() {
    try {
      const res  = await fetch(`${BASE_URL}/status/surabaya`);
      const data = await res.json();
      setStatusData(data);
      setLastUpdate(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error("Gagal fetch status:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 60 * 60 * 1000); // refresh tiap 1 jam
    return () => clearInterval(interval);
  }, []);

  const category    = statusData?.ispu_status?.[0]?.category ?? "Baik";
  const ispuValue   = statusData?.ispu_status?.[0]?.value ?? "—";
  const ispuStatus  = statusData?.ispu_status ?? [];
  const segment     = statusData?.segment ?? "";
  const isAnomali   = statusData?.anomaly_detected === true;

  const alertStyle = isAnomali
    ? { background: '#FAEEDA', border: '0.5px solid #EF9F27' }
    : { background: '#E1F5EE', border: '0.5px solid #5DCAA5' };

  const alertIcon  = isAnomali ? '⚠️' : '✅';
  const alertTitle = isAnomali ? 'Anomali terdeteksi!' : 'Status udara saat ini: Normal';
  const alertSub   = isAnomali
    ? 'Terdapat lonjakan polutan tidak wajar · Harap waspada'
    : 'Tidak ada anomali terdeteksi · Aman beraktivitas di luar ruangan';
  const alertTitleColor = isAnomali ? '#633806' : '#085041';
  const alertSubColor   = isAnomali ? '#854F0B' : '#1D9E75';

  return (
    <div style={{ minHeight: '100vh', background: '#F1EFE8' }}>

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav style={{
        background: '#fff', borderBottom: '0.5px solid #D3D1C7',
        padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: '#E1F5EE', border: '0.5px solid #5DCAA5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18
          }}>💨</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#2C2C2A' }}>
              Aeris — Pemantauan Kualitas Udara
            </div>
            <div style={{ fontSize: 11, color: '#888780' }}>Kota Surabaya · -7.2575, 112.7521</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 500,
            background: '#E1F5EE', color: '#085041', border: '0.5px solid #5DCAA5',
            display: 'flex', alignItems: 'center', gap: 5
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1D9E75', display: 'inline-block' }}></span>
            Sistem aktif
          </span>
          <span style={{ fontSize: 11, color: '#888780' }}>
            {lastUpdate ? `Diperbarui ${lastUpdate} WIB` : 'Memuat...'}
          </span>
        </div>
      </nav>

      {/* ── Konten Utama ───────────────────────────────────── */}
      <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Alert status */}
        <div style={{ ...alertStyle, borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>{alertIcon}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: alertTitleColor }}>
              {loading ? 'Memuat data...' : alertTitle}
            </div>
            <div style={{ fontSize: 11, color: alertSubColor, marginTop: 1 }}>
              {loading ? 'Menghubungkan ke API...' : alertSub}
            </div>
          </div>
          {!loading && (
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#888780' }}>ISPU tertinggi</div>
              <div style={{ fontSize: 18, fontWeight: 500, color: '#2C2C2A' }}>{ispuValue}</div>
              <div style={{ fontSize: 11, color: '#888780' }}>{category}</div>
            </div>
          )}
        </div>

        {/* Panel ISPU */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Panel ISPU terkini per polutan
          </div>
          <IspuPanel ispuStatus={ispuStatus} />
          {/* Legenda */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
            {Object.entries(ISPU_CONFIG).map(([label, cfg]) => (
              <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#5F5E5A' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.dot, display: 'inline-block', flexShrink: 0 }}></span>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Segmentasi waktu */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Segmentasi waktu
          </div>
          <SegmentPanel segment={segment} />
        </div>

        {/* Prediksi & ringkasan */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 500, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              Prediksi PM2.5 — 3 jam ke depan
            </div>
            <CardPredict baseUrl={BASE_URL} />
          </div>
          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 500, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              Ringkasan hari ini
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Kategori ISPU', val: loading ? '...' : category },
                { label: 'Nilai ISPU', val: loading ? '...' : ispuValue },
                { label: 'Anomali', val: loading ? '...' : (isAnomali ? 'Terdeteksi' : 'Tidak ada') },
                { label: 'Segmen aktif', val: loading ? '...' : (segment || '—') },
              ].map(item => (
                <div key={item.label} style={{ background: '#F1EFE8', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, color: '#888780', marginBottom: 3 }}>{item.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: '#2C2C2A' }}>{item.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grafik tren */}
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 500, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
            Tren PM2.5 — 7 hari terakhir
          </div>
          <TrendChart baseUrl={BASE_URL} />
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
          <span style={{ fontSize: 11, color: '#888780' }}>
            🔄 Auto-refresh tiap 60 menit · Sumber data: Open-Meteo Air Quality API
          </span>
          <span style={{ fontSize: 11, color: '#888780' }}>
            Kelompok Aeris · PENS 2026
          </span>
        </div>

      </div>
    </div>
  );
}

export default App;
