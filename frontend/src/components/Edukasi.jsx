import React, { useState } from 'react';

const ACCORDION_DATA = [
  {
    id: 'ispu',
    icon: '📊',
    judul: 'Apa itu ISPU?',
    konten: (
      <div>
        <p style={{ fontSize: 13, color: '#5F5E5A', lineHeight: 1.7, marginBottom: 12 }}>
          ISPU (Indeks Standar Pencemar Udara) adalah angka tanpa satuan yang menggambarkan kondisi kualitas udara ambien di suatu lokasi berdasarkan dampaknya terhadap kesehatan manusia, hewan, tumbuhan, dan bangunan. ISPU ditetapkan melalui Peraturan Menteri LHK RI Nomor 14 Tahun 2020.
        </p>
        <p style={{ fontSize: 13, color: '#5F5E5A', lineHeight: 1.7, marginBottom: 12 }}>
          Semakin tinggi nilai ISPU, semakin buruk kualitas udara dan semakin besar dampaknya terhadap kesehatan. Nilai ISPU dihitung menggunakan formula resmi dengan mempertimbangkan konsentrasi polutan yang terukur.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { range: '0 – 50',   kat: 'Baik',              warna: '#1D9E75', bg: '#E1F5EE', dampak: 'Tidak memberikan efek negatif bagi kesehatan manusia, hewan, dan tumbuhan.' },
            { range: '51 – 100', kat: 'Sedang',            warna: '#378ADD', bg: '#E6F1FB', dampak: 'Tidak berpengaruh pada kesehatan manusia, tetapi berpengaruh pada tumbuhan sensitif.' },
            { range: '101 – 199',kat: 'Tidak Sehat',       warna: '#BA7517', bg: '#FAEEDA', dampak: 'Bersifat merugikan pada manusia, hewan, dan tumbuhan.' },
            { range: '200 – 299',kat: 'Sangat Tidak Sehat',warna: '#E24B4A', bg: '#FCEBEB', dampak: 'Meningkatkan risiko kesehatan pada sejumlah segmen populasi yang terpapar.' },
            { range: '≥ 300',    kat: 'Berbahaya',         warna: '#F1EFE8', bg: '#2C2C2A', dampak: 'Berbahaya secara umum dan mempengaruhi kesehatan serius pada seluruh populasi.' },
          ].map(item => (
            <div key={item.kat} style={{ background: item.bg, borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ minWidth: 80, fontSize: 12, fontWeight: 500, color: item.warna }}>{item.range}</div>
              <div style={{ minWidth: 120, fontSize: 12, fontWeight: 500, color: item.warna }}>{item.kat}</div>
              <div style={{ fontSize: 12, color: item.warna, lineHeight: 1.5 }}>{item.dampak}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'polutan',
    icon: '🌫️',
    judul: 'Mengenal 5 Polutan Udara',
    konten: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          {
            nama: 'PM2.5 — Partikel Halus',
            warna: '#1D9E75', bg: '#E1F5EE',
            deskripsi: 'Partikel berdiameter kurang dari 2.5 mikrometer. Sangat berbahaya karena ukurannya yang sangat kecil memungkinkan masuk jauh ke dalam paru-paru bahkan ke aliran darah.',
            sumber: 'Kendaraan bermotor, pembakaran bahan bakar, industri, dan kebakaran hutan.',
            dampak: 'Gangguan pernapasan, penyakit kardiovaskular, kanker paru-paru, dan kematian dini.',
          },
          {
            nama: 'PM10 — Partikel Kasar',
            warna: '#378ADD', bg: '#E6F1FB',
            deskripsi: 'Partikel berdiameter kurang dari 10 mikrometer. Lebih besar dari PM2.5 namun tetap berbahaya karena bisa masuk ke saluran pernapasan bagian atas.',
            sumber: 'Debu jalan, konstruksi bangunan, industri, dan aktivitas pertanian.',
            dampak: 'Iritasi mata, hidung, dan tenggorokan, serta memperburuk asma dan penyakit paru.',
          },
          {
            nama: 'CO — Karbon Monoksida',
            warna: '#BA7517', bg: '#FAEEDA',
            deskripsi: 'Gas tidak berwarna dan tidak berbau yang sangat beracun. Dihasilkan dari pembakaran tidak sempurna bahan bakar fosil.',
            sumber: 'Kendaraan bermotor, generator, kompor berbahan bakar fosil, dan industri.',
            dampak: 'Mengurangi kemampuan darah membawa oksigen, menyebabkan pusing, pingsan, bahkan kematian pada konsentrasi tinggi.',
          },
          {
            nama: 'NO₂ — Nitrogen Dioksida',
            warna: '#534AB7', bg: '#EEEDFB',
            deskripsi: 'Gas berwarna coklat kemerahan dengan bau menyengat. Terbentuk dari pembakaran bahan bakar pada suhu tinggi.',
            sumber: 'Kendaraan bermotor, pembangkit listrik, dan industri.',
            dampak: 'Iritasi saluran pernapasan, memperburuk asma, dan berkontribusi pada pembentukan ozon.',
          },
          {
            nama: 'O₃ — Ozon',
            warna: '#E24B4A', bg: '#FCEBEB',
            deskripsi: 'Ozon permukaan tanah (ground-level ozone) berbeda dengan ozon di atmosfer atas yang melindungi bumi. Ozon di permukaan adalah polutan berbahaya yang terbentuk dari reaksi fotokimia.',
            sumber: 'Bukan dipancarkan langsung, terbentuk dari reaksi antara NO₂ dan senyawa organik volatile (VOC) di bawah paparan sinar matahari.',
            dampak: 'Iritasi paru-paru, batuk, memperburuk asma dan penyakit paru kronis.',
          },
        ].map(item => (
          <div key={item.nama} style={{ background: item.bg, borderRadius: 8, padding: '12px 14px', border: `0.5px solid ${item.warna}30` }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: item.warna, marginBottom: 6 }}>{item.nama}</div>
            <p style={{ fontSize: 12, color: '#5F5E5A', lineHeight: 1.6, marginBottom: 6 }}>{item.deskripsi}</p>
            <div style={{ fontSize: 11, color: '#888780', marginBottom: 2 }}>
              <strong style={{ color: '#5F5E5A' }}>Sumber:</strong> {item.sumber}
            </div>
            <div style={{ fontSize: 11, color: '#888780' }}>
              <strong style={{ color: '#5F5E5A' }}>Dampak:</strong> {item.dampak}
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'cara-baca',
    icon: '📖',
    judul: 'Cara Membaca Dashboard Aeris',
    konten: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ fontSize: 13, color: '#5F5E5A', lineHeight: 1.7 }}>
          Dashboard Aeris dirancang agar mudah dipahami oleh siapapun, termasuk masyarakat umum yang tidak memiliki latar belakang teknis. Berikut panduan membaca setiap bagian:
        </p>
        {[
          {
            no: '1', judul: 'Alert Status (Banner Atas)',
            isi: 'Banner hijau berarti udara normal dan aman. Banner kuning berarti ada anomali terdeteksi, harap waspada. Banner merah berarti kondisi berbahaya, hindari aktivitas luar ruangan.',
          },
          {
            no: '2', judul: 'Panel ISPU 5 Polutan',
            isi: 'Menampilkan nilai ISPU terkini untuk setiap polutan. Warna kartu mengikuti standar KLHK — hijau (Baik), biru (Sedang), kuning (Tidak Sehat), merah (Sangat Tidak Sehat), hitam (Berbahaya).',
          },
          {
            no: '3', judul: 'Panel Segmentasi Waktu',
            isi: 'Menunjukkan segmen waktu aktif saat ini (Pagi/Siang/Sore-Malam). Model machine learning yang berbeda digunakan di setiap segmen untuk prediksi yang lebih akurat.',
          },
          {
            no: '4', judul: 'Prediksi 3 Jam ke Depan',
            isi: 'Menampilkan perkiraan nilai PM2.5 untuk 1, 2, dan 3 jam ke depan berdasarkan model PyCaret AutoML yang sudah dilatih dengan data historis Surabaya.',
          },
          {
            no: '5', judul: 'Grafik Tren',
            isi: 'Menampilkan perubahan konsentrasi polutan dari waktu ke waktu. Garis merah putus-putus adalah ambang batas kesehatan. Titik di atas garis merah perlu diwaspadai.',
          },
          {
            no: '6', judul: 'Tab Grafik & Tren',
            isi: 'Bisa memilih rentang waktu (hari ini, 7 hari, 1 bulan) dan melihat grafik per polutan atau semua polutan sekaligus. Ada juga pola rata-rata per jam.',
          },
        ].map(item => (
          <div key={item.no} style={{ display: 'flex', gap: 12, padding: '10px 14px', background: '#F1EFE8', borderRadius: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#1D9E75', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, flexShrink: 0, marginTop: 1 }}>{item.no}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#2C2C2A', marginBottom: 3 }}>{item.judul}</div>
              <div style={{ fontSize: 12, color: '#5F5E5A', lineHeight: 1.6 }}>{item.isi}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'isolation-forest',
    icon: '🤖',
    judul: 'Cara Sistem Mendeteksi Anomali',
    konten: (
      <div>
        <p style={{ fontSize: 13, color: '#5F5E5A', lineHeight: 1.7, marginBottom: 12 }}>
          Sistem Aeris menggunakan algoritma Isolation Forest untuk mendeteksi anomali kualitas udara secara otomatis tanpa memerlukan data berlabel. Berikut penjelasan sederhananya:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {[
            { icon: '🌳', judul: 'Membangun Pohon Keputusan Acak', isi: 'Sistem membangun ratusan pohon keputusan yang secara acak memisahkan data. Setiap pohon mencoba mengisolasi satu titik data dari titik-titik lainnya.' },
            { icon: '🎯', judul: 'Mengukur Kemudahan Isolasi', isi: 'Data anomali lebih mudah diisolasi karena nilainya ekstrem dan tidak lazim. Semakin sedikit pemisahan yang dibutuhkan, semakin besar kemungkinan data tersebut adalah anomali.' },
            { icon: '📐', judul: 'Menghitung Anomaly Score', isi: 'Setiap titik data mendapat skor anomali antara 0 hingga 1. Skor mendekati 1 berarti sangat anomali, skor mendekati 0.5 berarti normal.' },
            { icon: '🏷️', judul: 'Mengklasifikasikan Status', isi: 'Berdasarkan skor dan nilai ISPU, sistem mengklasifikasikan kondisi udara sebagai NORMAL, ANOMALI, atau BERBAHAYA.' },
          ].map(item => (
            <div key={item.judul} style={{ display: 'flex', gap: 12, padding: '10px 14px', background: '#F1EFE8', borderRadius: 8 }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#2C2C2A', marginBottom: 3 }}>{item.judul}</div>
                <div style={{ fontSize: 12, color: '#5F5E5A', lineHeight: 1.6 }}>{item.isi}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: '#E1F5EE', border: '0.5px solid #5DCAA5', borderRadius: 8, padding: '10px 14px' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#085041', marginBottom: 4 }}>💡 Keunggulan Isolation Forest</div>
          <div style={{ fontSize: 12, color: '#0F6E56', lineHeight: 1.6 }}>Tidak memerlukan data berlabel (unsupervised), efisien secara komputasi, cocok untuk data dengan anomali langka seperti lonjakan polutan mendadak, dan tidak berasumsi distribusi data tertentu.</div>
        </div>
      </div>
    ),
  },
  {
    id: 'tips',
    icon: '💡',
    judul: 'Tips Kesehatan Berdasarkan Kondisi Udara',
    konten: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          {
            kat: 'Baik (0–50)',
            warna: '#085041', bg: '#E1F5EE', border: '#5DCAA5',
            tips: ['Aman untuk semua aktivitas luar ruangan.', 'Waktu yang baik untuk olahraga di luar.', 'Jendela bisa dibuka untuk sirkulasi udara alami.'],
          },
          {
            kat: 'Sedang (51–100)',
            warna: '#0C447C', bg: '#E6F1FB', border: '#85B7EB',
            tips: ['Aman untuk aktivitas normal orang sehat.', 'Penderita asma atau penyakit paru sebaiknya membatasi aktivitas berat di luar.', 'Anak-anak dan lansia perlu dipantau jika beraktivitas lama di luar.'],
          },
          {
            kat: 'Tidak Sehat (101–199)',
            warna: '#633806', bg: '#FAEEDA', border: '#EF9F27',
            tips: ['Kurangi aktivitas berat di luar ruangan.', 'Gunakan masker N95 jika harus keluar.', 'Tutup jendela dan gunakan pembersih udara (air purifier) jika ada.', 'Penderita penyakit pernapasan sebaiknya tetap di dalam ruangan.'],
          },
          {
            kat: 'Sangat Tidak Sehat (200–299)',
            warna: '#791F1F', bg: '#FCEBEB', border: '#F09595',
            tips: ['Hindari semua aktivitas luar ruangan jika memungkinkan.', 'Wajib gunakan masker N95 jika harus keluar.', 'Tutup semua ventilasi dan nyalakan air purifier.', 'Segera konsultasi dokter jika muncul gejala pernapasan.'],
          },
          {
            kat: 'Berbahaya (≥ 300)',
            warna: '#F1EFE8', bg: '#2C2C2A', border: '#444441',
            tips: ['Jangan keluar rumah sama sekali.', 'Tutup rapat semua pintu dan jendela.', 'Gunakan air purifier terus menerus.', 'Hubungi fasilitas kesehatan jika ada anggota keluarga yang menunjukkan gejala.', 'Ikuti instruksi dari pihak berwenang.'],
          },
        ].map(item => (
          <div key={item.kat} style={{ background: item.bg, border: `0.5px solid ${item.border}`, borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: item.warna, marginBottom: 8 }}>{item.kat}</div>
            <ul style={{ paddingLeft: 16, margin: 0 }}>
              {item.tips.map((tip, i) => (
                <li key={i} style={{ fontSize: 12, color: item.warna, lineHeight: 1.7 }}>{tip}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'tentang',
    icon: '👥',
    judul: 'Tentang Sistem Aeris',
    konten: (
      <div>
        <p style={{ fontSize: 13, color: '#5F5E5A', lineHeight: 1.7, marginBottom: 12 }}>
          Aeris adalah sistem deteksi anomali kualitas udara perkotaan berbasis machine learning yang dikembangkan sebagai proyek capstone mata kuliah Teknologi Web Service, Machine Learning Ops, &  Data Mining di Politeknik Elektronika Negeri Surabaya (PENS) tahun 2026.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Nama Sistem',    val: 'Aeris — Air Quality Anomaly Detection System' },
            { label: 'Institusi',      val: 'Politeknik Elektronika Negeri Surabaya (PENS)' },
            { label: 'Program Studi',  val: 'Sains Data Terapan' },
            { label: 'Mata Kuliah',    
                val: [
                    'Teknologi Web Service', 
                    'Machine Learning Ops', 
                    'Data Mining']
                },
            { label: 'Tahun',          val: '2026' },
            { label: 'Sumber Data',    val: 'Open-Meteo Air Quality API' },
            { label: 'Lokasi Pantau',  val: 'Kota Surabaya (-7.2575, 112.7521)' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', gap: 12, padding: '8px 14px', background: '#F1EFE8', borderRadius: 8 }}>
              <div style={{ minWidth: 120, fontSize: 12, color: '#888780' }}>{item.label}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#2C2C2A' }}>{item.val}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#888780', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tim Pengembang — Kelompok Aeris</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { nama: 'Linda Anggara Wati',       nim: '3324600008', peran: 'Data Engineering, EDA, Feature Engineering, Machine Learning' },
            { nama: 'Yuhanidz Habibah',         nim: '3324600020', peran: 'Database, Backend API, Deployment' },
            { nama: 'Intan Azzuhra Permadani',  nim: '3324600028', peran: 'Frontend Dashboard, Laporan, Diagram, Presentasi' },
          ].map(item => (
            <div key={item.nim} style={{ background: '#fff', border: '0.5px solid #D3D1C7', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#2C2C2A', marginBottom: 2 }}>{item.nama}</div>
              <div style={{ fontSize: 11, color: '#888780', marginBottom: 4 }}>NIM: {item.nim}</div>
              <div style={{ fontSize: 12, color: '#1D9E75' }}>{item.peran}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: '10px 14px', background: '#E1F5EE', border: '0.5px solid #5DCAA5', borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: '#085041', lineHeight: 1.6 }}>
            <strong>Dosen Pembimbing:</strong><br />
            Renovita Edelani S.ST., M.Tr.Kom <br />	
            Yesta Medya Mahardhika, S.Tr.Kom., M.T <br />
            Entin Martiana Kusumaningtyas S.Kom, M.Kom
          </div>
        </div>
      </div>
    ),
  },
];

function AccordionItem({ item, isOpen, onToggle }) {
  return (
    <div style={{ background: '#fff', border: '0.5px solid #D3D1C7', borderRadius: 12, overflow: 'hidden' }}>
      <button
        onClick={onToggle}
        style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>{item.icon}</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#2C2C2A' }}>{item.judul}</span>
        </div>
        <span style={{ fontSize: 18, color: '#888780', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'inline-block' }}>▾</span>
      </button>
      {isOpen && (
        <div style={{ padding: '0 16px 16px', borderTop: '0.5px solid #F1EFE8' }}>
          {item.konten}
        </div>
      )}
    </div>
  );
}

function Edukasi() {
  const [openId, setOpenId] = useState('ispu');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ background: '#fff', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '14px 16px', marginBottom: 6 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#2C2C2A', marginBottom: 4 }}>📚 Pusat Edukasi Kualitas Udara</div>
        <div style={{ fontSize: 12, color: '#888780', lineHeight: 1.6 }}>
          Pelajari tentang polutan udara, cara membaca dashboard, dan tips menjaga kesehatan berdasarkan kondisi udara terkini di Kota Surabaya.
        </div>
      </div>
      {ACCORDION_DATA.map(item => (
        <AccordionItem
          key={item.id}
          item={item}
          isOpen={openId === item.id}
          onToggle={() => setOpenId(openId === item.id ? null : item.id)}
        />
      ))}
    </div>
  );
}

export default Edukasi;