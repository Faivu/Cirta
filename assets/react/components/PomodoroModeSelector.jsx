import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSettings } from '../context/SettingsContext';

/**
 * PomodoroModeSelector - Buttons to switch between Pomodoro, Short Break, and Long Break
 */
function PomodoroModeSelector({ mode, onChange, disabled }) {
    const { pomodoroSeriousMode } = useSettings();
    const [tooltipVisible, setTooltipVisible] = useState(false);

    const modes = [
        { id: 'pomodoro', label: 'Pomodoro' },
        { id: 'shortBreak', label: 'Short Break' },
        { id: 'longBreak', label: 'Long Break' },
    ];

    return (
        <div
            className="pomodoro-mode-selector"
            onMouseEnter={() => pomodoroSeriousMode && setTooltipVisible(true)}
            onMouseLeave={() => setTooltipVisible(false)}
        >
            {tooltipVisible && (
                <div className="pomodoro-serious-tooltip">
                    Serious mode is enabled
                </div>
            )}
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
