const getTone = (status = '') => {
  const value = String(status).toLowerCase()
  if (value.includes('tolak') || value.includes('batal')) return 'danger'
  if (value.includes('terisi')) return 'neutral'
  if (value.includes('menunggu') || value.includes('diajukan')) return 'warning'
  if (value.includes('disetujui') || value.includes('selesai')) return 'info'
  if (value.includes('tersedia')) return 'success'
  return 'neutral'
}

export default function StatusBadge({ status = 'Tersedia' }) {
  return (
    <span className={`status status--${getTone(status)}`}>
      <span className="status-dot" aria-hidden="true" />
      {status}
    </span>
  )
}
