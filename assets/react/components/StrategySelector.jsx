import React from 'react';
import PropTypes from 'prop-types';

/**
 * StrategySelector - Allows user to choose between session strategies
 *
 * Props:
 * - selected: currently selected strategy ('pomodoro', 'flowtime', 'free_session')
 * - onSelect: callback when a strategy is selected
 */
function StrategySelector({ selected, onSelect }) {
    const strategies = [
        {
            id: 'pomodoro',
            name: 'Pomodoro',
            description: 'Work for a set time (default 25 min), then take a break.',
            icon: '🍅',
        },
        {
            id: 'flowtime',
            name: 'Flowtime',
            description: 'Work until you lose focus. Break time is calculated based on work time.',
            icon: '🌊',
        },
        {
            id: 'free_session',
            name: 'Free Session',
            description: 'No time constraints. Just track when you start and stop.',
            icon: '⏱️',
        },
    ];

    return (
        <div className="strategy-selector">
            <h2>Choose Your Strategy</h2>
            <div className="strategy-cards">
                {strategies.map((strategy) => (
                    <div
                        key={strategy.id}
                        className={`strategy-card ${selected === strategy.id ? 'selected' : ''}`}
                        onClick={() => onSelect(strategy.id)}
                    >
                        <div className="strategy-icon">{strategy.icon}</div>
                        <h3>{strategy.name}</h3>
                        <p>{strategy.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

StrategySelector.propTypes = {
    selected: PropTypes.oneOf(['pomodoro', 'flowtime', 'free_session', null]),
    onSelect: PropTypes.func.isRequired,
};

StrategySelector.defaultProps = {
    selected: null,
};

export default StrategySelector;
