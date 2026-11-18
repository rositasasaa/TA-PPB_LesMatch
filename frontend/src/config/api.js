import axios from 'axios'

// ---------------------------------------------------------------------------
// LesMatch API configuration
//
// Primary backend  : Supabase PostgREST (Module 5)
// Fallback backend : Express API in /backend (Module 1)
// Final fallback   : local seed data + localStorage (offline mode)
// ---------------------------------------------------------------------------

const stripTrailingSlash = (value = '') => String(value).replace(/\/+$/, '')

export const SUPABASE_URL = stripTrailingSlash(
  import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_API_BASE_URL || '',
)

export const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''

export const IS_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_KEY)
export const EXPRESS_BASE_URL = import.meta.env.VITE_EXPRESS_API_URL || '/api'

const baseURL = IS_SUPABASE ? `${SUPABASE_URL}/rest/v1` : EXPRESS_BASE_URL

const baseConfig = {
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 8000,
}

const normalizeApiError = (error) => {
  let message = 'Terjadi kesalahan yang tidak terduga.'
  let status = null

  if (error.response) {
    status = error.response.status
    message =
      error.response.data?.message ||
      error.response.data?.msg ||
      error.response.data?.error_description ||
      error.response.data?.error ||
      `Server menolak permintaan (${status}).`
  } else if (error.request) {
    message = 'Tidak dapat menghubungi server. Periksa koneksi Anda.'
  } else if (error.message) {
    message = error.message
  }

  return Promise.reject({
    message,
    status,
    code: error.response?.data?.code,
    raw: error.response?.data,
  })
}

const unwrapResponses = (client) => {
  client.interceptors.response.use((response) => response.data, normalizeApiError)
  return client
}

// Supabase PostgREST client (primary backend).
export const apiClient = unwrapResponses(
  axios.create({ ...baseConfig, baseURL }),
)

// Express API client used as the second fallback. It has its own base URL so
// a Supabase outage never prevents the Module 1 backend from being tried.
export const expressClient = unwrapResponses(
  axios.create({ ...baseConfig, baseURL: EXPRESS_BASE_URL }),
)

// Attach the Supabase publishable key to every primary request.
apiClient.interceptors.request.use(
  (config) => {
    if (IS_SUPABASE && SUPABASE_KEY) {
      config.headers = config.headers || {}
      config.headers.apikey = SUPABASE_KEY
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${SUPABASE_KEY}`
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

if (import.meta.env.DEV && !IS_SUPABASE) {
  console.info(
    '[LesMatch] VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY belum diisi. ' +
      'Aplikasi memakai API Express atau data lokal.',
  )
}
