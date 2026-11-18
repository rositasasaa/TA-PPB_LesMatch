import { apiClient, expressClient, IS_SUPABASE } from '../config/api'
import { normalizeSubmission } from './normalizers'

const LOCAL_KEY = 'lesmatch_submissions'

const readLocal = () => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const writeLocal = (items) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items))
  } catch {
    // Storage quota exceeded — the in-memory state still shows the submission.
  }
}

const mapRows = (rows) =>
  Array.isArray(rows) ? rows.map(normalizeSubmission) : []

const toSupabasePayload = (payload) => {
  const numericId = Number(payload.siswaId)
  return {
    siswa_id: Number.isFinite(numericId) ? numericId : null,
    nama_siswa: payload.namaSiswa,
    mapel: payload.mapel,
    nama_tentor: payload.namaTentor,
    catatan: payload.catatan || '',
    status: payload.status || 'Menunggu Konfirmasi HRD',
  }
}

const toExpressPayload = (payload) => ({
  siswaId: payload.siswaId,
  namaSiswa: payload.namaSiswa,
  mapel: payload.mapel,
  namaTentor: payload.namaTentor,
  catatan: payload.catatan || '',
})

const createLocalSubmission = (payload) =>
  normalizeSubmission({
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    siswa_id: payload.siswaId,
    nama_siswa: payload.namaSiswa,
    mapel: payload.mapel,
    nama_tentor: payload.namaTentor,
    catatan: payload.catatan || '',
    status: payload.status || 'Menunggu Konfirmasi HRD',
    created_at: new Date().toISOString(),
  })

/**
 * Fetch submissions from Supabase, Express, or localStorage.
 */
const fetchSubmissions = async () => {
  if (IS_SUPABASE) {
    try {
      const rows = await apiClient.get(
        '/pengajuan?select=*&order=created_at.desc',
      )
      if (!Array.isArray(rows)) {
        throw new Error('Respons Supabase pengajuan tidak valid.')
      }
      return { data: mapRows(rows), source: 'supabase' }
    } catch (error) {
      console.info('[LesMatch] Supabase pengajuan tidak tersedia:', error?.message)
    }
  }

  try {
    const rows = await expressClient.get('/pengajuan')
    if (!Array.isArray(rows)) {
      throw new Error('Respons API pengajuan tidak valid.')
    }
    return { data: mapRows(rows), source: 'express' }
  } catch {
    // Express is optional during static deployment.
  }

  return { data: mapRows(readLocal()), source: 'local' }
}

/**
 * Send a student application to HR. Tries Supabase, then Express, then keeps
 * it in localStorage so the offline PWA still records the action.
 */
const createSubmission = async (payload) => {
  if (IS_SUPABASE) {
    try {
      const rows = await apiClient.post(
        '/pengajuan',
        toSupabasePayload(payload),
        { headers: { Prefer: 'return=representation' } },
      )
      const row = Array.isArray(rows) ? rows[0] : rows
      if (!row) {
        throw new Error('Supabase tidak mengembalikan data pengajuan.')
      }
      return { data: normalizeSubmission(row), source: 'supabase' }
    } catch (error) {
      console.info('[LesMatch] Gagal menyimpan ke Supabase:', error?.message)
    }
  }

  try {
    const row = await expressClient.post('/pengajuan', toExpressPayload(payload))
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      throw new Error('Respons API pengajuan tidak valid.')
    }
    return {
      data: normalizeSubmission({
        ...row,
        created_at: row?.created_at || new Date().toISOString(),
      }),
      source: 'express',
    }
  } catch {
    // Fall through to localStorage below.
  }

  const local = createLocalSubmission(payload)
  writeLocal([local, ...readLocal()])
  return { data: local, source: 'local' }
}

const clearLocalSubmissions = () => {
  try {
    localStorage.removeItem(LOCAL_KEY)
  } catch {
    // Ignore storage errors.
  }
}

export default { fetchSubmissions, createSubmission, clearLocalSubmissions }
