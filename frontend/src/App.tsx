import { TypingEngine } from '@shared/typingEngine'
import type { Stage } from './types/stages';
import { useState, useEffect, useCallback, lazy, Suspense, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AnimatePresence } from 'framer-motion'
import { Card } from './components/ui/Card'
import { Button } from './components/ui/Button'
import { 
  BarChart3, 
  Activity, 
  Award, 
  TrendingUp, 
  Clock, 
  BookOpen, 
  Trophy, 
  Compass, 
  Shield, 
  Users,
  Gamepad2
} from 'lucide-react'

import PageTransition from './components/PageTransition'
import AchievementModal from './components/AchievementModal'
import ErrorBoundary from './components/ErrorBoundary'
import { LandingPage } from './components/LandingPage'
import Login from './components/Auth/Login'
import Signup from './components/Auth/Signup'
import { Header } from './components/Header';
import { SaveProgressModal } from './components/Auth/SaveProgressModal';
import { useAuth } from './context/AuthContext'
import { useSettings } from './context/SettingsContext'
import { useLaunchStore } from './state/launchStore'
import { apiFetch } from './utils/api';
import type { TypingMetrics, KeystrokeEvent } from '@shared/types'
import { drillLibrary } from '@shared/drillLibrary'
import type { UserProgress, Lesson } from '@shared/curriculum'
import type { DifficultyLevel, PlacementResult } from '@shared/placement'

// ── Lazy-loaded pages (split into separate chunks) ──────────────────────────
const Curriculum            = lazy(() => import('./components/Curriculum').then(m => ({ default: m.Curriculum })))
const LessonView            = lazy(() => import('./components/LessonView'))
const SkillAssessment       = lazy(() => import('./components/SkillAssessment').then(m => ({ default: m.SkillAssessment })))
const Dashboard             = lazy(() => import('./pages/Dashboard'))
const AnalyticsDashboard    = lazy(() => import('./pages/AnalyticsDashboard'))
const SessionHistory        = lazy(() => import('./pages/SessionHistory'))
const AchievementsPanel     = lazy(() => import('./pages/AchievementsPanel').then(m => ({ default: m.AchievementsPanel })))
const GoalsDashboard        = lazy(() => import('./pages/GoalsDashboard'))
const DrillSelectionPage    = lazy(() => import('./pages/DrillSelectionPage'))
const Profile               = lazy(() => import('./pages/Profile'))
const Practice              = lazy(() => import('./pages/Practice'))
const BiblePractice         = lazy(() => import('./pages/BiblePractice'))
const Leaderboard           = lazy(() => import('./pages/Leaderboard'))
const CodePractice          = lazy(() => import('./pages/CodePractice'))
const PricingPage           = lazy(() => import('./pages/PricingPage'))
const TermsOfService        = lazy(() => import('./pages/TermsOfService'))
const PrivacyPolicy         = lazy(() => import('./pages/PrivacyPolicy'))
const PracticeTests         = lazy(() => import('./pages/PracticeTests'))
const TypingCertificate     = lazy(() => import('./pages/TypingCertificate'))
const Extension             = lazy(() => import('./pages/Extension'))
const GamesLanding          = lazy(() => import('./pages/GamesLanding').then(m => ({ default: m.GamesLanding })))
const AccuracyAssassinPage  = lazy(() => import('./games/accuracy-assassin/ui/AccuracyAssassinPage').then(m => ({ default: m.AccuracyAssassinPage })))
const BurnerBurstPage       = lazy(() => import('./games/type-to-orbit/ui/TypeToOrbitPage').then(m => ({ default: m.BurnerBurstPage })))
const SpellRushGame         = lazy(() => import('./games/spell-rush/Game'))
const Orgs                  = lazy(() => import('./pages/Orgs'))
const Settings              = lazy(() => import('./pages/Settings'))
const SampleReport          = lazy(() => import('./pages/SampleReport'))
const MedicalTrack          = lazy(() => import('./pages/MedicalTrack').then(m => ({ default: m.MedicalTrack })))
const LegalTrack            = lazy(() => import('./pages/LegalTrack').then(m => ({ default: m.LegalTrack })))
const CodeTrack             = lazy(() => import('./pages/CodeTrack').then(m => ({ default: m.CodeTrack })))
const FreeTypingTest        = lazy(() => import('./pages/FreeTypingTest'))
const AboutPage             = lazy(() => import('./pages/AboutPage'))
const ContactPage           = lazy(() => import('./pages/ContactPage'))
const FaqPage               = lazy(() => import('./pages/FaqPage'))
const ArticlesIndexPage     = lazy(() => import('./pages/ArticlesIndexPage'))
// Auth
const PublicFeatureTeaser    = lazy(() => import('./components/Auth/PublicFeatureTeaser').then(m => ({ default: m.PublicFeatureTeaser })))
// Articles
const TypingPlateauArticle        = lazy(() => import('./pages/articles/TypingPlateauArticle').then(m => ({ default: m.TypingPlateauArticle })))
const TypeFasterArticle           = lazy(() => import('./pages/articles/TypeFasterArticle').then(m => ({ default: m.TypeFasterArticle })))
const SixtyToHundredArticle       = lazy(() => import('./pages/articles/SixtyToHundredArticle').then(m => ({ default: m.SixtyToHundredArticle })))
const AveragesArticle             = lazy(() => import('./pages/articles/AveragesArticle').then(m => ({ default: m.AveragesArticle })))
const UltimateGuideArticle        = lazy(() => import('./pages/articles/UltimateGuideArticle').then(m => ({ default: m.UltimateGuideArticle })))
const HowToTypeFasterArticle      = lazy(() => import('./pages/articles/HowToTypeFasterArticle').then(m => ({ default: m.HowToTypeFasterArticle })))
const TouchTypingGuideArticle     = lazy(() => import('./pages/articles/TouchTypingGuideArticle').then(m => ({ default: m.TouchTypingGuideArticle })))
const TypingPracticeArticle       = lazy(() => import('./pages/articles/TypingPracticeArticle').then(m => ({ default: m.TypingPracticeArticle })))
const TypingSpeedTestArticle      = lazy(() => import('./pages/articles/TypingSpeedTestArticle').then(m => ({ default: m.TypingSpeedTestArticle })))
const ImproveTypingSpeedArticle   = lazy(() => import('./pages/articles/ImproveTypingSpeedArticle').then(m => ({ default: m.ImproveTypingSpeedArticle })))
const TypingAccuracyArticle       = lazy(() => import('./pages/articles/TypingAccuracyArticle').then(m => ({ default: m.TypingAccuracyArticle })))
const FastestTypingTechniquesArticle = lazy(() => import('./pages/articles/FastestTypingTechniquesArticle').then(m => ({ default: m.FastestTypingTechniquesArticle })))


const STAGE_ROUTES: Partial<Record<Stage, string>> = {
  welcome: '/',
  free_test: '/free-typing-test',
  medicalTrack: '/medical-typing-practice',
  legalTrack: '/legal-typing-test',
  codingTrack: '/code-typing-practice',
  curriculum: '/curriculum',
  pricing: '/pricing',
  terms: '/terms',
  privacy: '/privacy-policy',
  about: '/about',
  contact: '/contact',
  faq: '/faq',
  articles_index: '/articles',
  article_plateau: '/articles/typing-speed-plateau',
  article_type_faster: '/articles/type-faster-accurately',
  article_60_to_100: '/articles/60-wpm-to-100-wpm',
  'article_averages': '/articles/typing-speed-averages',
  'article_ultimate_guide': '/articles/ultimate-guide-to-typing-speed',
  'article_how_to_type_faster': '/articles/how-to-type-faster',
  'article_touch_typing_guide': '/articles/touch-typing-guide',
  'article_typing_practice': '/articles/typing-practice',
  'article_typing_test': '/articles/typing-speed-test',
  'article_improve_typing_speed': '/articles/improve-typing-speed',
  'article_typing_accuracy': '/articles/typing-accuracy',
  'article_fastest_techniques': '/articles/fastest-typing-techniques',
  auth_login: '/login',
  auth_signup: '/signup',
  assessment: '/assessment',
  sample_report: '/sample-report',
};

const ROUTE_STAGES: Record<string, Stage> = Object.fromEntries(
  Object.entries(STAGE_ROUTES).map(([stage, path]) => [path, stage as Stage])
);

function App() {
  const { user, loading, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [stage, setStage] = useState<Stage>(() => {
    // Normalize path: ignore trailing slash for matching
    const normalizedPath = location.pathname.length > 1 && location.pathname.endsWith('/')
      ? location.pathname.slice(0, -1)
      : location.pathname;

    if (normalizedPath === '/articles/good-typing-speed') return 'article_averages';
    return ROUTE_STAGES[normalizedPath] || 'welcome';
  })
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
  const { settings: userSettings } = useSettings()
  const [showSaveProgressModal, setShowSaveProgressModal] = useState<{ metrics: TypingMetrics; drillId: string } | null>(null);
  const [reportOrgId, setReportOrgId] = useState<string | null>(null);
  const lastStageRef = useRef<Stage>(stage);

  useEffect(() => {
    // Force permanent dark mode (nighttime mode)
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');

    // Clear chunk load error retry flag on successful load
    sessionStorage.removeItem('tfp_chunk_error_reload');
  }, []);

  // Sync URL from stage changes
  useEffect(() => {
    const targetPath = STAGE_ROUTES[stage];
    const isProgrammaticUpdate = lastStageRef.current !== stage;
    lastStageRef.current = stage;

    // If we're at 'dashboard', and the URL is '/', that means we intentionally
    // sent them to the dashboard while keeping the clean root URL.
    if (stage === 'dashboard' && location.pathname === '/') return;

    if (targetPath && targetPath !== location.pathname) {
      // If the stage was updated programmatically (e.g. from the Header),
      // we ALWAYS want to force a navigation to that path.
      // Otherwise, if the URL changed first (e.g. Footer Link), we check if the URL 
      // already maps to a valid stage. If it does, we trust the URL-to-Stage 
      // sync effect to update the stage state.
      const matchedStageForUrl = ROUTE_STAGES[location.pathname];
      const isUrlDriveNavigation = matchedStageForUrl && matchedStageForUrl !== stage;

      if (isProgrammaticUpdate || !isUrlDriveNavigation) {
        window.scrollTo(0, 0);
        navigate(targetPath, { replace: true });
      }
    }
  }, [stage, navigate, location.pathname]); 

  // Sync stage from Back/Forward navigation
  useEffect(() => {
    // Normalize path: ignore trailing slash for matching
    const normalizedPath = location.pathname.length > 1 && location.pathname.endsWith('/')
      ? location.pathname.slice(0, -1)
      : location.pathname;

    const matchedStage = ROUTE_STAGES[normalizedPath];
    if (matchedStage) {
      setStage(prevStage => {
        // If we're at 'dashboard', and the URL is '/', that means we intentionally
        // sent them to the dashboard while keeping the clean root URL.
        if (prevStage === 'dashboard' && normalizedPath === '/') return prevStage;

        // Also don't revert to mapped route if they purposely opened an unmapped sub-app view
        // like auth_login (because they clicked a button) unless they are really hitting back
        return prevStage !== matchedStage ? matchedStage : prevStage;
      });
    }
  }, [location.pathname]);

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
      setStage('welcome')
    } finally {
      setIsFetchingProgress(false)
    }
  }, [])

  useEffect(() => {
    if (!loading) {
      if (user) {
        // If they are on a mapped route like '/' (welcome), but they are logged in,
        // fetchProgress will bump them to 'dashboard'.
        fetchProgress(user.id)
      } else {
        // Initialize guest progress if needed for public curriculum/tracks
        if (!userProgress) {
          setUserProgress({
            userId: 'guest',
            name: 'Guest User',
            assignedLevel: 'Beginner',
            subscriptionStatus: 'starter',
            completedLessons: [],
            unlockedLevels: ['Beginner', 'Specialist'],
            lessonScores: {},
            currentLesson: 'b1'
          });
        }
        // Only override state if we aren't explicitly on a public route
        if (!ROUTE_STAGES[location.pathname] || location.pathname === '/') {
          setStage('welcome')
        }
      }
    }
  }, [user, loading, fetchProgress])


  const [activeVariationId, setActiveVariationId] = useState<string | null>(null)

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
    const handlePricingNav = (e: any) => {
      if (e.detail?.stage) setStage(e.detail.stage);
      else setStage('pricing');
    };
    const handlePracticeNav = () => {
      setStage('practice');
    };
    window.addEventListener('navigate-to-pricing' as any, handlePricingNav);
    window.addEventListener('navigate-to-practice' as any, handlePracticeNav);
    return () => {
      window.removeEventListener('navigate-to-pricing' as any, handlePricingNav);
      window.removeEventListener('navigate-to-practice' as any, handlePracticeNav);
    };
  }, []);

  // Handle Stripe Success Redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (sessionId && user && !loading) {
      const verifySubscription = async () => {
        try {
          const { apiFetch } = await import('./utils/api');
          await apiFetch('/api/subscriptions/verify-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
          });

          // Clean URL
          window.history.replaceState({}, '', '/');

          // Force reload to ensure AuthContext picks up new Pro status
          // Or we could try to just update state, but a refresh ensures clean slate
          window.location.href = '/';
        } catch (error) {
          console.error('Failed to verify session:', error);
        }
      };
      verifySubscription();
    }
  }, [user, loading]);

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

  const handleStartLesson = (lesson: Lesson, isCompleted: boolean, drillText?: string, variationId?: string) => {
    setCurrentLesson(lesson)
    setCurrentLessonCompleted(isCompleted)
    setInitialDrillText(drillText)
    setActiveVariationId(variationId || null)
    setStage('lesson')
  }

  const handleLessonComplete = async (metrics: TypingMetrics, _passed: boolean, ks?: KeystrokeEvent[]) => {
    if (!currentLesson || !userProgress || !user) return

    try {
      // Background stats update
      if (ks) {
        updateKeystrokeStats(user.id, ks, currentLesson.content);
      }

      if (activeVariationId) {
        // Handle Focus Drill Variation Completion
        const response = await apiFetch(`/api/drills/${activeVariationId}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ metrics, userId: user.id })
        })
        const data = await response.json()
        if (data.newAchievement) {
          setShowAchievement({ type: data.newAchievement })
        }
        // Return to selection
        setStage('drill_selection')
      } else {
        // Standard Lesson Completion
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
      }
    } catch (error) {
      console.error('Failed to complete lesson:', error)
      setStage(activeVariationId ? 'drill_selection' : 'curriculum')
    }
  }

  const handleSessionComplete = async (metrics: TypingMetrics, type: string, drillId: string, keystrokes?: any[], liveMetrics?: any[]) => {
    if (!user) {
      // GUEST COMPLETION: Trigger sign-up conversion modal
      setShowSaveProgressModal({ metrics, drillId });
      return;
    }

    try {
      const response = await apiFetch('/api/sessions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          drillId,
          type,
          metrics,
          keystrokes: (type === 'practice' && userSettings?.storeRawLogsPractice === false) || (type === 'lesson' && userSettings?.storeRawLogsCurriculum === false) ? [] : keystrokes,
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


  const isTypingMode = ['lesson', 'practice_tests', 'certificate', 'free_test', 'assessment'].includes(stage) || stage.startsWith('games_');

  useEffect(() => {
    if (isTypingMode) {
      window.scrollTo(0, 0);
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    } else {
      document.body.style.overflow = '';
      document.body.style.height = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
    }
  }, [isTypingMode]);

  // Determine if the current stage is a public-facing page
  const isPublicStage = [
    'welcome', 'free_test', 'medicalTrack', 'legalTrack', 'codingTrack', 
    'pricing', 'terms', 'privacy', 'about', 'contact', 'faq', 'articles_index',
    'auth_login', 'auth_signup', 'assessment'
  ].includes(stage) || String(stage).startsWith('article_');

  // Only block the entire rendering pipeline if we are trying to access a PROTECTED route
  // while the Supabase session is still resolving. This eliminates the massive 2.0s LCP penalty
  // applied to the homepage for anonymous mobile traffic.
  if ((loading || isFetchingProgress) && !isPublicStage) {
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
      <Helmet>
        <link rel="canonical" href={`https://touchflowpro.com${location.pathname === '/' ? '' : location.pathname}`} />
      </Helmet>
      <div className={`min-h-screen bg-bg-main selection:bg-primary/20 relative ${isTypingMode ? 'h-screen overflow-hidden flex flex-col' : ''}`}>
        <Header
          user={user}
          userProgress={userProgress}
          stage={stage}
          setStage={setStage}
          logout={logout}
          currentLesson={currentLesson}
        />

        <main className={`relative z-10 ${isTypingMode ? 'flex-1 flex flex-col items-center pt-2 overflow-y-auto scrollbar-none' : 'pt-24 pb-12 px-4'}`}>
          <Suspense fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted opacity-40">Loading...</div>
              </div>
            </div>
          }>
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
                  userName={userProgress?.name || (user as any).user_metadata?.full_name}
                />
              </PageTransition>
            )}

            {stage === 'welcome' && (
              <PageTransition key="welcome">
                <LandingPage
                  onStartAssessment={() => setStage('assessment')}
                  onViewSampleReport={() => setStage('sample_report')}
                />
              </PageTransition>
            )}

            {stage === 'free_test' && (
              <PageTransition key="free_test">
                <FreeTypingTest onNavigate={(s) => setStage(s as Stage)} />
              </PageTransition>
            )}

            {stage === 'sample_report' && (
              <PageTransition key="sample_report">
                <SampleReport
                  onBack={() => setStage('orgs')}
                  orgId={reportOrgId || undefined}
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

            {stage === 'curriculum' && userProgress && (
              <PageTransition key="curriculum">
                <Curriculum
                  userId={user?.id || 'guest'}
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
                  onStartDrill={(lesson, drillText, variationId) => handleStartLesson(lesson, true, drillText, variationId)}
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

            {stage === 'analytics' && (
              <PageTransition key="analytics">
                {user ? (
                   <div className="w-full space-y-12">
                   <AnalyticsDashboard />
                 </div>
                ) : (
                  <PublicFeatureTeaser 
                    featureName="Performance Analytics" 
                    description="Dive deep into your performance metrics, identifying your speed bottlenecks and heatmapping your keyboard accuracy."
                    icon={BarChart3}
                    onSignup={() => setStage('auth_signup')}
                    onLogin={() => setStage('auth_login')}
                  />
                )}
              </PageTransition>
            )}

            {stage === 'history' && (
              <PageTransition key="history">
                {user ? (
                  <SessionHistory userId={user.id} />
                ) : (
                  <PublicFeatureTeaser 
                    featureName="Operational Log" 
                    description="Keep a persistent record of every training session, tracking your progress over time with high-fidelity historical data."
                    icon={Activity}
                    onSignup={() => setStage('auth_signup')}
                    onLogin={() => setStage('auth_login')}
                  />
                )}
              </PageTransition>
            )}

            {stage === 'achievements' && (
              <PageTransition key="achievements">
                {user ? (
                  <AchievementsPanel userId={user.id} />
                ) : (
                  <PublicFeatureTeaser 
                    featureName="Achievement Registry" 
                    description="Unlock legendary badges and certifications as you hit milestones in speed, accuracy, and operational consistency."
                    icon={Award}
                    onSignup={() => setStage('auth_signup')}
                    onLogin={() => setStage('auth_login')}
                  />
                )}
              </PageTransition>
            )}

            {stage === 'goals' && (
              <PageTransition key="goals">
                {user ? (
                  <GoalsDashboard userId={user.id} />
                ) : (
                  <PublicFeatureTeaser 
                    featureName="Strategic Objectives" 
                    description="Set custom performance targets and track your trajectory toward elite-level typing mastery."
                    icon={TrendingUp}
                    onSignup={() => setStage('auth_signup')}
                    onLogin={() => setStage('auth_login')}
                  />
                )}
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

            {stage === 'settings' && user && (
              <PageTransition key="settings">
                <Settings onNavigate={(s) => setStage(s as Stage)} />
              </PageTransition>
            )}

            {stage === 'practice' && (
              <PageTransition key="practice">
                <Practice userId={user?.id || 'guest'} onSessionComplete={handleSessionComplete} />
              </PageTransition>
            )}

            {stage === 'practice_tests' && (
              <PageTransition key="practice_tests">
                {user ? (
                  <PracticeTests userId={user.id} onNavigate={setStage} />
                ) : (
                  <PublicFeatureTeaser 
                    featureName="Combat Evaluations" 
                    description="Access standardized practice tests to precisely measure your baseline and readiness for official certification."
                    icon={Clock}
                    onSignup={() => setStage('auth_signup')}
                    onLogin={() => setStage('auth_login')}
                  />
                )}
              </PageTransition>
            )}

            {stage === 'bible_practice' && (
              <PageTransition key="bible_practice">
                {user ? (
                  <BiblePractice userId={user.id} onSessionComplete={handleSessionComplete} />
                ) : (
                  <PublicFeatureTeaser 
                    featureName="Faith & Scriptures" 
                    description="Practice high-fidelity transcriptions of sacred texts with beautiful typographic immersion."
                    icon={BookOpen}
                    onSignup={() => setStage('auth_signup')}
                    onLogin={() => setStage('auth_login')}
                  />
                )}
              </PageTransition>
            )}


            {stage === 'leaderboard' && (
              <PageTransition key="leaderboard">
                {user ? (
                  <Leaderboard userId={user.id} />
                ) : (
                  <PublicFeatureTeaser 
                    featureName="Global Rankings" 
                    description="Compare your velocity against elite operatives worldwide. See where you stand on the global performance matrix."
                    icon={Trophy}
                    onSignup={() => setStage('auth_signup')}
                    onLogin={() => setStage('auth_login')}
                  />
                )}
              </PageTransition>
            )}

            {stage === 'code_practice' && (
              <PageTransition key="code_practice">
                {user ? (
                  <CodePractice userId={user.id} onSessionComplete={handleSessionComplete} />
                ) : (
                  <PublicFeatureTeaser 
                    featureName="Technical Synthesis" 
                    description="Advanced syntax drills for software engineering, DevOps protocols, and complex terminal operations."
                    icon={Compass}
                    onSignup={() => setStage('auth_signup')}
                    onLogin={() => setStage('auth_login')}
                  />
                )}
              </PageTransition>
            )}

            {stage === 'pricing' && user && (
              <PageTransition key="pricing">
                <PricingPage onNavigate={(stage) => setStage(stage as Stage)} />
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

            {stage === 'certificate' && (
              <PageTransition key="certificate">
                {user ? (
                   <TypingCertificate
                   userId={user.id}
                   userName={userProgress?.name || user.name || user.email}
                 />
                ) : (
                  <PublicFeatureTeaser 
                    featureName="Elite Certification" 
                    description="Earn professional-grade diplomas verifying your terminal performance for career advancement and proof of mastery."
                    icon={Shield}
                    onSignup={() => setStage('auth_signup')}
                    onLogin={() => setStage('auth_login')}
                  />
                )}
              </PageTransition>
            )}

            {stage === 'extension' && (
              <PageTransition key="extension">
                <Extension />
              </PageTransition>
            )}

            {stage === 'about' && (
              <PageTransition key="about">
                <AboutPage onBack={() => setStage(user ? 'dashboard' : 'welcome')} />
              </PageTransition>
            )}

            {stage === 'contact' && (
              <PageTransition key="contact">
                <ContactPage onBack={() => setStage(user ? 'dashboard' : 'welcome')} />
              </PageTransition>
            )}

            {stage === 'faq' && (
              <PageTransition key="faq">
                <FaqPage onBack={() => setStage(user ? 'dashboard' : 'welcome')} />
              </PageTransition>
            )}

            {stage === 'articles_index' && (
              <PageTransition key="articles_index">
                <ArticlesIndexPage onBack={() => setStage(user ? 'dashboard' : 'welcome')} />
              </PageTransition>
            )}

            {stage === 'orgs' && (
              <PageTransition key="orgs">
                {user ? (
                   <Orgs
                   onNavigate={(s: string) => setStage(s as Stage)}
                   onViewReport={(orgId) => {
                     setReportOrgId(orgId);
                     setStage('sample_report');
                   }}
                 />
                ) : (
                  <PublicFeatureTeaser 
                    featureName="Teams & Organizations" 
                    description="Manage high-performance squads, deploy group training plans, and monitor collective operational efficiency."
                    icon={Users}
                    onSignup={() => setStage('auth_signup')}
                    onLogin={() => setStage('auth_login')}
                  />
                )}
              </PageTransition>
            )}

            {stage === 'medicalTrack' && (
              <PageTransition key="medicalTrack">
                <MedicalTrack
                  setStage={setStage}
                  setLaunchParams={(params: any) => useLaunchStore.getState().setPendingLaunch({
                    source: 'manual',
                    mode: 'quote',
                    launch: params,
                    title: params.title || 'Medical Drill'
                  })}
                />
              </PageTransition>
            )}

            {stage === 'legalTrack' && (
              <PageTransition key="legalTrack">
                <LegalTrack
                  setStage={setStage}
                  setLaunchParams={(params: any) => useLaunchStore.getState().setPendingLaunch({
                    source: 'manual',
                    mode: 'quote',
                    launch: params,
                    title: params.title || 'Legal Drill'
                  })}
                />
              </PageTransition>
            )}

            {stage === 'codingTrack' && (
              <PageTransition key="codingTrack">
                <CodeTrack
                  setStage={setStage}
                  setLaunchParams={(params: any) => useLaunchStore.getState().setPendingLaunch({
                    source: 'manual',
                    mode: 'code',
                    launch: params,
                    title: params.title || 'Code Drill'
                  })}
                />
              </PageTransition>
            )}

            {stage === 'games' && (
              <PageTransition key="games">
                {user ? (
                   <GamesLanding onNavigate={(s) => setStage(s as Stage)} />
                ) : (
                  <PublicFeatureTeaser 
                    featureName="Terminal Sector Games" 
                    description="Access high-fidelity training simulations like Accuracy Assassin and Spell Rush to gamify your path to elite terminal proficiency."
                    icon={Gamepad2}
                    onSignup={() => setStage('auth_signup')}
                    onLogin={() => setStage('auth_login')}
                  />
                )}
              </PageTransition>
            )}

            {(stage === 'games_accuracy_assassin' || stage === 'games_burner_burst' || stage === 'games_spell_rush') && (
              <PageTransition key="games_locked">
                 {user ? (
                   <>
                    {stage === 'games_accuracy_assassin' && <AccuracyAssassinPage onBack={() => setStage('games')} />}
                    {stage === 'games_burner_burst' && <BurnerBurstPage onBack={() => setStage('games')} />}
                    {stage === 'games_spell_rush' && (
                      <div className="relative w-full h-full">
                        <SpellRushGame />
                        <button
                          onClick={() => setStage('games')}
                          className="fixed top-4 left-4 z-[60] px-4 py-2 bg-slate-800/80 text-white rounded-lg backdrop-blur text-xs font-bold uppercase tracking-wider hover:bg-slate-700 border border-white/10"
                        >
                          Exit Game
                        </button>
                      </div>
                    )}
                   </>
                 ) : (
                  <PublicFeatureTeaser 
                    featureName="Combat Training Simulation" 
                    description="This specific terminal simulation is currently locked for non-operatives. Claim your ID to begin high-velocity training."
                    icon={Gamepad2}
                    onSignup={() => setStage('auth_signup')}
                    onLogin={() => setStage('auth_login')}
                  />
                 )}
              </PageTransition>
            )}

            {stage === 'article_plateau' && (
              <PageTransition key="article_plateau">
                <TypingPlateauArticle onNavigate={(s: string) => setStage(s as Stage)} />
              </PageTransition>
            )}

            {stage === 'article_type_faster' && (
              <PageTransition key="article_type_faster">
                <TypeFasterArticle onNavigate={(s: string) => setStage(s as Stage)} />
              </PageTransition>
            )}

            {stage === 'article_60_to_100' && (
              <PageTransition key="article_60_to_100">
                <SixtyToHundredArticle onNavigate={(s: string) => setStage(s as Stage)} />
              </PageTransition>
            )}
            {stage === 'article_averages' && (
              <PageTransition key="article_averages">
                <AveragesArticle onNavigate={(s: string) => setStage(s as Stage)} />
              </PageTransition>
            )}
            {stage === 'article_ultimate_guide' && (
              <PageTransition key="ultimate-guide">
                <UltimateGuideArticle onNavigate={setStage} />
              </PageTransition>
            )}
            {stage === 'article_how_to_type_faster' && (
              <PageTransition key="how-to-type-faster">
                <HowToTypeFasterArticle onNavigate={setStage} />
              </PageTransition>
            )}
            {stage === 'article_touch_typing_guide' && (
              <PageTransition key="touch-typing-guide">
                <TouchTypingGuideArticle onNavigate={setStage} />
              </PageTransition>
            )}
            {stage === 'article_typing_practice' && (
              <PageTransition key="typing-practice">
                <TypingPracticeArticle onNavigate={setStage} />
              </PageTransition>
            )}
            {stage === 'article_typing_test' && (
              <PageTransition key="typing-test">
                <TypingSpeedTestArticle onNavigate={setStage} />
              </PageTransition>
            )}
            {stage === 'article_improve_typing_speed' && (
              <PageTransition key="improve-typing-speed">
                <ImproveTypingSpeedArticle onNavigate={setStage} />
              </PageTransition>
            )}
            {stage === 'article_typing_accuracy' && (
              <PageTransition key="typing-accuracy">
                <TypingAccuracyArticle onNavigate={setStage} />
              </PageTransition>
            )}
            {stage === 'article_fastest_techniques' && (
              <PageTransition key="fastest-techniques">
                <FastestTypingTechniquesArticle onNavigate={setStage} />
              </PageTransition>
            )}
          </AnimatePresence>
          </Suspense>
        </main>

        <AchievementModal
          isOpen={!!showAchievement}
          onClose={() => setShowAchievement(null)}
          achievementType={showAchievement?.type}
          isLeveledUp={showAchievement?.isLevel}
          newLevel={showAchievement?.level}
        />

        <SaveProgressModal
          isOpen={!!showSaveProgressModal}
          onClose={() => setShowSaveProgressModal(null)}
          metrics={showSaveProgressModal?.metrics || null}
          onSignup={() => {
            setShowSaveProgressModal(null);
            setStage('auth_signup');
          }}
          onLogin={() => {
            setShowSaveProgressModal(null);
            setStage('auth_login');
          }}
        />

        {!isTypingMode && (
          <footer className="border-t border-white/5 mt-12 py-12 px-4 bg-bg-main relative z-50">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="col-span-1 md:col-span-1">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic mb-4">
                  TouchFlow <span className="text-primary">Pro</span>
                </h3>
                <p className="text-[11px] text-text-muted opacity-80 max-w-sm mb-6 leading-relaxed">
                  Professional-grade typing performance training. Measure baseline, discover bottlenecks, and drill weaknesses.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Explore</h4>
                <ul className="flex flex-col gap-3">
                  <li><Link onClick={() => setStage('about')} to="/about" className="text-[10px] text-text-muted hover:text-primary transition-colors font-bold uppercase tracking-wider">About Us</Link></li>
                  <li><Link onClick={() => setStage('articles_index')} to="/articles" className="text-[10px] text-text-muted hover:text-primary transition-colors font-bold uppercase tracking-wider">Resource Library</Link></li>
                  <li><Link onClick={() => setStage('contact')} to="/contact" className="text-[10px] text-text-muted hover:text-primary transition-colors font-bold uppercase tracking-wider">Contact</Link></li>
                  <li><Link onClick={() => setStage('faq')} to="/faq" className="text-[10px] text-text-muted hover:text-primary transition-colors font-bold uppercase tracking-wider">FAQ</Link></li>
                  <li><Link onClick={() => setStage('free_test')} to="/free-typing-test" className="text-[10px] text-text-muted hover:text-primary transition-colors font-bold uppercase tracking-wider">Free Typing Test</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Research</h4>
                <ul className="flex flex-col gap-3">
                  <li><Link onClick={() => setStage('article_averages')} to="/articles/typing-speed-averages" className="text-[10px] text-text-muted hover:text-primary transition-colors font-bold uppercase tracking-wider">Speed Averages (2026)</Link></li>
                  <li><Link onClick={() => setStage('article_plateau')} to="/articles/typing-speed-plateau" className="text-[10px] text-text-muted hover:text-primary transition-colors font-bold uppercase tracking-wider">Breaking Plateaus</Link></li>
                  <li><Link onClick={() => setStage('article_improve_typing_speed')} to="/articles/improve-typing-speed" className="text-[10px] text-text-muted hover:text-primary transition-colors font-bold uppercase tracking-wider">7 Elite Speed Drills</Link></li>
                  <li><Link onClick={() => setStage('article_60_to_100')} to="/articles/60-wpm-to-100-wpm" className="text-[10px] text-text-muted hover:text-primary transition-colors font-bold uppercase tracking-wider">60 to 100 WPM Plan</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Legal</h4>
                <ul className="flex flex-col gap-3">
                  <li>
                    <Link onClick={() => setStage('terms')} to="/terms" className="text-[10px] text-text-muted hover:text-primary transition-colors font-bold uppercase tracking-wider">Terms of Service</Link>
                  </li>
                  <li>
                    <Link onClick={() => setStage('privacy')} to="/privacy-policy" className="text-[10px] text-text-muted hover:text-primary transition-colors font-bold uppercase tracking-wider">Privacy Policy</Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[10px] text-text-muted font-medium">
                © {new Date().getFullYear()} TouchFlow Pro. All rights reserved.
              </span>
            </div>
          </footer>
        )}

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
