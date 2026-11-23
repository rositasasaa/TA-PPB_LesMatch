import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Plus,
  Search,
  Users,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAppData } from '../context/appDataContext'
import {
  GENDER_OPTIONS,
  getTutorWorkload,
  isStudentAvailable,
  tutorMatchesSubject,
  uniqueExpertise,
  uniqueSubjects,
} from '../utils/helpers'
import EmptyState from '../components/EmptyState'
import PhotoUploadPicker from '../components/PhotoUploadPicker'
import TutorCard from '../components/TutorCard'
import { CardGridSkeleton } from '../components/Skeletons'
import { uploadTutorPhoto } from '../services/api'

const INITIAL_FORM = {
  nama: '',
  keahlian: '',
  domisili: '',
  pengalaman: '',
  gender: 'Bebas',
  foto_url: '',
}

const LOAD_FILTERS = ['Semua', 'Belum memegang siswa', 'Memegang siswa']

export default function TutorsPage({ onOpenTutor }) {
  const { tutors, students, submissions, loading, stats, addTutor } =
    useAppData()
  const [search, setSearch] = useState('')
  const [subject, setSubject] = useState('Semua')
  const [loadFilter, setLoadFilter] = useState('Semua')

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(INITIAL_FORM)
  const [photoFile, setPhotoFile] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  const subjects = useMemo(() => {
    const values = new Set([
      ...uniqueSubjects(students),
      ...uniqueExpertise(tutors),
    ])
    return [...values].sort((first, second) =>
      first.localeCompare(second, 'id'),
    )
  }, [students, tutors])

  const availableStudents = useMemo(
    () => students.filter(isStudentAvailable),
    [students],
  )

  // Reactive match counts: recalculated whenever students, tutors, or a
  // student status changes (e.g. after HRD approval).
  const matchCounts = useMemo(() => {
    const counts = new Map()

    tutors.forEach((tutor) => {
      counts.set(
        String(tutor.id),
        availableStudents.filter((student) =>
          tutorMatchesSubject(tutor, student),
        ).length,
      )
    })

    return counts
  }, [availableStudents, tutors])

  const workloads = useMemo(() => {
    const result = new Map()

    tutors.forEach((tutor) => {
      result.set(
        String(tutor.id),
        getTutorWorkload(tutor, students, submissions),
      )
    })

    return result
  }, [students, submissions, tutors])

  const totalActive = useMemo(
    () =>
      [...workloads.values()].reduce(
        (total, workload) => total + workload.count,
        0,
      ),
    [workloads],
  )

  const filteredTutors = useMemo(() => {
    const query = search.trim().toLowerCase()

    return tutors.filter((tutor) => {
      const matchesQuery =
        !query ||
        [
          tutor.nama,
          tutor.keahlian,
          tutor.domisili,
          tutor.pengalaman,
          tutor.gender,
        ].some((value) => String(value).toLowerCase().includes(query))

      const matchesSubject =
        subject === 'Semua' || tutorMatchesSubject(tutor, subject)

      const workload = workloads.get(String(tutor.id))
      const matchesLoad =
        loadFilter === 'Semua' ||
        (loadFilter === 'Belum memegang siswa' && workload.count === 0) ||
        (loadFilter === 'Memegang siswa' && workload.count > 0)

      return matchesQuery && matchesSubject && matchesLoad
    })
  }, [loadFilter, search, subject, tutors, workloads])

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
    if (formError) setFormError('')
  }

  const handleAddTutor = async (event) => {
    event.preventDefault()
    if (
      !form.nama.trim() ||
      !form.keahlian.trim() ||
      !form.domisili.trim() ||
      !form.pengalaman.trim()
    ) {
      setFormError('Semua kolom wajib diisi sebelum menyimpan.')
      return
    }

    try {
      setSubmitting(true)
      setFormError('')

      let finalFotoUrl = form.foto_url || ''
      if (photoFile) {
        setUploadingPhoto(true)
        try {
          finalFotoUrl = await uploadTutorPhoto(photoFile)
        } catch (uploadErr) {
          console.warn('[LesMatch] Gagal upload foto tentor:', uploadErr)
        } finally {
          setUploadingPhoto(false)
        }
      }

      await addTutor({
        nama: form.nama.trim(),
        keahlian: form.keahlian.trim(),
        domisili: form.domisili.trim(),
        pengalaman: form.pengalaman.trim(),
        gender: form.gender,
        foto_url: finalFotoUrl,
      })
      setForm(INITIAL_FORM)
      setPhotoFile(null)
      setShowForm(false)
      setSubject('Semua')
      setLoadFilter('Semua')
      setFormSuccess('Tentor berhasil ditambahkan')
      window.setTimeout(() => setFormSuccess(''), 4000)
    } catch (err) {
      setFormError(err?.message || 'Gagal menambahkan tentor')
    } finally {
      setSubmitting(false)
      setUploadingPhoto(false)
    }
  }

  return (
    <div className="page">
      <section className="page-hero">
        <span className="eyebrow">
          <BookOpen size={14} aria-hidden="true" />
          Direktori tentor
        </span>
        <h1>
          Keahlian yang tepat,
          <br />
          <span className="text-accent">untuk setiap siswa.</span>
        </h1>
        <p>
          Kenali tentor LesMatch, lihat bidang keahlian dan gender-nya, lalu
          pantau beban mengajar secara real-time saat pengajuan disetujui HRD.
        </p>

        <div className="hero-stats">
          <span className="stat-pill">
            <GraduationCap size={16} aria-hidden="true" />
            <strong>{stats.tutors}</strong> tentor
          </span>
          <span className="stat-pill">
            <Users size={16} aria-hidden="true" />
            <strong>{availableStudents.length}</strong> siswa siap diajar
          </span>
          <span className="stat-pill">
            <Users size={16} aria-hidden="true" />
            <strong>{totalActive}</strong> siswa aktif dipegang
          </span>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Daftar tentor</h2>
          </div>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              setShowForm((prev) => !prev)
              setFormError('')
            }}
          >
            {showForm ? (
              <>
                <X size={16} aria-hidden="true" />
                Tutup
              </>
            ) : (
              <>
                <Plus size={16} aria-hidden="true" />
                Tambah Tentor
              </>
            )}
          </button>
        </div>

        {formSuccess && (
          <div className="notice notice--success" role="status">
            <CheckCircle2 size={18} aria-hidden="true" />
            <div>
              <strong>{formSuccess}</strong>
            </div>
          </div>
        )}

        {showForm && (
          <form className="form-card" onSubmit={handleAddTutor}>
            <div className="form-card-head">
              <div>
                <h3>Tambah Tentor</h3>
              </div>
            </div>

            <PhotoUploadPicker
              name={form.nama}
              currentPhotoUrl={form.foto_url}
              onPhotoSelected={(file) => {
                setPhotoFile(file)
              }}
              onPhotoRemoved={() => {
                setPhotoFile(null)
                setForm((prev) => ({ ...prev, foto_url: '' }))
              }}
              uploading={uploadingPhoto}
              disabled={submitting}
            />

            <div className="form-grid">
              <label className="field">
                <span>Nama tentor</span>
                <input
                  type="text"
                  className="input"
                  value={form.nama}
                  onChange={handleChange('nama')}
                  placeholder="Contoh: Kak Dimas"
                />
              </label>

              <label className="field">
                <span>Keahlian mapel</span>
                <input
                  type="text"
                  className="input"
                  value={form.keahlian}
                  onChange={handleChange('keahlian')}
                  placeholder="Contoh: Matematika & Fisika"
                />
              </label>

              <label className="field">
                <span>Domisili</span>
                <input
                  type="text"
                  className="input"
                  value={form.domisili}
                  onChange={handleChange('domisili')}
                  placeholder="Contoh: Tembalang, Semarang"
                />
              </label>

              <label className="field">
                <span>Pengalaman mengajar</span>
                <input
                  type="text"
                  className="input"
                  value={form.pengalaman}
                  onChange={handleChange('pengalaman')}
                  placeholder="Contoh: 2 tahun mengajar SMP/SMA"
                />
              </label>

              <label className="field">
                <span>Gender tentor</span>
                <select
                  className="select"
                  value={form.gender}
                  onChange={handleChange('gender')}
                >
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => {
                  setShowForm(false)
                  setFormError('')
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={submitting}
              >
                {submitting ? 'Menyimpan...' : 'Simpan Tentor'}
              </button>
            </div>
          </form>
        )}

        <div className="filter-panel">
          <div className="filter-grid">
            <label className="search-field">
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama, keahlian, atau domisili..."
                aria-label="Cari tentor"
              />
            </label>

            <label className="select-field">
              <BookOpen size={17} aria-hidden="true" />
              <select
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                aria-label="Filter keahlian"
              >
                <option value="Semua">Semua mata pelajaran</option>
                {subjects.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="filter-summary">
            <div
              className="segmented"
              role="tablist"
              aria-label="Filter beban mengajar"
            >
              {LOAD_FILTERS.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="tab"
                  aria-selected={loadFilter === option}
                  className={`segmented-btn ${
                    loadFilter === option ? 'segmented-btn--active' : ''
                  }`}
                  onClick={() => setLoadFilter(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <span className="result-count">
              {filteredTutors.length} tentor ditampilkan
            </span>
          </div>
        </div>

        {loading ? (
          <CardGridSkeleton />
        ) : filteredTutors.length > 0 ? (
          <div className="entity-grid">
            {filteredTutors.map((tutor) => (
              <TutorCard
                key={tutor.id}
                tutor={tutor}
                matchCount={matchCounts.get(String(tutor.id)) || 0}
                workload={workloads.get(String(tutor.id))}
                onOpen={onOpenTutor}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="Tentor tidak ditemukan"
            message="Coba kata kunci lain atau tampilkan semua keahlian dan beban mengajar."
            action={
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => {
                  setSearch('')
                  setSubject('Semua')
                  setLoadFilter('Semua')
                }}
              >
                Reset filter
              </button>
            }
          />
        )}
      </section>
    </div>
  )
}
