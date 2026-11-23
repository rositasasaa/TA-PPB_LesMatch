import {
  ClipboardList,
  GraduationCap,
  UserRound,
  Users,
} from 'lucide-react'

const LINKS = [
  { id: 'students', label: 'Siswa', Icon: Users },
  { id: 'tutors', label: 'Tentor', Icon: GraduationCap },
  { id: 'submissions', label: 'Pengajuan', Icon: ClipboardList },
  { id: 'profile', label: 'Profil', Icon: UserRound },
]

export default function Footer({ onNavigate }) {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img
            src="/icon-lesmatch.png"
            alt="LesMatch"
            className="footer-mark object-contain"
            width="42"
            height="42"
          />
          <div className="footer-brand-copy">
            <strong className="brand-wordmark" style={{ fontSize: '20px' }}>
              <span className="brand-wordmark-indigo">Les</span>
              <span className="brand-wordmark-navy">Match</span>
            </strong>
            <p>
              Sistem Distribusi Siswa &amp; Manajemen Tentor Les Privat
            </p>
          </div>
        </div>

        <nav className="footer-nav" aria-label="Navigasi cepat">
          <span className="footer-heading">Navigasi cepat</span>
          {LINKS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              className="footer-nav-btn"
              onClick={() => onNavigate(id)}
            >
              <Icon size={15} aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>

        <div className="footer-meta">
          <span className="footer-heading">Tentang aplikasi</span>
          <p className="footer-tagline">
            Satu alur untuk siswa, tentor, dan HRD.
          </p>
          <div className="footer-tech">
            <span>Wilayah Semarang</span>
            <span>Mode Offline Siap</span>
            <span>v1.0</span>
          </div>
          <p className="footer-copyright">
            © 2026 LesMatch. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </div>
    </footer>
  )
}
