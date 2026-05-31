import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';

import { POLUTAN_CONFIG } from '../constants';

const BASE_URL = import.meta.env.VITE_API_URL;

// Custom tooltip
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

function Prediksi() {
  const [predictions, setPredictions] = useState(null);
  const [segment, setSegment] = useState('');
  const [statusData, setStatusData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedPolutan, setSelectedPolutan] = useState('pm25');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(false);
      try {
        // Fetch prediksi
        const predRes = await fetch(`${BASE_URL}/predict/surabaya`);
        const predData = await predRes.json();
        setPredictions(predData.predictions);
        setSegment(predData.segment);

        // Fetch status untuk data aktual saat ini
        const statusRes = await fetch(`${BASE_URL}/status/surabaya`);
        const status = await statusRes.json();
        setStatusData(status);

        // Fetch data historis 8 jam terakhir dari API
        const now = new Date();
        const endDate = now.toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 8 * 60 * 60 * 1000)
          .toISOString().split('T')[0];

        const histRes = await fetch(
          `${BASE_URL}/history/surabaya?start_date=${startDate}&end_date=${endDate}&parameter=${selectedPolutan}`
        );
        const histJson = await histRes.json();
        const histData = Array.isArray(histJson) ? histJson : [];

        // Ambil maksimal 8 titik terakhir dari data historis
        const recentHistory = histData.slice(-8);

        const chartPoints = [];

        // Data aktual dari history API (bukan Math.random)
        recentHistory.forEach((item) => {
          chartPoints.push({
            time: item.timestamp
              ? item.timestamp.slice(11, 16)
              : '00:00',
            actual: item.value ?? 0,
            predicted: null,
          });
        });

        // Data prediksi (3 jam ke depan)
        const currentHour = now.getHours();
        if (predData.predictions && predData.predictions[selectedPolutan]) {
          const preds = predData.predictions[selectedPolutan];
          for (let i = 0; i < Math.min(3, preds.length); i++) {
            const hour = (currentHour + i + 1 + 24) % 24;
            chartPoints.push({
              time: `${String(hour).padStart(2, '0')}:00`,
              actual: null,
              predicted: preds[i],
            });
          }
        }

        setChartData(chartPoints);
      } catch (err) {
        console.error('Gagal memuat prediksi:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedPolutan]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#888780' }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>🔮</div>
        Memuat prediksi...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#E24B4A' }}>
        Gagal memuat data prediksi. Silakan coba lagi.
      </div>
    );
  }

  // Generate insight text
  const generateInsight = () => {
    const insights = [];
    if (!predictions) return 'Data prediksi belum tersedia.';
    
    Object.entries(POLUTAN_CONFIG).forEach(([key, cfg]) => {
      const preds = predictions[key] || [];
      if (preds.length === 0) return;
      
      const avgPred = preds.reduce((a, b) => a + b, 0) / preds.length;
      const trend = preds[preds.length - 1] > preds[0] ? 'meningkat' : preds[preds.length - 1] < preds[0] ? 'menurun' : 'stabil';
      
      if (key === 'pm25' && avgPred > 55) {
        insights.push(`PM2.5 diprediksi ${trend} dengan rata-rata ${avgPred.toFixed(1)} µg/m³ — perlu perhatian khusus`);
      } else if (key === 'pm10' && avgPred > 100) {
        insights.push(`PM10 diprediksi ${trend} dengan rata-rata ${avgPred.toFixed(1)} µg/m³ — perlu dipantau`);
      } else {
        insights.push(`${cfg.label} diprediksi ${trend} pada ${avgPred.toFixed(1)} ${cfg.unit} — kondisi ${avgPred <= cfg.batas ? 'aman' : 'perlu perhatian'}`);
      }
    });
    
    return insights.join('. ') + '. Secara umum kualitas udara Kota Surabaya diperkirakan tetap terkendali dalam 3 jam ke depan.';
  };

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header dengan segment info */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20 }}>🔮 Prediksi Kualitas Udara</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888780' }}>
              Model aktif: <strong style={{ color: '#1D9E75' }}>{segment || '—'}</strong> · Prediksi 3 jam ke depan
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {Object.entries(POLUTAN_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                style={selectedPolutan === key ? { ...btnActive, background: cfg.color, borderColor: cfg.color } : btnBase}
                onClick={() => setSelectedPolutan(key)}
              >
                {cfg.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Kartu prediksi per polutan */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20 }}>
        <div style={sectionTitle}>Prediksi +3 Jam per Polutan</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {Object.entries(POLUTAN_CONFIG).map(([key, cfg]) => {
            const preds = predictions?.[key] || [];
            const value = preds.length > 0 ? preds[preds.length - 1] : 0;
            const isWarning = value > cfg.batas;
            return (
              <div
                key={key}
                style={{
                  background: isWarning ? '#FFF4E5' : '#F8FAFC',
                  border: `1px solid ${isWarning ? '#F59E0B' : '#E5E7EB'}`,
                  borderRadius: 10,
                  padding: 16,
                  borderTop: `3px solid ${cfg.color}`
                }}
              >
                <div style={{ fontSize: 13, color: '#64748B' }}>{cfg.label}</div>
                <div style={{ fontSize: 26, fontWeight: 600, marginTop: 8, color: isWarning ? '#F59E0B' : '#1F2937' }}>
                  {value.toFixed(1)}
                </div>
                <div style={{ fontSize: 12, marginTop: 6, color: '#888780' }}>
                  {cfg.unit}
                </div>
                {isWarning && (
                  <div style={{ fontSize: 11, color: '#F59E0B', marginTop: 4, fontWeight: 500 }}>
                    ⚠️ Di atas batas aman
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Grafik aktual vs prediksi */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>📈 Grafik {POLUTAN_CONFIG[selectedPolutan].label} — Aktual vs Prediksi</h3>
          <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#888780' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 12, height: 2, background: '#1D9E75', display: 'inline-block' }}></span>
              Aktual
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 12, height: 2, background: '#8B5CF6', borderStyle: 'dashed', display: 'inline-block' }}></span>
              Prediksi
            </span>
          </div>
        </div>

        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#888780" />
              <YAxis tick={{ fontSize: 12 }} stroke="#888780" />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine 
                y={POLUTAN_CONFIG[selectedPolutan].batas} 
                stroke="#E24B4A" 
                strokeDasharray="5 5" 
                label={{ value: 'Batas', fill: '#E24B4A', fontSize: 10, position: 'insideTopRight' }} 
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#1D9E75"
                strokeWidth={2}
                dot={{ r: 4, fill: '#1D9E75' }}
                name="Aktual"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#8B5CF6"
                strokeDasharray="6 6"
                strokeWidth={2}
                dot={{ r: 4, fill: '#8B5CF6' }}
                name="Prediksi"
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insight */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>📌 Insight Prediksi</h3>
        <p style={{ lineHeight: 1.8, color: '#475569', margin: 0, fontSize: 14 }}>
          {generateInsight()}
        </p>
      </div>

    </div>
  );
}

export default Prediksi;