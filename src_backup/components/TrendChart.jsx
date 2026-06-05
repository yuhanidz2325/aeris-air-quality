import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

function TrendChart({ baseUrl }) {
  const [data, setData]   = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadHistory() {
      try {
        const today   = new Date().toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const res  = await fetch(
          `${baseUrl}/history/surabaya?start_date=${weekAgo}&end_date=${today}&parameter=pm25`
        );
        const json = await res.json();

        const formatted = json.map(item => ({
          timestamp: item.timestamp.slice(5, 10),
          pm25: item.value ?? 0,
        }));
        setData(formatted);
      } catch (err) {
        console.error("Gagal fetch history:", err);
        setError(true);
      }
    }
    loadHistory();
  }, [baseUrl]);

  if (error) return (
    <p style={{ fontSize: 12, color: '#A32D2D' }}>Gagal memuat data historis.</p>
  );

  if (data.length === 0) return (
    <p style={{ fontSize: 12, color: '#888780' }}>Memuat grafik...</p>
  );

  // Custom tooltip light mode
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#fff', border: '0.5px solid #D3D1C7',
          borderRadius: 8, padding: '8px 12px', fontSize: 12
        }}>
          <p style={{ color: '#888780', marginBottom: 4 }}>{label}</p>
          <p style={{ color: '#0F6E56', fontWeight: 500 }}>
            PM2.5: {payload[0].value.toFixed(1)} µg/m³
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 220 }}>
      {/* Legenda */}
      <div style={{ display: 'flex', gap: 16, fontSize: 11, marginBottom: 8 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#5F5E5A' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1D9E75', display: 'inline-block' }}></span>
          Konsentrasi PM2.5
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#5F5E5A' }}>
          <span style={{ width: 12, height: 2, background: '#E24B4A', display: 'inline-block' }}></span>
          Ambang batas sehat (55 µg/m³)
        </span>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 6, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E6DF" />
          <XAxis
            dataKey="timestamp"
            stroke="#888780"
            fontSize={11}
            tick={{ fill: '#888780' }}
          />
          <YAxis
            stroke="#888780"
            fontSize={11}
            unit=" µg"
            tick={{ fill: '#888780' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={55} stroke="#E24B4A" strokeDasharray="5 5" label={{ value: '55', fill: '#E24B4A', fontSize: 10 }} />
          <Line
            type="monotone"
            dataKey="pm25"
            stroke="#1D9E75"
            strokeWidth={2.5}
            dot={{ r: 4, stroke: '#fff', strokeWidth: 2, fill: '#1D9E75' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TrendChart;
