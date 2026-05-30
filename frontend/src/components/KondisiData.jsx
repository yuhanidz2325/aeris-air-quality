import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

function KondisiData({ lastUpdate }) {
  const pollutantDistribution = [
    { name: 'PM2.5', value: 119 },
    { name: 'PM10', value: 63 },
    { name: 'CO', value: 31 },
    { name: 'NO₂', value: 35 },
    { name: 'O₃', value: 3 }
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16
        }}
      >
        {[
          ['Total Data', '18.432'],
          ['Data Valid', '98.7%'],
          ['Missing Value', '1.3%'],
          ['Update Terakhir', lastUpdate || '-']
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 12,
              padding: 20
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: '#64748B'
              }}
            >
              {label}
            </div>

            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                marginTop: 8
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>


      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: 12,
          padding: 20
        }}
      >
        <h3>📊 Distribusi Konsentrasi Polutan</h3>

        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pollutantDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="value"
                fill="#1D9E75"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>


      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: 12,
          padding: 20
        }}
      >
        <h3>⚙️ Status Pipeline</h3>

        <div style={{ lineHeight: 2 }}>
          <div>✓ Scheduler aktif normal</div>
          <div>✓ API fetch berhasil</div>
          <div>✓ Prediksi model berjalan</div>
          <div>✓ Tidak ada error dalam 24 jam terakhir</div>
        </div>
      </div>


      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: 12,
          padding: 20
        }}
      >
        <h3>📋 Log Aktivitas Sistem</h3>

        <div style={{ lineHeight: 2 }}>
          <div>19:05 — Fetch data berhasil</div>
          <div>19:04 — Prediksi model selesai</div>
          <div>19:02 — Deteksi anomali selesai</div>
          <div>19:00 — Dashboard diperbarui</div>
        </div>
      </div>
    </div>
  );
}

export default KondisiData;