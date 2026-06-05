import React, { useState, useEffect } from 'react';

function CardPredict({ baseUrl }) {
  const [predictions, setPredictions] = useState(null);
  const [segmentName, setSegmentName] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadPredict() {
      try {
        const res  = await fetch(`${baseUrl}/predict/surabaya`);
        const data = await res.json();

        if (data && data.predictions) {
          setSegmentName(data.segment);
          const p = data.predictions;
          setPredictions({
            jam1: { pm25: p.pm25?.[0] ?? 0, pm10: p.pm10?.[0] ?? 0, co: p.co?.[0] ?? 0 },
            jam2: { pm25: p.pm25?.[1] ?? 0, pm10: p.pm10?.[1] ?? 0, co: p.co?.[1] ?? 0 },
            jam3: { pm25: p.pm25?.[2] ?? 0, pm10: p.pm10?.[2] ?? 0, co: p.co?.[2] ?? 0 },
          });
        }
      } catch (err) {
        console.error("Gagal fetch prediksi:", err);
        setError(true);
      }
    }
    loadPredict();
  }, [baseUrl]);

  if (error) return (
    <p style={{ fontSize: 12, color: '#A32D2D' }}>Gagal memuat prediksi.</p>
  );

  if (!predictions) return (
    <p style={{ fontSize: 12, color: '#888780' }}>Memuat prediksi...</p>
  );

  const slots = [
    { key: 'jam1', label: '+1 jam', color: '#BA7517' },
    { key: 'jam2', label: '+2 jam', color: '#EF9F27' },
    { key: 'jam3', label: '+3 jam', color: '#534AB7' },
  ];

  return (
    <div>
      {segmentName && (
        <p style={{ fontSize: 11, color: '#888780', marginBottom: 10 }}>
          Model aktif: <strong style={{ color: '#0F6E56' }}>{segmentName}</strong>
        </p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {slots.map(slot => {
          const d = predictions[slot.key];
          if (!d) return null;
          return (
            <div key={slot.key} style={{
              background: '#F1EFE8', borderRadius: 8, padding: '10px 12px'
            }}>
              <div style={{ fontSize: 11, color: '#888780', marginBottom: 4 }}>
                ⏱ {slot.label}
              </div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#2C2C2A', marginBottom: 6 }}>
                {d.pm25.toFixed(1)} µg/m³
              </div>
              <div style={{ fontSize: 11, color: '#5F5E5A', lineHeight: 1.6 }}>
                <div>PM10: {d.pm10.toFixed(1)}</div>
                <div>CO: {d.co.toFixed(2)} ppm</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CardPredict;
