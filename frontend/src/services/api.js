import {
  apiClient,
  expressClient,
  IS_SUPABASE,
  SUPABASE_URL,
  SUPABASE_KEY,
} from '../config/api'

/**
 * Reads a File or Blob into a base64 Data URL.
 * Used as an offline/local fallback when Supabase Storage is unreachable.
 */
const readFileAsDataUrl = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result || '')
    reader.onerror = () => resolve('')
    reader.readAsDataURL(file)
  })

/**
 * Uploads a tutor photo file to the Supabase Storage bucket 'avatars'
 * and returns its public URL.
 *
 * If offline or Supabase Storage returns an error, gracefully falls back
 * to a base64 Data URL so the photo is never lost and works immediately.
 *
 * @param {File|Blob|string} file
 * @returns {Promise<string>} Public URL of the uploaded image or fallback Data URL.
 */
export const uploadTutorPhoto = async (file) => {
  if (!file) return ''

  // If already a valid URL or Data URL string, return it as-is.
  if (typeof file === 'string') return file

  if (IS_SUPABASE && SUPABASE_URL && SUPABASE_KEY) {
    try {
      const ext = file.name ? file.name.split('.').pop() : 'jpg'
      const cleanExt = ext ? `.${ext.replace(/[^a-zA-Z0-9]/g, '')}` : '.jpg'
      const timestamp = Date.now()
      const random = Math.random().toString(36).slice(2, 8)
      const fileName = `tutor-${timestamp}-${random}${cleanExt}`
      const uploadUrl = `${SUPABASE_URL}/storage/v1/object/avatars/${fileName}`

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': file.type || 'image/jpeg',
          'x-upsert': 'true',
        },
        body: file,
      })

      if (response.ok) {
        return `${SUPABASE_URL}/storage/v1/object/public/avatars/${fileName}`
      }

      console.warn(
        '[LesMatch] Supabase storage upload failed with status:',
        response.status,
      )
    } catch (error) {
      console.warn(
        '[LesMatch] Supabase storage upload error, using Data URL fallback:',
        error?.message,
      )
    }
  }

  // Offline / local fallback
  return await readFileAsDataUrl(file)
}

export { apiClient, expressClient, IS_SUPABASE, SUPABASE_URL, SUPABASE_KEY }
