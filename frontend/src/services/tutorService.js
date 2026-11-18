import { apiClient, expressClient, IS_SUPABASE } from '../config/api'
import { SEED_TUTORS } from '../data/seed'
import { normalizeTutor } from './normalizers'

const mapRows = (rows) => rows.map(normalizeTutor)

const fromExpress = async () => {
  const rows = await expressClient.get('/tentor')
  if (!Array.isArray(rows)) {
    throw new Error('Respons API tentor tidak valid.')
  }
  return { data: mapRows(rows), source: 'express' }
}

/**
 * Fetch tutors from Supabase first, then the Express API, then seed data.
 */
const fetchTutors = async () => {
  if (IS_SUPABASE) {
    try {
      const rows = await apiClient.get('/tentor?select=*&order=id.asc')
      if (!Array.isArray(rows)) {
        throw new Error('Respons Supabase tentor tidak valid.')
      }
      return { data: mapRows(rows), source: 'supabase' }
    } catch (error) {
      console.info('[LesMatch] Supabase tentor tidak tersedia:', error?.message)
    }
  }

  try {
    return await fromExpress()
  } catch {
    // Express is optional during static deployment.
  }

  return { data: SEED_TUTORS.map(normalizeTutor), source: 'local' }
}

export default { fetchTutors }
