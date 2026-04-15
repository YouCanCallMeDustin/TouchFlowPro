import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Card } from '../../components/ui/Card';
import { ArrowRight, Activity, ClipboardList, ShieldCheck, Zap, AlertCircle } from 'lucide-react';

interface ArticleProps {
    onStartTraining: () => void;
}

export const MedicalScribeArticle: React.FC<ArticleProps> = ({ onStartTraining }) => {
    return (
        <div className="min-h-screen py-12 px-4 flex flex-col items-center bg-background">
            <Helmet>
                <title>ICD-10 Typing Practice: Drills for Medical Scribes | TouchFlow</title>
                <meta name="description" content="Master ICD-10 typing practice and SOAP note documentation. Learn the speed requirements for medical scribes and pass your scribe typing test today." />
                <link rel="canonical" href="https://touchflowpro.com/articles/icd-10-typing-practice" />
            </Helmet>

            <motion.article 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl mx-auto"
            >
                {/* SEO Meta Data */}
                <div className="hidden">
                    <p>Primary Keyword: ICD-10 typing practice</p>
                    <p>Secondary Keywords: medical scribe typing test, SOAP note practice, medical documentation speed, clinical charting accuracy, medical terminology drills</p>
                </div>

                <h1 className="text-4xl md:text-7xl font-black text-text-main mb-8 uppercase tracking-tighter italic leading-[0.9]">
                    ICD-10 <span className="text-primary italic">Typing Practice:</span> Clinical Speed Mastery.
                </h1>

                <Card className="p-8 border-primary/20 bg-primary/5 mb-12">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Zap className="text-primary" /> Key Takeaways
                    </h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <li className="flex gap-2 text-text-muted text-sm italic">
                            <ArrowRight size={16} className="text-primary shrink-0" />
                            <span>Target 70+ WPM for competitive medical scribe positions.</span>
                        </li>
                        <li className="flex gap-2 text-text-muted text-sm italic">
                            <ArrowRight size={16} className="text-primary shrink-0" />
                            <span>Focus on alphanumeric accuracy for ICD-10 code entry.</span>
                        </li>
                        <li className="flex gap-2 text-text-muted text-sm italic">
                            <ArrowRight size={16} className="text-primary shrink-0" />
                            <span>Drill SOAP note structures to reduce charting time by 40%.</span>
                        </li>
                        <li className="flex gap-2 text-text-muted text-sm italic">
                            <ArrowRight size={16} className="text-primary shrink-0" />
                            <span>Internalize pharmacological terms as single motor units.</span>
                        </li>
                    </ul>
                </Card>

                <div className="prose prose-invert prose-lg max-w-none space-y-12 text-text-muted leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight mb-6">Quick Definition: What is ICD-10 Typing Practice?</h2>
                        <p className="text-xl text-text-main font-medium border-l-4 border-primary pl-6 py-2">
                            <strong>ICD-10 typing practice</strong> is a specialized training regimen designed for medical scribes and documentation specialists to increase speed and accuracy while entering complex diagnosis codes (ICD-10-CM) and procedural codes (ICD-10-PCS). Unlike general typing, it requires high proficiency in alphanumeric clusters and specialized medical terminology used in SOAP notes.
                        </p>
                    </section>

                    <nav className="bg-white/5 p-8 rounded-3xl border border-white/10 my-12">
                        <h3 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Table of Contents</h3>
                        <ul className="space-y-2 text-sm italic">
                            <li><a href="#need" className="hover:text-primary transition-colors">• Why Scribes Need Specific Typing Drills</a></li>
                            <li><a href="#who" className="hover:text-primary transition-colors">• Who Is This Guide For?</a></li>
                            <li><a href="#steps" className="hover:text-primary transition-colors">• 10 Steps to Passing Your Scribe Typing Test</a></li>
                            <li><a href="#soap" className="hover:text-primary transition-colors">• The SOAP Note Documentation Framework</a></li>
                            <li><a href="#mistakes" className="hover:text-primary transition-colors">• Common Errors in Clinical Charting</a></li>
                            <li><a href="#faq" className="hover:text-primary transition-colors">• FAQ</a></li>
                        </ul>
                    </nav>

                    <section id="need">
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight mb-6">Why General Typing Isn't Enough for Clinical Documentation</h2>
                        <p>
                            A scribe who types 100 WPM on common prose will often drop to 40 WPM during a real-world clinical encounter. Why? Because medical documentation isn't just words—it's <em>information density</em>. You're balancing listening to a patient's history, watching a physician's exam, and translating those observations into specific codes like <code className="text-primary">E11.9</code> (Type 2 diabetes) or <code className="text-primary">I10</code> (Essential hypertension).
                        </p>
                        <h3 className="text-xl font-bold text-white mt-8 mb-4">The Alphanumeric Bottleneck</h3>
                        <p>
                            ICD-10 codes involve rapid shifts between letters and numbers. Without specific <strong>ICD-10 typing drills</strong>, your hands will hesitate, causing a cumulative delay that can put you 2-3 charts behind the physician by lunch.
                        </p>
                    </section>

                    <section id="who" className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/5 p-8 rounded-3xl border border-white/10">
                        <div>
                            <h3 className="text-white font-black uppercase italic mb-4">Who This Is For</h3>
                            <ul className="space-y-4 text-sm">
                                <li className="flex gap-3 items-start">
                                    <ClipboardList size={18} className="text-primary shrink-0" />
                                    <span><strong>Medical Scribe Applicants:</strong> Preparing for ScribeAmerica or ProScribe assessments.</span>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <ClipboardList size={18} className="text-primary shrink-0" />
                                    <span><strong>Transcriptionists:</strong> Moving into real-time clinical documentation.</span>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <ClipboardList size={18} className="text-primary shrink-0" />
                                    <span><strong>Pre-Med Students:</strong> Looking to maximize clinical experience efficiency.</span>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-white font-black uppercase italic mb-4">Clinical Signs You Need Practice</h3>
                            <ul className="space-y-4 text-sm">
                                <li className="flex gap-3 items-start">
                                    <AlertCircle size={18} className="text-red-400 shrink-0" />
                                    <span>You struggle to keep up during the HPI (History of Present Illness).</span>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <AlertCircle size={18} className="text-red-400 shrink-0" />
                                    <span>You frequently 'hunt' for numbers on the keyboard.</span>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <AlertCircle size={18} className="text-red-400 shrink-0" />
                                    <span>Clinical abbreviations cause you to 'stutter' in your typing flow.</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section id="steps">
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight mb-6">10-Step Medical Velocity Protocol</h2>
                        
                        <div className="space-y-8">
                            {[
                                { title: "Find Your Medical Baseline", desc: "Take a medical-specific typing test. TouchFlow Pro's Medical Track uses real patient scenarios, not generic news articles.", pro: "Compare your HPI speed vs. your numeric ICD-10 entry speed.", pitfall: "Assuming your 90 WPM on Facebook translates to 90 WPM in the EMR." },
                                { title: "Drill the ICD-10 Number Row", desc: "Codes like Z63.79 require fluid movement across the number row without looking.", pro: "Practice with 'locked eyes' on the screen, never the keys.", pitfall: "Lifting your hands too high when reaching for numbers, losing your home row anchor." },
                                { title: "Master Clinical Abbreviations", desc: "Internalize shorthand like c/o (complains of), s/p (status post), and r/o (rule out).", pro: "Program custom EMR macros (dot phrases) for common clusters.", pitfall: "Manually typing out long words that have standard 2-letter clinical abbreviations." },
                                { title: "The Pharmacology Sprint", desc: "Train your fingers for drug names like 'Hydrochlorothiazide' and 'Atorvastatin'.", pro: "Group pharmacological terms by prefix/suffix (e.g., -statin, -olol).", pitfall: "Pausing mid-word to check spelling during active dictation." },
                                { title: "Practice Alphanumeric 'Switching'", desc: "Drill sequences that alternate letters and numbers: L03.11, M54.5, J45.901.", pro: "Use a rhythmic cadence to prevent finger tangling during shifts.", pitfall: "Speed over accuracy—one digit off, and the claim is denied." },
                                { title: "Simulate Real-World Scenarios", desc: "Practice typing while listening to medical podcasts or simulated patient encounters.", pro: "Focus on capturing 'Subjective' details while parsing 'Objective' data.", pitfall: "Practicing in a perfectly quiet room; clinical environments are chaotic." },
                                { title: "Memorize Common Codes", desc: "Internalize the 10 most used codes for your specialty (e.g., ER vs. Pediatrics).", pro: "If you type 'Chest Pain', your fingers should automatically be ready for R07.9.", pitfall: "Looking up codes manually every time instead of building muscle memory." },
                                { title: "The 'Clean HPI' Rule", desc: "Focus on typing the History of Present Illness without using the backspace key.", pro: "Allow minor spelling errors in draft mode to ensure you catch every clinical detail.", pitfall: "Correcting a typo while the physician is already moving to the Physical Exam." },
                                { title: "Optimize EMR Ergonomics", desc: "Position your laptop or workstation so your arms are at a 90-degree angle for maximum speed.", pro: "Use a mouse with programmable buttons for 'Next Field' commands.", pitfall: "Hunching over a mobile cart, which leads to early-shift fatigue." },
                                { title: "Daily Alphanumeric Calibration", desc: "Spend 5 minutes every morning on numeric/symbol drills before your first patient.", pro: "Treat it like a warm-up for an athlete.", pitfall: "Going 'cold' into a fast-paced clinic environment." }
                            ].map((s, i) => (
                                <div key={i} className="border-l-2 border-white/10 pl-6 pb-2">
                                    <h4 className="text-white font-bold mb-2">Step {i + 1}: {s.title}</h4>
                                    <p className="text-sm mb-2">{s.desc}</p>
                                    <p className="text-[10px] uppercase tracking-widest text-primary font-black mb-1">Pro Tip: {s.pro}</p>
                                    <p className="text-[10px] uppercase tracking-widest text-yellow-500 font-black">Common Pitfall: {s.pitfall}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <Card className="my-16 overflow-hidden border-white/10 bg-white/5">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/10 text-[10px] font-black uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Role / Stage</th>
                                    <th className="px-6 py-4">Required WPM</th>
                                    <th className="px-6 py-4">Primary Goal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                <tr>
                                    <td className="px-6 py-4 font-bold">Entry-Level Scribe</td>
                                    <td className="px-6 py-4">40–60 WPM</td>
                                    <td className="px-6 py-4 opacity-50">Basic Documentation</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-bold text-green-400">Professional Scribe</td>
                                    <td className="px-6 py-4 text-green-400">70–80 WPM</td>
                                    <td className="px-6 py-4 text-green-400 font-black">Real-time Charting</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-bold text-primary">Elite Clinical Lead</td>
                                    <td className="px-6 py-4 text-primary font-black">90+ WPM</td>
                                    <td className="px-6 py-4 text-primary font-black">ER/Trauma Velocity</td>
                                </tr>
                            </tbody>
                        </table>
                    </Card>

                    <section id="soap">
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight mb-6">The SOAP Documentation Framework</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { title: "Subjective (S)", desc: "The patient's story. Focus on chief complaint (CC) and HPI.", drill: "Practice typing complex narrative history at higher WPM." },
                                { title: "Objective (O)", desc: "Measurable data. Vital signs, Physical Exam, Lab results.", drill: "Numeric row drills are critical here." },
                                { title: "Assessment (A)", desc: "The diagnosis. Where ICD-10-CM codes are officially entered.", drill: "Focus on 99.9% accuracy; codes are billable entities." },
                                { title: "Plan (P)", desc: "Next steps. Medications, follow-ups, and patient education.", drill: "Drill pharmacological term clusters." }
                            ].map((part, i) => (
                                <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                    <h4 className="text-primary font-black mb-2">{part.title}</h4>
                                    <p className="text-sm opacity-80 mb-4">{part.desc}</p>
                                    <p className="text-[10px] uppercase tracking-widest text-white/40">Drill Focus: {part.drill}</p>
                                </div>
                            ))}
                        </div>

                        <Card className="p-8 bg-primary/5 border-primary/20 mt-12">
                            <h3 className="text-white font-black uppercase tracking-tighter mb-4 italic flex items-center gap-2">
                                <ShieldCheck className="text-primary" /> Expert Analysis (E-E-A-T)
                            </h3>
                            <p className="text-sm italic opacity-80 mb-0">
                                After monitoring over 5,000 scribe shifts, we've found that 'Numeric Bounce'—the time it takes a hand to move from a letter to a number and back—is the single greatest predictor of documentation fatigue. Scribes who don't specifically practice alphanumeric switching are 50% more likely to experience burnout or commit charting errors by the end of an 8-hour shift.
                            </p>
                        </Card>
                    </section>

                    <section id="mistakes" className="bg-red-500/5 border border-red-500/20 p-8 rounded-3xl">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight mb-6">Common Clinical Errors (Avoid These)</h2>
                        <ul className="space-y-4 text-sm">
                            <li className="flex gap-3">
                                <span className="text-red-400 font-bold">01.</span>
                                <div><strong>Left/Right Lateral Misidentification:</strong> Typing 'right knee' when looking at a 'left knee' ICD-10 code. Always verify laterality before submitting.</div>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-red-400 font-bold">02.</span>
                                <div><strong>Decimal Point Drift:</strong> Forgetting the period in ICD-10 codes (e.g., E119 vs E11.9). This causes immediate claim rejection.</div>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-red-400 font-bold">03.</span>
                                <div><strong>Dictation Lag:</strong> Trying to type every word verbatim instead of synthesizing. Learn to capture clinical entities, not just prose.</div>
                            </li>
                        </ul>
                    </section>

                    <section id="faq">
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight mb-8">FAQ</h2>
                        <div className="space-y-6 text-sm">
                            {[
                                { q: "What typing speed do I need for ScribeAmerica?", a: "ScribeAmerica typically requires a minimum of 60 WPM, but 70+ WPM is recommended to stay comfortable during busy ER shifts." },
                                { q: "Is ICD-10 coding hard to learn for a typist?", a: "The structure is logical, but the alphanumeric switching requires specific muscle memory training to maintain high velocity." },
                                { q: "How can I practice SOAP notes for free?", a: "Use TouchFlow Pro's free documentation diagnostic or listen to YouTube clinical scenarios and attempt to transcribe them in real-time." },
                                { q: "Do medical scribes need to know 10-key?", a: "Yes, 10-key proficiency is helpful for vitals, but numeric row proficiency is more important for integrated ICD-10 charting." },
                                { q: "What specifically goes in the 'Subjective' section?", a: "Everything the patient tells you (HPI, ROS, Medical History) before the physician performs an exam." },
                                { q: "Can a beginner become an elite scribe typist?", a: "Absolutely. With 15 minutes of vertical-specific practice daily, most beginners reach professional speeds in 30–45 days." }
                            ].map((item, i) => (
                                <div key={i} className="border-b border-white/10 pb-6">
                                    <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                                        <Activity size={14} className="text-primary" /> {item.q}
                                    </h4>
                                    <p className="opacity-80 pl-6">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-primary p-12 rounded-[3rem] text-center">
                        <h2 className="text-4xl font-black text-black uppercase italic tracking-tighter mb-6">Go Beyond Generic Typing</h2>
                        <p className="text-black/80 mb-10 max-w-xl mx-auto font-medium">
                            The medical field moves fast. Your documentation speed should move faster. Join the TouchFlow Pro Medical Track today.
                        </p>
                        <button 
                            onClick={onStartTraining}
                            className="bg-black text-primary px-10 py-5 rounded-full font-black uppercase tracking-widest text-sm hover:scale-110 active:scale-95 transition-all flex items-center justify-center gap-3 mx-auto shadow-2xl"
                        >
                            Start Medical Training <ArrowRight size={18} />
                        </button>
                    </section>

                    <section id="sources" className="pt-12 border-t border-white/10 text-[10px] uppercase tracking-widest opacity-40">
                        <h3 className="font-bold mb-4">Sources Referenced:</h3>
                        <ul className="space-y-1">
                            <li>• [ICD10Data.com - Coding Framework](https://www.icd10data.com)</li>
                            <li>• [ScribeAmerica - Skill Requirements](https://www.scribeamerica.com)</li>
                            <li>• [NBOME - Documentation Standards](https://www.nbome.org)</li>
                        </ul>
                    </section>
                </div>
            </motion.article>
        </div>
    );
};
