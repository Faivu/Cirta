import React from 'react';
import PropTypes from 'prop-types';

/**
 * Timer - Displays the session timer
 *
 * Props:
 * - elapsedSeconds: total seconds elapsed
 * - remainingSeconds: seconds remaining (for Pomodoro, null for others)
 * - strategy: current strategy type
 * - isPaused: whether the session is paused
 */
function Timer({ elapsedSeconds, remainingSeconds, strategy, isPaused }) {
    // Format seconds into MM:SS or HH:MM:SS
    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Calculate progress percentage for Pomodoro
    const getProgress = () => {
        if (strategy !== 'pomodoro' || remainingSeconds === null) return null;
        const total = elapsedSeconds + remainingSeconds;
        return total > 0 ? (elapsedSeconds / total) * 100 : 0;
    };

    const progress = getProgress();

    // Determine which time to display prominently
    const displayTime = strategy === 'pomodoro' && remainingSeconds !== null
        ? remainingSeconds
        : elapsedSeconds;

    const displayLabel = strategy === 'pomodoro'
        ? 'Remaining'
        : 'Elapsed';

    return (
        <div className={`timer ${isPaused ? 'paused' : ''}`}>
            {/* Progress ring for Pomodoro */}
            {strategy === 'pomodoro' && progress !== null && (
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
                        className="timer-progress-bar"
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        strokeWidth="8"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                        transform="rotate(-90 50 50)"
                    />
                </svg>
            )}

            <div className="timer-display">
                <span className="timer-label">{displayLabel}</span>
                <span className="timer-time">{formatTime(displayTime)}</span>
                {isPaused && <span className="timer-paused-indicator">PAUSED</span>}
            </div>

            {/* Show elapsed time for Pomodoro as secondary info */}
            {strategy === 'pomodoro' && (
                <div className="timer-secondary">
                    Elapsed: {formatTime(elapsedSeconds)}
                </div>
            )}
        </div>
    );
}

Timer.propTypes = {
    elapsedSeconds: PropTypes.number.isRequired,
    remainingSeconds: PropTypes.number,
    strategy: PropTypes.oneOf(['pomodoro', 'flowtime', 'free_session']).isRequired,
    isPaused: PropTypes.bool,
};

Timer.defaultProps = {
    remainingSeconds: null,
    isPaused: false,
};

export default Timer;
