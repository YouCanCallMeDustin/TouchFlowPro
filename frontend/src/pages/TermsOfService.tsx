import { ArrowLeft } from 'lucide-react'

interface TermsOfServiceProps {
    onBack: () => void
}

export default function TermsOfService({ onBack }: TermsOfServiceProps) {
    return (
        <div className="max-w-3xl mx-auto w-full">
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
                <p className="text-text-muted text-sm mb-8">Last updated: February 10, 2026</p>

                <div className="space-y-8 text-text-main text-sm leading-relaxed">
                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using TouchFlow Pro ("the Service"), you agree to be bound by these Terms of Service ("Terms").
                            If you do not agree to these Terms, you may not use the Service. We reserve the right to update these Terms at
                            any time, and your continued use of the Service constitutes acceptance of any changes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">2. Description of Service</h2>
                        <p>
                            TouchFlow Pro is a web-based typing proficiency platform that provides typing lessons, drills, analytics,
                            adaptive practice, Bible verse typing, code typing practice, achievement tracking, leaderboards, and related
                            features. The Service may include both free and premium (subscription-based) features.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">3. User Accounts</h2>
                        <ul className="list-disc list-inside space-y-2 text-text-muted">
                            <li>You must provide accurate and complete information when creating an account.</li>
                            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                            <li>You are responsible for all activities that occur under your account.</li>
                            <li>You must notify us immediately of any unauthorized use of your account.</li>
                            <li>You must be at least 13 years of age to use the Service.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">4. Subscription & Payments</h2>
                        <ul className="list-disc list-inside space-y-2 text-text-muted">
                            <li>Premium features require a paid subscription, processed through Stripe.</li>
                            <li>Subscription fees are billed on a recurring basis (monthly or annually) as selected at checkout.</li>
                            <li>You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period.</li>
                            <li>Refunds are handled on a case-by-case basis. Contact us within 7 days of a charge to request a refund.</li>
                            <li>We reserve the right to change pricing with 30 days' notice to existing subscribers.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">5. Acceptable Use</h2>
                        <p className="mb-3">You agree not to:</p>
                        <ul className="list-disc list-inside space-y-2 text-text-muted">
                            <li>Use the Service for any unlawful purpose or in violation of any applicable laws.</li>
                            <li>Attempt to gain unauthorized access to any portion of the Service or its systems.</li>
                            <li>Use automated scripts, bots, or other tools to interact with the Service.</li>
                            <li>Upload or transmit viruses, malware, or other harmful code.</li>
                            <li>Manipulate leaderboard rankings, achievements, or other competitive features through dishonest means.</li>
                            <li>Interfere with or disrupt the integrity or performance of the Service.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">6. Intellectual Property</h2>
                        <p>
                            All content, design, code, and materials within the Service are the property of TouchFlow Pro and are
                            protected by copyright and intellectual property laws. You may not copy, modify, distribute, or create
                            derivative works from any part of the Service without prior written consent. Bible text content is provided
                            via licensed API access and is subject to the respective publisher's terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">7. User Content</h2>
                        <p>
                            You retain ownership of any custom drills or content you create within the Service. By submitting content,
                            you grant TouchFlow Pro a non-exclusive, worldwide, royalty-free license to use, store, and display your
                            content solely for the purpose of providing the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">8. Disclaimers</h2>
                        <p>
                            The Service is provided "as is" and "as available" without warranties of any kind, either express or implied.
                            We do not guarantee that the Service will be uninterrupted, secure, or error-free. We make no warranties
                            regarding the accuracy or reliability of any results obtained through the Service, including typing speed
                            or accuracy measurements.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">9. Limitation of Liability</h2>
                        <p>
                            To the fullest extent permitted by law, TouchFlow Pro shall not be liable for any indirect, incidental,
                            special, consequential, or punitive damages, or any loss of data, profits, or goodwill, arising from your
                            use of or inability to use the Service. Our total liability shall not exceed the amount you paid to us in
                            the 12 months preceding the claim.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">10. Termination</h2>
                        <p>
                            We may suspend or terminate your account at any time for violations of these Terms or for any other reason
                            at our sole discretion. Upon termination, your right to use the Service will immediately cease. You may
                            request deletion of your account and associated data by contacting us.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">11. Governing Law</h2>
                        <p>
                            These Terms shall be governed by and construed in accordance with the laws of the State of Washington,
                            United States, without regard to conflict of law principles. Any disputes arising from these Terms shall
                            be resolved in the courts of Spokane County, Washington.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">12. Contact</h2>
                        <p>
                            If you have questions about these Terms, please contact us at{' '}
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
