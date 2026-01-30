import React from 'react';
import PropTypes from 'prop-types';

/**
 * PomodoroModeSelector - Buttons to switch between Pomodoro, Short Break, and Long Break
 */
function PomodoroModeSelector({ mode, onChange, disabled }) {
    const modes = [
        { id: 'pomodoro', label: 'Pomodoro' },
        { id: 'shortBreak', label: 'Short Break' },
        { id: 'longBreak', label: 'Long Break' },
    ];

    return (
        <div className="pomodoro-mode-selector">
            {modes.map(({ id, label }) => (
                <button
                    key={id}
                    className={`pomodoro-mode-btn${mode === id ? ' active' : ''}${disabled ? ' disabled' : ''}`}
                    onClick={() => !disabled && onChange(id)}
                    disabled={disabled}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}

PomodoroModeSelector.propTypes = {
    mode: PropTypes.oneOf(['pomodoro', 'shortBreak', 'longBreak']).isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};

PomodoroModeSelector.defaultProps = {
    disabled: false,
};

export default PomodoroModeSelector;
