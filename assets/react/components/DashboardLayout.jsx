import React, { useState } from 'react';
import SessionApp from './SessionApp';
import SessionHistory from './SessionHistory';
import Calendar from './Calendar';
import TopBar from './TopBar';
import { SessionProvider } from '../context/SessionContext';

/**
 * DashboardLayout - Main layout with top bar, session sidebar, and calendar
 */
function DashboardLayout() {
    const [sessionVisible, setSessionVisible] = useState(true);
    const [sessionFullscreen, setSessionFullscreen] = useState(false);
    const [sidebarTab, setSidebarTab] = useState('timer');

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
                                <div className="sidebar-tabs">
                                    <button
                                        className="sidebar-expand-btn"
                                        onClick={() => setSessionFullscreen(true)}
                                        title="Fullscreen"
                                    >
                                        ⛶
                                    </button>
                                    <button
                                        className={`sidebar-tab ${sidebarTab === 'timer' ? 'active' : ''}`}
                                        onClick={() => setSidebarTab('timer')}
                                    >
                                        Timer
                                    </button>
                                    <button
                                        className={`sidebar-tab ${sidebarTab === 'history' ? 'active' : ''}`}
                                        onClick={() => setSidebarTab('history')}
                                    >
                                        History
                                    </button>
                                </div>
                                <div className="sidebar-content">
                                    {sidebarTab === 'timer' ? (
                                        <SessionApp compact />
                                    ) : (
                                        <SessionHistory />
                                    )}
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
