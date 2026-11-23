import { Camera, Image as ImageIcon, Loader2, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { getInitials } from '../utils/helpers'

export default function PhotoUploadPicker({
  name = '',
  currentPhotoUrl = '',
  onPhotoSelected,
  onPhotoRemoved,
  uploading = false,
  disabled = false,
}) {
  const fileInputRef = useRef(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [hasError, setHasError] = useState(false)

  const activePhoto = previewUrl || currentPhotoUrl

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Silakan pilih file gambar yang valid (JPG, PNG, WebP).')
      return
    }

    // Create live preview
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setHasError(false)

    if (onPhotoSelected) {
      onPhotoSelected(file, objectUrl)
    }

    // Reset input so re-selecting same file triggers change
    event.target.value = ''
  }

  const handleRemove = () => {
    setPreviewUrl('')
    setHasError(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (onPhotoRemoved) {
      onPhotoRemoved()
    }
  }

  return (
    <div className="photo-picker-container">
      <span className="photo-picker-title">Foto Profil Tentor</span>
      <div className="photo-picker">
        <div
          className={`photo-picker-preview ${activePhoto && !hasError ? 'has-image' : ''}`}
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
          title="Klik untuk memilih foto"
        >
          {uploading ? (
            <div className="photo-picker-spinner">
              <Loader2 size={24} className="spin" />
            </div>
          ) : activePhoto && !hasError ? (
            <img
              src={activePhoto}
              alt={name || 'Preview foto'}
              className="photo-picker-img"
              onError={() => setHasError(true)}
            />
          ) : (
            <span className="photo-picker-initials">
              {name ? getInitials(name) : <Camera size={26} aria-hidden="true" />}
            </span>
          )}

          <div className="photo-picker-overlay" aria-hidden="true">
            <Camera size={16} />
          </div>
        </div>

        <div className="photo-picker-content">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled || uploading}
            style={{ display: 'none' }}
            id="tutor-photo-input"
          />

          <div className="photo-picker-actions">
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 size={14} className="spin" /> Mengunggah...
                </>
              ) : activePhoto && !hasError ? (
                <>
                  <Upload size={14} /> Ganti Foto
                </>
              ) : (
                <>
                  <ImageIcon size={14} /> Pilih Foto
                </>
              )}
            </button>

            {activePhoto && !uploading && (
              <button
                type="button"
                className="btn btn--ghost-danger btn--sm"
                onClick={handleRemove}
                disabled={disabled}
                title="Hapus foto profil"
              >
                <Trash2 size={14} /> Hapus
              </button>
            )}
          </div>

          <span className="photo-picker-hint">
            Format JPG, PNG, atau WebP. Foto akan tersimpan di Supabase Storage (bucket avatars).
          </span>
        </div>
      </div>
    </div>
  )
}
