import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const CATEGORIES = [
    { id: 'bug',     label: 'Bug' },
    { id: 'ui',      label: 'UI Feedback' },
    { id: 'feature', label: 'Feature Request' },
    { id: 'general', label: 'General' },
];

const PLACEHOLDERS = {
    bug:     'What happened? What did you expect instead?',
    ui:      'What felt off, or what worked well?',
    feature: 'What would you like to be able to do?',
    general: 'Anything you want to say about Cirta?',
};

const DRAFT_KEY = 'cirta_feedback_draft';

function loadDraft() {
    try {
        const saved = localStorage.getItem(DRAFT_KEY);
        return saved ? JSON.parse(saved) : { category: '', comment: '' };
    } catch {
        return { category: '', comment: '' };
    }
}

function FeedbackPanel({ isOpen, onClose }) {
    const draft = loadDraft();
    const [category, setCategory] = useState(draft.category);
    const [comment, setComment] = useState(draft.comment);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (isOpen && category) {
            textareaRef.current?.focus();
        }
    }, [category, isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    useEffect(() => {
        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify({ category, comment }));
        } catch {}
    }, [category, comment]);

    const handleCategoryChange = (id) => {
        setCategory(id);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!category) return;

        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category,
                    comment,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Something went wrong');
            }

            localStorage.removeItem(DRAFT_KEY);
            setSubmitted(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            if (submitted) {
                setCategory('');
                setComment('');
                setSubmitted(false);
            }
            setError(null);
        }, 300);
    };

    return (
        <>
            {isOpen && <div className="feedback-overlay" onClick={handleClose} />}
            <div className={`feedback-panel ${isOpen ? 'open' : ''}`}>
                <div className="feedback-panel-header">
                    <span className="feedback-panel-title">Share Feedback</span>
                    <button className="feedback-panel-close" onClick={handleClose} aria-label="Close">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {submitted ? (
                    <div className="feedback-success">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="9 12 11 14 15 10" />
                        </svg>
                        <p>Thanks for your feedback!</p>
                        <span>It helps make Cirta better.</span>
                        <button className="btn btn-secondary" onClick={handleClose}>Close</button>
                    </div>
                ) : (
                    <form className="feedback-form" onSubmit={handleSubmit}>
                        <div className="feedback-field">
                            <label className="feedback-label">Category</label>
                            <div className="feedback-categories">
                                {CATEGORIES.map(c => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        className={`feedback-category-btn ${category === c.id ? 'active' : ''}`}
                                        onClick={() => handleCategoryChange(c.id)}
                                    >
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {category && (
                            <div className="feedback-field">
                                <label className="feedback-label">Comment</label>
                                <span className="feedback-panel-anon">Feedback is not tied to your name, be honest!</span>
                                <textarea
                                    ref={textareaRef}
                                    className="feedback-textarea"
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    placeholder={PLACEHOLDERS[category]}
                                    rows={4}
                                />
                            </div>
                        )}

                        {error && <div className="feedback-error">{error}</div>}

                        <button
                            type="submit"
                            className="btn btn-primary feedback-submit"
                            disabled={!category || !comment.trim() || submitting}
                        >
                            {submitting ? 'Sending...' : 'Send Feedback'}
                        </button>
                    </form>
                )}
            </div>
        </>
    );
}

FeedbackPanel.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default FeedbackPanel;
