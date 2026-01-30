import React from 'react';
import PropTypes from 'prop-types';
import PomodoroModeSelector from '../PomodoroModeSelector';
import TimerPreview from '../TimerPreview';
import StrategySelector from '../StrategySelector';

function IdleState({
    strategy,
    pomodoroMode,
    targetMinutes,
    customGoal,
    loading,
    compact,
    goalInputRef,
    onModeChange,
    onMinutesChange,
    onGoalChange,
    onStart,
    onStrategyChange,
}) {
    return (
        <div className="session-idle">
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
                    editable={pomodoroMode === 'pomodoro'}
                    onMinutesChange={onMinutesChange}
                />
            )}

            {pomodoroMode === 'pomodoro' && (
                <div className="session-config">
                    <div className="config-field">
                        <label htmlFor="goal">Goal (optional, but very recommended!)</label>
                        <input
                            id="goal"
                            type="text"
                            placeholder="What are you working on?"
                            value={customGoal}
                            onChange={(e) => onGoalChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !loading) {
                                    onStart();
                                }
                            }}
                            ref={goalInputRef}
                        />
                    </div>
                </div>
            )}

            <div className={`start-session-sticky${compact ? ' compact' : ''}`}>
                <button
                    className={`btn btn-large ${pomodoroMode === 'pomodoro' ? 'btn-primary' : 'btn-success'}`}
                    onClick={onStart}
                    disabled={loading}
                >
                    {loading ? 'Starting...' : (pomodoroMode === 'pomodoro' ? 'Start Session' : 'Start Break')}
                </button>
            </div>

            <StrategySelector
                selected={strategy}
                onSelect={onStrategyChange}
                compact={compact}
            />
        </div>
    );
}

IdleState.propTypes = {
    strategy: PropTypes.string.isRequired,
    pomodoroMode: PropTypes.string.isRequired,
    targetMinutes: PropTypes.number.isRequired,
    customGoal: PropTypes.string.isRequired,
    loading: PropTypes.bool.isRequired,
    compact: PropTypes.bool.isRequired,
    goalInputRef: PropTypes.object,
    onModeChange: PropTypes.func.isRequired,
    onMinutesChange: PropTypes.func.isRequired,
    onGoalChange: PropTypes.func.isRequired,
    onStart: PropTypes.func.isRequired,
    onStrategyChange: PropTypes.func.isRequired,
};

export default IdleState;
