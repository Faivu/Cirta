import React from 'react';
import PropTypes from 'prop-types';
import SquareTimer from './SquareTimer';

/**
 * Timer - Displays the session timer with circular progress
 *
 * Props:
 * - elapsedSeconds: total seconds elapsed
 * - remainingSeconds: seconds remaining (for countdown modes)
 * - mode: 'pomodoro', 'flowtime', 'time_blocking', or 'break'
 * - isPaused: whether the timer is paused
 */
function Timer({ elapsedSeconds, remainingSeconds, mode, isPaused }) {
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

    const hasCountdown = mode === 'pomodoro' || mode === 'break' || mode === 'time_blocking';
    const isFlow = mode === 'flowtime';
    const isTimeBlocking = mode === 'time_blocking';

    // Calculate progress percentage for countdown modes
    const getProgress = () => {
        if (!hasCountdown || remainingSeconds === null) return null;
        const total = elapsedSeconds + remainingSeconds;
        return total > 0 ? (elapsedSeconds / total) * 100 : 0;
    };

    const progress = getProgress();

    // Determine which time to display prominently
    const displayTime = hasCountdown && remainingSeconds !== null
        ? remainingSeconds
        : elapsedSeconds;

    // Split time string into individual chars for SquareTimer
    const timeToChars = (totalSeconds) => {
        const formatted = formatTime(totalSeconds);
        return formatted.replace(/:/g, '').split('');
    };

    if (isFlow) {
        return (
            <div className={`timer mode-flowtime ${isPaused ? 'paused' : ''}`}>
                <SquareTimer chars={timeToChars(displayTime)} isPaused={isPaused} />
            </div>
        );
    }

    if (isTimeBlocking) {
        const isLong = displayTime >= 3600;
        const tbChars = isLong
            ? (() => {
                const h = Math.floor(displayTime / 3600);
                const m = Math.floor((displayTime % 3600) / 60);
                return `${String(h).padStart(2, '0')}${String(m).padStart(2, '0')}`.split('');
            })()
            : timeToChars(displayTime);
        const tbLabels = isLong ? ['hrs', 'min'] : ['min', 'sec'];
        return (
            <div className={`timer mode-time_blocking ${isPaused ? 'paused' : ''}`}>
                <SquareTimer chars={tbChars} isPaused={isPaused} color="var(--tb-digit-color)" bgColor="var(--tb-digit-bg)" labels={tbLabels} />
            </div>
        );
    }

    // Determine CSS class for the timer (for different colors)
    const timerClass = `timer ${mode === 'break' ? 'break-mode' : ''} ${isPaused ? 'paused' : ''}`;

    return (
        <div className={timerClass}>
            {hasCountdown && progress !== null && (
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
                        className={`timer-progress-bar ${mode === 'break' ? 'break' : ''}`}
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
                <span className="timer-time">{formatTime(displayTime)}</span>
                {isPaused && <span className="timer-paused-indicator">PAUSED</span>}
            </div>
        </div>
    );
}

Timer.propTypes = {
    elapsedSeconds: PropTypes.number.isRequired,
    remainingSeconds: PropTypes.number,
    mode: PropTypes.oneOf(['pomodoro', 'flowtime', 'time_blocking', 'break']).isRequired,
    isPaused: PropTypes.bool,
};

Timer.defaultProps = {
    remainingSeconds: null,
    isPaused: false,
};

export default Timer;
