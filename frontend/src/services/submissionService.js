import { apiClient, expressClient, IS_SUPABASE } from '../config/api'
import { SEED_SUBMISSIONS } from '../data/seed'
import { normalizeSubmission } from './normalizers'

const LOCAL_KEY = 'lesmatch_submissions'
const DELETED_KEY = 'lesmatch_deleted_submissions'

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

const readDeletedIds = () => {
  try {
    const raw = localStorage.getItem(DELETED_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const addDeletedId = (id) => {
  try {
    const ids = new Set(readDeletedIds().map(String))
    ids.add(String(id))
    localStorage.setItem(DELETED_KEY, JSON.stringify([...ids]))
  } catch {
    // Ignore storage errors.
  }
}

const removeDeletedId = (id) => {
  try {
    const ids = readDeletedIds().filter((item) => String(item) !== String(id))
    localStorage.setItem(DELETED_KEY, JSON.stringify(ids))
  } catch {
    // Ignore storage errors.
  }
}

const removeLocal = (id) => {
  writeLocal(readLocal().filter((item) => String(item.id) !== String(id)))
}

const mapRows = (rows) =>
  Array.isArray(rows) ? rows.map(normalizeSubmission) : []

const sortByNewest = (items) =>
  [...items].sort((first, second) => {
    const firstTime = Date.parse(first.createdAt) || 0
    const secondTime = Date.parse(second.createdAt) || 0
    return secondTime - firstTime
  })

/**
 * Local rows override remote rows by id. This keeps approvals, rejections and
 * deletions made while Supabase was unreachable visible after a reload.
 */
const mergeWithLocal = (remoteRows) => {
  const deletedIds = new Set(readDeletedIds().map(String))
  const localRows = mapRows(readLocal())
  const localMap = new Map(localRows.map((item) => [String(item.id), item]))

  const mergedRemote = remoteRows
    .filter((item) => !deletedIds.has(String(item.id)))
    .map((item) => localMap.get(String(item.id)) || item)

  const remoteIds = new Set(remoteRows.map((item) => String(item.id)))
  const uniqueLocal = localRows.filter(
    (item) =>
      !remoteIds.has(String(item.id)) && !deletedIds.has(String(item.id)),
  )

  return sortByNewest([...uniqueLocal, ...mergedRemote])
}

const cacheSubmission = (submission) => {
  removeLocal(submission.id)
  writeLocal([submission, ...readLocal()])
  removeDeletedId(submission.id)
}

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
  status: payload.status || 'Menunggu Konfirmasi HRD',
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
      return { data: mergeWithLocal(mapRows(rows)), source: 'supabase' }
    } catch (error) {
      console.info('[LesMatch] Supabase pengajuan tidak tersedia:', error?.message)
    }
  }

  try {
    const rows = await expressClient.get('/pengajuan')
    if (!Array.isArray(rows)) {
      throw new Error('Respons API pengajuan tidak valid.')
    }
    return { data: mergeWithLocal(mapRows(rows)), source: 'express' }
  } catch {
    // Express is optional during static deployment.
  }

  return {
    data: mergeWithLocal(SEED_SUBMISSIONS.map(normalizeSubmission)),
    source: 'local',
  }
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
      const data = normalizeSubmission(row)
      cacheSubmission(data)
      return { data, source: 'supabase' }
    } catch (error) {
      console.info('[LesMatch] Gagal menyimpan ke Supabase:', error?.message)
    }
  }

  try {
    const row = await expressClient.post('/pengajuan', toExpressPayload(payload))
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      throw new Error('Respons API pengajuan tidak valid.')
    }
    const data = normalizeSubmission({
      ...row,
      created_at: row?.created_at || new Date().toISOString(),
    })
    cacheSubmission(data)
    return { data, source: 'express' }
  } catch {
    // Fall through to localStorage below.
  }

  const local = createLocalSubmission(payload)
  cacheSubmission(local)
  return { data: local, source: 'local' }
}

/**
 * Update a submission status (approve / reject) in Supabase, Express, or the
 * local fallback. The returned record always reflects the requested status so
 * the global context can update every screen instantly.
 */
const updateSubmission = async (id, payload) => {
  const isLocalOnly =
    String(id).startsWith('local-') || String(id).startsWith('seed-')

  if (IS_SUPABASE && !isLocalOnly) {
    try {
      const rows = await apiClient.patch(
        `/pengajuan?id=eq.${encodeURIComponent(id)}`,
        { status: payload.status },
        { headers: { Prefer: 'return=representation' } },
      )
      const row = Array.isArray(rows) ? rows[0] : rows
      if (row) {
        const data = normalizeSubmission(row)
        cacheSubmission(data)
        return { data, source: 'supabase' }
      }
    } catch (error) {
      console.info('[LesMatch] Gagal update pengajuan di Supabase:', error?.message)
    }
  }

  if (!isLocalOnly) {
    try {
      const row = await expressClient.patch(`/pengajuan/${id}`, payload)
      if (row && typeof row === 'object' && !Array.isArray(row)) {
        const data = normalizeSubmission({ ...payload, ...row, id })
        cacheSubmission(data)
        return { data, source: 'express' }
      }
    } catch {
      // Continue with the local fallback.
    }
  }

  const existing = readLocal().find(
    (item) => String(item.id) === String(id),
  )
  const updated = normalizeSubmission({ ...existing, ...payload, id })
  cacheSubmission(updated)
  return { data: updated, source: 'local' }
}

/**
 * Remove a submission history entry.
 */
const deleteSubmission = async (id) => {
  const isLocalOnly =
    String(id).startsWith('local-') || String(id).startsWith('seed-')

  if (IS_SUPABASE && !isLocalOnly) {
    try {
      await apiClient.delete(`/pengajuan?id=eq.${encodeURIComponent(id)}`)
      removeLocal(id)
      removeDeletedId(id)
      return { id, source: 'supabase' }
    } catch (error) {
      console.info('[LesMatch] Gagal hapus pengajuan di Supabase:', error?.message)
    }
  }

  if (!isLocalOnly) {
    try {
      await expressClient.delete(`/pengajuan/${id}`)
      removeLocal(id)
      removeDeletedId(id)
      return { id, source: 'express' }
    } catch {
      // Continue with the local fallback.
    }
  }

  removeLocal(id)
  addDeletedId(id)
  return { id, source: 'local' }
}

const clearLocalSubmissions = () => {
  try {
    localStorage.removeItem(LOCAL_KEY)
    localStorage.removeItem(DELETED_KEY)
  } catch {
    // Ignore storage errors.
  }
}

export default {
  fetchSubmissions,
  createSubmission,
  updateSubmission,
  deleteSubmission,
  clearLocalSubmissions,
}
