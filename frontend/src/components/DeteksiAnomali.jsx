import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

const BASE_URL = import.meta.env.VITE_API_URL;

const SEVERITY_CONFIG = {
  Low:    { bg: '#DCFCE7', border: '#86EFAC', text: '#14532D', dot: '#22C55E', label: 'Rendah' },
  Medium: { bg: '#FEF3C7', border: '#FCD34D', text: '#78350F', dot: '#F59E0B', label: 'Sedang' },
  High:   { bg: '#FEE2E2', border: '#FECACA', text: '#7F1D1D', dot: '#EF4444', label: 'Tinggi' },
};

const POLUTAN_COLOR = {
  pm25: '#16A34A', pm10: '#2563EB', co: '#D97706', no2: '#7C3AED', o3: '#BE123C',
};

const POLUTAN_STYLE = {
  pm25: { bg: '#DCFCE7', border: '#86EFAC', textColor: '#14532D' },
  pm10: { bg: '#DBEAFE', border: '#93C5FD', textColor: '#1E3A8A' },
  co:   { bg: '#FEF3C7', border: '#FCD34D', textColor: '#78350F' },
  no2:  { bg: '#EDE9FE', border: '#C4B5FD', textColor: '#3B0764' },
  o3:   { bg: '#FFE4E6', border: '#FECDD3', textColor: '#4C0519' },
};

const POLUTAN_LABEL = {
  pm25: 'PM2.5', pm10: 'PM10', co: 'CO', no2: 'NO₂', o3: 'O₃',
};

const THRESHOLDS = {
  pm25: { low: 55,    medium: 100,   high: 150   },
  pm10: { low: 150,   medium: 250,   high: 350   },
  co:   { low: 10000, medium: 20000, high: 30000 },
  no2:  { low: 200,   medium: 400,   high: 600   },
  o3:   { low: 235,   medium: 400,   high: 600   },
};

const BATAS = {
  pm25: 55, pm10: 150, co: 10000, no2: 200, o3: 235,
};

function getSeverity(value, parameter) {
  const t = THRESHOLDS[parameter] || THRESHOLDS.pm25;
  if (value > t.high)   return 'High';
  if (value > t.medium) return 'Medium';
  if (value > t.low)    return 'Low';
  return null;
}

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
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span style={{ color: '#475569', fontWeight: 600 }}>
            {p.name}: <strong style={{ color: '#0F172A' }}>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</strong>
          </span>
        </div>
      ))}
    </div>
  );
}

function DeteksiAnomali({ baseUrl }) {
  const [statusData,        setStatusData]        = useState(null);
  const [loading,           setLoading]           = useState(true);
  const [historyData,       setHistoryData]       = useState([]);
  const [selectedParameter, setSelectedParameter] = useState('pm25');
  const [anomalyEvents,     setAnomalyEvents]     = useState([]);

  useEffect(() => {
    async function fetchAll() {
      try {
        const res  = await fetch(`${baseUrl}/status/surabaya`);
        const data = await res.json();
        setStatusData(data);
      } catch (err) {
        console.error('Gagal fetch status:', err);
      }
      try {
        const endDate   = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const res       = await fetch(
          `${baseUrl}/history/surabaya?start_date=${startDate}&end_date=${endDate}&parameter=${selectedParameter}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const rows = Array.isArray(json) ? json : [];
        const formatted = rows.map(item => ({
          timestamp: item.timestamp?.slice(11, 16) || '00:00',
          value:     item.value ?? 0,
          severity:  getSeverity(item.value ?? 0, selectedParameter),
        }));
        setHistoryData(formatted);
        setAnomalyEvents(formatted.filter(d => d.severity !== null));
      } catch (err) {
        console.error('Gagal fetch history:', err);
        setHistoryData([]);
        setAnomalyEvents([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [baseUrl, selectedParameter]);

  const anomalyItems  = statusData?.ispu_status || [];
  const activeAnomaly = anomalyItems.find(item =>
    ['Tidak Sehat', 'Sangat Tidak Sehat', 'Berbahaya'].includes(item.category)
  );

  const avg = historyData.length > 0
    ? (historyData.reduce((a, b) => a + b.value, 0) / historyData.length).toFixed(1) : '—';
  const max = historyData.length > 0
    ? Math.max(...historyData.map(d => d.value)).toFixed(1) : '—';
  const min = historyData.length > 0
    ? Math.min(...historyData.map(d => d.value)).toFixed(1) : '—';

  const severityCount = {
    Low:    anomalyEvents.filter(e => e.severity === 'Low').length,
    Medium: anomalyEvents.filter(e => e.severity === 'Medium').length,
    High:   anomalyEvents.filter(e => e.severity === 'High').length,
  };

  const peakAnomalyHour = anomalyEvents.length > 0
    ? anomalyEvents.reduce((a, b) => a.value > b.value ? a : b).timestamp : null;

  const generateInsight = () => {
    if (activeAnomaly) return `Terdeteksi lonjakan tidak wajar pada parameter ${activeAnomaly.parameter.toUpperCase()} dengan nilai tertinggi ${Math.round(activeAnomaly.value)}. Puncak anomali terjadi pada pukul ${peakAnomalyHour || '—'} WIB. Disarankan untuk memantau perkembangan kualitas udara secara berkala.`;
    if (anomalyEvents.length > 0) return `Terdeteksi ${anomalyEvents.length} kejadian fluktuasi nilai di atas ambang batas normal pada parameter ${POLUTAN_LABEL[selectedParameter]}. Secara keseluruhan kualitas udara masih dalam kategori terkendali.`;
    return `Tidak ditemukan anomali signifikan pada seluruh parameter kualitas udara dalam 24 jam terakhir. Seluruh polutan masih berada pada rentang normal dan relatif stabil.`;
  };

  const btnBase = {
    fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 20,
    cursor: 'pointer', fontFamily: 'inherit', border: '1.5px solid #E2E8F0',
    background: '#F8FAFC', color: '#64748B', transition: 'all 0.18s ease',
  };

  /* ── Hero colors based on anomaly status ── */
  const heroConfig = activeAnomaly
    ? { bg: 'linear-gradient(135deg, #FEE2E2 0%, #FEF3C7 50%, #FFE4E6 100%)', border: '#FECACA', titleColor: '#7F1D1D', subColor: '#B91C1C', badgeColor: '#DC2626', badgeBg: 'rgba(220,38,38,0.1)', badgeBorder: 'rgba(220,38,38,0.25)' }
    : { bg: 'linear-gradient(135deg, #DCFCE7 0%, #DBEAFE 50%, #EDE9FE 100%)', border: '#E2E8F0', titleColor: '#14532D', subColor: '#166534', badgeColor: '#16A34A', badgeBg: 'rgba(22,163,74,0.1)', badgeBorder: 'rgba(22,163,74,0.25)' };

  if (loading) return (
    <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <section style={{
        background: 'linear-gradient(135deg, #DCFCE7 0%, #DBEAFE 50%, #EDE9FE 100%)',
        borderRadius: 24, padding: '36px', marginBottom: 28,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: 200, border: '1.5px solid #E2E8F0',
      }}>
        <i className="ti ti-zoom-scan" style={{ fontSize: 48, color: '#2563EB', marginBottom: 16 }} aria-hidden />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#1D4ED8' }}>
          <span style={{ width: 18, height: 18, border: '2.5px solid #93C5FD', borderTop: '2.5px solid #2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
          <span style={{ fontSize: 15, fontWeight: 600 }}>Memuat analisis anomali...</span>
        </div>
      </section>
    </div>
  );

  return (
    <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── HERO SECTION — soft ── */}
      <section style={{
        background: heroConfig.bg,
        borderRadius: 24, padding: '36px', position: 'relative',
        overflow: 'hidden', marginBottom: 28,
        border: `1.5px solid ${heroConfig.border}`,
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: heroConfig.badgeColor,
            background: heroConfig.badgeBg, padding: '5px 16px',
            borderRadius: 20, border: `1px solid ${heroConfig.badgeBorder}`,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            letterSpacing: '0.06em', marginBottom: 16,
          }}>
            <i className="ti ti-zoom-scan" style={{ fontSize: 12 }} aria-hidden />
            DETEKSI ANOMALI · 24 JAM TERAKHIR
          </span>

          <div style={{ fontSize: 36, fontWeight: 800, color: heroConfig.titleColor, marginBottom: 10, letterSpacing: '-0.02em' }}>
            {activeAnomaly ? '⚠ Anomali Terdeteksi!' : 'Kondisi Udara Normal'}
          </div>
          <div style={{ fontSize: 14, color: heroConfig.subColor, lineHeight: 1.7, marginBottom: 24, maxWidth: 520, opacity: 0.85 }}>
            {activeAnomaly
              ? `Ditemukan lonjakan tidak wajar pada parameter ${activeAnomaly.parameter.toUpperCase()}. Pantau terus kondisi kualitas udara dan ambil tindakan pencegahan.`
              : 'Tidak ditemukan anomali signifikan dalam 24 jam terakhir. Seluruh parameter polutan berada dalam rentang normal.'
            }
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { icon: activeAnomaly ? 'ti-alert-triangle' : 'ti-shield-check', label: 'Status Anomali',    value: activeAnomaly ? 'Terdeteksi' : 'Normal',         color: activeAnomaly ? '#DC2626' : '#16A34A', bg: activeAnomaly ? 'rgba(220,38,38,0.08)' : 'rgba(22,163,74,0.08)',    border: activeAnomaly ? 'rgba(220,38,38,0.2)' : 'rgba(22,163,74,0.2)'   },
              { icon: 'ti-zoom-scan',    label: 'Total Kejadian',    value: anomalyEvents.length,           color: '#2563EB', bg: 'rgba(37,99,235,0.08)',   border: 'rgba(37,99,235,0.2)'  },
              { icon: 'ti-clock',        label: 'Puncak Anomali',    value: peakAnomalyHour || '—',         color: '#D97706', bg: 'rgba(217,119,6,0.08)',   border: 'rgba(217,119,6,0.2)'  },
              { icon: 'ti-alert-circle', label: 'Severity Tertinggi', value: severityCount.High > 0 ? 'Tinggi' : severityCount.Medium > 0 ? 'Sedang' : severityCount.Low > 0 ? 'Rendah' : '—', color: severityCount.High > 0 ? '#DC2626' : severityCount.Medium > 0 ? '#D97706' : '#16A34A', bg: severityCount.High > 0 ? 'rgba(220,38,38,0.08)' : severityCount.Medium > 0 ? 'rgba(217,119,6,0.08)' : 'rgba(22,163,74,0.08)', border: severityCount.High > 0 ? 'rgba(220,38,38,0.2)' : severityCount.Medium > 0 ? 'rgba(217,119,6,0.2)' : 'rgba(22,163,74,0.2)' },
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
                <div style={{ fontSize: 16, fontWeight: 800, color: heroConfig.titleColor }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATUS PER POLUTAN ── */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Status Per Polutan</div>
        <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Kondisi dan severity masing-masing parameter</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {anomalyItems.map(item => {
            const key      = item.parameter;
            const severity = getSeverity(item.value, key);
            const cfg      = severity ? SEVERITY_CONFIG[severity] : null;
            const st       = POLUTAN_STYLE[key] || POLUTAN_STYLE.pm25;
            const isNormal = !severity;
            return (
              <div key={key}
                style={{
                  background: isNormal ? st.bg : cfg.bg,
                  border: `1.5px solid ${isNormal ? st.border : cfg.border}`,
                  borderRadius: 16, padding: '18px 14px', textAlign: 'center',
                  transition: 'transform 0.18s, box-shadow 0.18s', cursor: 'default',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${isNormal ? st.border : cfg.border}80`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: isNormal ? st.textColor : cfg.text, marginBottom: 8 }}>
                  {POLUTAN_LABEL[key] || key.toUpperCase()}
                </div>
                <div style={{ fontSize: 34, fontWeight: 800, color: isNormal ? st.textColor : cfg.text, lineHeight: 1, marginBottom: 8 }}>
                  {Math.round(item.value)}
                </div>
                <div style={{ fontSize: 11, color: isNormal ? st.textColor : cfg.text, opacity: 0.75, marginBottom: 10 }}>
                  {item.category}
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  background: 'rgba(255,255,255,0.55)',
                  color: isNormal ? st.textColor : cfg.text,
                  padding: '3px 10px', borderRadius: 20, display: 'inline-block',
                }}>
                  {isNormal ? '✓ Normal' : `Severity: ${cfg.label}`}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── GRAFIK SECTION ── */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 3 }}>Tren Historis dengan Deteksi Anomali</div>
            <div style={{ fontSize: 13, color: '#64748B' }}>Titik berwarna menandai kejadian anomali · 24 jam terakhir</div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.keys(POLUTAN_LABEL).map(key => {
              const active = selectedParameter === key;
              const st     = POLUTAN_STYLE[key];
              return (
                <button key={key}
                  style={{
                    ...btnBase,
                    background: active ? st.bg : '#F8FAFC',
                    color: active ? st.textColor : '#64748B',
                    border: `1.5px solid ${active ? st.border : '#E2E8F0'}`,
                    boxShadow: active ? `0 2px 8px ${st.border}80` : 'none',
                  }}
                  onClick={() => setSelectedParameter(key)}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = st.bg; e.currentTarget.style.color = st.textColor; e.currentTarget.style.borderColor = st.border; } e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#64748B'; e.currentTarget.style.borderColor = '#E2E8F0'; } e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {POLUTAN_LABEL[key]}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 18, padding: '20px 22px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(15,23,42,0.05)', marginBottom: 14 }}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="timestamp" stroke="#CBD5E1" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis stroke="#CBD5E1" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={BATAS[selectedParameter]} stroke="#DC2626" strokeDasharray="5 5" strokeWidth={1.5}
                label={{ value: 'Ambang Batas', position: 'insideTopRight', fill: '#DC2626', fontSize: 10, fontWeight: 700 }} />
              <Line type="monotone" dataKey="value" stroke={POLUTAN_COLOR[selectedParameter]}
                strokeWidth={2.5} name={POLUTAN_LABEL[selectedParameter]}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (!payload.severity) return null;
                  const cfg = SEVERITY_CONFIG[payload.severity];
                  return <circle cx={cx} cy={cy} r={6} fill={cfg.dot} stroke="#fff" strokeWidth={2} />;
                }}
                activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stat strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { label: 'Rata-rata', value: avg, color: '#2563EB', bg: '#DBEAFE', border: '#93C5FD', icon: 'ti-minus'      },
            { label: 'Tertinggi', value: max, color: '#DC2626', bg: '#FEE2E2', border: '#FECACA', icon: 'ti-arrow-up'   },
            { label: 'Terendah',  value: min, color: '#16A34A', bg: '#DCFCE7', border: '#86EFAC', icon: 'ti-arrow-down' },
          ].map(item => (
            <div key={item.label}
              style={{
                background: item.bg, border: `1.5px solid ${item.border}`,
                borderRadius: 14, padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 12,
                transition: 'transform 0.18s, box-shadow 0.18s', cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 16px ${item.border}80`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`ti ${item.icon}`} style={{ fontSize: 18, color: item.color }} aria-hidden />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: item.color, opacity: 0.75, letterSpacing: '0.05em', marginBottom: 3 }}>{item.label.toUpperCase()}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: item.color, lineHeight: 1 }}>
                  {item.value}<span style={{ fontSize: 11, fontWeight: 600, marginLeft: 3, opacity: 0.7 }}>µg/m³</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── INSIGHT SECTION ── */}
      <section style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Insight Anomali</div>
        <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Analisis otomatis berdasarkan data 24 jam terakhir</div>
        <div style={{
          background: activeAnomaly ? '#FEF3C7' : anomalyEvents.length > 0 ? '#DBEAFE' : '#DCFCE7',
          border: `1.5px solid ${activeAnomaly ? '#FCD34D' : anomalyEvents.length > 0 ? '#93C5FD' : '#86EFAC'}`,
          borderRadius: 18, padding: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className={`ti ${activeAnomaly ? 'ti-alert-triangle' : anomalyEvents.length > 0 ? 'ti-chart-bar' : 'ti-shield-check'}`}
                style={{ fontSize: 22, color: activeAnomaly ? '#D97706' : anomalyEvents.length > 0 ? '#2563EB' : '#16A34A' }}
                aria-hidden />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
                {activeAnomaly ? 'Perlu Perhatian Segera' : anomalyEvents.length > 0 ? 'Fluktuasi Terdeteksi' : 'Kondisi Stabil'}
              </div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Berdasarkan data 24 jam terakhir</div>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.65)', borderRadius: 12, padding: '14px 18px', fontSize: 13, lineHeight: 1.8, color: '#475569', marginBottom: 16 }}>
            {generateInsight()}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { icon: 'ti-satellite', label: 'Data: 24 jam terakhir'   },
              { icon: 'ti-refresh',   label: 'Update: setiap jam'      },
              { icon: 'ti-cpu',       label: 'Model: Isolation Forest' },
            ].map(tag => (
              <span key={tag.label} style={{
                fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 20,
                background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.06)',
                color: '#475569', display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <i className={`ti ${tag.icon}`} style={{ fontSize: 12 }} aria-hidden />
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA — soft ── */}
      <section style={{
        background: 'linear-gradient(135deg, #DCFCE7 0%, #DBEAFE 50%, #EDE9FE 100%)',
        borderRadius: 20, padding: '28px 32px', textAlign: 'center',
        position: 'relative', overflow: 'hidden', marginTop: 20,
        border: '1.5px solid #E2E8F0',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(22,163,74,0.1)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Ingin melihat prediksi ke depan?</div>
          <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, marginBottom: 16 }}>
            Gunakan tab Prediksi untuk melihat forecast kualitas udara 3 jam ke depan menggunakan model Random Forest.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: 'ti-crystal-ball', label: 'Lihat Prediksi', bg: '#EDE9FE', border: '#C4B5FD', color: '#3B0764' },
              { icon: 'ti-chart-line',   label: 'Grafik & Tren', bg: '#DBEAFE', border: '#93C5FD', color: '#1E3A8A' },
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

export default DeteksiAnomali;