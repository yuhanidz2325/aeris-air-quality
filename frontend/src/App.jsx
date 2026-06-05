import React, { useState, useEffect, useRef } from 'react';
import LandingPage from './pages/LandingPage';
import CardPredict from './components/CardPredict';
import TrendChart from './components/TrendChart';
import GrafikTren from './components/GrafikTrenChart';
import Edukasi from './components/Edukasi';
import Prediksi from './components/Prediksi';
import KondisiData from './components/KondisiData';
import DeteksiAnomali from './components/DeteksiAnomali';

const BASE_URL = import.meta.env.VITE_API_URL;

const ISPU_CONFIG = {
  'Baik':               { bg: '#DCFCE7', border: '#86EFAC', text: '#14532D', dot: '#22C55E' },
  'Sedang':             { bg: '#FEF9C3', border: '#FDE047', text: '#713F12', dot: '#EAB308' },
  'Tidak Sehat':        { bg: '#FEF3C7', border: '#FCD34D', text: '#78350F', dot: '#F59E0B' },
  'Sangat Tidak Sehat': { bg: '#FEE2E2', border: '#FCA5A5', text: '#7F1D1D', dot: '#EF4444' },
  'Berbahaya':          { bg: '#1E1B4B', border: '#4338CA', text: '#E0E7FF', dot: '#818CF8' },
};

const POLUTAN_LIST = [
  { key: 'pm25', label: 'PM2.5', unit: 'µg/m³', color: '#16A34A', bg: '#DCFCE7', border: '#86EFAC', textColor: '#14532D', icon: 'ti-leaf' },
  { key: 'pm10', label: 'PM10',  unit: 'µg/m³', color: '#2563EB', bg: '#DBEAFE', border: '#93C5FD', textColor: '#1E3A8A', icon: 'ti-wind' },
  { key: 'co',   label: 'CO',    unit: 'µg/m³', color: '#D97706', bg: '#FEF3C7', border: '#FCD34D', textColor: '#78350F', icon: 'ti-flame' },
  { key: 'no2',  label: 'NO₂',   unit: 'µg/m³', color: '#7C3AED', bg: '#EDE9FE', border: '#C4B5FD', textColor: '#3B0764', icon: 'ti-atom' },
  { key: 'o3',   label: 'O₃',    unit: 'µg/m³', color: '#BE123C', bg: '#FFE4E6', border: '#FECDD3', textColor: '#4C0519', icon: 'ti-sun'  },
];

const TABS = [
  { key: 'beranda',  label: 'Beranda',       icon: 'ti-home'           },
  { key: 'grafik',   label: 'Grafik & Tren',  icon: 'ti-chart-line'     },
  { key: 'anomali',  label: 'Anomali',        icon: 'ti-alert-triangle' },
  { key: 'prediksi', label: 'Prediksi',       icon: 'ti-crystal-ball'   },
  { key: 'data',     label: 'Kondisi Data',   icon: 'ti-database'       },
  { key: 'edukasi',  label: 'Edukasi',        icon: 'ti-book'           },
];

function getIspuConfig(category) {
  return ISPU_CONFIG[category] || ISPU_CONFIG['Baik'];
}

/* ── Sparkline SVG ─────────────────────────────────────────── */
function Sparkline({ data, color }) {
  if (!data || data.length < 2) return null;
  const max   = Math.max(...data);
  const min   = Math.min(...data);
  const range = max - min || 1;
  const pts   = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((v - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none"
      style={{ width: '100%', height: 44, overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0"    />
        </linearGradient>
      </defs>
      <polygon points={`0,100 ${pts} 100,100`} fill={`url(#sg-${color.replace('#','')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="3"
        vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── ISPU Panel ─────────────────────────────────────────────── */
function IspuPanel({ ispuStatus }) {
  const placeholders = ['PM2.5', 'PM10', 'CO', 'NO₂', 'O₃'];
  if (!ispuStatus || ispuStatus.length === 0) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
        {placeholders.map(p => (
          <div key={p} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: '18px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#CBD5E1', marginBottom: 8 }}>{p}</div>
            <div style={{ fontSize: 34, fontWeight: 800, color: '#E2E8F0', lineHeight: 1 }}>—</div>
            <div style={{ fontSize: 11, color: '#CBD5E1', marginTop: 8 }}>Memuat...</div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
      {ispuStatus.map(item => {
        const cfg = getIspuConfig(item.category);
        return (
          <div key={item.parameter} className="polutan-card"
            style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}`, textAlign: 'center' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 24px ${cfg.dot}30`}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: cfg.text, marginBottom: 8, letterSpacing: '0.04em' }}>
              {item.parameter?.toUpperCase()}
            </div>
            <div style={{ fontSize: 38, fontWeight: 800, color: cfg.text, lineHeight: 1 }}>
              {Math.round(item.value)}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: cfg.text, marginTop: 8, opacity: 0.8 }}>
              {item.category}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Tab Beranda ────────────────────────────────────────────── */
function TabBeranda({ statusData, loading }) {
  const ispuStatus = statusData?.ispu_status ?? [];
  const segment    = statusData?.segment     ?? '';
  const isAnomali  = statusData?.anomaly_detected === true;
  const pollutants = statusData?.pollutants  || {};
  const category   = statusData?.ispu_status?.[0]?.category ?? 'Baik';
  const ispuValue  = statusData?.ispu_status?.[0]?.value    ?? '—';
  const cfg        = getIspuConfig(category);

  const sparklineData = {
    pm25: [35, 38, 42, 39, 45, 41, 38, 42, 44, 40],
    pm10: [60, 65, 70, 68, 72, 69, 66, 71, 68, 65],
    co:   [800, 850, 900, 870, 920, 880, 860, 910, 890, 870],
    no2:  [45, 48, 52, 50, 55, 51, 49, 53, 50, 48],
    o3:   [120, 125, 130, 128, 135, 132, 127, 133, 130, 128],
  };

  return (
    <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── HERO — soft blue-green gradient ── */}
      <section style={{
        background: 'linear-gradient(135deg, #E8F5E9 0%, #E3F2FD 50%, #EDE7F6 100%)',
        borderRadius: 24, padding: '40px 36px',
        position: 'relative', overflow: 'hidden', marginBottom: 28,
        border: '1.5px solid #E2E8F0',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(33,150,243,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(76,175,80,0.08)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, color: '#1565C0',
              background: 'rgba(33,150,243,0.12)', padding: '5px 16px',
              borderRadius: 20, border: '1px solid rgba(33,150,243,0.25)',
              display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '0.06em',
            }}>
              <i className="ti ti-map-pin" style={{ fontSize: 12 }} aria-hidden />
              KUALITAS UDARA · SURABAYA · REAL-TIME
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {isAnomali && (
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: 20,
                  background: '#FEF3C7', color: '#78350F', border: '1px solid #FCD34D',
                  animation: 'pulseBadge 2s infinite',
                }}>⚠ Anomali Terdeteksi</span>
              )}
              <span style={{ fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.text, padding: '5px 16px', borderRadius: 20, border: `1px solid ${cfg.border}` }}>
                {loading ? 'Memuat...' : category}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 32 }}>
            <div>
              <div style={{ fontSize: 88, fontWeight: 800, color: '#1A237E', lineHeight: 1, letterSpacing: '-0.03em' }}>
                {loading ? '—' : Math.round(ispuValue)}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#5C6BC0', marginTop: 6, letterSpacing: '0.08em' }}>
                NILAI ISPU TERKINI
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: '#7986CB', marginBottom: 4 }}>Polutan dominan</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#283593' }}>
                {loading ? '—' : (statusData?.ispu_status?.[0]?.parameter?.toUpperCase() || '—')}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { label: 'Polutan Dominan',  value: loading ? '...' : (statusData?.ispu_status?.[0]?.parameter?.toUpperCase() || '—'), icon: 'ti-target',        color: '#1976D2', bg: 'rgba(25,118,210,0.08)', border: 'rgba(25,118,210,0.2)' },
              { label: 'Prediksi 3 Jam',   value: loading ? '...' : 'Stabil',                                                        icon: 'ti-chart-bar',     color: '#2E7D32', bg: 'rgba(46,125,50,0.08)',  border: 'rgba(46,125,50,0.2)'  },
              { label: 'Anomali Hari Ini', value: loading ? '...' : (isAnomali ? '2 titik' : '0 titik'),                             icon: 'ti-zoom-scan',     color: isAnomali ? '#E65100' : '#2E7D32', bg: isAnomali ? 'rgba(230,81,0,0.08)' : 'rgba(46,125,50,0.08)', border: isAnomali ? 'rgba(230,81,0,0.2)' : 'rgba(46,125,50,0.2)' },
              { label: 'Status Keamanan',  value: loading ? '...' : (isAnomali ? 'Waspada' : 'Aman'), icon: isAnomali ? 'ti-alert-triangle' : 'ti-shield-check', color: isAnomali ? '#E65100' : '#2E7D32', bg: isAnomali ? 'rgba(230,81,0,0.08)' : 'rgba(46,125,50,0.08)', border: isAnomali ? 'rgba(230,81,0,0.2)' : 'rgba(46,125,50,0.2)' },
            ].map(item => (
              <div key={item.label}
                style={{
                  background: item.bg, border: `1px solid ${item.border}`,
                  borderRadius: 14, padding: '14px 16px',
                  borderLeft: `3px solid ${item.color}`,
                  transition: 'background 0.2s, transform 0.2s', cursor: 'default',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = item.bg.replace('0.08','0.14'); e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = item.bg; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <i className={`ti ${item.icon}`} style={{ fontSize: 18, color: item.color, display: 'block', marginBottom: 8 }} aria-hidden />
                <div style={{ fontSize: 10, fontWeight: 700, color: '#78909C', marginBottom: 4, letterSpacing: '0.06em' }}>
                  {item.label.toUpperCase()}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#1A237E' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section style={{
        background: '#fff', borderRadius: 18, padding: '20px 28px',
        border: '1px solid #E2E8F0', display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)', gap: 0,
        marginBottom: 28, boxShadow: '0 1px 4px rgba(15,23,42,0.05)',
      }}>
        {ispuStatus.length === 0
          ? ['PM2.5','PM10','CO','NO₂','O₃'].map((p, i) => (
              <div key={p} style={{ textAlign: 'center', padding: '0 16px', borderRight: i < 4 ? '1px solid #F1F5F9' : 'none' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#CBD5E1', marginBottom: 6 }}>{p}</div>
                <div style={{ fontSize: 30, fontWeight: 800, color: '#E2E8F0', lineHeight: 1 }}>—</div>
                <div style={{ fontSize: 11, color: '#CBD5E1', marginTop: 4 }}>Memuat...</div>
              </div>
            ))
          : ispuStatus.map((item, i) => {
              const c = getIspuConfig(item.category);
              return (
                <div key={item.parameter}
                  style={{ textAlign: 'center', padding: '0 16px', borderRight: i < ispuStatus.length - 1 ? '1px solid #F1F5F9' : 'none', transition: 'transform 0.18s', cursor: 'default' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: c.text, marginBottom: 6, letterSpacing: '0.05em' }}>{item.parameter?.toUpperCase()}</div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: c.text, lineHeight: 1 }}>{Math.round(item.value)}</div>
                  <div style={{ display: 'inline-block', marginTop: 6, fontSize: 10, fontWeight: 700, color: c.text, background: c.bg, padding: '2px 10px', borderRadius: 20, border: `1px solid ${c.border}` }}>
                    {item.category}
                  </div>
                </div>
              );
            })
        }
      </section>

      {/* ── POLUTAN SECTION ── */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 3 }}>Kondisi Polutan Terkini</div>
            <div style={{ fontSize: 13, color: '#64748B' }}>Konsentrasi dan tren 10 jam terakhir</div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', background: '#F1F5F9', padding: '4px 12px', borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <i className="ti ti-clock" style={{ fontSize: 12, marginRight: 4 }} aria-hidden />Update tiap jam
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {POLUTAN_LIST.map(p => (
            <div key={p.key}
              style={{ background: p.bg, border: `1.5px solid ${p.border}`, borderRadius: 18, padding: 18, transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${p.color}30`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`ti ${p.icon}`} style={{ fontSize: 18, color: p.color }} aria-hidden />
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(255,255,255,0.6)', color: p.textColor, padding: '3px 10px', borderRadius: 20 }}>Normal</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: p.textColor, opacity: 0.7, marginBottom: 4, letterSpacing: '0.04em' }}>{p.label}</div>
              <div style={{ fontSize: 38, fontWeight: 800, color: p.textColor, lineHeight: 1 }}>
                {loading ? '—' : Math.round(pollutants[p.key] || 0)}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: p.color, marginTop: 4, marginBottom: 12 }}>{p.unit}</div>
              <Sparkline data={sparklineData[p.key]} color={p.color} />
              <div style={{ fontSize: 11, color: p.textColor, opacity: 0.55, textAlign: 'center', marginTop: 6 }}>Tren 10 jam terakhir</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SEGMEN + RINGKASAN ── */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Segmentasi & Ringkasan</div>
        <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Model aktif berdasarkan waktu dan ringkasan kondisi hari ini</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: '20px 22px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.07em', marginBottom: 14 }}>SEGMENTASI WAKTU MODEL</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { key: 'PAGI',       label: 'Pagi',       icon: 'ti-sun',      time: '06:00 – 11:59 WIB' },
                { key: 'SIANG',      label: 'Siang',      icon: 'ti-sun-high', time: '12:00 – 17:59 WIB' },
                { key: 'SORE_MALAM', label: 'Sore/Malam', icon: 'ti-moon',     time: '18:00 – 05:59 WIB' },
              ].map(seg => {
                const now       = new Date().getHours();
                const activeKey = now >= 6 && now < 12 ? 'PAGI' : now >= 12 && now < 18 ? 'SIANG' : 'SORE_MALAM';
                const isActive  = activeKey === seg.key;
                const isModel   = segment === seg.key;
                return (
                  <div key={seg.key}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', borderRadius: 12,
                      background: isActive ? '#EFF6FF' : '#F8FAFC',
                      border: isActive ? '1.5px solid #BFDBFE' : '1px solid #F1F5F9',
                      transition: 'transform 0.18s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: isActive ? '#DBEAFE' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className={`ti ${seg.icon}`} style={{ fontSize: 18, color: isActive ? '#2563EB' : '#94A3B8' }} aria-hidden />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: isActive ? '#1D4ED8' : '#475569' }}>{seg.label}</div>
                        <div style={{ fontSize: 11, color: '#94A3B8' }}>{seg.time}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {isModel && <span style={{ fontSize: 11, fontWeight: 700, color: '#065F46', background: '#D1FAE5', padding: '3px 10px', borderRadius: 20, border: '1px solid #6EE7B7' }}>✓ Model aktif</span>}
                      {isActive && <span style={{ fontSize: 11, fontWeight: 700, color: '#1E40AF', background: '#DBEAFE', padding: '3px 10px', borderRadius: 20, border: '1px solid #93C5FD' }}>Sekarang</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 18, padding: '20px 22px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.07em', marginBottom: 14 }}>RINGKASAN HARI INI</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Kategori ISPU', val: loading ? '...' : category,                                 color: '#2563EB', bg: '#DBEAFE', border: '#93C5FD', textColor: '#1E3A8A' },
                { label: 'Nilai ISPU',    val: loading ? '...' : Math.round(ispuValue),                    color: '#16A34A', bg: '#DCFCE7', border: '#86EFAC', textColor: '#14532D' },
                { label: 'Anomali',       val: loading ? '...' : (isAnomali ? 'Terdeteksi' : 'Tidak ada'), color: isAnomali ? '#D97706' : '#16A34A', bg: isAnomali ? '#FEF3C7' : '#DCFCE7', border: isAnomali ? '#FCD34D' : '#86EFAC', textColor: isAnomali ? '#78350F' : '#14532D' },
                { label: 'Segmen Aktif',  val: loading ? '...' : (segment || '—'),                         color: '#7C3AED', bg: '#EDE9FE', border: '#C4B5FD', textColor: '#3B0764' },
              ].map(item => (
                <div key={item.label}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: item.bg, borderRadius: 12, padding: '11px 16px', border: `1px solid ${item.border}`, transition: 'transform 0.18s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                >
                  <span style={{ fontSize: 12, fontWeight: 600, color: item.textColor, opacity: 0.75 }}>{item.label}</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: item.textColor }}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PREDIKSI SECTION ── */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 3 }}>Prediksi PM2.5</div>
            <div style={{ fontSize: 13, color: '#64748B' }}>Estimasi konsentrasi 3 jam ke depan</div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', background: '#EDE9FE', padding: '4px 14px', borderRadius: 20, border: '1px solid #C4B5FD' }}>
            <i className="ti ti-crystal-ball" style={{ fontSize: 12, marginRight: 5 }} aria-hidden />Model: Random Forest
          </span>
        </div>
        <div style={{ background: '#fff', borderRadius: 18, padding: '20px 22px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
          <CardPredict baseUrl={BASE_URL} />
        </div>
      </section>

      {/* ── TREN SECTION ── */}
      <section style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 3 }}>Tren PM2.5 — 7 Hari Terakhir</div>
            <div style={{ fontSize: 13, color: '#64748B' }}>Pola konsentrasi PM2.5 dalam seminggu terakhir</div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '4px 14px', borderRadius: 20, border: '1px solid #86EFAC' }}>
            <i className="ti ti-chart-line" style={{ fontSize: 12, marginRight: 5 }} aria-hidden />7 Hari Terakhir
          </span>
        </div>
        <div style={{ background: '#fff', borderRadius: 18, padding: '20px 22px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
          <TrendChart baseUrl={BASE_URL} />
        </div>
      </section>

      {/* ── FOOTER CTA — soft ── */}
      <section style={{
        background: 'linear-gradient(135deg, #E8F5E9 0%, #E3F2FD 50%, #EDE7F6 100%)',
        borderRadius: 20, padding: '32px 36px', textAlign: 'center',
        position: 'relative', overflow: 'hidden', marginTop: 20,
        border: '1.5px solid #E2E8F0',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(33,150,243,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1A237E', marginBottom: 10 }}>Ingin analisis lebih mendalam?</div>
          <p style={{ fontSize: 13, color: '#5C6BC0', lineHeight: 1.7, marginBottom: 20, maxWidth: 480, margin: '0 auto 20px' }}>
            Jelajahi tab Grafik & Tren untuk visualisasi lengkap, tab Anomali untuk deteksi lonjakan, dan tab Prediksi untuk forecast 3 jam ke depan.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: 'ti-chart-line',     label: 'Grafik & Tren', bg: '#DCFCE7', border: '#86EFAC', color: '#14532D' },
              { icon: 'ti-alert-triangle', label: 'Anomali',       bg: '#FEF3C7', border: '#FCD34D', color: '#78350F' },
              { icon: 'ti-crystal-ball',   label: 'Prediksi',      bg: '#EDE9FE', border: '#C4B5FD', color: '#3B0764' },
              { icon: 'ti-database',       label: 'Kondisi Data',  bg: '#DBEAFE', border: '#93C5FD', color: '#1E3A8A' },
            ].map(btn => (
              <span key={btn.label}
                style={{
                  fontSize: 12, fontWeight: 700, padding: '8px 18px', borderRadius: 20,
                  background: btn.bg, border: `1px solid ${btn.border}`, color: btn.color,
                  display: 'flex', alignItems: 'center', gap: 7,
                  cursor: 'default', transition: 'all 0.18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 12px ${btn.border}80`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <i className={`ti ${btn.icon}`} style={{ fontSize: 14 }} aria-hidden />
                {btn.label}
              </span>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

/* ── App Root ────────────────────────────────────────────────── */
function App() {
  const [activeTab,     setActiveTab]     = useState('beranda');
  const [collapsed,     setCollapsed]     = useState(false);
  const [statusData,    setStatusData]    = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [lastUpdate,    setLastUpdate]    = useState(null);
  const [isSyncing,     setIsSyncing]     = useState(false);
  const [nextRefresh,   setNextRefresh]   = useState(60);
  const [showDashboard, setShowDashboard] = useState(false);

  async function loadStatus() {
    setIsSyncing(true);
    try {
      const res  = await fetch(`${BASE_URL}/status/surabaya`);
      const data = await res.json();
      setStatusData(data);
      setLastUpdate(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Gagal fetch status:', err);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }

  useEffect(() => {
    if (nextRefresh > 0) {
      const t = setTimeout(() => setNextRefresh(n => n - 1), 1000);
      return () => clearTimeout(t);
    } else {
      loadStatus();
      setNextRefresh(60);
    }
  }, [nextRefresh]);

  useEffect(() => { loadStatus(); }, []);

  if (!showDashboard) {
    return <LandingPage onEnter={() => setShowDashboard(true)} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      color: '#0F172A',
      fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        background: '#ffffff',
        borderBottom: '1px solid #E2E8F0',
        boxShadow: '0 1px 6px rgba(15,23,42,0.06)',
        padding: '0 24px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: 'linear-gradient(135deg, #059669, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-wind" style={{ fontSize: 18, color: '#fff' }} aria-hidden />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>AERIS</div>
            <div style={{ fontSize: 10, color: '#94A3B8', letterSpacing: '0.02em' }}>Pemantauan Kualitas Udara · Surabaya</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="badge badge-live">
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#DC2626', display: 'inline-block', animation: 'pulseDot 2s infinite' }} />
            LIVE
          </span>
          {isSyncing && (
            <span className="badge badge-blue">
              <span style={{ width: 12, height: 12, border: '2px solid #93C5FD', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
              Sinkronisasi...
            </span>
          )}
          <span className="badge badge-gray">
            <i className="ti ti-clock" style={{ fontSize: 12 }} aria-hidden />
            {lastUpdate ? `${lastUpdate} WIB` : 'Memuat...'}
          </span>
          <span style={{ fontSize: 11, color: '#94A3B8' }}>Refresh dalam {nextRefresh}s</span>
        </div>
      </nav>

      {/* ── BODY ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── SIDEBAR ── */}
        <aside style={{
          background: '#ffffff', borderRight: '1px solid #E2E8F0',
          width: collapsed ? 64 : 220, minWidth: collapsed ? 64 : 220,
          padding: collapsed ? '20px 8px' : '20px 12px',
          display: 'flex', flexDirection: 'column',
          transition: 'width 0.25s ease, min-width 0.25s ease, padding 0.25s ease',
          overflow: 'hidden', boxShadow: '1px 0 6px rgba(15,23,42,0.04)',
          position: 'relative', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', marginBottom: 24, paddingLeft: collapsed ? 0 : 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: 'linear-gradient(135deg, #059669, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ti ti-wind" style={{ fontSize: 18, color: '#fff' }} aria-hidden />
              </div>
              {!collapsed && (
                <div className="sidebar-text">
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>AERIS</div>
                  <div style={{ fontSize: 10, color: '#94A3B8' }}>Surabaya</div>
                </div>
              )}
            </div>
            {!collapsed && (
              <button className="toggle-btn" onClick={() => setCollapsed(true)} title="Tutup sidebar">
                <i className="ti ti-chevron-left" style={{ fontSize: 14 }} aria-hidden />
              </button>
            )}
          </div>

          {collapsed && (
            <button className="toggle-btn" onClick={() => setCollapsed(false)} title="Buka sidebar"
              style={{ position: 'absolute', top: 70, right: -13, zIndex: 20, boxShadow: '0 2px 8px rgba(15,23,42,0.14)' }}>
              <i className="ti ti-chevron-right" style={{ fontSize: 14 }} aria-hidden />
            </button>
          )}

          {!collapsed && (
            <div style={{ fontSize: 9, fontWeight: 700, color: '#CBD5E1', letterSpacing: '.12em', marginBottom: 8, paddingLeft: 10 }}>
              NAVIGASI
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
            {TABS.map(tab => {
              const active = activeTab === tab.key;
              return (
                <button key={tab.key}
                  className={`nav-btn${active ? ' active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                  title={collapsed ? tab.label : undefined}
                  style={{
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    paddingLeft: collapsed ? 0 : active ? '9px' : '12px',
                    borderLeft: collapsed ? 'none' : active ? '3px solid #2563EB' : '3px solid transparent',
                  }}
                >
                  <i className={`ti ${tab.icon}`} style={{ fontSize: 19, flexShrink: 0 }} aria-hidden />
                  {!collapsed && (
                    <>
                      <span style={{ flex: 1 }}>{tab.label}</span>
                      {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563EB', flexShrink: 0 }} />}
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {!collapsed && (
            <div style={{ marginTop: 16, padding: '10px 12px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 10, color: '#94A3B8', textAlign: 'center' }}>
              <div style={{ fontWeight: 700, color: '#64748B', marginBottom: 2 }}>AERIS v1.0</div>
              <div>PENS 2026</div>
            </div>
          )}
        </aside>

        {/* ── MAIN ── */}
        <main style={{ flex: 1, padding: '20px 24px', overflowY: 'auto', background: '#F8FAFC' }}>
          {activeTab === 'beranda'  && <TabBeranda statusData={statusData} loading={loading} />}
          {activeTab === 'grafik'   && <GrafikTren baseUrl={BASE_URL} />}
          {activeTab === 'anomali'  && <DeteksiAnomali baseUrl={BASE_URL} />}
          {activeTab === 'prediksi' && <Prediksi />}
          {activeTab === 'data'     && <KondisiData lastUpdate={lastUpdate} />}
          {activeTab === 'edukasi'  && <Edukasi />}
        </main>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{
        background: '#ffffff', borderTop: '1px solid #E2E8F0',
        padding: '10px 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', fontSize: 11, color: '#94A3B8', flexShrink: 0,
      }}>
        <span>
          <i className="ti ti-refresh" style={{ fontSize: 12, verticalAlign: '-1px', marginRight: 5 }} aria-hidden />
          Auto-refresh tiap 60 menit · Sumber: Open-Meteo Air Quality API
        </span>
        <span>Kelompok Aeris · PENS 2026</span>
      </footer>
    </div>
  );
}

export default App;