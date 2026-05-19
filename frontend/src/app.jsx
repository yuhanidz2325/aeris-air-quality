import React, { useState, useEffect } from 'react';
import CardPredict from './components/CardPredict';
import TrendChart from './components/TrendChart';

const BASE_URL = "https://web-production-8b53f.up.railway.app";

function App() {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadStatus() {
    try {
      const res = await fetch(`${BASE_URL}/status/surabaya`);
      const data = await res.json();
      setStatusData(data);
    } catch (err) {
      console.error("Gagal fetch status:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const styles = {
    container: { backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '30px', fontFamily: 'sans-serif' },
    header: { borderBottom: '1px solid #334155', paddingBottom: '15px', marginBottom: '30px' },
    title: { color: '#2dd4bf', margin: '0 0 5px 0', fontSize: '28px' },
    subtitle: { color: '#94a3b8', margin: '0' },
    statusBox: { backgroundColor: '#1e293b', border: '1px solid #475569', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    sectionTitle: { fontSize: '20px', color: '#cbd5e1', marginBottom: '15px' }
  };

  const getCategory = () => {
    if (!statusData) return "-";
    return statusData.ispu_status?.[0]?.category ?? "-";
  };

  const getIspuValue = () => {
    if (!statusData) return "-";
    return statusData.ispu_status?.[0]?.value ?? "-";
  };

  const badgeColor = getCategory() === "Baik"
    ? { backgroundColor: 'rgba(16,185,129,0.2)', color: '#34d399', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold' }
    : { backgroundColor: 'rgba(244,63,94,0.2)', color: '#f43f5e', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold' };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>AERIS Dashboard</h1>
        <p style={styles.subtitle}>Sistem Deteksi Anomali Kualitas Udara Kota Surabaya</p>
      </header>

      <div style={styles.statusBox}>
        <div>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>Status Kualitas Udara Saat Ini</h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            {loading ? "Memuat data..." : `ISPU: ${getIspuValue()} — ${getCategory()}`}
          </p>
        </div>
        <span style={badgeColor}>{loading ? "..." : getCategory()}</span>
      </div>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={styles.sectionTitle}>Visualisasi Tren Historis</h2>
        <TrendChart baseUrl={BASE_URL} />
      </section>

      <section>
        <h2 style={styles.sectionTitle}>Prediksi Polutan Berdasarkan Segmentasi Waktu</h2>
        <CardPredict baseUrl={BASE_URL} />
      </section>
    </div>
  );
}

export default App;