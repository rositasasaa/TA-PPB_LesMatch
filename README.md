# LesMatch — Distribusi Siswa Les

**Tugas Akhir Praktikum Pemrograman Perangkat Bergerak**  
JavaScript React Progressive Web App (PWA) dengan Supabase, Express, dan Vercel.

LesMatch menggantikan distribusi daftar siswa les yang biasanya tersebar di grup chat menjadi satu portal PWA terpusat. Tentor dapat melihat daftar siswa per mata pelajaran, meninjau detail jadwal dan lokasi, lalu mengirim pengajuan ke HRD/Branch Manager.

---

## 1. Fitur

- **Bottom navigation** tetap dengan 4 menu: Siswa, Tentor, Pengajuan, Profil.
- **6 halaman fungsional**:
  1. Daftar Siswa
  2. Detail Siswa + form pengajuan
  3. Daftar Tentor
  4. Detail Tentor + siswa yang cocok
  5. Daftar Pengajuan
  6. Profil / Tentang aplikasi
- **2 alur list → detail**: siswa → detail siswa, tentor → detail tentor.
- Filter mata pelajaran, pencarian, dan pengelompokan siswa per mapel.
- Form pengajuan tersimpan ke tabel `pengajuan` (Supabase) dengan status `Menunggu Konfirmasi HRD`.
- **PWA installable** melalui `vite-plugin-pwa` (Web App Manifest + Service Worker Workbox).
- **Offline mode**: app shell di-cache, respons GET Supabase di-cache dengan NetworkFirst, dan data seed lokal menjadi fallback terakhir.
- Profil operator tersimpan di `localStorage`, termasuk ID anonim (UUID) dan statistik aplikasi.
- UI responsif dengan custom CSS + ikon Lucide React.
- Data layer berlapis: **Supabase → Express API → data lokal**.
- Indikator sumber data dan status online/offline di UI.

---

## 2. Teknologi

| Bagian | Teknologi |
| --- | --- |
| Frontend | React 19, Vite 8, JavaScript (JSX) |
| PWA | `vite-plugin-pwa`, Workbox, Web App Manifest |
| API | Axios + Supabase PostgREST |
| Database | Supabase PostgreSQL (`siswa`, `tentor`, `pengajuan`) |
| Fallback API | Express.js (`backend/`, Module 1) |
| Ikon | Lucide React |
| Styling | Custom CSS responsif |
| Hosting | Vercel |
| Source code | GitHub |

---

## 3. Struktur Proyek

```text
LesMatch-ppb/
├── backend/                  # Express API dari Module 1 (tetap dipertahankan)
│   └── index.js              # /api/siswa, /api/tentor, /api/pengajuan
├── frontend/                 # React PWA
│   ├── public/               # logo, favicon, ikon PWA 192/512/maskable
│   ├── src/
│   │   ├── components/       # header, bottom nav, cards, badges, splash, dll.
│   │   ├── config/           # axios + Supabase/Express configuration
│   │   ├── context/          # AppDataProvider (students, tutors, submissions)
│   │   ├── data/             # seed data untuk fallback offline
│   │   ├── hooks/            # useOnlineStatus, usePwaInstall
│   │   ├── pages/            # 6 halaman aplikasi
│   │   ├── services/         # student, tutor, submission, profile services
│   │   ├── utils/            # helper format & pencocokan keahlian
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── vite.config.js        # konfigurasi Vite + VitePWA + Workbox
│   └── .env.example
├── supabase/
│   ├── schema.sql            # tabel, RLS policy, grant untuk anon key
│   └── seed.sql              # data awal siswa & tentor
└── README.md
```

---

## 4. Menjalankan Proyek

### Prasyarat

- Node.js 20.19+ (disarankan Node 22/24)
- npm
- Akun Supabase (opsional untuk mode lokal)

### 4.1 Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Buka `http://localhost:5173`.

Jika `.env` belum diisi, aplikasi tetap berjalan dengan **API Express** (jika aktif) atau **data lokal** bawaan. Indikator sumber data di kanan atas setiap daftar akan menunjukkan `Supabase`, `API Express`, atau `Data offline`.

### 4.2 Backend Express (fallback Module 1)

```bash
cd backend
npm install
node index.js
```

API berjalan di `http://localhost:3000`. Vite sudah mem-proxy `/api` ke alamat tersebut saat development.

### 4.3 Build & preview produksi

```bash
cd frontend
npm run build
npm run preview
# atau untuk tes dari HP di jaringan yang sama:
npm run preview:host
```

---

## 5. Konfigurasi Supabase

1. Buat project baru di [supabase.com](https://supabase.com).
2. Buka **SQL Editor** → jalankan isi `supabase/schema.sql`.
3. Jalankan `supabase/seed.sql` untuk mengisi data awal.
4. Buka **Project Settings → API** dan salin:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Publishable key** (atau anon key) → `VITE_SUPABASE_PUBLISHABLE_KEY`
5. Salin `frontend/.env.example` menjadi `frontend/.env`, lalu isi nilainya.

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxxx
VITE_EXPRESS_API_URL=/api
```

> **Jangan commit file `.env`.** File tersebut sudah masuk `.gitignore`.

Endpoint yang dipakai frontend:

| Data | Supabase PostgREST |
| --- | --- |
| Siswa | `GET /rest/v1/siswa?select=*&order=id.asc` |
| Tentor | `GET /rest/v1/tentor?select=*&order=id.asc` |
| Pengajuan | `GET /rest/v1/pengajuan?select=*&order=created_at.desc` |
| Simpan pengajuan | `POST /rest/v1/pengajuan` |

Semua request dilengkapi header `apikey` dan `Authorization: Bearer <publishable-key>` melalui interceptor Axios di `src/config/api.js`.

---

## 6. Alur Bisnis

1. **Digitasi sistem lama** — daftar siswa les tidak lagi tersebar di grup chat.
2. **Manajemen waiting list** — data siswa (nama, kelas, mapel, jadwal, alamat, status) tersimpan di Supabase dan dikelompokkan per mata pelajaran.
3. **Tentor memilih siswa** — tentor membuka tab Tentor atau Siswa, memfilter berdasarkan keahlian, lalu membuka detail siswa.
4. **Pengajuan ke HRD** — tentor meninjau lokasi/jadwal, memilih dirinya sebagai pengajar, mengisi catatan, dan mengirim pengajuan. Data masuk ke tabel `pengajuan` dengan status `Menunggu Konfirmasi HRD`.

---

## 7. Deployment ke Vercel

1. Push seluruh proyek ke GitHub.
2. Buka [vercel.com](https://vercel.com) → **Add New → Project** → import repository.
3. Pada konfigurasi project:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Tambahkan environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
5. Klik **Deploy**. Vercel akan menghasilkan domain PWA.

### Install di HP

1. Buka domain Vercel di browser HP.
2. **Android/Chrome**: menu ⋮ → **Install app / Add to Home screen**.
3. **iPhone/Safari**: tombol Share → **Add to Home Screen**.
4. LesMatch tampil sebagai aplikasi standalone dan dapat dibuka offline.

---

## 8. Catatan Implementasi

- **Sumber data berlapis** membuat aplikasi tetap bisa didemokan tanpa kredensial Supabase. Untuk penilaian integrasi API, isi `.env` Supabase dan pastikan tabel sudah dibuat.
- **RLS policy** pada `schema.sql` mengizinkan `anon` membaca `siswa`/`tentor` dan membaca/menulis `pengajuan`. Untuk produksi nyata, tambahkan autentikasi dan batasi policy sesuai role HRD/tentor.
- **Offline**: service worker menggunakan `NetworkFirst` untuk request Supabase. Jika perangkat offline dan cache tersedia, daftar tetap tampil; jika cache belum ada, aplikasi memakai seed lokal.
- Pengajuan yang dikirim saat offline disimpan di `localStorage` dan ditandai sebagai sumber `Data offline`. Setelah kembali online, pengajuan tersebut tidak otomatis disinkronkan (sesuai batas praktikum); pengajuan baru akan masuk ke Supabase.
- Endpoint Express bawaan Module 1 hanya menyimpan `siswaId`, `namaSiswa`, `mapel`, dan `namaTentor`; kolom catatan opsional baru tersimpan saat memakai Supabase atau penyimpanan lokal. Ini tidak mengubah kontrak backend Module 1.
- Backend Express tetap dipertahankan sebagai fallback dan bukti struktur Module 1.

---

## 9. Scripts

| Perintah | Keterangan |
| --- | --- |
| `npm run dev` | Development server Vite |
| `npm run build` | Build produksi + generate service worker |
| `npm run preview` | Preview hasil build |
| `npm run preview:host` | Preview dan akses dari HP di jaringan lokal |
| `npm run lint` | Oxlint |

---

© 2026 LesMatch — Tugas Akhir Praktikum PPB.
