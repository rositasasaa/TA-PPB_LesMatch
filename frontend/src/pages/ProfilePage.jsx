import {
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  RefreshCw,
  Send,
  Smartphone,
  UserCheck,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { useState } from 'react'
import { useAppData } from '../context/appDataContext'
import ConfirmDialog from '../components/ConfirmDialog'
import submissionService from '../services/submissionService'

export default function ProfilePage({
  online,
  canInstall,
  isInstalled,
  onInstall,
}) {
  const { stats, loading, refresh } = useAppData()
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [syncFeedback, setSyncFeedback] = useState('')

  const handleManualSync = async () => {
    try {
      await refresh()
      setSyncFeedback('Data berhasil diperbarui')
      setTimeout(() => setSyncFeedback(''), 3000)
    } catch {
      setSyncFeedback('Gagal menyegarkan data. Periksa koneksi.')
      setTimeout(() => setSyncFeedback(''), 3500)
    }
  }

  const handleResetData = () => {
    setShowResetDialog(false)
    submissionService.clearLocalSubmissions()
    setSyncFeedback('Data perangkat diatur ulang')
    setTimeout(() => setSyncFeedback(''), 3500)
    refresh()
  }

  // Live operational counters
  const totalStudents = stats?.students ?? 0
  const availableStudents = stats?.available ?? 0
  const filledStudents = stats?.filled ?? 0
  const totalTutors = stats?.tutors ?? 0
  const totalSubmissions = stats?.submissions ?? 0
  const pendingSubmissions = stats?.pending ?? 0
  const approvedSubmissions = stats?.approved ?? 0

  return (
    <div className="page profile-page">
      {/* 1. App Overview Card */}
      <section className="profile-overview-card panel">
        <div className="profile-overview-header">
          <div className="profile-overview-brand">
            <div className="app-identity-badge">
              <img
                src="/icon-lesmatch.png"
                alt="LesMatch"
                className="app-identity-icon"
                width="24"
                height="24"
              />
              <span className="app-identity-name">LesMatch</span>
            </div>
            <span className="eyebrow eyebrow--brand">
              <BookOpen size={14} aria-hidden="true" />
              Sistem Operasional Les Privat
            </span>
            <span className="version-badge">v1.0</span>
          </div>
          <h1 className="profile-overview-title">
            LesMatch — Sistem Distribusi Siswa Les Privat
          </h1>
          <p className="profile-overview-desc">
            Platform Progressive Web App (PWA) terpadu untuk mendistribusikan
            daftar siswa les privat, mencocokkan jadwal dan keahlian tentor,
            serta memproses pengajuan bimbingan ke manajemen secara cepat,
            transparan, dan terstruktur.
          </p>
        </div>

        <div className="profile-overview-highlights">
          <div className="overview-highlight-item">
            <span className="overview-highlight-icon">
              <Users size={16} aria-hidden="true" />
            </span>
            <span>Distribusi Siswa Terpusat</span>
          </div>
          <div className="overview-highlight-item">
            <span className="overview-highlight-icon">
              <BookOpen size={16} aria-hidden="true" />
            </span>
            <span>Pencocokan Keahlian Tentor</span>
          </div>
          <div className="overview-highlight-item">
            <span className="overview-highlight-icon">
              <Send size={16} aria-hidden="true" />
            </span>
            <span>Pengajuan Terintegrasi HRD</span>
          </div>
        </div>
      </section>

      {/* 2. Live Operational Summary Cards */}
      <section className="profile-section">
        <div className="section-head">
          <div>
            <h2>Ringkasan Operasional</h2>
          </div>
        </div>

        <div className="profile-metrics-grid">
          {/* Card 1: Siswa */}
          <div className="profile-metric-card">
            <div className="profile-metric-head">
              <span className="profile-metric-icon profile-metric-icon--brand">
                <Users size={20} aria-hidden="true" />
              </span>
              <span className="profile-metric-title">Total Siswa</span>
            </div>
            <div className="profile-metric-val">{totalStudents}</div>
            <div className="profile-metric-pills">
              <span className="profile-metric-pill profile-metric-pill--success">
                <CheckCircle2 size={13} aria-hidden="true" />
                {availableStudents} Tersedia
              </span>
              <span className="profile-metric-pill profile-metric-pill--muted">
                {filledStudents} Sudah Terisi / Diproses
              </span>
            </div>
          </div>

          {/* Card 2: Tentor */}
          <div className="profile-metric-card">
            <div className="profile-metric-head">
              <span className="profile-metric-icon profile-metric-icon--accent">
                <BookOpen size={20} aria-hidden="true" />
              </span>
              <span className="profile-metric-title">Total Tentor</span>
            </div>
            <div className="profile-metric-val">{totalTutors}</div>
            <div className="profile-metric-pills">
              <span className="profile-metric-pill profile-metric-pill--brand">
                <UserCheck size={13} aria-hidden="true" />
                Terdaftar di Direktori
              </span>
            </div>
          </div>

          {/* Card 3: Pengajuan */}
          <div className="profile-metric-card">
            <div className="profile-metric-head">
              <span className="profile-metric-icon profile-metric-icon--info">
                <Send size={20} aria-hidden="true" />
              </span>
              <span className="profile-metric-title">Total Pengajuan</span>
            </div>
            <div className="profile-metric-val">{totalSubmissions}</div>
            <div className="profile-metric-pills">
              <span className="profile-metric-pill profile-metric-pill--warning">
                <Clock size={13} aria-hidden="true" />
                {pendingSubmissions} Menunggu HRD
              </span>
              <span className="profile-metric-pill profile-metric-pill--success">
                <CheckCircle2 size={13} aria-hidden="true" />
                {approvedSubmissions} Disetujui HRD
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Operational Standards & Procedures */}
      <section className="profile-section">
        <div className="section-head">
          <div>
            <h2>Standar Operasional Lembaga</h2>
          </div>
        </div>

        <div className="workflow-grid">
          {/* Card 1: Standar Penempatan Tentor */}
          <div className="workflow-card">
            <div className="workflow-card-top">
              <span className="workflow-step-badge">Kriteria Penempatan</span>
              <span className="workflow-icon">
                <BookOpen size={18} aria-hidden="true" />
              </span>
            </div>
            <h3>Standar Penempatan Tentor</h3>
            <p>
              Penempatan tentor diprioritaskan berdasarkan kesesuaian mata
              pelajaran, domisili terdekat, kecocokan jadwal mingguan, serta
              preferensi khusus siswa seperti preferensi gender pengajar.
            </p>
          </div>

          {/* Card 2: Alur Persetujuan HRD */}
          <div className="workflow-card">
            <div className="workflow-card-top">
              <span className="workflow-step-badge">Validasi Penugasan</span>
              <span className="workflow-icon">
                <CheckCircle2 size={18} aria-hidden="true" />
              </span>
            </div>
            <h3>Alur Persetujuan HRD</h3>
            <p>
              Setiap pengajuan bimbingan diverifikasi terlebih dahulu oleh HRD
              sebelum status siswa resmi diperbarui menjadi terisi, memastikan
              tidak ada jadwal bentrok atau kelebihan beban mengajar.
            </p>
          </div>

          {/* Card 3: Sinkronisasi Offline */}
          <div className="workflow-card">
            <div className="workflow-card-top">
              <span className="workflow-step-badge">Akses Fleksibel</span>
              <span className="workflow-icon">
                <WifiOff size={18} aria-hidden="true" />
              </span>
            </div>
            <h3>Sinkronisasi Offline</h3>
            <p>
              Aplikasi tetap dapat digunakan di lapangan saat jaringan terbatas.
              Perubahan data tersimpan aman pada perangkat dan otomatis
              disinkronkan kembali saat koneksi internet aktif.
            </p>
          </div>
        </div>
      </section>

      {/* 4. PWA & System Status Panel */}
      <section className="panel system-panel">
        <div className="section-head section-head--tight">
          <div>
            <h2>Status Sistem &amp; Aplikasi</h2>
          </div>
          <span
            className={`connection-chip ${
              online ? 'connection-chip--online' : 'connection-chip--offline'
            }`}
          >
            {online ? <Wifi size={14} /> : <WifiOff size={14} />}
            {online ? 'Online' : 'Offline'}
          </span>
        </div>

        <div className="system-grid">
          {/* Item 1: Jaringan */}
          <div className="system-item">
            <div className="system-item-icon">
              {online ? <Wifi size={20} /> : <WifiOff size={20} />}
            </div>
            <div className="system-item-body">
              <strong>Koneksi Jaringan</strong>
              <p>
                {online
                  ? 'Aplikasi terhubung ke jaringan dan menyinkronkan data secara langsung.'
                  : 'Aplikasi berjalan dalam mode offline. Data tetap dapat diakses dari perangkat Anda.'}
              </p>
            </div>
          </div>

          {/* Item 2: PWA Install */}
          <div className="system-item">
            <div className="system-item-icon">
              <Smartphone size={20} />
            </div>
            <div className="system-item-body">
              <strong>Pemasangan Aplikasi</strong>
              {isInstalled ? (
                <p className="system-success-text">
                  <CheckCircle2 size={14} aria-hidden="true" />
                  LesMatch sudah terpasang di perangkat ini dalam mode mandiri.
                </p>
              ) : canInstall ? (
                <div>
                  <p>
                    Aplikasi siap dipasang ke layar utama ponsel atau desktop
                    untuk akses cepat tanpa perantara bilah alamat.
                  </p>
                  <button
                    type="button"
                    className="btn btn--primary btn--sm"
                    onClick={onInstall}
                    style={{ marginTop: '8px' }}
                  >
                    <Download size={14} aria-hidden="true" />
                    Pasang LesMatch
                  </button>
                </div>
              ) : (
                <p>
                  Dapat dipasang ke layar utama ponsel melalui menu peramban
                  (Bagikan / Titik Tiga &rarr; Tambahkan ke Layar Utama).
                </p>
              )}
            </div>
          </div>

          {/* Item 3: Sinkronisasi Data Manual */}
          <div className="system-item">
            <div className="system-item-icon">
              <RefreshCw size={20} className={loading ? 'spin' : ''} />
            </div>
            <div className="system-item-body">
              <strong>Sinkronisasi Data</strong>
              <p>
                Segarkan data siswa, tentor, dan pengajuan terbaru secara langsung.
              </p>
              <div className="system-sync-action">
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={handleManualSync}
                  disabled={loading}
                >
                  <RefreshCw
                    size={14}
                    className={loading ? 'spin' : ''}
                    aria-hidden="true"
                  />
                  {loading ? 'Menyinkronkan...' : 'Segarkan Data'}
                </button>
                {syncFeedback && (
                  <span className="inline-feedback" role="status">
                    {syncFeedback}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="system-footer">
          <span>
            LesMatch v1.0 · Sistem Distribusi Siswa Les Privat
          </span>
          <button
            type="button"
            className="btn btn--ghost-danger btn--sm"
            onClick={() => setShowResetDialog(true)}
          >
            Atur Ulang Data Perangkat
          </button>
        </div>
      </section>

      <ConfirmDialog
        open={showResetDialog}
        title="Atur ulang data perangkat?"
        message="Seluruh data sementara yang tersimpan pada perangkat ini akan dibersihkan dan disinkronkan kembali. Tindakan ini tidak menghapus data utama."
        confirmLabel="Ya, Atur Ulang"
        tone="danger"
        onConfirm={handleResetData}
        onCancel={() => setShowResetDialog(false)}
      />
    </div>
  )
}
