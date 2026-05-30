import React from 'react';

function Edukasi() {
  const pollutants = [
    {
      name: 'PM2.5',
      desc:
        'Partikel udara berukuran sangat kecil yang dapat masuk hingga ke paru-paru. Paparan tinggi dapat memicu gangguan pernapasan dan iritasi.'
    },
    {
      name: 'PM10',
      desc:
        'Partikel debu halus di udara yang dapat berasal dari kendaraan, jalanan, atau aktivitas konstruksi.'
    },
    {
      name: 'CO',
      desc:
        'Karbon Monoksida adalah gas tidak berwarna dan tidak berbau yang banyak dihasilkan dari asap kendaraan bermotor.'
    },
    {
      name: 'NO₂',
      desc:
        'Nitrogen Dioksida umumnya berasal dari emisi kendaraan dan pembakaran bahan bakar. Paparan tinggi dapat mengganggu sistem pernapasan.'
    },
    {
      name: 'O₃',
      desc:
        'Ozon permukaan terbentuk akibat reaksi kimia polutan di udara dengan sinar matahari. Konsentrasi tinggi dapat menyebabkan iritasi mata dan tenggorokan.'
    }
  ];

  const categories = [
    {
      status: 'Baik',
      range: '0 – 50',
      color: '#EAF8F0'
    },
    {
      status: 'Sedang',
      range: '51 – 100',
      color: '#EAF2FF'
    },
    {
      status: 'Tidak Sehat',
      range: '101 – 200',
      color: '#FFF4E5'
    },
    {
      status: 'Sangat Tidak Sehat',
      range: '201 – 300',
      color: '#FFEAEA'
    }
  ];

  const tips = [
    'Gunakan masker saat kualitas udara berada pada kategori Tidak Sehat.',
    'Kurangi aktivitas luar ruangan saat PM2.5 meningkat.',
    'Tutup jendela rumah saat polusi udara tinggi.',
    'Gunakan air purifier bila tersedia di dalam ruangan.',
    'Pantau kualitas udara secara berkala sebelum beraktivitas di luar.'
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}
    >
      {/* Polutan */}
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 20,
          border: '0.5px solid #D3D1C7'
        }}
      >
        <h2 style={{ marginBottom: 16 }}>
          🌫 Mengenal Parameter Kualitas Udara
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12
          }}
        >
          {pollutants.map((item) => (
            <div
              key={item.name}
              style={{
                background: '#F8FAFC',
                borderRadius: 10,
                padding: 16
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  marginBottom: 8
                }}
              >
                {item.name}
              </div>

              <div
                style={{
                  lineHeight: 1.7,
                  color: '#475569',
                  fontSize: 14
                }}
              >
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kategori ISPU */}
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 20,
          border: '0.5px solid #D3D1C7'
        }}
      >
        <h2 style={{ marginBottom: 16 }}>
          📊 Kategori Indeks Standar Pencemar Udara (ISPU)
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12
          }}
        >
          {categories.map((item) => (
            <div
              key={item.status}
              style={{
                background: item.color,
                borderRadius: 10,
                padding: 16
              }}
            >
              <div style={{ fontWeight: 600 }}>
                {item.status}
              </div>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 14
                }}
              >
                ISPU {item.range}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 20,
          border: '0.5px solid #D3D1C7'
        }}
      >
        <h2 style={{ marginBottom: 16 }}>
          💡 Tips Saat Kualitas Udara Buruk
        </h2>

        <ul
          style={{
            margin: 0,
            paddingLeft: 20,
            lineHeight: 2,
            color: '#475569'
          }}
        >
          {tips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Edukasi;