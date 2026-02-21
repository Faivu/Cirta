import React from 'react';
import PropTypes from 'prop-types';

/**
 * TopBar - Main navigation bar with logo, view toggles, and settings
 */
function TopBar({ activeSidebar, onToggleSidebar }) {
    return (
        <div className="topbar">
            <div className="topbar-left">
                <img src="/images/logo.png" alt="Cirta" className="topbar-logo" />
            </div>

            <div className="topbar-center">
                <button
                    className={`topbar-view-toggle ${activeSidebar === 'session' ? 'active' : ''}`}
                    onClick={() => onToggleSidebar('session')}
                    title={activeSidebar === 'session' ? 'Hide session' : 'Show session'}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span className="toggle-label">Session</span>
                </button>
                <button
                    className={`topbar-view-toggle ${activeSidebar === 'todo' ? 'active' : ''}`}
                    onClick={() => onToggleSidebar('todo')}
                    title={activeSidebar === 'todo' ? 'Hide to-do' : 'Show to-do'}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                        <rect x="9" y="3" width="6" height="4" rx="1" />
                        <path d="M9 12l2 2 4-4" />
                    </svg>
                    <span className="toggle-label">To-Do</span>
                </button>
            </div>

            <div className="topbar-right">
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
                    Logout
                </button>
            </div>
        </div>
    );
}

TopBar.propTypes = {
    activeSidebar: PropTypes.string,
    onToggleSidebar: PropTypes.func.isRequired,
};

export default TopBar;
