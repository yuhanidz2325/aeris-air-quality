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

    const fetchHistory = async () => {
      try {
        // 1. Buat rentang waktu 24 jam terakhir menggunakan ISO format agar presisi
        const endDate = new Date().toISOString();
        const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        // 2. Gunakan endpoint yang sama dengan komponen grafik lainnya
        const response = await fetch(
          `${baseUrl}/history/surabaya?start_date=${startDate}&end_date=${endDate}&parameter=${selectedParameter}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const json = await response.json();

        // 3. Tangani format Array langsung dari API
        const data = Array.isArray(json) ? json : (json.history || json.data || json.hourly || []);

        // 4. Map data untuk Recharts
        const formatted = data.map((item) => ({
          // Sesuaikan pemotongan string jika format tanggal dari database adalah "YYYY-MM-DD HH:mm:ss"
          // Slice(11, 16) mengambil bagian "HH:mm"
          timestamp: item.timestamp?.slice(11, 16),
          value: item.value ?? item[selectedParameter] ?? 0
        }));

        setHistoryData(formatted);

      } catch (error) {
        console.error('Gagal mengambil history:', error);
        setHistoryData([]);
      }
    };

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

  const dominantPollutant =
    anomalyItems.length > 0
      ? [...anomalyItems].sort((a, b) => b.value - a.value)[0]
      : null;

  const activeAnomaly = anomalyItems.find(
    (item) =>
      item.category === 'Tidak Sehat' ||
      item.category === 'Sangat Tidak Sehat' ||
      item.category === 'Berbahaya'
  );

  const anomalyInsight = activeAnomaly
    ? `Berdasarkan data pemantauan terbaru, anomali terdeteksi pada parameter ${activeAnomaly.parameter.toUpperCase()} dengan nilai ${Math.round(
        activeAnomaly.value
      )}. Nilai ini merupakan konsentrasi tertinggi dibanding polutan lainnya pada waktu pengamatan saat ini. Sementara parameter lain masih berada pada rentang normal dan tidak menunjukkan lonjakan signifikan. Hal ini menunjukkan bahwa anomali yang terjadi saat ini didominasi oleh peningkatan ${activeAnomaly.parameter.toUpperCase()}.`
    : `Berdasarkan data pemantauan terbaru, tidak ditemukan anomali signifikan pada seluruh parameter kualitas udara. Seluruh polutan masih berada pada rentang normal dan relatif stabil berdasarkan pembacaan terakhir.`;
    
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

      <div
        style={{
          background: '#fff',
          border: '0.5px solid #D3D1C7',
          borderRadius: 12,
          padding: 20
        }}
      >
        <h2 style={{ marginBottom: 14 }}>
          🔍 Faktor Penyebab Anomali
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            marginBottom: 16
          }}
        >
          <div
            style={{
              background: '#F7F7F7',
              borderRadius: 10,
              padding: 16
            }}
          >
            <div style={{ fontSize: 12, color: '#666' }}>
              Polutan Dominan
            </div>
            <strong style={{ fontSize: 22 }}>
              {dominantPollutant?.parameter?.toUpperCase() || '-'}
            </strong>
          </div>

          <div
            style={{
              background: '#F7F7F7',
              borderRadius: 10,
              padding: 16
            }}
          >
            <div style={{ fontSize: 12, color: '#666' }}>
              Nilai Saat Ini
            </div>
            <strong style={{ fontSize: 22 }}>
              {dominantPollutant
                ? Math.round(dominantPollutant.value)
                : '-'}
            </strong>
          </div>

          <div
            style={{
              background: '#F7F7F7',
              borderRadius: 10,
              padding: 16
            }}
          >
            <div style={{ fontSize: 12, color: '#666' }}>
              Status
            </div>
            <strong
              style={{
                fontSize: 22,
                color: activeAnomaly ? '#F59E0B' : '#1D9E75'
              }}
            >
              {activeAnomaly ? 'Anomali' : 'Normal'}
            </strong>
          </div>

          <div
            style={{
              background: '#F7F7F7',
              borderRadius: 10,
              padding: 16
            }}
          >
            <div style={{ fontSize: 12, color: '#666' }}>
              Jumlah Polutan Dipantau
            </div>
            <strong style={{ fontSize: 22 }}>
              {anomalyItems.length}
            </strong>
          </div>
        </div>

        <p
          style={{
            lineHeight: 1.8,
            color: '#475569',
            margin: 0
          }}
        >
          {anomalyInsight}
        </p>
      </div>

    </div>
  );
}

export default DeteksiAnomali;