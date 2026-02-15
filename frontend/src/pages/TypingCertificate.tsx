import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TypingEngine } from '@shared/typingEngine'
import type { KeystrokeEvent, TypingMetrics } from '@shared/types'
import { Award, Clock, Target, Zap, Download, RotateCcw, ChevronRight, Shield } from 'lucide-react'

interface TypingCertificateProps {
    userId: string
    userName: string
}

// Certificate tiers
const TIERS = [
    { name: 'Bronze', minWPM: 20, color: '#CD7F32', icon: '🥉', description: 'Beginner Proficiency' },
    { name: 'Silver', minWPM: 40, color: '#C0C0C0', icon: '🥈', description: 'Intermediate Proficiency' },
    { name: 'Gold', minWPM: 60, color: '#FFD700', icon: '🥇', description: 'Advanced Proficiency' },
    { name: 'Platinum', minWPM: 80, color: '#E5E4E2', icon: '💎', description: 'Expert Proficiency' },
    { name: 'Diamond', minWPM: 100, color: '#B9F2FF', icon: '👑', description: 'Elite Proficiency' },
]

const TEST_DURATIONS = [
    { label: '1 Minute', seconds: 60, description: 'Quick Assessment' },
    { label: '3 Minutes', seconds: 180, description: 'Standard Test' },
    { label: '5 Minutes', seconds: 300, description: 'Professional Certification' },
]

const TEST_PASSAGES = [
    "The quick brown fox jumps over the lazy dog. A journey of a thousand miles begins with a single step. Every moment is a fresh beginning. In the middle of difficulty lies opportunity. The only way to do great work is to love what you do.",
    "Technology is best when it brings people together. Innovation distinguishes between a leader and a follower. The advance of technology is based on making it fit in so that you don't really even notice it, so it's part of everyday life.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. The greatest glory in living lies not in never falling, but in rising every time we fall. The way to get started is to quit talking and begin doing.",
    "Programming is not about typing, it is about thinking. The best error message is the one that never shows up. Code is like humor. When you have to explain it, it is bad. First, solve the problem. Then, write the code.",
    "Learning to type is like learning to play piano. It takes practice, patience, and persistence. Start slow, focus on accuracy, and speed will naturally follow. The fingers develop muscle memory over time, making each keystroke effortless.",
    "The art of communication lies in the speed of thought translated to the speed of fingers. Every word typed with precision builds confidence. Accuracy is the foundation upon which speed is built. Master the basics before chasing records.",
]

function getTier(wpm: number) {
    let tier = TIERS[0]
    for (const t of TIERS) {
        if (wpm >= t.minWPM) tier = t
    }
    return tier
}

function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

type Phase = 'select' | 'testing' | 'result'

const TypingCertificate: React.FC<TypingCertificateProps> = ({ userId: _userId, userName }) => {
    const [phase, setPhase] = useState<Phase>('select')
    const [selectedDuration, setSelectedDuration] = useState(TEST_DURATIONS[1])
    const [testText, setTestText] = useState('')
    const [userInput, setUserInput] = useState('')

    const [metrics, setMetrics] = useState<TypingMetrics | null>(null)
    const [testDate, setTestDate] = useState<Date>(new Date())
    const [timeLeft, setTimeLeft] = useState(0)
    const [isStarted, setIsStarted] = useState(false)
    const [isFailed, setIsFailed] = useState(false)
    const startTimeRef = useRef<number | null>(null)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const certificateRef = useRef<HTMLDivElement>(null)
    const textContainerRef = useRef<HTMLDivElement>(null)
    const cursorCharRef = useRef<HTMLSpanElement>(null)

    const keystrokesRef = useRef<KeystrokeEvent[]>([])
    const userInputRef = useRef('')
    const testTextRef = useRef('')

    const [history, setHistory] = useState<any[]>([])
    const [isLoadingHistory, setIsLoadingHistory] = useState(false)
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
    const [saveError, setSaveError] = useState<string>('')

    const processingRef = useRef(false)

    const endTest = async () => {
        if (processingRef.current) return
        processingRef.current = true

        if (timerRef.current) clearInterval(timerRef.current)
        const finalMetrics = TypingEngine.calculateMetrics(keystrokesRef.current, testTextRef.current)
        setMetrics(finalMetrics)
        setPhase('result')

        // Save if passed
        if (finalMetrics.netWPM >= 20 && finalMetrics.accuracy >= 90) {
            setSaveStatus('saving')
            try {
                const token = localStorage.getItem('tfp_token')
                if (!token) {
                    throw new Error('No authentication token found')
                }

                const res = await fetch('/api/certificates', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        wpm: Math.round(finalMetrics.netWPM),
                        accuracy: Math.round(finalMetrics.accuracy),
                        type: selectedDuration.label
                    })
                })

                if (!res.ok) {
                    const errorData = await res.json()
                    throw new Error(errorData.error || 'Failed to save certificate')
                }

                setSaveStatus('success')
                // Refresh history in background so it's ready when they go back
                fetchHistory()
            } catch (err: any) {
                console.error('Failed to save certificate', err)
                setSaveStatus('error')
                setSaveError(err.message || 'Unknown error occurred')
            } finally {
                processingRef.current = false
            }
        } else {
            processingRef.current = false
        }
    }

    // Page-flip scroll
    useEffect(() => {
        if (cursorCharRef.current && textContainerRef.current) {
            const container = textContainerRef.current
            const cursor = cursorCharRef.current
            const containerRect = container.getBoundingClientRect()
            const cursorRect = cursor.getBoundingClientRect()
            if (cursorRect.bottom > containerRect.bottom) {
                container.scrollTop += containerRect.height
            }
        }
    }, [userInput])

    // Fetch history
    const fetchHistory = async () => {
        setIsLoadingHistory(true)
        try {
            const token = localStorage.getItem('tfp_token')
            const res = await fetch('/api/certificates', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setHistory(data)
            }
        } catch (err) {
            console.error('Failed to load history', err)
        } finally {
            setIsLoadingHistory(false)
        }
    }

    useEffect(() => {
        if (phase === 'select') {
            fetchHistory()
        }
    }, [phase])

    const startTest = (duration: typeof TEST_DURATIONS[0]) => {
        setSelectedDuration(duration)
        setTestDate(new Date())
        let passage = ''
        while (passage.length < duration.seconds * 8) {
            passage += TEST_PASSAGES[Math.floor(Math.random() * TEST_PASSAGES.length)] + ' '
        }
        const trimmed = passage.trim()
        setTestText(trimmed)
        testTextRef.current = trimmed
        setUserInput('')
        userInputRef.current = ''
        keystrokesRef.current = []
        setMetrics(null)
        setTimeLeft(duration.seconds)
        setIsStarted(false)
        setIsFailed(false)
        setPhase('testing')
        setTimeout(() => inputRef.current?.focus(), 100)
    }



    // Continuous WPM update
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>
        if (isStarted && phase === 'testing') {
            interval = setInterval(() => {
                if (keystrokesRef.current.length > 0) {
                    const newMetrics = TypingEngine.calculateMetrics(keystrokesRef.current, testTextRef.current)
                    setMetrics(newMetrics)
                }
            }, 500)
        }
        return () => clearInterval(interval)
    }, [isStarted, phase])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isFailed || phase !== 'testing') return

        if (!isStarted && e.key.length === 1) {
            setIsStarted(true)
            startTimeRef.current = Date.now()
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        setTimeout(endTest, 0)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            timerRef.current = timer
        }

        if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Shift') {
            const currentInput = userInputRef.current
            const currentText = testTextRef.current
            const event: KeystrokeEvent = {
                keyCode: e.code,
                key: e.key,
                eventType: 'keydown',
                timestamp: Date.now(),
                expectedKey: e.key === 'Shift' ? 'Shift' : currentText[currentInput.length]
            }
            const updated = [...keystrokesRef.current, event]
            keystrokesRef.current = updated

            if (e.key !== 'Shift') {
                const newMetrics = TypingEngine.calculateMetrics(updated, currentText)
                setMetrics(newMetrics)
            }
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (phase !== 'testing') return
        const value = e.target.value
        const currentText = testTextRef.current
        if (value.length <= currentText.length) {
            setUserInput(value)
            userInputRef.current = value
        }
        if (value.length >= currentText.length) {
            endTest()
        }
    }

    const resetToSelection = () => {
        if (timerRef.current) clearInterval(timerRef.current)
        processingRef.current = false
        setPhase('select')
        setMetrics(null)
        setUserInput('')
        userInputRef.current = ''
        keystrokesRef.current = []
    }

    const printCertificate = () => {
        const cert = certificateRef.current
        if (!cert) return
        const printWindow = window.open('', '_blank')
        if (!printWindow) return

        const css = `
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
            @page { size: landscape; margin: 0; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body { 
                margin: 0; 
                padding: 0; 
                font-family: 'Montserrat', sans-serif; 
                background: white;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
            }
            .cert-container {
                width: 11in;
                height: 8.5in;
                margin: 0 auto;
                padding: 40px;
                position: relative;
                background: #fff;
                color: #1a1a1a;
                overflow: hidden;
            }
            /* Fancy Border */
            .cert-border-outer {
                position: absolute;
                top: 20px; left: 20px; right: 20px; bottom: 20px;
                border: 2px solid #1a1a1a;
                z-index: 10;
            }
            .cert-border-inner {
                position: absolute;
                top: 28px; left: 28px; right: 28px; bottom: 28px;
                border: 1px solid #cfaa5e;
                z-index: 10;
            }
            .corner-tl, .corner-tr, .corner-bl, .corner-br {
                position: absolute;
                width: 60px;
                height: 60px;
                background-size: contain;
                z-index: 20;
                opacity: 0.8;
            }
            .corner-tl { top: 15px; left: 15px; border-top: 4px solid #1a1a1a; border-left: 4px solid #1a1a1a; }
            .corner-tr { top: 15px; right: 15px; border-top: 4px solid #1a1a1a; border-right: 4px solid #1a1a1a; }
            .corner-bl { bottom: 15px; left: 15px; border-bottom: 4px solid #1a1a1a; border-left: 4px solid #1a1a1a; }
            .corner-br { bottom: 15px; right: 15px; border-bottom: 4px solid #1a1a1a; border-right: 4px solid #1a1a1a; }

            .cert-content {
                position: relative;
                z-index: 30;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
            }
            .logo {
                font-family: 'Cinzel', serif;
                font-weight: 900;
                font-size: 24px;
                letter-spacing: 4px;
                color: #333;
                text-transform: uppercase;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .main-title {
                font-family: 'Cinzel', serif;
                font-size: 48px;
                font-weight: 700;
                color: #1a1a1a;
                text-transform: uppercase;
                letter-spacing: 2px;
                margin-bottom: 10px;
                line-height: 1.2;
            }
            .subtitle {
                font-family: 'Playfair Display', serif;
                font-size: 18px;
                font-style: italic;
                color: #666;
                margin-bottom: 40px;
            }
            .recipient-intro {
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: #888;
                margin-bottom: 15px;
            }
            .recipient-name {
                font-family: 'Playfair Display', serif;
                font-size: 56px;
                font-weight: 700;
                color: #000;
                border-bottom: 1px solid #ddd;
                padding-bottom: 10px;
                margin-bottom: 30px;
                min-width: 400px;
            }
            .achievement-text {
                font-size: 18px;
                color: #444;
                max-width: 700px;
                margin-bottom: 40px;
                line-height: 1.6;
            }
            .achievement-highlight {
                font-weight: 700;
                color: #000;
            }
            .tier-Badge {
                margin: 20px 0;
            }
            .metrics-row {
                display: flex;
                gap: 40px;
                margin-bottom: 40px;
                justify-content: center;
            }
            .metric {
                text-align: center;
            }
            .metric-val {
                font-family: 'Cinzel', serif;
                font-size: 32px;
                font-weight: 700;
                color: #1a1a1a;
            }
            .metric-label {
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: #888;
            }
            .footer-row {
                display: flex;
                justify-content: space-between;
                width: 80%;
                margin-top: 40px;
                border-top: 1px solid #eee;
                padding-top: 20px;
            }
            .footer-col {
                text-align: center;
            }
            .signature {
                font-family: 'Playfair Display', serif;
                font-size: 24px;
                font-style: italic;
                color: #333;
                margin-bottom: 5px;
            }
            .footer-label {
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: #999;
            }
            .watermark {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-15deg);
                font-family: 'Cinzel', serif;
                font-size: 120px;
                color: rgba(207, 170, 94, 0.05); /* Gold tint opacity */
                z-index: 15;
                pointer-events: none;
                white-space: nowrap;
                text-transform: uppercase;
            }
        `;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Certificate - ${userName}</title>
                    <style>${css}</style>
                </head>
                <body>
                    ${cert.innerHTML}
                </body>
            </html>
        `)
        printWindow.document.close()

        // Wait for fonts/images?
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }, 800)
    }

    const tier = metrics ? getTier(metrics.netWPM) : TIERS[0]
    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

    // Render logic components - same as before but prettier UI for phase === 'select'
    if (phase === 'select') {
        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
                <div className="relative overflow-hidden card group min-h-[220px] flex items-center p-8 sm:p-12 mb-12 border border-slate-700/50">
                    <div className="relative z-10 w-full md:w-2/3">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                                <Award size={18} className="text-primary" />
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Certification Center</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-heading font-black tracking-tighter text-text-main mb-6 uppercase leading-[0.9]">
                            Earn Your<br />
                            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Certificate</span>
                        </h1>
                        <p className="text-text-muted text-lg max-w-2xl leading-relaxed opacity-70">
                            Take an official timed typing test and receive a <span className="text-primary font-black uppercase tracking-wider">verifiable certificate</span> of your typing proficiency.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {TEST_DURATIONS.map((dur) => (
                        <motion.button
                            key={dur.seconds}
                            whileHover={{ y: -4 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => startTest(dur)}
                            className="card group cursor-pointer text-left hover:border-primary/30 transition-all p-8 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Clock size={64} />
                            </div>
                            <div className="flex items-center gap-3 mb-4 relative z-10">
                                <Clock size={18} className="text-primary group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">{dur.description}</span>
                            </div>
                            <h3 className="text-3xl font-heading font-black text-text-main mb-2 group-hover:text-primary transition-colors relative z-10">{dur.label}</h3>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity mt-4 relative z-10">
                                Start Test <ChevronRight size={12} />
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* History Section */}
                {isLoadingHistory && (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                )}

                {!isLoadingHistory && history.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <h3 className="text-sm font-black uppercase tracking-widest text-text-muted mb-6 flex items-center gap-2">
                            <Shield size={14} /> Certificate History
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {history.map((cert) => (
                                <motion.button
                                    key={cert.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        setMetrics({
                                            netWPM: cert.wpm,
                                            accuracy: cert.accuracy,
                                            grossWPM: cert.wpm, // Fallback
                                            errors: 0,
                                            durationMs: 0
                                        })
                                        setTestDate(new Date(cert.testDate))
                                        // Try to find matching duration label or default
                                        const dur = TEST_DURATIONS.find(d => d.label === cert.type) || TEST_DURATIONS[0]
                                        setSelectedDuration(dur)
                                        setPhase('result')
                                    }}
                                    className="card p-4 text-left hover:border-primary/30 transition-colors group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-mono text-text-muted">{new Date(cert.testDate).toLocaleDateString()}</span>
                                        <Award size={14} className="text-primary opacity-50 group-hover:opacity-100" />
                                    </div>
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-2xl font-black text-text-main">{cert.wpm}</span>
                                        <span className="text-[10px] font-bold text-text-muted uppercase">WPM</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs text-text-muted">{cert.type}</span>
                                        <span className={`text-xs font-bold ${cert.accuracy >= 98 ? 'text-green-400' : 'text-secondary'}`}>{cert.accuracy}% Acc</span>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    if (phase === 'testing') {
        const progress = testText.length > 0 ? (userInput.length / testText.length) * 100 : 0
        const currentWPM = metrics?.netWPM || 0
        const currentAccuracy = metrics?.accuracy || 100

        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={resetToSelection} className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors">
                        <RotateCcw size={14} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Abort Test</span>
                    </button>
                    <div className="flex items-center gap-8 bg-slate-800/50 backdrop-blur px-6 py-3 rounded-full border border-white/5">
                        <div className="flex items-center gap-3">
                            <Zap size={16} className="text-primary" />
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-primary leading-none">{currentWPM}</span>
                                <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider">WPM</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Target size={16} className="text-secondary" />
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-secondary leading-none">{currentAccuracy}%</span>
                                <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider">ACC</span>
                            </div>
                        </div>
                        <div className={`flex items-center gap-3 ${timeLeft <= 10 && isStarted ? 'text-red-500 animate-pulse' : 'text-text-main'}`}>
                            <Clock size={16} />
                            <div className="flex flex-col">
                                <span className="text-xl font-black leading-none tabular-nums">{formatTime(timeLeft)}</span>
                                <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider">Time</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card p-8 sm:p-12 overflow-hidden mb-6 min-h-[400px] flex flex-col relative">
                    {/* Progress Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                        <motion.div
                            className="h-full bg-gradient-to-r from-primary to-secondary"
                            animate={{ width: `${progress}%` }}
                            transition={{ type: 'spring', stiffness: 100 }}
                        />
                    </div>

                    <div
                        ref={textContainerRef}
                        className="flex-1 overflow-y-auto leading-loose select-none flex flex-wrap gap-x-0.5 gap-y-2 scrollbar-none outline-none font-mono text-xl sm:text-2xl"
                    >
                        {testText.split('').map((char, index) => {
                            const isTyped = index < userInput.length
                            const isCurrent = index === userInput.length
                            const isCorrect = isTyped && userInput[index] === char
                            const isError = isTyped && !isCorrect

                            return (
                                <span
                                    key={index}
                                    ref={isCurrent ? cursorCharRef : undefined}
                                    className={`relative transition-colors duration-100 ${isError ? 'text-red-400 bg-red-400/10 rounded-sm' :
                                        isCorrect ? 'text-primary' :
                                            isCurrent ? 'text-white font-bold decoration-primary underline underline-offset-4' :
                                                'text-slate-600'
                                        }`}
                                >
                                    {char === ' ' ? '\u00A0' : char}
                                    {isCurrent && (
                                        <motion.div
                                            layoutId="cert-cursor"
                                            className="absolute -bottom-1 left-0 w-full h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]"
                                            animate={{ opacity: [1, 0.5, 1] }}
                                            transition={{ repeat: Infinity, duration: 0.8 }}
                                        />
                                    )}
                                </span>
                            )
                        })}
                    </div>

                    <div className="relative mt-6">
                        <input
                            ref={inputRef}
                            type="text"
                            value={userInput}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-default"
                            autoComplete="off"
                            autoCorrect="off" // No spellcheck for typing tests
                            autoCapitalize="off"
                            spellCheck="false"
                            autoFocus
                        />
                        {/* Input Overlay Message */}
                        {!isStarted && (
                            <div className="absolute inset-x-0 -top-20 flex justify-center pointer-events-none">
                                <div className="bg-slate-900/90 backdrop-blur border border-primary/30 text-primary px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest animate-bounce shadow-lg shadow-primary/20">
                                    Start typing to begin
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    if (phase === 'result' && metrics) {
        const passed = metrics.accuracy >= 90 && metrics.netWPM >= 20

        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
                <AnimatePresence>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-heading font-black text-text-main mb-4 uppercase tracking-tight">Test Results</h2>

                            {/* Save Status Feedback */}
                            {saveStatus === 'saving' && (
                                <div className="mb-4 text-primary animate-pulse text-sm font-bold uppercase tracking-widest">Saving result...</div>
                            )}
                            {saveStatus === 'success' && (
                                <div className="mb-4 text-green-400 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                    <Shield size={14} /> Certificate Saved to History
                                </div>
                            )}
                            {saveStatus === 'error' && (
                                <div className="mb-4 text-red-400 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                    <span>Save Failed: {saveError}</span>
                                </div>
                            )}

                            <div className="flex justify-center gap-8">
                                <div className="text-center">
                                    <div className="text-5xl font-black text-primary mb-1">{metrics.netWPM}</div>
                                    <div className="text-xs font-bold text-text-muted uppercase tracking-widest">WPM</div>
                                </div>
                                <div className="w-px h-16 bg-white/10" />
                                <div className="text-center">
                                    <div className="text-5xl font-black text-secondary mb-1">{metrics.accuracy}%</div>
                                    <div className="text-xs font-bold text-text-muted uppercase tracking-widest">Accuracy</div>
                                </div>
                            </div>
                        </div>

                        {passed ? (
                            <>
                                {/* HIDDEN CERTIFICATE TEMPLATE - Used for printing */}
                                <div className="hidden">
                                    <div ref={certificateRef} className="cert-container">
                                        <div className="cert-border-outer"></div>
                                        <div className="cert-border-inner"></div>
                                        <div className="corner-tl"></div>
                                        <div className="corner-tr"></div>
                                        <div className="corner-br"></div>
                                        <div className="corner-bl"></div>

                                        <div className="watermark">TouchFlow</div>

                                        <div className="cert-content">
                                            <div className="logo">
                                                <Shield size={24} /> TouchFlow Pro
                                            </div>

                                            <div className="main-title">Certificate of Proficiency</div>
                                            <div className="subtitle">Awarded for Excellence in Typing Speed & Accuracy</div>

                                            <div className="recipient-intro">This certifies that</div>
                                            <div className="recipient-name">{userName || "TouchFlow User"}</div>

                                            <div className="achievement-text">
                                                has successfully completed the <strong>{selectedDuration.label} Certification Standard</strong> and has demonstrated professional typing proficiency.
                                            </div>

                                            <div className="metrics-row">
                                                <div className="metric">
                                                    <div className="metric-val">{metrics.netWPM}</div>
                                                    <div className="metric-label">Net Words Per Minute</div>
                                                </div>
                                                <div className="metric">
                                                    <div className="metric-val">{tier.name}</div>
                                                    <div className="metric-label">Proficiency Tier</div>
                                                </div>
                                                <div className="metric">
                                                    <div className="metric-val">{metrics.accuracy}%</div>
                                                    <div className="metric-label">Accuracy Score</div>
                                                </div>
                                            </div>

                                            <div className="footer-row">
                                                <div className="footer-col">
                                                    <div className="signature">{formatDate(testDate)}</div>
                                                    <div className="footer-label">Date of Issue</div>
                                                </div>
                                                <div className="footer-col">
                                                    <div className="signature" style={{ fontFamily: 'monospace', fontSize: '14px', fontStyle: 'normal', letterSpacing: '2px' }}>
                                                        ID: {Date.now().toString(36).toUpperCase()}
                                                    </div>
                                                    <div className="footer-label">Certificate ID</div>
                                                </div>
                                                <div className="footer-col">
                                                    <div className="signature">TouchFlow Authority</div>
                                                    <div className="footer-label">Verified By</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* PREVIEW CARD (On Screen) */}
                                <div className="max-w-3xl mx-auto bg-white text-slate-900 rounded-lg shadow-2xl overflow-hidden mb-12 transform hover:scale-[1.01] transition-transform duration-500">
                                    <div className="p-12 text-center relative border-8 border-slate-100">
                                        <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-slate-900"></div>
                                        <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-slate-900"></div>
                                        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-slate-900"></div>
                                        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-slate-900"></div>

                                        <Shield className="w-8 h-8 mx-auto mb-4 text-slate-900" />
                                        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2 uppercase tracking-widest">Certificate of Proficiency</h2>
                                        <div className="w-24 h-1 bg-amber-500 mx-auto mb-8"></div>

                                        <p className="text-slate-500 font-serif italic mb-2">This certifies that</p>
                                        <h3 className="text-4xl font-serif font-bold text-slate-900 mb-6 border-b-2 border-slate-200 inline-block pb-2 px-8">
                                            {userName}
                                        </h3>

                                        <p className="text-slate-600 mb-8 max-w-lg mx-auto leading-relaxed">
                                            Has achieved the rank of <strong className="text-slate-900">{tier.name}</strong> with a speed of <strong className="text-slate-900">{metrics.netWPM} WPM</strong> and <strong className="text-slate-900">{metrics.accuracy}% accuracy</strong>.
                                        </p>

                                        <div className="flex justify-between items-end border-t border-slate-200 pt-8 mt-8">
                                            <div className="text-center">
                                                <div className="font-serif italic text-lg">{formatDate(testDate)}</div>
                                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Date</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="font-serif italic text-lg text-slate-300">TouchFlow Authority</div>
                                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Signature</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={printCertificate}
                                        className="flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-105 transition-transform"
                                    >
                                        <Download size={16} />
                                        Download Official Certificate
                                    </button>
                                    <button
                                        onClick={resetToSelection}
                                        className="flex items-center gap-2 px-8 py-4 rounded-xl border border-white/10 hover:bg-white/5 text-text-muted hover:text-white font-black text-xs uppercase tracking-widest transition-colors"
                                    >
                                        <RotateCcw size={16} />
                                        New Test
                                    </button>
                                </div>
                                <div className="mt-8 flex justify-center">
                                    <button
                                        onClick={resetToSelection}
                                        className="text-text-muted hover:text-primary text-xs uppercase tracking-widest font-bold flex items-center gap-2 transition-colors"
                                    >
                                        <Shield size={14} /> Back to History
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="card max-w-lg mx-auto p-12 text-center border-dashed border-2 border-white/10 bg-transparent">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Target size={32} className="text-text-muted opacity-50" />
                                </div>
                                <h3 className="text-2xl font-black text-text-main mb-2">Certification Requirement Not Met</h3>
                                <p className="text-text-muted mb-8 leading-relaxed">
                                    To achieve certification, you must maintain at least <strong className="text-white">90% accuracy</strong> and <strong className="text-white">20 WPM</strong>.
                                </p>
                                <button
                                    onClick={resetToSelection}
                                    className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-widest transition-all"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        )
    }

    return null
}

export default TypingCertificate
