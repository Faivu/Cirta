import React from 'react';
import PropTypes from 'prop-types';

/**
 * SquareTimer - Four square digit blocks showing MM:SS (or HH:MM:SS).
 * In idle mode, accepts letter chars instead of digits.
 */
function SquareTimer({ chars, isPaused, idle, color, bgColor }) {
    const groups = chars.length === 6
        ? [[chars[0], chars[1]], [chars[2], chars[3]], [chars[4], chars[5]]]
        : [[chars[0], chars[1]], [chars[2], chars[3]]];

    const digitStyle = color ? { color, borderColor: color, ...(bgColor ? { background: bgColor } : {}) } : undefined;
    const separatorStyle = color ? { color } : undefined;

    return (
        <div className={`square-timer${isPaused ? ' paused' : ''}${idle ? ' idle' : ''}`}>
            {groups.map((group, gi) => (
                <React.Fragment key={gi}>
                    {gi > 0 && <span className="square-timer-separator" style={separatorStyle}>:</span>}
                    <div className="square-timer-group">
                        {group.map((char, ci) => (
                            <div key={ci} className="square-timer-digit" style={digitStyle}>{char}</div>
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
    color: PropTypes.string,
    bgColor: PropTypes.string,
};

SquareTimer.defaultProps = {
    isPaused: false,
    idle: false,
    color: null,
    bgColor: null,
};

export default SquareTimer;
