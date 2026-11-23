import { apiClient, expressClient, IS_SUPABASE } from '../config/api'
import { SEED_STUDENTS } from '../data/seed'
import { normalizeGender } from '../utils/helpers'
import { normalizeStudent } from './normalizers'
import {
  patchWithColumnFallback,
  postWithColumnFallback,
} from './supabasePayload'

const LOCAL_KEY = 'lesmatch_students'
const DELETED_KEY = 'lesmatch_deleted_students'

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
    // LocalStorage quota or access error.
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
  Array.isArray(rows) ? rows.map(normalizeStudent) : []

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

  return [...uniqueLocal, ...mergedRemote]
}

const toBasePayload = (payload) => ({
  nama: String(payload.nama || '').trim(),
  kelas: payload.kelas?.trim() || '-',
  mapel: String(payload.mapel || '').trim(),
  hari: payload.hari?.trim() || '-',
  alamat: payload.alamat?.trim() || '-',
  status: payload.status?.trim() || 'Tersedia',
})

const toSupabasePayload = (payload) => ({
  ...toBasePayload(payload),
  preferensi_gender: normalizeGender(payload.preferensiGender),
  request_khusus: String(payload.requestKhusus || '').trim(),
})

const toExpressPayload = (payload) => ({
  ...toBasePayload(payload),
  preferensiGender: normalizeGender(payload.preferensiGender),
  requestKhusus: String(payload.requestKhusus || '').trim(),
})

const createLocalStudent = (payload) =>
  normalizeStudent({
    id: `local-s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ...toExpressPayload(payload),
  })

const cacheStudent = (student) => {
  removeLocal(student.id)
  writeLocal([student, ...readLocal()])
  removeDeletedId(student.id)
}

/**
 * Fetch students from Supabase first, then the Express API, then local seed +
 * stored overrides. Local rows always win so optional fields that are not
 * migrated in Supabase yet are preserved on this device.
 */
const fetchStudents = async () => {
  if (IS_SUPABASE) {
    try {
      const rows = await apiClient.get('/siswa?select=*&order=id.asc')
      if (!Array.isArray(rows)) {
        throw new Error('Respons Supabase siswa tidak valid.')
      }
      return { data: mergeWithLocal(mapRows(rows)), source: 'supabase' }
    } catch (error) {
      console.info('[LesMatch] Supabase siswa tidak tersedia:', error?.message)
    }
  }

  try {
    const rows = await expressClient.get('/siswa')
    if (!Array.isArray(rows)) {
      throw new Error('Respons API siswa tidak valid.')
    }
    return { data: mergeWithLocal(mapRows(rows)), source: 'express' }
  } catch {
    // Express is optional during static deployment.
  }

  return {
    data: mergeWithLocal(SEED_STUDENTS.map(normalizeStudent)),
    source: 'local',
  }
}

/**
 * Create a new student directly on the website (no admin role needed).
 * Tries Supabase PostgREST, falls back to Express API, then localStorage.
 */
const createStudent = async (payload) => {
  if (IS_SUPABASE) {
    try {
      const fullPayload = toSupabasePayload(payload)
      const rows = await postWithColumnFallback(
        apiClient,
        '/siswa',
        fullPayload,
        toBasePayload(payload),
      )
      const row = Array.isArray(rows) ? rows[0] : rows
      if (!row) {
        throw new Error('Supabase tidak mengembalikan data siswa.')
      }
      const data = normalizeStudent({
        ...row,
        preferensi_gender: fullPayload.preferensi_gender,
        request_khusus: fullPayload.request_khusus,
      })
      cacheStudent(data)
      return { data, source: 'supabase' }
    } catch (error) {
      console.info('[LesMatch] Gagal menyimpan siswa ke Supabase:', error?.message)
    }
  }

  try {
    const row = await expressClient.post('/siswa', toExpressPayload(payload))
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      throw new Error('Respons API siswa tidak valid.')
    }
    const data = normalizeStudent(row)
    cacheStudent(data)
    return { data, source: 'express' }
  } catch {
    // Fallback to local storage.
  }

  const local = createLocalStudent(payload)
  cacheStudent(local)
  return { data: local, source: 'local' }
}

/**
 * Update an existing student, including status changes triggered by the
 * submission approval flow.
 */
const updateStudent = async (id, payload) => {
  const isLocalOnly = String(id).startsWith('local-')

  if (IS_SUPABASE && !isLocalOnly) {
    try {
      const fullPayload = toSupabasePayload(payload)
      const rows = await patchWithColumnFallback(
        apiClient,
        `/siswa?id=eq.${encodeURIComponent(id)}`,
        fullPayload,
        toBasePayload(payload),
      )
      const row = Array.isArray(rows) ? rows[0] : rows
      if (row) {
        const data = normalizeStudent({
          ...row,
          preferensi_gender: fullPayload.preferensi_gender,
          request_khusus: fullPayload.request_khusus,
        })
        cacheStudent(data)
        return { data, source: 'supabase' }
      }
    } catch (error) {
      console.info('[LesMatch] Gagal update siswa di Supabase:', error?.message)
    }
  }

  if (!isLocalOnly) {
    try {
      const row = await expressClient.patch(
        `/siswa/${id}`,
        toExpressPayload(payload),
      )
      if (row && typeof row === 'object' && !Array.isArray(row)) {
        const data = normalizeStudent({ id, ...row })
        cacheStudent(data)
        return { data, source: 'express' }
      }
    } catch {
      // Continue with the local cache.
    }
  }

  const existing = readLocal().find(
    (item) => String(item.id) === String(id),
  )
  const updated = normalizeStudent({
    ...existing,
    id,
    ...toExpressPayload(payload),
  })
  cacheStudent(updated)
  return { data: updated, source: 'local' }
}

/**
 * Delete a student and remember locally-deleted ids so seed/remote rows do
 * not reappear after an offline delete.
 */
const deleteStudent = async (id) => {
  const isLocalOnly = String(id).startsWith('local-')

  if (IS_SUPABASE && !isLocalOnly) {
    try {
      await apiClient.delete(`/siswa?id=eq.${encodeURIComponent(id)}`)
      removeLocal(id)
      return { id, source: 'supabase' }
    } catch (error) {
      console.info('[LesMatch] Gagal hapus siswa di Supabase:', error?.message)
    }
  }

  if (!isLocalOnly) {
    try {
      await expressClient.delete(`/siswa/${id}`)
      removeLocal(id)
      return { id, source: 'express' }
    } catch {
      // Continue with the local fallback.
    }
  }

  removeLocal(id)
  addDeletedId(id)
  return { id, source: 'local' }
}

export default {
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
}
