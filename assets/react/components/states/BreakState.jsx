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
    linkedTask,
    loading,
    onModeChange,
    onSkipBreak,
    onContinue,
    onGoalFinished,
    onMarkTaskDone,
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
                strategy === 'pomodoro' && (
                    <TimerPreview
                        mode={pomodoroMode}
                        minutes={targetMinutes}
                    />
                )
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
                                strategy === 'flowtime' ? 'Start New Flowtime' :
                                strategy === 'time_blocking' ? 'Start New Time Block' :
                                pomodoroMode === 'pomodoro' ? 'Start New Pomodoro' :
                                pomodoroMode === 'longBreak' ? 'Start Long Break' :
                                'Start Short Break'
                            )}
                        </button>
                        {linkedTask ? (
                            <button
                                className="btn btn-success"
                                onClick={onMarkTaskDone}
                                disabled={loading}
                            >
                                ✓ Task Done
                            </button>
                        ) : (
                            <button
                                className="btn btn-secondary"
                                onClick={onGoalFinished}
                                disabled={loading}
                            >
                                Goal Finished
                            </button>
                        )}
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
    linkedTask: PropTypes.shape({ id: PropTypes.string, title: PropTypes.string }),
    loading: PropTypes.bool.isRequired,
    onModeChange: PropTypes.func.isRequired,
    onSkipBreak: PropTypes.func.isRequired,
    onContinue: PropTypes.func.isRequired,
    onGoalFinished: PropTypes.func.isRequired,
    onMarkTaskDone: PropTypes.func.isRequired,
};

BreakState.defaultProps = {
    customGoal: '',
    linkedTask: null,
};

export default BreakState;
