import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Loader2,
  MapPin,
  Pencil,
  Sparkles,
  Trash2,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAppData } from '../context/appDataContext'
import {
  GENDER_OPTIONS,
  getInitials,
  getTutorWorkload,
  tutorMatchesSubject,
} from '../utils/helpers'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import StudentCard from '../components/StudentCard'
import { DetailSkeleton } from '../components/Skeletons'

const EMPTY_FORM = {
  nama: '',
  keahlian: '',
  domisili: '',
  pengalaman: '',
  gender: 'Bebas',
}

export default function TutorDetailPage({
  tutorId,
  onBack,
  onOpenStudent,
  onBrowseStudents,
}) {
  const {
    tutors,
    students,
    submissions,
    loading,
    updateTutor,
    deleteTutor,
  } = useAppData()

  const tutor = tutors.find((item) => String(item.id) === String(tutorId))

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState(EMPTY_FORM)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Reaktif terhadap siswa baru, perubahan status, dan approval HRD.
  const matchingStudents = useMemo(() => {
    if (!tutor) return []
    return students
      .filter((student) => tutorMatchesSubject(tutor, student))
      .sort((first, second) =>
        String(first.nama).localeCompare(String(second.nama), 'id'),
      )
  }, [students, tutor])

  const workload = useMemo(
    () => getTutorWorkload(tutor, students, submissions),
    [students, submissions, tutor],
  )

  const startEditing = () => {
    if (!tutor) return
    setEditForm({
      nama: tutor.nama || '',
      keahlian: tutor.keahlian || '',
      domisili: tutor.domisili || '',
      pengalaman: tutor.pengalaman || '',
      gender: tutor.gender || 'Bebas',
    })
    setEditError('')
    setEditSuccess('')
    setIsEditing(true)
  }

  const handleEditChange = (field) => (event) => {
    setEditForm((previous) => ({ ...previous, [field]: event.target.value }))
    if (editError) setEditError('')
  }

  const handleSaveEdit = async (event) => {
    event.preventDefault()

    if (
      !editForm.nama.trim() ||
      !editForm.keahlian.trim() ||
      !editForm.domisili.trim() ||
      !editForm.pengalaman.trim()
    ) {
      setEditError('Semua kolom wajib diisi sebelum menyimpan perubahan.')
      return
    }

    try {
      setSavingEdit(true)
      setEditError('')
      await updateTutor(tutor.id, {
        nama: editForm.nama.trim(),
        keahlian: editForm.keahlian.trim(),
        domisili: editForm.domisili.trim(),
        pengalaman: editForm.pengalaman.trim(),
        gender: editForm.gender,
      })
      setIsEditing(false)
      setEditSuccess('Profil tentor berhasil diperbarui.')
      window.setTimeout(() => setEditSuccess(''), 3500)
    } catch (err) {
      setEditError(err?.message || 'Gagal memperbarui profil tentor.')
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDelete = async () => {
    if (!tutor) return

    try {
      setDeleting(true)
      setDeleteError('')
      await deleteTutor(tutor.id)
      setShowDeleteDialog(false)
      onBack()
    } catch (err) {
      setShowDeleteDialog(false)
      setDeleteError(err?.message || 'Gagal menghapus data tentor.')
    } finally {
      setDeleting(false)
    }
  }

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
      <div className="detail-toolbar">
        <button type="button" className="back-link" onClick={onBack}>
          <ArrowLeft size={17} /> Kembali ke daftar tentor
        </button>

        <div className="detail-toolbar-actions">
          {!isEditing && (
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={startEditing}
            >
              <Pencil size={15} aria-hidden="true" /> Edit tentor
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
            <strong>Gagal menghapus tentor</strong>
            <p>{deleteError}</p>
          </div>
        </div>
      )}

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
            <span className="tag">
              <UserRound size={14} aria-hidden="true" />
              Gender {tutor.gender || 'Bebas'}
            </span>
            <span className="tag tag--accent">
              <Sparkles size={14} aria-hidden="true" />
              {matchingStudents.length} siswa cocok
            </span>
            <span className="tag tag--load">
              <Users size={14} aria-hidden="true" />
              Memegang {workload.count} siswa aktif
            </span>
          </div>
        </div>
      </section>

      <div className="detail-grid detail-grid--wide-main">
        <section className="panel">
          <div className="panel-head">
            <span className="panel-icon">
              {isEditing ? (
                <Pencil size={18} aria-hidden="true" />
              ) : (
                <BookOpen size={18} aria-hidden="true" />
              )}
            </span>
            <div>
              <h2>
                {isEditing ? 'Edit profil tentor' : 'Keahlian & pengalaman'}
              </h2>
              <p>
                {isEditing
                  ? 'Perbarui data tentor agar pencocokan siswa tetap akurat.'
                  : 'Ringkasan profil tentor LesMatch.'}
              </p>
            </div>
          </div>

          {isEditing ? (
            <form className="form" onSubmit={handleSaveEdit}>
              <div className="form-grid">
                <label className="field field--full">
                  <span>Nama tentor</span>
                  <input
                    type="text"
                    className="input"
                    value={editForm.nama}
                    onChange={handleEditChange('nama')}
                  />
                </label>

                <label className="field">
                  <span>Keahlian mapel</span>
                  <input
                    type="text"
                    className="input"
                    value={editForm.keahlian}
                    onChange={handleEditChange('keahlian')}
                    placeholder="Contoh: Matematika & Fisika"
                  />
                </label>

                <label className="field">
                  <span>Domisili</span>
                  <input
                    type="text"
                    className="input"
                    value={editForm.domisili}
                    onChange={handleEditChange('domisili')}
                  />
                </label>

                <label className="field">
                  <span>Pengalaman mengajar</span>
                  <input
                    type="text"
                    className="input"
                    value={editForm.pengalaman}
                    onChange={handleEditChange('pengalaman')}
                  />
                </label>

                <label className="field">
                  <span>Gender tentor</span>
                  <select
                    className="select"
                    value={editForm.gender}
                    onChange={handleEditChange('gender')}
                  >
                    {GENDER_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
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
                <div className="info-row">
                  <span className="info-icon">
                    <UserRound size={17} aria-hidden="true" />
                  </span>
                  <span className="info-copy">
                    <span className="info-label">Gender tentor</span>
                    <span className="info-value">
                      {tutor.gender || 'Bebas'}
                    </span>
                  </span>
                </div>
              </div>

              <div className="info-callout">
                <Users size={18} aria-hidden="true" />
                <p>
                  Buka salah satu siswa di bawah untuk melihat detail lengkap
                  dan mengirim pengajuan dengan tentor ini sebagai pengajar.
                </p>
              </div>
            </>
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <span className="panel-icon panel-icon--accent">
              <Sparkles size={18} aria-hidden="true" />
            </span>
            <div>
              <h2>Siswa yang cocok</h2>
              <p>
                Disaring dari keahlian, status tersedia, dan preferensi gender
                siswa.
              </p>
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
              message="Saat ini belum ada siswa tersedia dengan mata pelajaran dan preferensi gender yang sesuai dengan tentor ini."
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

      <section className="panel">
        <div className="panel-head">
          <span className="panel-icon panel-icon--accent">
            <Users size={18} aria-hidden="true" />
          </span>
          <div>
            <h2>Beban mengajar</h2>
            <p>
              Daftar siswa aktif yang sedang dipegang tentor ini berdasarkan
              pengajuan yang disetujui HRD.
            </p>
          </div>
        </div>

        {workload.count > 0 ? (
          <div className="load-list">
            {workload.students.map((student) => (
              <button
                key={student.id || student.nama}
                type="button"
                className="load-item"
                onClick={() =>
                  student.id && onOpenStudent(student.id, tutor.id)
                }
              >
                <span className="load-avatar">
                  {getInitials(student.nama)}
                </span>
                <span className="load-copy">
                  <strong>{student.nama}</strong>
                  <span>Siswa aktif · diajar oleh {tutor.nama}</span>
                </span>
                <ChevronRight size={17} aria-hidden="true" />
              </button>
            ))}
          </div>
        ) : (
          <div className="load-empty">
            <Users size={22} aria-hidden="true" />
            <p>
              Belum ada siswa aktif. Beban mengajar akan bertambah otomatis
              setelah pengajuan tentor ini disetujui HRD.
            </p>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={showDeleteDialog}
        title={`Hapus tentor ${tutor.nama}?`}
        message={
          workload.count > 0
            ? `Tentor ini sedang memegang ${workload.count} siswa aktif. Menghapus profil tentor tidak menghapus riwayat pengajuan, tetapi data tentor akan hilang dari direktori. Tindakan ini tidak dapat dibatalkan.`
            : 'Profil tentor akan dihapus dari direktori. Tindakan ini tidak dapat dibatalkan.'
        }
        confirmLabel="Hapus tentor"
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
