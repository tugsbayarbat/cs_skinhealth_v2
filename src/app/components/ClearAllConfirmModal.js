'use client';

export default function ClearAllConfirmModal({ onConfirm, onCancel, loading }) {
    return (
        <div className="profile-modal-overlay">
            <div className="profile-modal-card" style={{ maxWidth: '400px', padding: '36px' }}>
                <div className="profile-modal-header" style={{ marginBottom: '24px' }}>
                    <div className="profile-modal-icon" style={{ background: '#fff0f0', color: '#d94040' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="1.8"
                            strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                    </div>
                    <h2 className="profile-modal-title">Clear All Chats?</h2>
                    <p className="profile-modal-sub" style={{ marginTop: '12px', fontSize: '15px' }}>
                        Are you sure you want to permanently delete all your conversation history? This action cannot be undone.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button
                        onClick={onCancel}
                        className="profile-submit-btn"
                        style={{ background: 'var(--border)', color: 'var(--text-dark)', boxShadow: 'none' }}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="profile-submit-btn"
                        style={{ background: '#d94040', boxShadow: '0 6px 20px rgba(217, 64, 64, 0.3)' }}
                        disabled={loading}
                    >
                        {loading ? 'Deleting...' : 'Yes, Delete All'}
                    </button>
                </div>
            </div>
        </div>
    );
}
