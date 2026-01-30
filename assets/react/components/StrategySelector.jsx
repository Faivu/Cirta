import React from 'react';
import PropTypes from 'prop-types';

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
        description: 'Work until you lose focus. Break time is 20% of work time.',
        icon: '🌊',
    },
    {
        id: 'free_session',
        name: 'Free Session',
        description: 'No time constraints. Just track when you start and stop.',
        icon: '⏱️',
    },
];

/**
 * StrategySelector - Allows user to choose between session strategies
 *
 * Props:
 * - selected: currently selected strategy ('pomodoro', 'flowtime', 'free_session')
 * - onSelect: callback when a strategy is selected
 * - compact: whether to show compact mode with arrows
 */
function StrategySelector({ selected, onSelect, compact }) {
    const currentIndex = strategies.findIndex(s => s.id === selected);
    const currentStrategy = strategies[currentIndex] || strategies[0];

    const handlePrev = () => {
        const newIndex = currentIndex <= 0 ? strategies.length - 1 : currentIndex - 1;
        onSelect(strategies[newIndex].id);
    };

    const handleNext = () => {
        const newIndex = currentIndex >= strategies.length - 1 ? 0 : currentIndex + 1;
        onSelect(strategies[newIndex].id);
    };

    if (compact) {
        return (
            <div className="strategy-selector compact">
                <div className="strategy-nav">
                    <button className="strategy-nav-btn" onClick={handlePrev} type="button">
                        &lt;
                    </button>
                    <div className="strategy-current">
                        <span className="strategy-icon-small">{currentStrategy.icon}</span>
                        <span className="strategy-name">{currentStrategy.name}</span>
                    </div>
                    <button className="strategy-nav-btn" onClick={handleNext} type="button">
                        &gt;
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="strategy-selector">
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
    compact: PropTypes.bool,
};

StrategySelector.defaultProps = {
    selected: null,
    compact: false,
};

export default StrategySelector;
