import React, { useState } from 'react';
import PropTypes from 'prop-types';
import PomodoroModeSelector from '../PomodoroModeSelector';
import TimerPreview from '../TimerPreview';
import StrategySelector from '../StrategySelector';
import SquareTimer from '../SquareTimer';

function IdleState({
    strategy,
    pomodoroMode,
    targetMinutes,
    customGoal,
    linkedTask,
    loading,
    compact,
    goalInputRef,
    onModeChange,
    onMinutesChange,
    onGoalChange,
    onTaskDrop,
    onUnlinkTask,
    onStart,
    onStrategyChange,
}) {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e) => {
        if (!e.dataTransfer.types.includes('taskid')) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'link';
        setIsDragOver(true);
    };

    const handleDragLeave = () => setIsDragOver(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const taskId = e.dataTransfer.getData('taskId');
        const taskTitle = e.dataTransfer.getData('taskTitle');
        if (taskId && taskTitle) onTaskDrop({ id: taskId, title: taskTitle });
    };

    return (
        <div
            className={`session-idle${isDragOver ? ' task-drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
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

            {strategy !== 'pomodoro' && <div className="mode-selector-spacer" />}

            {strategy === 'flowtime' && (
                <SquareTimer chars={['F','L','O','W']} idle />
            )}
            {strategy === 'time_blocking' && (
                <SquareTimer chars={['B','L','O','C']} idle color="#a07040" bgColor="#fdf5ee" />
            )}

            {(strategy !== 'pomodoro' || pomodoroMode === 'pomodoro') && (
                <div className="session-config">
                    <div className="config-field">
                        <label htmlFor="goal">Goal (optional, but very recommended!)</label>
                        <div className={`goal-input-wrapper${linkedTask ? ' linked' : ''}`}>
                            <input
                                id="goal"
                                type="text"
                                placeholder="What are you working on?"
                                value={customGoal}
                                readOnly={!!linkedTask}
                                onChange={(e) => !linkedTask && onGoalChange(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !loading && !linkedTask) onStart();
                                }}
                                ref={goalInputRef}
                            />
                            {linkedTask && (
                                <button
                                    className="linked-task-unlink"
                                    onClick={onUnlinkTask}
                                    title="Remove linked task"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className={`task-drop-zone${isDragOver ? ' drag-over' : ''}${linkedTask ? ' hidden' : ''}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>or drag a task here</span>
                    </div>
                </div>
            )}

            <div className={`start-session-sticky${compact ? ' compact' : ''}`}>
                <button
                    className={`btn btn-large ${strategy === 'pomodoro' && pomodoroMode !== 'pomodoro' ? 'btn-success' : 'btn-primary'}`}
                    onClick={onStart}
                    disabled={loading}
                >
                    {loading ? 'Starting...' : (strategy === 'pomodoro' && pomodoroMode !== 'pomodoro' ? 'Start Break' : 'Start Session')}
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
    linkedTask: PropTypes.shape({ id: PropTypes.string, title: PropTypes.string }),
    loading: PropTypes.bool.isRequired,
    compact: PropTypes.bool.isRequired,
    goalInputRef: PropTypes.object,
    onModeChange: PropTypes.func.isRequired,
    onMinutesChange: PropTypes.func.isRequired,
    onGoalChange: PropTypes.func.isRequired,
    onTaskDrop: PropTypes.func.isRequired,
    onUnlinkTask: PropTypes.func.isRequired,
    onStart: PropTypes.func.isRequired,
    onStrategyChange: PropTypes.func.isRequired,
};

export default IdleState;
