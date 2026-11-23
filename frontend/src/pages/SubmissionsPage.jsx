import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  Inbox,
  Loader2,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAppData } from '../context/appDataContext'
import {
  formatDate,
  isSubmissionApproved,
  isSubmissionPending,
  isSubmissionRejected,
} from '../utils/helpers'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'

const STATUS_FILTERS = [
  'Semua',
  'Menunggu Konfirmasi HRD',
  'Disetujui HRD',
  'Ditolak',
]

const DIALOG_COPY = {
  approve: {
    title: 'Setujui pengajuan ini?',
    confirmLabel: 'Ya, setujui',
    tone: 'primary',
    message: (submission) =>
      `Pengajuan ${submission.namaSiswa} untuk tentor ${submission.namaTentor} akan disetujui. Status siswa otomatis berubah menjadi "Sudah Terisi" dan beban mengajar tentor bertambah.`,
  },
  reject: {
    title: 'Tolak pengajuan ini?',
    confirmLabel: 'Ya, tolak',
    tone: 'warning',
    message: (submission) =>
      `Pengajuan ${submission.namaSiswa} akan ditolak. Jika tidak ada pengajuan aktif lain, status siswa kembali menjadi "Tersedia" agar bisa diajukan ke tentor lain.`,
  },
  delete: {
    title: 'Hapus riwayat pengajuan?',
    confirmLabel: 'Hapus pengajuan',
    tone: 'danger',
    message: (submission) =>
      `Riwayat pengajuan ${submission.namaSiswa} kepada ${submission.namaTentor} akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`,
  },
}

const matchesStatusFilter = (submission, filter) => {
  if (filter === 'Semua') return true
  if (filter === 'Menunggu Konfirmasi HRD') {
    return isSubmissionPending(submission)
  }
  if (filter === 'Disetujui HRD') return isSubmissionApproved(submission)
  if (filter === 'Ditolak') return isSubmissionRejected(submission)
  return true
}

export default function SubmissionsPage({ onBrowseStudents }) {
  const {
    submissions,
    loading,
    stats,
    refresh,
    approveSubmission,
    rejectSubmission,
    deleteSubmission,
  } = useAppData()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Semua')
  const [actionId, setActionId] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [actionError, setActionError] = useState('')

  const filteredSubmissions = useMemo(() => {
    const query = search.trim().toLowerCase()

    return submissions.filter((submission) => {
      const matchesQuery =
        !query ||
        [
          submission.namaSiswa,
          submission.namaTentor,
          submission.mapel,
          submission.catatan,
          submission.status,
        ].some((value) => String(value).toLowerCase().includes(query))

      return matchesQuery && matchesStatusFilter(submission, statusFilter)
    })
  }, [search, statusFilter, submissions])

  const dialogContent = confirmAction ? DIALOG_COPY[confirmAction.type] : null
  const dialogBusy = Boolean(
    confirmAction &&
      actionId !== null &&
      String(actionId) === String(confirmAction.submission.id),
  )

  const notify = (message) => {
    setFeedback(message)
    setActionError('')
    window.setTimeout(() => setFeedback(''), 4500)
  }

  const requestAction = (type, submission) => {
    if (actionId !== null) return
    setActionError('')
    setConfirmAction({ type, submission })
  }

  const handleConfirm = async () => {
    if (!confirmAction) return

    const { type, submission } = confirmAction
    setActionId(submission.id)
    setActionError('')

    try {
      if (type === 'approve') {
        await approveSubmission(submission)
        notify(
          `Pengajuan ${submission.namaSiswa} disetujui. Status siswa kini "Sudah Terisi".`,
        )
      } else if (type === 'reject') {
        await rejectSubmission(submission)
        notify(
          `Pengajuan ${submission.namaSiswa} ditolak. Status siswa diperbarui otomatis.`,
        )
      } else {
        await deleteSubmission(submission)
        notify(`Riwayat pengajuan ${submission.namaSiswa} berhasil dihapus.`)
      }
      setConfirmAction(null)
    } catch (err) {
      setConfirmAction(null)
      setActionError(err?.message || 'Aksi pengajuan gagal diproses.')
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="page">
      <section className="page-hero">
        <span className="eyebrow">
          <Sparkles size={14} aria-hidden="true" />
          Tindak lanjut HRD
        </span>
        <h1>
          Pengajuan siswa,
          <br />
          <span className="text-accent">dalam satu tempat.</span>
        </h1>
        <p>
          Semua pengajuan yang dikirim tentor tercatat di sini. Setujui atau
          tolak pengajuan, dan status siswa serta beban tentor langsung
          tersinkron tanpa reload.
        </p>

        <div className="hero-stats">
          <span className="stat-pill">
            <ClipboardList size={16} aria-hidden="true" />
            <strong>{stats.submissions}</strong> total pengajuan
          </span>
          <span className="stat-pill">
            <Send size={16} aria-hidden="true" />
            <strong>{stats.pending}</strong> menunggu konfirmasi
          </span>
          <span className="stat-pill">
            <CheckCircle2 size={16} aria-hidden="true" />
            <strong>{stats.approved}</strong> disetujui
          </span>
          <span className="stat-pill">
            <X size={16} aria-hidden="true" />
            <strong>{stats.rejected}</strong> ditolak
          </span>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Daftar pengajuan</h2>
            <p>
              Riwayat pengajuan beserta aksi konfirmasi HRD dan status terbaru.
            </p>
          </div>
          <button
            type="button"
            className="btn btn--outline"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? 'spin' : ''}
              aria-hidden="true"
            />
            Muat ulang
          </button>
        </div>

        {feedback && (
          <div className="notice notice--success" role="status">
            <CheckCircle2 size={18} aria-hidden="true" />
            <div>
              <strong>Berhasil</strong>
              <p>{feedback}</p>
            </div>
          </div>
        )}

        {actionError && (
          <div className="notice notice--danger" role="alert">
            <AlertCircle size={18} aria-hidden="true" />
            <div>
              <strong>Terjadi kesalahan</strong>
              <p>{actionError}</p>
            </div>
          </div>
        )}

        <div className="filter-panel">
          <label className="search-field">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari siswa, tentor, mapel, atau catatan..."
              aria-label="Cari pengajuan"
            />
          </label>

          <div className="filter-summary">
            <div
              className="segmented segmented--scroll"
              role="tablist"
              aria-label="Filter status pengajuan"
            >
              {STATUS_FILTERS.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="tab"
                  aria-selected={statusFilter === option}
                  className={`segmented-btn ${
                    statusFilter === option ? 'segmented-btn--active' : ''
                  }`}
                  onClick={() => setStatusFilter(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <span className="result-count">
              {filteredSubmissions.length} pengajuan ditampilkan
            </span>
          </div>
        </div>

        {loading && submissions.length === 0 ? (
          <div className="submission-list" aria-hidden="true">
            {[0, 1, 2].map((item) => (
              <div className="skeleton-card" key={item}>
                <span className="skeleton skeleton--avatar" />
                <span className="skeleton-lines">
                  <span className="skeleton skeleton--title" />
                  <span className="skeleton skeleton--line" />
                </span>
              </div>
            ))}
          </div>
        ) : filteredSubmissions.length > 0 ? (
          <div className="submission-list">
            {filteredSubmissions.map((submission) => {
              const pending = isSubmissionPending(submission)
              const busy = String(actionId) === String(submission.id)

              return (
                <article className="submission-card" key={submission.id}>
                  <div className="submission-head">
                    <span className="submission-icon">
                      <ClipboardList size={18} aria-hidden="true" />
                    </span>
                    <div className="submission-copy">
                      <h3>{submission.namaSiswa}</h3>
                      <p>
                        {submission.mapel} · Tentor {submission.namaTentor}
                      </p>
                    </div>
                    <StatusBadge status={submission.status} />
                  </div>

                  {submission.catatan && (
                    <blockquote className="submission-note">
                      “{submission.catatan}”
                    </blockquote>
                  )}

                  <div className="submission-foot">
                    <CalendarDays size={14} aria-hidden="true" />
                    Diajukan {formatDate(submission.createdAt)}
                  </div>

                  <div className="submission-actions">
                    {pending && (
                      <>
                        <button
                          type="button"
                          className="btn btn--primary btn--sm"
                          onClick={() => requestAction('approve', submission)}
                          disabled={busy}
                        >
                          {busy ? (
                            <Loader2
                              size={15}
                              className="spin"
                              aria-hidden="true"
                            />
                          ) : (
                            <Check size={15} aria-hidden="true" />
                          )}
                          Setujui Pengajuan
                        </button>
                        <button
                          type="button"
                          className="btn btn--danger-outline btn--sm"
                          onClick={() => requestAction('reject', submission)}
                          disabled={busy}
                        >
                          <X size={15} aria-hidden="true" />
                          Tolak Pengajuan
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      className="btn btn--ghost-danger btn--sm"
                      onClick={() => requestAction('delete', submission)}
                      disabled={busy}
                    >
                      <Trash2 size={15} aria-hidden="true" />
                      Hapus
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <EmptyState
            icon={Inbox}
            title={
              submissions.length === 0
                ? 'Belum ada pengajuan'
                : 'Pengajuan tidak ditemukan'
            }
            message={
              submissions.length === 0
                ? 'Buka detail siswa, pilih tentor, lalu kirim pengajuan pertama Anda ke HRD.'
                : 'Coba kata kunci atau filter status lain untuk menemukan pengajuan yang dicari.'
            }
            action={
              submissions.length === 0 ? (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={onBrowseStudents}
                >
                  Jelajahi daftar siswa
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => {
                    setSearch('')
                    setStatusFilter('Semua')
                  }}
                >
                  Reset filter
                </button>
              )
            }
          />
        )}
      </section>

      <ConfirmDialog
        open={Boolean(confirmAction)}
        title={dialogContent?.title}
        message={
          confirmAction && dialogContent
            ? dialogContent.message(confirmAction.submission)
            : ''
        }
        confirmLabel={dialogContent?.confirmLabel}
        tone={dialogContent?.tone}
        busy={dialogBusy}
        onConfirm={handleConfirm}
        onCancel={() => {
          if (!dialogBusy) setConfirmAction(null)
        }}
      />
    </div>
  )
}
