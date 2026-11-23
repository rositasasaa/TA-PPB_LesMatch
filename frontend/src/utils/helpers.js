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

const STUDENT_STATUS_ALIASES = {
  tersedia: 'Tersedia',
  terisi: 'Sudah Terisi',
  'sudah terisi': 'Sudah Terisi',
  'sedang diajukan': 'Sedang Diajukan',
}

/**
 * Canonical student status label used everywhere in the UI.
 * Legacy rows may store "Terisi"; it must always render as "Sudah Terisi".
 */
export const normalizeStudentStatus = (status = 'Tersedia') => {
  const value = String(status || '')
    .trim()
    .replace(/\s+/g, ' ')
  if (!value) return 'Tersedia'

  return STUDENT_STATUS_ALIASES[value.toLowerCase()] || value
}

export const isStudentAvailable = (student) =>
  normalizeStudentStatus(student?.status) === 'Tersedia'

export const isStudentFilled = (student) =>
  normalizeStudentStatus(student?.status) === 'Sudah Terisi'

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

const DAY_NAMES = {
  sen: 'Senin',
  senin: 'Senin',
  sel: 'Selasa',
  selasa: 'Selasa',
  rab: 'Rabu',
  rabu: 'Rabu',
  kam: 'Kamis',
  kamis: 'Kamis',
  jum: 'Jumat',
  jumat: 'Jumat',
  sab: 'Sabtu',
  sabtu: 'Sabtu',
  min: 'Minggu',
  minggu: 'Minggu',
  ahad: 'Minggu',
}

const SESSION_DURATION_MINUTES = 90

/**
 * Extract every day/time pair from a free-form schedule string.
 * Supports values such as "Senin & Rabu (16.00)", "Selasa (15:30)",
 * and "Senin (16.00) & Jumat (18.30)".
 */
const parseScheduleSlots = (schedule = '') => {
  const text = String(schedule || '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/\s+/g, ' ')
  if (!text) return []

  const dayPattern =
    /\b(senin|sen|selasa|sel|rabu|rab|kamis|kam|jumat|jum|sabtu|sab|minggu|min|ahad)\b/g
  const timePattern = /\b([01]?\d|2[0-3])[.:]([0-5]\d)\b/g
  const days = []
  const times = []
  let match

  while ((match = dayPattern.exec(text)) !== null) {
    days.push({ day: DAY_NAMES[match[1]], index: match.index })
  }

  while ((match = timePattern.exec(text)) !== null) {
    times.push({
      start: Number(match[1]) * 60 + Number(match[2]),
      index: match.index,
    })
  }

  if (days.length === 0 || times.length === 0) return []

  const slots = []
  const seen = new Set()

  days.forEach((entry) => {
    const nextTime = times.find((time) => time.index >= entry.index)
    const previousTime = [...times]
      .reverse()
      .find((time) => time.index < entry.index)
    const time = nextTime || previousTime
    if (!time) return

    const key = `${entry.day}-${time.start}`
    if (seen.has(key)) return
    seen.add(key)
    slots.push({ day: entry.day, start: time.start })
  })

  return slots
}

const formatSessionTime = (minutes) => {
  const normalized = ((minutes % 1440) + 1440) % 1440
  const hours = Math.floor(normalized / 60)
  const mins = normalized % 60
  return `${String(hours).padStart(2, '0')}.${String(mins).padStart(2, '0')}`
}

const normalizeText = (value = '') =>
  String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()

const findStudentForSubmission = (submission, students) => {
  if (!submission) return null

  if (submission.siswaId !== null && submission.siswaId !== undefined) {
    return (
      students.find(
        (student) => String(student.id) === String(submission.siswaId),
      ) || null
    )
  }

  const name = normalizeText(submission.namaSiswa)
  if (!name) return null

  return (
    students.find((student) => normalizeText(student.nama) === name) || null
  )
}

/**
 * Detect a schedule clash between a target schedule and a tutor's active load.
 *
 * A student counts as active when their status is "Sudah Terisi" and they are
 * linked to the tutor directly, or when a "Disetujui HRD" submission links
 * them to the tutor. Each lesson is treated as a 90-minute window, so two
 * sessions conflict when they fall on the same day and their start times are
 * less than 90 minutes apart.
 *
 * Returns the conflicting student details, or null when the tutor is free.
 */
export const checkScheduleConflict = (
  targetDayTime,
  tutorName,
  students = [],
  submissions = [],
) => {
  const targetSlots = parseScheduleSlots(targetDayTime)
  const normalizedTutor = normalizeText(tutorName)
  if (targetSlots.length === 0 || !normalizedTutor) return null

  const candidates = []
  const seen = new Set()

  const addCandidate = (student) => {
    if (!student) return
    const key = normalizeText(student.id || student.nama)
    if (!key || seen.has(key)) return
    seen.add(key)
    candidates.push(student)
  }

  submissions.forEach((submission) => {
    if (!isSubmissionApproved(submission)) return
    if (normalizeText(submission.namaTentor) !== normalizedTutor) return

    addCandidate(findStudentForSubmission(submission, students))
  })

  students.forEach((student) => {
    if (!isStudentFilled(student)) return
    if (
      normalizeText(student.namaTentor || student.tutor) !== normalizedTutor
    ) {
      return
    }

    addCandidate(student)
  })

  for (const student of candidates) {
    const activeSlots = parseScheduleSlots(student.hari)

    for (const targetSlot of targetSlots) {
      const activeSlot = activeSlots.find(
        (slot) =>
          slot.day === targetSlot.day &&
          Math.abs(slot.start - targetSlot.start) <
            SESSION_DURATION_MINUTES,
      )
      if (!activeSlot) continue

      const overlapStart = Math.max(targetSlot.start, activeSlot.start)
      const overlapEnd = Math.min(
        targetSlot.start + SESSION_DURATION_MINUTES,
        activeSlot.start + SESSION_DURATION_MINUTES,
      )

      return {
        hasConflict: true,
        tutorName: String(tutorName).trim(),
        studentId: student.id,
        studentName: student.nama,
        studentSchedule: student.hari,
        targetSchedule: targetDayTime,
        day: targetSlot.day,
        overlapStart,
        overlapEnd,
        overlapLabel: `${targetSlot.day}, ${formatSessionTime(
          overlapStart,
        )}–${formatSessionTime(overlapEnd)}`,
      }
    }
  }

  return null
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
