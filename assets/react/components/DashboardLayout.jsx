import React, { useState } from 'react';
import SessionApp from './SessionApp';
import Calendar from './Calendar';
import TopBar from './TopBar';
import { SessionProvider } from '../context/SessionContext';

/**
 * DashboardLayout - Main layout with top bar, session sidebar, and calendar
 */
function DashboardLayout() {
    const [sessionVisible, setSessionVisible] = useState(true);
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
                <div className="dashboard-wrapper">
                    <TopBar
                        sessionVisible={sessionVisible}
                        onToggleSession={() => setSessionVisible(!sessionVisible)}
                    />
                    <div className="dashboard">
                        {sessionVisible && (
                            <div className="dashboard-sidebar">
                                <div className="sidebar-content">
                                    <SessionApp compact onFullscreen={() => setSessionFullscreen(true)} />
                                </div>
                            </div>
                        )}
                        <div className="dashboard-main">
                            <Calendar />
                        </div>
                    </div>
                </div>
            )}
        </SessionProvider>
    );
}

export default DashboardLayout;
