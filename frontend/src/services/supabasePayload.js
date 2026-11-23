// Supabase PostgREST returns 42703 / PGRST204 when a payload references a
// column that has not been migrated yet. LesMatch treats the optional student
// and tutor fields as progressive enhancements: try the full payload first,
// then retry with the legacy-safe payload so CRUD never breaks.

export const isMissingColumnError = (error) => {
  const code = error?.code || error?.raw?.code
  const message = String(
    error?.message ||
      error?.raw?.message ||
      error?.raw?.details ||
      error?.raw?.hint ||
      '',
  )

  return (
    code === '42703' ||
    code === 'PGRST204' ||
    /column .* does not exist/i.test(message) ||
    /could not find the '.*' column/i.test(message) ||
    /schema cache/i.test(message)
  )
}

const representationConfig = {
  headers: { Prefer: 'return=representation' },
}

export const postWithColumnFallback = async (
  client,
  url,
  fullPayload,
  basePayload,
) => {
  try {
    return await client.post(url, fullPayload, representationConfig)
  } catch (error) {
    if (!isMissingColumnError(error)) throw error
    return client.post(url, basePayload, representationConfig)
  }
}

export const patchWithColumnFallback = async (
  client,
  url,
  fullPayload,
  basePayload,
) => {
  try {
    return await client.patch(url, fullPayload, representationConfig)
  } catch (error) {
    if (!isMissingColumnError(error)) throw error
    return client.patch(url, basePayload, representationConfig)
  }
}
