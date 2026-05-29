import React from 'react';

function LandingPage({ onEnter }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #F7F8F5 0%, #E8F6EF 45%, #DCEFFD 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '40px',
          alignItems: 'center'
        }}
      >
        {/* kiri */}
        <div>
          <div
            style={{
              fontSize: '14px',
              color: '#1D9E75',
              fontWeight: 600,
              marginBottom: 16,
              letterSpacing: '1px'
            }}
          >
            AERIS • AIR QUALITY MONITORING
          </div>

          <h1
            style={{
              fontSize: '52px',
              lineHeight: 1.1,
              margin: 0,
              fontWeight: 700,
              color: '#1F2937'
            }}
          >
            Pemantauan Kualitas Udara Kota Surabaya
          </h1>

          <p
            style={{
              marginTop: 20,
              fontSize: '18px',
              lineHeight: 1.7,
              color: '#4B5563',
              maxWidth: '620px'
            }}
          >
            Pantau kualitas udara secara realtime,
            deteksi anomali polutan,
            dan lihat prediksi kondisi udara
            beberapa jam ke depan
            menggunakan machine learning.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '28px',
              flexWrap: 'wrap'
            }}
          >
            <span
              style={{
                background: '#ffffff',
                padding: '10px 16px',
                borderRadius: '999px',
                fontSize: '14px'
              }}
            >
              📍 Surabaya
            </span>

            <span
              style={{
                background: '#ffffff',
                padding: '10px 16px',
                borderRadius: '999px',
                fontSize: '14px'
              }}
            >
              🌤 Realtime Monitoring
            </span>

            <span
              style={{
                background: '#ffffff',
                padding: '10px 16px',
                borderRadius: '999px',
                fontSize: '14px'
              }}
            >
              🤖 AI Prediction
            </span>
          </div>

          <button
            onClick={onEnter}
            style={{
              marginTop: '36px',
              background: '#1D9E75',
              color: '#fff',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow:
                '0 8px 24px rgba(29,158,117,0.25)'
            }}
          >
            Masuk ke Dashboard →
          </button>
        </div>

        {/* kanan */}
        <div
          style={{
            background: 'rgba(255,255,255,0.65)',
            backdropFilter: 'blur(8px)',
            borderRadius: '24px',
            padding: '36px',
            border: '1px solid rgba(255,255,255,0.6)'
          }}
        >
          <div
            style={{
              fontSize: '88px',
              textAlign: 'center'
            }}
          >
            🌿
          </div>

          <h3
            style={{
              textAlign: 'center',
              marginTop: '12px',
              fontSize: '24px'
            }}
          >
            Aeris Dashboard
          </h3>

          <p
            style={{
              textAlign: 'center',
              color: '#6B7280',
              lineHeight: 1.6
            }}
          >
            Sistem monitoring kualitas udara
            berbasis data dan machine learning
            untuk Kota Surabaya.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;