import React from 'react';
import PropTypes from 'prop-types';
import PomodoroModeSelector from '../PomodoroModeSelector';
import TimerPreview from '../TimerPreview';

function CompletedState({
    strategy,
    pomodoroMode,
    targetMinutes,
    customGoal,
    loading,
    completionData,
    onModeChange,
    onContinue,
    onGoalFinished,
}) {
    const noBreakAvailable = strategy === 'flowtime' && !completionData?.suggestedBreakDuration;

    return (
        <div className="session-completed">
            {strategy === 'pomodoro' && (
                <PomodoroModeSelector
                    mode={pomodoroMode}
                    onChange={onModeChange}
                />
            )}

            {strategy === 'pomodoro' && (
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

            {noBreakAvailable && (
                <p className="no-break-message">Your session was too short for a break.</p>
            )}

            <div className="completion-actions">
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
                <button
                    className="btn btn-secondary"
                    onClick={onGoalFinished}
                    disabled={loading}
                >
                    Goal Finished
                </button>
            </div>
        </div>
    );
}

CompletedState.propTypes = {
    strategy: PropTypes.string.isRequired,
    pomodoroMode: PropTypes.string.isRequired,
    targetMinutes: PropTypes.number.isRequired,
    customGoal: PropTypes.string,
    loading: PropTypes.bool.isRequired,
    completionData: PropTypes.object,
    onModeChange: PropTypes.func.isRequired,
    onContinue: PropTypes.func.isRequired,
    onGoalFinished: PropTypes.func.isRequired,
};

CompletedState.defaultProps = {
    customGoal: '',
    completionData: null,
};

export default CompletedState;
