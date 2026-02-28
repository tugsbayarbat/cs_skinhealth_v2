'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function ProfileModal({ onComplete }) {
    const { update } = useSession();
    const [name, setName] = useState('');
    const [gender, setGender] = useState('');
    const [birthYear, setBirthYear] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, gender, birth_year: Number(birthYear) }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save profile.');

            // Refresh the JWT session so profileComplete becomes true
            await update({ name, gender, birth_year: Number(birthYear), profileComplete: true });
            onComplete?.();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="profile-modal-overlay">
            <div className="profile-modal-card">
                {/* Header */}
                <div className="profile-modal-header">
                    <div className="profile-modal-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="1.8"
                            strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <h2 className="profile-modal-title">Complete your profile</h2>
                    <p className="profile-modal-sub">
                        Help us personalise your experience. This takes just a second.
                    </p>
                </div>

                {/* Form */}
                <form className="profile-modal-form" onSubmit={handleSubmit}>
                    {/* Name */}
                    <div className="profile-field">
                        <label htmlFor="pm-name">Full name</label>
                        <input
                            id="pm-name"
                            type="text"
                            className="profile-input"
                            placeholder="e.g. Alex Johnson"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    {/* Gender + Age row */}
                    <div className="profile-row">
                        <div className="profile-field">
                            <label htmlFor="pm-gender">Gender</label>
                            <select
                                id="pm-gender"
                                className="profile-input profile-select"
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                required
                            >
                                <option value="" disabled>Select…</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </div>

                        <div className="profile-field">
                            <label htmlFor="pm-birth-year">Birth year</label>
                            <input
                                id="pm-birth-year"
                                type="number"
                                className="profile-input"
                                placeholder={`e.g. ${new Date().getFullYear() - 25}`}
                                min={1900}
                                max={new Date().getFullYear()}
                                value={birthYear}
                                onChange={(e) => setBirthYear(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && <p className="profile-error">{error}</p>}

                    <button
                        type="submit"
                        className="profile-submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Saving…' : 'Save & continue →'}
                    </button>
                </form>
            </div>
        </div>
    );
}
