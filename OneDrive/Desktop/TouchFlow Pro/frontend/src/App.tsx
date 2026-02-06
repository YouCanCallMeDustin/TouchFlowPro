import { TypingEngine } from '@shared/typingEngine'
import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import './App.css'
import TypingTest from './components/TypingTest'
import PageTransition from './components/PageTransition'
import Curriculum from './components/Curriculum'
import LessonView from './components/LessonView'
import HeatMap from './components/HeatMap'
import Login from './components/Auth/Login'
import Signup from './components/Auth/Signup'
import AnalyticsDashboard from './pages/AnalyticsDashboard'
import SessionHistory from './pages/SessionHistory'
import AchievementsPanel from './pages/AchievementsPanel'
import CustomDrillBuilder from './pages/CustomDrillBuilder'
import GoalsDashboard from './pages/GoalsDashboard'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Practice from './pages/Practice'
import BiblePractice from './pages/BiblePractice'
import AdaptivePractice from './pages/AdaptivePractice'
import Leaderboard from './pages/Leaderboard'
import AchievementModal from './components/AchievementModal'
import ErrorBoundary from './components/ErrorBoundary'
import { useAuth } from './context/AuthContext'
import type { TypingMetrics } from '@shared/types'
import type { UserProgress, Lesson } from '@shared/curriculum'
import type { DifficultyLevel, PlacementResult } from '@shared/placement'

type Stage = 'welcome' | 'assessment' | 'placement' | 'curriculum' | 'lesson' | 'levelup' | 'auth_login' | 'auth_signup' | 'dashboard' | 'analytics' | 'history' | 'achievements' | 'custom_drills' | 'goals' | 'profile' | 'practice' | 'bible_practice' | 'enhanced_practice' | 'adaptive_practice' | 'leaderboard'

function App() {
  const { user, loading, logout } = useAuth()
  const [stage, setStage] = useState<Stage>('welcome')
  const [assessmentMetrics, setAssessmentMetrics] = useState<TypingMetrics | null>(null)
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [placementResult, setPlacementResult] = useState<PlacementResult | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [levelUpInfo, setLevelUpInfo] = useState<{ newLevel: DifficultyLevel; message: string } | null>(null)
  const [isFetchingProgress, setIsFetchingProgress] = useState(false)
  const [showAchievement, setShowAchievement] = useState<{ type?: string, isLevel?: boolean, level?: number } | null>(null)

  const baselineText = "Precision. Speed. Confidence. These are the hallmarks of a professional typist. Your journey starts with this baseline assessment to measure your current performance."

  const fetchProgress = useCallback(async (id: string) => {
    setIsFetchingProgress(true)
    try {
      const response = await fetch(`/api/progress/${id}`)
      if (response.ok) {
        const data = await response.json()
        setUserProgress(data)
        setStage('dashboard')
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
      const response = await fetch('/api/progress/assessment', {
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
      const response = await fetch(`/api/progress/${user.id}/lesson/${currentLesson.id}/complete`, {
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


  const handleSessionComplete = async (metrics: TypingMetrics, type: string, drillId: string, keystrokes?: any[], liveMetrics?: any[]) => {
    if (!user) return

    try {
      const response = await fetch('/api/sessions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          drillId,
          type,
          metrics,
          keystrokes,
          liveMetrics
        })
      })

      const data = await response.json()

      // RECORD SEQUENCE STATS (Bigrams/Trigrams)
      if (keystrokes && keystrokes.length > 0) {
        const sequenceStats = TypingEngine.calculateSequenceStats(keystrokes);
        if (sequenceStats.length > 0) {
          fetch('/api/keystroke-tracking/update-sequence-stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              sequences: sequenceStats
            })
          }).catch(err => console.error('Failed to update sequence stats:', err));
        }
      }

      if (data.leveledUp) {
        setShowAchievement({ isLevel: true, level: data.newLevel })
      } else if (data.newAchievements && data.newAchievements.length > 0) {
        setShowAchievement({ type: data.newAchievements[0] })
      }

      // Refresh progress if needed
      fetchProgress(user.id)

      return data
    } catch (error) {
      console.error('Failed to complete session:', error)
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

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-bg-main selection:bg-secondary-teal/20">
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/50 border-b border-slate-200/50 px-6 sm:px-12 py-4 transition-all">
          {/* Top row: Logo and User Info */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex-1" />
            <img
              src="/assets/logo.png"
              alt="TouchFlow Pro"
              className="h-12 sm:h-14 w-auto cursor-pointer active:scale-95 transition-transform"
              onClick={() => userProgress && setStage('dashboard')}
            />
            <div className="flex-1 flex justify-end">
              {user && (
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-tighter">Session Active</span>
                    <span className="text-sm font-semibold text-text-main leading-none">{user.email}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-xs font-bold text-text-muted border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-red-600 hover:border-red-100 transition-all active:scale-95 uppercase tracking-wider"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Menu */}
          {user && userProgress && stage !== 'auth_login' && stage !== 'auth_signup' && stage !== 'welcome' && (
            <nav className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setStage('dashboard')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${stage === 'dashboard' ? 'bg-primary-blue text-white' : 'bg-white border border-slate-200 text-text-muted hover:border-primary-blue'}`}
              >
                🏠 Dashboard
              </button>
              <button
                onClick={() => setStage('curriculum')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${stage === 'curriculum' || stage === 'lesson' || stage === 'levelup' ? 'bg-primary-blue text-white' : 'bg-white border border-slate-200 text-text-muted hover:border-primary-blue'}`}
              >
                📚 Lessons
              </button>
              <button
                onClick={() => setStage('practice')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${stage === 'practice' ? 'bg-primary-blue text-white' : 'bg-white border border-slate-200 text-text-muted hover:border-primary-blue'}`}
              >
                🎯 Practice
              </button>
              <button
                onClick={() => setStage('bible_practice')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${stage === 'bible_practice' ? 'bg-primary-blue text-white' : 'bg-white border border-slate-200 text-text-muted hover:border-primary-blue'}`}
              >
                📖 Bible
              </button>
              <button
                onClick={() => setStage('adaptive_practice')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${stage === 'adaptive_practice' ? 'bg-primary-blue text-white' : 'bg-white border border-slate-200 text-text-muted hover:border-primary-blue'}`}
              >
                🧠 Adaptive
              </button>
              <button
                onClick={() => setStage('analytics')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${stage === 'analytics' ? 'bg-primary-blue text-white' : 'bg-white border border-slate-200 text-text-muted hover:border-primary-blue'}`}
              >
                📊 Analytics
              </button>
              <button
                onClick={() => setStage('history')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${stage === 'history' ? 'bg-primary-blue text-white' : 'bg-white border border-slate-200 text-text-muted hover:border-primary-blue'}`}
              >
                📚 History
              </button>
              <button
                onClick={() => setStage('achievements')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${stage === 'achievements' ? 'bg-primary-blue text-white' : 'bg-white border border-slate-200 text-text-muted hover:border-primary-blue'}`}
              >
                🏆 Achievements
              </button>
              <button
                onClick={() => setStage('custom_drills')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${stage === 'custom_drills' ? 'bg-primary-blue text-white' : 'bg-white border border-slate-200 text-text-muted hover:border-primary-blue'}`}
              >
                ✏️ Custom Drills
              </button>
              <button
                onClick={() => setStage('goals')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${stage === 'goals' ? 'bg-primary-blue text-white' : 'bg-white border border-slate-200 text-text-muted hover:border-primary-blue'}`}
              >
                🎯 Goals
              </button>
              <button
                onClick={() => setStage('leaderboard')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${stage === 'leaderboard' ? 'bg-primary-blue text-white' : 'bg-white border border-slate-200 text-text-muted hover:border-primary-blue'}`}
              >
                🏆 Leaderboard
              </button>
              <button
                onClick={() => setStage('profile')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${stage === 'profile' ? 'bg-primary-blue text-white' : 'bg-white border border-slate-200 text-text-muted hover:border-primary-blue'}`}
              >
                👤 Profile
              </button>
            </nav>
          )}
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex justify-center w-full overflow-hidden">
          <AnimatePresence mode="wait">
            {stage === 'auth_login' && (
              <PageTransition key="auth_login">
                <Login onSwitchToSignup={() => setStage('auth_signup')} />
              </PageTransition>
            )}
            {stage === 'auth_signup' && (
              <PageTransition key="auth_signup">
                <Signup onSwitchToLogin={() => setStage('auth_login')} />
              </PageTransition>
            )}

            {stage === 'welcome' && (
              <PageTransition key="welcome">
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
              </PageTransition>
            )}

            {stage === 'assessment' && (
              <PageTransition key="assessment">
                <div className="w-full">
                  <TypingTest text={baselineText} onComplete={handleAssessmentComplete} />
                </div>
              </PageTransition>
            )}

            {stage === 'placement' && placementResult && assessmentMetrics && (
              <PageTransition key="placement">
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
              </PageTransition>
            )}

            {stage === 'curriculum' && userProgress && user && (
              <PageTransition key="curriculum">
                <div className="w-full">
                  <Curriculum
                    userId={user.id}
                    progress={userProgress}
                    onStartLesson={handleStartLesson}
                    onLevelChange={() => { }}
                  />
                </div>
              </PageTransition>
            )}

            {stage === 'lesson' && currentLesson && user && (
              <PageTransition key="lesson">
                <div className="w-full">
                  <LessonView
                    lesson={currentLesson}
                    userId={user.id}
                    onComplete={handleLessonComplete}
                    onCancel={() => setStage('curriculum')}
                  />
                </div>
              </PageTransition>
            )}

            {stage === 'dashboard' && user && (
              <PageTransition key="dashboard">
                <div className="w-full">
                  <Dashboard
                    userId={user.id}
                    onNavigate={(destination) => setStage(destination as Stage)}
                    userEmail={user.email}
                    userName={user.name}
                  />
                </div>
              </PageTransition>
            )}

            {stage === 'analytics' && user && (
              <PageTransition key="analytics">
                <div className="w-full">
                  <AnalyticsDashboard userId={user.id} />
                </div>
              </PageTransition>
            )}

            {stage === 'history' && user && (
              <PageTransition key="history">
                <div className="w-full">
                  <SessionHistory userId={user.id} />
                </div>
              </PageTransition>
            )}

            {stage === 'achievements' && user && (
              <PageTransition key="achievements">
                <div className="w-full">
                  <AchievementsPanel userId={user.id} />
                </div>
              </PageTransition>
            )}

            {stage === 'custom_drills' && user && (
              <PageTransition key="custom_drills">
                <div className="w-full">
                  <CustomDrillBuilder userId={user.id} />
                </div>
              </PageTransition>
            )}

            {stage === 'goals' && user && (
              <PageTransition key="goals">
                <div className="w-full">
                  <GoalsDashboard userId={user.id} />
                </div>
              </PageTransition>
            )}

            {stage === 'profile' && user && (
              <PageTransition key="profile">
                <div className="w-full">
                  <Profile userId={user.id} userEmail={user.email} />
                </div>
              </PageTransition>
            )}

            {stage === 'practice' && user && (
              <PageTransition key="practice">
                <div className="w-full">
                  <Practice userId={user.id} onSessionComplete={handleSessionComplete} />
                </div>
              </PageTransition>
            )}

            {stage === 'bible_practice' && user && (
              <PageTransition key="bible_practice">
                <div className="w-full">
                  <BiblePractice userId={user.id} onSessionComplete={handleSessionComplete} />
                </div>
              </PageTransition>
            )}

            {stage === 'adaptive_practice' && user && (
              <PageTransition key="adaptive_practice">
                <div className="w-full">
                  <AdaptivePractice userId={user.id} onSessionComplete={handleSessionComplete} />
                </div>
              </PageTransition>
            )}

            {stage === 'leaderboard' && user && (
              <PageTransition key="leaderboard">
                <div className="w-full">
                  <Leaderboard userId={user.id} />
                </div>
              </PageTransition>
            )}

            {stage === 'levelup' && levelUpInfo && (
              <PageTransition key="levelup">
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
              </PageTransition>
            )}
          </AnimatePresence>

          <AchievementModal
            isOpen={!!showAchievement}
            onClose={() => setShowAchievement(null)}
            achievementType={showAchievement?.type}
            isLevelUp={showAchievement?.isLevel}
            level={showAchievement?.level}
          />
        </main>
      </div>
    </ErrorBoundary>
  )
}

export default App
