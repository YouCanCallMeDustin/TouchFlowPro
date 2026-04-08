import { ArrowLeft } from 'lucide-react'

import { Helmet } from 'react-helmet-async'

interface TermsOfServiceProps {
    onBack: () => void
}

export default function TermsOfService({ onBack }: TermsOfServiceProps) {
    return (
        <div className="max-w-3xl mx-auto w-full">
            <Helmet>
                <title>Terms of Service | TouchFlow Pro</title>
                <meta name="description" content="View the TouchFlow Pro terms of service. Understand the rules and guidelines governing our typing practice platform." />
                <link rel="canonical" href="https://touchflowpro.com/terms" />
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
                    Terms of Service
                </h1>
                <p className="text-text-muted text-sm mb-8">Last updated: April 8, 2026</p>

                <div className="space-y-8 text-text-main text-sm leading-relaxed">
                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using TouchFlow Pro ("the Service"), you agree to be bound by these Terms of Service ("Terms").
                            TouchFlow Pro is a professional-grade performance engine for specialized industries. If you do not agree to these Terms, 
                            you may not use the Service. We reserve the right to update these Terms at any time for legal or operational compliance.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">2. Description of Service & Licensing</h2>
                        <p className="mb-3">TouchFlow Pro provides high-fidelity performance calibration for technical typing. Licenses are granted under two tiers:</p>
                        <ul className="list-disc list-inside space-y-2 text-text-muted">
                            <li><strong className="text-text-main">Specialist License:</strong> Granted to individuals for personal skill development and career advancement.</li>
                            <li><strong className="text-text-main">Enterprise/Organization License:</strong> Granted to legal, medical, or technical entities for workforce training and performance auditing.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">3. Management & Security</h2>
                        <ul className="list-disc list-inside space-y-2 text-text-muted">
                            <li>Account holders are responsible for the integrity of their biokinetic data profiles.</li>
                            <li><strong className="text-text-main">Organization Admins:</strong> For team licenses, administrators are responsible for the accurate assignment of "Seats" and the authorized oversight of team performance metrics.</li>
                            <li>Attempting to manipulate performance data via automated scripts or "bots" is a violation of these terms and results in immediate account deactivation.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">4. Subscription & Commercial Terms</h2>
                        <p className="mb-3">Commercial transactions are processed via Stripe's encrypted gateway.</p>
                        <ul className="list-disc list-inside space-y-2 text-text-muted">
                            <li>Subscriptions renew automatically unless cancelled via the Dashboard.</li>
                            <li>Organization bulk licenses are governed by the specific seat-count agreed upon at the time of procurement.</li>
                            <li>Pricing is subject to change with 30 days' advance notice for enterprise accounts.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">5. Proprietary Rights & Algorithms</h2>
                        <p>
                            All systems, biokinetic detection algorithms, burst-to-drift analysis models, and specialized curriculums are the 
                            exclusive intellectual property of TouchFlow Pro. Use of the Service does not grant ownership of the underlying 
                            performance-tracking technology or specialized data models.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">6. Professional Disclaimers (Medical & Legal)</h2>
                        <p className="text-primary/80 font-bold mb-3 italic">IMPORTANT REGULATORY NOTICE:</p>
                        <p className="mb-3">
                            TouchFlow Pro's Medical and Legal tracks are high-fidelity **simulations** designed for skill acquisition. 
                            The Service is NOT a primary data-entry software for clinical environments or courtrooms. 
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-text-muted">
                            <li>We make no guarantee of performance in real-world high-stakes environments.</li>
                            <li>Users are responsible for their own real-word data integrity.</li>
                            <li>TouchFlow Pro is not liable for data errors made by the user in external production environments following training.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">7. Limitation of Liability</h2>
                        <p>
                            To the fullest extent permitted by law, TouchFlow Pro and its parents, Dustin Shoemake, and affiliates shall not be liable for any indirect, incidental, 
                            special, or consequential damages resulting from the use of the Service. Performance metrics are provided for training 
                            guidance and do not constitute a professional service guarantee.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">8. Governing Law</h2>
                        <p>
                            These Terms are governed by the laws of the State of Washington, USA. Disputes shall be resolved exclusively 
                            within the jurisdiction of Spokane County, Washington.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">9. Contact</h2>
                        <p>
                            For legal inquiries or enterprise licensing agreements, contact{' '}
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
