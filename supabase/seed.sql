-- ===========================================================================
-- LesMatch — seed data
-- Run after supabase/schema.sql. Safe to run more than once.
-- ===========================================================================

insert into public.siswa (
  id, nama, kelas, mapel, hari, alamat, status, preferensi_gender, request_khusus
) values
  (1, 'Bima Sakti', '8 SMP', 'Matematika', 'Senin & Rabu (16.00)', 'Tembalang, Semarang', 'Tersedia', 'Bebas', 'Tentor tegas dan disiplin, fokus persiapan ujian.'),
  (2, 'Nadia Putri', '5 SD', 'Bahasa Inggris', 'Selasa & Kamis (15.30)', 'Banyumanik, Semarang', 'Tersedia', 'Perempuan', 'Tentor berhijab dan komunikatif dengan anak.'),
  (3, 'Raka Pratama', '11 SMA', 'Fisika', 'Jumat (18.30)', 'Pedurungan, Semarang', 'Tersedia', 'Laki-laki', 'Lebih nyaman dibimbing tentor laki-laki.'),
  (4, 'Alya Rahmawati', '9 SMP', 'Matematika', 'Senin & Kamis (17.00)', 'Banyumanik, Semarang', 'Tersedia', 'Perempuan', 'Tentor santai, adaptif, dan komunikatif.'),
  (5, 'Fajar Nugroho', '12 SMA', 'Kimia', 'Selasa (16.30)', 'Tembalang, Semarang', 'Tersedia', 'Bebas', ''),
  (6, 'Salsabila Putri', '6 SD', 'Bahasa Indonesia', 'Rabu (15.00)', 'Semarang Selatan, Semarang', 'Tersedia', 'Perempuan', 'Tentor sabar untuk anak yang aktif.'),
  (7, 'Kevin Wijaya', '10 SMA', 'Bahasa Inggris', 'Sabtu (10.00)', 'Pedurungan, Semarang', 'Sedang Diajukan', 'Bebas', 'Persiapan tes IELTS dasar.'),
  (8, 'Larisa Anindita', '7 SMP', 'IPA', 'Jumat (16.00)', 'Gayamsari, Semarang', 'Sudah Terisi', 'Bebas', 'Tentor sabar dan komunikatif untuk anak SMP.')
on conflict (id) do nothing;

insert into public.tentor (
  id, nama, keahlian, domisili, pengalaman, gender
) values
  (1, 'Kak Dimas', 'Matematika & Fisika', 'Tembalang', '2 Tahun Mengajar', 'Laki-laki'),
  (2, 'Kak Sarah', 'Bahasa Inggris', 'Banyumanik', '3 Tahun Mengajar', 'Perempuan'),
  (3, 'Kak Gilang', 'IPA & Matematika SD', 'Semarang Selatan', '1 Tahun Mengajar', 'Laki-laki'),
  (4, 'Kak Renata', 'Kimia & Bahasa Indonesia', 'Pedurungan', '2 Tahun Mengajar', 'Perempuan')
on conflict (id) do nothing;

-- Demo pengajuan: satu menunggu HRD, satu sudah disetujui.
insert into public.pengajuan (
  id, siswa_id, nama_siswa, mapel, nama_tentor, catatan, status, created_at
) values
  (
    '11111111-1111-4111-8111-111111111111',
    7,
    'Kevin Wijaya',
    'Bahasa Inggris',
    'Kak Sarah',
    'Saya tersedia pada jadwal tersebut dan berpengalaman menyiapkan IELTS dasar.',
    'Menunggu Konfirmasi HRD',
    now() - interval '2 days'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    8,
    'Larisa Anindita',
    'IPA',
    'Kak Gilang',
    'Pengajuan disetujui HRD. Jadwal belajar sudah dikonfirmasi dengan orang tua.',
    'Disetujui HRD',
    now() - interval '5 days'
  )
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
