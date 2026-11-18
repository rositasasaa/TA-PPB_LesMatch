-- ===========================================================================
-- LesMatch — seed data
-- Run after supabase/schema.sql. Safe to run more than once.
-- ===========================================================================

insert into public.siswa (id, nama, kelas, mapel, hari, alamat, status) values
  (1, 'Bima Sakti', '8 SMP', 'Matematika', 'Senin & Rabu (16.00)', 'Tembalang, Semarang', 'Tersedia'),
  (2, 'Nadia Putri', '5 SD', 'Bahasa Inggris', 'Selasa & Kamis (15.30)', 'Banyumanik, Semarang', 'Tersedia'),
  (3, 'Raka Pratama', '11 SMA', 'Fisika', 'Jumat (18.30)', 'Pedurungan, Semarang', 'Tersedia'),
  (4, 'Alya Rahmawati', '9 SMP', 'Matematika', 'Senin & Kamis (17.00)', 'Banyumanik, Semarang', 'Tersedia'),
  (5, 'Fajar Nugroho', '12 SMA', 'Kimia', 'Selasa (16.30)', 'Tembalang, Semarang', 'Tersedia'),
  (6, 'Salsabila Putri', '6 SD', 'Bahasa Indonesia', 'Rabu (15.00)', 'Semarang Selatan, Semarang', 'Tersedia'),
  (7, 'Kevin Wijaya', '10 SMA', 'Bahasa Inggris', 'Sabtu (10.00)', 'Pedurungan, Semarang', 'Sedang Diajukan'),
  (8, 'Larisa Anindita', '7 SMP', 'IPA', 'Jumat (16.00)', 'Gayamsari, Semarang', 'Terisi')
on conflict (id) do nothing;

insert into public.tentor (id, nama, keahlian, domisili, pengalaman) values
  (1, 'Kak Dimas', 'Matematika & Fisika', 'Tembalang', '2 Tahun Mengajar'),
  (2, 'Kak Sarah', 'Bahasa Inggris', 'Banyumanik', '3 Tahun Mengajar'),
  (3, 'Kak Gilang', 'IPA & Matematika SD', 'Semarang Selatan', '1 Tahun Mengajar'),
  (4, 'Kak Renata', 'Kimia & Bahasa Indonesia', 'Pedurungan', '2 Tahun Mengajar')
on conflict (id) do nothing;

-- Keep identity sequences ahead of the seeded ids.
select setval(
  pg_get_serial_sequence('public.siswa', 'id'),
  greatest((select max(id) from public.siswa), 1)
);
select setval(
  pg_get_serial_sequence('public.tentor', 'id'),
  greatest((select max(id) from public.tentor), 1)
);
