import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

function Prediksi() {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
      async function fetchPredictionChart() {
        try {
          const res = await fetch(
            'https://web-production-8b53f.up.railway.app/status/surabaya'
          );

          const data = await res.json();

          console.log(data);

          const pm25Now =
            data?.pollutants?.pm25?.value ??
            47;

          const generated = Array.from({ length: 24 }, (_, i) => ({
            time: `${String(i).padStart(2, '0')}:00`,
            
            actual: Number(
              (
                pm25Now +
                Math.sin(i / 3) * 18 +
                Math.random() * 8
              ).toFixed(1)
            ),

            predicted:
              i >= 18
                ? Number(
                    (
                      pm25Now +
                      Math.sin(i / 3) * 18 +
                      Math.random() * 12
                    ).toFixed(1)
                  )
                : null
          }));

          setChartData(generated);

        } catch (error) {
          console.error(
            'Gagal memuat grafik prediksi:',
            error
          );
        }
      }

      fetchPredictionChart();
    }, []);

      const predictions = [
        {
          name: 'PM2.5',
          value:
            chartData[chartData.length - 1]?.predicted ??
            47.5
        },
        {
          name: 'PM10',
          value: 65
        },
        {
          name: 'CO',
          value: 0.70
        },
        {
          name: 'NO₂',
          value: 23
        },
        {
          name: 'O₃',
          value: 34
        }
      ];

    const insightText = predictions
      .map((item) => {
        if (
          item.name === 'PM2.5' &&
          item.value > 55
        ) {
          return `PM2.5 diprediksi meningkat hingga ${item.value} µg/m³ dan perlu mendapat perhatian lebih`;
        }

        if (
          item.name === 'PM10' &&
          item.value > 100
        ) {
          return `PM10 menunjukkan kenaikan konsentrasi dan perlu dipantau`;
        }

        if (item.name === 'CO') {
          return `CO berada pada level ${item.value} ppm dan masih dalam batas aman`;
        }

        if (item.name === 'NO₂') {
          return `NO₂ diperkirakan berada di angka ${item.value} dan relatif stabil`;
        }

        if (item.name === 'O₃') {
          return `O₃ berada pada konsentrasi ${item.value} dengan kondisi tetap baik`;
        }

        return `${item.name} berada pada kondisi stabil`;
      })
      .join('. ') + '. Secara umum kualitas udara Kota Surabaya diperkirakan tetap terkendali dalam 3 jam ke depan.';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: 12,
          padding: 20
        }}
      >
        <h2 style={{ marginTop: 0 }}>
          🔮 Prediksi Kualitas Udara — 3 Jam ke Depan
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 12
          }}
        >
          {[
            ['PM2.5', '47.5'],
            ['PM10', '65'],
            ['CO', '0.70'],
            ['NO₂', '23'],
            ['O₃', '34']
          ].map(([name, value]) => (
            <div
              key={name}
              style={{
                background: '#F8FAFC',
                border: '1px solid #E5E7EB',
                borderRadius: 10,
                padding: 16
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: '#64748B'
                }}
              >
                {name}
              </div>

              <div
                style={{
                  fontSize: 26,
                  fontWeight: 600,
                  marginTop: 8
                }}
              >
                {value}
              </div>

              <div
                style={{
                  fontSize: 12,
                  marginTop: 6,
                  color: '#1D9E75'
                }}
              >
                +3 jam
              </div>
            </div>
          ))}
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
        <h3>📈 Grafik Aktual vs Prediksi</h3>

        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

              <XAxis
                dataKey="time"
                tick={{ fontSize: 12 }}
              />

              <YAxis tick={{ fontSize: 12 }} />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="actual"
                stroke="#1D9E75"
                strokeWidth={2}
                dot={false}
                name="Aktual"
              />

              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#8B5CF6"
                strokeDasharray="6 6"
                strokeWidth={2}
                dot={false}
                name="Prediksi"
              />
            </LineChart>
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
        <h3>📌 Insight Prediksi</h3>

        <p
          style={{
            lineHeight: 1.7,
            color: '#475569'
          }}
        >
          {insightText}
        </p>
      </div>

    </div>
  );
}

export default Prediksi;