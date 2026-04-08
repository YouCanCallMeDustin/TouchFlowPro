import { ArrowLeft } from 'lucide-react'

import { Helmet } from 'react-helmet-async'

interface PrivacyPolicyProps {
    onBack: () => void
}

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
    return (
        <div className="max-w-3xl mx-auto w-full">
            <Helmet>
                <title>Privacy Policy | TouchFlow Pro</title>
                <meta name="description" content="Read the TouchFlow Pro privacy policy. Learn how we collect, store, and protect your typing metrics and account data." />
                <link rel="canonical" href="https://touchflowpro.com/privacy-policy" />
            </Helmet>
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-8 group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back</span>
            </button>

            <div className="card">
                <h1 className="text-3xl font-heading font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                    Privacy Policy
                </h1>
                <p className="text-text-muted text-sm mb-8">Last updated: April 8, 2026</p>

                <div className="space-y-8 text-text-main text-sm leading-relaxed">
                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">1. Introduction</h2>
                        <p>
                            TouchFlow Pro ("we," "our," or "us") is an enterprise-grade performance calibration platform. This Privacy Policy explains
                            how we collect, use, disclose, and safeguard your data when you use our high-fidelity typing proficiency system
                            ("the Service"). By using the Service, you consent to the data practices described in this policy, specifically regarding 
                            advanced biokinetic performance metrics.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">2. Information We Collect</h2>

                        <h3 className="text-sm font-bold text-text-main mb-2 mt-4">2.1 Account Information</h3>
                        <ul className="list-disc list-inside space-y-2 text-text-muted">
                            <li>Email address and authentication credentials.</li>
                            <li>Password (stored as a secure salted hash).</li>
                            <li>Organization affiliation (if applicable for team licensing).</li>
                            <li>Profile metadata (Display name, professional designation).</li>
                        </ul>

                        <h3 className="text-sm font-bold text-text-main mb-2 mt-4">2.2 Biokinetic & Performance Data</h3>
                        <p className="mb-3 text-text-muted">As a performance-focused platform, we collect high-resolution interaction data to facilitate cognitive fatigue detection and motor-skill analytics:</p>
                        <ul className="list-disc list-inside space-y-2 text-text-muted">
                            <li>Typing speed (WPM), accuracy, and detailed error taxonomy.</li>
                            <li><strong className="text-text-main">Biokinetic Rhythm Data:</strong> Sub-millisecond keystroke timing, burst-to-drift ratios, and latency variance.</li>
                            <li>Kinetic memory encoding progress and "OK Plateau" metrics.</li>
                            <li>Session history, duration, and cognitive drift indicators.</li>
                        </ul>

                        <h3 className="text-sm font-bold text-text-main mb-2 mt-4">2.3 Organizational Data</h3>
                        <ul className="list-disc list-inside space-y-2 text-text-muted">
                            <li>For Enterprise and Organization accounts, we collect team-wide performance aggregates and seat-management metadata.</li>
                        </ul>

                        <h3 className="text-sm font-bold text-text-main mb-2 mt-4">2.4 Payment Information</h3>
                        <ul className="list-disc list-inside space-y-2 text-text-muted">
                            <li>Secure payment processing is handled exclusively by Stripe. We do not store financial instruments on our local infrastructure.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">3. How We Use Your Information</h2>
                        <ul className="list-disc list-inside space-y-2 text-text-muted">
                            <li><strong className="text-text-main">Performance Calibration:</strong> Powering adaptive learning algorithms based on your specific biokinetic rhythm.</li>
                            <li><strong className="text-text-main">Cognitive Analytics:</strong> Identifying fatigue patterns to suggest optimal rest intervals.</li>
                            <li><strong className="text-text-main">Workforce Auditing:</strong> Providing organization administrators with verified performance reports for team members under their license.</li>
                            <li><strong className="text-text-main">System Integrity:</strong> Detecting and prevents automated "botting" or fraudulent performance claims.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">4. Data Sharing & Organizational Oversight</h2>
                        <p className="mb-3 text-text-muted">We do not sell your personal information. However, data visibility depends on your account type:</p>
                        <ul className="list-disc list-inside space-y-2 text-text-muted">
                            <li><strong className="text-text-main">Organization Accounts:</strong> If you are using the Service under an enterprise or organization license (e.g., provided by your employer), your performance metrics, history, and assessment results are visible to the designated Organization Administrator.</li>
                            <li><strong className="text-text-main">Public Benchmarks:</strong> Anonymized performance data may be used for global ranking and research purposes.</li>
                            <li><strong className="text-text-main">Service Providers:</strong> We use Railway for secure cloud hosting and Stripe for PCI-compliant billing.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">5. Enterprise-Grade Security</h2>
                        <ul className="list-disc list-inside space-y-2 text-text-muted">
                            <li>All data is encrypted in transit (TLS 1.2+) and at rest on Railway enterprise infrastructure.</li>
                            <li>Authentication is managed via secure signed tokens with session-hijacking protection.</li>
                            <li>Continuous security monitoring and access control audits are performed to protect organizational integrity.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">6. Your Rights & Data Portability</h2>
                        <p className="mb-3 text-text-muted">You maintain standard rights of access, correction, and deletion. For users under an Organization License, deletion requests may be subject to your organization’s data retention policies or employment agreements.</p>
                        <p>
                            To exercise these rights, please contact our compliance desk at{' '}
                            <a href="mailto:touchflowpro@gmail.com" className="text-primary hover:text-secondary transition-colors font-semibold">
                                touchflowpro@gmail.com
                            </a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">7. Contact</h2>
                        <p>
                            Compliance inquiries regarding this policy or our data sovereignty standards can be sent to{' '}
                            <a href="mailto:touchflowpro@gmail.com" className="text-primary hover:text-secondary transition-colors font-semibold">
                                touchflowpro@gmail.com
                            </a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
