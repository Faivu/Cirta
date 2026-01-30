import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from './ConfirmModal';
import { IdleState, ActiveState, CompletedState, BreakState } from './states';
import { useSession } from '../context/SessionContext';

/**
 * SessionApp - Main component for the session timer
 * Now uses SessionContext for state management
 */
function SessionApp({ compact = false, onFullscreen = null }) {
    const {
        // State
        strategy,
        status,
        elapsedSeconds,
        targetMinutes,
        breakSeconds,
        breakDuration,
        customGoal,
        pomodoroMode,
        error,
        loading,
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
        handleModeChange,
        handleSkipBreak,
        handleGoalFinished,
        getRemainingSeconds,
        dismissError,
        closeConfirmModal,
    } = useSession();

    const goalInputRef = useRef(null);

    // Focus goal input after finishing
    const handleGoalFinishedWithFocus = () => {
        handleGoalFinished();
        setTimeout(() => goalInputRef.current?.focus(), 0);
    };

    return (
        <div className={`session-container${compact ? ' compact' : ''}`}>
            {compact && onFullscreen && (
                <button
                    className="session-fullscreen-toggle"
                    onClick={onFullscreen}
                    title="Open fullscreen"
                >
                    ⛶
                </button>
            )}

            {error && (
                <div className="error-message">
                    {error}
                    <button onClick={dismissError} className="error-close">&times;</button>
                </div>
            )}

            {status === 'idle' && (
                <IdleState
                    strategy={strategy}
                    pomodoroMode={pomodoroMode}
                    targetMinutes={targetMinutes}
                    customGoal={customGoal}
                    loading={loading}
                    goalInputRef={goalInputRef}
                    compact={compact}
                    onModeChange={handleModeChange}
                    onMinutesChange={setTargetMinutes}
                    onGoalChange={setCustomGoal}
                    onStart={handleStart}
                    onStrategyChange={setStrategy}
                />
            )}

            {(status === 'running' || status === 'paused') && (
                <ActiveState
                    strategy={strategy}
                    status={status}
                    pomodoroMode={pomodoroMode}
                    elapsedSeconds={elapsedSeconds}
                    remainingSeconds={getRemainingSeconds()}
                    customGoal={customGoal}
                    loading={loading}
                    onModeChange={handleModeChange}
                    onPause={handlePause}
                    onResume={handleResume}
                    onComplete={handleComplete}
                    onInterrupt={handleInterrupt}
                />
            )}

            {status === 'completed' && (
                <CompletedState
                    strategy={strategy}
                    pomodoroMode={pomodoroMode}
                    targetMinutes={targetMinutes}
                    customGoal={customGoal}
                    loading={loading}
                    onModeChange={handleModeChange}
                    onContinue={handleContinue}
                    onGoalFinished={handleGoalFinishedWithFocus}
                />
            )}

            {status === 'break' && (
                <BreakState
                    strategy={strategy}
                    pomodoroMode={pomodoroMode}
                    targetMinutes={targetMinutes}
                    breakSeconds={breakSeconds}
                    breakDuration={breakDuration}
                    customGoal={customGoal}
                    loading={loading}
                    onModeChange={handleModeChange}
                    onSkipBreak={handleSkipBreak}
                    onContinue={handleContinue}
                    onGoalFinished={handleGoalFinishedWithFocus}
                />
            )}

            <ConfirmModal
                isOpen={showConfirmModal}
                title="End Session"
                message="Are you sure you want to end this session? Your progress will be saved if you worked for one minute or more."
                confirmText="End"
                cancelText="Continue Working"
                onConfirm={confirmInterrupt}
                onCancel={closeConfirmModal}
            />
        </div>
    );
}

SessionApp.propTypes = {
    compact: PropTypes.bool,
    onFullscreen: PropTypes.func,
};

SessionApp.defaultProps = {
    compact: false,
    onFullscreen: null,
};

export default SessionApp;
