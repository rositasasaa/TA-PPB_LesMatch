import { apiClient, expressClient, IS_SUPABASE } from '../config/api'
import { SEED_STUDENTS } from '../data/seed'
import { normalizeStudent } from './normalizers'

const mapRows = (rows) => rows.map(normalizeStudent)

const fromExpress = async () => {
  const rows = await expressClient.get('/siswa')
  if (!Array.isArray(rows)) {
    throw new Error('Respons API siswa tidak valid.')
  }
  return { data: mapRows(rows), source: 'express' }
}

/**
 * Fetch students from Supabase first, then the Express API, then the bundled
 * seed data. The returned `source` lets the UI show where data came from.
 */
const fetchStudents = async () => {
  if (IS_SUPABASE) {
    try {
      const rows = await apiClient.get('/siswa?select=*&order=id.asc')
      if (!Array.isArray(rows)) {
        throw new Error('Respons Supabase siswa tidak valid.')
      }
      return { data: mapRows(rows), source: 'supabase' }
    } catch (error) {
      console.info('[LesMatch] Supabase siswa tidak tersedia:', error?.message)
    }
  }

  try {
    return await fromExpress()
  } catch {
    // Express is optional during static deployment.
  }

  return { data: SEED_STUDENTS.map(normalizeStudent), source: 'local' }
}

export default { fetchStudents }
