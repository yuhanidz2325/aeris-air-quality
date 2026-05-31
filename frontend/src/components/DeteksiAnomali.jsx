import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Scatter,
  BarChart,
  Bar,
  Cell,
  Legend
} from 'recharts';

const BASE_URL = import.meta.env.VITE_API_URL;

// Severity configuration
const SEVERITY_CONFIG = {
  Low:    { bg: '#E1F5EE', border: '#5DCAA5', text: '#085041', dot: '#1D9E75', label: 'Rendah' },
  Medium: { bg: '#FAEEDA', border: '#EF9F27', text: '#633806', dot: '#F59E0B', label: 'Sedang' },
  High:   { bg: '#FCEBEB', border: '#F09595', text: '#791F1F', dot: '#E24B4A', label: 'Tinggi' },
};

function getSeverity(value, parameter) {
  // Thresholds based on ISPU categories
  const thresholds = {
    pm25: { low: 55, medium: 100, high: 150 },
    pm10: { low: 150, medium: 250, high: 350 },
    co:   { low: 10000, medium: 20000, high: 30000 },
    no2:  { low: 200, medium: 400, high: 600 },
    o3:   { low: 235, medium: 400, high: 600 },
  };
  
  const t = thresholds[parameter] || thresholds.pm25;
  if (value > t.high) return 'High';
  if (value > t.medium) return 'Medium';
  if (value > t.low) return 'Low';
  return null; // Normal
}

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
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  );
}

function DeteksiAnomali({ baseUrl }) {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const [selectedParameter, setSelectedParameter] = useState('pm25');
  const [anomalyEvents, setAnomalyEvents] = useState([]);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch(`${baseUrl}/status/surabaya`);
        const data = await res.json();
        setStatusData(data);
      } catch (error) {
        console.error('Gagal mengambil data anomali:', error);
      } finally {
        setLoading(false);
      }
    }

    const fetchHistory = async () => {
      try {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0];

        const response = await fetch(
          `${baseUrl}/history/surabaya?start_date=${startDate}&end_date=${endDate}&parameter=${selectedParameter}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const json = await response.json();
        const data = Array.isArray(json) ? json : [];

        const formatted = data.map((item) => ({
          timestamp: item.timestamp?.slice(11, 16) || '00:00',
          value: item.value ?? 0,
          severity: getSeverity(item.value ?? 0, selectedParameter),
        }));

        setHistoryData(formatted);

        const anomalies = formatted.filter(d => d.severity !== null);
        setAnomalyEvents(anomalies);

      } catch (error) {
        console.error('Gagal mengambil history:', error);
        setHistoryData([]);
        setAnomalyEvents([]);
      }
    };

    fetchStatus();
    fetchHistory();
  }, [baseUrl, selectedParameter]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#888780' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
        Memuat analisis anomali...
      </div>
    );
  }

  const anomalyItems = statusData?.ispu_status || [];
  const pollutants = statusData?.pollutants || {};

  // Statistics
  const avg = historyData.length > 0
    ? (historyData.reduce((a, b) => a + b.value, 0) / historyData.length).toFixed(1)
    : 0;
  const max = historyData.length > 0 ? Math.max(...historyData.map(d => d.value)).toFixed(1) : 0;
  const min = historyData.length > 0 ? Math.min(...historyData.map(d => d.value)).toFixed(1) : 0;

  const pollutantLabel = {
    pm25: 'PM2.5', pm10: 'PM10', co: 'CO', no2: 'NO₂', o3: 'O₃'
  };

  const pollutantColor = {
    pm25: '#1D9E75', pm10: '#378ADD', co: '#EF9F27', no2: '#534AB7', o3: '#E24B4A'
  };

  const dominantPollutant = anomalyItems.length > 0
    ? [...anomalyItems].sort((a, b) => b.value - a.value)[0]
    : null;

  const activeAnomaly = anomalyItems.find(
    item => item.category === 'Tidak Sehat' ||
            item.category === 'Sangat Tidak Sehat' ||
            item.category === 'Berbahaya'
  );

  // Count anomalies by severity - also count from current status if above threshold
  const currentAnomalies = anomalyItems.filter(item => 
    item.category === 'Tidak Sehat' || item.category === 'Sangat Tidak Sehat' || item.category === 'Berbahaya'
  ).length;
  
  const severityCount = {
    Low: Math.max(anomalyEvents.filter(e => e.severity === 'Low').length, currentAnomalies > 0 ? 1 : 0),
    Medium: anomalyEvents.filter(e => e.severity === 'Medium').length,
    High: anomalyEvents.filter(e => e.severity === 'High').length,
  };

  // Find peak anomaly hour with fallback
  const peakAnomalyHour = anomalyEvents.length > 0
    ? anomalyEvents.reduce((a, b) => a.value > b.value ? a : b).timestamp
    : 'Belum ada anomali terdeteksi';

  // Generate dynamic insight
  const generateInsight = () => {
    if (activeAnomaly) {
      return `⚠️ **Anomali Terdeteksi pada ${activeAnomaly.parameter.toUpperCase()}**\n\n` +
        `Berdasarkan analisis data 24 jam terakhir, terdeteksi lonjakan tidak wajar pada parameter ${activeAnomaly.parameter.toUpperCase()} ` +
        `dengan nilai tertinggi ${Math.round(activeAnomaly.value)}. ` +
        `Puncak anomali terjadi pada pukul ${peakAnomalyHour} WIB, yang kemungkinan dipengaruhi oleh ` +
        `${activeAnomaly.parameter === 'no2' ? 'peningkatan aktivitas lalu lintas pada jam sibuk malam hari' :
          activeAnomaly.parameter === 'pm25' || activeAnomaly.parameter === 'pm10' ? 'aktivitas industri dan pembakaran yang meningkat' :
          activeAnomaly.parameter === 'o3' ? 'kondisi cuaca panas dengan radiasi UV tinggi' :
          'faktor meteorologi dan aktivitas antropogenik'}. ` +
        `Parameter lain masih berada pada rentang normal. Disarankan untuk memantau perkembangan kualitas udara secara berkala.`;
    } else if (anomalyEvents.length > 0) {
      return `📊 **Terdapat Fluktuasi Ringan**\n\n` +
        `Terdeteksi ${anomalyEvents.length} kejadian fluktuasi nilai di atas ambang batas normal pada parameter ${selectedParameter.toUpperCase()}. ` +
        `Namun, secara keseluruhan kualitas udara masih dalam kategori terkendali. ` +
        `Pola anomali cenderung terjadi pada ${peakAnomalyHour} WIB, yang berkorelasi dengan pola aktivitas manusia dan kondisi meteorologi lokal.`;
    } else {
      return `✅ **Kualitas Udara Stabil**\n\n` +
        `Berdasarkan analisis data 24 jam terakhir, tidak ditemukan anomali signifikan pada seluruh parameter kualitas udara. ` +
        `Seluruh polutan masih berada pada rentang normal dan relatif stabil. ` +
        `Kondisi ini menunjukkan kualitas udara Kota Surabaya dalam keadaan baik untuk aktivitas luar ruangan.`;
    }
  };

  // Anomaly distribution by hour (for bar chart)
  const hourlyDistribution = [
    { hour: '00-04', count: anomalyEvents.filter(e => e.timestamp >= '00:00' && e.timestamp < '04:00').length },
    { hour: '04-08', count: anomalyEvents.filter(e => e.timestamp >= '04:00' && e.timestamp < '08:00').length },
    { hour: '08-12', count: anomalyEvents.filter(e => e.timestamp >= '08:00' && e.timestamp < '12:00').length },
    { hour: '12-16', count: anomalyEvents.filter(e => e.timestamp >= '12:00' && e.timestamp < '16:00').length },
    { hour: '16-20', count: anomalyEvents.filter(e => e.timestamp >= '16:00' && e.timestamp < '20:00').length },
    { hour: '20-24', count: anomalyEvents.filter(e => e.timestamp >= '20:00' && e.timestamp < '24:00').length },
  ];

  const sectionTitle = {
    fontSize: 11, fontWeight: 500, color: '#888780',
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── RINGKASAN ANOMALI ── */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20 }}>
        <div style={sectionTitle}>📊 Ringkasan Anomali Hari Ini</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <div style={{
            background: activeAnomaly ? '#FCEBEB' : '#E1F5EE',
            border: `1px solid ${activeAnomaly ? '#F09595' : '#5DCAA5'}`,
            borderRadius: 12, padding: 16
          }}>
            <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>Total Anomali</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: activeAnomaly ? '#E24B4A' : '#1D9E75' }}>
              {Math.max(anomalyEvents.length, currentAnomalies)}
            </div>
            <div style={{ fontSize: 11, color: '#888780' }}>kejadian terdeteksi</div>
          </div>

          <div style={{
            background: '#FAEEDA',
            border: '1px solid #EF9F27',
            borderRadius: 12, padding: 16
          }}>
            <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>Polutan Dominan</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#633806' }}>
              {dominantPollutant?.parameter?.toUpperCase() || '—'}
            </div>
            <div style={{ fontSize: 11, color: '#888780' }}>nilai ISPU tertinggi</div>
          </div>

          <div style={{
            background: '#E6F1FB',
            border: '1px solid #85B7EB',
            borderRadius: 12, padding: 16
          }}>
            <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>Jam Puncak Anomali</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0C447C' }}>
              {peakAnomalyHour}
            </div>
            <div style={{ fontSize: 11, color: '#888780' }}>WIB</div>
          </div>

          <div style={{
            background: '#F0F9FF',
            border: '1px solid #BAE6FD',
            borderRadius: 12, padding: 16
          }}>
            <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>Status Keseluruhan</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: activeAnomaly ? '#E24B4A' : '#1D9E75' }}>
              {activeAnomaly ? '⚠️ Waspada' : '✅ Aman'}
            </div>
            <div style={{ fontSize: 11, color: '#888780' }}>{activeAnomaly ? 'Perlu pemantauan' : 'Kualitas udara baik'}</div>
          </div>
        </div>
      </div>

      {/* ── SEVERITY DISTRIBUTION ── */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20 }}>
        <div style={sectionTitle}>🎯 Distribusi Tingkat Keparahan Anomali</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
          {Object.entries(SEVERITY_CONFIG).map(([level, cfg]) => (
            <div key={level} style={{
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              borderRadius: 12,
              padding: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: cfg.dot,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 700, color: '#fff'
              }}>
                {severityCount[level]}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: cfg.text }}>{cfg.label}</div>
                <div style={{ fontSize: 11, color: cfg.text, opacity: 0.8 }}>
                  {level === 'Low' ? '< 2x ambang batas' : level === 'Medium' ? '2-3x ambang batas' : '> 3x ambang batas'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Hourly distribution bar chart */}
        <div style={{ width: '100%', height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyDistribution} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="#888780" />
              <YAxis tick={{ fontSize: 11 }} stroke="#888780" allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Jumlah Anomali" radius={[4, 4, 0, 0]}>
                {hourlyDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.count > 2 ? '#E24B4A' : entry.count > 0 ? '#F59E0B' : '#1D9E75'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── STATUS DETEKSI ANOMALI PER POLUTAN ── */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20 }}>
        <div style={sectionTitle}>⚠️ Status Deteksi Anomali per Polutan</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {anomalyItems.map((item) => {
            const severity = getSeverity(item.value, item.parameter);
            const cfg = severity ? SEVERITY_CONFIG[severity] : SEVERITY_CONFIG.Low;
            const isNormal = severity === null;

            return (
              <div
                key={item.parameter}
                style={{
                  background: isNormal ? '#E1F5EE' : cfg.bg,
                  border: `1.5px solid ${isNormal ? '#5DCAA5' : cfg.border}`,
                  borderRadius: 12,
                  padding: 16,
                  position: 'relative'
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: isNormal ? '#085041' : cfg.text }}>
                  {item.parameter?.toUpperCase()}
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6, color: isNormal ? '#1D9E75' : cfg.text }}>
                  {Math.round(item.value)}
                </div>
                <div style={{ fontSize: 11, color: '#888780', marginTop: 4 }}>
                  {item.category}
                </div>
                {severity && (
                  <div style={{
                    marginTop: 8,
                    padding: '3px 8px',
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 600,
                    background: cfg.dot + '20',
                    color: cfg.text,
                    display: 'inline-block'
                  }}>
                    SEVERITY: {cfg.label.toUpperCase()}
                  </div>
                )}
                {isNormal && (
                  <div style={{
                    marginTop: 8,
                    padding: '3px 8px',
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 500,
                    background: '#E1F5EE',
                    color: '#085041',
                    display: 'inline-block'
                  }}>
                    ✅ NORMAL
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── GRAFIK TREN DENGAN ANOMALI MARKERS ── */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={sectionTitle}>📈 Tren Historis dengan Deteksi Anomali</div>
            <div style={{ fontSize: 13, color: '#475569' }}>
              Parameter: <strong style={{ color: pollutantColor[selectedParameter] }}>{pollutantLabel[selectedParameter]}</strong> — 24 Jam Terakhir
            </div>
          </div>

          <select
            value={selectedParameter}
            onChange={(e) => setSelectedParameter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #D3D1C7',
              fontSize: 13,
              background: '#fff',
              cursor: 'pointer'
            }}
          >
            <option value="pm25">PM2.5</option>
            <option value="pm10">PM10</option>
            <option value="co">CO</option>
            <option value="no2">NO₂</option>
            <option value="o3">O₃</option>
          </select>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={historyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="timestamp" fontSize={11} tick={{ fill: '#888780' }} />
            <YAxis fontSize={11} tick={{ fill: '#888780' }} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={selectedParameter === 'pm25' ? 55 :
                 selectedParameter === 'pm10' ? 150 :
                 selectedParameter === 'co' ? 10000 :
                 selectedParameter === 'no2' ? 200 : 235}
              stroke="#E24B4A"
              strokeDasharray="5 5"
              label={{
                value: 'Ambang Batas',
                position: 'insideTopRight',
                fill: '#E24B4A',
                fontSize: 10
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={pollutantColor[selectedParameter]}
              strokeWidth={2}
              dot={(props) => {
                const { cx, cy, payload } = props;
                if (payload.severity) {
                  const cfg = SEVERITY_CONFIG[payload.severity];
                  return (
                    <circle cx={cx} cy={cy} r={5} fill={cfg.dot} stroke="#fff" strokeWidth={2} />
                  );
                }
                return null;
              }}
              name={pollutantLabel[selectedParameter]}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Statistics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14 }}>
          <div style={{ background: '#F8FAFC', borderRadius: 10, padding: 14, border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: 11, color: '#64748B' }}>Rata-rata</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1F2937' }}>{avg}</div>
            <div style={{ fontSize: 11, color: '#888780' }}>µg/m³</div>
          </div>
          <div style={{ background: '#FCEBEB', borderRadius: 10, padding: 14, border: '1px solid #F09595' }}>
            <div style={{ fontSize: 11, color: '#791F1F' }}>Tertinggi</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#E24B4A' }}>{max}</div>
            <div style={{ fontSize: 11, color: '#888780' }}>µg/m³</div>
          </div>
          <div style={{ background: '#E1F5EE', borderRadius: 10, padding: 14, border: '1px solid #5DCAA5' }}>
            <div style={{ fontSize: 11, color: '#085041' }}>Terendah</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1D9E75' }}>{min}</div>
            <div style={{ fontSize: 11, color: '#888780' }}>µg/m³</div>
          </div>
        </div>
      </div>

      {/* ── INSIGHT SUMMARY BOX ── */}
      <div style={{
        background: activeAnomaly ? 'linear-gradient(135deg, #FAEEDA 0%, #FFF4E5 100%)' :
                    anomalyEvents.length > 0 ? 'linear-gradient(135deg, #E6F1FB 0%, #F0F9FF 100%)' :
                    'linear-gradient(135deg, #E1F5EE 0%, #F0FDF4 100%)',
        border: `1.5px solid ${activeAnomaly ? '#EF9F27' : anomalyEvents.length > 0 ? '#85B7EB' : '#5DCAA5'}`,
        borderRadius: 12,
        padding: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 20 }}>
            {activeAnomaly ? '⚠️' : anomalyEvents.length > 0 ? '📊' : '✅'}
          </span>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#2C2C2A' }}>
            {activeAnomaly ? 'Insight Anomali — Perlu Perhatian' :
             anomalyEvents.length > 0 ? 'Insight Anomali — Fluktuasi Terdeteksi' :
             'Insight Anomali — Kondisi Stabil'}
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.7)',
          borderRadius: 8,
          padding: 16,
          fontSize: 13,
          lineHeight: 1.8,
          color: '#475569',
          whiteSpace: 'pre-wrap'
        }}>
          {generateInsight()}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
          <div style={{
            fontSize: 11,
            padding: '4px 12px',
            borderRadius: 20,
            background: '#FFFFFF',
            border: '0.5px solid #D3D1C7',
            color: '#5F5E5A'
          }}>
            📡 Data: 24 jam terakhir
          </div>
          <div style={{
            fontSize: 11,
            padding: '4px 12px',
            borderRadius: 20,
            background: '#FFFFFF',
            border: '0.5px solid #D3D1C7',
            color: '#5F5E5A'
          }}>
            🔄 Update: setiap jam
          </div>
          <div style={{
            fontSize: 11,
            padding: '4px 12px',
            borderRadius: 20,
            background: '#FFFFFF',
            border: '0.5px solid #D3D1C7',
            color: '#5F5E5A'
          }}>
            🤖 Model: Isolation Forest
          </div>
        </div>
      </div>

    </div>
  );
}

export default DeteksiAnomali;