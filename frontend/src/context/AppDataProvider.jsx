import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { AppDataContext } from './appDataContext'
import studentService from '../services/studentService'
import tutorService from '../services/tutorService'
import submissionService from '../services/submissionService'

const INITIAL_SOURCES = {
  students: 'local',
  tutors: 'local',
  submissions: 'local',
}

export default function AppDataProvider({ children }) {
  const [students, setStudents] = useState([])
  const [tutors, setTutors] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [sources, setSources] = useState(INITIAL_SOURCES)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true)

    try {
      const [studentResult, tutorResult, submissionResult] = await Promise.all([
        studentService.fetchStudents(),
        tutorService.fetchTutors(),
        submissionService.fetchSubmissions(),
      ])

      setStudents(studentResult.data)
      setTutors(tutorResult.data)
      setSubmissions(submissionResult.data)
      setSources({
        students: studentResult.source,
        tutors: tutorResult.source,
        submissions: submissionResult.source,
      })
      setError(null)
    } catch (err) {
      setError(err?.message || 'Gagal memuat data LesMatch.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Initial data fetch from Supabase → Express → local fallback.
    // oxlint-disable-next-line react/set-state-in-effect
    load()
  }, [load])

  const submitApplication = useCallback(async (payload) => {
    const result = await submissionService.createSubmission(payload)

    setSubmissions((previous) => {
      const next = previous.filter(
        (item) => String(item.id) !== String(result.data.id),
      )
      return [result.data, ...next]
    })
    setSources((previous) => ({
      ...previous,
      submissions: result.source,
    }))

    return result
  }, [])

  const source = useMemo(() => {
    const values = Object.values(sources)
    if (values.includes('supabase')) return 'supabase'
    if (values.includes('express')) return 'express'
    return 'local'
  }, [sources])

  const stats = useMemo(() => {
    const available = students.filter((student) =>
      String(student.status).toLowerCase().includes('tersedia'),
    ).length
    const pending = submissions.filter((submission) =>
      String(submission.status).toLowerCase().includes('menunggu'),
    ).length

    return {
      students: students.length,
      tutors: tutors.length,
      submissions: submissions.length,
      available,
      pending,
      subjects: new Set(students.map((student) => student.mapel)).size,
    }
  }, [students, submissions, tutors])

  const value = useMemo(
    () => ({
      students,
      tutors,
      submissions,
      sources,
      source,
      loading,
      error,
      stats,
      refresh: () => load(true),
      submitApplication,
    }),
    [
      students,
      tutors,
      submissions,
      sources,
      source,
      loading,
      error,
      stats,
      load,
      submitApplication,
    ],
  )

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  )
}
