import {
  ClipboardList,
  GraduationCap,
  UserRound,
  Users,
} from 'lucide-react'
import { useAppData } from '../context/appDataContext'

const TABS = [
  { id: 'students', label: 'Siswa', Icon: Users },
  { id: 'tutors', label: 'Tentor', Icon: GraduationCap },
  { id: 'submissions', label: 'Pengajuan', Icon: ClipboardList },
  { id: 'profile', label: 'Profil', Icon: UserRound },
]

export default function BottomNav({ active, onNavigate }) {
  const { stats } = useAppData()

  return (
    <nav className="bottom-nav" aria-label="Navigasi utama">
      {TABS.map(({ id, label, Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            type="button"
            className={`nav-item ${isActive ? 'nav-item--active' : ''}`}
            onClick={() => onNavigate(id)}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="nav-icon">
              <Icon size={21} strokeWidth={2.1} aria-hidden="true" />
              {id === 'submissions' && stats.pending > 0 && (
                <span className="nav-badge" aria-label={`${stats.pending} pengajuan menunggu`}>
                  {stats.pending > 9 ? '9+' : stats.pending}
                </span>
              )}
            </span>
            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
