import React from 'react';
import PropTypes from 'prop-types';
import PomodoroModeSelector from '../PomodoroModeSelector';
import Timer from '../Timer';
import SessionControls from '../SessionControls';

const formatPause = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
};

function ActiveState({
    strategy,
    status,
    pomodoroMode,
    elapsedSeconds,
    remainingSeconds,
    customGoal,
    loading,
    flowPauseSeconds,
    onModeChange,
    onPause,
    onResume,
    onComplete,
    onInterrupt,
}) {
    const showPauseBanner = strategy === 'flowtime' && status === 'paused' && flowPauseSeconds > 0;

    return (
        <div className="session-active">
            {strategy === 'pomodoro' ? (
                <PomodoroModeSelector
                    mode={pomodoroMode}
                    onChange={onModeChange}
                    disabled
                />
            ) : (
                <div className="mode-selector-spacer" />
            )}

            <Timer
                elapsedSeconds={elapsedSeconds}
                remainingSeconds={remainingSeconds}
                mode={strategy}
                isPaused={status === 'paused'}
            />

            {showPauseBanner && (
                <div className="flowtime-pause-banner">
                    <span className="flowtime-pause-label">Paused for </span>
                    <span className="flowtime-pause-time">{formatPause(flowPauseSeconds)}</span>
                    <span className="flowtime-pause-label">, this is technically a break time!</span>
                </div>
            )}

            {customGoal && (
                <div className="current-goal">
                    {customGoal}
                </div>
            )}

            <SessionControls
                strategy={strategy}
                status={status}
                loading={loading}
                onPause={onPause}
                onResume={onResume}
                onComplete={onComplete}
                onInterrupt={onInterrupt}
            />
        </div>
    );
}

ActiveState.propTypes = {
    strategy: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['running', 'paused']).isRequired,
    pomodoroMode: PropTypes.string.isRequired,
    elapsedSeconds: PropTypes.number.isRequired,
    remainingSeconds: PropTypes.number,
    customGoal: PropTypes.string.isRequired,
    loading: PropTypes.bool.isRequired,
    flowPauseSeconds: PropTypes.number,
    onModeChange: PropTypes.func.isRequired,
    onPause: PropTypes.func.isRequired,
    onResume: PropTypes.func.isRequired,
    onComplete: PropTypes.func.isRequired,
    onInterrupt: PropTypes.func.isRequired,
};

ActiveState.defaultProps = {
    remainingSeconds: null,
    flowPauseSeconds: 0,
};

export default ActiveState;
