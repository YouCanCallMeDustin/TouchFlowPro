import { TypingEngine } from '@shared/typingEngine'
import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Card } from './components/ui/Card'
import { Button } from './components/ui/Button'
import './App.css'
import { Breadcrumbs } from './components/Breadcrumbs'
import PageTransition from './components/PageTransition'
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
import DrillSelectionPage from './pages/DrillSelectionPage'
import Profile from './pages/Profile'
import Practice from './pages/Practice'
import BiblePractice from './pages/BiblePractice'
import Leaderboard from './pages/Leaderboard'
import CodePractice from './pages/CodePractice'
import PricingPage from './pages/PricingPage'
import TermsOfService from './pages/TermsOfService'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TypingCertificate from './pages/TypingCertificate'
import Extension from './pages/Extension'
import AchievementModal from './components/AchievementModal'
import ErrorBoundary from './components/ErrorBoundary'
import { LandingPage } from './components/LandingPage'
import { SkillAssessment } from './components/SkillAssessment'
import { useAuth } from './context/AuthContext'
import type { TypingMetrics, KeystrokeEvent } from '@shared/types'
import { drillLibrary } from '@shared/drillLibrary'
import type { UserProgress, Lesson } from '@shared/curriculum'
import type { DifficultyLevel, PlacementResult } from '@shared/placement'
import {
  LayoutDashboard,
  BookOpen,
  Zap,
  BarChart3,
  Award,
  Trophy,
  Compass,
  Shield,
  Code
} from 'lucide-react'

type Stage = 'welcome' | 'assessment' | 'placement' | 'curriculum' | 'lesson' | 'levelup' | 'auth_login' | 'auth_signup' | 'dashboard' | 'analytics' | 'history' | 'achievements' | 'custom_drills' | 'goals' | 'profile' | 'practice' | 'bible_practice' | 'enhanced_practice' | 'leaderboard' | 'pricing' | 'code_practice' | 'drill_selection' | 'terms' | 'privacy' | 'certificate' | 'extension'

import { apiFetch } from './utils/api';

function App() {
  const { user, loading, logout } = useAuth()
  const [stage, setStage] = useState<Stage>('welcome')
  const [assessmentMetrics, setAssessmentMetrics] = useState<TypingMetrics | null>(null)
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [placementResult, setPlacementResult] = useState<PlacementResult | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [currentLessonCompleted, setCurrentLessonCompleted] = useState(false)
  const [initialDrillText, setInitialDrillText] = useState<string | undefined>(undefined)
  const [levelUpInfo, setLevelUpInfo] = useState<{ newLevel: DifficultyLevel; message: string } | null>(null)
  const [selectedLessonForDrills, setSelectedLessonForDrills] = useState<Lesson | null>(null)
  const [isFetchingProgress, setIsFetchingProgress] = useState(false)
  const [showAchievement, setShowAchievement] = useState<{ type?: string, isLevel?: boolean, level?: number } | null>(null)



  useEffect(() => {
    // Force permanent dark mode (nighttime mode)
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  const fetchProgress = useCallback(async (id: string) => {
    setIsFetchingProgress(true)
    try {
      if (id === 'admin') {
        setUserProgress({
          userId: 'admin',
          name: 'Administrator',
          assignedLevel: 'Beginner',
          subscriptionStatus: 'pro',
          completedLessons: drillLibrary.map(d => d.id),
          unlockedLevels: ['Beginner', 'Intermediate', 'Professional', 'Specialist'],
          lessonScores: {},
          currentLesson: 'b1'
        });
        setStage('dashboard');
        return;
      }

      const response = await apiFetch(`/api/progress/${id}`)
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

  const handleStartLesson = (lesson: Lesson, isCompleted: boolean, drillText?: string) => {
    setCurrentLesson(lesson)
    setCurrentLessonCompleted(isCompleted)
    setInitialDrillText(drillText)
    setStage('lesson')
  }

  const handleViewDrills = (lesson: Lesson) => {
    setSelectedLessonForDrills(lesson)
    setStage('drill_selection')
  }

  const handleAssessmentComplete = async (metrics: TypingMetrics, result: PlacementResult) => {
    setAssessmentMetrics(metrics)
    setPlacementResult(result)

    if (user) {
      try {
        const response = await apiFetch('/api/progress/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            assignedLevel: result.level,
            initialMetrics: metrics
          })
        })

        if (response.ok) {
          const progress = await response.json()
          setUserProgress(progress)
          setStage('placement')
        }
      } catch (error) {
        console.error('Failed to initialize progress:', error)
      }
    } else {
      // Guest mode
      setStage('placement')
    }
  }

  useEffect(() => {
    const handleNav = (e: any) => {
      if (e.detail?.stage) setStage(e.detail.stage);
      else setStage('pricing');
    };
    window.addEventListener('navigate-to-pricing' as any, handleNav);
    return () => window.removeEventListener('navigate-to-pricing' as any, handleNav);
  }, []);


  const updateKeystrokeStats = async (userId: string, keystrokes: KeystrokeEvent[], text: string) => {
    if (!keystrokes || keystrokes.length === 0) return;

    // 1. Enhance keystrokes with expected data
    const enhancedKeystrokes = keystrokes.map((ks, i) => {
      const prevTs = i > 0 ? keystrokes[i - 1].timestamp : 0;
      return TypingEngine.enhanceKeystrokeEvent(ks, ks.expectedKey || text[i] || '', prevTs);
    });

    // 2. Calculate per-key statistics
    const perKeyStats = TypingEngine.getPerKeyStats(enhancedKeystrokes);
    const statsArray = Array.from(perKeyStats.values());

    if (statsArray.length > 0) {
      // 3. Send to backend
      apiFetch('/api/keystroke-tracking/update-key-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          keyStats: statsArray
        })
      }).catch(err => console.error('Failed to update key stats:', err));
    }

    // 4. Also update sequence stats
    const sequenceStats = TypingEngine.calculateSequenceStats(keystrokes);
    if (sequenceStats.length > 0) {
      apiFetch('/api/keystroke-tracking/update-sequence-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sequences: sequenceStats
        })
      }).catch(err => console.error('Failed to update sequence stats:', err));
    }
  };

  const handleLessonComplete = async (metrics: TypingMetrics, _passed: boolean, ks?: KeystrokeEvent[]) => {
    if (!currentLesson || !userProgress || !user) return

    try {
      // Background stats update
      if (ks) {
        updateKeystrokeStats(user.id, ks, currentLesson.content);
      }

      const response = await apiFetch(`/api/progress/${user.id}/lesson/${currentLesson.id}/complete`, {
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
      const response = await apiFetch('/api/sessions/complete', {
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

      // RECORD KEY AND SEQUENCE STATS
      if (keystrokes && keystrokes.length > 0) {
        const drill = drillLibrary.find(d => d.id === drillId);
        updateKeystrokeStats(user.id, keystrokes, drill?.content || '');
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

  const handleStartCustomSession = (content: string, title: string) => {
    const customLesson: Lesson = {
      id: `custom-${Date.now()}`,
      title: title,
      content: content,
      category: 'Adaptive Practice',
      difficulty: 'Professional',
      order: 999,
      xpReward: 15,
      learningObjectives: ['Personalized Practice'],
      lessonNumber: 0,
      prerequisites: [],
      masteryThreshold: 0,
      description: 'Custom generated practice session'
    }
    setCurrentLesson(customLesson)
    setCurrentLessonCompleted(false)
    setStage('lesson')
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
      <div className="min-h-screen bg-bg-main selection:bg-primary/20 relative">
        <header className="glass-header rounded-b-[2rem] px-6 sm:px-12 py-2">
          <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
            <div className="flex items-center gap-8">
              <img
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="TouchFlow Pro"
                className="h-10 w-auto cursor-pointer active:scale-95 transition-all hover:brightness-110"
                onClick={() => userProgress && setStage('dashboard')}
              />
              <div className="h-6 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />
            </div>

            <div className="flex items-center gap-4 sm:gap-8">
              {user && (
                <>
                  <div
                    className="hidden md:flex flex-col items-end gap-1 cursor-pointer group"
                    onClick={() => setStage('profile')}
                  >
                    <span className="text-[8px] font-black text-primary uppercase tracking-[0.4em] mb-0.5 group-hover:text-secondary transition-colors">Account ID</span>
                    <span className="text-xs font-bold text-text-main leading-none group-hover:text-primary transition-colors">{user.email}</span>
                  </div>

                  {/* Upgrade Button */}
                  <button
                    onClick={() => setStage('pricing')}
                    className="group relative px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <span className="relative z-10 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                      <Zap size={12} fill="currentColor" /> Upgrade
                    </span>
                  </button>

                  <button
                    onClick={logout}
                    className="group relative px-5 py-2.5 rounded-xl bg-red-500/5 border border-red-500/10 transition-all hover:bg-red-500 hover:text-white active:scale-95"
                  >
                    <span className="relative z-10 text-[9px] font-black uppercase tracking-[0.2em]">Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {user && userProgress && stage !== 'auth_login' && stage !== 'auth_signup' && stage !== 'welcome' && (
            <div className="max-w-7xl mx-auto mt-2">
              <nav className="flex items-center gap-1 nav-container overflow-x-auto scrollbar-none">
                {[
                  { id: 'dashboard' as Stage, label: 'Dashboard', icon: LayoutDashboard },
                  { id: 'curriculum' as Stage, label: 'Learn', icon: BookOpen },
                  { id: 'practice' as Stage, label: 'Practice', icon: Zap },
                  { id: 'code_practice' as Stage, label: 'Code', icon: Compass },
                  { id: 'analytics' as Stage, label: 'Stats', icon: BarChart3 },
                  { id: 'achievements' as Stage, label: 'Awards', icon: Award },
                  { id: 'leaderboard' as Stage, label: 'Ranks', icon: Trophy },
                  { id: 'certificate' as Stage, label: 'Certify', icon: Shield },
                  { id: 'extension' as Stage, label: 'VS Code', icon: Code },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setStage(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 relative group overflow-hidden ${stage === item.id || (item.id === 'curriculum' && (stage === 'lesson' || stage === 'levelup'))
                      ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105 active:scale-95'
                      : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-500/10 dark:hover:bg-white/5 hover:text-text-main hover:translate-y-[-1px]'}`}
                  >
                    <item.icon size={14} strokeWidth={2.5} className={`${stage === item.id ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'} transition-all`} />
                    <span className="relative z-10">{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="px-2 border-t border-white/5 pt-4">
                <Breadcrumbs
                  items={[
                    { label: 'Home', onClick: () => setStage('dashboard') },
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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-20 flex justify-center w-full overflow-hidden">
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
                  onStartCustomSession={handleStartCustomSession}
                  userEmail={user.email}
                  userName={userProgress?.name || (user as any).user_metadata?.full_name}
                />
              </PageTransition>
            )}

            {stage === 'welcome' && (
              <PageTransition key="welcome">
                <LandingPage
                  onStartAssessment={() => setStage('assessment')}
                  onLogin={() => setStage('auth_login')}
                />
              </PageTransition>
            )}

            {stage === 'assessment' && (
              <PageTransition key="assessment">
                <SkillAssessment onComplete={handleAssessmentComplete} />
              </PageTransition>
            )}

            {stage === 'placement' && placementResult && (
              <PageTransition key="placement">
                <Card className="max-w-2xl w-full mx-auto text-center p-8">
                  <div className="text-6xl mb-8 animate-[bounce_2s_infinite]">🎯</div>
                  <h1 className="mb-4 text-3xl font-black uppercase tracking-tighter">Assessment Complete.</h1>
                  <div className="bg-primary/5 rounded-3xl p-8 mb-10 border border-white/10">
                    <p className="text-text-muted uppercase tracking-[0.2em] text-[10px] font-black mb-4">Starting Tier</p>
                    <h2 className="text-5xl font-black text-primary mb-2 uppercase italic">{placementResult.level}</h2>
                    <p className="text-text-main font-bold">Speed: {Math.round(assessmentMetrics?.netWPM || 0)} WPM • Accuracy: {Math.round(assessmentMetrics?.accuracy || 0)}%</p>
                  </div>
                  <Button
                    onClick={() => {
                      if (user) {
                        setStage('dashboard')
                      } else {
                        setStage('auth_signup')
                      }
                    }}
                    className="w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[12px] shadow-2xl shadow-primary/30"
                  >
                    {user ? 'Access Dashboard' : 'Claim Profile & Continue'}
                  </Button>
                  {!user && (
                    <p className="mt-6 text-[10px] uppercase font-black tracking-[0.2em] text-text-muted opacity-40">
                      Sign up to save your progress and unlock the curriculum.
                    </p>
                  )}
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
                  onSessionComplete={handleSessionComplete}
                  onLevelChange={(level) => console.log('Level change requested:', level)}
                  onViewDrills={handleViewDrills}
                  onRequestUpgrade={() => setStage('pricing')}
                />
              </PageTransition>
            )}

            {stage === 'drill_selection' && selectedLessonForDrills && (
              <PageTransition key="drill_selection">
                <DrillSelectionPage
                  lesson={selectedLessonForDrills}
                  onStartDrill={(lesson, drillText) => handleStartLesson(lesson, true, drillText)}
                  onBack={() => setStage('curriculum')}
                />
              </PageTransition>
            )}

            {stage === 'lesson' && currentLesson && user && (
              <PageTransition key={`lesson-${currentLesson.id}-${initialDrillText || 'main'}`}>
                <LessonView
                  lesson={currentLesson}
                  isCompleted={currentLessonCompleted}
                  userId={user.id}
                  onComplete={handleLessonComplete}
                  onCancel={() => setStage('curriculum')}
                  initialDrillText={initialDrillText}
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
                <Profile
                  userId={user.id}
                  userEmail={user.email}
                  onProfileUpdate={() => fetchProgress(user.id)}
                />
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



            {stage === 'leaderboard' && user && (
              <PageTransition key="leaderboard">
                <Leaderboard userId={user.id} />
              </PageTransition>
            )}

            {stage === 'code_practice' && user && (
              <PageTransition key="code_practice">
                <CodePractice userId={user.id} onSessionComplete={handleSessionComplete} />
              </PageTransition>
            )}

            {stage === 'pricing' && user && (
              <PageTransition key="pricing">
                <PricingPage />
              </PageTransition>
            )}

            {stage === 'terms' && (
              <PageTransition key="terms">
                <TermsOfService onBack={() => setStage(user ? 'dashboard' : 'auth_login')} />
              </PageTransition>
            )}

            {stage === 'privacy' && (
              <PageTransition key="privacy">
                <PrivacyPolicy onBack={() => setStage(user ? 'dashboard' : 'auth_login')} />
              </PageTransition>
            )}

            {stage === 'certificate' && user && (
              <PageTransition key="certificate">
                <TypingCertificate userId={user.id} userName={user.name || user.email} />
              </PageTransition>
            )}

            {stage === 'extension' && (
              <PageTransition key="extension">
                <Extension />
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

        <footer className="border-t border-white/5 mt-12 py-6 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[10px] text-text-muted font-medium">
              © {new Date().getFullYear()} TouchFlow Pro. All rights reserved.
            </span>
            <div className="flex items-center gap-6">
              <button
                onClick={() => setStage('terms')}
                className="text-[10px] text-text-muted hover:text-primary transition-colors font-medium uppercase tracking-[0.15em]"
              >
                Terms of Service
              </button>
              <button
                onClick={() => setStage('privacy')}
                className="text-[10px] text-text-muted hover:text-primary transition-colors font-medium uppercase tracking-[0.15em]"
              >
                Privacy Policy
              </button>
            </div>
          </div>
        </footer>

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
