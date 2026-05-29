import React from 'react';

function Prediksi() {
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

        <div
          style={{
            height: 300,
            background: '#F8FAFC',
            borderRadius: 10,
            border: '1px dashed #CBD5E1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748B'
          }}
        >
          Grafik prediksi akan ditampilkan di sini
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
          PM2.5 diprediksi mengalami peningkatan dalam 3 jam ke depan,
          sementara PM10 menunjukkan tren stabil.
          Konsentrasi CO, NO₂, dan O₃ masih berada pada rentang aman.
          Secara umum kualitas udara Kota Surabaya diperkirakan tetap stabil,
          namun PM2.5 perlu dipantau lebih lanjut pada jam-jam berikutnya.
        </p>
      </div>

    </div>
  );
}

export default Prediksi;