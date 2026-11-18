import {
  CalendarDays,
  ClipboardList,
  Inbox,
  RefreshCw,
  Search,
  Send,
  Sparkles,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAppData } from '../context/appDataContext'
import { formatDate } from '../utils/helpers'
import DataSourceBadge from '../components/DataSourceBadge'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'

export default function SubmissionsPage({ onBrowseStudents }) {
  const { submissions, loading, source, stats, refresh } = useAppData()
  const [search, setSearch] = useState('')

  const filteredSubmissions = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return submissions

    return submissions.filter((submission) =>
      [
        submission.namaSiswa,
        submission.namaTentor,
        submission.mapel,
        submission.catatan,
        submission.status,
      ].some((value) => String(value).toLowerCase().includes(query)),
    )
  }, [search, submissions])

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
          Semua pengajuan yang dikirim tentor tercatat di sini dan siap
          dikonfirmasi oleh HRD atau Branch Manager.
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
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Daftar pengajuan</h2>
            <p>Riwayat pengajuan beserta status terbarunya.</p>
          </div>
          <DataSourceBadge source={source} />
        </div>

        <div className="toolbar toolbar--inline">
          <label className="search-field">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari siswa, tentor, atau mapel..."
              aria-label="Cari pengajuan"
            />
          </label>
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
            {filteredSubmissions.map((submission) => (
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
              </article>
            ))}
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
                : 'Coba kata kunci lain untuk menemukan pengajuan yang dicari.'
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
                  onClick={() => setSearch('')}
                >
                  Reset pencarian
                </button>
              )
            }
          />
        )}
      </section>
    </div>
  )
}
