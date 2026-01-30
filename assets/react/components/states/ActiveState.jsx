import React from 'react';
import PropTypes from 'prop-types';
import PomodoroModeSelector from '../PomodoroModeSelector';
import Timer from '../Timer';
import SessionControls from '../SessionControls';

function ActiveState({
    strategy,
    status,
    pomodoroMode,
    elapsedSeconds,
    remainingSeconds,
    customGoal,
    loading,
    onModeChange,
    onPause,
    onResume,
    onComplete,
    onInterrupt,
}) {
    return (
        <div className="session-active">
            {strategy === 'pomodoro' && (
                <PomodoroModeSelector
                    mode={pomodoroMode}
                    onChange={onModeChange}
                    disabled
                />
            )}

            <Timer
                elapsedSeconds={elapsedSeconds}
                remainingSeconds={remainingSeconds}
                mode={strategy}
                isPaused={status === 'paused'}
            />

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
    onModeChange: PropTypes.func.isRequired,
    onPause: PropTypes.func.isRequired,
    onResume: PropTypes.func.isRequired,
    onComplete: PropTypes.func.isRequired,
    onInterrupt: PropTypes.func.isRequired,
};

ActiveState.defaultProps = {
    remainingSeconds: null,
};

export default ActiveState;
