import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TypingEngine } from '@shared/typingEngine'
import type { KeystrokeEvent, TypingMetrics } from '@shared/types'
import { Award, Clock, Target, Zap, Download, RotateCcw, ChevronRight, Shield } from 'lucide-react'

interface TypingCertificateProps {
    userId: string
    userName: string
}

// Certificate tiers based on WPM
const TIERS = [
    { name: 'Bronze', minWPM: 20, color: '#CD7F32', gradient: 'from-amber-700 to-amber-500', border: 'border-amber-600/40', bg: 'bg-amber-500/10', text: 'text-amber-500', icon: '🥉' },
    { name: 'Silver', minWPM: 40, color: '#C0C0C0', gradient: 'from-slate-400 to-slate-300', border: 'border-slate-400/40', bg: 'bg-slate-400/10', text: 'text-slate-400', icon: '🥈' },
    { name: 'Gold', minWPM: 60, color: '#FFD700', gradient: 'from-yellow-500 to-yellow-300', border: 'border-yellow-500/40', bg: 'bg-yellow-500/10', text: 'text-yellow-400', icon: '🥇' },
    { name: 'Platinum', minWPM: 80, color: '#E5E4E2', gradient: 'from-cyan-400 to-blue-300', border: 'border-cyan-400/40', bg: 'bg-cyan-400/10', text: 'text-cyan-400', icon: '💎' },
    { name: 'Diamond', minWPM: 100, color: '#B9F2FF', gradient: 'from-violet-500 to-fuchsia-400', border: 'border-violet-500/40', bg: 'bg-violet-500/10', text: 'text-violet-400', icon: '👑' },
]

const TEST_DURATIONS = [
    { label: '1 Minute', seconds: 60, description: 'Quick Assessment' },
    { label: '3 Minutes', seconds: 180, description: 'Standard Test' },
    { label: '5 Minutes', seconds: 300, description: 'Professional Certification' },
]

// Longer passage for multi-minute tests
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
    const [timeLeft, setTimeLeft] = useState(0)
    const [isStarted, setIsStarted] = useState(false)
    const [isFailed, setIsFailed] = useState(false)
    const startTimeRef = useRef<number | null>(null)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const certificateRef = useRef<HTMLDivElement>(null)

    // Refs to hold latest values so endTest always reads current data
    const keystrokesRef = useRef<KeystrokeEvent[]>([])
    const userInputRef = useRef('')
    const testTextRef = useRef('')

    const startTest = (duration: typeof TEST_DURATIONS[0]) => {
        setSelectedDuration(duration)
        // Generate enough text for the duration
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

    const endTest = () => {
        if (timerRef.current) clearInterval(timerRef.current)
        // Use refs to get the latest data (avoids stale closure)
        const finalMetrics = TypingEngine.calculateMetrics(keystrokesRef.current, testTextRef.current)
        setMetrics(finalMetrics)
        setPhase('result')
    }

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
        // Auto-end if they finish the text
        if (value.length >= currentText.length) {
            endTest()
        }
    }

    const resetToSelection = () => {
        if (timerRef.current) clearInterval(timerRef.current)
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
        printWindow.document.write(`
      <html><head><title>TouchFlow Pro - Typing Certificate</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Outfit:wght@700;800;900&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #0f172a; font-family: 'Inter', sans-serif; }
        @media print { body { background: white; } }
      </style></head><body>${cert.outerHTML}</body></html>
    `)
        printWindow.document.close()
        setTimeout(() => { printWindow.print(); printWindow.close() }, 500)
    }

    const tier = metrics ? getTier(metrics.netWPM) : TIERS[0]
    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

    // ─── Selection Screen ───
    if (phase === 'select') {
        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
                {/* Hero */}
                <div className="relative overflow-hidden card group min-h-[220px] flex items-center p-8 sm:p-12 mb-12">
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
                    <div className="absolute top-0 right-0 w-1/3 h-full opacity-[0.03] pointer-events-none flex items-center justify-center">
                        <Award size={300} />
                    </div>
                </div>

                {/* Duration Selection */}
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-6">Select Test Duration</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {TEST_DURATIONS.map((dur) => (
                        <motion.button
                            key={dur.seconds}
                            whileHover={{ y: -4 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => startTest(dur)}
                            className="card group cursor-pointer text-left hover:border-primary/30 transition-all p-8"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <Clock size={18} className="text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">{dur.description}</span>
                            </div>
                            <h3 className="text-3xl font-heading font-black text-text-main mb-2 group-hover:text-primary transition-colors">{dur.label}</h3>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity mt-4">
                                Start Test <ChevronRight size={12} />
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Tier Guide */}
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-6">Certificate Tiers</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {TIERS.map((t) => (
                        <div key={t.name} className={`card p-4 text-center ${t.border} ${t.bg}`}>
                            <span className="text-3xl block mb-2">{t.icon}</span>
                            <span className={`text-sm font-black ${t.text}`}>{t.name}</span>
                            <span className="text-[10px] text-text-muted block mt-1">{t.minWPM}+ WPM</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // ─── Testing Screen ───
    if (phase === 'testing') {
        const progress = testText.length > 0 ? (userInput.length / testText.length) * 100 : 0
        const currentWPM = metrics?.netWPM || 0
        const currentAccuracy = metrics?.accuracy || 100

        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                {/* Top Bar */}
                <div className="flex items-center justify-between mb-6">
                    <button onClick={resetToSelection} className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors">
                        <RotateCcw size={14} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Cancel</span>
                    </button>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Zap size={14} className="text-primary" />
                            <span className="text-xl font-black text-primary">{currentWPM}</span>
                            <span className="text-[9px] font-bold text-text-muted uppercase">WPM</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Target size={14} className="text-secondary" />
                            <span className="text-xl font-black text-secondary">{currentAccuracy}%</span>
                            <span className="text-[9px] font-bold text-text-muted uppercase">ACC</span>
                        </div>
                    </div>
                </div>

                {/* Timer */}
                <motion.div
                    className={`card p-4 mb-6 flex items-center justify-center gap-4 ${timeLeft <= 10 && isStarted ? 'border-red-500/30 bg-red-500/5' : ''}`}
                    animate={timeLeft <= 10 && isStarted ? { scale: [1, 1.01, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1 }}
                >
                    <Clock size={20} className={timeLeft <= 10 && isStarted ? 'text-red-500' : 'text-primary'} />
                    <span className={`text-4xl font-heading font-black tabular-nums ${timeLeft <= 10 && isStarted ? 'text-red-500' : 'text-text-main'}`}>
                        {formatTime(timeLeft)}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">remaining</span>
                </motion.div>

                {/* Text Display */}
                <div className="card p-6 sm:p-10 overflow-hidden mb-6">
                    {/* Progress Bar */}
                    <div className="w-full h-1 bg-white/5 rounded-full mb-8">
                        <motion.div
                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                            animate={{ width: `${progress}%` }}
                            transition={{ type: 'spring', stiffness: 100 }}
                        />
                    </div>

                    <div className="max-h-[200px] overflow-hidden leading-loose select-none flex flex-wrap gap-x-0.5 gap-y-2">
                        {testText.split('').map((char, index) => {
                            const isTyped = index < userInput.length
                            const isCurrent = index === userInput.length
                            const isCorrect = isTyped && userInput[index] === char
                            const isError = isTyped && !isCorrect

                            return (
                                <span
                                    key={index}
                                    className={`inline-block font-mono text-lg sm:text-xl transition-all relative ${isError ? 'text-red-500 bg-red-500/10 rounded' :
                                        isCorrect ? 'text-primary' :
                                            isCurrent ? 'text-text-main font-black' :
                                                'text-text-muted opacity-40'
                                        }`}
                                >
                                    {char === ' ' ? '\u00A0' : char}
                                    {isCurrent && (
                                        <motion.div
                                            layoutId="cert-cursor"
                                            className="absolute -bottom-1 left-0 w-full h-1 bg-primary rounded-full"
                                            animate={{ opacity: [1, 0.3, 1] }}
                                            transition={{ repeat: Infinity, duration: 1 }}
                                        />
                                    )}
                                </span>
                            )
                        })}
                    </div>

                    {/* Hidden Input */}
                    <div className="relative mt-6">
                        <input
                            ref={inputRef}
                            type="text"
                            value={userInput}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-default"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                        />
                        <div className={`w-full p-3 text-center rounded-xl border-2 transition-all duration-300 ${isStarted ? 'bg-primary/5 border-primary/30 shadow-inner' : 'bg-surface-2 border-border'
                            }`}>
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isStarted ? 'text-primary' : 'text-text-muted opacity-50 animate-pulse'}`}>
                                {isStarted ? `${selectedDuration.label} Certification Test in Progress...` : 'Type to begin your certification test'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ─── Result / Certificate Screen ───
    if (phase === 'result' && metrics) {
        const passed = metrics.accuracy >= 90 && metrics.netWPM >= 20
        const testDate = new Date()

        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                <AnimatePresence>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        {/* Results Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                            {[
                                { label: 'Net WPM', value: metrics.netWPM, unit: '', color: 'text-primary' },
                                { label: 'Accuracy', value: metrics.accuracy, unit: '%', color: 'text-secondary' },
                                { label: 'Characters', value: metrics.charsTyped, unit: '', color: 'text-accent' },
                                { label: 'Duration', value: selectedDuration.label, unit: '', color: 'text-text-main' },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="card p-4 text-center"
                                >
                                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted block mb-1">{stat.label}</span>
                                    <span className={`text-2xl font-black ${stat.color}`}>
                                        {stat.value}{stat.unit}
                                    </span>
                                </motion.div>
                            ))}
                        </div>

                        {passed ? (
                            <>
                                {/* Certificate */}
                                <div
                                    ref={certificateRef}
                                    className="relative overflow-hidden rounded-3xl p-1"
                                    style={{ background: `linear-gradient(135deg, ${tier.color}40, ${tier.color}10, ${tier.color}40)` }}
                                >
                                    <div className="bg-bg-main dark:bg-slate-900 rounded-[1.3rem] p-10 sm:p-16 text-center relative overflow-hidden">
                                        {/* Decorative corners */}
                                        <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 rounded-tl-lg opacity-20" style={{ borderColor: tier.color }} />
                                        <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 rounded-tr-lg opacity-20" style={{ borderColor: tier.color }} />
                                        <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 rounded-bl-lg opacity-20" style={{ borderColor: tier.color }} />
                                        <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 rounded-br-lg opacity-20" style={{ borderColor: tier.color }} />

                                        {/* Logo / Brand */}
                                        <div className="flex items-center justify-center gap-2 mb-8">
                                            <Shield size={16} className="text-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted">TouchFlow Pro</span>
                                        </div>

                                        {/* Title */}
                                        <h1 className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted mb-2">Certificate of Typing Proficiency</h1>
                                        <div className="w-24 h-0.5 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent mb-8" />

                                        {/* Tier Badge */}
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', delay: 0.3 }}
                                            className="mb-8"
                                        >
                                            <span className="text-6xl block mb-3">{tier.icon}</span>
                                            <span className={`text-3xl font-heading font-black bg-gradient-to-r ${tier.gradient} bg-clip-text text-transparent`}>
                                                {tier.name} Tier
                                            </span>
                                        </motion.div>

                                        {/* Recipient */}
                                        <p className="text-text-muted text-sm mb-2">This certifies that</p>
                                        <h2 className="text-4xl sm:text-5xl font-heading font-black text-text-main mb-6 tracking-tight">
                                            {userName || 'Typist'}
                                        </h2>

                                        {/* Stats */}
                                        <p className="text-text-muted text-sm leading-relaxed max-w-lg mx-auto mb-8">
                                            has demonstrated typing proficiency at{' '}
                                            <span className={`font-black ${tier.text}`}>{metrics.netWPM} WPM</span>{' '}
                                            with{' '}
                                            <span className={`font-black ${tier.text}`}>{metrics.accuracy}% accuracy</span>{' '}
                                            on a {selectedDuration.label.toLowerCase()} certification test.
                                        </p>

                                        {/* Date & ID */}
                                        <div className="flex items-center justify-center gap-8 text-[10px] text-text-muted">
                                            <div>
                                                <span className="font-black uppercase tracking-widest block mb-1">Date Issued</span>
                                                <span className="font-medium">{formatDate(testDate)}</span>
                                            </div>
                                            <div className="w-px h-8 bg-border" />
                                            <div>
                                                <span className="font-black uppercase tracking-widest block mb-1">Certificate ID</span>
                                                <span className="font-mono font-medium">{`TFP-${Date.now().toString(36).toUpperCase()}`}</span>
                                            </div>
                                        </div>

                                        {/* Signature Line */}
                                        <div className="mt-12 pt-8 border-t border-border/30 max-w-xs mx-auto">
                                            <div className="font-heading text-2xl font-black text-text-muted/30 italic mb-1">TouchFlow Pro</div>
                                            <div className="w-full h-px bg-text-muted/20 mb-2" />
                                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-text-muted">Certification Authority</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                                    <button
                                        onClick={printCertificate}
                                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        <Download size={14} />
                                        Download / Print Certificate
                                    </button>
                                    <button
                                        onClick={resetToSelection}
                                        className="flex items-center gap-2 px-8 py-3 rounded-xl border border-border text-text-muted font-black text-[10px] uppercase tracking-[0.2em] hover:bg-surface-2 transition-all"
                                    >
                                        <RotateCcw size={14} />
                                        Take Another Test
                                    </button>
                                </div>
                            </>
                        ) : (
                            /* Failed to qualify */
                            <div className="card p-12 text-center">
                                <span className="text-5xl block mb-6">📋</span>
                                <h2 className="text-2xl font-heading font-black text-text-main mb-3">Keep Practicing!</h2>
                                <p className="text-text-muted max-w-md mx-auto mb-8">
                                    You need at least <strong className="text-primary">20 WPM</strong> with <strong className="text-primary">90% accuracy</strong> to earn a certificate.
                                    Your result: {metrics.netWPM} WPM / {metrics.accuracy}% accuracy.
                                </p>
                                <button
                                    onClick={resetToSelection}
                                    className="flex items-center gap-2 mx-auto px-8 py-3 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                                >
                                    <RotateCcw size={14} />
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
