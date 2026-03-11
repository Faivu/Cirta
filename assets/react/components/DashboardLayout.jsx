import React, { useState, useRef } from 'react';
import SessionApp from './SessionApp';
import SessionHistory from './SessionHistory';
import TodoList from './TodoList';
import Calendar from './Calendar';
import TopBar from './TopBar';
import ResizeHandle from './ResizeHandle';
import { SessionProvider } from '../context/SessionContext';

function DashboardLayout() {
    const [panels, setPanels] = useState(['session', 'calendar']);
    const [sessionFullscreen, setSessionFullscreen] = useState(false);
    const [todoFullscreen, setTodoFullscreen] = useState(false);
    const [sidebarTab, setSidebarTab] = useState('timer');
    const [todoTab, setTodoTab] = useState('tasks');
    const [taskFilter, setTaskFilter] = useState('all');

    const MIN_PANEL_WIDTH = 280;
    const TOPBAR_WIDTH = 60;
    const [sidebarWidth, setSidebarWidth] = useState(320);
    const dragRef = useRef({ startX: 0, startWidth: 320 });

    const handleTogglePanel = (panelId) => {
        setPanels(prev => {
            if (prev.includes(panelId)) {
                if (prev.length === 1) return prev;
                return prev.filter(p => p !== panelId);
            }
            if (prev.length < 2) return [...prev, panelId];
            return [prev[0], panelId]; // replace secondary
        });
    };

    const handleDragStart = (startX) => {
        dragRef.current = { startX, startWidth: sidebarWidth };
    };

    const handleDrag = (currentX) => {
        const delta = currentX - dragRef.current.startX;
        const maxWidth = window.innerWidth - TOPBAR_WIDTH - MIN_PANEL_WIDTH;
        const newWidth = Math.max(MIN_PANEL_WIDTH, Math.min(dragRef.current.startWidth + delta, maxWidth));
        setSidebarWidth(newWidth);
    };

    const renderPanelContent = (panelId) => {
        switch (panelId) {
            case 'session':
                return (
                    <>
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
                                <SessionApp compact={panels.length === 2} />
                            ) : (
                                <SessionHistory />
                            )}
                        </div>
                    </>
                );
            case 'todo':
                return (
                    <>
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
                    </>
                );
            case 'calendar':
                return <Calendar />;
            default:
                return null;
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
                    <TopBar panels={panels} onTogglePanel={handleTogglePanel} />
                    <div className="dashboard">
                        {panels.map((panelId, index) => {
                            const isLeft = index === 0;
                            const hasTwo = panels.length === 2;
                            const panelClass = hasTwo && isLeft ? 'dashboard-sidebar' : 'dashboard-main';
                            const style = hasTwo && isLeft
                                ? { width: sidebarWidth, minWidth: sidebarWidth, '--sidebar-width': `${sidebarWidth}px` }
                                : {};

                            return (
                                <React.Fragment key={panelId}>
                                    {index > 0 && (
                                        <ResizeHandle
                                            onDragStart={handleDragStart}
                                            onDrag={handleDrag}
                                        />
                                    )}
                                    <div className={panelClass} style={style}>
                                        {renderPanelContent(panelId)}
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            )}
        </SessionProvider>
    );
}

export default DashboardLayout;
