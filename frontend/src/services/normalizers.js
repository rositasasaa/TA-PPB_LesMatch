import { normalizeGender, normalizeStudentStatus } from '../utils/helpers'

// Normalise rows coming from Supabase (snake_case), the Express API
// (camelCase) or local seed data into one shape used by the UI.

export const normalizeStudent = (row = {}) => ({
  id: row.id ?? row.student_id ?? '',
  nama: row.nama ?? row.name ?? 'Siswa tanpa nama',
  kelas: row.kelas ?? row.class ?? row.level ?? '-',
  mapel: row.mapel ?? row.subject ?? 'Umum',
  hari: row.hari ?? row.jadwal ?? row.schedule ?? '-',
  alamat: row.alamat ?? row.address ?? '-',
  status: normalizeStudentStatus(row.status),
  preferensiGender: normalizeGender(
    row.preferensi_gender ??
      row.preferensiGender ??
      row.gender_preference ??
      row.genderPreference ??
      'Bebas',
  ),
  requestKhusus:
    row.request_khusus ??
    row.requestKhusus ??
    row.special_request ??
    row.specialRequest ??
    '',
  namaTentor: row.nama_tentor ?? row.namaTentor ?? row.tutor ?? '',
})

export const normalizeTutor = (row = {}) => ({
  id: row.id ?? row.tutor_id ?? '',
  nama: row.nama ?? row.name ?? 'Tentor tanpa nama',
  keahlian: row.keahlian ?? row.expertise ?? row.mapel ?? '-',
  domisili: row.domisili ?? row.city ?? row.alamat ?? '-',
  pengalaman: row.pengalaman ?? row.experience ?? '-',
  gender: normalizeGender(
    row.gender ?? row.jenis_kelamin ?? row.jenisKelamin ?? 'Bebas',
  ),
  foto_url:
    row.foto_url ??
    row.fotoUrl ??
    row.avatar_url ??
    row.avatarUrl ??
    row.photo_url ??
    row.photoUrl ??
    '',
})

export const normalizeSubmission = (row = {}) => ({
  id: row.id ?? row.submission_id ?? '',
  siswaId: row.siswa_id ?? row.siswaId ?? row.student_id ?? null,
  namaSiswa: row.nama_siswa ?? row.namaSiswa ?? 'Siswa',
  mapel: row.mapel ?? row.subject ?? '-',
  namaTentor: row.nama_tentor ?? row.namaTentor ?? row.tutor ?? '-',
  catatan: row.catatan ?? row.note ?? '',
  status: row.status ?? 'Menunggu Konfirmasi HRD',
  createdAt: row.created_at ?? row.createdAt ?? null,
})
