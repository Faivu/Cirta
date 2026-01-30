import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const SessionContext = createContext(null);

/**
 * Play a notification sound when timer completes using Web Audio API
 */
const playNotificationSound = () => {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const now = audioContext.currentTime;

        // Play three ascending tones for a pleasant chime
        [440, 554, 659].forEach((freq, i) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'sine';

            const startTime = now + i * 0.15;
            gainNode.gain.setValueAtTime(0.3, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.4);
        });
    } catch (e) {
        // Silently fail if audio not supported
    }
};

/**
 * API call helper
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
 * SessionProvider - Provides session state to the entire app
 */
export function SessionProvider({ children }) {
    // Session state
    const [strategy, setStrategy] = useState('pomodoro');
    const [status, setStatus] = useState('idle');
    const [sessionId, setSessionId] = useState(null);

    // Timer state
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [targetMinutes, setTargetMinutes] = useState(25);

    // Break state
    const [breakSeconds, setBreakSeconds] = useState(0);
    const [breakDuration, setBreakDuration] = useState(0);

    // Configuration state
    const [customGoal, setCustomGoal] = useState('');
    const [pomodoroMode, setPomodoroMode] = useState('pomodoro');
    const [pomodoroCount, setPomodoroCount] = useState(0);

    // UI state
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [completionData, setCompletionData] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Guards
    const [isAutoCompleting, setIsAutoCompleting] = useState(false);
    const lastProcessedSessionRef = useRef(null);

    // Timer tick effect
    useEffect(() => {
        if (status !== 'running') return;

        const interval = setInterval(() => {
            setElapsedSeconds(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [status]);

    // Break timer countdown
    useEffect(() => {
        if (status !== 'break' || breakSeconds <= 0) return;

        const interval = setInterval(() => {
            setBreakSeconds(prev => {
                if (prev <= 1) {
                    playNotificationSound();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [status, breakSeconds]);

    // Reset to pomodoro mode when break finishes
    useEffect(() => {
        if (status === 'break' && breakSeconds === 0) {
            setPomodoroMode('pomodoro');
        }
    }, [status, breakSeconds]);

    // Suggest break when pomodoro completes
    useEffect(() => {
        if (status === 'completed' && strategy === 'pomodoro' && sessionId && lastProcessedSessionRef.current !== sessionId) {
            lastProcessedSessionRef.current = sessionId;
            setPomodoroCount(prev => {
                const newCount = prev + 1;
                setPomodoroMode(newCount % 4 === 0 ? 'longBreak' : 'shortBreak');
                return newCount;
            });
        }
    }, [status, strategy, sessionId]);

    // Auto-complete when pomodoro time is up
    useEffect(() => {
        if (strategy !== 'pomodoro' || status !== 'running' || !sessionId || isAutoCompleting) return;

        const targetSeconds = targetMinutes * 60;
        if (elapsedSeconds < targetSeconds) return;

        setIsAutoCompleting(true);
        setLoading(true);
        playNotificationSound();

        const actualDuration = Math.floor(elapsedSeconds / 60);
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
    }, [elapsedSeconds, strategy, status, targetMinutes, sessionId, isAutoCompleting]);

    // Handlers
    const handleStart = async () => {
        if (!strategy) {
            setError('Please select a strategy first');
            return;
        }

        if (strategy === 'pomodoro' && pomodoroMode !== 'pomodoro') {
            const duration = pomodoroMode === 'shortBreak' ? 5 : 15;
            setBreakDuration(duration);
            setBreakSeconds(duration * 60);
            setStatus('break');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const payload = {
                strategy,
                customGoal: customGoal || null,
                ...(strategy === 'pomodoro' && { targetDuration: targetMinutes }),
            };

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

    const handleComplete = async () => {
        if (!sessionId) return;

        setLoading(true);
        try {
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

    const handleInterrupt = () => {
        if (sessionId) setShowConfirmModal(true);
    };

    const confirmInterrupt = async () => {
        setShowConfirmModal(false);
        setLoading(true);
        try {
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

    const handleContinue = async () => {
        setError(null);
        setCompletionData(null);
        setBreakSeconds(0);

        if (strategy === 'pomodoro' && pomodoroMode !== 'pomodoro') {
            const duration = pomodoroMode === 'shortBreak' ? 5 : 15;
            setBreakDuration(duration);
            setBreakSeconds(duration * 60);
            setStatus('break');
            return;
        }

        setLoading(true);
        setBreakDuration(0);

        try {
            const payload = {
                strategy,
                customGoal: customGoal || null,
                ...(strategy === 'pomodoro' && { targetDuration: targetMinutes }),
            };

            const data = await apiCall('/api/session/start', 'POST', payload);
            setSessionId(data.id);
            setStatus('running');
            setElapsedSeconds(0);
            setPomodoroMode('pomodoro');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setStrategy('pomodoro');
        setPomodoroMode('pomodoro');
        setPomodoroCount(0);
        setStatus('idle');
        setSessionId(null);
        setElapsedSeconds(0);
        setBreakSeconds(0);
        setBreakDuration(0);
        setCustomGoal('');
        setError(null);
        setCompletionData(null);
    };

    const handleModeChange = (mode) => {
        if (status === 'running' || status === 'paused') return;

        setPomodoroMode(mode);

        if (mode === 'shortBreak') {
            setBreakDuration(5);
        } else if (mode === 'longBreak') {
            setBreakDuration(15);
        }
        setTargetMinutes(25);
    };

    const handleSkipBreak = () => {
        setBreakSeconds(0);
    };

    const handleGoalFinished = () => {
        setPomodoroMode('pomodoro');
        setStatus('idle');
        setSessionId(null);
        setElapsedSeconds(0);
        setBreakSeconds(0);
        setBreakDuration(0);
        setCustomGoal('');
        setError(null);
        setCompletionData(null);
    };

    const getRemainingSeconds = () => {
        if (strategy !== 'pomodoro') return null;
        return Math.max(0, targetMinutes * 60 - elapsedSeconds);
    };

    const dismissError = () => setError(null);
    const closeConfirmModal = () => setShowConfirmModal(false);

    const value = {
        // State
        strategy,
        status,
        sessionId,
        elapsedSeconds,
        targetMinutes,
        breakSeconds,
        breakDuration,
        customGoal,
        pomodoroMode,
        pomodoroCount,
        error,
        loading,
        completionData,
        showConfirmModal,

        // Setters
        setStrategy,
        setTargetMinutes,
        setCustomGoal,

        // Handlers
        handleStart,
        handlePause,
        handleResume,
        handleComplete,
        handleInterrupt,
        confirmInterrupt,
        handleContinue,
        handleReset,
        handleModeChange,
        handleSkipBreak,
        handleGoalFinished,
        getRemainingSeconds,
        dismissError,
        closeConfirmModal,
    };

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
}

SessionProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

/**
 * Hook to access session context
 */
export function useSession() {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
}

export default SessionContext;
