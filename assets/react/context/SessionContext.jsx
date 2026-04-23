import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { playTickSound } from '../utils/sounds';
import { useToast } from './ToastContext';
import { useSettings } from './SettingsContext';
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
        // If audio not supported it skips the chime
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
const STRATEGY_LABEL = {
    pomodoro:      'Pomodoro',
    flowtime:      'Flowtime Session',
    time_blocking: 'Time Block',
};

export function SessionProvider({ children }) {
    const { showToast } = useToast();
    const settings = useSettings();

    // Session state — initialized directly from (localStorage-cached) settings, no flash
    const [strategy, setStrategy] = useState(settings.defaultStrategy);
    const [status, setStatus] = useState('idle');
    const [sessionId, setSessionId] = useState(null);

    // Timer state
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [targetMinutes, setTargetMinutes] = useState(settings.pomodoroWorkDuration);

    // Break state
    const [breakSeconds, setBreakSeconds] = useState(0);
    const [breakDuration, setBreakDuration] = useState(0);

    // Configuration state
    const [customGoal, setCustomGoal] = useState('');
    const [pomodoroMode, setPomodoroMode] = useState('pomodoro');
    const [pomodoroCount, setPomodoroCount] = useState(0);

    // Linked task (dragged from To-Do list)
    const [linkedTask, setLinkedTask] = useState(null); // { id, title } | null
    const [taskDoneSignal, setTaskDoneSignal] = useState(0);
    const [sessionEndSignal, setSessionEndSignal] = useState(0);

    // UI state
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [completionData, setCompletionData] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Guards
    const [isAutoCompleting, setIsAutoCompleting] = useState(false);
    const lastProcessedSessionRef = useRef(null);

    // Wall clock refs to ensure accurate timing even if the tab is inactive or the browser throttles the timer
    const timerStartRef = useRef(null); //When the timer starts or resumes
    const timerBaseRef = useRef(0); // Elapsed seconds at the last start
    const breakStartRef = useRef(null); //When the break starts
    const breakInitialRef = useRef(0); // how much to last when started

    // Flowtime pause tracking
    const [flowPauseSeconds, setFlowPauseSeconds] = useState(0); // live counter for current pause
    const flowPauseStartRef = useRef(null);

    // Timer tick effect
    useEffect(() => {
        if (status !== 'running') return;

        timerStartRef.current = Date.now();
        timerBaseRef.current = elapsedSeconds;

        const tick = () => {
            const wallElapsed = Math.floor((Date.now() - timerStartRef.current) / 1000);
            setElapsedSeconds(timerBaseRef.current + wallElapsed);
        };

        const interval = setInterval(tick, 500);

        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') tick();
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, [status]);

    // Break timer countdown
    useEffect(() => {
        if (status !== 'break') return;

        breakStartRef.current = Date.now();
        breakInitialRef.current = breakSeconds;
        let soundPlayed = false;

        const tick = () => {
            const elapsed = Math.floor((Date.now() - breakStartRef.current) / 1000);
            const remaining = Math.max(0, breakInitialRef.current - elapsed);

            if (remaining === 0 && !soundPlayed) {
                soundPlayed = true;
                playNotificationSound();
            }

            setBreakSeconds(remaining);
        };

        const interval = setInterval(tick, 500);

        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') tick();
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, [status]);

    // Flowtime pause counter — live ticker shown to user while paused
    useEffect(() => {
        if (status !== 'paused' || strategy !== 'flowtime') {
            setFlowPauseSeconds(0);
            flowPauseStartRef.current = null;
            return;
        }

        flowPauseStartRef.current = Date.now();

        const tick = () => {
            const elapsed = Math.floor((Date.now() - flowPauseStartRef.current) / 1000);
            setFlowPauseSeconds(elapsed);
        };

        const interval = setInterval(tick, 500);
        const onVisibilityChange = () => { if (document.visibilityState === 'visible') tick(); };
        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, [status, strategy]);

    // Warn user before closing tab if a session or break is active
    useEffect(() => {
        const active = status === 'running' || status === 'paused' || status === 'break';
        if (!active) return;

        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [status]);

    // Record break and reset pomodoro mode when break timer runs out naturally
    useEffect(() => {
        if (status === 'break' && breakSeconds === 0 && breakDuration > 0 && sessionId) {
            apiCall(`/api/session/${sessionId}/break`, 'POST', { duration: breakDuration }).catch(() => {});
            setPomodoroMode('pomodoro');
            setTargetMinutes(settings.pomodoroWorkDuration);
        }
    }, [status, breakSeconds]);

    // Suggest break when pomodoro completes — use backend's breakDuration as source of truth
    useEffect(() => {
        if (status === 'completed' && strategy === 'pomodoro' && sessionId && lastProcessedSessionRef.current !== sessionId) {
            lastProcessedSessionRef.current = sessionId;
            // Only count and suggest break for successfully completed sessions
            if (completionData?.breakDuration) {
                setPomodoroCount(prev => prev + 1);
                const newMode = completionData.breakType === 'long' ? 'longBreak' : 'shortBreak';
                setPomodoroMode(newMode);
                setTargetMinutes(newMode === 'longBreak' ? settings.pomodoroLongBreak : settings.pomodoroShortBreak);
            }
        }
    }, [status, strategy, sessionId, completionData]);

    // Reset targetMinutes to a sensible default when switching strategies
    useEffect(() => {
        if (strategy === 'time_blocking') setTargetMinutes(60);
        else if (strategy === 'pomodoro') setTargetMinutes(settings.pomodoroWorkDuration);
    }, [strategy, settings.pomodoroWorkDuration]);

    // Auto-complete when pomodoro or time_blocking time is up
    useEffect(() => {
        if ((strategy !== 'pomodoro' && strategy !== 'time_blocking') || status !== 'running' || !sessionId || isAutoCompleting) return;

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
                setSessionEndSignal(prev => prev + 1);
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
            const duration = pomodoroMode === 'shortBreak' ? settings.pomodoroShortBreak : settings.pomodoroLongBreak;
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
                taskId: linkedTask?.id ?? null,
                ...((strategy === 'pomodoro' || strategy === 'time_blocking') && { targetDuration: targetMinutes }),
            };

            const data = await apiCall('/api/session/start', 'POST', payload);
            setSessionId(data.id);
            setStatus('running');
            setElapsedSeconds(0);
            setFlowPauseSeconds(0);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePause = async () => {
        if (!sessionId) return;

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
        if (!sessionId) return;

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

            if (strategy === 'flowtime' && data.suggestedBreak) {
                const earnedSeconds = Math.max(0, data.suggestedBreak * 60 - flowPauseSeconds);
                if (earnedSeconds > 0) {
                    setBreakDuration(Math.round(earnedSeconds / 60));
                    setBreakSeconds(earnedSeconds);
                    setStatus('break');
                } else {
                    setBreakDuration(0);
                    setStatus('completed');
                }
            } else {
                setBreakDuration(data.breakDuration || 0);
                setStatus('completed');
            }
            setSessionEndSignal(prev => prev + 1);
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
            const endpoint = strategy === 'pomodoro' ? 'interrupt' : 'end';
            const data = await apiCall(`/api/session/${sessionId}/${endpoint}`, 'POST', { actualDuration });
            setCompletionData(data);

            if (strategy === 'flowtime' && data.suggestedBreak) {
                const earnedSeconds = Math.max(0, data.suggestedBreak * 60 - flowPauseSeconds);
                if (earnedSeconds > 0) {
                    setBreakDuration(Math.round(earnedSeconds / 60));
                    setBreakSeconds(earnedSeconds);
                    setStatus('break');
                } else {
                    setBreakDuration(0);
                    setStatus('completed');
                }
            } else {
                setStatus('completed');
            }
            setSessionEndSignal(prev => prev + 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBreakEnd = async () => {
        setError(null);
        setCompletionData(null);
        setBreakSeconds(0);

        if (strategy === 'pomodoro' && pomodoroMode !== 'pomodoro') {
            const duration = pomodoroMode === 'shortBreak' ? settings.pomodoroShortBreak : settings.pomodoroLongBreak;
            setBreakDuration(duration);
            setBreakSeconds(duration * 60);
            setStatus('break');
            return;
        }

        setLoading(true);
        setBreakDuration(0);
        setTargetMinutes(settings.pomodoroWorkDuration);

        try {
            const workDuration = strategy === 'pomodoro' ? settings.pomodoroWorkDuration : targetMinutes;
            const payload = {
                strategy,
                customGoal: customGoal || null,
                taskId: linkedTask?.id ?? null,
                ...((strategy === 'pomodoro' || strategy === 'time_blocking') && { targetDuration: workDuration }),
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
        setTargetMinutes(settings.pomodoroWorkDuration);
        setPomodoroCount(0);
        setStatus('idle');
        setSessionId(null);
        setElapsedSeconds(0);
        setBreakSeconds(0);
        setBreakDuration(0);
        setCustomGoal('');
        setLinkedTask(null);
        setError(null);
        setCompletionData(null);
    };

    const handleModeChange = (mode) => {
        if (settings.pomodoroSeriousMode) return;
        if (status === 'running' || status === 'paused') return;

        setPomodoroMode(mode);

        if (mode === 'shortBreak') {
            setBreakDuration(settings.pomodoroShortBreak);
            setTargetMinutes(settings.pomodoroShortBreak);
        } else if (mode === 'longBreak') {
            setBreakDuration(settings.pomodoroLongBreak);
            setTargetMinutes(settings.pomodoroLongBreak);
        } else {
            setTargetMinutes(settings.pomodoroWorkDuration);
        }
    };

    const handleSkipBreak = () => {
        if (sessionId && status === 'break') {
            const taken = Math.max(0, Math.round((breakDuration * 60 - breakSeconds) / 60));
            apiCall(`/api/session/${sessionId}/break`, 'POST', { duration: taken }).catch(() => {});
        }
        setBreakSeconds(0);
        setBreakDuration(0);
        setPomodoroMode('pomodoro');
        setTargetMinutes(settings.pomodoroWorkDuration);
        setStatus(completionData ? 'completed' : 'idle');
    };

    const handleGoalFinished = () => {
        setPomodoroMode('pomodoro');
        setTargetMinutes(settings.pomodoroWorkDuration);
        setStatus('idle');
        setSessionId(null);
        setElapsedSeconds(0);
        setBreakSeconds(0);
        setBreakDuration(0);
        setCustomGoal('');
        setLinkedTask(null);
        setError(null);
        setCompletionData(null);
    };

    const handleMarkTaskDone = async () => {
        if (linkedTask) {
            try {
                await fetch(`/api/tasks/${linkedTask.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isChecked: true }),
                });
                playTickSound();
                setTaskDoneSignal(prev => prev + 1);
                showToast({
                    title: `${STRATEGY_LABEL[strategy] ?? 'Session'} Complete`,
                    message: `"${linkedTask.title}" marked as done`,
                    strategy,
                });
            } catch {
                // silently fail — session still resets
            }
        }
        handleGoalFinished();
    };

    const getRemainingSeconds = () => {
        if (strategy !== 'pomodoro' && strategy !== 'time_blocking') return null;
        return Math.max(0, targetMinutes * 60 - elapsedSeconds);
    };

    const dismissError = () => setError(null);
    const closeConfirmModal = () => setShowConfirmModal(false);

    const value = {
        // State
        strategy,
        pomodoroSeriousMode: settings.pomodoroSeriousMode,
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
        linkedTask,
        setLinkedTask,
        taskDoneSignal,
        flowPauseSeconds,
        sessionEndSignal,
        handleMarkTaskDone,

        // Handlers
        handleStart,
        handlePause,
        handleResume,
        handleComplete,
        handleInterrupt,
        confirmInterrupt,
        handleBreakEnd,
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
