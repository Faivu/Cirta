import React, { useState } from 'react';
import PropTypes from 'prop-types';
import PomodoroModeSelector from '../PomodoroModeSelector';
import TimerPreview from '../TimerPreview';
import StrategySelector from '../StrategySelector';
import SquareTimer from '../SquareTimer';

const TB_DIGIT_STYLE = { color: '#e9a008', borderColor: '#e9a008', background: '#fffbeb' };
const TB_SEP_STYLE   = { color: '#e9a008' };

const START_ACTIONS = {
    pomodoro:      { label: 'Start Pomodoro',   btnClass: 'btn-pomodoro'  },
    flowtime:      { label: 'Start Flowtime',    btnClass: 'btn-primary'   },
    time_blocking: { label: 'Start Time Block',  btnClass: 'btn-timeblock' },
};
const BREAK_ACTION = { label: 'Start Break', btnClass: 'btn-success' };

function getStartAction(strategy, pomodoroMode) {
    if (strategy === 'pomodoro' && pomodoroMode !== 'pomodoro') return BREAK_ACTION;
    return START_ACTIONS[strategy] ?? { label: 'Start Session', btnClass: 'btn-primary' };
}

function TimeBlockingPicker({ targetMinutes, onMinutesChange }) {
    const hours = Math.floor(targetMinutes / 60);
    const mins  = targetMinutes % 60;

    const [editingH, setEditingH] = useState(false);
    const [editingM, setEditingM] = useState(false);
    const [hVal, setHVal] = useState('');
    const [mVal, setMVal] = useState('');

    const changeHours = (delta) => {
        const h = Math.max(0, Math.min(23, hours + delta));
        onMinutesChange(Math.max(1, h * 60 + mins));
    };

    const changeMins = (delta) => {
        let m = mins + delta;
        let h = hours;
        if (m >= 60) { h = Math.min(23, h + 1); m -= 60; }
        if (m < 0)   { if (h > 0) { h -= 1; m += 60; } else { m = 0; } }
        onMinutesChange(Math.max(1, h * 60 + m));
    };

    const startEditH = () => { setHVal(String(hours)); setEditingH(true); };
    const commitH = () => {
        const h = Math.max(0, Math.min(23, parseInt(hVal, 10) || 0));
        onMinutesChange(Math.max(1, h * 60 + mins));
        setEditingH(false);
    };

    const startEditM = () => { setMVal(String(mins)); setEditingM(true); };
    const commitM = () => {
        const m = Math.max(0, Math.min(59, parseInt(mVal, 10) || 0));
        onMinutesChange(Math.max(1, hours * 60 + m));
        setEditingM(false);
    };

    const chevUp   = <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>;
    const chevDown = <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>;

    return (
        <div className="time-block-picker">
            {/* Hours group */}
            <div className="tbp-group">
                <div className="tbp-arrow-row" style={editingH ? {visibility:'hidden'} : undefined}>
                    <div className="tbp-spacer" />
                    <button type="button" className="time-block-step" onClick={() => changeHours(1)}>{chevUp}</button>
                </div>
                {editingH ? (
                    <input
                        type="number"
                        className="tbp-edit-input"
                        value={hVal}
                        min="0" max="23"
                        onChange={e => setHVal(e.target.value)}
                        onBlur={commitH}
                        onKeyDown={e => { if (e.key === 'Enter') commitH(); if (e.key === 'Escape') setEditingH(false); }}
                        autoFocus
                    />
                ) : (
                    <div className="square-timer-group tbp-clickable" onClick={startEditH}>
                        <div className="square-timer-digit" style={TB_DIGIT_STYLE}>{Math.floor(hours / 10)}</div>
                        <div className="square-timer-digit" style={TB_DIGIT_STYLE}>{hours % 10}</div>
                    </div>
                )}
                <div className="tbp-arrow-row" style={editingH ? {visibility:'hidden'} : undefined}>
                    <div className="tbp-spacer" />
                    <button type="button" className="time-block-step" onClick={() => changeHours(-1)}>{chevDown}</button>
                </div>
                {!editingH && <span className="tbp-edit-hint">hrs</span>}
            </div>

            <span className="square-timer-separator" style={TB_SEP_STYLE}>:</span>

            {/* Minutes group */}
            <div className="tbp-group">
                <div className="tbp-arrow-row" style={editingM ? {visibility:'hidden'} : undefined}>
                    <div className="tbp-spacer" />
                    <button type="button" className="time-block-step" onClick={() => changeMins(1)}>{chevUp}</button>
                </div>
                {editingM ? (
                    <input
                        type="number"
                        className="tbp-edit-input"
                        value={mVal}
                        min="0" max="59"
                        onChange={e => setMVal(e.target.value)}
                        onBlur={commitM}
                        onKeyDown={e => { if (e.key === 'Enter') commitM(); if (e.key === 'Escape') setEditingM(false); }}
                        autoFocus
                    />
                ) : (
                    <div className="square-timer-group tbp-clickable" onClick={startEditM}>
                        <div className="square-timer-digit" style={TB_DIGIT_STYLE}>{Math.floor(mins / 10)}</div>
                        <div className="square-timer-digit" style={TB_DIGIT_STYLE}>{mins % 10}</div>
                    </div>
                )}
                <div className="tbp-arrow-row" style={editingM ? {visibility:'hidden'} : undefined}>
                    <div className="tbp-spacer" />
                    <button type="button" className="time-block-step" onClick={() => changeMins(-1)}>{chevDown}</button>
                </div>
                {!editingM && <span className="tbp-edit-hint">min</span>}
            </div>
        </div>
    );
}

TimeBlockingPicker.propTypes = {
    targetMinutes: PropTypes.number.isRequired,
    onMinutesChange: PropTypes.func.isRequired,
};

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
                <TimeBlockingPicker targetMinutes={targetMinutes} onMinutesChange={onMinutesChange} />
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
                {(() => {
                    const { label, btnClass } = getStartAction(strategy, pomodoroMode);
                    return (
                        <button
                            className={`btn btn-large ${btnClass}`}
                            onClick={onStart}
                            disabled={loading || (strategy === 'time_blocking' && targetMinutes < 1)}
                        >
                            {loading ? 'Starting...' : label}
                        </button>
                    );
                })()}
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
