import React from 'react';

function Edukasi() {
  const pollutants = [
    {
      name: 'PM2.5',
      icon: '🔬',
      color: '#1D9E75',
      desc: 'Partikel berukuran ≤2.5 mikrometer yang dapat masuk ke alveolus paru-paru dan aliran darah.',
      sources: 'Kendaraan, pembakaran batubara, kebakaran hutan.',
      health: 'Gangguan pernapasan, asma, penyakit jantung.'
    },
    {
      name: 'PM10',
      icon: '💨',
      color: '#378ADD',
      desc: 'Partikel debu halus ≤10 mikrometer yang mengendap di saluran pernapasan atas.',
      sources: 'Debu jalanan, konstruksi, industri, erosi tanah.',
      health: 'Iritasi saluran napas, batuk, memperburuk asma.'
    },
    {
      name: 'CO',
      icon: '☁️',
      color: '#EF9F27',
      desc: 'Gas tidak berwarna, tidak berbau dari pembakaran tidak sempurna.',
      sources: 'Asap kendaraan, pembakaran kayu, generator.',
      health: 'Sakit kepala, pusing, lemas, gangguan jantung.'
    },
    {
      name: 'NO₂',
      icon: '🏭',
      color: '#534AB7',
      desc: 'Gas cokelat kemerahan dengan bau tajam dari pembakaran suhu tinggi.',
      sources: 'Emisi diesel, pembangkit listrik, industri.',
      health: 'Peradangan saluran napas, penurunan fungsi paru.'
    },
    {
      name: 'O₃',
      icon: '☀️',
      color: '#E24B4A',
      desc: 'Gas yang terbentuk dari reaksi polutan dengan sinar UV matahari.',
      sources: 'Polutan sekunder, bukan emisi langsung.',
      health: 'Iritasi mata, tenggorokan, batuk, kerusakan paru.'
    }
  ];

  const categories = [
    { status: 'Baik', range: '0 – 50', color: '#E1F5EE', border: '#5DCAA5', text: '#085041', icon: '😊', desc: 'Tidak menimbulkan risiko kesehatan.' },
    { status: 'Sedang', range: '51 – 100', color: '#E6F1FB', border: '#85B7EB', text: '#0C447C', icon: '😐', desc: 'Dapat mempengaruhi kelompok sensitif.' },
    { status: 'Tidak Sehat', range: '101 – 200', color: '#FAEEDA', border: '#EF9F27', text: '#633806', icon: '😷', desc: 'Semua orang dapat mengalami gangguan kesehatan.' },
    { status: 'Sangat Tidak Sehat', range: '201 – 300', color: '#FCEBEB', border: '#F09595', text: '#791F1F', icon: '🤒', desc: 'Peringatan kesehatan darurat.' },
    { status: 'Berbahaya', range: '> 300', color: '#2C2C2A', border: '#444441', text: '#F1EFE8', icon: '⚠️', desc: 'Kondisi darurat kesehatan.' }
  ];

  const tips = [
    { icon: '😷', title: 'Gunakan Masker', desc: 'Pilih N95/KN95 untuk menyaring PM2.5.' },
    { icon: '🏠', title: 'Batasi Aktivitas Luar', desc: 'Kurangi outdoor saat ISPU > 100.' },
    { icon: '🪟', title: 'Tutup Jendela', desc: 'Cegah udara kotor masuk ruangan.' },
    { icon: '🌿', title: 'Air Purifier', desc: 'Filter HEPA efektif menyaring polutan.' },
    { icon: '📱', title: 'Pantau Kualitas Udara', desc: 'Cek ISPU sebelum aktivitas outdoor.' }
  ];

  const infoCards = [
    {
      icon: '📖',
      title: 'Cara Membaca Data AERIS',
      desc: 'Nilai yang ditampilkan pada dashboard menunjukkan konsentrasi polutan udara terkini di Kota Surabaya. Semakin tinggi nilainya, semakin besar potensi dampaknya terhadap kesehatan.',
      color: '#1D9E75'
    },
    {
      icon: '🔬',
      title: 'Polutan Dominan PM2.5',
      desc: 'PM2.5 merupakan partikel udara berukuran sangat kecil yang mudah masuk ke saluran pernapasan hingga paru-paru. Polutan ini sering berasal dari kendaraan bermotor, pembakaran terbuka, dan aktivitas industri.',
      color: '#378ADD'
    },
    {
      icon: '📊',
      title: 'Kategori Status ISPU',
      desc: 'Dashboard AERIS menggunakan kategori ISPU untuk menggambarkan kondisi kualitas udara: Baik, Sedang, Tidak Sehat, Sangat Tidak Sehat, dan Berbahaya. Semakin tinggi nilainya, semakin besar potensi risikonya terhadap kesehatan.',
      color: '#EF9F27'
    },
    {
      icon: '🔮',
      title: 'Cara Sistem Membuat Prediksi',
      desc: 'Prediksi kualitas udara 3 jam ke depan dihitung menggunakan model machine learning Random Forest berdasarkan data historis polutan dan pola waktu monitoring.',
      color: '#534AB7'
    },
    {
      icon: '⚠️',
      title: 'Deteksi Anomali pada AERIS',
      desc: 'AERIS menggunakan Isolation Forest untuk mendeteksi lonjakan polusi yang tidak biasa. Sistem membantu mengenali pola data yang menyimpang from kondisi normal.',
      color: '#E24B4A'
    }
  ];

  const sectionTitle = { fontSize: 14, fontWeight: 600, color: '#1F2937', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #E6F1FB 100%)', borderRadius: 16, padding: 28, border: '1px solid #5DCAA5' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🌍</div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#1F2937' }}>Edukasi Kualitas Udara</h1>
        <p style={{ margin: '8px 0 0', fontSize: 15, color: '#475569', lineHeight: 1.6 }}>
          Pahami parameter kualitas udara, kategori ISPU, dan cara melindungi diri dari dampak polusi udara.
        </p>
      </div>

      {/* POLUTAN */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 16, padding: 24 }}>
        <div style={sectionTitle}><span>🔬</span> Mengenal Parameter Kualitas Udara</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {pollutants.map((item) => (
            <div key={item.name} style={{ background: '#F8FAFC', borderRadius: 14, padding: 18, border: '1px solid #E5E7EB', borderTop: `4px solid ${item.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 24 }}>{item.icon}</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#1F2937' }}>{item.name}</span>
              </div>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: '0 0 10px' }}>{item.desc}</p>
              <div style={{ fontSize: 11, color: '#64748B', borderTop: '1px solid #E5E7EB', paddingTop: 8 }}>
                <strong style={{ color: '#1F2937' }}>Sumber:</strong> {item.sources}
              </div>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                <strong style={{ color: '#1F2937' }}>Kesehatan:</strong> {item.health}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KATEGORI ISPU */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 16, padding: 24 }}>
        <div style={sectionTitle}><span>📊</span> Kategori Indeks Standar Pencemar Udara (ISPU)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {categories.map((item) => (
            <div key={item.status} style={{ background: item.color, borderRadius: 14, padding: 18, border: `1.5px solid ${item.border}` }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: item.text }}>{item.status}</div>
              <div style={{ fontSize: 13, color: item.text, opacity: 0.8, margin: '4px 0' }}>ISPU {item.range}</div>
              <div style={{ fontSize: 11, color: item.text, opacity: 0.7 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TIPS */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 16, padding: 24 }}>
        <div style={sectionTitle}><span>💡</span> Tips Saat Kualitas Udara Buruk</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {tips.map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, background: '#F8FAFC', borderRadius: 12, padding: 16, border: '1px solid #E5E7EB' }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{tip.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937', marginBottom: 4 }}>{tip.title}</div>
                <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>{tip.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INFORMASI & PANDUAN */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 16, padding: 24 }}>
        <div style={sectionTitle}><span>📚</span> Informasi & Panduan Kualitas Udara</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {infoCards.map((card, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 16,
                background: '#F8FAFC',
                borderRadius: 14,
                padding: 18,
                border: '1px solid #E5E7EB',
                borderLeft: `4px solid ${card.color}`
              }}
            >
              <span style={{ fontSize: 28, flexShrink: 0 }}>{card.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937', marginBottom: 6 }}>
                  {card.title}
                </div>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, margin: 0 }}>
                  {card.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Edukasi;