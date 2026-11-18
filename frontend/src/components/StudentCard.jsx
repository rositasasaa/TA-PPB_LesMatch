import { ChevronRight, Clock, MapPin } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { getInitials } from '../utils/helpers'

export default function StudentCard({ student, onOpen }) {
  return (
    <button
      type="button"
      className="entity-card"
      onClick={() => onOpen(student.id)}
      aria-label={`Lihat detail ${student.nama}`}
    >
      <span className="entity-avatar">{getInitials(student.nama)}</span>

      <span className="entity-body">
        <span className="entity-top">
          <span className="entity-name">{student.nama}</span>
          <StatusBadge status={student.status} />
        </span>
        <span className="entity-sub">
          {student.kelas} · {student.mapel}
        </span>
        <span className="entity-meta">
          <Clock size={14} aria-hidden="true" />
          {student.hari}
        </span>
        <span className="entity-meta">
          <MapPin size={14} aria-hidden="true" />
          {student.alamat}
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
