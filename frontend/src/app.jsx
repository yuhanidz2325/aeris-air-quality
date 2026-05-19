import React, { useState, useEffect } from 'react';
import CardPredict from './components/CardPredict';
import TrendChart from './components/TrendChart';

function App() {
  // 1. Data dummy diatur sebagai default awal agar dashboard tidak kosong saat backend mati
  const [airData, setAirData] = useState({
    city: "Surabaya",
    current_status: "NORMAL",
    predictions: {
      pagi: { pm25: 22.1, pm10: 38.5, co: 0.6, status: "NORMAL" },
      siang: { pm25: 45.8, pm10: 55.2, co: 1.2, status: "ANOMALI" },
      sore_malam: { pm25: 28.4, pm10: 44.0, co: 0.9, status: "NORMAL" }
    }
  });

  // 2. Fungsi 'Kabel Konektor' untuk menembak API Backend riil nanti
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        // Ganti URL ini sesuai dengan endpoint endpoint API backend dari timmu nanti
        const response = await fetch('http://localhost:8000/api/air-quality');
        if (response.ok) {
          const realData = await response.json();
          setAirData(realData); // Jika backend siap, data dummy langsung diganti data asli
        }
      } catch (error) {
        console.log("Backend belum tersambung atau belum aktif, menggunakan data simulasi.");
      }
    };

    fetchRealData();
  }, []);

  // Gaya pencahayaan bertema gelap manual (Inline Styles)
  const styles = {
    container: { backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '30px', fontFamily: 'sans-serif' },
    header: { borderBottom: '1px solid #334155', paddingBottom: '15px', marginBottom: '30px' },
    title: { color: '#2dd4bf', margin: '0 0 5px 0', fontSize: '28px' },
    subtitle: { color: '#94a3b8', margin: '0' },
    statusBox: { backgroundColor: '#1e293b', border: '1px solid #475569', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    badgeNormal: { backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold' },
    sectionTitle: { fontSize: '20px', color: '#cbd5e1', marginBottom: '15px' }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>AERIS Dashboard</h1>
        <p style={styles.subtitle}>Sistem Deteksi Anomali Kualitas Udara Kota {airData.city}</p>
      </header>

      {/* Status Utama */}
      <div style={styles.statusBox}>
        <div>
          <h2 style={{margin: '0 0 5px 0', fontSize: '18px'}}>Status Kualitas Udara Saat Ini</h2>
          <p style={{margin: 0, fontSize: '13px', color: '#64748b'}}>Berdasarkan Algoritma Isolation Forest</p>
        </div>
        <span style={styles.badgeNormal}>{airData.current_status}</span>
      </div>

      {/* Section Grafik Tren */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={styles.sectionTitle}>Visualisasi Tren Historis</h2>
        <TrendChart />
      </section>

      {/* Section Prediksi Waktu */}
      <section>
        <h2 style={styles.sectionTitle}>Prediksi Polutan Berdasarkan Segmentasi Waktu</h2>
        <CardPredict data={airData.predictions} />
      </section>
    </div>
  );
}

export default App;