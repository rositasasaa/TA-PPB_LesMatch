import { Download, Wifi, WifiOff } from 'lucide-react'

export default function AppHeader({
  online,
  canInstall,
  onInstall,
  onHome,
}) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <button
          type="button"
          className="brand"
          onClick={onHome}
          aria-label="Kembali ke daftar siswa"
        >
          <img
            src="/logo.svg"
            alt=""
            className="brand-mark"
            width="38"
            height="38"
          />
          <span className="brand-copy">
            <span className="brand-name">LesMatch</span>
            <span className="brand-tagline">Distribusi Siswa Les</span>
          </span>
        </button>

        <div className="header-actions">
          <span
            className={`connection-chip ${
              online
                ? 'connection-chip--online'
                : 'connection-chip--offline'
            }`}
            title={online ? 'Terhubung ke internet' : 'Mode offline'}
          >
            {online ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span>{online ? 'Online' : 'Offline'}</span>
          </span>

          {canInstall && (
            <button
              type="button"
              className="icon-btn icon-btn--dark"
              onClick={onInstall}
              title="Pasang aplikasi LesMatch"
              aria-label="Pasang aplikasi LesMatch"
            >
              <Download size={17} />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
