import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  GraduationCap,
  Info,
  Loader2,
  MapPin,
  Send,
  UserRound,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAppData } from '../context/appDataContext'
import { getInitials, tutorMatchesSubject } from '../utils/helpers'
import DataSourceBadge from '../components/DataSourceBadge'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import { DetailSkeleton } from '../components/Skeletons'

const sourceLabel = {
  supabase: 'Supabase',
  express: 'API Express',
  local: 'penyimpanan lokal perangkat',
}

export default function StudentDetailPage({
  studentId,
  preselectedTutorId,
  onBack,
  onOpenSubmissions,
}) {
  const {
    students,
    tutors,
    submissions,
    loading,
    source,
    submitApplication,
  } = useAppData()

  const student = students.find(
    (item) => String(item.id) === String(studentId),
  )
  const [tutorId, setTutorId] = useState(
    preselectedTutorId ? String(preselectedTutorId) : '',
  )
  const [note, setNote] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [createdSubmission, setCreatedSubmission] = useState(null)

  const alreadySubmitted = submissions.find(
    (submission) => String(submission.siswaId) === String(studentId),
  )

  const selectedTutor = tutors.find(
    (tutor) => String(tutor.id) === String(tutorId),
  )

  const sortedTutors = useMemo(() => {
    if (!student) return tutors
    return [...tutors].sort(
      (first, second) =>
        Number(tutorMatchesSubject(second, student.mapel)) -
        Number(tutorMatchesSubject(first, student.mapel)),
    )
  }, [student, tutors])

  const isAvailable = student
    ? String(student.status).toLowerCase().includes('tersedia')
    : false

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')

    if (!selectedTutor) {
      setFormError('Pilih tentor yang akan mengajar terlebih dahulu.')
      return
    }
    if (!confirmed) {
      setFormError('Centang konfirmasi setelah meninjau jadwal dan lokasi.')
      return
    }

    try {
      setSubmitting(true)
      const result = await submitApplication({
        siswaId: student.id,
        namaSiswa: student.nama,
        mapel: student.mapel,
        namaTentor: selectedTutor.nama,
        catatan: note.trim(),
      })
      setCreatedSubmission(result)
      setNote('')
      setConfirmed(false)
    } catch (error) {
      setFormError(error?.message || 'Pengajuan gagal dikirim. Coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && !student) {
    return (
      <div className="page">
        <DetailSkeleton />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="page">
        <EmptyState
          icon={UserRound}
          title="Siswa tidak ditemukan"
          message="Data siswa mungkin sudah berubah atau tidak tersedia di sumber data saat ini."
          action={
            <button type="button" className="btn btn--primary" onClick={onBack}>
              <ArrowLeft size={16} /> Kembali ke daftar siswa
            </button>
          }
        />
      </div>
    )
  }

  const infoRows = [
    { icon: UserRound, label: 'Nama siswa', value: student.nama },
    { icon: GraduationCap, label: 'Jenjang / kelas', value: student.kelas },
    { icon: BookOpen, label: 'Mata pelajaran', value: student.mapel },
    { icon: Clock, label: 'Jadwal belajar', value: student.hari },
    { icon: MapPin, label: 'Lokasi belajar', value: student.alamat },
  ]

  return (
    <div className="page">
      <button type="button" className="back-link" onClick={onBack}>
        <ArrowLeft size={17} /> Kembali ke daftar siswa
      </button>

      <section className="detail-hero">
        <span className="avatar avatar--xl">{getInitials(student.nama)}</span>
        <div className="detail-hero-copy">
          <span className="eyebrow">Detail siswa</span>
          <h1>{student.nama}</h1>
          <p className="detail-sub">
            {student.kelas} · {student.mapel}
          </p>
          <div className="tag-row">
            <StatusBadge status={student.status} />
            <span className="tag">
              <CalendarDays size={14} aria-hidden="true" />
              {student.hari}
            </span>
            <span className="tag">
              <MapPin size={14} aria-hidden="true" />
              {student.alamat}
            </span>
          </div>
        </div>
        <DataSourceBadge source={source} />
      </section>

      <div className="detail-grid">
        <section className="panel">
          <div className="panel-head">
            <span className="panel-icon">
              <Info size={18} aria-hidden="true" />
            </span>
            <div>
              <h2>Informasi siswa</h2>
              <p>Tinjau kebutuhan belajar sebelum mengajukan.</p>
            </div>
          </div>

          <div className="info-list">
            {infoRows.map(({ icon: Icon, label, value }) => (
              <div className="info-row" key={label}>
                <span className="info-icon">
                  <Icon size={17} aria-hidden="true" />
                </span>
                <span className="info-copy">
                  <span className="info-label">{label}</span>
                  <span className="info-value">{value}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="info-callout">
            <Info size={18} aria-hidden="true" />
            <p>
              Pastikan jarak, jadwal, dan kebutuhan siswa sesuai dengan
              ketersediaan Anda sebelum mengirim pengajuan ke HRD.
            </p>
          </div>
        </section>

        <aside className="panel application-panel">
          <div className="panel-head">
            <span className="panel-icon panel-icon--accent">
              <Send size={18} aria-hidden="true" />
            </span>
            <div>
              <h2>Ajukan ke HRD</h2>
              <p>Pengajuan diteruskan ke HRD atau Branch Manager.</p>
            </div>
          </div>

          {alreadySubmitted ? (
            <div className="notice notice--success">
              <CheckCircle2 size={20} aria-hidden="true" />
              <div>
                <strong>Pengajuan sudah dibuat</strong>
                <p>
                  Status saat ini: <StatusBadge status={alreadySubmitted.status} />
                </p>
                {createdSubmission && (
                  <p className="notice-detail">
                    Tersimpan di {sourceLabel[createdSubmission.source]}{' '}
                    dan menunggu konfirmasi HRD.
                  </p>
                )}
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={onOpenSubmissions}
                >
                  Lihat halaman pengajuan
                </button>
              </div>
            </div>
          ) : !isAvailable ? (
            <div className="notice notice--warning">
              <AlertCircle size={20} aria-hidden="true" />
              <div>
                <strong>Siswa belum dapat diajukan</strong>
                <p>
                  Status siswa saat ini <strong>{student.status}</strong>.
                  Pengajuan baru hanya tersedia untuk siswa berstatus
                  Tersedia.
                </p>
              </div>
            </div>
          ) : (
            <form className="form" onSubmit={handleSubmit}>
              <label className="field">
                <span>
                  Tentor pengajar <span className="req">*</span>
                </span>
                <select
                  className="select"
                  value={tutorId}
                  onChange={(event) => setTutorId(event.target.value)}
                  required
                >
                  <option value="">Pilih tentor...</option>
                  {sortedTutors.map((tutor) => (
                    <option key={tutor.id} value={tutor.id}>
                      {tutor.nama} — {tutor.keahlian}
                      {tutorMatchesSubject(tutor, student.mapel)
                        ? ' (cocok)'
                        : ''}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>
                  Catatan untuk HRD <em>(opsional)</em>
                </span>
                <textarea
                  className="textarea"
                  rows={3}
                  maxLength={300}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Contoh: Saya tersedia pada jadwal tersebut dan berdomisili dekat lokasi siswa."
                />
                <span className="field-hint">{note.length}/300 karakter</span>
              </label>

              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(event) => setConfirmed(event.target.checked)}
                />
                <span>
                  Saya sudah meninjau lokasi dan jadwal belajar siswa ini.
                </span>
              </label>

              {formError && (
                <p className="form-error" role="alert">
                  <AlertCircle size={16} aria-hidden="true" />
                  {formError}
                </p>
              )}

              <button
                type="submit"
                className="btn btn--primary btn--block"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="spin" aria-hidden="true" />
                    Mengirim pengajuan...
                  </>
                ) : (
                  <>
                    <Send size={17} aria-hidden="true" />
                    Kirim pengajuan
                  </>
                )}
              </button>

              <p className="form-note">
                Data yang dikirim: siswa, mata pelajaran, tentor, dan catatan
                Anda.
              </p>
            </form>
          )}
        </aside>
      </div>
    </div>
  )
}
