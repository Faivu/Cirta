import React from 'react';
import PropTypes from 'prop-types';

/**
 * SessionControls: Buttons to control the session (pause, resume, complete, interrupt)
 */
function SessionControls({ strategy, status, loading, onPause, onResume, onComplete, onInterrupt }) {
    return (
        <div className="session-controls">
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

            <button
                className="btn btn-danger"
                onClick={onInterrupt}
                disabled={loading}
            >
                End
            </button>
        </div>
    );
}

SessionControls.propTypes = {
    strategy: PropTypes.oneOf(['pomodoro', 'flowtime', 'time_blocking']).isRequired,
    status: PropTypes.oneOf(['running', 'paused']).isRequired,
    loading: PropTypes.bool,
    onPause: PropTypes.func.isRequired,
    onResume: PropTypes.func.isRequired,
    onComplete: PropTypes.func.isRequired,
    onInterrupt: PropTypes.func.isRequired,
};

SessionControls.defaultProps = {
    loading: false,
};

export default SessionControls;
