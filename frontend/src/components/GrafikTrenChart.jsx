// v3 - fix fetch all pollutants
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend, Cell
} from 'recharts';

import { POLUTAN_CONFIG } from '../constants';

const RENTANG_OPTIONS = [
  { key: '1d',  label: 'Hari ini',     days: 1  },
  { key: '7d',  label: '7 hari',       days: 7  },
  { key: '30d', label: '1 bulan',      days: 30 },
];

const COMPARE_OPTIONS = [
  { key: 'today', label: 'Hari ini' },
  { key: '24h', label: '24 jam terakhir' },
  { key: '7d_avg', label: '7 hari rata-rata' },
];

// ── Custom Tooltip ──────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: '#fff', border: '0.5px solid #D3D1C7',
      borderRadius: 8, padding: '8px 12px', fontSize: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>
      <p style={{ color: '#888780', marginBottom: 4, fontWeight: 500 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 500, margin: '2px 0' }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</strong> {p.unit || ''}
        </p>
      ))}
    </div>
  );
}

// ── Grafik satu polutan dengan highlight max/min ─────────────
function GrafikPolutan({ data, polutanKey, showBatas = true, compareMode = 'today' }) {
  const cfg = POLUTAN_CONFIG[polutanKey];
  
  if (!data || data.length === 0) return (
    <p style={{ fontSize: 12, color: '#888780', textAlign: 'center', padding: 20 }}>
      Memuat data...
    </p>
  );

  // Find max and min points with fallback protection
  const vals = data.map(d => d[polutanKey]).filter(v => v !== null && v !== undefined && !isNaN(v));
  const validVals = vals.length > 0 ? vals : [0];
  const maxVal = Math.max(...validVals);
  const minVal = Math.min(...validVals);
  const maxPoint = data.find(d => d[polutanKey] === maxVal);
  const minPoint = data.find(d => d[polutanKey] === minVal);

  // Custom dot renderer for highlighting max/min
  const CustomDot = (props) => {
    const { cx, cy, payload, index } = props;
    const value = payload[polutanKey];
    
    // Highlight max point
    if (value === maxVal && maxVal > 0) {
      return (
        <g key={index}>
          <circle cx={cx} cy={cy} r={6} fill={cfg.color} stroke="#fff" strokeWidth={2} />
          <circle cx={cx} cy={cy} r={3} fill="#fff" />
        </g>
      );
    }
    // Highlight min point
    if (value === minVal && minVal > 0) {
      return (
        <g key={index}>
          <circle cx={cx} cy={cy} r={5} fill={cfg.color} stroke="#fff" strokeWidth={2} opacity={0.7} />
        </g>
      );
    }
    return null;
  };

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 12, right: 20, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${polutanKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={cfg.color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={cfg.color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="timestamp" 
            stroke="#888780" 
            fontSize={10} 
            tick={{ fill: '#888780' }} 
            interval="preserveStartEnd"
            tickFormatter={(value) => {
              if (compareMode === 'today') return value.split(' ')[1] || value;
              return value.slice(0, 5);
            }}
          />
          <YAxis 
            stroke="#888780" 
            fontSize={10} 
            tick={{ fill: '#888780' }} 
            domain={[0, 'dataMax + 10']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={20}
            formatter={() => [
              <span key="line" style={{ color: cfg.color }}>● {cfg.label}</span>,
              <span key="max" style={{ marginLeft: 12, color: '#E24B4A' }}>▲ Maks: {maxVal.toFixed(1)}</span>,
              <span key="min" style={{ marginLeft: 12, color: '#1D9E75' }}>▼ Min: {minVal.toFixed(1)}</span>,
            ]}
          />
          {showBatas && (
            <ReferenceLine 
              y={cfg.batas} 
              stroke="#E24B4A" 
              strokeDasharray="5 5"
              label={{ 
                value: `Batas Aman`, 
                fill: '#E24B4A', 
                fontSize: 9, 
                position: 'insideTopRight' 
              }} 
            />
          )}
          {/* Area fill */}
          <Line 
            type="monotone" 
            dataKey={polutanKey} 
            name={cfg.label} 
            stroke={cfg.color}
            strokeWidth={2.5} 
            dot={CustomDot}
            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            unit={cfg.unit}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* Max/Min markers info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, padding: '8px 12px', background: '#F8FAFC', borderRadius: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#E24B4A', fontSize: 14 }}>▲</span>
          <span style={{ fontSize: 11, color: '#64748B' }}>Tertinggi: <strong style={{ color: '#1F2937' }}>{maxVal.toFixed(1)} {cfg.unit}</strong></span>
          {maxPoint && <span style={{ fontSize: 10, color: '#888780' }}>({maxPoint.timestamp})</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#1D9E75', fontSize: 14 }}>▼</span>
          <span style={{ fontSize: 11, color: '#64748B' }}>Terendah: <strong style={{ color: '#1F2937' }}>{minVal.toFixed(1)} {cfg.unit}</strong></span>
          {minPoint && <span style={{ fontSize: 10, color: '#888780' }}>({minPoint.timestamp})</span>}
        </div>
      </div>
    </div>
  );
}

// ── Grafik semua polutan overlay ────────────────────────────
function GrafikOverlay({ data }) {
  if (!data || data.length === 0) return (
    <p style={{ fontSize: 12, color: '#888780', textAlign: 'center', padding: 20 }}>Memuat data...</p>
  );
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 12, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="timestamp" stroke="#888780" fontSize={10} tick={{ fill: '#888780' }} interval="preserveStartEnd" />
        <YAxis stroke="#888780" fontSize={10} tick={{ fill: '#888780' }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        {Object.entries(POLUTAN_CONFIG).map(([key, cfg]) => (
          <Line 
            key={key} 
            type="monotone" 
            dataKey={key} 
            name={cfg.label}
            stroke={cfg.color} 
            strokeWidth={2} 
            dot={false} 
            activeDot={{ r: 5 }} 
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Grafik rata-rata per jam (pola harian) ──────────────────
function GrafikPolaHarian({ data }) {
  if (!data || data.length === 0) return (
    <p style={{ fontSize: 12, color: '#888780', textAlign: 'center', padding: 20 }}>Memuat data...</p>
  );

  // Hitung rata-rata per jam dari data yang ada
  const perJam = {};
  data.forEach(item => {
    const jam = item.timestamp?.split(' ')?.[1]?.slice(0, 2) || item.timestamp?.slice(11, 13);
    if (!jam) return;
    if (!perJam[jam]) perJam[jam] = { count: 0, total: 0 };
    perJam[jam].count += 1;
    perJam[jam].total += item.pm25 || 0;
  });

  const avgData = Object.entries(perJam)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([jam, v]) => ({
      jam: `${jam}:00`,
      'Rata-rata PM2.5': parseFloat((v.total / v.count).toFixed(1)),
    }));

  // Find peak hours
  const peakHour = avgData.reduce((a, b) => a['Rata-rata PM2.5'] > b['Rata-rata PM2.5'] ? a : b);
  const lowHour = avgData.reduce((a, b) => a['Rata-rata PM2.5'] < b['Rata-rata PM2.5'] ? a : b);

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={avgData} margin={{ top: 12, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="jam" stroke="#888780" fontSize={10} tick={{ fill: '#888780' }} interval={2} />
          <YAxis stroke="#888780" fontSize={10} tick={{ fill: '#888780' }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={55} stroke="#E24B4A" strokeDasharray="5 5" label={{ value: 'Batas', fill: '#E24B4A', fontSize: 9 }} />
          <Bar dataKey="Rata-rata PM2.5" radius={[4, 4, 0, 0]}>
            {avgData.map((entry, index) => {
              const isPeak = entry.jam === peakHour.jam;
              const isLow = entry.jam === lowHour.jam;
              return (
                <Cell 
                  key={`cell-${index}`} 
                  fill={isPeak ? '#E24B4A' : isLow ? '#1D9E75' : '#1D9E75'}
                  opacity={isPeak || isLow ? 1 : 0.7}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Pola summary */}
      <div style={{ display: 'flex', gap: 16, marginTop: 10, padding: '10px 14px', background: '#F8FAFC', borderRadius: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#E24B4A', fontSize: 14 }}>📈</span>
          <span style={{ fontSize: 11, color: '#64748B' }}>Puncak: <strong style={{ color: '#1F2937' }}>{peakHour.jam}</strong> ({peakHour['Rata-rata PM2.5']} µg/m³)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#1D9E75', fontSize: 14 }}>📉</span>
          <span style={{ fontSize: 11, color: '#64748B' }}>Terendah: <strong style={{ color: '#1F2937' }}>{lowHour.jam}</strong> ({lowHour['Rata-rata PM2.5']} µg/m³)</span>
        </div>
      </div>
    </div>
  );
}

// ── Komponen utama Tab Grafik & Tren ────────────────────────
function GrafikTren({ baseUrl }) {
  const [rentang, setRentang]       = useState('7d');
  const [polutanAktif, setPolutanAktif] = useState('pm25');
  const [viewMode, setViewMode]     = useState('individual'); // individual | overlay | harian
  const [compareMode, setCompareMode] = useState('today'); // today | 24h | 7d_avg
  const [data, setData]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(false);

  useEffect(() => {
      async function fetchData() {
        setLoading(true);
        setError(false);
        try {
          const days      = RENTANG_OPTIONS.find(r => r.key === rentang)?.days || 7;
          const endDate   = new Date().toISOString().split('T')[0];
          const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
            .toISOString().split('T')[0];

          const POLLUTANT_KEYS = ['pm25', 'pm10', 'co', 'no2', 'o3'];

          const fetchOne = async (param) => {
            const res = await fetch(
              `${baseUrl}/history/surabaya?start_date=${startDate}&end_date=${endDate}&parameter=${param}`
            );
            const json = await res.json();
            return Array.isArray(json) ? json : [];
          };

          const activeRows = await fetchOne(polutanAktif);

          const byTimestamp = {};
          activeRows.forEach(item => {
            const ts = item.timestamp
              ? item.timestamp.slice(5, 16).replace('T', ' ')
              : '';
            if (!byTimestamp[ts]) {
              byTimestamp[ts] = {
                timestamp: ts,
                pm25: 0, pm10: 0, co: 0, no2: 0, o3: 0,
              };
            }
            byTimestamp[ts][polutanAktif] = item.value ?? 0;
          });

          // Selalu fetch semua polutan (untuk ringkasan + overlay)
          const otherKeys = POLLUTANT_KEYS.filter(k => k !== polutanAktif);
          const otherResults = await Promise.all(otherKeys.map(fetchOne));

          otherKeys.forEach((param, idx) => {
            otherResults[idx].forEach(item => {
              const ts = item.timestamp
                ? item.timestamp.slice(5, 16).replace('T', ' ')
                : '';
              if (!byTimestamp[ts]) {
                byTimestamp[ts] = {
                  timestamp: ts,
                  pm25: 0, pm10: 0, co: 0, no2: 0, o3: 0,
                };
              }
              byTimestamp[ts][param] = item.value ?? 0;
            });
          });

          const formatted = Object.values(byTimestamp).sort((a, b) =>
            a.timestamp.localeCompare(b.timestamp)
          );

          setData(formatted);
          
        } catch (err) {
          console.error('Gagal fetch history:', err);
          setError(true);
        } finally {
          setLoading(false);
        }
      }
      fetchData();
    }, [baseUrl, rentang, polutanAktif, viewMode]);

  const sectionTitle = {
    fontSize: 11, fontWeight: 500, color: '#888780',
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10
  };

  const btnBase = {
    fontSize: 11, padding: '4px 12px', borderRadius: 20, cursor: 'pointer',
    border: '0.5px solid #D3D1C7', background: '#F1EFE8', color: '#5F5E5A',
    fontFamily: 'inherit'
  };
  const btnActive = {
    ...btnBase, background: '#1D9E75', color: '#fff', border: '0.5px solid #1D9E75'
  };

  // Calculate statistics with fallback protection
  const stats = (() => {
    if (!data.length) return null;
    const vals = data.map(d => d[polutanAktif]).filter(v => v !== null && v !== undefined && !isNaN(v) && v > 0);
    if (!vals.length) return null;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    const stdDev = Math.sqrt(vals.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / vals.length);
    return { avg, max, min, stdDev, count: vals.length };
  })();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Kontrol rentang waktu & view mode ───────────────────────── */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 20px' }}>
        <div style={sectionTitle}>Pengaturan Tampilan</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Time range buttons */}
          <div style={{ display: 'flex', gap: 6 }}>
            {RENTANG_OPTIONS.map(r => (
              <button key={r.key} style={rentang === r.key ? btnActive : btnBase}
                onClick={() => setRentang(r.key)}>
                {r.label}
              </button>
            ))}
          </div>
          
          <div style={{ width: 1, height: 24, background: '#E5E7EB', margin: '0 4px' }} />
          
          {/* View mode buttons */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { key: 'individual', label: 'Per polutan' },
              { key: 'overlay',    label: 'Overlay' },
              { key: 'harian',     label: 'Pola jam' },
            ].map(v => (
              <button key={v.key} style={viewMode === v.key ? btnActive : btnBase}
                onClick={() => setViewMode(v.key)}>
                {v.label}
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 24, background: '#E5E7EB', margin: '0 4px' }} />

          {/* Compare mode buttons */}
          <div style={{ display: 'flex', gap: 6 }}>
            {COMPARE_OPTIONS.map(c => (
              <button key={c.key} style={compareMode === c.key ? { ...btnBase, background: '#E6F1FB', color: '#0C447C', borderColor: '#85B7EB' } : btnBase}
                onClick={() => setCompareMode(c.key)}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── View: individual per polutan ───────────────── */}
      {viewMode === 'individual' && (
        <>
          {/* Pilih polutan */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(POLUTAN_CONFIG).map(([key, cfg]) => (
              <button key={key}
                style={polutanAktif === key
                  ? { ...btnActive, background: cfg.color, borderColor: cfg.color }
                  : btnBase}
                onClick={() => setPolutanAktif(key)}>
                {cfg.label}
              </button>
            ))}
          </div>

          {/* Statistik Summary Cards */}
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 14, borderTop: '3px solid #378ADD' }}>
                <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>Rata-rata</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#1F2937' }}>{stats.avg.toFixed(1)}</div>
                <div style={{ fontSize: 10, color: '#888780' }}>{POLUTAN_CONFIG[polutanAktif].unit}</div>
              </div>
              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 14, borderTop: '3px solid #E24B4A' }}>
                <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>Tertinggi</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#E24B4A' }}>{stats.max.toFixed(1)}</div>
                <div style={{ fontSize: 10, color: '#888780' }}>{POLUTAN_CONFIG[polutanAktif].unit}</div>
              </div>
              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 14, borderTop: '3px solid #1D9E75' }}>
                <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>Terendah</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#1D9E75' }}>{stats.min.toFixed(1)}</div>
                <div style={{ fontSize: 10, color: '#888780' }}>{POLUTAN_CONFIG[polutanAktif].unit}</div>
              </div>
              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 14, borderTop: '3px solid #534AB7' }}>
                <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>Standar Deviasi</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#534AB7' }}>{stats.stdDev.toFixed(1)}</div>
                <div style={{ fontSize: 10, color: '#888780' }}>variabilitas</div>
              </div>
              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 14, borderTop: '3px solid #EF9F27' }}>
                <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>Data Points</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#EF9F27' }}>{stats.count}</div>
                <div style={{ fontSize: 10, color: '#888780' }}>sampel</div>
              </div>
            </div>
          )}

          {/* Grafik */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={sectionTitle}>
                  Tren {POLUTAN_CONFIG[polutanAktif].label} — {RENTANG_OPTIONS.find(r => r.key === rentang)?.label}
                </div>
                <div style={{ fontSize: 12, color: '#64748B' }}>
                  Mode: {COMPARE_OPTIONS.find(c => c.key === compareMode)?.label} · {data.length} titik data
                </div>
              </div>
            </div>

            {error && <p style={{ fontSize: 12, color: '#A32D2D', padding: 20, textAlign: 'center' }}>Gagal memuat data. Coba lagi nanti.</p>}
            {loading && <p style={{ fontSize: 12, color: '#888780', padding: 20, textAlign: 'center' }}>Memuat grafik...</p>}
            {!loading && !error && <GrafikPolutan data={data} polutanKey={polutanAktif} compareMode={compareMode} />}
          </div>
        </>
      )}

      {/* ── View: overlay semua polutan ────────────────── */}
      {viewMode === 'overlay' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '18px 20px' }}>
          <div style={sectionTitle}>
            Overlay Semua Polutan — {RENTANG_OPTIONS.find(r => r.key === rentang)?.label}
          </div>
          {error   && <p style={{ fontSize: 12, color: '#A32D2D', padding: 20, textAlign: 'center' }}>Gagal memuat data.</p>}
          {loading && <p style={{ fontSize: 12, color: '#888780', padding: 20, textAlign: 'center' }}>Memuat grafik...</p>}
          {!loading && !error && <GrafikOverlay data={data} />}
          <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
            {Object.entries(POLUTAN_CONFIG).map(([key, cfg]) => (
              <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#5F5E5A' }}>
                <span style={{ width: 12, height: 3, borderRadius: 2, background: cfg.color, display: 'inline-block' }}></span>
                {cfg.label}
              </span>
            ))}
          </div>
          <p style={{ fontSize: 11, color: '#888780', marginTop: 10 }}>
            Catatan: Skala Y menggunakan normalisasi otomatis. Nilai absolut CO jauh lebih besar dari polutan lain.
          </p>
        </div>
      )}

      {/* ── View: pola harian per jam ───────────────────── */}
      {viewMode === 'harian' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '18px 20px' }}>
          <div style={sectionTitle}>
            Pola Harian PM2.5 per Jam — {RENTANG_OPTIONS.find(r => r.key === rentang)?.label}
          </div>
          {error   && <p style={{ fontSize: 12, color: '#A32D2D', padding: 20, textAlign: 'center' }}>Gagal memuat data.</p>}
          {loading && <p style={{ fontSize: 12, color: '#888780', padding: 20, textAlign: 'center' }}>Memuat grafik...</p>}
          {!loading && !error && <GrafikPolaHarian data={data} />}
          <div style={{ marginTop: 12, padding: '12px 16px', background: '#F0F9FF', borderRadius: 8, border: '0.5px solid #BAE6FD' }}>
            <p style={{ fontSize: 12, color: '#0369A1', lineHeight: 1.6, margin: 0 }}>
              <strong>📊 Insight Pola Harian:</strong> Grafik menunjukkan fluktuasi rata-rata PM2.5 berdasarkan jam. 
              Puncak konsentrasi biasanya terjadi pada jam sibuk pagi (07:00-09:00) dan malam (18:00-20:00) 
              yang berkorelasi dengan aktivitas lalu lintas. Konsentrasi terendah cenderung terjadi pada siang hari 
              ketika dispersi udara lebih baik.
            </p>
          </div>
        </div>
      )}

      {/* ── Grid 5 polutan ringkas ──────────────────────── */}
      {viewMode === 'individual' && !loading && !error && data.length > 0 && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 20px' }}>
          <div style={sectionTitle}>Ringkasan 5 Polutan — {RENTANG_OPTIONS.find(r => r.key === rentang)?.label}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            {Object.entries(POLUTAN_CONFIG).map(([key, cfg]) => {
              const vals = data.map(d => d[key] || 0).filter(v => v > 0);
              const avg  = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
              const max  = vals.length ? Math.max(...vals) : 0;
              const min  = vals.length ? Math.min(...vals) : 0;
              const overBatas = max > cfg.batas;
              return (
                <div key={key} style={{
                  background: '#F8FAFC', border: `1px solid ${overBatas ? '#F09595' : '#E5E7EB'}`,
                  borderRadius: 12, padding: 14,
                  borderTop: `3px solid ${cfg.color}`
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: cfg.color, marginBottom: 6 }}>
                    {cfg.label}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#1F2937' }}>
                    {avg.toFixed(0)}
                  </div>
                  <div style={{ fontSize: 10, color: '#888780', marginTop: 2 }}>
                    rata-rata {cfg.unit}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: '#64748B' }}>
                    <span>Min: {min.toFixed(0)}</span>
                    <span>Max: {max.toFixed(0)}</span>
                  </div>
                  {overBatas && (
                    <div style={{ fontSize: 10, color: '#A32D2D', marginTop: 6, fontWeight: 500, padding: '2px 6px', background: '#FCEBEB', borderRadius: 4, display: 'inline-block' }}>
                      ⚠️ Melebihi batas
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

export default GrafikTren;