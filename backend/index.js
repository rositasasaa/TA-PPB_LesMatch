const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Data Siswa (List 1)
let siswaList = [
  { id: 1, nama: "Bima Sakti", kelas: "8 SMP", mapel: "Matematika", hari: "Senin & Rabu (16.00)", alamat: "Tembalang, Semarang", status: "Tersedia" },
  { id: 2, nama: "Nadia Putri", kelas: "5 SD", mapel: "Bahasa Inggris", hari: "Selasa & Kamis (15.30)", alamat: "Banyumanik, Semarang", status: "Tersedia" },
  { id: 3, nama: "Raka Pratama", kelas: "11 SMA", mapel: "Fisika", hari: "Jumat (18.30)", alamat: "Pedurungan, Semarang", status: "Tersedia" }
];

// Data Tentor (List 2)
const tentorList = [
  { id: 1, nama: "Kak Dimas", keahlian: "Matematika & Fisika", domisili: "Tembalang", pengalaman: "2 Tahun Mengajar" },
  { id: 2, nama: "Kak Sarah", keahlian: "Bahasa Inggris", domisili: "Banyumanik", pengalaman: "3 Tahun Mengajar" },
  { id: 3, nama: "Kak Gilang", keahlian: "IPA & Matematika SD", domisili: "Semarang Selatan", pengalaman: "1 Tahun Mengajar" }
];

// Data Pengajuan Ambil Siswa
let pengajuanList = [];

// Endpoint List & Detail Siswa
app.get('/api/siswa', (req, res) => res.json(siswaList));
app.get('/api/siswa/:id', (req, res) => {
  const item = siswaList.find(s => s.id == req.params.id);
  item ? res.json(item) : res.status(404).json({ message: "Siswa tidak ditemukan" });
});

// Endpoint List & Detail Tentor
app.get('/api/tentor', (req, res) => res.json(tentorList));
app.get('/api/tentor/:id', (req, res) => {
  const item = tentorList.find(t => t.id == req.params.id);
  item ? res.json(item) : res.status(404).json({ message: "Tentor tidak ditemukan" });
});

// Endpoint Pengajuan Ambil Siswa ke HRD
app.get('/api/pengajuan', (req, res) => res.json(pengajuanList));
app.post('/api/pengajuan', (req, res) => {
  const { siswaId, namaSiswa, mapel, namaTentor } = req.body;
  const baru = {
    id: Date.now(),
    siswaId,
    namaSiswa,
    mapel,
    namaTentor,
    status: "Menunggu Konfirmasi HRD"
  };
  pengajuanList.push(baru);
  res.status(201).json(baru);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API berjalan di http://localhost:${PORT}`));