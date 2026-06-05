import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell
} from 'recharts';
import { POLUTAN_CONFIG } from '../constants';

const RENTANG_OPTIONS = [
  { key: '1d',  label: 'Hari ini', days: 1  },
  { key: '7d',  label: '7 Hari',   days: 7  },
  { key: '30d', label: '1 Bulan',  days: 30 },
];

const VIEW_OPTIONS = [
  { key: 'individual', label: 'Per Polutan',   icon: 'ti-chart-line' },
  { key: 'overlay',    label: 'Semua Polutan', icon: 'ti-layers'     },
  { key: 'harian',     label: 'Pola Harian',   icon: 'ti-clock'      },
];

const POLUTAN_STYLE = {
  pm25: { color: '#16A34A', bg: '#DCFCE7', border: '#86EFAC', textColor: '#14532D' },
  pm10: { color: '#2563EB', bg: '#DBEAFE', border: '#93C5FD', textColor: '#1E3A8A' },
  co:   { color: '#D97706', bg: '#FEF3C7', border: '#FCD34D', textColor: '#78350F' },
  no2:  { color: '#7C3AED', bg: '#EDE9FE', border: '#C4B5FD', textColor: '#3B0764' },
  o3:   { color: '#BE123C', bg: '#FFE4E6', border: '#FECDD3', textColor: '#4C0519' },
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1.5px solid #E2E8F0',
      borderRadius: 12, padding: '10px 14px', fontSize: 12,
      boxShadow: '0 4px 16px rgba(15,23,42,0.10)',
    }}>
      <div style={{ fontWeight: 700, color: '#64748B', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span style={{ color: '#475569', fontWeight: 600 }}>
            {p.name}: <strong style={{ color: '#0F172A' }}>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</strong> {p.unit || ''}
          </span>
        </div>
      ))}
    </div>
  );
}

function ChartLoading() {
  return (
    <div style={{
      height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94A3B8' }}>
        <span style={{
          width: 18, height: 18, border: '2.5px solid #CBD5E1',
          borderTop: '2.5px solid #2563EB', borderRadius: '50%',
          animation: 'spin 1s linear infinite', display: 'inline-block',
        }} />
        <span style={{ fontSize: 13, fontWeight: 500 }}>Memuat grafik...</span>
      </div>
    </div>
  );
}

function ChartError() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: '#FEE2E2', borderRadius: 12, padding: 16,
      border: '1px solid #FECACA',
    }}>
      <i className="ti ti-alert-circle" style={{ fontSize: 22, color: '#DC2626' }} aria-hidden />
      <span style={{ fontSize: 13, fontWeight: 600, color: '#7F1D1D' }}>Gagal memuat data. Coba lagi nanti.</span>
    </div>
  );
}

function GrafikPolutan({ data, polutanKey }) {
  const cfg   = POLUTAN_CONFIG[polutanKey];
  const style = POLUTAN_STYLE[polutanKey];
  if (!data || data.length === 0) return <ChartLoading />;

  const vals   = data.map(d => d[polutanKey]).filter(v => v != null && !isNaN(v));
  const maxVal = vals.length ? Math.max(...vals) : 0;
  const minVal = vals.length ? Math.min(...vals) : 0;

  const CustomDot = ({ cx, cy, payload }) => {
    const val = payload[polutanKey];
    if (val === maxVal && maxVal > 0)
      return <circle cx={cx} cy={cy} r={6} fill={style.color} stroke="#fff" strokeWidth={2} />;
    if (val === minVal && minVal >= 0 && minVal !== maxVal)
      return <circle cx={cx} cy={cy} r={5} fill={style.color} stroke="#fff" strokeWidth={2} opacity={0.6} />;
    return null;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, padding: '10px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="ti ti-arrow-up" style={{ fontSize: 14, color: '#DC2626' }} aria-hidden />
          <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>
            Tertinggi: <strong style={{ color: '#0F172A' }}>{maxVal.toFixed(1)} {cfg.unit}</strong>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="ti ti-arrow-down" style={{ fontSize: 14, color: '#16A34A' }} aria-hidden />
          <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>
            Terendah: <strong style={{ color: '#0F172A' }}>{minVal.toFixed(1)} {cfg.unit}</strong>
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="timestamp" stroke="#CBD5E1" tick={{ fill: '#94A3B8', fontSize: 11 }} interval="preserveStartEnd" tickFormatter={v => v.slice(0, 5)} />
          <YAxis stroke="#CBD5E1" tick={{ fill: '#94A3B8', fontSize: 11 }} domain={[0, 'dataMax + 10']} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={cfg.batas} stroke="#DC2626" strokeDasharray="5 5" strokeWidth={1.5}
            label={{ value: 'Batas Aman', fill: '#DC2626', fontSize: 10, fontWeight: 700, position: 'insideTopRight' }} />
          <Line type="monotone" dataKey={polutanKey} name={cfg.label} stroke={style.color}
            strokeWidth={2.5} dot={CustomDot} activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2, fill: style.color }} unit={cfg.unit} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function GrafikOverlay({ data }) {
  if (!data || data.length === 0) return <ChartLoading />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="timestamp" stroke="#CBD5E1" tick={{ fill: '#94A3B8', fontSize: 11 }} interval="preserveStartEnd" tickFormatter={v => v.slice(0, 5)} />
        <YAxis stroke="#CBD5E1" tick={{ fill: '#94A3B8', fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        {Object.entries(POLUTAN_CONFIG).map(([key, cfg]) => (
          <Line key={key} type="monotone" dataKey={key} name={cfg.label}
            stroke={POLUTAN_STYLE[key].color} strokeWidth={2} dot={false}
            activeDot={{ r: 5 }} unit={cfg.unit} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

function GrafikPolaHarian({ data }) {
  if (!data || data.length === 0) return <ChartLoading />;
  const hourlyMap = {};
  data.forEach(item => {
    const hour = item.timestamp?.slice(0, 2) || '00';
    if (!hourlyMap[hour]) hourlyMap[hour] = { total: 0, count: 0 };
    hourlyMap[hour].total += item.pm25 || 0;
    hourlyMap[hour].count += 1;
  });
  const hourlyData = Object.entries(hourlyMap)
    .map(([hour, val]) => ({
      hour: `${hour}:00`,
      avg: val.count > 0 ? Math.round((val.total / val.count) * 10) / 10 : 0,
    }))
    .sort((a, b) => a.hour.localeCompare(b.hour));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={hourlyData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="hour" stroke="#CBD5E1" tick={{ fill: '#94A3B8', fontSize: 11 }} />
        <YAxis stroke="#CBD5E1" tick={{ fill: '#94A3B8', fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="avg" name="Rata-rata PM2.5" radius={[6, 6, 0, 0]} unit=" µg/m³">
          {hourlyData.map((entry, index) => (
            <Cell key={index} fill={entry.avg > 55 ? '#DC2626' : entry.avg > 35 ? '#D97706' : '#16A34A'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function GrafikTren({ baseUrl }) {
  const [data,         setData]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(false);
  const [rentang,      setRentang]      = useState('7d');
  const [viewMode,     setViewMode]     = useState('individual');
  const [polutanAktif, setPolutanAktif] = useState('pm25');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(false);
      try {
        const days      = RENTANG_OPTIONS.find(r => r.key === rentang)?.days || 7;
        const endDate   = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const results = await Promise.all(
          Object.keys(POLUTAN_CONFIG).map(key =>
            fetch(`${baseUrl}/history/surabaya?start_date=${startDate}&end_date=${endDate}&parameter=${key}`)
              .then(r => r.json())
              .then(json => ({ key, data: Array.isArray(json) ? json : [] }))
          )
        );

        const merged = {};
        results.forEach(({ key, data: rows }) => {
          rows.forEach(item => {
            const ts = item.timestamp?.slice(0, 16) || '';
            if (!merged[ts]) merged[ts] = { timestamp: ts };
            merged[ts][key] = item.value ?? 0;
          });
        });

        setData(Object.values(merged).sort((a, b) => a.timestamp.localeCompare(b.timestamp)));
      } catch (err) {
        console.error('Gagal fetch grafik:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [baseUrl, rentang]);

  const stats = (() => {
    const vals = data.map(d => d[polutanAktif]).filter(v => v != null && !isNaN(v) && v > 0);
    if (!vals.length) return null;
    const avg    = vals.reduce((a, b) => a + b, 0) / vals.length;
    const max    = Math.max(...vals);
    const min    = Math.min(...vals);
    const stdDev = Math.sqrt(vals.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / vals.length);
    return { avg, max, min, stdDev, count: vals.length };
  })();

  const btnBase = {
    fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 20,
    cursor: 'pointer', fontFamily: 'inherit', border: '1.5px solid #E2E8F0',
    background: '#F8FAFC', color: '#64748B', transition: 'all 0.18s ease',
    display: 'flex', alignItems: 'center', gap: 6,
  };
  const btnActive = { ...btnBase, background: '#EFF6FF', color: '#1D4ED8', border: '1.5px solid #93C5FD', boxShadow: '0 2px 8px rgba(37,99,235,0.12)' };

  return (
    <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── HERO SECTION — soft blue ── */}
      <section style={{
        background: 'linear-gradient(135deg, #DBEAFE 0%, #EDE9FE 50%, #DCFCE7 100%)',
        borderRadius: 24, padding: '36px', position: 'relative',
        overflow: 'hidden', marginBottom: 28, border: '1.5px solid #E2E8F0',
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: '#1D4ED8',
            background: 'rgba(37,99,235,0.1)', padding: '5px 16px',
            borderRadius: 20, border: '1px solid rgba(37,99,235,0.25)',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            letterSpacing: '0.06em', marginBottom: 16,
          }}>
            <i className="ti ti-chart-line" style={{ fontSize: 12 }} aria-hidden />
            VISUALISASI DATA HISTORIS
          </span>

          <div style={{ fontSize: 36, fontWeight: 800, color: '#1E3A8A', marginBottom: 10, letterSpacing: '-0.02em' }}>
            Grafik & Tren Polutan
          </div>
          <div style={{ fontSize: 14, color: '#1D4ED8', lineHeight: 1.7, marginBottom: 24, maxWidth: 520, opacity: 0.8 }}>
            Analisis tren historis konsentrasi polutan udara Surabaya. Pilih rentang waktu, jenis polutan, dan mode tampilan untuk eksplorasi data yang lebih mendalam.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { icon: 'ti-database',  label: 'Total Data',    value: `${data.length} titik`,                                              color: '#1D4ED8', bg: 'rgba(37,99,235,0.08)',  border: 'rgba(37,99,235,0.2)'  },
              { icon: 'ti-clock',     label: 'Rentang',       value: RENTANG_OPTIONS.find(r => r.key === rentang)?.label || '—',          color: '#16A34A', bg: 'rgba(22,163,74,0.08)',  border: 'rgba(22,163,74,0.2)'  },
              { icon: 'ti-layers',    label: 'Mode Tampilan', value: VIEW_OPTIONS.find(v => v.key === viewMode)?.label || '—',            color: '#7C3AED', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)' },
              { icon: 'ti-leaf',      label: 'Polutan Aktif', value: POLUTAN_CONFIG[polutanAktif]?.label || '—',                          color: '#D97706', bg: 'rgba(217,119,6,0.08)',  border: 'rgba(217,119,6,0.2)'  },
            ].map(item => (
              <div key={item.label} style={{
                background: item.bg, border: `1px solid ${item.border}`,
                borderRadius: 12, padding: '12px 14px',
                borderLeft: `3px solid ${item.color}`,
                transition: 'transform 0.2s', cursor: 'default',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <i className={`ti ${item.icon}`} style={{ fontSize: 16, color: item.color, display: 'block', marginBottom: 6 }} aria-hidden />
                <div style={{ fontSize: 10, fontWeight: 700, color: item.color, marginBottom: 3, letterSpacing: '0.06em', opacity: 0.8 }}>{item.label.toUpperCase()}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#1E3A8A' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── KONTROL ── */}
      <section style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Pengaturan Tampilan</div>
        <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Pilih rentang waktu dan mode visualisasi</div>
        <div style={{ background: '#fff', borderRadius: 18, padding: '20px 22px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(15,23,42,0.05)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em', minWidth: 80 }}>RENTANG</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {RENTANG_OPTIONS.map(r => (
                <button key={r.key} style={rentang === r.key ? btnActive : btnBase}
                  onClick={() => setRentang(r.key)}
                  onMouseEnter={e => { if (rentang !== r.key) { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#334155'; } }}
                  onMouseLeave={e => { if (rentang !== r.key) { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#64748B'; } }}
                >{r.label}</button>
              ))}
            </div>
          </div>
          <div style={{ height: 1, background: '#F1F5F9' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em', minWidth: 80 }}>MODE</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {VIEW_OPTIONS.map(v => (
                <button key={v.key} style={viewMode === v.key ? btnActive : btnBase}
                  onClick={() => setViewMode(v.key)}
                  onMouseEnter={e => { if (viewMode !== v.key) { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#334155'; } }}
                  onMouseLeave={e => { if (viewMode !== v.key) { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#64748B'; } }}
                >
                  <i className={`ti ${v.icon}`} style={{ fontSize: 14 }} aria-hidden />
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── VIEW: INDIVIDUAL ── */}
      {viewMode === 'individual' && (
        <>
          <section style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Pilih Polutan</div>
            <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Klik polutan untuk melihat tren spesifik</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {Object.entries(POLUTAN_CONFIG).map(([key, cfg]) => {
                const s = POLUTAN_STYLE[key];
                const active = polutanAktif === key;
                return (
                  <button key={key} onClick={() => setPolutanAktif(key)}
                    style={{
                      fontSize: 13, fontWeight: 700, padding: '10px 20px', borderRadius: 20,
                      cursor: 'pointer', fontFamily: 'inherit',
                      border: `1.5px solid ${active ? s.border : '#E2E8F0'}`,
                      background: active ? s.bg : '#F8FAFC',
                      color: active ? s.textColor : '#64748B',
                      transition: 'all 0.18s ease',
                      boxShadow: active ? `0 4px 14px ${s.border}80` : 'none',
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = s.bg; e.currentTarget.style.color = s.textColor; e.currentTarget.style.borderColor = s.border; } e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#64748B'; e.currentTarget.style.borderColor = '#E2E8F0'; } e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </section>

          {stats && (
            <section style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Statistik {POLUTAN_CONFIG[polutanAktif].label}</div>
              <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Ringkasan untuk rentang {RENTANG_OPTIONS.find(r => r.key === rentang)?.label}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                {[
                  { label: 'Rata-rata',   value: stats.avg.toFixed(1),    color: '#2563EB', bg: '#DBEAFE', border: '#93C5FD', textColor: '#1E3A8A', icon: 'ti-minus'      },
                  { label: 'Tertinggi',   value: stats.max.toFixed(1),    color: '#DC2626', bg: '#FEE2E2', border: '#FECACA', textColor: '#7F1D1D', icon: 'ti-arrow-up'   },
                  { label: 'Terendah',    value: stats.min.toFixed(1),    color: '#16A34A', bg: '#DCFCE7', border: '#86EFAC', textColor: '#14532D', icon: 'ti-arrow-down' },
                  { label: 'Std Deviasi', value: stats.stdDev.toFixed(1), color: '#7C3AED', bg: '#EDE9FE', border: '#C4B5FD', textColor: '#3B0764', icon: 'ti-chart-bar'  },
                  { label: 'Data Points', value: stats.count,             color: '#D97706', bg: '#FEF3C7', border: '#FCD34D', textColor: '#78350F', icon: 'ti-database'   },
                ].map(item => (
                  <div key={item.label}
                    style={{
                      background: item.bg, border: `1.5px solid ${item.border}`,
                      borderRadius: 16, padding: '16px',
                      transition: 'transform 0.18s, box-shadow 0.18s', cursor: 'default',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${item.border}80`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <i className={`ti ${item.icon}`} style={{ fontSize: 16, color: item.color }} aria-hidden />
                      <span style={{ fontSize: 10, fontWeight: 700, color: item.color, opacity: 0.8, letterSpacing: '0.05em' }}>{item.label.toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: item.color, lineHeight: 1 }}>{item.value}</div>
                    <div style={{ fontSize: 11, color: item.color, opacity: 0.65, marginTop: 4 }}>{POLUTAN_CONFIG[polutanAktif].unit}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 3 }}>Tren {POLUTAN_CONFIG[polutanAktif].label}</div>
                <div style={{ fontSize: 13, color: '#64748B' }}>{RENTANG_OPTIONS.find(r => r.key === rentang)?.label} · {data.length} titik data</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: POLUTAN_STYLE[polutanAktif].textColor, background: POLUTAN_STYLE[polutanAktif].bg, padding: '4px 14px', borderRadius: 20, border: `1px solid ${POLUTAN_STYLE[polutanAktif].border}` }}>
                {POLUTAN_CONFIG[polutanAktif].label} · {POLUTAN_CONFIG[polutanAktif].unit}
              </span>
            </div>
            <div style={{ background: '#fff', borderRadius: 18, padding: '20px 22px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
              {error && <ChartError />}
              {loading && <ChartLoading />}
              {!loading && !error && <GrafikPolutan data={data} polutanKey={polutanAktif} />}
            </div>
          </section>

          {!loading && !error && data.length > 0 && (
            <section style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Ringkasan Semua Polutan</div>
              <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Rata-rata, min, dan maks untuk {RENTANG_OPTIONS.find(r => r.key === rentang)?.label}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                {Object.entries(POLUTAN_CONFIG).map(([key, cfg]) => {
                  const s       = POLUTAN_STYLE[key];
                  const vals    = data.map(d => d[key] || 0).filter(v => v > 0);
                  const avg     = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
                  const max     = vals.length ? Math.max(...vals) : 0;
                  const min     = vals.length ? Math.min(...vals) : 0;
                  const overBatas = max > cfg.batas;
                  return (
                    <div key={key}
                      style={{
                        background: s.bg, border: `1.5px solid ${overBatas ? '#FECACA' : s.border}`,
                        borderRadius: 16, padding: '16px',
                        transition: 'transform 0.18s, box-shadow 0.18s', cursor: 'default',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${s.border}80`; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: s.color, marginBottom: 8 }}>{cfg.label}</div>
                      <div style={{ fontSize: 30, fontWeight: 800, color: s.textColor, lineHeight: 1 }}>{avg.toFixed(0)}</div>
                      <div style={{ fontSize: 10, color: s.color, opacity: 0.7, marginTop: 4, marginBottom: 10 }}>rata-rata {cfg.unit}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748B' }}>
                        <span>Min: {min.toFixed(0)}</span>
                        <span>Max: {max.toFixed(0)}</span>
                      </div>
                      {overBatas && (
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#DC2626', marginTop: 8, background: '#FEE2E2', padding: '3px 8px', borderRadius: 6, display: 'inline-block' }}>
                          ⚠ Melebihi batas
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}

      {/* ── VIEW: OVERLAY ── */}
      {viewMode === 'overlay' && (
        <section style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Overlay Semua Polutan</div>
          <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Perbandingan seluruh polutan · {RENTANG_OPTIONS.find(r => r.key === rentang)?.label}</div>
          <div style={{ background: '#fff', borderRadius: 18, padding: '20px 22px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
            {error && <ChartError />}
            {loading && <ChartLoading />}
            {!loading && !error && <GrafikOverlay data={data} />}
            <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
              {Object.entries(POLUTAN_CONFIG).map(([key, cfg]) => (
                <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569', fontWeight: 500 }}>
                  <span style={{ width: 14, height: 3, borderRadius: 2, background: POLUTAN_STYLE[key].color, display: 'inline-block' }} />
                  {cfg.label}
                </span>
              ))}
            </div>
            <div style={{ marginTop: 14, padding: '10px 14px', background: '#DBEAFE', borderRadius: 10, border: '1px solid #93C5FD' }}>
              <p style={{ fontSize: 12, color: '#1E40AF', lineHeight: 1.6, margin: 0 }}>
                <strong>Catatan:</strong> Skala Y menggunakan normalisasi otomatis. Nilai absolut CO jauh lebih besar dari polutan lain.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── VIEW: HARIAN ── */}
      {viewMode === 'harian' && (
        <section style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Pola Harian PM2.5</div>
          <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Rata-rata konsentrasi per jam · {RENTANG_OPTIONS.find(r => r.key === rentang)?.label}</div>
          <div style={{ background: '#fff', borderRadius: 18, padding: '20px 22px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
            {error && <ChartError />}
            {loading && <ChartLoading />}
            {!loading && !error && <GrafikPolaHarian data={data} />}
            <div style={{ marginTop: 14, padding: '12px 16px', background: '#DBEAFE', borderRadius: 12, border: '1px solid #93C5FD' }}>
              <p style={{ fontSize: 12, color: '#1E40AF', lineHeight: 1.7, margin: 0 }}>
                <strong>Insight Pola Harian:</strong> Puncak konsentrasi PM2.5 biasanya terjadi pada jam sibuk pagi (07:00–09:00) dan malam (18:00–20:00). Konsentrasi terendah cenderung terjadi pada siang hari.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER CTA — soft ── */}
      <section style={{
        background: 'linear-gradient(135deg, #DBEAFE 0%, #EDE9FE 50%, #DCFCE7 100%)',
        borderRadius: 20, padding: '28px 32px', textAlign: 'center',
        position: 'relative', overflow: 'hidden', marginTop: 20,
        border: '1.5px solid #E2E8F0',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(37,99,235,0.1)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1E3A8A', marginBottom: 8 }}>Temukan anomali dan prediksi lebih lanjut</div>
          <p style={{ fontSize: 13, color: '#1D4ED8', lineHeight: 1.7, marginBottom: 16, opacity: 0.85 }}>
            Gunakan tab Anomali untuk deteksi lonjakan otomatis, atau tab Prediksi untuk melihat forecast 3 jam ke depan.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: 'ti-alert-triangle', label: 'Lihat Anomali',  bg: '#FEF3C7', border: '#FCD34D', color: '#78350F' },
              { icon: 'ti-crystal-ball',   label: 'Lihat Prediksi', bg: '#EDE9FE', border: '#C4B5FD', color: '#3B0764' },
            ].map(btn => (
              <span key={btn.label} style={{
                fontSize: 12, fontWeight: 700, padding: '8px 18px', borderRadius: 20,
                background: btn.bg, border: `1px solid ${btn.border}`,
                color: btn.color, display: 'flex', alignItems: 'center', gap: 7,
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

export default GrafikTren;