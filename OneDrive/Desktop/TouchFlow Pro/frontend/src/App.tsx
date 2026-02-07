import { TypingEngine } from '@shared/typingEngine'
import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Card } from './components/ui/Card'
import { Button } from './components/ui/Button'
import './App.css'
import { Breadcrumbs } from './components/Breadcrumbs'
import PageTransition from './components/PageTransition'
import { ThemeToggle } from './components/ThemeToggle'
import { Curriculum } from './components/Curriculum'
import LessonView from './components/LessonView'
import Login from './components/Auth/Login'
import Signup from './components/Auth/Signup'
import AnalyticsDashboard from './pages/AnalyticsDashboard'
import SessionHistory from './pages/SessionHistory'
import { AchievementsPanel } from './pages/AchievementsPanel'
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
import { HeroFlow } from './components/HeroFlow'
import { useAuth } from './context/AuthContext'
import type { TypingMetrics } from '@shared/types'
import type { UserProgress, Lesson } from '@shared/curriculum'
import type { DifficultyLevel, PlacementResult } from '@shared/placement'
import {
  LayoutDashboard,
  BookOpen,
  Zap,
  History,
  BarChart3,
  Trophy,
  User,
  Compass,
  ArrowRight
} from 'lucide-react'

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



  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

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
        setStage('welcome')
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
          <div className="text-4xl font-heading font-extrabold animate-pulse bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            TouchFlow Pro
          </div>
          <div className="text-text-muted tracking-[0.4em] uppercase text-[10px] font-black">Syncing Profile...</div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-bg-main selection:bg-primary/20">
        <header className="sticky top-0 z-50 glass-header px-6 sm:px-12 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
            <div className="flex items-center gap-8">
              <img
                src="/assets/logo.png"
                alt="TouchFlow Pro"
                className="h-10 w-auto cursor-pointer active:scale-95 transition-all hover:brightness-110"
                onClick={() => userProgress && setStage('dashboard')}
              />
              <div className="h-6 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />
              <ThemeToggle />
            </div>

            <div className="flex items-center gap-4 sm:gap-8">
              {user && (
                <>
                  <div className="hidden md:flex flex-col items-end gap-1">
                    <span className="text-[8px] font-black text-primary uppercase tracking-[0.4em] mb-0.5">Professional ID</span>
                    <span className="text-xs font-bold text-text-main leading-none">{user.email}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="group relative px-5 py-2.5 rounded-xl bg-red-500/5 border border-red-500/10 transition-all hover:bg-red-500 hover:text-white active:scale-95"
                  >
                    <span className="relative z-10 text-[9px] font-black uppercase tracking-[0.2em]">Exit Session</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {user && userProgress && stage !== 'auth_login' && stage !== 'auth_signup' && stage !== 'welcome' && (
            <div className="max-w-7xl mx-auto mt-6">
              <nav className="flex items-center gap-1 nav-container overflow-x-auto scrollbar-none">
                {[
                  { id: 'dashboard' as Stage, label: 'Control', icon: LayoutDashboard },
                  { id: 'curriculum' as Stage, label: 'Curriculum', icon: BookOpen },
                  { id: 'practice' as Stage, label: 'Sessions', icon: Zap },
                  { id: 'bible_practice' as Stage, label: 'Legacy', icon: History },
                  { id: 'adaptive_practice' as Stage, label: 'Adaptive', icon: Compass },
                  { id: 'analytics' as Stage, label: 'Insights', icon: BarChart3 },
                  { id: 'leaderboard' as Stage, label: 'Standings', icon: Trophy },
                  { id: 'profile' as Stage, label: 'Identity', icon: User },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setStage(item.id)}
                    className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 relative group overflow-hidden ${stage === item.id || (item.id === 'curriculum' && (stage === 'lesson' || stage === 'levelup'))
                      ? 'bg-primary text-white shadow-2xl shadow-primary/40 scale-105 active:scale-95'
                      : 'bg-slate-500/10 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-500/20 dark:hover:bg-white/20 hover:text-text-main hover:translate-y-[-2px] border border-slate-200/20 dark:border-transparent'}`}
                  >
                    <item.icon size={14} strokeWidth={2.5} className={`${stage === item.id ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'} transition-all`} />
                    <span className="relative z-10">{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="px-2 border-t border-white/5 pt-4">
                <Breadcrumbs
                  items={[
                    { label: 'System', onClick: () => setStage('dashboard') },
                    {
                      label: stage === 'lesson' ? 'Curriculum' : stage.replace('_', ' '),
                      onClick: stage === 'lesson' ? () => setStage('curriculum') : undefined,
                      active: stage !== 'lesson'
                    },
                    stage === 'lesson' ? { label: currentLesson?.title || 'Active Session', active: true } : null
                  ].filter((i): i is any => !!i)}
                />
              </div>
            </div>
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




            {stage === 'dashboard' && user && (
              <PageTransition key="dashboard">
                <Dashboard
                  userId={user.id}
                  onNavigate={(s) => setStage(s as any)}
                  userEmail={user.email}
                  userName={(user as any).user_metadata?.full_name}
                />
              </PageTransition>
            )}

            {stage === 'welcome' && (
              <PageTransition key="welcome">
                <div className="relative min-h-[80vh] w-full flex items-center justify-center">
                  <HeroFlow />

                  <Card className="max-w-2xl w-full text-center p-12 relative z-10 bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
                    <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-5xl shadow-lg border border-white/10 animate-pulse-slow">
                      <Zap className="text-primary fill-primary/20" size={40} />
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-black mb-8 leading-[0.9] tracking-tighter uppercase italic">
                      Peak Your <br />
                      <span className="text-primary">Performance.</span>
                    </h1>
                    <p className="text-text-muted text-lg mb-12 leading-relaxed font-bold uppercase tracking-[0.2em] opacity-60">
                      Ready to elevate your performance <br /> to elite levels?
                    </p>

                    <Button
                      onClick={() => setStage('assessment')}
                      className="w-full py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-[14px] shadow-2xl shadow-primary/30 group overflow-hidden relative"
                      rightIcon={<ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />}
                    >
                      Start Assessment
                    </Button>

                    <div className="mt-8 flex items-center justify-center gap-4">
                      <div className="h-px w-12 bg-white/5" />
                      <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-40">Or</span>
                      <div className="h-px w-12 bg-white/5" />
                    </div>

                    <button
                      onClick={() => setStage('auth_login')}
                      className="mt-6 text-[10px] font-black text-text-main uppercase tracking-[0.3em] hover:text-primary transition-colors border-b border-white/10 pb-1"
                    >
                      Sign In to Profile
                    </button>
                  </Card>
                </div>
              </PageTransition>
            )}

            {stage === 'placement' && placementResult && userProgress && (
              <PageTransition key="placement">
                <Card className="max-w-2xl w-full text-center p-8">
                  <div className="text-6xl mb-8 animate-[bounce_2s_infinite]">🎯</div>
                  <h1 className="mb-4">Assessment Complete.</h1>
                  <div className="bg-primary/5 rounded-3xl p-8 mb-10 border border-white/10">
                    <p className="text-text-muted uppercase tracking-[0.2em] text-[10px] font-black mb-4">Starting Tier</p>
                    <h2 className="text-5xl font-black text-primary mb-2">{placementResult.level}</h2>
                    <p className="text-text-main font-bold">Speed: {Math.round(assessmentMetrics?.netWPM || 0)} WPM • Accuracy: {Math.round(assessmentMetrics?.accuracy || 0)}%</p>
                  </div>
                  <Button
                    onClick={() => setStage('dashboard')}
                    className="w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[12px] shadow-2xl shadow-primary/30"
                  >
                    Access Dashboard
                  </Button>
                </Card>
              </PageTransition>
            )}

            {/* ... other stages ... */}

            {stage === 'levelup' && levelUpInfo && (
              <PageTransition key="levelup">
                <Card className="max-w-2xl w-full text-center bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 p-8">
                  <div className="text-7xl mb-8">🏆</div>
                  <h1 className="mb-4">Tier Ascent.</h1>
                  <h2 className="text-4xl text-primary mb-6">New Level: {levelUpInfo.newLevel}</h2>
                  <p className="text-text-main text-xl mb-12 font-medium leading-relaxed">{levelUpInfo.message}</p>
                  <Button
                    onClick={() => setStage('curriculum')}
                    className="w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[12px] shadow-2xl shadow-primary/30"
                  >
                    Continue Path
                  </Button>
                </Card>
              </PageTransition>
            )}

            {stage === 'curriculum' && userProgress && user && (
              <PageTransition key="curriculum">
                <Curriculum
                  userId={user.id}
                  progress={userProgress}
                  onStartLesson={handleStartLesson}
                  onLevelChange={(level) => console.log('Level change requested:', level)}
                />
              </PageTransition>
            )}

            {stage === 'lesson' && currentLesson && user && (
              <PageTransition key="lesson">
                <LessonView
                  lesson={currentLesson}
                  userId={user.id}
                  onComplete={handleLessonComplete}
                  onCancel={() => setStage('curriculum')}
                />
              </PageTransition>
            )}

            {stage === 'analytics' && user && (
              <PageTransition key="analytics">
                <div className="w-full space-y-12">
                  <AnalyticsDashboard />
                </div>
              </PageTransition>
            )}

            {stage === 'history' && user && (
              <PageTransition key="history">
                <SessionHistory userId={user.id} />
              </PageTransition>
            )}

            {stage === 'achievements' && user && (
              <PageTransition key="achievements">
                <AchievementsPanel userId={user.id} />
              </PageTransition>
            )}

            {stage === 'custom_drills' && user && (
              <PageTransition key="custom_drills">
                <CustomDrillBuilder userId={user.id} />
              </PageTransition>
            )}

            {stage === 'goals' && user && (
              <PageTransition key="goals">
                <GoalsDashboard userId={user.id} />
              </PageTransition>
            )}

            {stage === 'profile' && user && (
              <PageTransition key="profile">
                <Profile userId={user.id} userEmail={user.email} />
              </PageTransition>
            )}

            {stage === 'practice' && user && (
              <PageTransition key="practice">
                <Practice userId={user.id} onSessionComplete={handleSessionComplete} />
              </PageTransition>
            )}

            {stage === 'bible_practice' && user && (
              <PageTransition key="bible_practice">
                <BiblePractice userId={user.id} onSessionComplete={handleSessionComplete} />
              </PageTransition>
            )}

            {stage === 'adaptive_practice' && user && (
              <PageTransition key="adaptive_practice">
                <AdaptivePractice userId={user.id} onSessionComplete={handleSessionComplete} />
              </PageTransition>
            )}

            {stage === 'leaderboard' && user && (
              <PageTransition key="leaderboard">
                <Leaderboard userId={user.id} />
              </PageTransition>
            )}
          </AnimatePresence>
        </main>

        <AchievementModal
          isOpen={!!showAchievement}
          onClose={() => setShowAchievement(null)}
          achievementType={showAchievement?.type}
          isLeveledUp={showAchievement?.isLevel}
          newLevel={showAchievement?.level}
        />

        <style>{`
          @keyframes shine {
            from { transform: translateX(-100%); }
            to { transform: translateX(200%); }
          }
        `}</style>
      </div>
    </ErrorBoundary>
  )
}

export default App
