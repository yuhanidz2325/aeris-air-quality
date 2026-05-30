import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';

const POLUTAN_CONFIG = {
  pm25:  { label: 'PM2.5', unit: 'µg/m³', color: '#1D9E75', batas: 55 },
  pm10:  { label: 'PM10',  unit: 'µg/m³', color: '#378ADD', batas: 150 },
  co:    { label: 'CO',    unit: 'µg/m³', color: '#EF9F27', batas: 10000 },
  no2:   { label: 'NO₂',  unit: 'µg/m³', color: '#534AB7', batas: 200 },
  o3:    { label: 'O₃',   unit: 'µg/m³', color: '#E24B4A', batas: 235 },
};

const RENTANG_OPTIONS = [
  { key: '1d',  label: 'Hari ini',     days: 1  },
  { key: '7d',  label: '7 hari',       days: 7  },
  { key: '30d', label: '1 bulan',      days: 30 },
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
      <p style={{ color: '#888780', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 500 }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value} {p.unit || ''}
        </p>
      ))}
    </div>
  );
}

// ── Grafik satu polutan ─────────────────────────────────────
function GrafikPolutan({ data, polutanKey, showBatas = true }) {
  const cfg = POLUTAN_CONFIG[polutanKey];
  if (!data || data.length === 0) return (
    <p style={{ fontSize: 12, color: '#888780', textAlign: 'center', padding: 20 }}>
      Memuat data...
    </p>
  );
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8E6DF" />
        <XAxis dataKey="timestamp" stroke="#888780" fontSize={10} tick={{ fill: '#888780' }} interval="preserveStartEnd" />
        <YAxis stroke="#888780" fontSize={10} tick={{ fill: '#888780' }} unit={` ${cfg.unit.split('/')[0]}`} />
        <Tooltip content={<CustomTooltip />} />
        {showBatas && (
          <ReferenceLine y={cfg.batas} stroke="#E24B4A" strokeDasharray="5 5"
            label={{ value: `Batas ${cfg.batas}`, fill: '#E24B4A', fontSize: 9, position: 'insideTopRight' }} />
        )}
        <Line type="monotone" dataKey={polutanKey} name={cfg.label} stroke={cfg.color}
          strokeWidth={2} dot={false} activeDot={{ r: 4 }} unit={cfg.unit} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Grafik semua polutan overlay ────────────────────────────
function GrafikOverlay({ data }) {
  if (!data || data.length === 0) return (
    <p style={{ fontSize: 12, color: '#888780', textAlign: 'center', padding: 20 }}>Memuat data...</p>
  );
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8E6DF" />
        <XAxis dataKey="timestamp" stroke="#888780" fontSize={10} tick={{ fill: '#888780' }} interval="preserveStartEnd" />
        <YAxis stroke="#888780" fontSize={10} tick={{ fill: '#888780' }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        {Object.entries(POLUTAN_CONFIG).map(([key, cfg]) => (
          <Line key={key} type="monotone" dataKey={key} name={cfg.label}
            stroke={cfg.color} strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} />
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

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={avgData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8E6DF" />
        <XAxis dataKey="jam" stroke="#888780" fontSize={10} tick={{ fill: '#888780' }} interval={2} />
        <YAxis stroke="#888780" fontSize={10} tick={{ fill: '#888780' }} unit=" µg" />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={55} stroke="#E24B4A" strokeDasharray="5 5" />
        <Bar dataKey="Rata-rata PM2.5" fill="#1D9E75" radius={[3, 3, 0, 0]} opacity={0.85} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Komponen utama Tab Grafik & Tren ────────────────────────
function GrafikTren({ baseUrl }) {
  const [rentang, setRentang]       = useState('7d');
  const [polutanAktif, setPolutanAktif] = useState('pm25');
  const [viewMode, setViewMode]     = useState('individual'); // individual | overlay | harian
  const [data, setData]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(false);
      try {
        const days = RENTANG_OPTIONS.find(r => r.key === rentang)?.days || 7;
        
        // 1. Format ISO String lengkap agar pencarian data di database akurat
        const endDate = new Date().toISOString();
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

        // 2. Hilangkan '?parameter=' di URL agar API mengirim semua data polutan sekaligus
        const res  = await fetch(
          `${baseUrl}/history/surabaya?start_date=${startDate}&end_date=${endDate}`
        );
        const json = await res.json();

        // 3. Mengelompokkan (grouping) data berdasarkan waktu
        const groupedData = {};
        
        if (Array.isArray(json)) {
          json.forEach(item => {
            const ts = item.timestamp ? item.timestamp.slice(5, 16).replace('T', ' ') : '';
            
            // Buat slot waktu jika belum ada
            if (!groupedData[ts]) {
              groupedData[ts] = { timestamp: ts };
            }
            
            // Masukkan nilai polutan (pm25, pm10, dll) ke waktu yang sesuai
            if (item.parameter) {
              groupedData[ts][item.parameter] = item.value ?? 0;
            }
          });
        }

        // 4. Ubah objek kembali menjadi array untuk Recharts
        const formatted = Object.values(groupedData);
        setData(formatted);
        
      } catch (err) {
        console.error('Gagal fetch history:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [baseUrl, rentang]); 

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Kontrol rentang waktu ───────────────────────── */}
      <div style={{ background: '#fff', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '14px 16px' }}>
        <div style={sectionTitle}>Rentang waktu</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {RENTANG_OPTIONS.map(r => (
            <button key={r.key} style={rentang === r.key ? btnActive : btnBase}
              onClick={() => setRentang(r.key)}>
              {r.label}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {[
              { key: 'individual', label: 'Per polutan' },
              { key: 'overlay',    label: 'Semua polutan' },
              { key: 'harian',     label: 'Pola per jam' },
            ].map(v => (
              <button key={v.key} style={viewMode === v.key ? btnActive : btnBase}
                onClick={() => setViewMode(v.key)}>
                {v.label}
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

          {/* Grafik */}
          <div style={{ background: '#fff', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={sectionTitle}>
                Tren {POLUTAN_CONFIG[polutanAktif].label} — {RENTANG_OPTIONS.find(r => r.key === rentang)?.label}
              </div>
              <span style={{ fontSize: 11, color: '#888780' }}>
                {data.length} titik data
              </span>
            </div>

            {error && <p style={{ fontSize: 12, color: '#A32D2D' }}>Gagal memuat data. Coba lagi nanti.</p>}
            {loading && <p style={{ fontSize: 12, color: '#888780' }}>Memuat grafik...</p>}
            {!loading && !error && <GrafikPolutan data={data} polutanKey={polutanAktif} />}

            {/* Statistik ringkas */}
            {!loading && !error && data.length > 0 && (() => {
              const vals = data.map(d => d[polutanAktif]).filter(v => v > 0);
              const avg  = vals.reduce((a, b) => a + b, 0) / vals.length;
              const max  = Math.max(...vals);
              const min  = Math.min(...vals);
              const cfg  = POLUTAN_CONFIG[polutanAktif];
              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12 }}>
                  {[
                    { label: 'Rata-rata', val: `${avg.toFixed(1)} ${cfg.unit}` },
                    { label: 'Tertinggi', val: `${max.toFixed(1)} ${cfg.unit}` },
                    { label: 'Terendah',  val: `${min.toFixed(1)} ${cfg.unit}` },
                  ].map(item => (
                    <div key={item.label} style={{ background: '#F1EFE8', borderRadius: 8, padding: '8px 12px' }}>
                      <div style={{ fontSize: 11, color: '#888780', marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#2C2C2A' }}>{item.val}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </>
      )}

      {/* ── View: overlay semua polutan ────────────────── */}
      {viewMode === 'overlay' && (
        <div style={{ background: '#fff', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '14px 16px' }}>
          <div style={sectionTitle}>
            Semua polutan — {RENTANG_OPTIONS.find(r => r.key === rentang)?.label}
          </div>
          {error   && <p style={{ fontSize: 12, color: '#A32D2D' }}>Gagal memuat data.</p>}
          {loading && <p style={{ fontSize: 12, color: '#888780' }}>Memuat grafik...</p>}
          {!loading && !error && <GrafikOverlay data={data} />}
          <p style={{ fontSize: 11, color: '#888780', marginTop: 8 }}>
            Catatan: Skala Y dinormalisasi. Nilai CO jauh lebih besar dari polutan lain secara absolut.
          </p>
        </div>
      )}

      {/* ── View: pola harian per jam ───────────────────── */}
      {viewMode === 'harian' && (
        <div style={{ background: '#fff', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '14px 16px' }}>
          <div style={sectionTitle}>
            Rata-rata PM2.5 per jam — berdasarkan data {RENTANG_OPTIONS.find(r => r.key === rentang)?.label}
          </div>
          {error   && <p style={{ fontSize: 12, color: '#A32D2D' }}>Gagal memuat data.</p>}
          {loading && <p style={{ fontSize: 12, color: '#888780' }}>Memuat grafik...</p>}
          {!loading && !error && <GrafikPolaHarian data={data} />}
          <p style={{ fontSize: 11, color: '#888780', marginTop: 8 }}>
            Grafik ini menunjukkan pola rata-rata konsentrasi PM2.5 berdasarkan jam dalam sehari.
            Puncak pagi (rush hour) dan puncak malam terlihat jelas.
          </p>
        </div>
      )}

      {/* ── Grid 5 polutan ringkas ──────────────────────── */}
      {viewMode === 'individual' && !loading && !error && data.length > 0 && (
        <div>
          <div style={sectionTitle}>Ringkasan 5 polutan — {RENTANG_OPTIONS.find(r => r.key === rentang)?.label}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {Object.entries(POLUTAN_CONFIG).map(([key, cfg]) => {
              const vals = data.map(d => d[key] || 0).filter(v => v > 0);
              const avg  = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
              const max  = vals.length ? Math.max(...vals) : 0;
              const overBatas = max > cfg.batas;
              return (
                <div key={key} style={{
                  background: '#fff', border: `0.5px solid ${overBatas ? '#F09595' : '#D3D1C7'}`,
                  borderRadius: 12, padding: '12px 14px',
                  borderTop: `3px solid ${cfg.color}`
                }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: cfg.color, marginBottom: 4 }}>
                    {cfg.label}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 500, color: '#2C2C2A' }}>
                    {avg.toFixed(1)}
                  </div>
                  <div style={{ fontSize: 10, color: '#888780', marginTop: 2 }}>
                    rata-rata {cfg.unit}
                  </div>
                  {overBatas && (
                    <div style={{ fontSize: 10, color: '#A32D2D', marginTop: 4, fontWeight: 500 }}>
                      ⚠ Melebihi batas
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
