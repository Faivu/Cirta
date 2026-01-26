import React, { useState } from 'react';
import SessionApp from './SessionApp';
import Calendar from './Calendar';

/**
 * DashboardLayout - Split view layout with session sidebar and calendar main area
 */
function DashboardLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="dashboard">
            <div className={`dashboard-sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
                <button
                    className="sidebar-toggle"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    title={sidebarCollapsed ? 'Show timer' : 'Hide timer'}
                >
                    {sidebarCollapsed ? '>' : '<'}
                </button>
                {!sidebarCollapsed && <SessionApp compact />}
            </div>
            <div className="dashboard-main">
                <Calendar />
            </div>
        </div>
    );
}

export default DashboardLayout;
