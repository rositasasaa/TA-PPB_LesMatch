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

export const getExpertiseList = (keahlian = '') =>
  String(keahlian)
    .toLowerCase()
    .split(/[,&/]/)
    .map((item) => item.trim())
    .filter(Boolean)

export const tutorMatchesSubject = (tutor, subject = '') => {
  const target = String(subject).toLowerCase().trim()
  if (!target) return false
  return getExpertiseList(tutor.keahlian).some(
    (expertise) =>
      expertise.includes(target) || target.includes(expertise),
  )
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
