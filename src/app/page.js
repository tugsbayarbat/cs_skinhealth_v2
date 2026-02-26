'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import BotResponse from './components/BotResponse';
import KeyNotes from './components/KeyNotes';
import QuickSummary from './components/QuickSummary';
import ChatInput from './components/ChatInput';
import UploadedImages from './components/UploadedImages';

const INITIAL_RESPONSE = {
  intro: "Thanks for sharing. I can help you assess the possible causes and provide care advice.",
  preamble: "To begin, could you please tell me:",
  points: [
    "The approximate size of the red spot (e.g., smaller than a coin, larger than 1 cm)?",
    "Whether it has any swelling, pus, or fluid?",
    "Have you had fever, itching, or spreading redness around it?",
  ],
};

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [latestResponse, setLatestResponse] = useState(INITIAL_RESPONSE);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatBodyRef = useRef(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [latestResponse]);

  async function handleSend(text, images) {
    // Append new images to the existing list
    if (images && images.length > 0) {
      setUploadedImages((prev) => [...prev, ...images]);
    }
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setLatestResponse(data.response);
    } catch {
      setLatestResponse({ intro: 'Sorry, something went wrong. Please try again.', points: [] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* SIDEBAR */}
      <aside className={`sidebar${sidebarOpen ? '' : ' sidebar-collapsed'}`}>
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
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
            GROUP<span>7</span> CS P<span>2</span>
          </div>

          <div className="sidebar-actions">
            <button className="btn-new-chat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New chat
            </button>
            <button className="btn-search" title="Search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>

          <div className="conversations-label">
            Your conversations
            <span className="clear-all">Clear All</span>
          </div>

          <div className="conversations-list" />

          <div className="sidebar-footer">
            <div className="user-pill">
              <div className="user-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span className="user-name">Tugsbayar Bat-Erdene</span>
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
        <header className="chat-header">SkinHealth Assistant</header>

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
            <KeyNotes title="Symptom notes" meta="Heart Surgeon, London, England" />
            <QuickSummary title="Quick summary" meta="Heart Surgeon, London, England" />

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
