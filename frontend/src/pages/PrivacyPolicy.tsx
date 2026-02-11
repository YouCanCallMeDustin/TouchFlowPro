import { ArrowLeft } from 'lucide-react'

interface PrivacyPolicyProps {
    onBack: () => void
}

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
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
                    Privacy Policy
                </h1>
                <p className="text-text-muted text-sm mb-8">Last updated: February 10, 2026</p>

                <div className="space-y-8 text-text-main text-sm leading-relaxed">
                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">1. Introduction</h2>
                        <p>
                            TouchFlow Pro ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains
                            how we collect, use, disclose, and safeguard your information when you use our typing proficiency platform
                            ("the Service"). By using the Service, you consent to the data practices described in this policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">2. Information We Collect</h2>

                        <h3 className="text-sm font-bold text-text-main mb-2 mt-4">2.1 Account Information</h3>
                        <ul className="list-disc list-inside space-y-2 text-text-muted">
                            <li>Email address</li>
                            <li>Password (stored as a secure hash — we never store plaintext passwords)</li>
                            <li>Display name, city, state, and age (optional profile fields)</li>
                            <li>Profile photo (if uploaded)</li>
                        </ul>

                        <h3 className="text-sm font-bold text-text-main mb-2 mt-4">2.2 Typing & Performance Data</h3>
                        <ul className="list-disc list-inside space-y-2 text-text-muted">
                            <li>Typing speed (WPM), accuracy, and error patterns</li>
                            <li>Keystroke timing data (used for adaptive learning and analytics)</li>
                            <li>Practice session history and duration</li>
                            <li>Achievement progress, streaks, and level progression</li>
                            <li>Custom drill content you create</li>
                        </ul>

                        <h3 className="text-sm font-bold text-text-main mb-2 mt-4">2.3 Payment Information</h3>
                        <ul className="list-disc list-inside space-y-2 text-text-muted">
                            <li>Payment processing is handled entirely by Stripe. We do not store your credit card numbers,
                                bank account details, or other financial information on our servers.</li>
                            <li>We store your Stripe Customer ID to manage your subscription status.</li>
                        </ul>

                        <h3 className="text-sm font-bold text-text-main mb-2 mt-4">2.4 Automatically Collected Data</h3>
                        <ul className="list-disc list-inside space-y-2 text-text-muted">
                            <li>Browser type and version</li>
                            <li>Device information</li>
                            <li>IP address (for security purposes)</li>
                            <li>Usage patterns and feature interactions</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">3. How We Use Your Information</h2>
                        <ul className="list-disc list-inside space-y-2 text-text-muted">
                            <li><strong className="text-text-main">Provide the Service:</strong> Deliver typing lessons, track progress, generate analytics, and power adaptive learning.</li>
                            <li><strong className="text-text-main">Personalization:</strong> Customize practice recommendations, difficulty levels, and content based on your performance.</li>
                            <li><strong className="text-text-main">Leaderboards:</strong> Display anonymized performance data on public leaderboards (using your display name or a default identifier).</li>
                            <li><strong className="text-text-main">Communication:</strong> Send account-related notifications, practice reminders (if enabled), and service updates.</li>
                            <li><strong className="text-text-main">Payments:</strong> Process subscription payments and manage billing through Stripe.</li>
                            <li><strong className="text-text-main">Security:</strong> Detect and prevent fraud, abuse, and unauthorized access.</li>
                            <li><strong className="text-text-main">Improvement:</strong> Analyze aggregate usage data to improve the Service, fix bugs, and develop new features.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">4. Data Sharing & Disclosure</h2>
                        <p className="mb-3">We do <strong>not</strong> sell your personal information. We may share data only in these limited circumstances:</p>
                        <ul className="list-disc list-inside space-y-2 text-text-muted">
                            <li><strong className="text-text-main">Stripe:</strong> Payment data is shared with Stripe for subscription processing.</li>
                            <li><strong className="text-text-main">ESV API:</strong> Bible practice requests are sent to the ESV API to retrieve verse text. No personal data is shared with this service.</li>
                            <li><strong className="text-text-main">Legal Requirements:</strong> We may disclose information if required by law, court order, or governmental authority.</li>
                            <li><strong className="text-text-main">Safety:</strong> We may disclose information to protect the rights, safety, or property of TouchFlow Pro, its users, or the public.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">5. Data Storage & Security</h2>
                        <ul className="list-disc list-inside space-y-2 text-text-muted">
                            <li>Your data is stored on secure servers hosted by Railway (cloud infrastructure provider).</li>
                            <li>Passwords are hashed using industry-standard algorithms (bcrypt).</li>
                            <li>Authentication is handled via JSON Web Tokens (JWT) transmitted over HTTPS.</li>
                            <li>We implement administrative, technical, and physical safeguards to protect your data.</li>
                            <li>While we strive to protect your personal information, no method of electronic storage or transmission is 100% secure.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">6. Your Rights</h2>
                        <p className="mb-3">You have the right to:</p>
                        <ul className="list-disc list-inside space-y-2 text-text-muted">
                            <li><strong className="text-text-main">Access:</strong> Request a copy of the personal data we hold about you.</li>
                            <li><strong className="text-text-main">Correction:</strong> Update or correct inaccurate information in your profile.</li>
                            <li><strong className="text-text-main">Deletion:</strong> Request deletion of your account and all associated data.</li>
                            <li><strong className="text-text-main">Export:</strong> Request your data in a portable format.</li>
                            <li><strong className="text-text-main">Opt-out:</strong> Disable practice reminders and non-essential notifications at any time.</li>
                        </ul>
                        <p className="mt-3">
                            To exercise any of these rights, contact us at{' '}
                            <a href="mailto:touchflowpro@gmail.com" className="text-primary hover:text-secondary transition-colors font-semibold">
                                touchflowpro@gmail.com
                            </a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">7. Cookies & Local Storage</h2>
                        <p>
                            We use browser local storage and cookies to maintain your authentication session, remember your theme
                            preference, and store temporary application state. We do not use third-party tracking cookies or
                            advertising trackers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">8. Children's Privacy</h2>
                        <p>
                            The Service is not intended for children under 13 years of age. We do not knowingly collect personal
                            information from children under 13. If you believe a child under 13 has provided us with personal data,
                            please contact us and we will promptly delete it.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">9. Data Retention</h2>
                        <p>
                            We retain your personal data for as long as your account is active or as needed to provide the Service.
                            Upon account deletion, we will remove your personal data within 30 days, except where retention is
                            required by law or for legitimate business purposes (e.g., fraud prevention).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">10. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of material changes by posting
                            a notice within the Service or by email. Your continued use of the Service after changes are posted
                            constitutes acceptance of the updated policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-heading font-bold text-text-main mb-3">11. Contact Us</h2>
                        <p>
                            If you have questions or concerns about this Privacy Policy or our data practices, please contact us at{' '}
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
