'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { signOut, useSession } from 'next-auth/react';
import BotResponse from '../components/BotResponse';
import KeyNotes from '../components/KeyNotes';
import QuickSummary from '../components/QuickSummary';
import ChatInput from '../components/ChatInput';
import UploadedImages from '../components/UploadedImages';
import ProfileModal from '../components/ProfileModal';
import ClearAllConfirmModal from '../components/ClearAllConfirmModal';

const INITIAL_RESPONSE = {
    intro: "Hello! I'm here to help with any skin health questions you may have. Feel free to describe your concern or upload an image, and I'll do my best to assist you.",
    preamble: "",
    points: [],
};

export default function ChatPage() {
    const { data: session, update } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Open sidebar on desktop after mount. Starting with false is the safe SSR
    // default — mobile stays closed, desktop opens via this effect.
    useEffect(() => {
        setSidebarOpen(window.innerWidth > 768);
    }, []);
    const [latestResponse, setLatestResponse] = useState(INITIAL_RESPONSE);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [symptoms, setSymptoms] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyMessages, setHistoryMessages] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [showClearAllModal, setShowClearAllModal] = useState(false);
    const [clearingAll, setClearingAll] = useState(false);
    const chatBodyRef = useRef(null);

    // Conversation tracking
    const [conversationId, setConversationId] = useState(null);
    const [conversations, setConversations] = useState([]);

    // Show modal when profile is incomplete
    const showProfileModal = session && session.user?.profileComplete === false;

    // Load conversation list from API
    const loadConversations = useCallback(async () => {
        try {
            const res = await fetch('/api/conversations');
            if (!res.ok) return;
            const data = await res.json();
            setConversations(data.conversations ?? []);
        } catch {
            // non-fatal — sidebar just stays empty
        }
    }, []);

    const loadSymptoms = useCallback(async (id) => {
        if (!id) return;
        try {
            const symRes = await fetch(`/api/chat/symptoms?conversationId=${id}`);
            if (symRes.ok) {
                const symData = await symRes.json();
                setSymptoms(symData);
            }
        } catch {
            // non-fatal
        }
    }, []);

    useEffect(() => {
        if (session?.user?.id) {
            loadConversations();
        }
    }, [session?.user?.id, loadConversations]);

    useEffect(() => {
        if (conversationId) {
            loadSymptoms(conversationId);

            // Fetch history to get the latest response for the active chat
            fetch(`/api/chat/history?conversationId=${conversationId}`)
                .then(r => r.json())
                .then(data => {
                    if (data.messages && data.messages.length > 0) {
                        const asstMsgs = data.messages.filter(m => m.role === 'assistant');
                        if (asstMsgs.length > 0) {
                            setLatestResponse({
                                intro: asstMsgs[asstMsgs.length - 1].content,
                                points: []
                            });
                        } else {
                            setLatestResponse(INITIAL_RESPONSE);
                        }
                    } else {
                        setLatestResponse(INITIAL_RESPONSE);
                    }
                })
                .catch(() => setLatestResponse(INITIAL_RESPONSE));
        } else {
            setSymptoms(null);
            setLatestResponse(INITIAL_RESPONSE);
        }
    }, [conversationId, loadSymptoms]);

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [latestResponse]);

    // Start a brand-new conversation
    function handleNewChat() {
        setConversationId(null);
        setLatestResponse(INITIAL_RESPONSE);
        setUploadedImages([]);
        setSymptoms(null);
        if (window.innerWidth <= 768) setSidebarOpen(false);
    }

    // Clear all conversations
    function handleClearAll() {
        setShowClearAllModal(true);
    }

    async function confirmClearAll() {
        setClearingAll(true);
        try {
            const res = await fetch('/api/conversations', { method: 'DELETE' });
            if (res.ok) {
                setConversations([]);
                handleNewChat();
                setShowClearAllModal(false);
            } else {
                console.error("Failed to clear conversations");
            }
        } catch (e) {
            console.error("Error clearing conversations:", e);
        } finally {
            setClearingAll(false);
        }
    }

    async function handleSend(text, images, rawFiles = []) {
        if (images && images.length > 0) {
            setUploadedImages((prev) => [...prev, ...images]);
        }
        setLoading(true);

        try {
            let currentConvId = conversationId;
            let imageUploadResponse = null;

            // 1. Upload images if any
            if (rawFiles && rawFiles.length > 0) {
                for (const file of rawFiles) {
                    const formData = new FormData();
                    formData.append('file', file);
                    if (currentConvId) {
                        formData.append('conversation_id', currentConvId);
                    }
                    const imgRes = await fetch('/api/chat/image', {
                        method: 'POST',
                        body: formData
                    });
                    if (!imgRes.ok) throw new Error('Image upload failed');
                    const imgData = await imgRes.json();

                    if (!currentConvId && imgData.conversation_id) {
                        currentConvId = imgData.conversation_id;
                        setConversationId(currentConvId);
                        await loadConversations();
                    }

                    // Capture the AI's acknowledgment from image upload
                    if (imgData.response) {
                        imageUploadResponse = imgData.response;
                    }
                }
            }

            // 2. Send message only if user typed text
            if (text) {
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: text, conversation_id: currentConvId }),
                });
                const data = await res.json();

                if (data.response) {
                    setLatestResponse(data.response);
                }

                const finalConvId = data.conversation_id || currentConvId;
                if (data.conversation_id && !currentConvId) {
                    setConversationId(data.conversation_id);
                    await loadConversations();
                }

                if (finalConvId) {
                    await loadSymptoms(finalConvId);
                }
            } else if (imageUploadResponse) {
                // Image only (no text) — show the upload acknowledgment from FastAPI
                setLatestResponse({ intro: imageUploadResponse, points: [] });

                if (currentConvId) {
                    await loadSymptoms(currentConvId);
                }
            }
        } catch {
            setLatestResponse({ intro: 'Sorry, something went wrong. Please try again.', points: [] });
        } finally {
            setLoading(false);
        }
    }

    async function handleShowHistory() {
        if (!conversationId) return;
        setLoadingHistory(true);
        setShowHistoryModal(true);
        try {
            const res = await fetch(`/api/chat/history?conversationId=${conversationId}`);
            if (res.ok) {
                const data = await res.json();
                setHistoryMessages(data.messages || []);
            }
        } catch {
            // Non-fatal
        } finally {
            setLoadingHistory(false);
        }
    }

    // Format date for sidebar display
    function formatDate(iso) {
        const d = new Date(iso);
        const now = new Date();
        const diffDays = Math.floor((now - d) / 86400000);
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }

    return (
        <>
            {/* Profile completion modal — shown on first login */}
            {showProfileModal && (
                <ProfileModal onComplete={() => update()} />
            )}

            {/* Clear All Confirm Modal */}
            {showClearAllModal && (
                <ClearAllConfirmModal
                    onConfirm={confirmClearAll}
                    onCancel={() => setShowClearAllModal(false)}
                    loading={clearingAll}
                />
            )}

            {/* History Modal */}
            {showHistoryModal && (
                <div
                    onClick={() => setShowHistoryModal(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.45)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: '#fff',
                            borderRadius: '16px',
                            padding: '24px',
                            maxWidth: '640px',
                            width: '94%',
                            maxHeight: '85vh',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 12px 48px rgba(0,0,0,0.2)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '16px' }}>
                            <h2 style={{ margin: 0, fontSize: '18px', fontFamily: 'Syne, sans-serif' }}>Chat History</h2>
                            <button onClick={() => setShowHistoryModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '28px', color: '#999', lineHeight: 1 }}>&times;</button>
                        </div>
                        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '12px' }}>
                            {loadingHistory ? (
                                <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>Loading history...</p>
                            ) : historyMessages.length === 0 ? (
                                <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No messages found.</p>
                            ) : (
                                historyMessages.map((msg, idx) => (
                                    <div key={idx} style={{
                                        marginBottom: '20px',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        backgroundColor: msg.role === 'user' ? '#f0f2f8' : '#fff',
                                        border: msg.role === 'assistant' ? '1px solid #e2e4f0' : 'none',
                                        boxShadow: msg.role === 'assistant' ? '0 4px 12px rgba(0,0,0,0.03)' : 'none'
                                    }}>
                                        <div style={{ fontWeight: '700', marginBottom: '8px', fontSize: '11px', color: msg.role === 'assistant' ? '#6b35d9' : '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {msg.role}
                                        </div>
                                        <div style={{ fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-wrap', color: '#1a1a2e' }}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile backdrop — closes sidebar when tapped */}
            {sidebarOpen && (
                <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
            )}

            {/* SIDEBAR */}
            <aside className={`sidebar${sidebarOpen ? '' : ' sidebar-collapsed'}`}>
                <button
                    className="sidebar-toggle"
                    onClick={() => setSidebarOpen(prev => !prev)}
                    title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round">
                        {sidebarOpen ? (
                            <polyline points="15 18 9 12 15 6" />
                        ) : (
                            <polyline points="9 18 15 12 9 6" />
                        )}
                    </svg>
                </button>

                <div className="sidebar-inner">
                    <div className="sidebar-header">
                        GROUP<span>6</span> CS P<span>2</span>
                    </div>

                    <div className="sidebar-actions">
                        <button className="btn-new-chat" onClick={handleNewChat}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            New chat
                        </button>
                        {/* <button className="btn-search" title="Search">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </button> */}
                    </div>

                    <div className="conversations-label">
                        Your conversations
                        <span className="clear-all" onClick={handleClearAll} style={{ cursor: 'pointer' }}>Clear All</span>
                    </div>

                    {/* Conversation list */}
                    <div className="conversations-list">
                        {conversations.length === 0 ? (
                            <p className="conv-empty">No conversations yet. Start chatting!</p>
                        ) : (
                            conversations.map((conv) => (
                                <button
                                    key={conv.id}
                                    className={`conv-item${conv.id === conversationId ? ' conv-item-active' : ''}`}
                                    onClick={() => {
                                        if (conversationId !== conv.id) {
                                            setConversationId(conv.id);
                                            setLatestResponse({ intro: 'Loading conversation...', points: [] });
                                            setSymptoms(null);
                                            setUploadedImages([]);
                                        }
                                    }}
                                    title={conv.title}
                                >
                                    <span className="conv-title">{conv.title}</span>
                                    <span className="conv-date">{formatDate(conv.created_at)}</span>
                                </button>
                            ))
                        )}
                    </div>

                    <div className="sidebar-footer">
                        <div className="user-pill">
                            <div className="user-avatar">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                                    strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <span className="user-name">
                                {session?.user?.name || session?.user?.email || 'User'}
                            </span>
                        </div>
                        <button
                            className="logout-btn"
                            title="Sign out"
                            onClick={() => signOut({ callbackUrl: '/login' })}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN */}
            <main className="main">
                <header className="chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Hamburger — mobile only, reopens the sidebar */}
                        <button
                            className="hamburger-btn"
                            onClick={() => setSidebarOpen(true)}
                            title="Open sidebar"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                        <span>SkinHealth Assistant</span>
                    </div>
                    {conversationId && (
                        <button
                            onClick={handleShowHistory}
                            style={{
                                background: 'transparent',
                                border: '1px solid #e0e0e0',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                cursor: 'pointer',
                                color: '#555',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" style={{ marginRight: '6px' }}>
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            View History
                        </button>
                    )}
                </header>

                <div className="chat-body" ref={chatBodyRef}>

                    {/* Latest bot response only */}
                    {loading ? (
                        <div className="assistant-bubble typing-indicator">
                            <span /><span /><span />
                        </div>
                    ) : (
                        <BotResponse>
                            <p>{latestResponse.intro}</p>
                            {latestResponse.preamble && (
                                <p style={{ marginBottom: '12px' }}>{latestResponse.preamble}</p>
                            )}
                            {latestResponse.points && latestResponse.points.length > 0 && (
                                <ol>
                                    {latestResponse.points.map((point, i) => (
                                        <li key={i}>{point}</li>
                                    ))}
                                </ol>
                            )}
                        </BotResponse>
                    )}

                    {/* Info cards */}
                    <div className="cards-row">
                        <KeyNotes title="Symptom notes" symptoms={symptoms} />
                        {/* <QuickSummary title="Quick summary" /> */}

                        {/* Uploaded images component */}
                        <UploadedImages
                            images={uploadedImages}
                            onRemove={(i) => setUploadedImages((prev) => prev.filter((_, idx) => idx !== i))}
                        />
                    </div>

                </div>

                {/* Chat input */}
                <ChatInput onSend={handleSend} disabled={loading} />
            </main>
        </>
    );
}
