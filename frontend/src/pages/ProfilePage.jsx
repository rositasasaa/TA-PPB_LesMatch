import {
  BadgeCheck,
  BookOpen,
  Building2,
  Check,
  CheckCircle2,
  ClipboardList,
  CloudOff,
  Copy,
  Download,
  GraduationCap,
  Info,
  RefreshCw,
  RotateCcw,
  Save,
  Smartphone,
  Sparkles,
  UserRound,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { useState } from 'react'
import { useAppData } from '../context/appDataContext'
import profileService from '../services/profileService'
import submissionService from '../services/submissionService'
import { formatDate, getInitials } from '../utils/helpers'
import DataSourceBadge from '../components/DataSourceBadge'

export default function ProfilePage({
  online,
  canInstall,
  isInstalled,
  onInstall,
}) {
  const { stats, sources, source, loading, refresh } = useAppData()
  const [profile, setProfile] = useState(() => profileService.getProfile())
  const [form, setForm] = useState(() => {
    const data = profileService.getProfile()
    return {
      nama: data.nama,
      cabang: data.cabang,
      telepon: data.telepon,
    }
  })
  const [feedback, setFeedback] = useState('')
  const [copied, setCopied] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleSave = (event) => {
    event.preventDefault()
    const result = profileService.saveProfile(form)
    if (result.success) {
      setProfile(result.data)
      setForm({
        nama: result.data.nama,
        cabang: result.data.cabang,
        telepon: result.data.telepon,
      })
      setFeedback('Profil operator berhasil disimpan di perangkat ini.')
      setTimeout(() => setFeedback(''), 3500)
    } else {
      setFeedback('Profil gagal disimpan. Coba lagi.')
    }
  }

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(profile.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setFeedback('ID operator tidak dapat disalin di browser ini.')
    }
  }

  const handleReset = () => {
    const confirmed = window.confirm(
      'Hapus profil operator dan seluruh pengajuan yang tersimpan lokal di perangkat ini?',
    )
    if (!confirmed) return

    submissionService.clearLocalSubmissions()
    const nextProfile = profileService.resetProfile()
    setProfile(nextProfile)
    setForm({
      nama: nextProfile.nama,
      cabang: nextProfile.cabang,
      telepon: nextProfile.telepon,
    })
    setFeedback('Data lokal berhasil direset.')
    setTimeout(() => setFeedback(''), 3500)
    refresh()
  }

  const dataRows = [
    {
      label: 'Siswa',
      value: stats.students,
      Icon: Users,
      source: sources.students,
    },
    {
      label: 'Tentor',
      value: stats.tutors,
      Icon: GraduationCap,
      source: sources.tutors,
    },
    {
      label: 'Pengajuan',
      value: stats.submissions,
      Icon: ClipboardList,
      source: sources.submissions,
    },
  ]

  return (
    <div className="page">
      <section className="page-hero">
        <span className="eyebrow">
          <Sparkles size={14} aria-hidden="true" />
          Profil operator
        </span>
        <h1>
          Kenali aplikasinya,
          <br />
          <span className="text-accent">atur identitas Anda.</span>
        </h1>
        <p>
          LesMatch adalah portal distribusi siswa les privat yang bisa dipasang
          di layar utama dan tetap terbuka saat offline.
        </p>
      </section>

      <section className="profile-card panel">
        <div className="profile-identity">
          <span className="avatar avatar--xl">{getInitials(profile.nama)}</span>
          <div className="profile-identity-copy">
            <span className="eyebrow">Operator aktif</span>
            <h2>{profile.nama}</h2>
            <p>
              <Building2 size={15} aria-hidden="true" />
              Cabang {profile.cabang}
            </p>
            <button
              type="button"
              className="id-chip"
              onClick={handleCopyId}
              title="Salin ID operator"
            >
              <span>ID {profile.id.slice(0, 8)}…</span>
              {copied ? (
                <Check size={14} aria-hidden="true" />
              ) : (
                <Copy size={14} aria-hidden="true" />
              )}
            </button>
          </div>
          <span
            className={`connection-chip ${
              online
                ? 'connection-chip--online'
                : 'connection-chip--offline'
            }`}
          >
            {online ? <Wifi size={14} /> : <WifiOff size={14} />}
            {online ? 'Online' : 'Offline'}
          </span>
        </div>

        <form className="profile-form" onSubmit={handleSave}>
          <div className="form-grid form-grid--3">
            <label className="field">
              <span>Nama operator</span>
              <input
                className="input"
                name="nama"
                value={form.nama}
                onChange={handleChange}
                placeholder="Nama Anda"
                required
              />
            </label>
            <label className="field">
              <span>Cabang / wilayah</span>
              <input
                className="input"
                name="cabang"
                value={form.cabang}
                onChange={handleChange}
                placeholder="Contoh: Semarang"
              />
            </label>
            <label className="field">
              <span>Nomor WhatsApp</span>
              <input
                className="input"
                name="telepon"
                value={form.telepon}
                onChange={handleChange}
                placeholder="08xxxxxxxxxx"
                inputMode="tel"
              />
            </label>
          </div>

          <div className="profile-form-actions">
            <button type="submit" className="btn btn--primary">
              <Save size={16} aria-hidden="true" />
              Simpan profil
            </button>
            {feedback && (
              <span className="inline-success" role="status">
                <CheckCircle2 size={16} aria-hidden="true" />
                {feedback}
              </span>
            )}
          </div>
        </form>
      </section>

      <div className="profile-grid">
        <section className="panel about-panel">
          <div className="panel-head">
            <span className="panel-icon">
              <Info size={18} aria-hidden="true" />
            </span>
            <div>
              <h2>Tentang LesMatch</h2>
              <p>Latar belakang dan tujuan aplikasi.</p>
            </div>
          </div>

          <p>
            LesMatch menggantikan cara manual mendistribusikan daftar siswa les
            yang biasanya menumpuk di grup chat. Data siswa kini terpusat,
            terkelompok per mata pelajaran, dan bisa diakses tentor kapan saja.
          </p>
          <p>
            Tentor dapat meninjau profil siswa, memilah berdasarkan keahlian,
            lalu mengirim pengajuan ke HRD langsung dari perangkat. HRD
            menerima satu daftar pengajuan yang rapi dan mudah ditindaklanjuti.
          </p>

          <div className="feature-list">
            <span>
              <BookOpen size={16} aria-hidden="true" /> Daftar siswa per mata
              pelajaran
            </span>
            <span>
              <UserRound size={16} aria-hidden="true" /> Direktori tentor dan
              keahlian
            </span>
            <span>
              <BadgeCheck size={16} aria-hidden="true" /> Pengajuan terpusat
              untuk HRD
            </span>
            <span>
              <CloudOff size={16} aria-hidden="true" /> Dapat dibuka offline
              setelah dipasang
            </span>
          </div>

          <div className="tech-chips" aria-label="Teknologi yang digunakan">
            <span>React</span>
            <span>Vite</span>
            <span>PWA</span>
            <span>Supabase</span>
            <span>Axios</span>
            <span>Vercel</span>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <span className="panel-icon panel-icon--accent">
              <Smartphone size={18} aria-hidden="true" />
            </span>
            <div>
              <h2>Pasang aplikasi</h2>
              <p>Jadikan LesMatch aplikasi di layar utama.</p>
            </div>
          </div>

          {isInstalled ? (
            <div className="notice notice--success">
              <CheckCircle2 size={20} aria-hidden="true" />
              <div>
                <strong>LesMatch sudah terpasang</strong>
                <p>Aplikasi berjalan dalam mode standalone di perangkat ini.</p>
              </div>
            </div>
          ) : canInstall ? (
            <div className="install-card">
              <p>
                Browser mendukung pemasangan PWA. Setelah dipasang, LesMatch
                memiliki ikon sendiri dan dapat dibuka tanpa address bar.
              </p>
              <button
                type="button"
                className="btn btn--primary"
                onClick={onInstall}
              >
                <Download size={16} aria-hidden="true" />
                Pasang LesMatch
              </button>
            </div>
          ) : (
            <div className="install-card">
              <p>
                Buka LesMatch melalui browser di ponsel, lalu gunakan menu
                browser untuk menambahkan ke layar utama.
              </p>
              <details className="install-help">
                <summary>Lihat cara pasang</summary>
                <ul>
                  <li>
                    <strong>Android / Chrome:</strong> menu ⋮ → “Install app”
                    atau “Add to Home screen”.
                  </li>
                  <li>
                    <strong>iPhone / Safari:</strong> tombol Share → “Add to
                    Home Screen”.
                  </li>
                </ul>
              </details>
            </div>
          )}
        </section>
      </div>

      <section className="panel">
        <div className="section-head section-head--tight">
          <div>
            <h2>Data aplikasi</h2>
            <p>
              Sumber data aktif: <DataSourceBadge source={source} />
            </p>
          </div>
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw
              size={15}
              className={loading ? 'spin' : ''}
              aria-hidden="true"
            />
            Muat ulang
          </button>
        </div>

        <div className="data-rows">
          {dataRows.map(({ label, value, Icon, source: rowSource }) => (
            <div className="data-row" key={label}>
              <span className="data-row-icon">
                <Icon size={17} aria-hidden="true" />
              </span>
              <span className="data-row-label">{label}</span>
              <strong>{value}</strong>
              <DataSourceBadge source={rowSource} />
            </div>
          ))}
        </div>

        <div className="profile-footer">
          <span>
            LesMatch v1.0.0 · Tugas Akhir Praktikum PPB
          </span>
          <button
            type="button"
            className="btn btn--ghost-danger btn--sm"
            onClick={handleReset}
          >
            <RotateCcw size={14} aria-hidden="true" />
            Reset data lokal
          </button>
        </div>

        <p className="profile-footnote">
          Terakhir diperbarui{' '}
          {profile.updatedAt ? formatDate(profile.updatedAt) : 'baru saja'} ·
          Data profil disimpan di localStorage perangkat.
        </p>
      </section>
    </div>
  )
}
