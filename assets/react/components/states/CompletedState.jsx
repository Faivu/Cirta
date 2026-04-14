import React from 'react';
import PropTypes from 'prop-types';
import PomodoroModeSelector from '../PomodoroModeSelector';
import TimerPreview from '../TimerPreview';
import SquareTimer from '../SquareTimer';
import { TimeBlockingPicker } from './IdleState';


function CompletedState({
    strategy,
    pomodoroMode,
    targetMinutes,
    customGoal,
    linkedTask,
    loading,
    completionData,
    onModeChange,
    onMinutesChange,
    onContinue,
    onGoalFinished,
    onMarkTaskDone,
    onChangeGoal,
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

            {strategy !== 'pomodoro' && <div className="mode-selector-spacer" />}

            {strategy === 'flowtime' && (
                <SquareTimer chars={['F','L','O','W']} idle />
            )}
            {strategy === 'time_blocking' && (
                <TimeBlockingPicker targetMinutes={targetMinutes} onMinutesChange={onMinutesChange} />
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
                    className={`btn ${
                        strategy === 'flowtime'      ? 'btn-primary' :
                        strategy === 'time_blocking' ? 'btn-timeblock' :
                        pomodoroMode === 'pomodoro'  ? 'btn-pomodoro' :
                        'btn-success'
                    }`}
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
                <button
                    className="btn btn-secondary"
                    onClick={onChangeGoal}
                    disabled={loading}
                >
                    Return to Strategies
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
    linkedTask: PropTypes.shape({ id: PropTypes.string, title: PropTypes.string }),
    loading: PropTypes.bool.isRequired,
    completionData: PropTypes.object,
    onModeChange: PropTypes.func.isRequired,
    onMinutesChange: PropTypes.func.isRequired,
    onContinue: PropTypes.func.isRequired,
    onGoalFinished: PropTypes.func.isRequired,
    onMarkTaskDone: PropTypes.func.isRequired,
    onChangeGoal: PropTypes.func.isRequired,
};

CompletedState.defaultProps = {
    customGoal: '',
    linkedTask: null,
    completionData: null,
};

export default CompletedState;
