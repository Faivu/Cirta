import React, { useState, useEffect, useCallback } from 'react';

function SessionHistory() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [filter, setFilter] = useState('today');

    const fetchHistory = useCallback(async (pageNum, append = false) => {
        try {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            let url = `/api/session/history?page=${pageNum}&limit=20`;
            if (filter === 'today') {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                url += `&since=${today.toISOString()}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch history');
            }

            const data = await response.json();

            if (append) {
                setSessions(prev => [...prev, ...data.sessions]);
            } else {
                setSessions(data.sessions);
            }
            setTotalPages(data.pages);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [filter]);

    useEffect(() => {
        setPage(1);
        fetchHistory(1);
    }, [fetchHistory, filter]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchHistory(nextPage, true);
    };

    const formatDuration = (minutes) => {
        if (!minutes) return '—';
        if (minutes < 60) return `${minutes}m`;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const date = new Date(dateStr);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();

        if (isToday) return 'Today';
        if (isYesterday) return 'Yesterday';

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'pomodoro': return 'Pomodoro';
            case 'flowtime': return 'Flowtime';
            case 'free_session': return 'Free';
            default: return type;
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'pomodoro':
                return (
                    <svg width="14" height="14" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <ellipse cx="32" cy="38" rx="24" ry="18" />
                        <line x1="32" y1="20" x2="32" y2="10" />
                    </svg>
                );
            case 'flowtime':
                return (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v20M2 12h20" />
                    </svg>
                );
            case 'free_session':
                return (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                    </svg>
                );
            default: return null;
        }
    };

    const filterBar = (
        <div className="history-filter">
            <button
                className={`history-filter-btn ${filter === 'today' ? 'active' : ''}`}
                onClick={() => setFilter('today')}
            >
                Today
            </button>
            <button
                className={`history-filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
            >
                All
            </button>
        </div>
    );

    if (loading) {
        return (
            <div className="session-history">
                {filterBar}
                <div className="history-loading">Loading history...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="session-history">
                {filterBar}
                <div className="history-error">{error}</div>
            </div>
        );
    }

    if (sessions.length === 0) {
        return (
            <div className="session-history">
                {filterBar}
                <div className="history-empty">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <p>No sessions yet</p>
                    <span>Complete a session to see it here</span>
                </div>
            </div>
        );
    }

    // Group sessions by date
    const grouped = {};
    sessions.forEach(session => {
        const dateKey = formatDate(session.startedAt);
        if (!grouped[dateKey]) {
            grouped[dateKey] = [];
        }
        grouped[dateKey].push(session);
    });

    return (
        <div className="session-history">
            {filterBar}
            {Object.entries(grouped).map(([date, dateSessions]) => (
                <div key={date} className="history-group">
                    <div className="history-date-header">{date}</div>
                    {dateSessions.map(session => (
                        <div key={session.id} className={`history-item ${session.status}`}>
                            <div className="history-item-top">
                                <span className={`history-type ${session.type}`}>
                                    {getTypeIcon(session.type)}
                                    {getTypeLabel(session.type)}
                                </span>
                                <span className="history-duration">
                                    {formatDuration(session.actualDuration)}
                                </span>
                            </div>
                            {session.customGoal && (
                                <div className="history-goal">{session.customGoal}</div>
                            )}
                            <div className="history-item-bottom">
                                <span className="history-time">
                                    {formatTime(session.startedAt)}
                                    {session.endedAt && ` — ${formatTime(session.endedAt)}`}
                                </span>
                                {session.status === 'interrupted' && (
                                    <span className="history-status interrupted">Interrupted</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ))}

            {page < totalPages && (
                <button
                    className="history-load-more"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                >
                    {loadingMore ? 'Loading...' : 'Load more'}
                </button>
            )}
        </div>
    );
}

export default SessionHistory;
