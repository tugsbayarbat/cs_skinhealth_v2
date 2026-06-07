'use client';

export default function CollectionNoticeModal({ onAccept, onCancel }) {
    return (
        <div className="profile-modal-overlay">
            <div className="profile-modal-card">
                <div className="profile-modal-header">
                    <div className="profile-modal-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="1.8"
                            strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </div>
                    <h2 className="profile-modal-title">Privacy & Data Collection</h2>
                    <p className="profile-modal-sub" style={{ textAlign: 'left', marginTop: '16px' }}>
                        Before you upload any images or provide symptom details, please review how we handle your data:
                    </p>
                </div>

                <div style={{ fontSize: '14px', color: 'var(--text-mid)', lineHeight: '1.6', marginBottom: '24px' }}>
                    <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <li>
                            <strong>What we collect:</strong> Skin images you upload and symptom descriptions you provide.
                        </li>
                        <li>
                            <strong>Why we collect it:</strong> To assess possible skin conditions and provide you with relevant care advice through our AI assistant.
                        </li>
                        <li>
                            <strong>Who can access it:</strong> Only you and our secure, automated AI system. We do not share your data with third parties.
                        </li>
                        <li>
                            <strong>Where it is stored:</strong> Securely encrypted in our cloud database.
                        </li>
                        <li>
                            <strong>How to manage it:</strong> You can access, correct, or delete your data at any time via your Profile settings or by clearing your chat history.
                        </li>
                    </ul>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <button
                        onClick={onCancel}
                        className="profile-submit-btn"
                        style={{ flex: 1, width: 'auto', background: 'var(--border)', color: 'var(--text-dark)', boxShadow: 'none' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onAccept}
                        className="profile-submit-btn"
                        style={{ flex: 1, width: 'auto' }}
                    >
                        I Understand & Agree
                    </button>
                </div>
            </div>
        </div>
    );
}
