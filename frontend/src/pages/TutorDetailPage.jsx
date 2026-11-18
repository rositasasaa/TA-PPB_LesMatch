import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  MapPin,
  Sparkles,
  Users,
} from 'lucide-react'
import { useMemo } from 'react'
import { useAppData } from '../context/appDataContext'
import { getInitials, tutorMatchesSubject } from '../utils/helpers'
import DataSourceBadge from '../components/DataSourceBadge'
import EmptyState from '../components/EmptyState'
import StudentCard from '../components/StudentCard'
import { DetailSkeleton } from '../components/Skeletons'

export default function TutorDetailPage({
  tutorId,
  onBack,
  onOpenStudent,
  onBrowseStudents,
}) {
  const { tutors, students, loading, source } = useAppData()

  const tutor = tutors.find((item) => String(item.id) === String(tutorId))

  const matchingStudents = useMemo(() => {
    if (!tutor) return []
    return students
      .filter((student) => tutorMatchesSubject(tutor, student.mapel))
      .sort((first, second) => {
        const firstAvailable = String(first.status)
          .toLowerCase()
          .includes('tersedia')
        const secondAvailable = String(second.status)
          .toLowerCase()
          .includes('tersedia')
        return Number(secondAvailable) - Number(firstAvailable)
      })
  }, [students, tutor])

  const availableCount = matchingStudents.filter((student) =>
    String(student.status).toLowerCase().includes('tersedia'),
  ).length

  if (loading && !tutor) {
    return (
      <div className="page">
        <DetailSkeleton />
      </div>
    )
  }

  if (!tutor) {
    return (
      <div className="page">
        <EmptyState
          icon={GraduationCap}
          title="Tentor tidak ditemukan"
          message="Data tentor mungkin sudah berubah atau tidak tersedia di sumber data saat ini."
          action={
            <button type="button" className="btn btn--primary" onClick={onBack}>
              <ArrowLeft size={16} /> Kembali ke daftar tentor
            </button>
          }
        />
      </div>
    )
  }

  return (
    <div className="page">
      <button type="button" className="back-link" onClick={onBack}>
        <ArrowLeft size={17} /> Kembali ke daftar tentor
      </button>

      <section className="detail-hero">
        <span className="avatar avatar--xl avatar--tutor">
          {getInitials(tutor.nama)}
        </span>
        <div className="detail-hero-copy">
          <span className="eyebrow">Profil tentor</span>
          <h1>{tutor.nama}</h1>
          <p className="detail-sub">{tutor.keahlian}</p>
          <div className="tag-row">
            <span className="tag">
              <MapPin size={14} aria-hidden="true" />
              {tutor.domisili}
            </span>
            <span className="tag">
              <GraduationCap size={14} aria-hidden="true" />
              {tutor.pengalaman}
            </span>
            <span className="tag tag--accent">
              <Users size={14} aria-hidden="true" />
              {availableCount} siswa tersedia
            </span>
          </div>
        </div>
        <DataSourceBadge source={source} />
      </section>

      <div className="detail-grid detail-grid--wide-main">
        <section className="panel">
          <div className="panel-head">
            <span className="panel-icon">
              <Sparkles size={18} aria-hidden="true" />
            </span>
            <div>
              <h2>Keahlian &amp; pengalaman</h2>
              <p>Ringkasan profil tentor LesMatch.</p>
            </div>
          </div>

          <div className="info-list">
            <div className="info-row">
              <span className="info-icon">
                <BookOpen size={17} aria-hidden="true" />
              </span>
              <span className="info-copy">
                <span className="info-label">Bidang keahlian</span>
                <span className="info-value">{tutor.keahlian}</span>
              </span>
            </div>
            <div className="info-row">
              <span className="info-icon">
                <MapPin size={17} aria-hidden="true" />
              </span>
              <span className="info-copy">
                <span className="info-label">Domisili</span>
                <span className="info-value">{tutor.domisili}</span>
              </span>
            </div>
            <div className="info-row">
              <span className="info-icon">
                <GraduationCap size={17} aria-hidden="true" />
              </span>
              <span className="info-copy">
                <span className="info-label">Pengalaman mengajar</span>
                <span className="info-value">{tutor.pengalaman}</span>
              </span>
            </div>
          </div>

          <div className="info-callout">
            <Users size={18} aria-hidden="true" />
            <p>
              Buka salah satu siswa di bawah untuk melihat detail lengkap dan
              mengirim pengajuan dengan tentor ini sebagai pengajar.
            </p>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <span className="panel-icon panel-icon--accent">
              <Users size={18} aria-hidden="true" />
            </span>
            <div>
              <h2>Siswa yang cocok</h2>
              <p>Disaring otomatis dari bidang keahlian tentor.</p>
            </div>
          </div>

          {matchingStudents.length > 0 ? (
            <div className="entity-list">
              {matchingStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onOpen={(id) => onOpenStudent(id, tutor.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="Belum ada siswa yang cocok"
              message="Saat ini belum ada siswa dengan mata pelajaran yang sesuai dengan keahlian tentor ini."
              action={
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={onBrowseStudents}
                >
                  Jelajahi semua siswa
                </button>
              }
            />
          )}
        </section>
      </div>
    </div>
  )
}
