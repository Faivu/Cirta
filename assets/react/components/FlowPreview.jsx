import React from 'react';

/**
 * FlowPreview: Static ring preview for Flowtime and TimeBlocking strategies, for now
 * Shows the same circular ring aesthetic as TimerPreview but with a label for flowtime
 */
function FlowPreview({ label = 'Flow' }) {
    return (
        <div className="timer preview flow-preview">
            <svg className="timer-progress" viewBox="0 0 100 100">
                <circle
                    className="timer-progress-bg flow"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    strokeWidth="8"
                />
                <circle
                    className="timer-progress-bar flow full"
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
                <span className="timer-time flow-label">{label}</span>
            </div>
        </div>
    );
}

export default FlowPreview;
