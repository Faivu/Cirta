import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const PANEL_CONFIG = {
    session: {
        label: 'Session',
        icon: (size = 18) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        ),
    },
    calendar: {
        label: 'Calendar',
        icon: (size = 18) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
        ),
    },
    todo: {
        label: 'To-Do',
        icon: (size = 20) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <path d="M9 12l2 2 4-4" />
            </svg>
        ),
    },
};

function TopBar({ primaryPanel, secondaryPanel, onTogglePanel, onSetPrimary, onRemoveFromSlot, onSwap }) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const hintTimerRef = useRef(null);

    useEffect(() => () => clearTimeout(hintTimerRef.current), []);

    const handlePrimaryIconClick = () => {
        clearTimeout(hintTimerRef.current);
        setShowHint(true);
        hintTimerRef.current = setTimeout(() => setShowHint(false), 2500);
    };

    const isOpen = (panelId) => panelId === primaryPanel || panelId === secondaryPanel;

    const handleIconDragStart = (e, panelId) => {
        e.dataTransfer.setData('panelId', panelId);
        e.dataTransfer.setData('fromSlot', 'false');
        e.dataTransfer.effectAllowed = 'move';
        const svg = e.currentTarget.querySelector('svg');
        if (svg) e.dataTransfer.setDragImage(svg, svg.clientWidth / 2, svg.clientHeight / 2);
    };

    const handleSlotIconDragStart = (e) => {
        e.dataTransfer.setData('panelId', primaryPanel);
        e.dataTransfer.setData('fromSlot', 'true');
        e.dataTransfer.effectAllowed = 'move';
        const svg = e.currentTarget.querySelector('svg');
        if (svg) e.dataTransfer.setDragImage(svg, svg.clientWidth / 2, svg.clientHeight / 2);
    };

    const handleSlotDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
    };

    const handleSlotDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const panelId = e.dataTransfer.getData('panelId');
        const fromSlot = e.dataTransfer.getData('fromSlot') === 'true';
        if (!fromSlot && panelId) onSetPrimary(panelId);
    };

    const handleIconsDragOver = (e) => e.preventDefault();

    const handleIconsDrop = (e) => {
        const fromSlot = e.dataTransfer.getData('fromSlot') === 'true';
        if (fromSlot) {
            e.preventDefault();
            onRemoveFromSlot();
        }
    };

    return (
        <div className="topbar">
            <div className="topbar-top">
                <img src="/images/logo.png" alt="Cirta" className="topbar-logo" />
            </div>

            {/* Swap button + primary slot — outside topbar-middle so they never shift */}
            <button
                className={`topbar-swap-btn ${primaryPanel && secondaryPanel ? '' : 'invisible'}`}
                onClick={onSwap}
                tabIndex={primaryPanel && secondaryPanel ? 0 : -1}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 16l-4-4 4-4" />
                    <path d="M17 8l4 4-4 4" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                </svg>
                <span className="toggle-label">Swap panel positions</span>
            </button>

            <div
                className={`primary-slot ${primaryPanel ? 'filled' : 'empty'} ${isDragOver ? 'drag-over' : ''}`}
                onDragOver={handleSlotDragOver}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleSlotDrop}
                title={primaryPanel ? '' : 'Drag a panel here to make it primary'}
            >
                {primaryPanel ? (
                    <div
                        className="primary-slot-icon"
                        draggable
                        onDragStart={handleSlotIconDragStart}
                        onClick={handlePrimaryIconClick}
                    >
                        {PANEL_CONFIG[primaryPanel].icon(20)}
                        {showHint && (
                            <div className="primary-hint-tooltip">
                                Drag down to unpin
                            </div>
                        )}
                    </div>
                ) : (
                    <span className="primary-slot-hint">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="19" x2="12" y2="5" />
                            <polyline points="5 12 12 5 19 12" />
                        </svg>
                    </span>
                )}
            </div>

            <div className="topbar-divider" />

            {/* Panel icons — can shift freely */}
            <div
                className="topbar-middle"
                onDragOver={handleIconsDragOver}
                onDrop={handleIconsDrop}
            >
                {Object.entries(PANEL_CONFIG).map(([panelId, config]) => {
                    if (panelId === primaryPanel) return null;
                    return (
                        <button
                            key={panelId}
                            className={`topbar-view-toggle ${isOpen(panelId) ? 'active' : ''}`}
                            draggable
                            onDragStart={(e) => handleIconDragStart(e, panelId)}
                            onClick={() => onTogglePanel(panelId)}
                        >
                            {config.icon()}
                            <span className="toggle-label">{config.label}</span>
                        </button>
                    );
                })}
            </div>

            <div className="topbar-bottom">
                <button className="topbar-settings" title="Settings">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </svg>
                </button>
                <button
                    className="topbar-logout"
                    title="Logout"
                    onClick={() => window.location.href = '/logout'}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

TopBar.propTypes = {
    primaryPanel: PropTypes.string,
    secondaryPanel: PropTypes.string,
    onTogglePanel: PropTypes.func.isRequired,
    onSetPrimary: PropTypes.func.isRequired,
    onRemoveFromSlot: PropTypes.func.isRequired,
    onSwap: PropTypes.func.isRequired,
};

TopBar.defaultProps = {
    primaryPanel: null,
    secondaryPanel: null,
};

export default TopBar;
