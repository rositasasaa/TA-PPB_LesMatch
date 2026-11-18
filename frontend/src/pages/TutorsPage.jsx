import { GraduationCap, Search, Sparkles, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAppData } from '../context/appDataContext'
import { tutorMatchesSubject, uniqueSubjects } from '../utils/helpers'
import DataSourceBadge from '../components/DataSourceBadge'
import EmptyState from '../components/EmptyState'
import TutorCard from '../components/TutorCard'
import { CardGridSkeleton } from '../components/Skeletons'

export default function TutorsPage({ onOpenTutor }) {
  const { tutors, students, loading, source, stats } = useAppData()
  const [search, setSearch] = useState('')
  const [subject, setSubject] = useState('Semua')

  const subjects = useMemo(() => uniqueSubjects(students), [students])

  const availableStudents = useMemo(
    () =>
      students.filter((student) =>
        String(student.status).toLowerCase().includes('tersedia'),
      ),
    [students],
  )

  const filteredTutors = useMemo(() => {
    const query = search.trim().toLowerCase()

    return tutors.filter((tutor) => {
      const matchesQuery =
        !query ||
        [tutor.nama, tutor.keahlian, tutor.domisili, tutor.pengalaman].some(
          (value) => String(value).toLowerCase().includes(query),
        )

      const matchesSubject =
        subject === 'Semua' || tutorMatchesSubject(tutor, subject)

      return matchesQuery && matchesSubject
    })
  }, [search, subject, tutors])

  return (
    <div className="page">
      <section className="page-hero">
        <span className="eyebrow">
          <Sparkles size={14} aria-hidden="true" />
          Direktori tentor
        </span>
        <h1>
          Keahlian yang tepat,
          <br />
          <span className="text-accent">untuk setiap siswa.</span>
        </h1>
        <p>
          Kenali tentor LesMatch, lihat bidang keahliannya, dan temukan siswa
          yang paling cocok untuk diajarkan.
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
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Daftar tentor</h2>
            <p>Pilih tentor untuk melihat profil dan siswa yang cocok.</p>
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
              placeholder="Cari nama, keahlian, atau domisili..."
              aria-label="Cari tentor"
            />
          </label>

          <div className="chip-row" aria-label="Filter keahlian">
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
        ) : filteredTutors.length > 0 ? (
          <div className="entity-grid">
            {filteredTutors.map((tutor) => {
              const matchCount = availableStudents.filter((student) =>
                tutorMatchesSubject(tutor, student.mapel),
              ).length

              return (
                <TutorCard
                  key={tutor.id}
                  tutor={tutor}
                  matchCount={matchCount}
                  onOpen={onOpenTutor}
                />
              )
            })}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="Tentor tidak ditemukan"
            message="Coba kata kunci lain atau tampilkan semua keahlian."
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
