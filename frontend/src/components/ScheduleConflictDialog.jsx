import {
  AlertTriangle,
  CalendarDays,
  CalendarX2,
  Clock,
  UserRound,
  X,
} from 'lucide-react'
import { useEffect, useRef } from 'react'

export default function ScheduleConflictDialog({
  open,
  conflict,
  tutorName,
  closeLabel = 'Tutup',
  onClose,
}) {
  const actionRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const timer = window.setTimeout(() => actionRef.current?.focus(), 40)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      window.clearTimeout(timer)
    }
  }, [onClose, open])

  if (!open) return null

  const tutor =
    String(tutorName || conflict?.tutorName || '').trim() || 'Tentor ini'
  const studentName = conflict?.studentName || 'Siswa aktif'
  const studentSchedule = conflict?.studentSchedule || '-'
  const targetSchedule = conflict?.targetSchedule || '-'
  const overlapLabel = conflict?.overlapLabel || ''

  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="dialog dialog--conflict"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-conflict-title"
        aria-describedby="schedule-conflict-message"
      >
        <button
          type="button"
          className="dialog-close"
          onClick={onClose}
          aria-label="Tutup peringatan jadwal"
        >
          <X size={17} aria-hidden="true" />
        </button>

        <span className="dialog-icon dialog-icon--warning">
          <CalendarX2 size={20} aria-hidden="true" />
        </span>

        <div className="dialog-copy">
          <span className="eyebrow">Jadwal bentrok</span>
          <h2 id="schedule-conflict-title">Jadwal {tutor} bentrok</h2>
          <p id="schedule-conflict-message">
            <strong>{tutor}</strong> sudah memiliki siswa aktif pada hari dan
            jam yang bertabrakan dengan jadwal ini. Sistem memblokir tindakan
            tersebut agar tidak terjadi jadwal ganda.
          </p>
        </div>

        <div className="conflict-card">
          <div className="conflict-row">
            <span className="conflict-label">
              <UserRound size={14} aria-hidden="true" />
              Siswa aktif
            </span>
            <strong>{studentName}</strong>
          </div>

          <div className="conflict-row">
            <span className="conflict-label">
              <CalendarDays size={14} aria-hidden="true" />
              Jadwal aktif
            </span>
            <strong>{studentSchedule}</strong>
          </div>

          <div className="conflict-row">
            <span className="conflict-label">
              <Clock size={14} aria-hidden="true" />
              Jadwal diajukan
            </span>
            <strong>{targetSchedule}</strong>
          </div>

          {overlapLabel && (
            <div className="conflict-row conflict-row--overlap">
              <span className="conflict-label">
                <AlertTriangle size={14} aria-hidden="true" />
                Tumpang tindih
              </span>
              <strong>{overlapLabel}</strong>
            </div>
          )}
        </div>

        <div className="dialog-actions">
          <button
            ref={actionRef}
            type="button"
            className="btn btn--primary"
            onClick={onClose}
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
