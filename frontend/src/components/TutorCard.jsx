import { ChevronRight, GraduationCap, MapPin, Sparkles } from 'lucide-react'
import { getInitials } from '../utils/helpers'

export default function TutorCard({ tutor, matchCount = 0, onOpen }) {
  return (
    <button
      type="button"
      className="entity-card entity-card--tutor"
      onClick={() => onOpen(tutor.id)}
      aria-label={`Lihat detail ${tutor.nama}`}
    >
      <span className="entity-avatar entity-avatar--tutor">
        {getInitials(tutor.nama)}
      </span>

      <span className="entity-body">
        <span className="entity-top">
          <span className="entity-name">{tutor.nama}</span>
          {matchCount > 0 && (
            <span className="match-chip">
              <Sparkles size={12} aria-hidden="true" />
              {matchCount} cocok
            </span>
          )}
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
      </span>

      <ChevronRight
        className="entity-chevron"
        size={18}
        aria-hidden="true"
      />
    </button>
  )
}
