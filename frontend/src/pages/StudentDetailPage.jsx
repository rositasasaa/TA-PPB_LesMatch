import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  GraduationCap,
  Info,
  Loader2,
  MapPin,
  MessageSquare,
  Pencil,
  Send,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAppData } from '../context/appDataContext'
import {
  GENDER_OPTIONS,
  getInitials,
  isStudentAvailable,
  isSubmissionApproved,
  isSubmissionPending,
  isSubmissionRejected,
  tutorMatchesGender,
  tutorMatchesSubject,
} from '../utils/helpers'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import StatusBadge from '../components/StatusBadge'
import { DetailSkeleton } from '../components/Skeletons'

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
    submitApplication,
    updateStudent,
    deleteStudent,
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

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    nama: '',
    kelas: '',
    mapel: '',
    hari: '',
    alamat: '',
    status: 'Tersedia',
    preferensiGender: 'Bebas',
    requestKhusus: '',
  })
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const isSameStudent = (submission) => {
    if (!submission || !student) return false

    // A submission with an explicit student id belongs to that student only.
    // Falling back to the name is reserved for legacy rows without siswa_id so
    // two students with the same name never share an application.
    if (submission.siswaId !== null && submission.siswaId !== undefined) {
      return String(submission.siswaId) === String(student.id)
    }

    return (
      String(submission.namaSiswa || '').trim().toLowerCase() ===
      String(student.nama || '').trim().toLowerCase()
    )
  }

  const activeSubmission = submissions.find(
    (submission) =>
      isSameStudent(submission) &&
      (isSubmissionPending(submission) || isSubmissionApproved(submission)),
  )

  const rejectedSubmission = submissions.find(
    (submission) =>
      isSameStudent(submission) && isSubmissionRejected(submission),
  )

  const selectedTutor = tutors.find(
    (tutor) => String(tutor.id) === String(tutorId),
  )

  const sortedTutors = useMemo(() => {
    if (!student) return tutors

    const score = (tutor) => {
      let value = 0
      if (tutorMatchesSubject(tutor, student.mapel)) value += 2
      if (tutorMatchesGender(tutor, student.preferensiGender)) value += 1
      return value
    }

    return [...tutors].sort(
      (first, second) =>
        score(second) - score(first) ||
        String(first.nama).localeCompare(String(second.nama), 'id'),
    )
  }, [student, tutors])

  const isAvailable = student ? isStudentAvailable(student) : false

  const tutorMarker = (tutor) => {
    const subjectMatch = tutorMatchesSubject(tutor, student.mapel)
    const genderMatch = tutorMatchesGender(
      tutor,
      student.preferensiGender,
    )

    if (subjectMatch && genderMatch) return '✓ cocok'
    if (subjectMatch) return '• cek preferensi gender'
    if (genderMatch) return '• mapel belum cocok'
    return ''
  }

  const startEditing = () => {
    if (!student) return
    setEditForm({
      nama: student.nama || '',
      kelas: student.kelas || '',
      mapel: student.mapel || '',
      hari: student.hari || '',
      alamat: student.alamat || '',
      status: isAvailable ? 'Tersedia' : student.status || 'Sudah Terisi',
      preferensiGender: student.preferensiGender || 'Bebas',
      requestKhusus: student.requestKhusus || '',
    })
    setEditError('')
    setEditSuccess('')
    setIsEditing(true)
  }

  const handleEditChange = (field) => (event) => {
    setEditForm((prev) => ({ ...prev, [field]: event.target.value }))
    if (editError) setEditError('')
  }

  const handleSaveEdit = async (event) => {
    event.preventDefault()
    if (
      !editForm.nama.trim() ||
      !editForm.kelas.trim() ||
      !editForm.mapel.trim() ||
      !editForm.hari.trim() ||
      !editForm.alamat.trim()
    ) {
      setEditError('Semua kolom wajib diisi sebelum menyimpan perubahan.')
      return
    }

    try {
      setSavingEdit(true)
      setEditError('')
      await updateStudent(student.id, {
        nama: editForm.nama.trim(),
        kelas: editForm.kelas.trim(),
        mapel: editForm.mapel.trim(),
        hari: editForm.hari.trim(),
        alamat: editForm.alamat.trim(),
        status: editForm.status,
        preferensiGender: editForm.preferensiGender,
        requestKhusus: editForm.requestKhusus.trim(),
      })
      setIsEditing(false)
      setEditSuccess('Data siswa berhasil diperbarui.')
      window.setTimeout(() => setEditSuccess(''), 3500)
    } catch (err) {
      setEditError(err?.message || 'Gagal memperbarui data siswa.')
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDelete = async () => {
    if (!student) return

    try {
      setDeleting(true)
      setDeleteError('')
      await deleteStudent(student.id)
      setShowDeleteDialog(false)
      onBack()
    } catch (err) {
      setShowDeleteDialog(false)
      setDeleteError(err?.message || 'Gagal menghapus data siswa.')
    } finally {
      setDeleting(false)
    }
  }

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
    {
      icon: UserRound,
      label: 'Preferensi gender tentor',
      value: student.preferensiGender || 'Bebas',
    },
  ]

  return (
    <div className="page">
      <div className="detail-toolbar">
        <button type="button" className="back-link" onClick={onBack}>
          <ArrowLeft size={17} /> Kembali ke daftar siswa
        </button>

        <div className="detail-toolbar-actions">
          {!isEditing && (
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={startEditing}
            >
              <Pencil size={15} aria-hidden="true" /> Edit siswa
            </button>
          )}
          <button
            type="button"
            className="btn btn--outline btn--sm btn--danger-text"
            onClick={() => {
              setDeleteError('')
              setShowDeleteDialog(true)
            }}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 size={15} className="spin" aria-hidden="true" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 size={15} aria-hidden="true" /> Hapus
              </>
            )}
          </button>
        </div>
      </div>

      {editSuccess && (
        <div className="notice notice--success" role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          <div>
            <strong>Data diperbarui</strong>
            <p>{editSuccess}</p>
          </div>
        </div>
      )}

      {deleteError && (
        <div className="notice notice--danger" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <div>
            <strong>Gagal menghapus siswa</strong>
            <p>{deleteError}</p>
          </div>
        </div>
      )}

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
            <span className="tag tag--accent">
              <UserRound size={14} aria-hidden="true" />
              Preferensi {student.preferensiGender || 'Bebas'}
            </span>
          </div>
        </div>
      </section>

      <div className="detail-grid">
        <section className="panel">
          <div className="panel-head">
            <span className="panel-icon">
              {isEditing ? (
                <Pencil size={18} aria-hidden="true" />
              ) : (
                <Info size={18} aria-hidden="true" />
              )}
            </span>
            <div>
              <h2>
                {isEditing ? 'Edit informasi siswa' : 'Informasi siswa'}
              </h2>
              <p>
                {isEditing
                  ? 'Perbarui data, preferensi gender, atau request khusus siswa.'
                  : 'Tinjau kebutuhan belajar sebelum mengajukan.'}
              </p>
            </div>
          </div>

          {isEditing ? (
            <form className="form" onSubmit={handleSaveEdit}>
              <div className="form-grid">
                <label className="field field--full">
                  <span>Nama siswa</span>
                  <input
                    type="text"
                    className="input"
                    value={editForm.nama}
                    onChange={handleEditChange('nama')}
                  />
                </label>

                <label className="field">
                  <span>Jenjang / kelas</span>
                  <input
                    type="text"
                    className="input"
                    value={editForm.kelas}
                    onChange={handleEditChange('kelas')}
                  />
                </label>

                <label className="field">
                  <span>Mata pelajaran</span>
                  <input
                    type="text"
                    className="input"
                    value={editForm.mapel}
                    onChange={handleEditChange('mapel')}
                  />
                </label>

                <label className="field">
                  <span>Jadwal belajar</span>
                  <input
                    type="text"
                    className="input"
                    value={editForm.hari}
                    onChange={handleEditChange('hari')}
                  />
                </label>

                <label className="field">
                  <span>Status siswa</span>
                  <select
                    className="select"
                    value={editForm.status}
                    onChange={handleEditChange('status')}
                  >
                    <option value="Tersedia">Tersedia</option>
                    <option value="Sudah Terisi">Sudah Terisi</option>
                    <option value="Sedang Diajukan">Sedang Diajukan</option>
                  </select>
                </label>

                <label className="field">
                  <span>Preferensi gender tentor</span>
                  <select
                    className="select"
                    value={editForm.preferensiGender}
                    onChange={handleEditChange('preferensiGender')}
                  >
                    {GENDER_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field field--full">
                  <span>Lokasi belajar</span>
                  <input
                    type="text"
                    className="input"
                    value={editForm.alamat}
                    onChange={handleEditChange('alamat')}
                  />
                </label>

                <label className="field field--full">
                  <span>
                    Request khusus siswa <em>(opsional)</em>
                  </span>
                  <textarea
                    className="textarea"
                    rows={3}
                    maxLength={500}
                    value={editForm.requestKhusus}
                    onChange={handleEditChange('requestKhusus')}
                    placeholder="Contoh: Tentor berhijab, tegas/disiplin, atau santai dan komunikatif."
                  />
                  <span className="field-hint">
                    {editForm.requestKhusus.length}/500 karakter
                  </span>
                </label>
              </div>

              {editError && (
                <p className="form-error" role="alert">
                  <AlertCircle size={16} aria-hidden="true" />
                  {editError}
                </p>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => {
                    setIsEditing(false)
                    setEditError('')
                  }}
                >
                  <X size={16} aria-hidden="true" /> Batal
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={savingEdit}
                >
                  {savingEdit ? (
                    <>
                      <Loader2 size={16} className="spin" aria-hidden="true" />{' '}
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check size={16} aria-hidden="true" /> Simpan perubahan
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <>
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

              <div
                className={`request-card ${
                  student.requestKhusus ? '' : 'request-card--empty'
                }`}
              >
                <span className="request-card-icon">
                  <MessageSquare size={19} aria-hidden="true" />
                </span>
                <div>
                  <span className="info-label">Request khusus siswa</span>
                  <p className="request-card-text">
                    {student.requestKhusus ||
                      'Tidak ada request khusus. Gunakan catatan pengajuan untuk kebutuhan tambahan.'}
                  </p>
                </div>
              </div>

              <div className="info-callout">
                <Info size={18} aria-hidden="true" />
                <p>
                  Pastikan jarak, jadwal, preferensi gender, dan request khusus
                  siswa sesuai dengan ketersediaan tentor sebelum mengirim
                  pengajuan ke HRD.
                </p>
              </div>
            </>
          )}
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

          {activeSubmission ? (
            <div className="notice notice--success">
              <CheckCircle2 size={20} aria-hidden="true" />
              <div>
                <strong>Pengajuan sudah dibuat</strong>
                <p>
                  Status saat ini:{' '}
                  <StatusBadge status={activeSubmission.status} />
                </p>
                {createdSubmission && (
                  <p className="notice-detail">
                    Pengajuan tersimpan dan menunggu konfirmasi HRD. Status
                    siswa dan beban tentor akan diperbarui otomatis.
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
                  Pengajuan baru hanya tersedia untuk siswa berstatus Tersedia.
                </p>
              </div>
            </div>
          ) : (
            <>
              {rejectedSubmission && (
                <div className="notice notice--warning">
                  <AlertCircle size={18} aria-hidden="true" />
                  <div>
                    <strong>Pengajuan sebelumnya ditolak</strong>
                    <p>
                      Siswa kembali berstatus Tersedia. Anda dapat mengajukan
                      tentor lain melalui form di bawah.
                    </p>
                  </div>
                </div>
              )}

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
                        {tutor.nama} — {tutor.keahlian} ({tutor.gender || 'Bebas'}){' '}
                        {tutorMarker(tutor)}
                      </option>
                    ))}
                  </select>
                  <span className="field-hint">
                    Preferensi gender siswa: {student.preferensiGender || 'Bebas'}
                  </span>
                </label>

                {selectedTutor &&
                  !tutorMatchesGender(
                    selectedTutor,
                    student.preferensiGender,
                  ) && (
                    <div className="notice notice--warning notice--compact">
                      <AlertCircle size={17} aria-hidden="true" />
                      <p>
                        Gender {selectedTutor.nama} belum sesuai preferensi
                        siswa. Pastikan hal ini sudah dikonfirmasi ke orang tua.
                      </p>
                    </div>
                  )}

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
                  <span className="field-hint">
                    {note.length}/300 karakter
                  </span>
                </label>

                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(event) => setConfirmed(event.target.checked)}
                  />
                  <span>
                    Saya sudah meninjau lokasi, jadwal, preferensi gender, dan
                    request khusus siswa ini.
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
            </>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        title={`Hapus siswa ${student.nama}?`}
        message="Data siswa akan dihapus dari daftar. Riwayat pengajuan yang sudah ada tetap tersimpan, tetapi siswa tidak lagi muncul di halaman siswa. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus siswa"
        tone="danger"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleting) setShowDeleteDialog(false)
        }}
      />
    </div>
  )
}
