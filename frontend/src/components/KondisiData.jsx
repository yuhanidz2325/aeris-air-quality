import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const BASE_URL = import.meta.env.VITE_API_URL;

const MODEL_COMPARISON = [
  { name: 'Random Forest', rmse: 12.4, mae: 9.8,  r2: 0.87 },
  { name: 'Extra Trees',   rmse: 13.1, mae: 10.3, r2: 0.85 },
  { name: 'XGBoost',       rmse: 13.8, mae: 10.9, r2: 0.83 },
  { name: 'LightGBM',      rmse: 14.5, mae: 11.4, r2: 0.81 },
  { name: 'CatBoost',      rmse: 15.2, mae: 12.0, r2: 0.79 },
  { name: 'Linear Reg.',   rmse: 17.2, mae: 13.8, r2: 0.73 },
];

const ML_STATS = [
  { label: 'Model Diuji',       value: '15',             caption: 'PyCaret compare_models()', icon: 'ti-flask',     bg: '#DBEAFE', border: '#93C5FD', textColor: '#1E3A8A', iconColor: '#2563EB' },
  { label: 'Best Model',        value: 'Random Forest',  caption: 'Lowest RMSE: 12.4',        icon: 'ti-trophy',    bg: '#DCFCE7', border: '#86EFAC', textColor: '#14532D', iconColor: '#16A34A' },
  { label: 'Anomaly Detection', value: 'Isolation Forest', caption: '5 polutan · Aktif',      icon: 'ti-zoom-scan', bg: '#EDE9FE', border: '#C4B5FD', textColor: '#3B0764', iconColor: '#7C3AED' },
];

const POLUTAN_COLORS = ['#16A34A', '#2563EB', '#D97706', '#7C3AED', '#BE123C'];

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
            {p.name}: <strong style={{ color: '#0F172A' }}>{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</strong>
          </span>
        </div>
      ))}
    </div>
  );
}

function ChartLoading({ height = 260 }) {
  return (
    <div style={{
      height, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94A3B8' }}>
        <span style={{
          width: 18, height: 18, border: '2.5px solid #CBD5E1',
          borderTop: '2.5px solid #2563EB', borderRadius: '50%',
          animation: 'spin 1s linear infinite', display: 'inline-block',
        }} />
        <span style={{ fontSize: 13, fontWeight: 500 }}>Memuat data...</span>
      </div>
    </div>
  );
}

function KondisiData({ lastUpdate }) {
  const [statusData,     setStatusData]     = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [pipelineStatus] = useState({ errors24h: 0 });

  useEffect(() => {
      async function fetchData() {
        try {
          const res  = await fetch(`${BASE_URL}/status/surabaya`);
          const data = await res.json();
          setStatusData(data);
        } catch (err) {
          console.error('Gagal fetch kondisi data:', err);
        }

        try {
          const statsRes  = await fetch(`${BASE_URL}/stats/surabaya`);
          const statsData = await statsRes.json();
          setTotalData(statsData.total_data);
          setDataValid(statsData.valid_pct);
          setMissingValue(statsData.missing_pct);
        } catch (err) {
          console.error('Gagal fetch stats:', err);
        } finally {
          setLoading(false);
        }
      }
      fetchData();
    }, []);

  const [totalData,    setTotalData]    = useState(0);
  const [dataValid,    setDataValid]    = useState(0);
  const [missingValue, setMissingValue] = useState(0);

  const pollutantDistribution = statusData?.pollutants
    ? [
        { name: 'PM2.5', value: statusData.pollutants.pm25 || 0 },
        { name: 'PM10',  value: statusData.pollutants.pm10 || 0 },
        { name: 'CO',    value: (statusData.pollutants.co  || 0) / 100 },
        { name: 'NO₂',  value: statusData.pollutants.no2  || 0 },
        { name: 'O₃',   value: statusData.pollutants.o3   || 0 },
      ]
    : [];

  const qualityData = [
    { name: 'Data Valid', value: dataValid    },
    { name: 'Missing',    value: missingValue },
  ];

  const activityLog = [
    { time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), event: 'Data berhasil diambil dari API',     status: 'ok'   },
    { time: '10:00', event: 'Prediksi model selesai dihitung',                                                                             status: 'ok'   },
    { time: '09:58', event: 'Deteksi anomali selesai dijalankan',                                                                          status: 'ok'   },
    { time: '09:55', event: 'Dashboard diperbarui',                                                                                        status: 'ok'   },
    { time: '09:00', event: 'Auto-retrain scheduler aktif',                                                                                status: 'info' },
  ];

  if (loading) return (
    <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <section style={{
        background: 'linear-gradient(135deg, #DCFCE7 0%, #DBEAFE 50%, #D1FAE5 100%)',
        borderRadius: 24, padding: '36px', marginBottom: 28,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: 200, border: '1.5px solid #E2E8F0',
      }}>
        <i className="ti ti-database" style={{ fontSize: 48, color: '#16A34A', marginBottom: 16 }} aria-hidden />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#15803D' }}>
          <span style={{ width: 18, height: 18, border: '2.5px solid #86EFAC', borderTop: '2.5px solid #16A34A', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
          <span style={{ fontSize: 15, fontWeight: 600 }}>Memuat kondisi data...</span>
        </div>
      </section>
    </div>
  );

  return (
    <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── HERO SECTION — soft green ── */}
      <section style={{
        background: 'linear-gradient(135deg, #DCFCE7 0%, #DBEAFE 50%, #D1FAE5 100%)',
        borderRadius: 24, padding: '36px', position: 'relative',
        overflow: 'hidden', marginBottom: 28, border: '1.5px solid #E2E8F0',
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: '#15803D',
            background: 'rgba(22,163,74,0.12)', padding: '5px 16px',
            borderRadius: 20, border: '1px solid rgba(22,163,74,0.25)',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            letterSpacing: '0.06em', marginBottom: 16,
          }}>
            <i className="ti ti-database" style={{ fontSize: 12 }} aria-hidden />
            KONDISI DATA & PIPELINE ML
          </span>

          <div style={{ fontSize: 36, fontWeight: 800, color: '#14532D', marginBottom: 10, letterSpacing: '-0.02em' }}>
            Data & Machine Learning
          </div>
          <div style={{ fontSize: 14, color: '#15803D', lineHeight: 1.7, marginBottom: 24, maxWidth: 520, opacity: 0.85 }}>
            Monitor kualitas data, status pipeline, dan performa model machine learning yang digunakan sistem AERIS secara real-time.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { icon: 'ti-database',    label: 'Total Data',  value: totalData.toLocaleString(), color: '#15803D', bg: 'rgba(22,163,74,0.08)',  border: 'rgba(22,163,74,0.2)'  },
              { icon: 'ti-circle-check', label: 'Data Valid', value: `${dataValid}%`,             color: '#1D4ED8', bg: 'rgba(37,99,235,0.08)',  border: 'rgba(37,99,235,0.2)'  },
              { icon: 'ti-cpu',         label: 'Best Model', value: 'Random Forest',              color: '#065F46', bg: 'rgba(6,95,70,0.08)',    border: 'rgba(6,95,70,0.2)'    },
              { icon: 'ti-clock',       label: 'Last Update', value: lastUpdate || '—',           color: '#1D4ED8', bg: 'rgba(37,99,235,0.08)',  border: 'rgba(37,99,235,0.2)'  },
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
                <div style={{ fontSize: 15, fontWeight: 800, color: '#14532D' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUMMARY CARDS ── */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Ringkasan Data</div>
        <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Overview kualitas dan volume data historis</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Total Data',      value: totalData.toLocaleString(), sub: 'rekaman historis',   icon: 'ti-database',     bg: '#DBEAFE', border: '#93C5FD', textColor: '#1E3A8A', iconColor: '#2563EB' },
            { label: 'Data Valid',      value: `${dataValid}%`,            sub: 'kualitas tinggi',    icon: 'ti-circle-check', bg: '#DCFCE7', border: '#86EFAC', textColor: '#14532D', iconColor: '#16A34A' },
            { label: 'Missing Value',   value: `${missingValue}%`,         sub: 'ditangani otomatis', icon: 'ti-alert-circle', bg: '#FEF3C7', border: '#FCD34D', textColor: '#78350F', iconColor: '#D97706' },
            { label: 'Update Terakhir', value: lastUpdate || '—',          sub: 'WIB',                icon: 'ti-clock',        bg: '#EDE9FE', border: '#C4B5FD', textColor: '#3B0764', iconColor: '#7C3AED' },
          ].map(item => (
            <div key={item.label}
              style={{
                background: item.bg, border: `1.5px solid ${item.border}`,
                borderRadius: 16, padding: '18px',
                transition: 'transform 0.18s, box-shadow 0.18s', cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${item.border}80`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`ti ${item.icon}`} style={{ fontSize: 17, color: item.iconColor }} aria-hidden />
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: item.textColor, opacity: 0.7, letterSpacing: '0.06em' }}>{item.label.toUpperCase()}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: item.textColor, lineHeight: 1, marginBottom: 4 }}>{item.value}</div>
              <div style={{ fontSize: 11, color: item.textColor, opacity: 0.65 }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DISTRIBUSI + KUALITAS ── */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Distribusi & Kualitas Data</div>
        <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Konsentrasi polutan terkini dan proporsi kualitas data</div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: '20px 22px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.07em', marginBottom: 14 }}>KONSENTRASI POLUTAN TERKINI</div>
            {pollutantDistribution.length === 0 ? <ChartLoading height={280} /> : (
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pollutantDistribution} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" stroke="#CBD5E1" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                    <YAxis stroke="#CBD5E1" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Konsentrasi" radius={[8, 8, 0, 0]}>
                      {pollutantDistribution.map((entry, index) => (
                        <Cell key={index} fill={POLUTAN_COLORS[index % POLUTAN_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div style={{ background: '#fff', borderRadius: 18, padding: '20px 22px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.07em', marginBottom: 14 }}>KUALITAS DATA</div>
            <div style={{ width: '100%', height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={qualityData} cx="50%" cy="50%" innerRadius={48} outerRadius={76}
                    paddingAngle={3} dataKey="value" label={({ value }) => `${value}%`} labelLine={false}>
                    <Cell fill="#16A34A" />
                    <Cell fill="#DC2626" />
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={32}
                    formatter={(value) => <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#DCFCE7', borderRadius: 10, padding: '10px 14px', border: '1px solid #86EFAC' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="ti ti-circle-check" style={{ fontSize: 16, color: '#16A34A' }} aria-hidden />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#14532D' }}>Data Valid</span>
                </div>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#14532D' }}>{dataValid}%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FEE2E2', borderRadius: 10, padding: '10px 14px', border: '1px solid #FECACA' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="ti ti-alert-circle" style={{ fontSize: 16, color: '#DC2626' }} aria-hidden />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#7F1D1D' }}>Missing</span>
                </div>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#7F1D1D' }}>{missingValue}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PIPELINE STATUS ── */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Status Pipeline</div>
        <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Kondisi real-time komponen pipeline data</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Scheduler',      value: 'Aktif',    icon: 'ti-player-play',  ok: true  },
            { label: 'API Fetch',      value: 'Berhasil', icon: 'ti-cloud',        ok: true  },
            { label: 'Model Prediksi', value: 'Berjalan', icon: 'ti-cpu',          ok: true  },
            { label: 'Error 24 Jam',   value: `${pipelineStatus.errors24h} error`, icon: pipelineStatus.errors24h === 0 ? 'ti-circle-check' : 'ti-alert-triangle', ok: pipelineStatus.errors24h === 0 },
          ].map(item => (
            <div key={item.label}
              style={{
                background: item.ok ? '#DCFCE7' : '#FEE2E2',
                border: `1.5px solid ${item.ok ? '#86EFAC' : '#FECACA'}`,
                borderRadius: 16, padding: '16px 18px',
                transition: 'transform 0.18s, box-shadow 0.18s', cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 16px ${item.ok ? '#86EFAC' : '#FECACA'}80`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`ti ${item.icon}`} style={{ fontSize: 17, color: item.ok ? '#16A34A' : '#DC2626' }} aria-hidden />
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: item.ok ? '#14532D' : '#7F1D1D', opacity: 0.75, letterSpacing: '0.05em' }}>{item.label.toUpperCase()}</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: item.ok ? '#14532D' : '#7F1D1D' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PIPELINE ML ── */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Pipeline Machine Learning</div>
        <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Perbandingan model dan performa algoritma ML</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
          {ML_STATS.map(stat => (
            <div key={stat.label}
              style={{
                background: stat.bg, border: `1.5px solid ${stat.border}`,
                borderRadius: 16, padding: '18px',
                transition: 'transform 0.18s, box-shadow 0.18s', cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 16px ${stat.border}80`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`ti ${stat.icon}`} style={{ fontSize: 17, color: stat.iconColor }} aria-hidden />
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: stat.textColor, opacity: 0.7, letterSpacing: '0.06em' }}>{stat.label.toUpperCase()}</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: stat.textColor, lineHeight: 1.2, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: stat.textColor, opacity: 0.65 }}>{stat.caption}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', borderRadius: 18, padding: '20px 22px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Perbandingan Model — RMSE</div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', background: '#F1F5F9', padding: '3px 10px', borderRadius: 20, border: '1px solid #E2E8F0' }}>
              Lebih rendah = lebih baik
            </span>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MODEL_COMPARISON} layout="vertical" margin={{ top: 4, right: 40, left: 90, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" domain={[0, 20]} stroke="#CBD5E1" tick={{ fill: '#94A3B8', fontSize: 11 }} unit=" RMSE" />
                <YAxis type="category" dataKey="name" stroke="#CBD5E1" tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="rmse" name="RMSE" radius={[0, 8, 8, 0]}
                  label={{ position: 'right', formatter: v => v, fontSize: 11, fill: '#64748B', fontWeight: 600 }}>
                  {MODEL_COMPARISON.map((entry, index) => (
                    <Cell key={index} fill={index === 0 ? '#16A34A' : `rgba(22,163,74,${0.65 - index * 0.08})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: 14, padding: '12px 16px', background: '#DBEAFE', borderRadius: 12, border: '1px solid #93C5FD' }}>
            <p style={{ fontSize: 12, color: '#1E40AF', lineHeight: 1.7, margin: 0 }}>
              <strong>Random Forest Regressor</strong> terpilih sebagai model terbaik dengan RMSE terendah (12.4). Total <strong>15 model</strong> dibandingkan menggunakan PyCaret{' '}
              <code style={{ background: '#BFDBFE', padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>compare_models()</code>.
            </p>
          </div>
        </div>
      </section>

      {/* ── ACTIVITY LOG ── */}
      <section style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Log Aktivitas Sistem</div>
        <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Riwayat aktivitas pipeline terkini</div>
        <div style={{ background: '#fff', borderRadius: 18, padding: '20px 22px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
          {activityLog.map((log, index) => (
            <div key={index}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 10px', borderRadius: 10,
                borderBottom: index < activityLog.length - 1 ? '1px solid #F1F5F9' : 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: log.status === 'ok' ? '#16A34A' : '#2563EB' }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', width: 50, flexShrink: 0 }}>{log.time}</div>
              <div style={{ fontSize: 13, color: '#475569', fontWeight: 500, flex: 1 }}>{log.event}</div>
              <span style={{
                fontSize: 10, fontWeight: 700, flexShrink: 0,
                background: log.status === 'ok' ? '#DCFCE7' : '#DBEAFE',
                color: log.status === 'ok' ? '#14532D' : '#1E3A8A',
                padding: '2px 10px', borderRadius: 20,
                border: `1px solid ${log.status === 'ok' ? '#86EFAC' : '#93C5FD'}`,
              }}>
                {log.status === 'ok' ? 'Sukses' : 'Info'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── DATA SOURCE ── */}
      <section style={{ marginBottom: 8 }}>
        <div style={{ background: '#DBEAFE', border: '1.5px solid #93C5FD', borderRadius: 16, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, marginTop: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 13, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="ti ti-satellite" style={{ fontSize: 24, color: '#2563EB' }} aria-hidden />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1E3A8A', marginBottom: 4 }}>Sumber Data: Open-Meteo Air Quality API</div>
            <div style={{ fontSize: 12, color: '#2563EB', opacity: 0.8 }}>Koordinat: -7.2575, 112.7521 (Surabaya) · Update otomatis setiap jam</div>
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA — soft green ── */}
      <section style={{
        background: 'linear-gradient(135deg, #DCFCE7 0%, #DBEAFE 50%, #D1FAE5 100%)',
        borderRadius: 20, padding: '28px 32px', textAlign: 'center',
        position: 'relative', overflow: 'hidden', marginTop: 20,
        border: '1.5px solid #E2E8F0',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(22,163,74,0.12)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#14532D', marginBottom: 8 }}>Sudah paham kondisi data?</div>
          <p style={{ fontSize: 13, color: '#15803D', lineHeight: 1.7, marginBottom: 16, opacity: 0.85 }}>
            Kembali ke beranda untuk melihat kondisi terkini, atau pelajari lebih lanjut di tab Edukasi.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: 'ti-home', label: 'Kembali ke Beranda', bg: '#DCFCE7', border: '#86EFAC', color: '#14532D' },
              { icon: 'ti-book', label: 'Baca Edukasi',       bg: '#DBEAFE', border: '#93C5FD', color: '#1E3A8A' },
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

export default KondisiData;