import React, { useState, useEffect } from 'react';

function CardPredict({ baseUrl }) {
  const [predictions, setPredictions] = useState(null);
  const [segmentName, setSegmentName] = useState("");

  useEffect(() => {
    async function loadPredict() {
      try {
        const res = await fetch(`${baseUrl}/predict/surabaya`);
        const data = await res.json();
        
        // JEMBATAN DATA: Mengubah format array Backend jadi format kartu Frontend
        if (data && data.predictions) {
          setSegmentName(data.segment); // Menyimpan nama segmen waktu (PAGI/SIANG/SORE_MALAM)
          const p = data.predictions;
          
          // Memecah array indeks 0, 1, dan 2 menjadi 3 kartu jam
          const transformedData = {
            jam1: { pm25: p.pm25?.[0] || 0, pm10: p.pm10?.[0] || 0, co: p.co?.[0] || 0, status: "TBD" },
            jam2: { pm25: p.pm25?.[1] || 0, pm10: p.pm10?.[1] || 0, co: p.co?.[1] || 0, status: "TBD" },
            jam3: { pm25: p.pm25?.[2] || 0, pm10: p.pm10?.[2] || 0, co: p.co?.[2] || 0, status: "TBD" }
          };
          setPredictions(transformedData);
        }
      } catch (err) {
        console.error("Gagal fetch prediksi:", err);
      }
    }
    loadPredict();
  }, [baseUrl]);

  const styles = {
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
    card: { backgroundColor: '#1e293b', border: '1px solid #334155', padding: '20px', borderRadius: '12px' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', fontWeight: 'bold' },
    badgeNormal: { backgroundColor: 'rgba(16,185,129,0.1)', color: '#34d399', fontSize: '12px', padding: '3px 8px', borderRadius: '4px' },
    badgeAnomali: { backgroundColor: 'rgba(244,63,94,0.1)', color: '#f43f5e', fontSize: '12px', padding: '3px 8px', borderRadius: '4px' },
    row: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px', color: '#94a3b8' },
    value: { fontFamily: 'monospace', color: '#f8fafc' }
  };

  if (!predictions) return <p style={{ color: '#94a3b8' }}>Memuat prediksi...</p>;

  // Judul kartu diganti agar sesuai dengan logika model Machine Learning-mu
  const slots = [
    { key: 'jam1', label: '+1 Jam Kedepan', color: '#fbbf24' },
    { key: 'jam2', label: '+2 Jam Kedepan', color: '#f97316' },
    { key: 'jam3', label: '+3 Jam Kedepan', color: '#818cf8' }
  ];

  return (
    <div>
      <p style={{ color: '#94a3b8', marginBottom: '15px', fontSize: '14px' }}>
        Segmen Model Aktif: <strong style={{color: '#2dd4bf'}}>{segmentName}</strong>
      </p>
      <div style={styles.grid}>
        {slots.map(slot => {
          const d = predictions[slot.key];
          if (!d) return null;
          const isAnomali = d.status === 'ANOMALI';
          return (
            <div key={slot.key} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={{ color: slot.color }}>{slot.label}</span>
                <span style={isAnomali ? styles.badgeAnomali : styles.badgeNormal}>{d.status}</span>
              </div>
              <div style={styles.row}><span>PM2.5:</span><span style={{ ...styles.value, color: isAnomali ? '#f43f5e' : '#f8fafc' }}>{d.pm25} μg/m³</span></div>
              <div style={styles.row}><span>PM10:</span><span style={styles.value}>{d.pm10} μg/m³</span></div>
              <div style={styles.row}><span>CO:</span><span style={styles.value}>{d.co} ppm</span></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CardPredict;