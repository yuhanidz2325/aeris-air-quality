import React, { useState, useEffect } from 'react';

function CardPredict({ baseUrl }) {
  const [predictions, setPredictions] = useState(null);
  const [segmentName, setSegmentName] = useState('');
  const [error, setError]             = useState(false);

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
        console.error('Gagal fetch prediksi:', err);
        setError(true);
      }
    }
    loadPredict();
  }, [baseUrl]);

  if (error) return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: '#FEE2E2', borderRadius: 12, padding: '14px 16px',
      border: '1px solid #FECACA',
    }}>
      <i className="ti ti-alert-circle" style={{ fontSize: 20, color: '#DC2626' }} aria-hidden />
      <span style={{ fontSize: 13, fontWeight: 600, color: '#7F1D1D' }}>
        Gagal memuat prediksi. Coba lagi nanti.
      </span>
    </div>
  );

  if (!predictions) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          background: '#F8FAFC', borderRadius: 12,
          padding: '14px 16px', border: '1px solid #E2E8F0',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#E2E8F0' }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: 60, height: 10, background: '#E2E8F0', borderRadius: 4, marginBottom: 6 }} />
            <div style={{ width: 40, height: 16, background: '#E2E8F0', borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );

  const slots = [
    {
      key: 'jam1', label: '+1 Jam',
      bg: '#DCFCE7', border: '#86EFAC', textColor: '#14532D',
      iconBg: '#BBF7D0', iconColor: '#16A34A', icon: 'ti-clock',
      badge: 'Baik', badgeBg: '#BBF7D0', badgeText: '#14532D',
    },
    {
      key: 'jam2', label: '+2 Jam',
      bg: '#FEF3C7', border: '#FCD34D', textColor: '#78350F',
      iconBg: '#FDE68A', iconColor: '#D97706', icon: 'ti-clock',
      badge: 'Sedang', badgeBg: '#FDE68A', badgeText: '#78350F',
    },
    {
      key: 'jam3', label: '+3 Jam',
      bg: '#DBEAFE', border: '#93C5FD', textColor: '#1E3A8A',
      iconBg: '#BFDBFE', iconColor: '#2563EB', icon: 'ti-clock',
      badge: 'Baik', badgeBg: '#BFDBFE', badgeText: '#1E3A8A',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* Model aktif */}
      {segmentName && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#F0FDF4', borderRadius: 10, padding: '8px 12px',
          border: '1px solid #BBF7D0',
        }}>
          <i className="ti ti-cpu" style={{ fontSize: 15, color: '#16A34A' }} aria-hidden />
          <span style={{ fontSize: 12, color: '#64748B' }}>
            Model aktif:
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#14532D' }}>
            {segmentName}
          </span>
        </div>
      )}

      {/* Slot cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {slots.map(slot => {
          const d = predictions[slot.key];
          if (!d) return null;
          return (
            <div
              key={slot.key}
              style={{
                background: slot.bg,
                border: `1.5px solid ${slot.border}`,
                borderRadius: 14,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 6px 18px ${slot.border}60`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Icon */}
              <div style={{
                width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                background: slot.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className={`ti ${slot.icon}`}
                  style={{ fontSize: 20, color: slot.iconColor }}
                  aria-hidden />
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: slot.textColor, opacity: 0.7, marginBottom: 3, letterSpacing: '0.05em' }}>
                  {slot.label}
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: slot.textColor, lineHeight: 1 }}>
                  {d.pm25.toFixed(1)}
                  <span style={{ fontSize: 12, fontWeight: 600, marginLeft: 4, opacity: 0.7 }}>µg/m³</span>
                </div>
              </div>

              {/* Detail kanan */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  background: slot.badgeBg, color: slot.badgeText,
                  padding: '3px 10px', borderRadius: 20,
                  display: 'inline-block', marginBottom: 6,
                }}>
                  {slot.badge}
                </span>
                <div style={{ fontSize: 11, color: slot.textColor, opacity: 0.65, lineHeight: 1.7 }}>
                  <div>PM10: <strong>{d.pm10.toFixed(1)}</strong></div>
                  <div>CO: <strong>{d.co.toFixed(2)}</strong> ppm</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CardPredict;