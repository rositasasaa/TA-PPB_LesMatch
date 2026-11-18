const PROFILE_KEY = 'lesmatch_profile'
const ID_KEY = 'lesmatch_operator_id'

const DEFAULT_PROFILE = {
  nama: 'Operator LesMatch',
  cabang: 'Semarang',
  telepon: '',
}

const isValidUuid = (value) =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )

const generateUuid = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0
    const value = char === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

export const getOperatorId = () => {
  try {
    let id = localStorage.getItem(ID_KEY)
    if (!id || !isValidUuid(id)) {
      id = generateUuid()
      localStorage.setItem(ID_KEY, id)
    }
    return id
  } catch {
    return generateUuid()
  }
}

export const getProfile = () => {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    const stored = raw ? JSON.parse(raw) : {}
    return { ...DEFAULT_PROFILE, ...stored, id: getOperatorId() }
  } catch {
    return { ...DEFAULT_PROFILE, id: getOperatorId() }
  }
}

export const saveProfile = (profile) => {
  try {
    const data = {
      nama: profile.nama?.trim() || DEFAULT_PROFILE.nama,
      cabang: profile.cabang?.trim() || DEFAULT_PROFILE.cabang,
      telepon: profile.telepon?.trim() || '',
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(PROFILE_KEY, JSON.stringify(data))
    return { success: true, data: { ...data, id: getOperatorId() } }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

export const resetProfile = () => {
  try {
    localStorage.removeItem(PROFILE_KEY)
    localStorage.removeItem(ID_KEY)
  } catch {
    // Ignore storage errors.
  }
  return getProfile()
}

export default {
  getOperatorId,
  getProfile,
  saveProfile,
  resetProfile,
}
