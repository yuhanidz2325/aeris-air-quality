import React, { useState, useEffect } from 'react';

function LandingPage({ onEnter }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F0FDF4 0%, #E0F2FE 30%, #F0F9FF 60%, #F0FDF4 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated background circles */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(29,158,117,0.08) 0%, transparent 70%)',
        animation: 'float 20s ease-in-out infinite',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '-5%',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(55,138,221,0.08) 0%, transparent 70%)',
        animation: 'float 25s ease-in-out infinite reverse',
        zIndex: 0
      }} />

      <div
        style={{
          maxWidth: '1150px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1.3fr 1fr',
          gap: '48px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Kiri - Hero Content */}
        <div style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s ease-out'
        }}>
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(29,158,117,0.1)',
              border: '1px solid rgba(29,158,117,0.2)',
              borderRadius: '99px',
              padding: '8px 16px',
              marginBottom: '24px'
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1D9E75', animation: 'pulse 2s infinite' }}></span>
            <span style={{ fontSize: '13px', color: '#085041', fontWeight: 600, letterSpacing: '0.5px' }}>
              AERIS v1.0 — LIVE MONITORING
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: '48px',
              lineHeight: 1.15,
              margin: 0,
              fontWeight: 800,
              color: '#1F2937',
              letterSpacing: '-0.5px'
            }}
          >
            Pemantauan{' '}
            <span style={{ color: '#1D9E75' }}>Kualitas Udara</span>
            <br />
            Kota Surabaya
          </h1>

          {/* Subtitle */}
          <p
            style={{
              marginTop: '24px',
              fontSize: '17px',
              lineHeight: 1.75,
              color: '#475569',
              maxWidth: '580px'
            }}
          >
            Sistem monitoring kualitas udara secara <strong style={{ color: '#1D9E75' }}>realtime</strong> dengan 
            deteksi anomali dan <strong style={{ color: '#378ADD' }}>prediksi kualitas udara 3 jam ke depan </strong> 
            berdasarkan data historis polutan di Kota Surabaya.
          </p>

          {/* Feature pills */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '32px',
              flexWrap: 'wrap'
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#FFFFFF',
                padding: '10px 18px',
                borderRadius: '99px',
                fontSize: '14px',
                color: '#475569',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                border: '1px solid #E5E7EB'
              }}
            >
              📍 <strong>Surabaya</strong> · -7.2575°S, 112.7521°E
            </span>

            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#E1F5EE',
                padding: '10px 18px',
                borderRadius: '99px',
                fontSize: '14px',
                color: '#085041',
                border: '1px solid #5DCAA5'
              }}
            >
              🔄 <strong>Realtime</strong> · Update tiap jam
            </span>

            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#E6F1FB',
                padding: '10px 18px',
                borderRadius: '99px',
                fontSize: '14px',
                color: '#0C447C',
                border: '1px solid #85B7EB'
              }}
            >
              🔮 <strong>Prediksi Kualitas Udara</strong> · 3 Jam
            </span>
          </div>

          {/* CTA Button */}
          <button
            onClick={onEnter}
            style={{
              marginTop: '40px',
              background: 'linear-gradient(135deg, #1D9E75 0%, #15803D 100%)',
              color: '#fff',
              border: 'none',
              padding: '16px 36px',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(29,158,117,0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 32px rgba(29,158,117,0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 24px rgba(29,158,117,0.3)';
            }}
          >
            <span>Masuk ke Dashboard</span>
            <span style={{ fontSize: '18px' }}>→</span>
          </button>

          {/* Trust indicators */}
          <div
            style={{
              marginTop: '32px',
              display: 'flex',
              gap: '24px',
              fontSize: '12px',
              color: '#888780'
            }}
          >
            <span>🏛️ Politeknik Elektronika Negeri Surabaya</span>
            <span>·</span>
            <span>Sains Data Terapan 2026</span>
          </div>
        </div>

        {/* Kanan - Dashboard Preview Card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(12px)',
            borderRadius: '28px',
            padding: '40px',
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.06)',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s ease-out 0.2s'
          }}
        >
          {/* Mini dashboard preview */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#E24B4A' }}></div>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F59E0B' }}></div>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#1D9E75' }}></div>
              <span style={{ fontSize: '12px', color: '#888780', marginLeft: 'auto' }}>Aeris Dashboard</span>
            </div>

            {/* Mini ISPU cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
              <div style={{ background: '#E1F5EE', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#085041' }}>PM2.5</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#1D9E75' }}>42</div>
                <div style={{ fontSize: '9px', color: '#085041' }}>Baik</div>
              </div>
              <div style={{ background: '#E6F1FB', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#0C447C' }}>PM10</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#378ADD' }}>68</div>
                <div style={{ fontSize: '9px', color: '#0C447C' }}>Sedang</div>
              </div>
              <div style={{ background: '#FAEEDA', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#633806' }}>NO₂</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#BA7517' }}>52</div>
                <div style={{ fontSize: '9px', color: '#633806' }}>Baik</div>
              </div>
            </div>

            {/* Mini chart line */}
            <div style={{ height: '60px', background: 'linear-gradient(180deg, rgba(29,158,117,0.1) 0%, transparent 100%)', borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
              <svg viewBox="0 0 200 60" style={{ width: '100%', height: '100%' }}>
                <path d="M0,45 Q30,35 60,40 T120,25 T180,30 T200,20" fill="none" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h3
            style={{
              textAlign: 'center',
              margin: 0,
              fontSize: '22px',
              fontWeight: 700,
              color: '#1F2937'
            }}
          >
            Aeris Dashboard
          </h3>

          <p
            style={{
              textAlign: 'center',
              color: '#64748B',
              fontSize: '13px',
              lineHeight: 1.6,
              marginTop: '8px'
            }}
          >
            Sistem monitoring kualitas udara berbasis 
            <strong> data science</strong> dan <strong>machine learning</strong> 
            untuk Kota Surabaya.
          </p>

          {/* Status indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '20px',
              padding: '10px',
              background: '#F0FDF4',
              borderRadius: '10px'
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1D9E75', animation: 'pulse 2s infinite' }}></span>
            <span style={{ fontSize: '12px', color: '#085041', fontWeight: 500 }}>Sistem Aktif · Data Realtime</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '12px',
          color: '#888780',
          textAlign: 'center'
        }}
      >
        Kelompok Aeris · PENS 2026 · Sains Data Terapan
      </div>

      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}} />
    </div>
  );
}

export default LandingPage;