import {
  BookOpen,
  CalendarCheck2,
  CheckCircle2,
  Plus,
  Search,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAppData } from '../context/appDataContext'
import {
  GENDER_OPTIONS,
  isStudentAvailable,
  uniqueSubjects,
} from '../utils/helpers'
import EmptyState from '../components/EmptyState'
import StudentCard from '../components/StudentCard'
import { CardGridSkeleton } from '../components/Skeletons'

const INITIAL_FORM = {
  nama: '',
  kelas: '',
  mapel: '',
  hari: '',
  alamat: '',
  status: 'Tersedia',
  preferensiGender: 'Bebas',
  requestKhusus: '',
}

const STATUS_FILTERS = ['Semua', 'Tersedia', 'Sudah Terisi']

export default function StudentsPage({ onOpenStudent }) {
  const { students, loading, stats, addStudent } = useAppData()
  const [search, setSearch] = useState('')
  const [subject, setSubject] = useState('Semua')
  const [statusFilter, setStatusFilter] = useState('Semua')

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  const subjects = useMemo(() => uniqueSubjects(students), [students])

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase()

    return students.filter((student) => {
      const matchesQuery =
        !query ||
        [
          student.nama,
          student.kelas,
          student.mapel,
          student.alamat,
          student.hari,
          student.status,
          student.preferensiGender,
          student.requestKhusus,
        ].some((value) => String(value).toLowerCase().includes(query))

      const matchesSubject =
        subject === 'Semua' || student.mapel === subject

      const available = isStudentAvailable(student)
      const matchesStatus =
        statusFilter === 'Semua' ||
        (statusFilter === 'Tersedia' && available) ||
        (statusFilter === 'Sudah Terisi' && !available)

      return matchesQuery && matchesSubject && matchesStatus
    })
  }, [search, statusFilter, students, subject])

  const availableList = useMemo(
    () => filteredStudents.filter((student) => isStudentAvailable(student)),
    [filteredStudents],
  )

  const filledList = useMemo(
    () => filteredStudents.filter((student) => !isStudentAvailable(student)),
    [filteredStudents],
  )

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
    if (formError) setFormError('')
  }

  const resetFilters = () => {
    setSearch('')
    setSubject('Semua')
    setStatusFilter('Semua')
  }

  const handleAddStudent = async (event) => {
    event.preventDefault()
    if (
      !form.nama.trim() ||
      !form.kelas.trim() ||
      !form.mapel.trim() ||
      !form.hari.trim() ||
      !form.alamat.trim()
    ) {
      setFormError('Semua kolom wajib diisi sebelum menyimpan.')
      return
    }

    try {
      setSubmitting(true)
      setFormError('')
      await addStudent({
        nama: form.nama.trim(),
        kelas: form.kelas.trim(),
        mapel: form.mapel.trim(),
        hari: form.hari.trim(),
        alamat: form.alamat.trim(),
        status: form.status,
        preferensiGender: form.preferensiGender,
        requestKhusus: form.requestKhusus.trim(),
      })
      setForm(INITIAL_FORM)
      setShowForm(false)
      setSubject('Semua')
      setStatusFilter('Semua')
      setFormSuccess('Siswa baru berhasil ditambahkan ke daftar waiting list.')
      window.setTimeout(() => setFormSuccess(''), 4000)
    } catch (err) {
      setFormError(err?.message || 'Gagal menambahkan data siswa.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <section className="page-hero">
        <span className="eyebrow">
          <Sparkles aria-hidden="true" size={14} />
          Portal distribusi les privat
        </span>
        <h1>
          Temukan siswa,
          <br />
          <span className="text-accent">ajukan dengan yakin.</span>
        </h1>
        <p>
          Daftar siswa yang membutuhkan tentor, terkelompok per mata pelajaran
          dan status ketersediaan. Tinjau jadwal, lokasi, preferensi gender,
          dan request khusus sebelum mengajukan ke HRD.
        </p>

        <div className="hero-stats">
          <span className="stat-pill">
            <Users aria-hidden="true" size={16} />
            <strong>{stats.students}</strong> total siswa
          </span>
          <span className="stat-pill">
            <CalendarCheck2 aria-hidden="true" size={16} />
            <strong>{stats.available}</strong> tersedia
          </span>
          <span className="stat-pill">
            <CheckCircle2 aria-hidden="true" size={16} />
            <strong>{stats.filled}</strong> sudah terisi / diproses
          </span>
          <span className="stat-pill">
            <BookOpen aria-hidden="true" size={16} />
            <strong>{stats.subjects}</strong> mapel
          </span>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Daftar siswa</h2>
            <p>
              Terpisah otomatis antara siswa tersedia dan yang sudah terisi.
            </p>
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
                <X aria-hidden="true" size={16} />
                Tutup
              </>
            ) : (
              <>
                <Plus aria-hidden="true" size={16} />
                Tambah Siswa
              </>
            )}
          </button>
        </div>

        {formSuccess && (
          <div className="notice notice--success" role="status">
            <CheckCircle2 size={18} aria-hidden="true" />
            <div>
              <strong>Data tersimpan</strong>
              <p>{formSuccess}</p>
            </div>
          </div>
        )}

        {showForm && (
          <form className="form-card" onSubmit={handleAddStudent}>
            <div className="form-card-head">
              <div>
                <h3>Tambah Siswa Waiting List</h3>
                <p>
                  Data langsung tersimpan dan dikelompokkan sesuai statusnya.
                </p>
              </div>
              <span className="tag tag--accent">
                <Sparkles size={13} aria-hidden="true" />
                Real-time
              </span>
            </div>

            <div className="form-grid">
              <label className="field">
                <span>Nama siswa</span>
                <input
                  type="text"
                  className="input"
                  value={form.nama}
                  onChange={handleChange('nama')}
                  placeholder="Contoh: Bima Sakti"
                />
              </label>

              <label className="field">
                <span>Jenjang / kelas</span>
                <input
                  type="text"
                  className="input"
                  value={form.kelas}
                  onChange={handleChange('kelas')}
                  placeholder="Contoh: 8 SMP"
                />
              </label>

              <label className="field">
                <span>Mata pelajaran</span>
                <input
                  type="text"
                  className="input"
                  value={form.mapel}
                  onChange={handleChange('mapel')}
                  placeholder="Contoh: Matematika"
                />
              </label>

              <label className="field">
                <span>Hari &amp; jam belajar</span>
                <input
                  type="text"
                  className="input"
                  value={form.hari}
                  onChange={handleChange('hari')}
                  placeholder="Contoh: Senin & Rabu (16.00)"
                />
              </label>

              <label className="field">
                <span>Status siswa</span>
                <select
                  className="select"
                  value={form.status}
                  onChange={handleChange('status')}
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
                  value={form.preferensiGender}
                  onChange={handleChange('preferensiGender')}
                >
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field field--full">
                <span>Alamat / wilayah</span>
                <input
                  type="text"
                  className="input"
                  value={form.alamat}
                  onChange={handleChange('alamat')}
                  placeholder="Contoh: Tembalang, Semarang"
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
                  value={form.requestKhusus}
                  onChange={handleChange('requestKhusus')}
                  placeholder="Contoh: Tentor berhijab, tegas/disiplin, atau santai dan komunikatif."
                />
                <span className="field-hint">
                  {form.requestKhusus.length}/500 karakter
                </span>
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
                {submitting ? 'Menyimpan...' : 'Simpan Siswa'}
              </button>
            </div>
          </form>
        )}

        <div className="filter-panel">
          <div className="filter-grid">
            <label className="search-field">
              <Search aria-hidden="true" size={18} />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama, kelas, mapel, request, atau wilayah..."
                aria-label="Cari siswa"
              />
            </label>

            <label className="select-field">
              <BookOpen size={17} aria-hidden="true" />
              <select
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                aria-label="Filter mata pelajaran"
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
              aria-label="Filter status ketersediaan"
            >
              {STATUS_FILTERS.map((statusItem) => (
                <button
                  key={statusItem}
                  type="button"
                  role="tab"
                  aria-selected={statusFilter === statusItem}
                  className={`segmented-btn ${
                    statusFilter === statusItem
                      ? 'segmented-btn--active'
                      : ''
                  }`}
                  onClick={() => setStatusFilter(statusItem)}
                >
                  {statusItem}
                </button>
              ))}
            </div>
            <span className="result-count">
              {filteredStudents.length} siswa ditampilkan
            </span>
          </div>
        </div>

        {loading ? (
          <CardGridSkeleton />
        ) : filteredStudents.length > 0 ? (
          <div className="student-groups">
            {availableList.length > 0 && (
              <div className="student-group">
                <div className="student-group-head">
                  <h3>
                    <CalendarCheck2 size={18} aria-hidden="true" />
                    Siswa Tersedia
                    <span className="group-count">{availableList.length}</span>
                  </h3>
                  <p>Siap diajukan ke HRD.</p>
                </div>
                <div className="entity-grid">
                  {availableList.map((student) => (
                    <StudentCard
                      key={student.id}
                      student={student}
                      onOpen={onOpenStudent}
                    />
                  ))}
                </div>
              </div>
            )}

            {filledList.length > 0 && (
              <div className="student-group student-group--muted">
                <div className="student-group-head">
                  <h3>
                    <CheckCircle2 size={18} aria-hidden="true" />
                    Sudah Terisi / Sedang Diproses
                    <span className="group-count">{filledList.length}</span>
                  </h3>
                  <p>Siswa yang sudah mendapatkan tentor atau menunggu HRD.</p>
                </div>
                <div className="entity-grid">
                  {filledList.map((student) => (
                    <StudentCard
                      key={student.id}
                      student={student}
                      onOpen={onOpenStudent}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="Siswa tidak ditemukan"
            message="Coba kata kunci lain atau tampilkan semua status dan mata pelajaran."
            action={
              <button
                type="button"
                className="btn btn--outline"
                onClick={resetFilters}
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
