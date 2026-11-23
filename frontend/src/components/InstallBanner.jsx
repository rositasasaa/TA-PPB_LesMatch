import { X } from 'lucide-react'
import { useState } from 'react'

const DISMISS_KEY = 'lesmatch_install_dismissed'

const readDismissed = () => {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

export default function InstallBanner({ canInstall, onInstall }) {
  const [dismissed, setDismissed] = useState(readDismissed)

  if (!canInstall || dismissed) return null

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // Ignore storage errors.
    }
    setDismissed(true)
  }

  return (
    <aside className="install-banner" aria-label="Pasang aplikasi">
      <span className="install-banner-icon">
        <img
          src="/icon-lesmatch.png"
          alt="LesMatch"
          className="install-banner-app-icon"
          width="24"
          height="24"
        />
      </span>
      <span className="install-banner-copy">
        <strong>Pasang LesMatch</strong>
        <span>Akses lebih cepat dan tetap terbuka saat offline.</span>
      </span>
      <button
        type="button"
        className="btn btn--primary btn--sm"
        onClick={onInstall}
      >
        Pasang
      </button>
      <button
        type="button"
        className="icon-btn"
        onClick={dismiss}
        aria-label="Tutup banner pasang aplikasi"
      >
        <X size={16} />
      </button>
    </aside>
  )
}
