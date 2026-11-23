// ---------------------------------------------------------------------------
// Seed data — mirrors the Express backend (Module 1) and supabase/seed.sql.
// Used when neither Supabase nor the Express API can be reached so the PWA
// remains fully usable offline.
// ---------------------------------------------------------------------------

export const SEED_STUDENTS = [
  {
    id: 1,
    nama: 'Bima Sakti',
    kelas: '8 SMP',
    mapel: 'Matematika',
    hari: 'Senin & Rabu (16.00)',
    alamat: 'Tembalang, Semarang',
    status: 'Tersedia',
    preferensi_gender: 'Bebas',
    request_khusus: 'Tentor tegas dan disiplin, fokus persiapan ujian.',
  },
  {
    id: 2,
    nama: 'Nadia Putri',
    kelas: '5 SD',
    mapel: 'Bahasa Inggris',
    hari: 'Selasa & Kamis (15.30)',
    alamat: 'Banyumanik, Semarang',
    status: 'Tersedia',
    preferensi_gender: 'Perempuan',
    request_khusus: 'Tentor berhijab dan komunikatif dengan anak.',
  },
  {
    id: 3,
    nama: 'Raka Pratama',
    kelas: '11 SMA',
    mapel: 'Fisika',
    hari: 'Jumat (18.30)',
    alamat: 'Pedurungan, Semarang',
    status: 'Tersedia',
    preferensi_gender: 'Laki-laki',
    request_khusus: 'Lebih nyaman dibimbing tentor laki-laki.',
  },
  {
    id: 4,
    nama: 'Alya Rahmawati',
    kelas: '9 SMP',
    mapel: 'Matematika',
    hari: 'Senin & Kamis (17.00)',
    alamat: 'Banyumanik, Semarang',
    status: 'Tersedia',
    preferensi_gender: 'Perempuan',
    request_khusus: 'Tentor santai, adaptif, dan komunikatif.',
  },
  {
    id: 5,
    nama: 'Fajar Nugroho',
    kelas: '12 SMA',
    mapel: 'Kimia',
    hari: 'Selasa (16.30)',
    alamat: 'Tembalang, Semarang',
    status: 'Tersedia',
    preferensi_gender: 'Bebas',
    request_khusus: '',
  },
  {
    id: 6,
    nama: 'Salsabila Putri',
    kelas: '6 SD',
    mapel: 'Bahasa Indonesia',
    hari: 'Rabu (15.00)',
    alamat: 'Semarang Selatan, Semarang',
    status: 'Tersedia',
    preferensi_gender: 'Perempuan',
    request_khusus: 'Tentor sabar untuk anak yang aktif.',
  },
  {
    id: 7,
    nama: 'Kevin Wijaya',
    kelas: '10 SMA',
    mapel: 'Bahasa Inggris',
    hari: 'Sabtu (10.00)',
    alamat: 'Pedurungan, Semarang',
    status: 'Sedang Diajukan',
    preferensi_gender: 'Bebas',
    request_khusus: 'Persiapan tes IELTS dasar.',
  },
  {
    id: 8,
    nama: 'Larisa Anindita',
    kelas: '7 SMP',
    mapel: 'IPA',
    hari: 'Jumat (16.00)',
    alamat: 'Gayamsari, Semarang',
    status: 'Sudah Terisi',
    preferensi_gender: 'Bebas',
    request_khusus: 'Tentor sabar dan komunikatif untuk anak SMP.',
  },
]

export const SEED_TUTORS = [
  {
    id: 1,
    nama: 'Kak Dimas',
    keahlian: 'Matematika & Fisika',
    domisili: 'Tembalang',
    pengalaman: '2 Tahun Mengajar',
    gender: 'Laki-laki',
    foto_url: '',
  },
  {
    id: 2,
    nama: 'Kak Sarah',
    keahlian: 'Bahasa Inggris',
    domisili: 'Banyumanik',
    pengalaman: '3 Tahun Mengajar',
    gender: 'Perempuan',
    foto_url: '',
  },
  {
    id: 3,
    nama: 'Kak Gilang',
    keahlian: 'IPA & Matematika SD',
    domisili: 'Semarang Selatan',
    pengalaman: '1 Tahun Mengajar',
    gender: 'Laki-laki',
    foto_url: '',
  },
  {
    id: 4,
    nama: 'Kak Renata',
    keahlian: 'Kimia & Bahasa Indonesia',
    domisili: 'Pedurungan',
    pengalaman: '2 Tahun Mengajar',
    gender: 'Perempuan',
    foto_url: '',
  },
]

const daysAgo = (days) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

export const SEED_SUBMISSIONS = [
  {
    id: 'seed-1',
    siswa_id: 7,
    nama_siswa: 'Kevin Wijaya',
    mapel: 'Bahasa Inggris',
    nama_tentor: 'Kak Sarah',
    catatan:
      'Saya tersedia pada jadwal tersebut dan berpengalaman menyiapkan IELTS dasar.',
    status: 'Menunggu Konfirmasi HRD',
    created_at: daysAgo(2),
  },
  {
    id: 'seed-2',
    siswa_id: 8,
    nama_siswa: 'Larisa Anindita',
    mapel: 'IPA',
    nama_tentor: 'Kak Gilang',
    catatan:
      'Pengajuan disetujui HRD. Jadwal belajar sudah dikonfirmasi dengan orang tua.',
    status: 'Disetujui HRD',
    created_at: daysAgo(5),
  },
]
