# LesMatch — Distribusi Siswa & Manajemen Tentor

**Tugas Akhir Praktikum Pemrograman Perangkat Bergerak**  
JavaScript React Progressive Web App (PWA) dengan Supabase, Express, dan Vercel.

LesMatch menggantikan distribusi daftar siswa les yang biasanya tersebar di grup chat menjadi satu portal PWA terpusat. Semua pengguna dapat mengelola siswa, tentor, dan pengajuan: menambah, memperbarui, menghapus, menyetujui, atau menolak pengajuan langsung dari antarmuka. Status siswa dan beban mengajar tentor tersinkron otomatis tanpa reload.

---

## 1. Fitur

- **Top navigation sticky** dengan logo, tautan Siswa, Tentor, Pengajuan, Profil, dan badge jumlah pengajuan menunggu.
- **6 halaman fungsional**:
  1. Daftar Siswa
  2. Detail Siswa + form pengajuan
  3. Daftar Tentor
  4. Detail Tentor + siswa cocok + beban mengajar
  5. Daftar Pengajuan + aksi HRD
  6. Profil / Tentang aplikasi
- **CRUD penuh tanpa login/role terpisah**: tambah siswa/tentor, edit dan hapus dari halaman detail, serta hapus riwayat pengajuan.
- **Alur persetujuan HRD**: setujui pengajuan → status siswa menjadi `Sudah Terisi`; tolak → status kembali `Tersedia` bila tidak ada pengajuan aktif lain.
- **Sinkronisasi real-time** state siswa, tentor, dan pengajuan melalui context React; beban mengajar dan jumlah siswa cocok dihitung ulang dengan `useMemo`.
- **Preferensi gender tentor** (`Bebas`, `Perempuan`, `Laki-laki`) dan **request khusus siswa** pada form, kartu, dan halaman detail.
- **Pencocokan tentor** mempertimbangkan mata pelajaran, ketersediaan siswa, dan preferensi gender.
- Filter status dengan segmented control, pencarian, dan dropdown mata pelajaran pada halaman Siswa, Tentor, dan Pengajuan.
- Dialog konfirmasi untuk aksi persetujuan, penolakan, penghapusan, dan reset data lokal.
- **Footer profesional responsif** berisi navigasi cepat, informasi teknologi/versi, dan hak cipta.
- **Tema indigo/navy** dengan aksen violet, amber, dan coral; font **Poppins** 400–700.
- **PWA installable** melalui `vite-plugin-pwa` (Web App Manifest + Service Worker Workbox).
- **Offline mode**: app shell di-cache, respons GET Supabase di-cache dengan NetworkFirst, dan data seed lokal menjadi fallback terakhir.
- Profil operator tersimpan di `localStorage`, termasuk ID anonim (UUID) dan statistik aplikasi.
- UI responsif dengan custom CSS + ikon Lucide React.
- Data layer berlapis: **Supabase → Express API → data lokal** (tanpa label sumber data di UI).

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
| Font | Poppins (Google Fonts) |
| Styling | Custom CSS responsif (indigo/navy, violet, amber, coral) |
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
│   │   ├── components/       # header, footer, cards, dialog, splash, dll.
│   │   ├── config/           # axios + Supabase/Express configuration
│   │   ├── context/          # AppDataProvider (students, tutors, submissions)
│   │   ├── data/             # seed data untuk fallback offline
│   │   ├── hooks/            # useOnlineStatus, usePwaInstall
│   │   ├── pages/            # 6 halaman aplikasi
│   │   ├── services/         # student, tutor, submission, profile services
│   │   ├── utils/            # helper format, pencocokan, gender, beban kerja
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

Jika `.env` belum diisi, aplikasi tetap berjalan dengan **API Express** (jika aktif) atau **data lokal** bawaan. Aplikasi otomatis memilih sumber data yang tersedia tanpa menampilkan label sumber di antarmuka.

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
| Siswa | `GET/POST/PATCH/DELETE /rest/v1/siswa` |
| Tentor | `GET/POST/PATCH/DELETE /rest/v1/tentor` |
| Pengajuan | `GET/POST/PATCH/DELETE /rest/v1/pengajuan` |

Semua request dilengkapi header `apikey` dan `Authorization: Bearer <publishable-key>` melalui interceptor Axios di `src/config/api.js`.

`schema.sql` sudah menyertakan migrasi progresif untuk kolom baru (`siswa.preferensi_gender`, `siswa.request_khusus`, `tentor.gender`) serta policy RLS dan grant `select/insert/update/delete` untuk key anon. Jalankan ulang file tersebut di SQL Editor jika project Supabase dibuat sebelum pembaruan ini.

---

## 6. Alur Bisnis

1. **Digitasi sistem lama** — daftar siswa les tidak lagi tersebar di grup chat.
2. **Manajemen waiting list** — data siswa (nama, kelas, mapel, jadwal, alamat, status, preferensi gender, request khusus) tersimpan di Supabase dan dikelompokkan per status ketersediaan.
3. **Tentor memilih siswa** — tentor membuka tab Tentor atau Siswa, memfilter berdasarkan keahlian/status, lalu membuka detail siswa. Jumlah siswa cocok dihitung otomatis dari mapel, ketersediaan, dan preferensi gender.
4. **Pengajuan ke HRD** — tentor meninjau lokasi/jadwal/request khusus, memilih tentor pengajar, mengisi catatan, dan mengirim pengajuan. Status siswa langsung berubah menjadi `Sedang Diajukan`.
5. **Tindak lanjut HRD** — di halaman Pengajuan, HRD dapat menyetujui (status siswa `Sudah Terisi`, beban tentor bertambah), menolak (status siswa kembali `Tersedia` bila tidak ada pengajuan aktif lain), atau menghapus riwayat pengajuan.
6. **Pemantauan beban** — detail tentor menampilkan daftar siswa aktif dan jumlahnya berdasarkan pengajuan yang disetujui.

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
- **RLS policy** pada `schema.sql` mengizinkan `anon` melakukan `select/insert/update/delete` pada `siswa`, `tentor`, dan `pengajuan` karena aplikasi ini menggunakan satu peran universal tanpa login. Untuk produksi nyata, tambahkan autentikasi dan batasi policy sesuai role HRD/tentor.
- **Kolom opsional** (`preferensi_gender`, `request_khusus`, `gender`) dikirim dengan fallback otomatis: jika project Supabase belum dimigrasi, service akan mencoba ulang payload lama agar CRUD tetap berjalan dan menyimpan nilai baru di cache lokal.
- **Offline**: service worker menggunakan `NetworkFirst` untuk request Supabase. Jika perangkat offline dan cache tersedia, daftar tetap tampil; jika cache belum ada, aplikasi memakai seed lokal.
- **Fallback lokal** untuk siswa, tentor, dan pengajuan menggabungkan data remote dengan cache perangkat. Persetujuan, penolakan, dan penghapusan yang dilakukan saat offline tetap terlihat setelah reload.
- Endpoint Express mendukung `GET/POST/PATCH/DELETE` untuk siswa, tentor, dan pengajuan sebagai fallback Module 1.
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
