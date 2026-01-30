import React, { useState } from 'react';
import SessionApp from './SessionApp';
import Calendar from './Calendar';
import { SessionProvider } from '../context/SessionContext';

/**
 * DashboardLayout - Split view layout with session sidebar and calendar main area
 */
function DashboardLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sessionFullscreen, setSessionFullscreen] = useState(false);

    return (
        <SessionProvider>
            {sessionFullscreen ? (
                <div className="session-fullscreen">
                    <button
                        className="exit-fullscreen-btn"
                        onClick={() => setSessionFullscreen(false)}
                        title="Back to dashboard"
                    >
                        ⛶
                    </button>
                    <SessionApp />
                </div>
            ) : (
                <div className="dashboard">
                    <div className={`dashboard-sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
                        <button
                            className="sidebar-toggle"
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            title={sidebarCollapsed ? 'Show timer' : 'Hide timer'}
                        >
                            {sidebarCollapsed ? '>' : '<'}
                        </button>
                        <div className={`sidebar-content${sidebarCollapsed ? ' hidden' : ''}`}>
                            <SessionApp compact onFullscreen={() => setSessionFullscreen(true)} />
                        </div>
                    </div>
                    <div className="dashboard-main">
                        <Calendar />
                    </div>
                </div>
            )}
        </SessionProvider>
    );
}

export default DashboardLayout;
