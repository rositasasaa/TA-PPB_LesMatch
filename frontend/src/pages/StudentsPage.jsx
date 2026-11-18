import {
  BookOpen,
  CalendarCheck2,
  Search,
  Sparkles,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAppData } from '../context/appDataContext'
import { uniqueSubjects } from '../utils/helpers'
import DataSourceBadge from '../components/DataSourceBadge'
import EmptyState from '../components/EmptyState'
import StudentCard from '../components/StudentCard'
import { CardGridSkeleton } from '../components/Skeletons'

export default function StudentsPage({ onOpenStudent }) {
  const { students, loading, source, stats } = useAppData()
  const [search, setSearch] = useState('')
  const [subject, setSubject] = useState('Semua')

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
        ].some((value) => String(value).toLowerCase().includes(query))

      const matchesSubject =
        subject === 'Semua' || student.mapel === subject

      return matchesQuery && matchesSubject
    })
  }, [search, students, subject])

  return (
    <div className="page">
      <section className="page-hero">
        <span className="eyebrow">
          <Sparkles size={14} aria-hidden="true" />
          Portal distribusi les privat
        </span>
        <h1>
          Temukan siswa,
          <br />
          <span className="text-accent">ajukan dengan yakin.</span>
        </h1>
        <p>
          Daftar siswa yang membutuhkan tentor, terkelompok per mata
          pelajaran. Tinjau jadwal dan lokasi, lalu ajukan ke HRD dalam satu
          alur.
        </p>

        <div className="hero-stats">
          <span className="stat-pill">
            <Users size={16} aria-hidden="true" />
            <strong>{stats.students}</strong> siswa
          </span>
          <span className="stat-pill">
            <BookOpen size={16} aria-hidden="true" />
            <strong>{stats.subjects}</strong> mata pelajaran
          </span>
          <span className="stat-pill">
            <CalendarCheck2 size={16} aria-hidden="true" />
            <strong>{stats.available}</strong> tersedia
          </span>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Daftar siswa</h2>
            <p>Data aktif dari Supabase, API Express, atau cache offline.</p>
          </div>
          <DataSourceBadge source={source} />
        </div>

        <div className="toolbar">
          <label className="search-field">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama, kelas, mapel, atau wilayah..."
              aria-label="Cari siswa"
            />
          </label>

          <div className="chip-row" aria-label="Filter mata pelajaran">
            <button
              type="button"
              className={`chip ${subject === 'Semua' ? 'chip--active' : ''}`}
              onClick={() => setSubject('Semua')}
            >
              Semua
            </button>
            {subjects.map((item) => (
              <button
                key={item}
                type="button"
                className={`chip ${subject === item ? 'chip--active' : ''}`}
                onClick={() => setSubject(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <CardGridSkeleton />
        ) : filteredStudents.length > 0 ? (
          <div className="entity-grid">
            {filteredStudents.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onOpen={onOpenStudent}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="Siswa tidak ditemukan"
            message="Coba kata kunci lain atau tampilkan semua mata pelajaran."
            action={
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => {
                  setSearch('')
                  setSubject('Semua')
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
