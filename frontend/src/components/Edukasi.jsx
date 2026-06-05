import React, { useState } from 'react';

const POLLUTANTS = [
  {
    name: 'PM2.5', icon: 'ti-leaf', color: '#16A34A',
    bg: '#DCFCE7', border: '#86EFAC', textColor: '#14532D',
    desc: 'Partikel berukuran ≤2.5 mikrometer yang dapat masuk ke alveolus paru-paru dan aliran darah.',
    sources: 'Kendaraan bermotor, pembakaran batubara, kebakaran hutan, asap rokok.',
    health: 'Gangguan pernapasan, asma, penyakit jantung, kanker paru-paru.',
    tips: 'Gunakan masker N95/KN95 saat kadar tinggi.',
  },
  {
    name: 'PM10', icon: 'ti-wind', color: '#2563EB',
    bg: '#DBEAFE', border: '#93C5FD', textColor: '#1E3A8A',
    desc: 'Partikel debu halus ≤10 mikrometer yang mengendap di saluran pernapasan atas.',
    sources: 'Debu jalanan, konstruksi, industri, erosi tanah, tambang.',
    health: 'Iritasi saluran napas, batuk, memperburuk asma dan bronkitis.',
    tips: 'Tutup jendela saat konstruksi aktif di sekitar rumah.',
  },
  {
    name: 'CO', icon: 'ti-flame', color: '#D97706',
    bg: '#FEF3C7', border: '#FCD34D', textColor: '#78350F',
    desc: 'Gas tidak berwarna dan tidak berbau hasil pembakaran tidak sempurna bahan bakar.',
    sources: 'Asap kendaraan, pembakaran kayu, generator, kompor gas.',
    health: 'Sakit kepala, pusing, lemas, gangguan jantung, kematian pada kadar tinggi.',
    tips: 'Jangan nyalakan mesin kendaraan di garasi tertutup.',
  },
  {
    name: 'NO₂', icon: 'ti-atom', color: '#7C3AED',
    bg: '#EDE9FE', border: '#C4B5FD', textColor: '#3B0764',
    desc: 'Gas cokelat kemerahan berbau tajam dari pembakaran suhu tinggi.',
    sources: 'Emisi kendaraan diesel, pembangkit listrik, industri kimia.',
    health: 'Peradangan saluran napas, penurunan fungsi paru, rentan infeksi.',
    tips: 'Hindari jalan raya padat pada jam sibuk pagi dan sore.',
  },
  {
    name: 'O₃', icon: 'ti-sun', color: '#BE123C',
    bg: '#FFE4E6', border: '#FECDD3', textColor: '#4C0519',
    desc: 'Gas yang terbentuk dari reaksi polutan lain dengan sinar ultraviolet matahari.',
    sources: 'Polutan sekunder — bukan emisi langsung, terbentuk siang hari.',
    health: 'Iritasi mata dan tenggorokan, batuk, kerusakan paru jangka panjang.',
    tips: 'Kurangi aktivitas outdoor pada siang hari terik saat ISPU tinggi.',
  },
];

const ISPU_CATEGORIES = [
  { status: 'Baik',               range: '0 – 50',   icon: 'ti-mood-smile',   bg: '#DCFCE7', border: '#86EFAC', textColor: '#14532D', iconColor: '#16A34A', desc: 'Kualitas udara memuaskan, tidak menimbulkan risiko kesehatan bagi siapapun.',                           activity: 'Semua aktivitas luar ruangan aman dilakukan.' },
  { status: 'Sedang',             range: '51 – 100', icon: 'ti-mood-neutral', bg: '#FEF9C3', border: '#FDE047', textColor: '#713F12', iconColor: '#CA8A04', desc: 'Kualitas udara dapat diterima, namun beberapa polutan mungkin mempengaruhi kelompok sensitif.',          activity: 'Kelompok sensitif sebaiknya mengurangi aktivitas berat di luar.' },
  { status: 'Tidak Sehat',        range: '101 – 200', icon: 'ti-mood-sad',    bg: '#FEF3C7', border: '#FCD34D', textColor: '#78350F', iconColor: '#D97706', desc: 'Semua orang mungkin mulai merasakan dampak kesehatan. Kelompok sensitif lebih terpengaruh.',            activity: 'Kurangi aktivitas berat di luar, gunakan masker.' },
  { status: 'Sangat Tidak Sehat', range: '201 – 300', icon: 'ti-mood-sick',   bg: '#FEE2E2', border: '#FECACA', textColor: '#7F1D1D', iconColor: '#DC2626', desc: 'Peringatan kesehatan darurat. Semua orang berisiko mengalami dampak serius.',                          activity: 'Hindari semua aktivitas luar ruangan. Gunakan masker N95.' },
  { status: 'Berbahaya',          range: '> 300',     icon: 'ti-skull',       bg: '#1E1B4B', border: '#4338CA', textColor: '#E0E7FF', iconColor: '#818CF8', desc: 'Kondisi darurat kesehatan. Seluruh populasi kemungkinan terpengaruh serius.',                           activity: 'Tetap di dalam ruangan, tutup semua ventilasi, gunakan air purifier.' },
];

const TIPS = [
  { icon: 'ti-mask',             title: 'Gunakan Masker N95/KN95',       desc: 'Masker N95 atau KN95 dapat menyaring hingga 95% partikel berbahaya termasuk PM2.5. Lebih efektif dibanding masker kain biasa.',                                    color: '#2563EB', bg: '#DBEAFE', border: '#93C5FD', textColor: '#1E3A8A' },
  { icon: 'ti-home',             title: 'Batasi Aktivitas Luar Ruangan',  desc: 'Kurangi olahraga dan aktivitas berat di luar saat ISPU di atas 100. Pilih waktu pagi awal atau malam saat kadar polutan lebih rendah.',                        color: '#16A34A', bg: '#DCFCE7', border: '#86EFAC', textColor: '#14532D' },
  { icon: 'ti-wind-off',         title: 'Tutup Jendela & Ventilasi',      desc: 'Cegah udara kotor masuk ke dalam ruangan saat kualitas udara buruk. Gunakan AC dengan filter HEPA jika tersedia.',                                               color: '#D97706', bg: '#FEF3C7', border: '#FCD34D', textColor: '#78350F' },
  { icon: 'ti-air-conditioning', title: 'Gunakan Air Purifier',           desc: 'Pilih air purifier dengan filter HEPA yang dapat menyaring partikel PM2.5 secara efektif. Tempatkan di ruangan yang sering digunakan.',                          color: '#7C3AED', bg: '#EDE9FE', border: '#C4B5FD', textColor: '#3B0764' },
  { icon: 'ti-device-mobile',    title: 'Pantau ISPU Secara Rutin',       desc: 'Cek dashboard AERIS secara berkala sebelum beraktivitas di luar. Aktifkan notifikasi untuk peringatan dini kualitas udara buruk.',                               color: '#BE123C', bg: '#FFE4E6', border: '#FECDD3', textColor: '#4C0519' },
  { icon: 'ti-plant',            title: 'Tanam Tanaman Penyerap Polutan', desc: 'Lidah mertua, peace lily, dan sirih gading dapat membantu menyerap polutan dalam ruangan. Tempatkan di sudut-sudut ruangan.',                                    color: '#16A34A', bg: '#DCFCE7', border: '#86EFAC', textColor: '#14532D' },
];

const DAMPAK_KESEHATAN = [
  { organ: 'Paru-paru',   icon: 'ti-lungs', color: '#2563EB', bg: '#DBEAFE', border: '#93C5FD', textColor: '#1E3A8A', dampak: ['Asma dan bronkitis kronis', 'Penurunan kapasitas paru', 'Infeksi saluran pernapasan', 'Kanker paru-paru jangka panjang'] },
  { organ: 'Jantung',     icon: 'ti-heart', color: '#BE123C', bg: '#FFE4E6', border: '#FECDD3', textColor: '#4C0519', dampak: ['Peningkatan tekanan darah', 'Aritmia jantung', 'Serangan jantung', 'Gagal jantung kongestif'] },
  { organ: 'Otak',        icon: 'ti-brain', color: '#7C3AED', bg: '#EDE9FE', border: '#C4B5FD', textColor: '#3B0764', dampak: ['Sakit kepala kronis', 'Gangguan kognitif', 'Peningkatan risiko stroke', 'Penurunan fungsi memori'] },
  { organ: 'Kulit & Mata', icon: 'ti-eye',  color: '#D97706', bg: '#FEF3C7', border: '#FCD34D', textColor: '#78350F', dampak: ['Iritasi dan kemerahan mata', 'Dermatitis dan alergi kulit', 'Penuaan kulit dini', 'Konjungtivitis'] },
];

const FAKTA_MENARIK = [
  { angka: '7 Juta',  label: 'Kematian per Tahun',        desc: 'WHO mencatat polusi udara menyebabkan 7 juta kematian prematur setiap tahunnya di seluruh dunia.',           icon: 'ti-world',   color: '#DC2626', bg: '#FEE2E2', border: '#FECACA', textColor: '#7F1D1D' },
  { angka: '99%',     label: 'Populasi Terpapar',          desc: '99% populasi dunia menghirup udara yang melebihi batas aman WHO untuk PM2.5.',                               icon: 'ti-users',   color: '#D97706', bg: '#FEF3C7', border: '#FCD34D', textColor: '#78350F' },
  { angka: '2.5 µm',  label: 'Ukuran PM2.5',              desc: 'PM2.5 berukuran 30x lebih kecil dari rambut manusia, sehingga mudah menembus masker biasa.',                  icon: 'ti-zoom-in', color: '#2563EB', bg: '#DBEAFE', border: '#93C5FD', textColor: '#1E3A8A' },
  { angka: '1.5 Thn', label: 'Pengurangan Harapan Hidup', desc: 'Paparan polusi udara jangka panjang dapat mengurangi harapan hidup rata-rata 1,5 tahun.',                    icon: 'ti-clock',   color: '#7C3AED', bg: '#EDE9FE', border: '#C4B5FD', textColor: '#3B0764' },
];

const INFO_AERIS = [
  { icon: 'ti-dashboard',    title: 'Cara Membaca Dashboard AERIS', desc: 'Nilai yang ditampilkan menunjukkan konsentrasi polutan udara terkini di Kota Surabaya. ISPU adalah indeks gabungan dari seluruh polutan. Semakin tinggi nilainya, semakin besar potensi dampak kesehatan.', color: '#16A34A', bg: '#DCFCE7', border: '#86EFAC', textColor: '#14532D' },
  { icon: 'ti-chart-line',   title: 'Memahami Grafik Tren',         desc: 'Grafik tren menampilkan perubahan konsentrasi polutan dari waktu ke waktu. Garis merah putus-putus menunjukkan ambang batas aman. Titik yang berada di atas garis merah perlu diwaspadai.',              color: '#2563EB', bg: '#DBEAFE', border: '#93C5FD', textColor: '#1E3A8A' },
  { icon: 'ti-crystal-ball', title: 'Memahami Fitur Prediksi',      desc: 'Prediksi kualitas udara 3 jam ke depan dihitung menggunakan model Random Forest berdasarkan data historis polutan, pola waktu, dan segmentasi aktivitas. Akurasi model: RMSE 12.4.',                     color: '#D97706', bg: '#FEF3C7', border: '#FCD34D', textColor: '#78350F' },
  { icon: 'ti-zoom-scan',    title: 'Memahami Deteksi Anomali',     desc: 'Sistem menggunakan Isolation Forest untuk mendeteksi lonjakan polusi tidak wajar. Anomali ditandai dengan warna berbeda pada grafik dan memicu peringatan pada dashboard.',                               color: '#7C3AED', bg: '#EDE9FE', border: '#C4B5FD', textColor: '#3B0764' },
  { icon: 'ti-refresh',      title: 'Frekuensi Pembaruan Data',     desc: 'Data kualitas udara diperbarui setiap jam dari Open-Meteo Air Quality API. Dashboard melakukan auto-refresh setiap 60 menit. Prediksi dan deteksi anomali dihitung ulang setiap kali data baru tersedia.', color: '#BE123C', bg: '#FFE4E6', border: '#FECDD3', textColor: '#4C0519' },
];

const KELOMPOK_SENSITIF = [
  { icon: 'ti-baby-carriage', label: 'Bayi & Anak-anak', desc: 'Sistem pernapasan masih berkembang, lebih rentan terhadap polutan.',       color: '#2563EB', bg: '#DBEAFE', border: '#93C5FD', textColor: '#1E3A8A' },
  { icon: 'ti-old',           label: 'Lansia',            desc: 'Sistem imun melemah, risiko komplikasi lebih tinggi.',                     color: '#D97706', bg: '#FEF3C7', border: '#FCD34D', textColor: '#78350F' },
  { icon: 'ti-heart',         label: 'Penyakit Jantung',  desc: 'Polutan memperburuk kondisi kardiovaskular yang sudah ada.',               color: '#BE123C', bg: '#FFE4E6', border: '#FECDD3', textColor: '#4C0519' },
  { icon: 'ti-lungs',         label: 'Penyakit Paru',     desc: 'Asma, PPOK, dan kondisi paru lain sangat sensitif terhadap polutan.',     color: '#7C3AED', bg: '#EDE9FE', border: '#C4B5FD', textColor: '#3B0764' },
  { icon: 'ti-pregnant',      label: 'Ibu Hamil',         desc: 'Paparan polutan berisiko pada janin dan perkembangan bayi.',               color: '#16A34A', bg: '#DCFCE7', border: '#86EFAC', textColor: '#14532D' },
  { icon: 'ti-run',           label: 'Atlet & Pelari',    desc: 'Aktivitas fisik tinggi meningkatkan jumlah polutan yang terhirup.',       color: '#D97706', bg: '#FEF3C7', border: '#FCD34D', textColor: '#78350F' },
];

const EDU_TABS = [
  { key: 'polutan',  label: 'Parameter Polutan', icon: 'ti-flask'               },
  { key: 'ispu',     label: 'Kategori ISPU',     icon: 'ti-chart-bar'           },
  { key: 'dampak',   label: 'Dampak Kesehatan',  icon: 'ti-heart-rate-monitor'  },
  { key: 'tips',     label: 'Tips Perlindungan', icon: 'ti-shield-check'        },
  { key: 'fakta',    label: 'Fakta & Data',      icon: 'ti-bulb'                },
  { key: 'panduan',  label: 'Panduan AERIS',     icon: 'ti-book'                },
  { key: 'sensitif', label: 'Kelompok Sensitif', icon: 'ti-users'               },
];

function Edukasi() {
  const [activeTab, setActiveTab] = useState('polutan');

  const btnBase = {
    fontSize: 12, fontWeight: 600, padding: '8px 14px', borderRadius: 20,
    cursor: 'pointer', fontFamily: 'inherit', border: '1.5px solid #E2E8F0',
    background: '#F8FAFC', color: '#64748B', transition: 'all 0.18s ease',
    display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
  };
  const btnActive = {
    ...btnBase, background: '#EFF6FF', color: '#1D4ED8',
    border: '1.5px solid #93C5FD', boxShadow: '0 2px 8px rgba(37,99,235,0.14)',
  };

  const onHover   = (e, border) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${border}80`; };
  const onUnhover = (e)         => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = 'none'; };

  return (
    <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── HERO SECTION — soft purple lavender ── */}
      <section style={{
        background: 'linear-gradient(135deg, #EDE9FE 0%, #DBEAFE 50%, #E0E7FF 100%)',
        borderRadius: 24, padding: '36px', position: 'relative',
        overflow: 'hidden', marginBottom: 28, border: '1.5px solid #E2E8F0',
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: '#6D28D9',
            background: 'rgba(139,92,246,0.12)', padding: '5px 16px',
            borderRadius: 20, border: '1px solid rgba(139,92,246,0.25)',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            letterSpacing: '0.06em', marginBottom: 16,
          }}>
            <i className="ti ti-book" style={{ fontSize: 12 }} aria-hidden />
            PUSAT EDUKASI KUALITAS UDARA
          </span>

          <div style={{ fontSize: 36, fontWeight: 800, color: '#1E1B4B', marginBottom: 10, letterSpacing: '-0.02em' }}>
            Pahami Udara, Jaga Kesehatan
          </div>
          <div style={{ fontSize: 14, color: '#4C1D95', lineHeight: 1.7, marginBottom: 24, maxWidth: 540, opacity: 0.85 }}>
            Pelajari semua yang perlu kamu tahu tentang polutan udara, kategori ISPU, dampak kesehatan, dan cara melindungi diri dari polusi udara di Surabaya.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { icon: 'ti-flask',        label: '5 Polutan',           value: 'Dijelaskan',   color: '#6D28D9', bg: 'rgba(109,40,217,0.08)',  border: 'rgba(109,40,217,0.2)'  },
              { icon: 'ti-chart-bar',    label: '5 Kategori ISPU',     value: 'Lengkap',      color: '#1D4ED8', bg: 'rgba(29,78,216,0.08)',   border: 'rgba(29,78,216,0.2)'   },
              { icon: 'ti-shield-check', label: '6 Tips Perlindungan', value: 'Praktis',      color: '#065F46', bg: 'rgba(6,95,70,0.08)',     border: 'rgba(6,95,70,0.2)'     },
              { icon: 'ti-bulb',         label: '4 Fakta Global',      value: 'Berdasar WHO', color: '#92400E', bg: 'rgba(146,64,14,0.08)',   border: 'rgba(146,64,14,0.2)'   },
            ].map(item => (
              <div key={item.label} style={{
                background: item.bg, border: `1px solid ${item.border}`,
                borderRadius: 12, padding: '12px 14px',
                borderLeft: `3px solid ${item.color}`,
                transition: 'background 0.2s, transform 0.2s', cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <i className={`ti ${item.icon}`} style={{ fontSize: 16, color: item.color, display: 'block', marginBottom: 6 }} aria-hidden />
                <div style={{ fontSize: 10, fontWeight: 700, color: item.color, marginBottom: 3, letterSpacing: '0.06em', opacity: 0.8 }}>{item.label.toUpperCase()}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#1E1B4B' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TAB NAVIGATION ── */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ background: '#fff', borderRadius: 18, padding: '16px 18px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', marginBottom: 12 }}>PILIH TOPIK</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {EDU_TABS.map(tab => (
              <button key={tab.key}
                style={activeTab === tab.key ? btnActive : btnBase}
                onClick={() => setActiveTab(tab.key)}
                onMouseEnter={e => { if (activeTab !== tab.key) { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#334155'; } e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { if (activeTab !== tab.key) { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#64748B'; } e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <i className={`ti ${tab.icon}`} style={{ fontSize: 14 }} aria-hidden />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── TAB: POLUTAN ── */}
      {activeTab === 'polutan' && (
        <section style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Mengenal 5 Parameter Kualitas Udara</div>
          <div style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>Pelajari sumber, dampak, dan cara melindungi diri dari setiap polutan</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {POLLUTANTS.map(p => (
              <div key={p.name}
                style={{ background: p.bg, border: `1.5px solid ${p.border}`, borderRadius: 18, padding: '22px 24px', transition: 'transform 0.18s, box-shadow 0.18s', cursor: 'default' }}
                onMouseEnter={e => onHover(e, p.border)} onMouseLeave={onUnhover}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={`ti ${p.icon}`} style={{ fontSize: 26, color: p.color }} aria-hidden />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: p.textColor }}>{p.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.6)', color: p.textColor, padding: '3px 10px', borderRadius: 20 }}>Polutan Utama</span>
                    </div>
                    <p style={{ fontSize: 13, color: p.textColor, lineHeight: 1.7, marginBottom: 14, opacity: 0.9 }}>{p.desc}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                      {[
                        { label: 'Sumber',   value: p.sources, icon: 'ti-map-pin' },
                        { label: 'Dampak',   value: p.health,  icon: 'ti-heart'   },
                        { label: 'Proteksi', value: p.tips,    icon: 'ti-shield'  },
                      ].map(item => (
                        <div key={item.label} style={{ background: 'rgba(255,255,255,0.5)', borderRadius: 12, padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                            <i className={`ti ${item.icon}`} style={{ fontSize: 13, color: p.color }} aria-hidden />
                            <span style={{ fontSize: 10, fontWeight: 700, color: p.textColor, opacity: 0.7, letterSpacing: '0.05em' }}>{item.label.toUpperCase()}</span>
                          </div>
                          <p style={{ fontSize: 12, color: p.textColor, lineHeight: 1.6, margin: 0 }}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── TAB: ISPU ── */}
      {activeTab === 'ispu' && (
        <section style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Kategori Indeks Standar Pencemar Udara (ISPU)</div>
          <div style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>5 kategori kualitas udara berdasarkan standar KLHK Indonesia</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ISPU_CATEGORIES.map(cat => (
              <div key={cat.status}
                style={{ background: cat.bg, border: `1.5px solid ${cat.border}`, borderRadius: 18, padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 18, transition: 'transform 0.18s, box-shadow 0.18s', cursor: 'default' }}
                onMouseEnter={e => onHover(e, cat.border)} onMouseLeave={onUnhover}
              >
                <div style={{ width: 56, height: 56, borderRadius: 15, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`ti ${cat.icon}`} style={{ fontSize: 28, color: cat.iconColor }} aria-hidden />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: cat.textColor }}>{cat.status}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, background: 'rgba(255,255,255,0.6)', color: cat.textColor, padding: '3px 12px', borderRadius: 20 }}>ISPU {cat.range}</span>
                  </div>
                  <p style={{ fontSize: 13, color: cat.textColor, lineHeight: 1.7, margin: '0 0 12px', opacity: 0.9 }}>{cat.desc}</p>
                  <div style={{ background: 'rgba(255,255,255,0.5)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className="ti ti-run" style={{ fontSize: 15, color: cat.iconColor }} aria-hidden />
                    <span style={{ fontSize: 12, fontWeight: 600, color: cat.textColor }}>{cat.activity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── TAB: DAMPAK ── */}
      {activeTab === 'dampak' && (
        <section style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Dampak Polusi Udara terhadap Kesehatan</div>
          <div style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>Paparan polutan berdampak pada berbagai organ tubuh</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {DAMPAK_KESEHATAN.map(item => (
              <div key={item.organ}
                style={{ background: item.bg, border: `1.5px solid ${item.border}`, borderRadius: 18, padding: '20px 22px', transition: 'transform 0.18s, box-shadow 0.18s', cursor: 'default' }}
                onMouseEnter={e => onHover(e, item.border)} onMouseLeave={onUnhover}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`ti ${item.icon}`} style={{ fontSize: 23, color: item.color }} aria-hidden />
                  </div>
                  <span style={{ fontSize: 17, fontWeight: 800, color: item.textColor }}>{item.organ}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {item.dampak.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.5)', borderRadius: 10, padding: '9px 13px' }}>
                      <i className="ti ti-point-filled" style={{ fontSize: 10, color: item.color, flexShrink: 0 }} aria-hidden />
                      <span style={{ fontSize: 12, color: item.textColor, fontWeight: 500 }}>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── TAB: TIPS ── */}
      {activeTab === 'tips' && (
        <section style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Tips Melindungi Diri dari Polusi Udara</div>
          <div style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>Langkah-langkah praktis untuk menjaga kesehatan saat kualitas udara buruk</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {TIPS.map(tip => (
              <div key={tip.title}
                style={{ background: tip.bg, border: `1.5px solid ${tip.border}`, borderRadius: 18, padding: '20px 22px', display: 'flex', gap: 16, alignItems: 'flex-start', transition: 'transform 0.18s, box-shadow 0.18s', cursor: 'default' }}
                onMouseEnter={e => onHover(e, tip.border)} onMouseLeave={onUnhover}
              >
                <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`ti ${tip.icon}`} style={{ fontSize: 23, color: tip.color }} aria-hidden />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: tip.textColor, marginBottom: 7 }}>{tip.title}</div>
                  <p style={{ fontSize: 12, color: tip.textColor, lineHeight: 1.7, margin: 0, opacity: 0.85 }}>{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── TAB: FAKTA ── */}
      {activeTab === 'fakta' && (
        <section style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Fakta & Data Global tentang Polusi Udara</div>
          <div style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>Data dan fakta penting berdasarkan riset dan laporan internasional</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 16 }}>
            {FAKTA_MENARIK.map(fakta => (
              <div key={fakta.label}
                style={{ background: fakta.bg, border: `1.5px solid ${fakta.border}`, borderRadius: 18, padding: '22px', transition: 'transform 0.18s, box-shadow 0.18s', cursor: 'default' }}
                onMouseEnter={e => onHover(e, fakta.border)} onMouseLeave={onUnhover}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`ti ${fakta.icon}`} style={{ fontSize: 22, color: fakta.color }} aria-hidden />
                  </div>
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: fakta.textColor, lineHeight: 1 }}>{fakta.angka}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: fakta.textColor, opacity: 0.7, letterSpacing: '0.04em' }}>{fakta.label.toUpperCase()}</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: fakta.textColor, lineHeight: 1.7, margin: 0, opacity: 0.85 }}>{fakta.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ background: '#DBEAFE', border: '1.5px solid #93C5FD', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <i className="ti ti-file-text" style={{ fontSize: 20, color: '#2563EB', flexShrink: 0 }} aria-hidden />
            <p style={{ fontSize: 12, color: '#1E40AF', lineHeight: 1.7, margin: 0 }}>
              <strong>Sumber data:</strong> World Health Organization (WHO), State of Global Air 2023, IQAir World Air Quality Report 2023, The Lancet Planetary Health.
            </p>
          </div>
        </section>
      )}

      {/* ── TAB: PANDUAN ── */}
      {activeTab === 'panduan' && (
        <section style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Panduan Menggunakan Dashboard AERIS</div>
          <div style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>Cara memahami dan memaksimalkan fitur-fitur di dashboard AERIS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {INFO_AERIS.map(info => (
              <div key={info.title}
                style={{ background: info.bg, border: `1.5px solid ${info.border}`, borderRadius: 18, padding: '20px 24px', display: 'flex', gap: 18, alignItems: 'flex-start', transition: 'transform 0.18s, box-shadow 0.18s', cursor: 'default' }}
                onMouseEnter={e => onHover(e, info.border)} onMouseLeave={onUnhover}
              >
                <div style={{ width: 50, height: 50, borderRadius: 14, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`ti ${info.icon}`} style={{ fontSize: 25, color: info.color }} aria-hidden />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: info.textColor, marginBottom: 8 }}>{info.title}</div>
                  <p style={{ fontSize: 13, color: info.textColor, lineHeight: 1.8, margin: 0, opacity: 0.85 }}>{info.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── TAB: SENSITIF ── */}
      {activeTab === 'sensitif' && (
        <section style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Kelompok Paling Sensitif terhadap Polusi Udara</div>
          <div style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>Kelompok yang memerlukan perhatian ekstra dalam kondisi udara buruk</div>
          <div style={{ background: '#FEE2E2', border: '1.5px solid #FECACA', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <i className="ti ti-alert-triangle" style={{ fontSize: 22, color: '#DC2626', flexShrink: 0 }} aria-hidden />
            <p style={{ fontSize: 13, color: '#7F1D1D', lineHeight: 1.7, margin: 0 }}>
              <strong>Perhatian:</strong> Kelompok berikut harus lebih waspada terhadap perubahan kualitas udara. Pantau ISPU secara rutin dan segera berlindung saat kadar polutan meningkat.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
            {KELOMPOK_SENSITIF.map(k => (
              <div key={k.label}
                style={{ background: k.bg, border: `1.5px solid ${k.border}`, borderRadius: 16, padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'center', transition: 'transform 0.18s, box-shadow 0.18s', cursor: 'default' }}
                onMouseEnter={e => onHover(e, k.border)} onMouseLeave={onUnhover}
              >
                <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`ti ${k.icon}`} style={{ fontSize: 23, color: k.color }} aria-hidden />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: k.textColor, marginBottom: 5 }}>{k.label}</div>
                  <p style={{ fontSize: 12, color: k.textColor, lineHeight: 1.6, margin: 0, opacity: 0.85 }}>{k.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: '#DCFCE7', border: '1.5px solid #86EFAC', borderRadius: 18, padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <i className="ti ti-shield-check" style={{ fontSize: 22, color: '#16A34A' }} aria-hidden />
              <span style={{ fontSize: 16, fontWeight: 700, color: '#14532D' }}>Rekomendasi untuk Kelompok Sensitif</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'Pantau ISPU setiap hari sebelum beraktivitas di luar ruangan.',
                'Selalu sediakan masker N95/KN95 dan gunakan saat ISPU di atas 100.',
                'Konsultasikan dengan dokter mengenai rencana tindakan saat polusi tinggi.',
                'Pastikan obat-obatan rutin (inhaler, dll.) selalu tersedia.',
                'Gunakan air purifier HEPA di dalam rumah untuk menjaga kualitas udara dalam ruangan.',
                'Hubungi layanan kesehatan segera jika merasakan gejala pernapasan yang memburuk.',
              ].map((rec, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(255,255,255,0.5)', borderRadius: 10, padding: '10px 14px' }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#16A34A', flexShrink: 0, marginTop: 1 }}>{i + 1}.</span>
                  <span style={{ fontSize: 12, color: '#14532D', lineHeight: 1.6 }}>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER CTA — soft purple ── */}
      <section style={{
        background: 'linear-gradient(135deg, #EDE9FE 0%, #DBEAFE 50%, #E0E7FF 100%)',
        borderRadius: 20, padding: '28px 32px', textAlign: 'center',
        position: 'relative', overflow: 'hidden', marginTop: 20,
        border: '1.5px solid #E2E8F0',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(139,92,246,0.12)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1E1B4B', marginBottom: 8 }}>
            Sudah siap memantau kualitas udara?
          </div>
          <p style={{ fontSize: 13, color: '#4C1D95', lineHeight: 1.7, marginBottom: 16, opacity: 0.85 }}>
            Kembali ke beranda untuk melihat kondisi terkini, atau eksplorasi fitur prediksi dan deteksi anomali.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: 'ti-home',           label: 'Kembali ke Beranda', bg: '#DCFCE7', border: '#86EFAC', color: '#14532D' },
              { icon: 'ti-crystal-ball',   label: 'Lihat Prediksi',     bg: '#EDE9FE', border: '#C4B5FD', color: '#3B0764' },
              { icon: 'ti-alert-triangle', label: 'Lihat Anomali',      bg: '#FEF3C7', border: '#FCD34D', color: '#78350F' },
            ].map(btn => (
              <span key={btn.label} style={{
                fontSize: 12, fontWeight: 700, padding: '8px 18px', borderRadius: 20,
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

    </div>
  );
}

export default Edukasi;