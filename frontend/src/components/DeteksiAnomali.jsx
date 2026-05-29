import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

function DeteksiAnomali({ baseUrl }) {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const [selectedParameter, setSelectedParameter] = useState('pm25');

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

    async function fetchHistory() {
      try {
        const endDate = new Date().toISOString().split('T')[0];

        const startDate = new Date(
          Date.now() - 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split('T')[0];

        const res = await fetch(
          `${baseUrl}/history/surabaya?start_date=${startDate}&end_date=${endDate}&parameter=${selectedParameter}`
        );

        const json = await res.json();

        const formatted = Array.isArray(json)
          ? json.map((item) => ({
              timestamp: item.timestamp?.slice(11, 16),
              value: item.value ?? item[selectedParameter] ?? 0
            }))
          : [];

        setHistoryData(formatted);
      } catch (error) {
        console.error('Gagal mengambil history:', error);
      }
    }

    fetchStatus();
    fetchHistory();
  }, [baseUrl, selectedParameter]);

  if (loading) {
    return (
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 20
        }}
      >
        Memuat analisis anomali...
      </div>
    );
  }

  const anomalyItems = statusData?.ispu_status || [];

  const avg =
    historyData.length > 0
      ? (
          historyData.reduce((a, b) => a + b.value, 0) /
          historyData.length
        ).toFixed(1)
      : 0;

  const max =
    historyData.length > 0
      ? Math.max(...historyData.map((d) => d.value)).toFixed(1)
      : 0;

  const min =
    historyData.length > 0
      ? Math.min(...historyData.map((d) => d.value)).toFixed(1)
      : 0;

  const pollutantLabel = {
    pm25: 'PM2.5',
    pm10: 'PM10',
    co: 'CO',
    no2: 'NO₂',
    o3: 'O₃'
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}
    >
      {/* Status realtime */}
      <div
        style={{
          background: '#fff',
          border: '0.5px solid #D3D1C7',
          borderRadius: 12,
          padding: 20
        }}
      >
        <h2 style={{ marginBottom: 14 }}>
          ⚠️ Status Deteksi Anomali Saat Ini
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 12
          }}
        >
          {anomalyItems.map((item) => {
            const isAnomali =
              item.category === 'Tidak Sehat' ||
              item.category === 'Sangat Tidak Sehat' ||
              item.category === 'Berbahaya';

            return (
              <div
                key={item.parameter}
                style={{
                  background: isAnomali ? '#FFF4E5' : '#EAF8F0',
                  border: isAnomali
                    ? '1px solid #F59E0B'
                    : '1px solid #5DCAA5',
                  borderRadius: 10,
                  padding: 14
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  {item.parameter.toUpperCase()}
                </div>

                <div
                  style={{
                    fontSize: 24,
                    marginTop: 6
                  }}
                >
                  {Math.round(item.value)}
                </div>

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 12
                  }}
                >
                  {isAnomali ? '⚠️ Anomali' : '✅ Normal'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insight */}
      <div
        style={{
          background: '#fff',
          border: '0.5px solid #D3D1C7',
          borderRadius: 12,
          padding: 20
        }}
      >
        <h2 style={{ marginBottom: 14 }}>
          📊 Insight Analisis Anomali Historis
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12
          }}
        >
          <div
            style={{
              background: '#F7F7F7',
              borderRadius: 10,
              padding: 16
            }}
          >
            <div>Jam paling rawan</div>
            <strong>19:00 – 23:00 WIB</strong>
          </div>

          <div
            style={{
              background: '#F7F7F7',
              borderRadius: 10,
              padding: 16
            }}
          >
            <div>Segmen tertinggi</div>
            <strong>SORE/MALAM — 7.2%</strong>
          </div>

          <div
            style={{
              background: '#F7F7F7',
              borderRadius: 10,
              padding: 16
            }}
          >
            <div>Segmen terendah</div>
            <strong>SIANG — 1.7%</strong>
          </div>
        </div>
      </div>

      {/* Chart realtime */}
      <div
        style={{
          background: '#fff',
          border: '0.5px solid #D3D1C7',
          borderRadius: 12,
          padding: '16px 20px'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 600
            }}
          >
            📈 Tren {pollutantLabel[selectedParameter]} — 24 Jam Terakhir
          </h2>

          <select
            value={selectedParameter}
            onChange={(e) =>
              setSelectedParameter(e.target.value)
            }
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #D3D1C7',
              fontSize: 14,
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

        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={historyData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E8E6DF"
            />

            <XAxis
              dataKey="timestamp"
              fontSize={11}
              tick={{ fill: '#888780' }}
            />

            <YAxis
              fontSize={11}
              tick={{ fill: '#888780' }}
            />

            <Tooltip />

            <ReferenceLine
              y={55}
              stroke="#E24B4A"
              strokeDasharray="5 5"
              label={{
                value: 'Batas 55',
                position: 'insideTopRight',
                fill: '#E24B4A',
                fontSize: 11
              }}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#1D9E75"
              strokeWidth={2}
              dot={(props) => {
                const { cx, cy, payload } = props;

                if (payload.value > 55) {
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill="#E24B4A"
                    />
                  );
                }

                return null;
              }}
            />
          </LineChart>
        </ResponsiveContainer>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            marginTop: 14
          }}
        >
          <div
            style={{
              background: '#F7F7F7',
              borderRadius: 8,
              padding: '10px 12px'
            }}
          >
            <div style={{ fontSize: 11, color: '#888780' }}>
              Rata-rata
            </div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              {avg} µg/m³
            </div>
          </div>

          <div
            style={{
              background: '#F7F7F7',
              borderRadius: 8,
              padding: '10px 12px'
            }}
          >
            <div style={{ fontSize: 11, color: '#888780' }}>
              Tertinggi
            </div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              {max} µg/m³
            </div>
          </div>

          <div
            style={{
              background: '#F7F7F7',
              borderRadius: 8,
              padding: '10px 12px'
            }}
          >
            <div style={{ fontSize: 11, color: '#888780' }}>
              Terendah
            </div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              {min} µg/m³
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeteksiAnomali;