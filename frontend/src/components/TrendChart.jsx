import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: '#fff',
      border: '1.5px solid #E2E8F0',
      borderRadius: 12,
      padding: '10px 14px',
      fontSize: 12,
      boxShadow: '0 4px 16px rgba(15,23,42,0.10)',
    }}>
      <div style={{ fontWeight: 700, color: '#64748B', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: '#16A34A', display: 'inline-block',
        }} />
        <span style={{ color: '#14532D', fontWeight: 700 }}>
          PM2.5: {payload[0].value.toFixed(1)} µg/m³
        </span>
      </div>
    </div>
  );
}

function TrendChart({ baseUrl }) {
  const [data,  setData]  = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const today   = new Date().toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0];

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
        console.error('Gagal fetch history:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [baseUrl]);

  if (error) return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: '#FEE2E2', borderRadius: 12, padding: '14px 16px',
      border: '1px solid #FECACA',
    }}>
      <i className="ti ti-alert-circle" style={{ fontSize: 20, color: '#DC2626' }} aria-hidden />
      <span style={{ fontSize: 13, fontWeight: 600, color: '#7F1D1D' }}>
        Gagal memuat data historis.
      </span>
    </div>
  );

  if (loading) return (
    <div style={{
      height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94A3B8' }}>
        <span style={{
          width: 18, height: 18,
          border: '2.5px solid #CBD5E1',
          borderTop: '2.5px solid #2563EB',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          display: 'inline-block',
        }} />
        <span style={{ fontSize: 13, fontWeight: 500 }}>Memuat grafik...</span>
      </div>
    </div>
  );

  if (data.length === 0) return (
    <div style={{
      height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0',
    }}>
      <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500 }}>
        Tidak ada data tersedia.
      </span>
    </div>
  );

  const maxVal = Math.max(...data.map(d => d.pm25));
  const minVal = Math.min(...data.map(d => d.pm25));
  const avgVal = (data.reduce((a, b) => a + b.pm25, 0) / data.length).toFixed(1);

  return (
    <div>
      {/* Stat strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Tertinggi', value: maxVal.toFixed(1), color: '#DC2626', bg: '#FEE2E2', border: '#FECACA', icon: 'ti-arrow-up' },
          { label: 'Rata-rata', value: avgVal,            color: '#2563EB', bg: '#DBEAFE', border: '#93C5FD', icon: 'ti-minus'    },
          { label: 'Terendah',  value: minVal.toFixed(1), color: '#16A34A', bg: '#DCFCE7', border: '#86EFAC', icon: 'ti-arrow-down' },
        ].map(item => (
          <div key={item.label}
            style={{
              background: item.bg,
              border: `1.5px solid ${item.border}`,
              borderRadius: 12,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              transition: 'transform 0.18s, box-shadow 0.18s',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 6px 16px ${item.border}80`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(255,255,255,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className={`ti ${item.icon}`} style={{ fontSize: 16, color: item.color }} aria-hidden />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: item.color, opacity: 0.75, letterSpacing: '0.05em' }}>
                {item.label.toUpperCase()}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: item.color, lineHeight: 1.2 }}>
                {item.value}
                <span style={{ fontSize: 11, fontWeight: 600, marginLeft: 3, opacity: 0.7 }}>µg/m³</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legenda */}
      <div style={{ display: 'flex', gap: 18, fontSize: 12, marginBottom: 10 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569', fontWeight: 500 }}>
          <span style={{ width: 20, height: 3, background: '#16A34A', borderRadius: 2, display: 'inline-block' }} />
          Konsentrasi PM2.5
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569', fontWeight: 500 }}>
          <span style={{ width: 20, height: 2, background: '#DC2626', borderRadius: 2, display: 'inline-block', borderTop: '2px dashed #DC2626' }} />
          Ambang batas (55 µg/m³)
        </span>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="pm25grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#16A34A" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#16A34A" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="timestamp"
              stroke="#CBD5E1"
              tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }}
            />
            <YAxis
              stroke="#CBD5E1"
              tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }}
              unit=" µg"
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={55}
              stroke="#DC2626"
              strokeDasharray="5 5"
              strokeWidth={1.5}
              label={{
                value: '55 µg/m³',
                fill: '#DC2626',
                fontSize: 11,
                fontWeight: 700,
                position: 'insideTopRight',
              }}
            />
            <Line
              type="monotone"
              dataKey="pm25"
              stroke="#16A34A"
              strokeWidth={2.5}
              dot={{ r: 4, stroke: '#fff', strokeWidth: 2, fill: '#16A34A' }}
              activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2, fill: '#16A34A' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default TrendChart;