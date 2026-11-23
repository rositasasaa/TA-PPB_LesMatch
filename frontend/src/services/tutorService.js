import { apiClient, expressClient, IS_SUPABASE } from '../config/api'
import { SEED_TUTORS } from '../data/seed'
import { normalizeGender } from '../utils/helpers'
import { uploadTutorPhoto } from './api'
import { normalizeTutor } from './normalizers'
import {
  patchWithColumnFallback,
  postWithColumnFallback,
} from './supabasePayload'

const LOCAL_KEY = 'lesmatch_tutors'
const DELETED_KEY = 'lesmatch_deleted_tutors'

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
    // Abaikan jika kuota penyimpanan penuh
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
    // Abaikan error storage
  }
}

const removeDeletedId = (id) => {
  try {
    const ids = readDeletedIds().filter((item) => String(item) !== String(id))
    localStorage.setItem(DELETED_KEY, JSON.stringify(ids))
  } catch {
    // Abaikan error storage
  }
}

const removeLocal = (id) => {
  writeLocal(readLocal().filter((item) => String(item.id) !== String(id)))
}

const mapRows = (rows) =>
  Array.isArray(rows) ? rows.map(normalizeTutor) : []

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
  keahlian: String(payload.keahlian || '').trim(),
  domisili: payload.domisili?.trim() || '-',
  pengalaman: payload.pengalaman?.trim() || '-',
})

const toSupabasePayload = (payload) => {
  const data = {
    ...toBasePayload(payload),
    gender: normalizeGender(payload.gender),
  }
  const foto = payload.foto_url ?? payload.fotoUrl
  if (foto !== undefined) {
    data.foto_url = String(foto).trim()
  }
  return data
}

const toPayload = (payload) => ({
  ...toBasePayload(payload),
  gender: normalizeGender(payload.gender),
  foto_url: String(payload.foto_url ?? payload.fotoUrl ?? '').trim(),
})

const createLocalTutor = (payload) =>
  normalizeTutor({
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ...toPayload(payload),
  })

const cacheTutor = (tutor) => {
  removeLocal(tutor.id)
  writeLocal([tutor, ...readLocal()])
  removeDeletedId(tutor.id)
}

/**
 * READ: Ambil daftar tentor dari Supabase → Express → Seed Lokal
 */
const fetchTutors = async () => {
  if (IS_SUPABASE) {
    try {
      const rows = await apiClient.get('/tentor?select=*&order=id.desc')
      if (!Array.isArray(rows)) {
        throw new Error('Respons Supabase tentor tidak valid.')
      }
      return { data: mergeWithLocal(mapRows(rows)), source: 'supabase' }
    } catch (error) {
      console.info('[LesMatch] Supabase tentor tidak tersedia:', error?.message)
    }
  }

  try {
    const rows = await expressClient.get('/tentor')
    if (!Array.isArray(rows)) {
      throw new Error('Respons API tentor tidak valid.')
    }
    return { data: mergeWithLocal(mapRows(rows)), source: 'express' }
  } catch {
    // Express opsional
  }

  return {
    data: mergeWithLocal(SEED_TUTORS.map(normalizeTutor)),
    source: 'local',
  }
}

/**
 * CREATE: Tambah tentor baru
 */
const createTutor = async (payload) => {
  if (IS_SUPABASE) {
    try {
      const fullPayload = toSupabasePayload(payload)
      const rows = await postWithColumnFallback(
        apiClient,
        '/tentor',
        fullPayload,
        toBasePayload(payload),
      )
      const row = Array.isArray(rows) ? rows[0] : rows
      if (!row) throw new Error('Supabase tidak mengembalikan data tentor.')
      const data = normalizeTutor({
        ...row,
        gender: fullPayload.gender,
        foto_url: fullPayload.foto_url ?? row?.foto_url ?? '',
      })
      cacheTutor(data)
      return { data, source: 'supabase' }
    } catch (error) {
      console.info('[LesMatch] Gagal menyimpan tentor ke Supabase:', error?.message)
    }
  }

  try {
    const row = await expressClient.post('/tentor', toPayload(payload))
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      throw new Error('Respons API tentor tidak valid.')
    }
    const data = normalizeTutor(row)
    cacheTutor(data)
    return { data, source: 'express' }
  } catch {
    // Lanjut ke penyimpanan lokal
  }

  const local = createLocalTutor(payload)
  cacheTutor(local)
  return { data: local, source: 'local' }
}

/**
 * UPDATE: Perbarui data tentor berdasarkan ID
 */
const updateTutor = async (id, payload) => {
  const isLocalOnly = String(id).startsWith('local-')

  if (IS_SUPABASE && !isLocalOnly) {
    try {
      const fullPayload = toSupabasePayload(payload)
      const rows = await patchWithColumnFallback(
        apiClient,
        `/tentor?id=eq.${encodeURIComponent(id)}`,
        fullPayload,
        toBasePayload(payload),
      )
      const row = Array.isArray(rows) ? rows[0] : rows
      if (row) {
        const data = normalizeTutor({
        ...row,
        gender: fullPayload.gender,
        foto_url: fullPayload.foto_url ?? row?.foto_url ?? '',
      })
        cacheTutor(data)
        return { data, source: 'supabase' }
      }
    } catch (error) {
      console.info('[LesMatch] Gagal update tentor di Supabase:', error?.message)
    }
  }

  if (!isLocalOnly) {
    try {
      const row = await expressClient.patch(`/tentor/${id}`, toPayload(payload))
      if (row && typeof row === 'object' && !Array.isArray(row)) {
        const data = normalizeTutor({ id, ...row })
        cacheTutor(data)
        return { data, source: 'express' }
      }
    } catch {
      // Lanjut ke penyimpanan lokal
    }
  }

  const existing = readLocal().find(
    (item) => String(item.id) === String(id),
  )
  const updated = normalizeTutor({ ...existing, id, ...toPayload(payload) })
  cacheTutor(updated)
  return { data: updated, source: 'local' }
}

/**
 * DELETE: Hapus data tentor berdasarkan ID
 */
const deleteTutor = async (id) => {
  const isLocalOnly = String(id).startsWith('local-')

  if (IS_SUPABASE && !isLocalOnly) {
    try {
      await apiClient.delete(`/tentor?id=eq.${encodeURIComponent(id)}`)
      removeLocal(id)
      return { id, source: 'supabase' }
    } catch (error) {
      console.info('[LesMatch] Gagal hapus tentor di Supabase:', error?.message)
    }
  }

  if (!isLocalOnly) {
    try {
      await expressClient.delete(`/tentor/${id}`)
      removeLocal(id)
      return { id, source: 'express' }
    } catch {
      // Lanjut ke penyimpanan lokal
    }
  }

  removeLocal(id)
  addDeletedId(id)
  return { id, source: 'local' }
}

export { uploadTutorPhoto }

export default {
  fetchTutors,
  createTutor,
  updateTutor,
  deleteTutor,
  uploadTutorPhoto,
}
