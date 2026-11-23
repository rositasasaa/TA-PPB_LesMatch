import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppDataContext } from './appDataContext'
import studentService from '../services/studentService'
import tutorService from '../services/tutorService'
import submissionService from '../services/submissionService'
import {
  isStudentAvailable,
  isSubmissionApproved,
  isSubmissionPending,
  isSubmissionRejected,
} from '../utils/helpers'

const INITIAL_SOURCES = {
  students: 'local',
  tutors: 'local',
  submissions: 'local',
}

const findStudentForSubmission = (submission, students) => {
  if (!submission) return null

  if (submission.siswaId !== null && submission.siswaId !== undefined) {
    return (
      students.find(
        (item) => String(item.id) === String(submission.siswaId),
      ) || null
    )
  }

  const targetName = String(submission.namaSiswa || '').trim().toLowerCase()
  if (!targetName) return null

  return (
    students.find(
      (item) => String(item.nama || '').trim().toLowerCase() === targetName,
    ) || null
  )
}

const isRelatedSubmission = (candidate, submission) => {
  if (!candidate || !submission) return false

  if (
    submission.siswaId !== null &&
    submission.siswaId !== undefined &&
    candidate.siswaId !== null &&
    candidate.siswaId !== undefined
  ) {
    return String(candidate.siswaId) === String(submission.siswaId)
  }

  return (
    String(candidate.namaSiswa || '').trim().toLowerCase() ===
    String(submission.namaSiswa || '').trim().toLowerCase()
  )
}

/**
 * Derive the correct student status from the remaining submissions so
 * rejecting or deleting one application never frees a student who still has
 * another approved/pending application.
 */
const resolveStudentStatus = (submissions, submission) => {
  const related = submissions.filter((item) =>
    isRelatedSubmission(item, submission),
  )

  if (related.some(isSubmissionApproved)) return 'Sudah Terisi'
  if (related.some(isSubmissionPending)) return 'Sedang Diajukan'
  return 'Tersedia'
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

  const syncStudentStatus = useCallback(async (student, status) => {
    if (!student) return null
    if (String(student.status || '') === status) return student

    const result = await studentService.updateStudent(student.id, {
      ...student,
      status,
    })

    setStudents((previous) =>
      previous.map((item) =>
        String(item.id) === String(student.id) ? result.data : item,
      ),
    )
    setSources((previous) => ({
      ...previous,
      students: result.source,
    }))

    return result.data
  }, [])

  const addStudent = useCallback(async (payload) => {
    const result = await studentService.createStudent(payload)

    setStudents((previous) => {
      const next = previous.filter(
        (item) => String(item.id) !== String(result.data.id),
      )
      return [result.data, ...next]
    })
    setSources((previous) => ({
      ...previous,
      students: result.source,
    }))

    return result
  }, [])

  const updateStudent = useCallback(async (id, payload) => {
    const result = await studentService.updateStudent(id, payload)

    setStudents((previous) =>
      previous.map((item) =>
        String(item.id) === String(id) ? result.data : item,
      ),
    )
    setSources((previous) => ({
      ...previous,
      students: result.source,
    }))

    return result
  }, [])

  const deleteStudent = useCallback(async (id) => {
    const result = await studentService.deleteStudent(id)

    setStudents((previous) =>
      previous.filter((item) => String(item.id) !== String(id)),
    )
    setSources((previous) => ({
      ...previous,
      students: result.source,
    }))

    return result
  }, [])

  const addTutor = useCallback(async (payload) => {
    const result = await tutorService.createTutor(payload)

    setTutors((previous) => {
      const next = previous.filter(
        (item) => String(item.id) !== String(result.data.id),
      )
      return [result.data, ...next]
    })
    setSources((previous) => ({
      ...previous,
      tutors: result.source,
    }))

    return result
  }, [])

  const updateTutor = useCallback(async (id, payload) => {
    const result = await tutorService.updateTutor(id, payload)

    setTutors((previous) =>
      previous.map((item) =>
        String(item.id) === String(id) ? result.data : item,
      ),
    )
    setSources((previous) => ({
      ...previous,
      tutors: result.source,
    }))

    return result
  }, [])

  const deleteTutor = useCallback(async (id) => {
    const result = await tutorService.deleteTutor(id)

    setTutors((previous) =>
      previous.filter((item) => String(item.id) !== String(id)),
    )
    setSources((previous) => ({
      ...previous,
      tutors: result.source,
    }))

    return result
  }, [])

  const submitApplication = useCallback(
    async (payload) => {
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

      // Immediately reserve the student so every screen reflects the new
      // submission without waiting for a page reload.
      const student = students.find(
        (item) => String(item.id) === String(payload.siswaId),
      )
      if (student && isStudentAvailable(student)) {
        try {
          await syncStudentStatus(student, 'Sedang Diajukan')
        } catch (syncError) {
          console.info(
            '[LesMatch] Status siswa belum tersinkron:',
            syncError?.message,
          )
        }
      }

      return result
    },
    [students, syncStudentStatus],
  )

  const approveSubmission = useCallback(
    async (submission) => {
      const result = await submissionService.updateSubmission(submission.id, {
        ...submission,
        status: 'Disetujui HRD',
      })
      const updated = result.data

      setSubmissions((previous) =>
        previous.map((item) =>
          String(item.id) === String(submission.id) ? updated : item,
        ),
      )
      setSources((previous) => ({
        ...previous,
        submissions: result.source,
      }))

      const student = findStudentForSubmission(updated, students)
      if (student) {
        try {
          await syncStudentStatus(student, 'Sudah Terisi')
        } catch (syncError) {
          console.info(
            '[LesMatch] Status siswa belum tersinkron:',
            syncError?.message,
          )
        }
      }

      return result
    },
    [students, syncStudentStatus],
  )

  const rejectSubmission = useCallback(
    async (submission) => {
      const result = await submissionService.updateSubmission(submission.id, {
        ...submission,
        status: 'Ditolak',
      })
      const updated = result.data
      const nextSubmissions = submissions.map((item) =>
        String(item.id) === String(submission.id) ? updated : item,
      )

      setSubmissions(nextSubmissions)
      setSources((previous) => ({
        ...previous,
        submissions: result.source,
      }))

      const student = findStudentForSubmission(updated, students)
      if (student) {
        const nextStatus = resolveStudentStatus(nextSubmissions, updated)
        try {
          await syncStudentStatus(student, nextStatus)
        } catch (syncError) {
          console.info(
            '[LesMatch] Status siswa belum tersinkron:',
            syncError?.message,
          )
        }
      }

      return result
    },
    [students, submissions, syncStudentStatus],
  )

  const deleteSubmission = useCallback(
    async (submission) => {
      const result = await submissionService.deleteSubmission(submission.id)
      const remaining = submissions.filter(
        (item) => String(item.id) !== String(submission.id),
      )

      setSubmissions(remaining)
      setSources((previous) => ({
        ...previous,
        submissions: result.source,
      }))

      const wasActive =
        isSubmissionPending(submission) || isSubmissionApproved(submission)
      const student = findStudentForSubmission(submission, students)

      if (student && wasActive) {
        const nextStatus = resolveStudentStatus(remaining, submission)
        try {
          await syncStudentStatus(student, nextStatus)
        } catch (syncError) {
          console.info(
            '[LesMatch] Status siswa belum tersinkron:',
            syncError?.message,
          )
        }
      }

      return result
    },
    [students, submissions, syncStudentStatus],
  )

  const source = useMemo(() => {
    const values = Object.values(sources)
    if (values.includes('supabase')) return 'supabase'
    if (values.includes('express')) return 'express'
    return 'local'
  }, [sources])

  const stats = useMemo(() => {
    const available = students.filter(isStudentAvailable).length
    const filled = Math.max(0, students.length - available)
    const pending = submissions.filter(isSubmissionPending).length
    const approved = submissions.filter(isSubmissionApproved).length
    const rejected = submissions.filter(isSubmissionRejected).length

    return {
      students: students.length,
      tutors: tutors.length,
      submissions: submissions.length,
      available,
      filled,
      pending,
      approved,
      rejected,
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
      addStudent,
      updateStudent,
      deleteStudent,
      addTutor,
      updateTutor,
      deleteTutor,
      submitApplication,
      approveSubmission,
      rejectSubmission,
      deleteSubmission,
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
      addStudent,
      updateStudent,
      deleteStudent,
      addTutor,
      updateTutor,
      deleteTutor,
      submitApplication,
      approveSubmission,
      rejectSubmission,
      deleteSubmission,
    ],
  )

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  )
}
