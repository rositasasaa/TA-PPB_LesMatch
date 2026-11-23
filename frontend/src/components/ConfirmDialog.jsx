import {
  AlertTriangle,
  Check,
  Loader2,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useRef } from 'react'

const ICONS = {
  danger: Trash2,
  warning: AlertTriangle,
  primary: Check,
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Lanjutkan',
  cancelLabel = 'Batal',
  tone = 'primary',
  busy = false,
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) onCancel()
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const timer = window.setTimeout(() => confirmRef.current?.focus(), 40)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      window.clearTimeout(timer)
    }
  }, [busy, onCancel, open])

  if (!open) return null

  const Icon = ICONS[tone] || Check

  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel()
      }}
    >
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <button
          type="button"
          className="dialog-close"
          onClick={onCancel}
          disabled={busy}
          aria-label="Tutup dialog"
        >
          <X size={17} aria-hidden="true" />
        </button>

        <span className={`dialog-icon dialog-icon--${tone}`}>
          <Icon size={20} aria-hidden="true" />
        </span>

        <div className="dialog-copy">
          <h2 id="confirm-dialog-title">{title}</h2>
          <p id="confirm-dialog-message">{message}</p>
        </div>

        <div className="dialog-actions">
          <button
            type="button"
            className="btn btn--outline"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={`btn ${
              tone === 'danger' ? 'btn--danger-solid' : 'btn--primary'
            }`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? (
              <Loader2 size={16} className="spin" aria-hidden="true" />
            ) : (
              <Icon size={16} aria-hidden="true" />
            )}
            {busy ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
