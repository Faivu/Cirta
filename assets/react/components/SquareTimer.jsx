import React from 'react';
import PropTypes from 'prop-types';

/**
 * SquareTimer - Four square digit blocks showing MM:SS (or HH:MM:SS).
 * In idle mode, accepts letter chars instead of digits.
 */
function SquareTimer({ chars, isPaused, idle }) {
    const groups = chars.length === 6
        ? [[chars[0], chars[1]], [chars[2], chars[3]], [chars[4], chars[5]]]
        : [[chars[0], chars[1]], [chars[2], chars[3]]];

    return (
        <div className={`square-timer${isPaused ? ' paused' : ''}${idle ? ' idle' : ''}`}>
            {groups.map((group, gi) => (
                <React.Fragment key={gi}>
                    {gi > 0 && <span className="square-timer-separator">:</span>}
                    <div className="square-timer-group">
                        {group.map((char, ci) => (
                            <div key={ci} className="square-timer-digit">{char}</div>
                        ))}
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
}

SquareTimer.propTypes = {
    chars: PropTypes.arrayOf(PropTypes.string).isRequired,
    isPaused: PropTypes.bool,
    idle: PropTypes.bool,
};

SquareTimer.defaultProps = {
    isPaused: false,
    idle: false,
};

export default SquareTimer;
