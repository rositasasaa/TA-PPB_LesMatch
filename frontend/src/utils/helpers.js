export const GENDER_OPTIONS = ['Bebas', 'Perempuan', 'Laki-laki']

export const getInitials = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'LM'
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export const uniqueSubjects = (students = []) =>
  [...new Set(students.map((student) => student.mapel).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, 'id'),
  )

export const getExpertiseTokens = (keahlian = '') =>
  String(keahlian)
    .split(/[,&/]/)
    .map((item) => item.trim())
    .filter(Boolean)

export const getExpertiseList = (keahlian = '') =>
  getExpertiseTokens(keahlian).map((item) => item.toLowerCase())

export const uniqueExpertise = (tutors = []) => {
  const values = new Set()
  tutors.forEach((tutor) => {
    getExpertiseTokens(tutor?.keahlian).forEach((item) => values.add(item))
  })
  return [...values].sort((a, b) => a.localeCompare(b, 'id'))
}

export const normalizeGender = (value = 'Bebas') => {
  const text = String(value).trim().toLowerCase()
  if (
    text.includes('perempuan') ||
    text.includes('wanita') ||
    text.includes('cewek')
  ) {
    return 'Perempuan'
  }
  if (
    text.includes('laki') ||
    text.includes('pria') ||
    text.includes('cowok')
  ) {
    return 'Laki-laki'
  }
  return 'Bebas'
}

export const isStudentAvailable = (student) =>
  String(student?.status || '').toLowerCase().includes('tersedia')

export const isStudentFilled = (student) =>
  String(student?.status || '').toLowerCase().includes('terisi')

export const isSubmissionPending = (submission) =>
  String(submission?.status || '').toLowerCase().includes('menunggu')

export const isSubmissionApproved = (submission) =>
  String(submission?.status || '').toLowerCase().includes('disetujui')

export const isSubmissionRejected = (submission) =>
  String(submission?.status || '').toLowerCase().includes('tolak')

/**
 * Gender compatibility between a tutor and a student preference.
 * Legacy tutors without a gender are treated as compatible so the existing
 * data set never becomes unusable after the new field is introduced.
 */
export const tutorMatchesGender = (tutor, preference = 'Bebas') => {
  const wanted = normalizeGender(preference)
  if (wanted === 'Bebas') return true

  const tutorGender = normalizeGender(tutor?.gender)
  if (tutorGender === 'Bebas') return true

  return tutorGender === wanted
}

/**
 * Match a tutor against a student (or a plain subject string).
 *
 * When a student object is supplied, the match also requires the student to
 * still be "Tersedia" and the tutor gender to satisfy the student's gender
 * preference. Passing a string keeps the old subject-only behaviour used by
 * the tutor directory filter.
 */
export const tutorMatchesSubject = (tutor, target = '') => {
  const isStudent = target !== null && typeof target === 'object'
  const subject = isStudent ? target.mapel : target
  const normalizedSubject = String(subject || '').toLowerCase().trim()
  if (!normalizedSubject) return false

  const subjectMatch = getExpertiseList(tutor?.keahlian).some(
    (expertise) =>
      expertise.includes(normalizedSubject) ||
      normalizedSubject.includes(expertise),
  )
  if (!subjectMatch) return false
  if (!isStudent) return true

  if (!isStudentAvailable(target)) return false
  return tutorMatchesGender(tutor, target.preferensiGender)
}

/**
 * Active teaching load for a tutor.
 *
 * The primary link is an approved submission (Disetujui HRD). Optional
 * `namaTentor` / `tutor` fields on a student are also supported so the model
 * keeps working if the database later stores the tutor directly on a student.
 */
export const getTutorWorkload = (
  tutor,
  students = [],
  submissions = [],
) => {
  if (!tutor) return { count: 0, students: [], names: [] }

  const tutorName = String(tutor.nama || '').trim().toLowerCase()
  if (!tutorName) return { count: 0, students: [], names: [] }

  const seen = new Set()
  const list = []

  const addStudent = (id, nama) => {
    const name = String(nama || '').trim()
    const key = String(id ?? name).toLowerCase()
    if (!key || !name || seen.has(key)) return
    seen.add(key)
    list.push({ id, nama: name })
  }

  submissions.filter(isSubmissionApproved).forEach((submission) => {
    const submissionTutor = String(submission.namaTentor || '')
      .trim()
      .toLowerCase()
    if (submissionTutor !== tutorName) return

    const linkedStudent = students.find(
      (student) => String(student.id) === String(submission.siswaId),
    )
    addStudent(
      linkedStudent?.id ?? submission.siswaId,
      linkedStudent?.nama || submission.namaSiswa,
    )
  })

  students.forEach((student) => {
    const linkedTutor = String(student.namaTentor || student.tutor || '')
      .trim()
      .toLowerCase()
    if (!linkedTutor || linkedTutor !== tutorName) return
    if (!isStudentFilled(student)) return
    addStudent(student.id, student.nama)
  })

  return {
    count: list.length,
    students: list,
    names: list.map((item) => item.nama),
  }
}

export const formatDate = (value) => {
  if (!value) return 'Baru saja'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Baru saja'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export const pluralize = (count, singular, plural = `${singular}`) =>
  `${count} ${count === 1 ? singular : plural}`
