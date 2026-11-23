import {
  ClipboardList,
  Download,
  GraduationCap,
  UserRound,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { useAppData } from '../context/appDataContext'

const TABS = [
  { id: 'students', label: 'Siswa', Icon: Users },
  { id: 'tutors', label: 'Tentor', Icon: GraduationCap },
  { id: 'submissions', label: 'Pengajuan', Icon: ClipboardList },
  { id: 'profile', label: 'Profil', Icon: UserRound },
]

export default function AppHeader({
  active,
  onNavigate,
  online,
  canInstall,
  onInstall,
  onHome,
}) {
  const { stats } = useAppData()

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

        <nav className="top-nav" aria-label="Navigasi utama">
          {TABS.map(({ id, label, Icon }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                type="button"
                className={`top-nav-item ${
                  isActive ? 'top-nav-item--active' : ''
                }`}
                onClick={() => onNavigate(id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="top-nav-icon">
                  <Icon size={17} strokeWidth={2.1} aria-hidden="true" />
                  {id === 'submissions' && stats.pending > 0 && (
                    <span
                      className="top-nav-badge"
                      aria-label={`${stats.pending} pengajuan menunggu`}
                    >
                      {stats.pending > 9 ? '9+' : stats.pending}
                    </span>
                  )}
                </span>
                <span>{label}</span>
              </button>
            )
          })}
        </nav>

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
