'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [step, setStep] = useState('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // ── Step 1: request OTP ───────────────────────────
    async function handleSendOtp(e) {
        e?.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send code.');
            setStep('otp');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // ── Step 2: verify OTP via NextAuth signIn ────────
    async function handleVerifyOtp(e) {
        e?.preventDefault();
        const code = otp.join('');
        if (code.length < 6) { setError('Please enter all 6 digits.'); return; }
        setError('');
        setLoading(true);
        try {
            const result = await signIn('credentials', {
                email,
                otp: code,
                redirect: false,
            });

            if (result?.error) {
                setError('Incorrect or expired code. Please try again.');
            } else {
                // Redirect to main app on success
                router.push('/');
                router.refresh();
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    // OTP box helpers
    function handleOtpChange(value, index) {
        if (!/^\d*$/.test(value)) return;
        const next = [...otp];
        next[index] = value.slice(-1);
        setOtp(next);
        if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
    }

    function handleOtpKeyDown(e, index) {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    }

    function handleOtpPaste(e) {
        e.preventDefault();
        const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const next = [...otp];
        digits.split('').forEach((d, i) => { next[i] = d; });
        setOtp(next);
        document.getElementById(`otp-${Math.min(digits.length, 5)}`)?.focus();
    }

    return (
        <div className="login-page">
            {/* Left — brand */}
            <div className="login-brand">
                <div className="login-brand-inner">
                    <div className="login-logo">
                        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                            <rect width="36" height="36" rx="12" fill="white" fillOpacity="0.15" />
                            <path d="M18 8C12.477 8 8 12.477 8 18s4.477 10 10 10 10-4.477 10-10S23.523 8 18 8zm0 3a7 7 0 1 1 0 14A7 7 0 0 1 18 11zm0 2a5 5 0 1 0 0 10A5 5 0 0 0 18 13z" fill="white" />
                        </svg>
                        <span className="login-logo-text">SkinHealth</span>
                    </div>
                    <h1 className="login-brand-title">AI-powered skin<br />health assistant</h1>
                    <p className="login-brand-sub">
                        Describe your symptoms, upload photos, and get intelligent care guidance — all in one place.
                    </p>
                    <div className="login-brand-pills">
                        <span className="login-pill">📸 Image analysis</span>
                        <span className="login-pill">💬 Symptom chat</span>
                        <span className="login-pill">⚡ Instant advice</span>
                    </div>
                </div>
            </div>

            {/* Right — form */}
            <div className="login-form-panel">
                <div className="login-form-card">

                    {step === 'email' ? (
                        <>
                            <div className="login-form-header">
                                <h2>Sign in</h2>
                                <p>Enter your email and we&apos;ll send you a one-time code.</p>
                            </div>

                            <form className="login-form" onSubmit={handleSendOtp}>
                                <div className="login-field">
                                    <label htmlFor="email">Email address</label>
                                    <div className="login-input-wrap">
                                        <svg className="login-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                        <input
                                            id="email"
                                            type="email"
                                            className="login-input"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {error && <p className="login-error">{error}</p>}

                                <button type="submit" className="login-submit-btn" disabled={loading}>
                                    {loading ? 'Sending…' : 'Send one-time code →'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <div className="login-form-header">
                                <h2>Check your email</h2>
                                <p>
                                    We sent a 6-digit code to<br />
                                    <strong>{email}</strong>
                                </p>
                            </div>

                            <form className="login-form" onSubmit={handleVerifyOtp}>
                                <div className="otp-boxes" onPaste={handleOtpPaste}>
                                    {otp.map((digit, i) => (
                                        <input
                                            key={i}
                                            id={`otp-${i}`}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            className="otp-box"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(e.target.value, i)}
                                            onKeyDown={(e) => handleOtpKeyDown(e, i)}
                                            autoFocus={i === 0}
                                        />
                                    ))}
                                </div>

                                {error && <p className="login-error">{error}</p>}

                                <button type="submit" className="login-submit-btn" disabled={loading}>
                                    {loading ? 'Signing in…' : 'Verify & sign in'}
                                </button>
                            </form>

                            <p className="login-register-link" style={{ marginTop: '20px' }}>
                                Wrong address?{' '}
                                <button className="otp-back-btn" onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']); setError(''); }}>
                                    Change email
                                </button>
                            </p>
                            <p className="login-register-link">
                                Didn&apos;t receive it?{' '}
                                <a href="#" onClick={(e) => { e.preventDefault(); handleSendOtp(); }}>
                                    Resend code
                                </a>
                            </p>
                        </>
                    )}

                    <div className="login-divider"><span>GROUP 7 · CS PROJECT 2</span></div>
                </div>
            </div>
        </div>
    );
}
