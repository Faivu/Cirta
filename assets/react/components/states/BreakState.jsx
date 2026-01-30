import React from 'react';
import PropTypes from 'prop-types';
import PomodoroModeSelector from '../PomodoroModeSelector';
import Timer from '../Timer';
import TimerPreview from '../TimerPreview';

function BreakState({
    strategy,
    pomodoroMode,
    targetMinutes,
    breakSeconds,
    breakDuration,
    customGoal,
    loading,
    onModeChange,
    onSkipBreak,
    onContinue,
    onGoalFinished,
}) {
    const isBreakActive = breakSeconds > 0;

    return (
        <div className="session-break">
            {strategy === 'pomodoro' && (
                <PomodoroModeSelector
                    mode={pomodoroMode}
                    onChange={onModeChange}
                    disabled={isBreakActive}
                />
            )}

            {isBreakActive ? (
                <Timer
                    elapsedSeconds={(breakDuration || 5) * 60 - breakSeconds}
                    remainingSeconds={breakSeconds}
                    mode="break"
                    isPaused={false}
                />
            ) : (
                <TimerPreview
                    mode={pomodoroMode}
                    minutes={targetMinutes}
                />
            )}

            {customGoal && (
                <div className="current-goal">
                    {customGoal}
                </div>
            )}

            <div className="break-actions">
                {isBreakActive ? (
                    <button
                        className="btn btn-secondary"
                        onClick={onSkipBreak}
                        disabled={loading}
                    >
                        Skip Break
                    </button>
                ) : (
                    <>
                        <button
                            className={`btn ${pomodoroMode === 'pomodoro' ? 'btn-primary' : 'btn-success'}`}
                            onClick={onContinue}
                            disabled={loading}
                        >
                            {loading ? 'Starting...' : (
                                pomodoroMode === 'pomodoro' ? 'Start Pomodoro' :
                                pomodoroMode === 'longBreak' ? 'Start Long Break' :
                                'Start Short Break'
                            )}
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={onGoalFinished}
                            disabled={loading}
                        >
                            Goal Finished
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

BreakState.propTypes = {
    strategy: PropTypes.string.isRequired,
    pomodoroMode: PropTypes.string.isRequired,
    targetMinutes: PropTypes.number.isRequired,
    breakSeconds: PropTypes.number.isRequired,
    breakDuration: PropTypes.number.isRequired,
    customGoal: PropTypes.string,
    loading: PropTypes.bool.isRequired,
    onModeChange: PropTypes.func.isRequired,
    onSkipBreak: PropTypes.func.isRequired,
    onContinue: PropTypes.func.isRequired,
    onGoalFinished: PropTypes.func.isRequired,
};

BreakState.defaultProps = {
    customGoal: '',
};

export default BreakState;
