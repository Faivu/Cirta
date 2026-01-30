import React from 'react';
import PropTypes from 'prop-types';

/**
 * TimerPreview - Reusable timer circle preview component
 * Shows a static timer circle with configurable mode and time
 */
function TimerPreview({ mode, minutes, editable, onMinutesChange }) {
    const isBreak = mode === 'shortBreak' || mode === 'longBreak';
    const displayMinutes = mode === 'shortBreak' ? 5 : mode === 'longBreak' ? 15 : minutes;

    return (
        <div className={`timer preview${isBreak ? ' break-mode' : ''}`}>
            <svg className="timer-progress" viewBox="0 0 100 100">
                <circle
                    className="timer-progress-bg"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    strokeWidth="8"
                />
                <circle
                    className={`timer-progress-bar full${isBreak ? ' break' : ''}`}
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset="0"
                    transform="rotate(-90 50 50)"
                />
            </svg>
            <div className="timer-display">
                {editable && mode === 'pomodoro' ? (
                    <span className="timer-time editable">
                        <input
                            type="number"
                            className="timer-time-input"
                            value={minutes}
                            onChange={(e) => onMinutesChange(Math.max(1, Math.min(120, parseInt(e.target.value) || 1)))}
                            min="1"
                            max="120"
                        />
                        <span className="timer-time-separator">:</span>
                        <span className="timer-time-seconds">00</span>
                    </span>
                ) : (
                    <span className="timer-time">
                        {displayMinutes.toString().padStart(2, '0')}:00
                    </span>
                )}
            </div>
        </div>
    );
}

TimerPreview.propTypes = {
    mode: PropTypes.oneOf(['pomodoro', 'shortBreak', 'longBreak']).isRequired,
    minutes: PropTypes.number,
    editable: PropTypes.bool,
    onMinutesChange: PropTypes.func,
};

TimerPreview.defaultProps = {
    minutes: 25,
    editable: false,
    onMinutesChange: () => {},
};

export default TimerPreview;
