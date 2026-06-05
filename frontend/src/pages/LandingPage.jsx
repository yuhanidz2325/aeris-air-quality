import React, { useEffect, useState } from 'react';

function LandingPage({ onEnter }) {
  const [visible, setVisible] = useState(false);
  const [time, setTime]       = useState('');
  const [date, setDate]       = useState('');

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    function updateTime() {
      const now = new Date();
      setTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    }
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { icon: 'ti-leaf',  label: 'PM2.5', color: '#16A34A', bg: '#DCFCE7', border: '#86EFAC', textColor: '#14532D' },
    { icon: 'ti-wind',  label: 'PM10',  color: '#2563EB', bg: '#DBEAFE', border: '#93C5FD', textColor: '#1E3A8A' },
    { icon: 'ti-flame', label: 'CO',    color: '#D97706', bg: '#FEF3C7', border: '#FCD34D', textColor: '#78350F' },
    { icon: 'ti-atom',  label: 'NO₂',   color: '#7C3AED', bg: '#EDE9FE', border: '#C4B5FD', textColor: '#3B0764' },
    { icon: 'ti-sun',   label: 'O₃',    color: '#BE123C', bg: '#FFE4E6', border: '#FECDD3', textColor: '#4C0519' },
  ];

  const features = [
    {
      icon: 'ti-chart-line',
      title: 'Monitoring Real-time',
      desc: 'Pantau 5 parameter kualitas udara secara langsung dengan data yang diperbarui setiap jam.',
      color: '#16A34A', bg: '#DCFCE7', border: '#86EFAC', textColor: '#14532D',
    },
    {
      icon: 'ti-crystal-ball',
      title: 'Prediksi 3 Jam ke Depan',
      desc: 'Model machine learning Random Forest memprediksi kualitas udara 3 jam ke depan.',
      color: '#2563EB', bg: '#DBEAFE', border: '#93C5FD', textColor: '#1E3A8A',
    },
    {
      icon: 'ti-zoom-scan',
      title: 'Deteksi Anomali Otomatis',
      desc: 'Algoritma Isolation Forest mendeteksi lonjakan polusi tidak wajar secara otomatis.',
      color: '#7C3AED', bg: '#EDE9FE', border: '#C4B5FD', textColor: '#3B0764',
    },
    {
      icon: 'ti-book',
      title: 'Edukasi Kualitas Udara',
      desc: 'Pelajari dampak polusi, cara perlindungan diri, dan fakta penting tentang kualitas udara.',
      color: '#D97706', bg: '#FEF3C7', border: '#FCD34D', textColor: '#78350F',
    },
  ];

  const teknologi = [
    { icon: 'ti-brand-python',        label: 'Python & FastAPI',   desc: 'Backend API & ML pipeline',       color: '#2563EB', bg: '#DBEAFE', border: '#93C5FD', textColor: '#1E3A8A' },
    { icon: 'ti-brand-react',         label: 'React + Vite',       desc: 'Frontend modern & responsif',     color: '#16A34A', bg: '#DCFCE7', border: '#86EFAC', textColor: '#14532D' },
    { icon: 'ti-cpu',                 label: 'PyCaret & Sklearn',  desc: 'Seleksi model otomatis',           color: '#7C3AED', bg: '#EDE9FE', border: '#C4B5FD', textColor: '#3B0764' },
    { icon: 'ti-chart-dots',          label: 'Random Forest',      desc: 'Model prediksi terbaik',           color: '#D97706', bg: '#FEF3C7', border: '#FCD34D', textColor: '#78350F' },
    { icon: 'ti-zoom-scan',           label: 'Isolation Forest',   desc: 'Deteksi anomali real-time',        color: '#BE123C', bg: '#FFE4E6', border: '#FECDD3', textColor: '#4C0519' },
    { icon: 'ti-cloud-data-connection', label: 'Open-Meteo API',   desc: 'Sumber data kualitas udara',       color: '#2563EB', bg: '#DBEAFE', border: '#93C5FD', textColor: '#1E3A8A' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      overflowX: 'hidden',
    }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        background: 'rgba(240,253,244,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E2E8F0',
        padding: '0 40px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: 'linear-gradient(135deg, #059669, #2563EB)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className="ti ti-wind" style={{ fontSize: 19, color: '#fff' }} aria-hidden />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>AERIS</div>
            <div style={{ fontSize: 10, color: '#94A3B8' }}>Air Quality Monitoring System</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
            background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA',
            display: 'flex', alignItems: 'center', gap: 6,
            animation: 'pulseBadge 2s infinite',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#DC2626', display: 'inline-block', animation: 'pulseDot 2s infinite' }} />
            LIVE
          </span>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#64748B' }}>{time}</span>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section style={{
        background: 'linear-gradient(135deg, #F0FDF4 0%, #EFF6FF 40%, #F5F3FF 70%, #FFF7ED 100%)',
        minHeight: '88vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 40px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 320, height: 320, borderRadius: '50%', background: '#DCFCE7', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 240, height: 240, borderRadius: '50%', background: '#DBEAFE', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', left: '5%', width: 140, height: 140, borderRadius: '50%', background: '#FEF3C7', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '8%', width: 100, height: 100, borderRadius: '50%', background: '#FFE4E6', pointerEvents: 'none' }} />

        <div style={{
          maxWidth: 780, textAlign: 'center', position: 'relative',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          {/* Location badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <span style={{
              fontSize: 12, fontWeight: 700, color: '#475569',
              background: '#F1F5F9', padding: '6px 18px',
              borderRadius: 20, border: '1px solid #E2E8F0',
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
              <i className="ti ti-map-pin" style={{ fontSize: 13, color: '#16A34A' }} aria-hidden />
              Kota Surabaya · Jawa Timur · Indonesia
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 58, fontWeight: 800, color: '#0F172A',
            lineHeight: 1.15, marginBottom: 20, letterSpacing: '-0.02em',
          }}>
            Pantau Kualitas Udara
            <br />
            <span style={{
              background: 'linear-gradient(90deg, #16A34A, #2563EB, #7C3AED)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Surabaya Real-time
            </span>
          </h1>

          <p style={{
            fontSize: 17, color: '#64748B', lineHeight: 1.75,
            marginBottom: 36, maxWidth: 560, margin: '0 auto 36px',
          }}>
            AERIS memantau 5 parameter polutan udara secara real-time,
            memprediksi kondisi 3 jam ke depan, dan mendeteksi anomali
            menggunakan machine learning.
          </p>

          {/* Date */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#F8FAFC', padding: '8px 20px',
            borderRadius: 20, border: '1px solid #E2E8F0', marginBottom: 40,
          }}>
            <i className="ti ti-calendar" style={{ fontSize: 14, color: '#16A34A' }} aria-hidden />
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>{date}</span>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button
              onClick={onEnter}
              style={{
                fontSize: 15, fontWeight: 800,
                padding: '14px 36px', borderRadius: 14,
                border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #059669, #2563EB)',
                color: '#fff', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 10,
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 20px rgba(37,99,235,0.25)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(37,99,235,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,99,235,0.25)'; }}
            >
              <i className="ti ti-dashboard" style={{ fontSize: 18 }} aria-hidden />
              Buka Dashboard
              <i className="ti ti-arrow-right" style={{ fontSize: 16 }} aria-hidden />
            </button>

            <button
              onClick={() => document.getElementById('fitur').scrollIntoView({ behavior: 'smooth' })}
              style={{
                fontSize: 15, fontWeight: 700,
                padding: '14px 28px', borderRadius: 14,
                border: '1.5px solid #E2E8F0',
                cursor: 'pointer',
                background: '#F8FAFC',
                color: '#475569', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(15,23,42,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <i className="ti ti-info-circle" style={{ fontSize: 16 }} aria-hidden />
              Pelajari Lebih Lanjut
            </button>
          </div>

          {/* Polutan pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginTop: 48 }}>
            {stats.map(s => (
              <div key={s.label}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: s.bg, border: `1px solid ${s.border}`,
                  padding: '6px 14px', borderRadius: 20,
                  transition: 'all 0.18s', cursor: 'default',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 12px ${s.border}80`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <i className={`ti ${s.icon}`} style={{ fontSize: 14, color: s.color }} aria-hidden />
                <span style={{ fontSize: 12, fontWeight: 700, color: s.textColor }}>{s.label}</span>
                <span style={{ fontSize: 10, color: '#94A3B8' }}>·</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: s.color }}>Terpantau</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section style={{
        background: 'linear-gradient(135deg, #DCFCE7 0%, #DBEAFE 50%, #EDE9FE 100%)',
        border: '1px solid #E2E8F0',
        padding: '28px 40px',
        borderTop: '1px solid #E2E8F0',
        borderBottom: '1px solid #E2E8F0',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {[
            { icon: 'ti-clock',     value: 'Setiap Jam', label: 'Frekuensi Update',     color: '#16A34A', textColor: '#14532D' },
            { icon: 'ti-database',  value: '18.432+',    label: 'Data Historis',         color: '#2563EB', textColor: '#1E3A8A' },
            { icon: 'ti-cpu',       value: '15 Model',   label: 'ML Dibandingkan',       color: '#7C3AED', textColor: '#3B0764' },
            { icon: 'ti-chart-bar', value: '87%',        label: 'Akurasi Prediksi (R²)', color: '#D97706', textColor: '#78350F' },
          ].map(item => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <i className={`ti ${item.icon}`} style={{ fontSize: 26, color: item.color, display: 'block', marginBottom: 8 }} aria-hidden />
              <div style={{ fontSize: 22, fontWeight: 800, color: item.textColor, marginBottom: 4 }}>{item.value}</div>
              <div style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FITUR SECTION ── */}
      <section id="fitur" style={{ padding: '72px 40px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#16A34A', letterSpacing: '0.1em', marginBottom: 10 }}>
            FITUR UNGGULAN
          </div>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: '#0F172A', marginBottom: 12, letterSpacing: '-0.01em' }}>
            Semua yang Kamu Butuhkan
          </h2>
          <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.7, maxWidth: 500, margin: '0 auto' }}>
            Dashboard AERIS dirancang untuk membantu masyarakat memahami dan mengantisipasi kondisi kualitas udara Surabaya.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {features.map(f => (
            <div key={f.title}
              style={{
                background: f.bg, border: `1.5px solid ${f.border}`,
                borderRadius: 20, padding: '24px 26px',
                display: 'flex', gap: 18, alignItems: 'flex-start',
                transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${f.border}80`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={`ti ${f.icon}`} style={{ fontSize: 26, color: f.color }} aria-hidden />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: f.textColor, marginBottom: 8 }}>{f.title}</div>
                <p style={{ fontSize: 13, color: f.textColor, lineHeight: 1.75, margin: 0, opacity: 0.85 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TEKNOLOGI SECTION ── */}
      <section style={{
        background: '#F8FAFC',
        borderTop: '1px solid #E2E8F0',
        borderBottom: '1px solid #E2E8F0',
        padding: '56px 40px',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#7C3AED', letterSpacing: '0.1em', marginBottom: 10 }}>
              TEKNOLOGI
            </div>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
              Dibangun dengan Teknologi Modern
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {teknologi.map(tech => (
              <div key={tech.label}
                style={{
                  background: tech.bg, border: `1.5px solid ${tech.border}`,
                  borderRadius: 16, padding: '16px 18px',
                  display: 'flex', gap: 12, alignItems: 'center',
                  transition: 'transform 0.18s, box-shadow 0.18s', cursor: 'default',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${tech.border}80`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`ti ${tech.icon}`} style={{ fontSize: 20, color: tech.color }} aria-hidden />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: tech.textColor, marginBottom: 3 }}>{tech.label}</div>
                  <div style={{ fontSize: 11, color: tech.textColor, opacity: 0.7, lineHeight: 1.5 }}>{tech.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BOTTOM ── */}
      <section style={{ padding: '72px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden', background: '#fff' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: '#F0FDF4', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 160, height: 160, borderRadius: '50%', background: '#EFF6FF', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: 100, height: 100, borderRadius: '50%', background: '#FEF3C7', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 34, fontWeight: 800, color: '#0F172A', marginBottom: 14, letterSpacing: '-0.01em' }}>
            Siap Memantau Udara Surabaya?
          </div>
          <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.7, marginBottom: 36 }}>
            Masuk ke dashboard dan lihat kondisi kualitas udara terkini, prediksi, serta analisis anomali secara real-time.
          </p>
          <button
            onClick={onEnter}
            style={{
              fontSize: 15, fontWeight: 800,
              padding: '15px 40px', borderRadius: 14,
              border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #059669, #2563EB)',
              color: '#fff', fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', gap: 10,
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 20px rgba(37,99,235,0.25)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(37,99,235,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,99,235,0.25)'; }}
          >
            <i className="ti ti-dashboard" style={{ fontSize: 18 }} aria-hidden />
            Masuk ke Dashboard
            <i className="ti ti-arrow-right" style={{ fontSize: 16 }} aria-hidden />
          </button>

          {/* Feature tags */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 32 }}>
            {[
              { icon: 'ti-chart-line',    label: 'Grafik & Tren',  bg: '#DCFCE7', border: '#86EFAC', color: '#14532D' },
              { icon: 'ti-alert-triangle', label: 'Anomali',        bg: '#FEF3C7', border: '#FCD34D', color: '#78350F' },
              { icon: 'ti-crystal-ball',   label: 'Prediksi',       bg: '#EDE9FE', border: '#C4B5FD', color: '#3B0764' },
              { icon: 'ti-book',           label: 'Edukasi',        bg: '#DBEAFE', border: '#93C5FD', color: '#1E3A8A' },
            ].map(btn => (
              <span key={btn.label} style={{
                fontSize: 12, fontWeight: 700, padding: '7px 16px', borderRadius: 20,
                background: btn.bg, border: `1px solid ${btn.border}`,
                color: btn.color, display: 'flex', alignItems: 'center', gap: 7,
                cursor: 'default', transition: 'all 0.18s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 12px ${btn.border}80`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <i className={`ti ${btn.icon}`} style={{ fontSize: 14 }} aria-hidden />
                {btn.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background: '#F8FAFC',
        borderTop: '1px solid #E2E8F0',
        padding: '20px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#059669,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-wind" style={{ fontSize: 15, color: '#fff' }} aria-hidden />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>AERIS</span>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>— Air Quality Monitoring System</span>
        </div>
        <div style={{ fontSize: 11, color: '#94A3B8' }}>
          Kelompok Aeris · PENS 2026 · Surabaya, Jawa Timur
        </div>
      </footer>

    </div>
  );
}

export default LandingPage;