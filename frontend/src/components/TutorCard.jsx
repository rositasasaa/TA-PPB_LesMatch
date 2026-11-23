import {
  ChevronRight,
  GraduationCap,
  MapPin,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { getInitials } from '../utils/helpers'

export default function TutorCard({
  tutor,
  matchCount = 0,
  workload,
  onOpen,
}) {
  const [imgError, setImgError] = useState(false)
  const loadCount = workload?.count || 0
  const showPhoto = Boolean(tutor.foto_url && !imgError)

  return (
    <button
      type="button"
      className="entity-card entity-card--tutor"
      onClick={() => onOpen(tutor.id)}
      aria-label={`Lihat detail ${tutor.nama}`}
    >
      <span
        className={`entity-avatar entity-avatar--tutor ${
          showPhoto ? 'has-photo' : ''
        }`}
      >
        {showPhoto ? (
          <img
            src={tutor.foto_url}
            alt={tutor.nama}
            className="avatar-img"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          getInitials(tutor.nama)
        )}
      </span>

      <span className="entity-body">
        <span className="entity-top">
          <span className="entity-name">{tutor.nama}</span>
          <span className="entity-badges">
            <span
              className={`match-chip ${
                matchCount > 0 ? '' : 'match-chip--empty'
              }`}
            >
              <Sparkles size={12} aria-hidden="true" />
              {matchCount > 0 ? `${matchCount} siswa cocok` : 'Belum ada siswa cocok'}
            </span>
          </span>
        </span>
        <span className="entity-sub">{tutor.keahlian}</span>
        <span className="entity-meta">
          <MapPin size={14} aria-hidden="true" />
          {tutor.domisili}
        </span>
        <span className="entity-meta">
          <GraduationCap size={14} aria-hidden="true" />
          {tutor.pengalaman}
        </span>
        <span className="entity-meta">
          <UserRound size={14} aria-hidden="true" />
          Gender {tutor.gender || 'Bebas'}
        </span>
        <span
          className={`load-chip ${loadCount > 0 ? 'load-chip--active' : ''}`}
        >
          <Users size={13} aria-hidden="true" />
          {loadCount > 0
            ? `Memegang ${loadCount} siswa aktif`
            : 'Belum memegang siswa'}
        </span>
      </span>

      <ChevronRight
        className="entity-chevron"
        size={18}
        aria-hidden="true"
      />
    </button>
  )
}
