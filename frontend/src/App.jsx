import { useEffect, useState } from 'react'
import AppHeader from './components/AppHeader'
import Footer from './components/Footer'
import InstallBanner from './components/InstallBanner'
import SplashScreen from './components/SplashScreen'
import AppDataProvider from './context/AppDataProvider'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { usePwaInstall } from './hooks/usePwaInstall'
import ProfilePage from './pages/ProfilePage'
import StudentDetailPage from './pages/StudentDetailPage'
import StudentsPage from './pages/StudentsPage'
import SubmissionsPage from './pages/SubmissionsPage'
import TutorDetailPage from './pages/TutorDetailPage'
import TutorsPage from './pages/TutorsPage'
import './App.css'

const SPLASH_DURATION = 1100

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [route, setRoute] = useState({
    name: 'students',
    id: null,
    tutorId: null,
  })
  const online = useOnlineStatus()
  const { canInstall, isInstalled, install } = usePwaInstall()

  useEffect(() => {
    const timer = window.setTimeout(
      () => setShowSplash(false),
      SPLASH_DURATION,
    )
    return () => window.clearTimeout(timer)
  }, [])

  const navigate = (name, id = null, params = {}) => {
    setRoute({ name, id, ...params })
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  const activeTab =
    route.name === 'student-detail'
      ? 'students'
      : route.name === 'tutor-detail'
        ? 'tutors'
        : route.name

  let page = null

  switch (route.name) {
    case 'tutors':
      page = (
        <TutorsPage
          onOpenTutor={(tutorId) => navigate('tutor-detail', tutorId)}
        />
      )
      break
    case 'tutor-detail':
      page = (
        <TutorDetailPage
          key={`tutor-${route.id}`}
          tutorId={route.id}
          onBack={() => navigate('tutors')}
          onOpenStudent={(studentId, tutorId) =>
            navigate('student-detail', studentId, { tutorId })
          }
          onBrowseStudents={() => navigate('students')}
        />
      )
      break
    case 'submissions':
      page = (
        <SubmissionsPage onBrowseStudents={() => navigate('students')} />
      )
      break
    case 'profile':
      page = (
        <ProfilePage
          online={online}
          canInstall={canInstall}
          isInstalled={isInstalled}
          onInstall={install}
        />
      )
      break
    case 'student-detail':
      page = (
        <StudentDetailPage
          key={`student-${route.id}-${route.tutorId || 'none'}`}
          studentId={route.id}
          preselectedTutorId={route.tutorId}
          onBack={() => navigate('students')}
          onOpenSubmissions={() => navigate('submissions')}
        />
      )
      break
    case 'students':
    default:
      page = (
        <StudentsPage
          onOpenStudent={(studentId) => navigate('student-detail', studentId)}
        />
      )
  }

  return (
    <AppDataProvider>
      <div className="app-shell">
        {showSplash && <SplashScreen />}

        <AppHeader
          active={activeTab}
          onNavigate={navigate}
          online={online}
          canInstall={canInstall}
          onInstall={install}
          onHome={() => navigate('students')}
        />

        <main className="app-main">{page}</main>

        <InstallBanner canInstall={canInstall} onInstall={install} />
        <Footer onNavigate={navigate} />
      </div>
    </AppDataProvider>
  )
}

export default App
