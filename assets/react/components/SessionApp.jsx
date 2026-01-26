import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import StrategySelector from './StrategySelector';
import Timer from './Timer';
import SessionControls from './SessionControls';
import ConfirmModal from './ConfirmModal';

/**
 * API call helper - moved outside component to avoid recreation on each render
 */
const apiCall = async (url, method = 'GET', body = null) => {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
    }

    return response.json();
};

/**
 * SessionApp - Main component for the session timer
 *
 * Flow:
 * 1. User selects a strategy (Pomodoro, Flowtime, or FreeSession)
 * 2. User configures the session (e.g., duration for Pomodoro)
 * 3. User starts the session
 * 4. Timer runs until completed or user stops it
 * 5. Session completes -> user can take break or skip
 * 6. Break timer runs (if taken) -> user can start next session
 *
 * @param {boolean} compact - Whether to render in compact sidebar mode
 */
function SessionApp({ compact = false }) {
    // Session state
    const [strategy, setStrategy] = useState(null); // 'pomodoro', 'flowtime', 'free_session'
    const [status, setStatus] = useState('idle'); // 'idle', 'running', 'paused', 'completed', 'break'
    const [sessionId, setSessionId] = useState(null);

    // Timer state
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [targetMinutes, setTargetMinutes] = useState(25); // For Pomodoro

    // Break state
    const [breakSeconds, setBreakSeconds] = useState(0);
    const [breakDuration, setBreakDuration] = useState(0);

    // Configuration state
    const [customGoal, setCustomGoal] = useState('');

    // Error/loading state
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Completion results (for displaying stats after session ends)
    const [completionData, setCompletionData] = useState(null);

    // Confirm modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Guard to prevent duplicate auto-complete calls
    const [isAutoCompleting, setIsAutoCompleting] = useState(false);

    // Timer effect - runs every second when session is active
    useEffect(() => {
        let interval = null;

        if (status === 'running') {
            interval = setInterval(() => {
                setElapsedSeconds(prev => prev + 1);
            }, 1000);
        }

        // Cleanup interval on unmount or when status changes
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [status]);

    // Break timer effect - counts down during break
    useEffect(() => {
        let interval = null;

        if (status === 'break' && breakSeconds > 0) {
            interval = setInterval(() => {
                setBreakSeconds(prev => {
                    if (prev <= 1) {
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [status, breakSeconds]);

    // Check if Pomodoro time is up
    useEffect(() => {
        if (strategy === 'pomodoro' && status === 'running' && sessionId && !isAutoCompleting) {
            const targetSeconds = targetMinutes * 60;
            if (elapsedSeconds >= targetSeconds) {
                // Prevent duplicate calls
                setIsAutoCompleting(true);
                // Complete the session
                const actualDuration = Math.floor(elapsedSeconds / 60);
                setLoading(true);
                apiCall(`/api/session/${sessionId}/end`, 'POST', { actualDuration })
                    .then(data => {
                        setCompletionData(data);
                        setBreakDuration(data.breakDuration || 0);
                        setStatus('completed');
                    })
                    .catch(err => setError(err.message))
                    .finally(() => {
                        setLoading(false);
                        setIsAutoCompleting(false);
                    });
            }
        }
    }, [elapsedSeconds, strategy, status, targetMinutes, sessionId, isAutoCompleting]);

    // Start a new session
    const handleStart = async () => {
        if (!strategy) {
            setError('Please select a strategy first');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const payload = {
                strategy,
                customGoal: customGoal || null,
            };

            // Add strategy-specific config
            if (strategy === 'pomodoro') {
                payload.targetDuration = targetMinutes;
            }

            const data = await apiCall('/api/session/start', 'POST', payload);

            setSessionId(data.id);
            setStatus('running');
            setElapsedSeconds(0);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Pause the session (Pomodoro only)
    const handlePause = async () => {
        if (!sessionId || strategy !== 'pomodoro') return;

        setLoading(true);
        try {
            await apiCall(`/api/session/${sessionId}/pause`, 'POST');
            setStatus('paused');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Resume the session (Pomodoro only)
    const handleResume = async () => {
        if (!sessionId || strategy !== 'pomodoro') return;

        setLoading(true);
        try {
            await apiCall(`/api/session/${sessionId}/resume`, 'POST');
            setStatus('running');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Complete the session normally
    const handleComplete = async () => {
        if (!sessionId) return;

        setLoading(true);
        try {
            // Send actual working time in minutes
            const actualDuration = Math.floor(elapsedSeconds / 60);
            const data = await apiCall(`/api/session/${sessionId}/end`, 'POST', { actualDuration });

            setCompletionData(data);
            setBreakDuration(data.breakDuration || 0);
            setStatus('completed');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Show interrupt confirmation modal
    const handleInterrupt = () => {
        if (!sessionId) return;
        setShowConfirmModal(true);
    };

    // Actually interrupt the session after confirmation
    const confirmInterrupt = async () => {
        setShowConfirmModal(false);
        setLoading(true);
        try {
            // Send actual working time in minutes
            const actualDuration = Math.floor(elapsedSeconds / 60);
            const data = await apiCall(`/api/session/${sessionId}/interrupt`, 'POST', { actualDuration });

            setCompletionData(data);
            setStatus('completed');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Start the break timer
    const handleTakeBreak = () => {
        if (!breakDuration) return;
        setBreakSeconds(breakDuration * 60);
        setStatus('break');
    };

    // Skip break and continue with next session
    const handleSkipBreak = async () => {
        await handleContinue();
    };

    // Reset to start a new session
    const handleReset = () => {
        setStrategy(null);
        setStatus('idle');
        setSessionId(null);
        setElapsedSeconds(0);
        setBreakSeconds(0);
        setBreakDuration(0);
        setCustomGoal('');
        setError(null);
        setCompletionData(null);
    };

    // Continue with another session (same strategy and settings)
    const handleContinue = async () => {
        if (!sessionId) return;

        setLoading(true);
        setError(null);
        setCompletionData(null);
        setBreakSeconds(0);
        setBreakDuration(0);

        try {
            const data = await apiCall(`/api/session/${sessionId}/continue`, 'POST');

            setSessionId(data.id);
            setStatus('running');
            setElapsedSeconds(0);

            // Update settings from the continued session (in case they differ)
            if (data.targetDuration) {
                setTargetMinutes(data.targetDuration);
            }
            if (data.customGoal !== undefined) {
                setCustomGoal(data.customGoal || '');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Calculate remaining time for Pomodoro
    const getRemainingSeconds = () => {
        if (strategy !== 'pomodoro') return null;
        const targetSeconds = targetMinutes * 60;
        return Math.max(0, targetSeconds - elapsedSeconds);
    };

    // Format seconds as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`session-container${compact ? ' compact' : ''}`}>
            <h1 className="session-title">Focus Session</h1>

            {error && (
                <div className="error-message">
                    {error}
                    <button onClick={() => setError(null)} className="error-close">&times;</button>
                </div>
            )}

            {status === 'idle' && (
                <>
                    <StrategySelector
                        selected={strategy}
                        onSelect={setStrategy}
                    />

                    {strategy && (
                        <div className="session-config">
                            {strategy === 'pomodoro' && (
                                <div className="config-field">
                                    <label htmlFor="duration">Duration (minutes):</label>
                                    <input
                                        id="duration"
                                        type="number"
                                        min="1"
                                        max="120"
                                        value={targetMinutes}
                                        onChange={(e) => setTargetMinutes(parseInt(e.target.value) || 25)}
                                    />
                                </div>
                            )}

                            <div className="config-field">
                                <label htmlFor="goal">What are you working on? (optional)</label>
                                <input
                                    id="goal"
                                    type="text"
                                    placeholder="e.g., Study chapter 5"
                                    value={customGoal}
                                    onChange={(e) => setCustomGoal(e.target.value)}
                                />
                            </div>

                            <button
                                className="btn btn-primary btn-large"
                                onClick={handleStart}
                                disabled={loading}
                            >
                                {loading ? 'Starting...' : 'Start Session'}
                            </button>
                        </div>
                    )}
                </>
            )}

            {(status === 'running' || status === 'paused') && (
                <>
                    <div className="strategy-badge">{strategy}</div>

                    {customGoal && (
                        <div className="current-goal">
                            Working on: <strong>{customGoal}</strong>
                        </div>
                    )}

                    <Timer
                        elapsedSeconds={elapsedSeconds}
                        remainingSeconds={getRemainingSeconds()}
                        strategy={strategy}
                        isPaused={status === 'paused'}
                    />

                    <SessionControls
                        strategy={strategy}
                        status={status}
                        loading={loading}
                        onPause={handlePause}
                        onResume={handleResume}
                        onComplete={handleComplete}
                        onInterrupt={handleInterrupt}
                    />
                </>
            )}

            {status === 'completed' && (
                <div className="session-completed">
                    <div className="completed-icon">&#10003;</div>
                    <h2>Session Completed!</h2>

                    {completionData && (
                        <div className="completion-stats">
                            <div className="stat">
                                <span className="stat-label">Working Time</span>
                                <span className="stat-value">{completionData.actualDuration} min</span>
                            </div>

                            {strategy === 'pomodoro' && breakDuration > 0 && (
                                <div className="stat highlight">
                                    <span className="stat-label">Suggested Break</span>
                                    <span className="stat-value">{breakDuration} min</span>
                                </div>
                            )}

                            {strategy === 'flowtime' && completionData.suggestedBreakDuration && (
                                <div className="stat highlight">
                                    <span className="stat-label">Suggested Break</span>
                                    <span className="stat-value">{completionData.suggestedBreakDuration} min</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="completion-actions">
                        {strategy === 'pomodoro' && breakDuration > 0 && (
                            <button
                                className="btn btn-success"
                                onClick={handleTakeBreak}
                                disabled={loading}
                            >
                                Take Break
                            </button>
                        )}
                        <button
                            className="btn btn-primary"
                            onClick={handleSkipBreak}
                            disabled={loading}
                        >
                            {loading ? 'Starting...' : (strategy === 'pomodoro' && breakDuration > 0 ? 'Skip Break' : 'Continue')}
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={handleReset}
                            disabled={loading}
                        >
                            Change Strategy
                        </button>
                    </div>
                </div>
            )}

            {status === 'break' && (
                <div className="session-break">
                    <div className="break-icon">&#9749;</div>
                    <h2>Break Time</h2>

                    <div className="break-timer">
                        <span className="break-time">{formatTime(breakSeconds)}</span>
                        {breakSeconds === 0 && (
                            <span className="break-finished">Break finished!</span>
                        )}
                    </div>

                    <div className="break-actions">
                        <button
                            className="btn btn-primary"
                            onClick={handleContinue}
                            disabled={loading}
                        >
                            {loading ? 'Starting...' : (breakSeconds === 0 ? 'Start Next Session' : 'End Break Early')}
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={handleReset}
                            disabled={loading}
                        >
                            Change Strategy
                        </button>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={showConfirmModal}
                title="Stop Session"
                message="Are you sure you want to stop this session? Your progress will be saved."
                confirmText="Stop"
                cancelText="Continue Working"
                onConfirm={confirmInterrupt}
                onCancel={() => setShowConfirmModal(false)}
            />
        </div>
    );
}

SessionApp.propTypes = {
    compact: PropTypes.bool,
};

SessionApp.defaultProps = {
    compact: false,
};

export default SessionApp;
