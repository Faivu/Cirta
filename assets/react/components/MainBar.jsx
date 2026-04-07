import React, { useState } from 'react';
import PropTypes from 'prop-types';
import FeedbackPanel from './FeedbackPanel';

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
    analytics: {
        label: 'Analytics',
        icon: (size = 18) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6"  y1="20" x2="6"  y2="14" />
                <line x1="2"  y1="20" x2="22" y2="20" />
            </svg>
        ),
    },
};

function MainBar({ primaryPanel, secondaryPanel, onTogglePanel, onSetPrimary, onRemoveFromSlot, onSwap }) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [feedbackOpen, setFeedbackOpen] = useState(false);

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
        <>
        <div className="mainbar">
            <div className="mainbar-top">
                <img src="/images/logo.png" alt="Cirta" className="mainbar-logo" />
            </div>

            {/* Swap button + primary slot — outside mainbar-middle so they never shift */}
            <button
                className={`mainbar-swap-btn ${primaryPanel && secondaryPanel ? '' : 'invisible'}`}
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
            >
                {primaryPanel ? (
                    <>
                        <div
                            className="primary-slot-icon"
                            draggable
                            onDragStart={handleSlotIconDragStart}
                        >
                            {PANEL_CONFIG[primaryPanel].icon(20)}
                        </div>
                        <span className="toggle-label">Drag and drop below to unselect this panel as primary</span>
                    </>

                ) : (
                    <>
                        <span className="primary-slot-hint">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="12" y1="19" x2="12" y2="5" />
                                <polyline points="5 12 12 5 19 12" />
                            </svg>
                        </span>
                        <span className="toggle-label">Drag and drop a panel icon to set it as primary</span>
                    </>
                )}
            </div>

            <div className="mainbar-divider" />

            {/* Panel icons — can shift freely */}
            <div
                className="mainbar-middle"
                onDragOver={handleIconsDragOver}
                onDrop={handleIconsDrop}
            >
                {Object.entries(PANEL_CONFIG).map(([panelId, config]) => {
                    if (panelId === primaryPanel) return null;
                    return (
                        <button
                            key={panelId}
                            className={`mainbar-view-toggle ${isOpen(panelId) ? 'active' : ''}`}
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

            <div className="mainbar-bottom">
                <button
                    className={`mainbar-feedback ${feedbackOpen ? 'active' : ''}`}
                    onClick={() => setFeedbackOpen(prev => !prev)}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span className="toggle-label">Share feedback</span>
                </button>
                <a href="/settings" className="mainbar-settings">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    <span className="toggle-label">Settings</span>
                </a>
            </div>
        </div>

        <FeedbackPanel isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
        </>
    );
}

MainBar.propTypes = {
    primaryPanel: PropTypes.string,
    secondaryPanel: PropTypes.string,
    onTogglePanel: PropTypes.func.isRequired,
    onSetPrimary: PropTypes.func.isRequired,
    onRemoveFromSlot: PropTypes.func.isRequired,
    onSwap: PropTypes.func.isRequired,
};

MainBar.defaultProps = {
    primaryPanel: null,
    secondaryPanel: null,
};

export default MainBar;
