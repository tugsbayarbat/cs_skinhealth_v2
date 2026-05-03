import React from 'react';
import Link from 'next/link';

export default function RegisteredPage() {
    return (
        <div className="login-page">
            <div className="login-brand" style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
                <div className="login-brand-inner" style={{ maxWidth: '600px', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '3rem', borderRadius: '24px', backdropFilter: 'blur(10px)' }}>
                    <div className="login-logo" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
                        <svg width="48" height="48" viewBox="0 0 36 36" fill="none">
                            <rect width="36" height="36" rx="12" fill="white" fillOpacity="0.2" />
                            <path d="M18 8C12.477 8 8 12.477 8 18s4.477 10 10 10 10-4.477 10-10S23.523 8 18 8zm-1.5 14L12 17.5l1.41-1.41L16.5 19.17l5.59-5.59L23.5 15l-7 7z" fill="white" />
                        </svg>
                    </div>
                    <h1 className="login-brand-title" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Registered Successfully</h1>
                    <p className="login-brand-sub" style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '2rem', opacity: 0.9 }}>
                        Thank you for requesting to use our demo system.
                    </p>
                    <p className="login-brand-sub" style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '3rem', opacity: 0.8 }}>
                        We only allow approved users to access the system due to prototype environment resource limits. An administrator will review your request shortly. You will be able to log in once your account is approved.
                    </p>
                    <Link href="/login" style={{ display: 'inline-block', backgroundColor: 'white', color: '#6B35D9', padding: '12px 32px', borderRadius: '12px', fontWeight: 'bold', textDecoration: 'none', transition: 'all 0.2s' }}>
                        Return to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
