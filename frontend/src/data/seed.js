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
  },
  {
    id: 2,
    nama: 'Nadia Putri',
    kelas: '5 SD',
    mapel: 'Bahasa Inggris',
    hari: 'Selasa & Kamis (15.30)',
    alamat: 'Banyumanik, Semarang',
    status: 'Tersedia',
  },
  {
    id: 3,
    nama: 'Raka Pratama',
    kelas: '11 SMA',
    mapel: 'Fisika',
    hari: 'Jumat (18.30)',
    alamat: 'Pedurungan, Semarang',
    status: 'Tersedia',
  },
  {
    id: 4,
    nama: 'Alya Rahmawati',
    kelas: '9 SMP',
    mapel: 'Matematika',
    hari: 'Senin & Kamis (17.00)',
    alamat: 'Banyumanik, Semarang',
    status: 'Tersedia',
  },
  {
    id: 5,
    nama: 'Fajar Nugroho',
    kelas: '12 SMA',
    mapel: 'Kimia',
    hari: 'Selasa (16.30)',
    alamat: 'Tembalang, Semarang',
    status: 'Tersedia',
  },
  {
    id: 6,
    nama: 'Salsabila Putri',
    kelas: '6 SD',
    mapel: 'Bahasa Indonesia',
    hari: 'Rabu (15.00)',
    alamat: 'Semarang Selatan, Semarang',
    status: 'Tersedia',
  },
  {
    id: 7,
    nama: 'Kevin Wijaya',
    kelas: '10 SMA',
    mapel: 'Bahasa Inggris',
    hari: 'Sabtu (10.00)',
    alamat: 'Pedurungan, Semarang',
    status: 'Sedang Diajukan',
  },
  {
    id: 8,
    nama: 'Larisa Anindita',
    kelas: '7 SMP',
    mapel: 'IPA',
    hari: 'Jumat (16.00)',
    alamat: 'Gayamsari, Semarang',
    status: 'Terisi',
  },
]

export const SEED_TUTORS = [
  {
    id: 1,
    nama: 'Kak Dimas',
    keahlian: 'Matematika & Fisika',
    domisili: 'Tembalang',
    pengalaman: '2 Tahun Mengajar',
  },
  {
    id: 2,
    nama: 'Kak Sarah',
    keahlian: 'Bahasa Inggris',
    domisili: 'Banyumanik',
    pengalaman: '3 Tahun Mengajar',
  },
  {
    id: 3,
    nama: 'Kak Gilang',
    keahlian: 'IPA & Matematika SD',
    domisili: 'Semarang Selatan',
    pengalaman: '1 Tahun Mengajar',
  },
  {
    id: 4,
    nama: 'Kak Renata',
    keahlian: 'Kimia & Bahasa Indonesia',
    domisili: 'Pedurungan',
    pengalaman: '2 Tahun Mengajar',
  },
]
