const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Data Siswa (List 1)
let siswaList = [
  { id: 1, nama: "Bima Sakti", kelas: "8 SMP", mapel: "Matematika", hari: "Senin & Rabu (16.00)", alamat: "Tembalang, Semarang", status: "Tersedia", preferensiGender: "Bebas", requestKhusus: "Tentor tegas dan disiplin, fokus persiapan ujian." },
  { id: 2, nama: "Nadia Putri", kelas: "5 SD", mapel: "Bahasa Inggris", hari: "Selasa & Kamis (15.30)", alamat: "Banyumanik, Semarang", status: "Tersedia", preferensiGender: "Perempuan", requestKhusus: "Tentor berhijab dan komunikatif dengan anak." },
  { id: 3, nama: "Raka Pratama", kelas: "11 SMA", mapel: "Fisika", hari: "Jumat (18.30)", alamat: "Pedurungan, Semarang", status: "Tersedia", preferensiGender: "Laki-laki", requestKhusus: "Lebih nyaman dibimbing tentor laki-laki." },
  { id: 4, nama: "Alya Rahmawati", kelas: "9 SMP", mapel: "Matematika", hari: "Senin & Kamis (17.00)", alamat: "Banyumanik, Semarang", status: "Tersedia", preferensiGender: "Perempuan", requestKhusus: "Tentor santai, adaptif, dan komunikatif." },
  { id: 5, nama: "Fajar Nugroho", kelas: "12 SMA", mapel: "Kimia", hari: "Selasa (16.30)", alamat: "Tembalang, Semarang", status: "Tersedia", preferensiGender: "Bebas", requestKhusus: "" },
  { id: 6, nama: "Salsabila Putri", kelas: "6 SD", mapel: "Bahasa Indonesia", hari: "Rabu (15.00)", alamat: "Semarang Selatan, Semarang", status: "Tersedia", preferensiGender: "Perempuan", requestKhusus: "Tentor sabar untuk anak yang aktif." },
  { id: 7, nama: "Kevin Wijaya", kelas: "10 SMA", mapel: "Bahasa Inggris", hari: "Sabtu (10.00)", alamat: "Pedurungan, Semarang", status: "Sedang Diajukan", preferensiGender: "Bebas", requestKhusus: "Persiapan tes IELTS dasar." },
  { id: 8, nama: "Larisa Anindita", kelas: "7 SMP", mapel: "IPA", hari: "Jumat (16.00)", alamat: "Gayamsari, Semarang", status: "Sudah Terisi", preferensiGender: "Bebas", requestKhusus: "Tentor sabar dan komunikatif untuk anak SMP." }
];

// Data Tentor (List 2)
let tentorList = [
  { id: 1, nama: "Kak Dimas", keahlian: "Matematika & Fisika", domisili: "Tembalang", pengalaman: "2 Tahun Mengajar", gender: "Laki-laki" },
  { id: 2, nama: "Kak Sarah", keahlian: "Bahasa Inggris", domisili: "Banyumanik", pengalaman: "3 Tahun Mengajar", gender: "Perempuan" },
  { id: 3, nama: "Kak Gilang", keahlian: "IPA & Matematika SD", domisili: "Semarang Selatan", pengalaman: "1 Tahun Mengajar", gender: "Laki-laki" },
  { id: 4, nama: "Kak Renata", keahlian: "Kimia & Bahasa Indonesia", domisili: "Pedurungan", pengalaman: "2 Tahun Mengajar", gender: "Perempuan" }
];

// Data Pengajuan Ambil Siswa
let pengajuanList = [
  {
    id: 1,
    siswaId: 7,
    namaSiswa: "Kevin Wijaya",
    mapel: "Bahasa Inggris",
    namaTentor: "Kak Sarah",
    catatan: "Saya tersedia pada jadwal tersebut dan berpengalaman menyiapkan IELTS dasar.",
    status: "Menunggu Konfirmasi HRD",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    siswaId: 8,
    namaSiswa: "Larisa Anindita",
    mapel: "IPA",
    namaTentor: "Kak Gilang",
    catatan: "Pengajuan disetujui HRD. Jadwal belajar sudah dikonfirmasi dengan orang tua.",
    status: "Disetujui HRD",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const normalizeStudentPayload = (body, fallback = {}) => ({
  nama: body.nama !== undefined ? String(body.nama).trim() : fallback.nama,
  kelas: body.kelas !== undefined ? String(body.kelas).trim() : fallback.kelas,
  mapel: body.mapel !== undefined ? String(body.mapel).trim() : fallback.mapel,
  hari: body.hari !== undefined ? String(body.hari).trim() : fallback.hari,
  alamat: body.alamat !== undefined ? String(body.alamat).trim() : fallback.alamat,
  status: body.status !== undefined ? String(body.status).trim() : (fallback.status || "Tersedia"),
  preferensiGender: body.preferensiGender !== undefined
    ? String(body.preferensiGender).trim()
    : (fallback.preferensiGender || "Bebas"),
  requestKhusus: body.requestKhusus !== undefined
    ? String(body.requestKhusus).trim()
    : (fallback.requestKhusus || "")
});

const normalizeTutorPayload = (body, fallback = {}) => ({
  nama: body.nama !== undefined ? String(body.nama).trim() : fallback.nama,
  keahlian: body.keahlian !== undefined ? String(body.keahlian).trim() : fallback.keahlian,
  domisili: body.domisili !== undefined ? String(body.domisili).trim() : fallback.domisili,
  pengalaman: body.pengalaman !== undefined ? String(body.pengalaman).trim() : fallback.pengalaman,
  gender: body.gender !== undefined ? String(body.gender).trim() : (fallback.gender || "Bebas")
});

// Endpoint List & Detail Siswa
app.get('/api/siswa', (req, res) => res.json(siswaList));
app.get('/api/siswa/:id', (req, res) => {
  const item = siswaList.find(s => s.id == req.params.id);
  item ? res.json(item) : res.status(404).json({ message: "Siswa tidak ditemukan" });
});
app.post('/api/siswa', (req, res) => {
  const { nama, mapel } = req.body;
  if (!nama || !mapel) {
    return res.status(400).json({ message: "Nama dan mata pelajaran wajib diisi" });
  }
  const nextId = siswaList.length > 0 ? Math.max(...siswaList.map(s => Number(s.id) || 0)) + 1 : 1;
  const baru = {
    id: nextId,
    ...normalizeStudentPayload(req.body, { status: "Tersedia" })
  };
  siswaList.push(baru);
  res.status(201).json(baru);
});
app.patch('/api/siswa/:id', (req, res) => {
  const index = siswaList.findIndex(s => s.id == req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Siswa tidak ditemukan" });
  }
  const updated = {
    ...siswaList[index],
    ...normalizeStudentPayload(req.body, siswaList[index]),
    id: siswaList[index].id
  };
  siswaList[index] = updated;
  res.json(updated);
});
app.delete('/api/siswa/:id', (req, res) => {
  const index = siswaList.findIndex(s => s.id == req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Siswa tidak ditemukan" });
  }
  siswaList.splice(index, 1);
  res.json({ id: req.params.id });
});

// Endpoint List & Detail Tentor
app.get('/api/tentor', (req, res) => res.json(tentorList));
app.get('/api/tentor/:id', (req, res) => {
  const item = tentorList.find(t => t.id == req.params.id);
  item ? res.json(item) : res.status(404).json({ message: "Tentor tidak ditemukan" });
});
app.post('/api/tentor', (req, res) => {
  const { nama, keahlian } = req.body;
  if (!nama || !keahlian) {
    return res.status(400).json({ message: "Nama dan keahlian wajib diisi" });
  }
  const nextId = tentorList.length > 0 ? Math.max(...tentorList.map(t => Number(t.id) || 0)) + 1 : 1;
  const baru = {
    id: nextId,
    ...normalizeTutorPayload(req.body)
  };
  tentorList.push(baru);
  res.status(201).json(baru);
});
app.patch('/api/tentor/:id', (req, res) => {
  const index = tentorList.findIndex(t => t.id == req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Tentor tidak ditemukan" });
  }
  const updated = {
    ...tentorList[index],
    ...normalizeTutorPayload(req.body, tentorList[index]),
    id: tentorList[index].id
  };
  tentorList[index] = updated;
  res.json(updated);
});
app.delete('/api/tentor/:id', (req, res) => {
  const index = tentorList.findIndex(t => t.id == req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Tentor tidak ditemukan" });
  }
  tentorList.splice(index, 1);
  res.json({ id: req.params.id });
});

// Endpoint Pengajuan Ambil Siswa ke HRD
app.get('/api/pengajuan', (req, res) => res.json(pengajuanList));
app.post('/api/pengajuan', (req, res) => {
  const { siswaId, namaSiswa, mapel, namaTentor, catatan, status } = req.body;
  const baru = {
    id: Date.now(),
    siswaId,
    namaSiswa,
    mapel,
    namaTentor,
    catatan: catatan || '',
    status: status || "Menunggu Konfirmasi HRD",
    createdAt: new Date().toISOString()
  };
  pengajuanList.push(baru);
  res.status(201).json(baru);
});
app.patch('/api/pengajuan/:id', (req, res) => {
  const index = pengajuanList.findIndex(p => String(p.id) === String(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: "Pengajuan tidak ditemukan" });
  }
  const updated = {
    ...pengajuanList[index],
    ...req.body,
    id: pengajuanList[index].id
  };
  pengajuanList[index] = updated;
  res.json(updated);
});
app.delete('/api/pengajuan/:id', (req, res) => {
  const index = pengajuanList.findIndex(p => String(p.id) === String(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: "Pengajuan tidak ditemukan" });
  }
  pengajuanList.splice(index, 1);
  res.json({ id: req.params.id });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API berjalan di http://localhost:${PORT}`));
