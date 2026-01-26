import React from 'react';

/**
 * SessionControls - Buttons to control the session (pause, resume, complete, interrupt)
 *
 * Props:
 * - strategy: current strategy type
 * - status: current session status ('running', 'paused')
 * - loading: whether an API call is in progress
 * - onPause: callback for pause button
 * - onResume: callback for resume button
 * - onComplete: callback for complete button
 * - onInterrupt: callback for interrupt/stop button
 */
function SessionControls({ strategy, status, loading, onPause, onResume, onComplete, onInterrupt }) {
    return (
        <div className="session-controls">
            {/* Pomodoro has pause/resume */}
            {strategy === 'pomodoro' && (
                <>
                    {status === 'running' ? (
                        <button
                            className="btn btn-secondary"
                            onClick={onPause}
                            disabled={loading}
                        >
                            Pause
                        </button>
                    ) : (
                        <button
                            className="btn btn-primary"
                            onClick={onResume}
                            disabled={loading}
                        >
                            Resume
                        </button>
                    )}
                </>
            )}

            {/* Flowtime and FreeSession can complete anytime */}
            {(strategy === 'flowtime' || strategy === 'free_session') && (
                <button
                    className="btn btn-success"
                    onClick={onComplete}
                    disabled={loading}
                >
                    {loading ? 'Completing...' : 'Complete Session'}
                </button>
            )}

            {/* All strategies can be interrupted */}
            <button
                className="btn btn-danger"
                onClick={onInterrupt}
                disabled={loading}
            >
                Stop
            </button>
        </div>
    );
}

export default SessionControls;
