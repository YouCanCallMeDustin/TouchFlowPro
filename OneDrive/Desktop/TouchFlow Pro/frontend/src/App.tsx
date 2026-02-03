import { useState, useEffect, useCallback } from 'react'
import './App.css'
import TypingTest from './components/TypingTest'
import Curriculum from './components/Curriculum'
import LessonView from './components/LessonView'
import HeatMap from './components/HeatMap'
import Login from './components/Auth/Login'
import Signup from './components/Auth/Signup'
import { useAuth } from './context/AuthContext'
import type { TypingMetrics, KeystrokeEvent } from '@shared/types'
import type { UserProgress, Lesson } from '@shared/curriculum'
import type { DifficultyLevel, PlacementResult } from '@shared/placement'
import { getTheme } from '@shared/specialtyThemes'

type Stage = 'welcome' | 'assessment' | 'placement' | 'curriculum' | 'lesson' | 'levelup' | 'auth_login' | 'auth_signup'

function App() {
  const { user, loading, logout } = useAuth()
  const [stage, setStage] = useState<Stage>('welcome')
  const [assessmentMetrics, setAssessmentMetrics] = useState<TypingMetrics | null>(null)
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [placementResult, setPlacementResult] = useState<PlacementResult | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [levelUpInfo, setLevelUpInfo] = useState<{ newLevel: DifficultyLevel; message: string } | null>(null)
  const [isFetchingProgress, setIsFetchingProgress] = useState(false)

  const baselineText = "Precision. Speed. Confidence. These are the hallmarks of a professional typist. Your journey starts with this baseline assessment to measure your current performance."

  const fetchProgress = useCallback(async (id: string) => {
    setIsFetchingProgress(true)
    try {
      const response = await fetch(`http://localhost:4000/api/progress/${id}`)
      if (response.ok) {
        const data = await response.json()
        setUserProgress(data)
        setStage('curriculum')
      } else {
        // If not found, user might need assessment
        setStage('welcome')
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error)
    } finally {
      setIsFetchingProgress(false)
    }
  }, [])

  useEffect(() => {
    if (!loading) {
      if (user) {
        fetchProgress(user.id)
      } else {
        setStage('auth_login')
      }
    }
  }, [user, loading, fetchProgress])

  const handleAssessmentComplete = async (metrics: TypingMetrics) => {
    if (!user) return
    setAssessmentMetrics(metrics)

    try {
      const response = await fetch('http://localhost:4000/api/progress/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, metrics })
      })

      const data = await response.json()
      setPlacementResult(data.placement)
      setUserProgress(data.progress)
      setStage('placement')
    } catch (error) {
      console.error('Failed to process assessment:', error)
    }
  }

  const handleStartLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson)
    setStage('lesson')
  }

  const handleLessonComplete = async (metrics: TypingMetrics, _passed: boolean) => {
    if (!currentLesson || !userProgress || !user) return

    try {
      const response = await fetch(`http://localhost:4000/api/progress/${user.id}/lesson/${currentLesson.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics, lesson: currentLesson })
      })

      const data = await response.json()
      setUserProgress(data.progress)

      if (data.leveledUp && data.newLevel) {
        setLevelUpInfo({
          newLevel: data.newLevel,
          message: data.levelUpMessage
        })
        setStage('levelup')
      } else {
        setStage('curriculum')
      }
    } catch (error) {
      console.error('Failed to complete lesson:', error)
      setStage('curriculum')
    }
  }

  if (loading || isFetchingProgress) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-heading font-extrabold animate-pulse bg-gradient-to-r from-primary-blue to-secondary-teal bg-clip-text text-transparent mb-4">
            TouchFlow Pro
          </div>
          <div className="text-text-muted tracking-widest uppercase text-xs font-bold">Initializing Mastery...</div>
        </div>
      </div>
    )
  }

  const activeTheme = currentLesson ? getTheme(currentLesson.category) : null;

  return (
    <div className={`min-h-screen transition-all duration-1000 selection:bg-secondary-teal/20 ${activeTheme ? `bg-gradient-to-br ${activeTheme.bgClass}` : 'bg-bg-main'}`}>
      <header className={`sticky top-0 z-50 backdrop-blur-md ${activeTheme ? 'bg-black/10 text-white border-white/5' : 'bg-white/50 border-slate-200/50'} border-b px-6 sm:px-12 py-4 flex justify-between items-center transition-all`}>
        <div className="flex flex-col">
          <h1
            className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tighter cursor-pointer bg-gradient-to-br from-primary-blue to-secondary-teal bg-clip-text text-transparent active:scale-95 transition-transform"
            onClick={() => userProgress && setStage('curriculum')}
          >
            TouchFlow
          </h1>
          <span className={`text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] ${activeTheme ? activeTheme.accentColor : 'text-accent-orange'} leading-none -mt-1`}>
            Pro Mastery
          </span>
        </div>

        {user && (
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-text-muted uppercase tracking-tighter">Session Active</span>
              <span className="text-sm font-semibold text-text-main leading-none">{user.email}</span>
            </div>
            <button
              onClick={logout}
              className={`px-4 py-2 text-xs font-bold ${activeTheme ? 'text-white border-white/20 hover:bg-white/10' : 'text-text-muted border-slate-200 hover:bg-slate-50'} rounded-lg transition-all active:scale-95 uppercase tracking-wider`}
            >
              Sign Out
            </button>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex justify-center w-full">
        {stage === 'auth_login' && <Login onSwitchToSignup={() => setStage('auth_signup')} />}
        {stage === 'auth_signup' && <Signup onSwitchToLogin={() => setStage('auth_login')} />}

        {stage === 'welcome' && (
          <div className="max-w-2xl w-full bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl p-8 sm:p-12 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-8 text-4xl">📚</div>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold mb-4 text-text-main">Ready to Personalize Your Training?</h2>
            <p className="text-text-muted text-lg mb-10 leading-relaxed">
              To establish your custom curriculum, we first need to establish a baseline. This assessment will measure your speed and accuracy on professional-grade content.
            </p>
            <button
              className="w-full sm:w-auto bg-gradient-to-r from-primary-blue to-blue-800 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all"
              onClick={() => setStage('assessment')}
            >
              Start Baseline Assessment
            </button>
          </div>
        )}

        {stage === 'assessment' && (
          <div className="w-full">
            <TypingTest text={baselineText} onComplete={handleAssessmentComplete} />
          </div>
        )}

        {stage === 'placement' && placementResult && assessmentMetrics && (
          <div className="max-w-4xl w-full">
            <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl p-8 sm:p-14 text-center">
              <div className="text-6xl mb-6 drop-shadow-sm">🎯</div>
              <h2 className="text-4xl sm:text-5xl font-heading font-extrabold mb-8 tracking-tight">Assessment Complete!</h2>

              <div className="grid grid-cols-2 gap-6 mb-12">
                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                  <div className="text-4xl sm:text-5xl font-heading font-extrabold bg-gradient-to-br from-primary-blue to-blue-800 bg-clip-text text-transparent">
                    {assessmentMetrics.netWPM}
                  </div>
                  <div className="text-xs font-bold text-text-muted uppercase tracking-[0.2em] mt-2">Net WPM</div>
                </div>
                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                  <div className="text-4xl sm:text-5xl font-heading font-extrabold bg-gradient-to-br from-secondary-teal to-teal-800 bg-clip-text text-transparent">
                    {assessmentMetrics.accuracy}%
                  </div>
                  <div className="text-xs font-bold text-text-muted uppercase tracking-[0.2em] mt-2">Accuracy</div>
                </div>
              </div>

              <div className="mb-12">
                <HeatMap errorMap={assessmentMetrics.errorMap} />
              </div>

              <div className="p-8 rounded-2xl bg-gradient-to-br from-primary-blue to-secondary-teal text-white shadow-xl mb-12">
                <h3 className="text-white text-2xl font-bold mb-3 flex items-center justify-center gap-3">
                  <span className="bg-white/20 px-3 py-1 rounded-lg text-sm uppercase tracking-widest font-black">Level</span>
                  {placementResult.level}
                </h3>
                <p className="text-white/90 text-lg leading-relaxed">{placementResult.reason}</p>
              </div>

              <button
                className="w-full sm:w-auto bg-white text-primary-blue border-2 border-primary-blue px-12 py-4 rounded-xl font-bold text-xl hover:bg-primary-blue hover:text-white shadow-lg hover:shadow-xl transition-all"
                onClick={() => setStage('curriculum')}
              >
                Start Learning Journey
              </button>
            </div>
          </div>
        )}

        {stage === 'curriculum' && userProgress && user && (
          <div className="w-full">
            <Curriculum
              userId={user.id}
              progress={userProgress}
              onStartLesson={handleStartLesson}
              onLevelChange={() => { }}
            />
          </div>
        )}

        {stage === 'lesson' && currentLesson && user && (
          <div className="w-full">
            <LessonView
              lesson={currentLesson}
              userId={user.id}
              onComplete={handleLessonComplete}
              onCancel={() => setStage('curriculum')}
            />
          </div>
        )}

        {stage === 'levelup' && levelUpInfo && (
          <div className="max-w-2xl w-full bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl p-8 sm:p-16 text-center">
            <div className="text-7xl mb-8 animate-bounce">🚀</div>
            <h2 className="text-4xl sm:text-6xl font-heading font-extrabold mb-6 text-secondary-teal tracking-tighter">
              Level Up!
            </h2>
            <p className="text-2xl sm:text-3xl font-medium mb-4 text-text-main">
              You've unlocked <strong className="font-extrabold text-blue-600">{levelUpInfo.newLevel}</strong> level!
            </p>
            <p className="text-text-muted text-lg mb-12 leading-relaxed">
              {levelUpInfo.message}
            </p>
            <button
              className="w-full bg-secondary-teal text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl hover:bg-teal-700 transition-all hover:-translate-y-1 active:translate-y-0"
              onClick={() => setStage('curriculum')}
            >
              Continue to {levelUpInfo.newLevel} Curriculum
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
