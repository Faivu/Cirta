import React, { useState } from 'react';
import SessionApp from './SessionApp';
import SessionHistory from './SessionHistory';
import TodoList from './TodoList';
import Calendar from './Calendar';
import TopBar from './TopBar';
import { SessionProvider } from '../context/SessionContext';

/**
 * DashboardLayout - Main layout with top bar, sidebar (session or todo), and calendar
 */
function DashboardLayout() {
    const [activeSidebar, setActiveSidebar] = useState('session');
    const [sessionFullscreen, setSessionFullscreen] = useState(false);
    const [todoFullscreen, setTodoFullscreen] = useState(false);
    const [sidebarTab, setSidebarTab] = useState('timer');
    const [todoTab, setTodoTab] = useState('tasks');
    const [taskFilter, setTaskFilter] = useState('all');

    const handleToggleSidebar = (sidebar) => {
        if (activeSidebar === sidebar) {
            setActiveSidebar(null);
        } else {
            setActiveSidebar(sidebar);
        }
    };

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
            ) : todoFullscreen ? (
                <div className="session-fullscreen todo-fullscreen">
                    <button
                        className="exit-fullscreen-btn"
                        onClick={() => setTodoFullscreen(false)}
                        title="Back to dashboard"
                    >
                        ⛶
                    </button>
                    <div className="sidebar-tabs fullscreen-tabs">
                        <button
                            className={`sidebar-tab ${todoTab === 'tasks' ? 'active' : ''}`}
                            onClick={() => setTodoTab('tasks')}
                        >
                            Tasks
                        </button>
                        <button
                            className={`sidebar-tab ${todoTab === 'history' ? 'active' : ''}`}
                            onClick={() => setTodoTab('history')}
                        >
                            History
                        </button>
                    </div>
                    <div className="todo-fullscreen-content">
                        <TodoList view={todoTab} filter={taskFilter} onFilterChange={setTaskFilter} />
                    </div>
                </div>
            ) : (
                <div className="dashboard-wrapper">
                    <TopBar
                        activeSidebar={activeSidebar}
                        onToggleSidebar={handleToggleSidebar}
                    />
                    <div className="dashboard">
                        {activeSidebar === 'session' && (
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
                        {activeSidebar === 'todo' && (
                            <div className="dashboard-sidebar">
                                <div className="sidebar-tabs">
                                    <button
                                        className="sidebar-expand-btn"
                                        onClick={() => setTodoFullscreen(true)}
                                        title="Fullscreen"
                                    >
                                        ⛶
                                    </button>
                                    <button
                                        className={`sidebar-tab ${todoTab === 'tasks' ? 'active' : ''}`}
                                        onClick={() => setTodoTab('tasks')}
                                    >
                                        Tasks
                                    </button>
                                    <button
                                        className={`sidebar-tab ${todoTab === 'history' ? 'active' : ''}`}
                                        onClick={() => setTodoTab('history')}
                                    >
                                        History
                                    </button>
                                </div>
                                <div className="sidebar-content">
                                    <TodoList view={todoTab} filter={taskFilter} onFilterChange={setTaskFilter} />
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
