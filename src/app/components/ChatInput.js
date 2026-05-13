'use client';

import { useState, useRef } from 'react';
import CollectionNoticeModal from './CollectionNoticeModal';

export default function ChatInput({ onSend, disabled }) {
    const [text, setText] = useState('');
    const [previews, setPreviews] = useState([]); // array of data URLs
    const [rawFiles, setRawFiles] = useState([]); // array of original File objects
    const [hasAcceptedNotice, setHasAcceptedNotice] = useState(false);
    const [showNoticeModal, setShowNoticeModal] = useState(false);
    const fileInputRef = useRef(null);

    function handleFileChange(e) {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        const readers = files.map(
            (file) =>
                new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(file);
                })
        );

        Promise.all(readers).then((results) => {
            setPreviews((prev) => [...prev, ...results]);
            setRawFiles((prev) => [...prev, ...files]);
        });

        // Reset input so same file can be re-added if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    function removePreview(index) {
        setPreviews((prev) => prev.filter((_, i) => i !== index));
        setRawFiles((prev) => prev.filter((_, i) => i !== index));
    }

    function handleSend() {
        if (!text.trim() && previews.length === 0) return;
        if (disabled) return;

        onSend(text.trim(), previews, rawFiles);
        setText('');
        setPreviews([]);
        setRawFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') handleSend();
    }

    return (
        <div className="chat-input-area">
            {showNoticeModal && (
                <CollectionNoticeModal 
                    onAccept={() => {
                        setHasAcceptedNotice(true);
                        setShowNoticeModal(false);
                        // Using a small timeout helps ensure the modal closes before triggering file dialog, 
                        // though it's typically fine.
                        setTimeout(() => fileInputRef.current?.click(), 50);
                    }}
                    onCancel={() => setShowNoticeModal(false)}
                />
            )}

            {/* Image previews — shown above input row */}
            {previews.length > 0 && (
                <div className="image-preview-strip">
                    {previews.map((src, i) => (
                        <div key={i} className="image-preview-thumb">
                            <img src={src} alt={`Preview ${i + 1}`} />
                            <button
                                className="uploaded-img-remove"
                                onClick={() => removePreview(i)}
                                title="Remove"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                    strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="input-row">
                <button
                    className={`attach-btn${previews.length > 0 ? ' attach-btn--active' : ''}`}
                    title="Attach images"
                    disabled={disabled}
                    onClick={(e) => {
                        e.preventDefault();
                        if (!hasAcceptedNotice) {
                            setShowNoticeModal(true);
                        } else {
                            fileInputRef.current?.click();
                        }
                    }}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                    </svg>
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    disabled={disabled}
                />

                <input
                    className="chat-input"
                    type="text"
                    placeholder="Describe your symptoms…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                />

                <button className="send-btn" title="Send" onClick={handleSend} disabled={disabled}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
