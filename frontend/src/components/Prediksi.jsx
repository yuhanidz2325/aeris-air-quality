import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line,
  CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine
} from 'recharts';
import { POLUTAN_CONFIG } from '../constants';

const BASE_URL = import.meta.env.VITE_API_URL;

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
            {p.name}: <strong style={{ color: '#0F172A' }}>
              {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
            </strong>
          </span>
        </div>
      ))}
    </div>
  );
}

function ChartLoading() {
  return (
    <div style={{
      height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center',
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

function Prediksi() {
  const [predictions,     setPredictions]     = useState(null);
  const [segment,         setSegment]         = useState('');
  const [chartData,       setChartData]       = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(false);
  const [selectedPolutan, setSelectedPolutan] = useState('pm25');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(false);
      try {
        const predRes  = await fetch(`${BASE_URL}/predict/surabaya`);
        const predData = await predRes.json();
        setPredictions(predData.predictions);
        setSegment(predData.segment);

        const now       = new Date();
        const endDate   = now.toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString().split('T')[0];

        const histRes  = await fetch(
          `${BASE_URL}/history/surabaya?start_date=${startDate}&end_date=${endDate}&parameter=${selectedPolutan}`
        );
        const histJson = await histRes.json();
        const histData = Array.isArray(histJson) ? histJson : [];
        const recent   = histData.slice(-8);

        const points = [];
        recent.forEach(item => {
          points.push({
            time:      item.timestamp ? item.timestamp.slice(11, 16) : '00:00',
            actual:    item.value ?? 0,
            predicted: null,
          });
        });

        const currentHour = now.getHours();
        if (predData.predictions?.[selectedPolutan]) {
          const preds = predData.predictions[selectedPolutan];
          for (let i = 0; i < Math.min(3, preds.length); i++) {
            const hour = (currentHour + i + 1 + 24) % 24;
            points.push({
              time:      `${String(hour).padStart(2, '0')}:00`,
              actual:    null,
              predicted: preds[i],
            });
          }
        }
        setChartData(points);
      } catch (err) {
        console.error('Gagal memuat prediksi:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedPolutan]);

  const generateInsight = () => {
    if (!predictions) return 'Data prediksi belum tersedia.';
    const parts = [];
    Object.entries(POLUTAN_CONFIG).forEach(([key, cfg]) => {
      const preds = predictions[key] || [];
      if (!preds.length) return;
      const avg   = preds.reduce((a, b) => a + b, 0) / preds.length;
      const trend = preds[preds.length - 1] > preds[0] ? 'meningkat'
                  : preds[preds.length - 1] < preds[0] ? 'menurun' : 'stabil';
      parts.push(`${cfg.label} diprediksi ${trend} pada rata-rata ${avg.toFixed(1)} ${cfg.unit} — kondisi ${avg <= cfg.batas ? 'aman' : 'perlu perhatian'}`);
    });
    return parts.join('. ') + '. Secara umum kualitas udara Kota Surabaya diperkirakan tetap terkendali dalam 3 jam ke depan.';
  };

  const btnBase = {
    fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 20,
    cursor: 'pointer', fontFamily: 'inherit', border: '1.5px solid #E2E8F0',
    background: '#F8FAFC', color: '#64748B', transition: 'all 0.18s ease',
  };

  if (loading) return (
    <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <section style={{
        background: 'linear-gradient(145deg, #0B1F3A 0%, #0D3B6E 55%, #1058A8 100%)',
        borderRadius: 24, padding: '36px', marginBottom: 28,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: 200,
      }}>
        <i className="ti ti-crystal-ball" style={{ fontSize: 48, color: '#475569', marginBottom: 16 }} aria-hidden />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94A3B8' }}>
          <span style={{ width: 18, height: 18, border: '2.5px solid #475569', borderTop: '2.5px solid #60A5FA', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
          <span style={{ fontSize: 15, fontWeight: 600 }}>Memuat prediksi...</span>
        </div>
      </section>
    </div>
  );

  if (error) return (
    <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <section style={{
        background: 'linear-gradient(145deg, #3B0000 0%, #7F1D1D 55%, #DC2626 100%)',
        borderRadius: 24, padding: '36px', marginBottom: 28,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: 200,
      }}>
        <i className="ti ti-alert-circle" style={{ fontSize: 48, color: '#FECACA', marginBottom: 16 }} aria-hidden />
        <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Gagal Memuat Prediksi</div>
        <div style={{ fontSize: 13, color: '#FCA5A5' }}>Silakan coba lagi nanti.</div>
      </section>
    </div>
  );

  return (
    <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── HERO SECTION ── */}
      <section style={{
        background: 'linear-gradient(145deg, #1E0B4B 0%, #3B1F8C 55%, #5B3ACA 100%)',
        borderRadius: 24, padding: '36px', position: 'relative', overflow: 'hidden', marginBottom: 28,
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(139,92,246,0.2)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: '#C4B5FD',
            background: 'rgba(139,92,246,0.2)', padding: '5px 16px',
            borderRadius: 20, border: '1px solid rgba(139,92,246,0.4)',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            letterSpacing: '0.06em', marginBottom: 16,
          }}>
            <i className="ti ti-crystal-ball" style={{ fontSize: 12 }} aria-hidden />
            PREDIKSI KUALITAS UDARA · 3 JAM KE DEPAN
          </span>

          <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 10, letterSpacing: '-0.02em' }}>
            Forecast Polutan Surabaya
          </div>
          <div style={{ fontSize: 14, color: '#A78BFA', lineHeight: 1.7, marginBottom: 24, maxWidth: 520 }}>
            Prediksi konsentrasi polutan udara 3 jam ke depan menggunakan model machine learning Random Forest yang telah dilatih dengan data historis Surabaya.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { icon: 'ti-cpu',       label: 'Model Aktif',    value: 'Random Forest',        color: '#C4B5FD' },
              { icon: 'ti-clock',     label: 'Segmen Waktu',   value: segment || '—',         color: '#34D399' },
              { icon: 'ti-chart-bar', label: 'Akurasi (R²)',   value: '87%',                  color: '#60A5FA' },
              { icon: 'ti-target',    label: 'Horizon',        value: '3 jam ke depan',       color: '#FCD34D' },
            ].map(item => (
              <div key={item.label} style={{
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 12, padding: '12px 14px', borderLeft: `3px solid ${item.color}`,
                transition: 'background 0.2s, transform 0.2s', cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <i className={`ti ${item.icon}`} style={{ fontSize: 16, color: item.color, display: 'block', marginBottom: 6 }} aria-hidden />
                <div style={{ fontSize: 10, fontWeight: 700, color: '#7C6BBB', marginBottom: 3, letterSpacing: '0.06em' }}>{item.label.toUpperCase()}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PILIH POLUTAN ── */}
      <section style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Pilih Parameter</div>
        <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Pilih polutan untuk melihat detail prediksi dan grafik</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {Object.entries(POLUTAN_CONFIG).map(([key, cfg]) => {
            const s      = POLUTAN_STYLE[key];
            const active = selectedPolutan === key;
            return (
              <button key={key} onClick={() => setSelectedPolutan(key)}
                style={{
                  fontSize: 13, fontWeight: 700, padding: '10px 22px', borderRadius: 20,
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

      {/* ── KARTU PREDIKSI PER POLUTAN ── */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Prediksi +3 Jam per Polutan</div>
        <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Nilai prediksi pada jam ke-3 untuk setiap parameter</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {Object.entries(POLUTAN_CONFIG).map(([key, cfg]) => {
            const s      = POLUTAN_STYLE[key];
            const preds  = predictions?.[key] || [];
            const value  = preds.length > 0 ? preds[preds.length - 1] : 0;
            const isWarn = value > cfg.batas;
            const isSelected = selectedPolutan === key;
            return (
              <div key={key}
                onClick={() => setSelectedPolutan(key)}
                style={{
                  background: isWarn ? '#FEE2E2' : s.bg,
                  border: `1.5px solid ${isSelected ? '#7C3AED' : isWarn ? '#FECACA' : s.border}`,
                  borderRadius: 16, padding: '16px 14px',
                  borderTop: `4px solid ${isWarn ? '#DC2626' : s.color}`,
                  transition: 'transform 0.18s, box-shadow 0.18s',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 0 0 2px #7C3AED40' : 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${isWarn ? '#FECACA' : s.border}80`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isSelected ? '0 0 0 2px #7C3AED40' : 'none'; }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: isWarn ? '#7F1D1D' : s.textColor, marginBottom: 8 }}>{cfg.label}</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: isWarn ? '#DC2626' : s.textColor, lineHeight: 1, marginBottom: 6 }}>
                  {value.toFixed(1)}
                </div>
                <div style={{ fontSize: 11, color: isWarn ? '#DC2626' : s.color, fontWeight: 600, marginBottom: 10 }}>{cfg.unit}</div>
                {isWarn ? (
                  <span style={{ fontSize: 10, fontWeight: 700, background: '#FEE2E2', color: '#7F1D1D', padding: '3px 8px', borderRadius: 20, border: '1px solid #FECACA', display: 'inline-block' }}>
                    ⚠ Di atas batas
                  </span>
                ) : (
                  <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(255,255,255,0.6)', color: s.textColor, padding: '3px 8px', borderRadius: 20, display: 'inline-block' }}>
                    ✓ Aman
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── GRAFIK AKTUAL VS PREDIKSI ── */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 3 }}>
              Grafik {POLUTAN_CONFIG[selectedPolutan].label} — Aktual vs Prediksi
            </div>
            <div style={{ fontSize: 13, color: '#64748B' }}>
              8 jam historis + 3 jam prediksi ke depan
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569', fontWeight: 500 }}>
              <span style={{ width: 20, height: 3, background: POLUTAN_STYLE[selectedPolutan].color, borderRadius: 2, display: 'inline-block' }} />
              Aktual
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569', fontWeight: 500 }}>
              <span style={{ width: 20, height: 2, background: '#7C3AED', borderRadius: 2, display: 'inline-block' }} />
              Prediksi
            </span>
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 18, padding: '20px 22px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="time" stroke="#CBD5E1" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis stroke="#CBD5E1" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={POLUTAN_CONFIG[selectedPolutan].batas}
                  stroke="#DC2626" strokeDasharray="5 5" strokeWidth={1.5}
                  label={{ value: 'Batas', fill: '#DC2626', fontSize: 10, fontWeight: 700, position: 'insideTopRight' }}
                />
                <Line type="monotone" dataKey="actual"
                  stroke={POLUTAN_STYLE[selectedPolutan].color} strokeWidth={2.5}
                  dot={{ r: 4, stroke: '#fff', strokeWidth: 2, fill: POLUTAN_STYLE[selectedPolutan].color }}
                  activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2 }}
                  name="Aktual" connectNulls={false} />
                <Line type="monotone" dataKey="predicted"
                  stroke="#7C3AED" strokeDasharray="6 4" strokeWidth={2.5}
                  dot={{ r: 4, stroke: '#fff', strokeWidth: 2, fill: '#7C3AED' }}
                  activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2 }}
                  name="Prediksi" connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ── INSIGHT SECTION ── */}
      <section style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Insight Prediksi</div>
        <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Analisis otomatis berdasarkan hasil prediksi model</div>
        <div style={{ background: '#DBEAFE', border: '1.5px solid #93C5FD', borderRadius: 18, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ti ti-bulb" style={{ fontSize: 22, color: '#2563EB' }} aria-hidden />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>Insight Prediksi 3 Jam ke Depan</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Berdasarkan model {segment || 'aktif'}</div>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.65)', borderRadius: 12, padding: '14px 18px', fontSize: 13, lineHeight: 1.8, color: '#475569', marginBottom: 16 }}>
            {generateInsight()}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { icon: 'ti-cpu',     label: 'Model: Random Forest' },
              { icon: 'ti-clock',   label: 'Horizon: 3 jam'       },
              { icon: 'ti-refresh', label: 'Update: setiap jam'   },
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

      {/* ── FOOTER CTA ── */}
      <section style={{
        background: 'linear-gradient(145deg, #1E0B4B 0%, #3B1F8C 60%, #5B3ACA 100%)',
        borderRadius: 20, padding: '28px 32px', textAlign: 'center',
        position: 'relative', overflow: 'hidden', marginTop: 20,
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(139,92,246,0.2)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
            Ingin melihat data lebih lengkap?
          </div>
          <p style={{ fontSize: 13, color: '#A78BFA', lineHeight: 1.7, marginBottom: 16 }}>
            Jelajahi tab Kondisi Data untuk melihat pipeline ML, perbandingan model, dan kualitas data secara mendalam.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: 'ti-database',      label: 'Kondisi Data',  color: '#C4B5FD' },
              { icon: 'ti-alert-triangle', label: 'Lihat Anomali', color: '#FCD34D' },
            ].map(btn => (
              <span key={btn.label} style={{
                fontSize: 12, fontWeight: 700, padding: '8px 18px', borderRadius: 20,
                background: 'rgba(255,255,255,0.08)', border: `1px solid ${btn.color}40`,
                color: btn.color, display: 'flex', alignItems: 'center', gap: 7,
                cursor: 'default', transition: 'all 0.18s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
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

export default Prediksi;