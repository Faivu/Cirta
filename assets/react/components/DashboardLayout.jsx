import React, { useState, useRef } from 'react';
import SessionApp from './SessionApp';
import SessionHistory from './SessionHistory';
import TodoList from './TodoList';
import Calendar from './Calendar';
import TopBar from './TopBar';
import ResizeHandle from './ResizeHandle';
import { SessionProvider } from '../context/SessionContext';
import { ToastProvider } from '../context/ToastContext';
import ToastContainer from './ToastContainer';

const MIN_PANEL_WIDTH = 280;
const TOPBAR_WIDTH = 60;
const DEFAULT_SIDEBAR_WIDTH = 320;

function DashboardLayout() {
    const [primaryPanel, setPrimaryPanel] = useState('session');
    const [secondaryPanel, setSecondaryPanel] = useState('calendar');
    const [isPrimaryLeft, setIsPrimaryLeft] = useState(true);

    const [sessionFullscreen, setSessionFullscreen] = useState(false);
    const [todoFullscreen, setTodoFullscreen] = useState(false);
    const [sidebarTab, setSidebarTab] = useState('timer');
    const [todoTab, setTodoTab] = useState('tasks');
    const [taskFilter, setTaskFilter] = useState('all');

    const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
    const dragRef = useRef(null);

    // Derived layout
    const leftPanel  = isPrimaryLeft ? primaryPanel  : secondaryPanel;
    const rightPanel = isPrimaryLeft ? secondaryPanel : primaryPanel;
    const panels = [leftPanel, rightPanel].filter(Boolean);

    // --- Panel toggle (clicking icons below the slot) ---
    const handleTogglePanel = (panelId) => {
        if (panelId === primaryPanel) return; // primary can only be changed via the slot
        if (primaryPanel) {
            setSecondaryPanel(prev => prev === panelId ? null : panelId);
        } else {
            // Single-panel mode: switch to clicked panel (never close the last one)
            if (secondaryPanel !== panelId) setSecondaryPanel(panelId);
        }
    };

    // --- Drag into primary slot ---
    const handleSetPrimary = (panelId) => {
        if (panelId === primaryPanel) return;
        setPrimaryPanel(panelId);
        if (panelId === secondaryPanel) {
            setSecondaryPanel(primaryPanel); // was secondary → swap
        } else {
            setSecondaryPanel(primaryPanel || secondaryPanel); // keep whichever is already open
        }
        setIsPrimaryLeft(true); // primary always lands on the left
    };

    // --- Drag out of primary slot ---
    const handleRemoveFromSlot = () => {
        setSecondaryPanel(primaryPanel); // demoted panel stays open as the single panel
        setPrimaryPanel(null);
    };

    // --- Swap panel positions ---
    const handleSwap = () => {
        if (primaryPanel && secondaryPanel) setIsPrimaryLeft(prev => !prev);
    };

    // --- Resize ---
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
        <ToastProvider>
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
                        primaryPanel={primaryPanel}
                        secondaryPanel={secondaryPanel}
                        onTogglePanel={handleTogglePanel}
                        onSetPrimary={handleSetPrimary}
                        onRemoveFromSlot={handleRemoveFromSlot}
                        onSwap={handleSwap}
                    />
                    <div className="dashboard">
                        {panels.map((panelId, index) => {
                            const isLeft = index === 0;
                            const hasTwo = panels.length === 2;
                            const panelClass = hasTwo && isLeft ? 'dashboard-sidebar' : 'dashboard-main';
                            const panelLeft = isLeft ? TOPBAR_WIDTH : TOPBAR_WIDTH + sidebarWidth;
                            const panelWidth = hasTwo
                                ? (isLeft ? sidebarWidth : window.innerWidth - TOPBAR_WIDTH - sidebarWidth)
                                : window.innerWidth - TOPBAR_WIDTH;
                            const style = hasTwo && isLeft
                                ? { width: sidebarWidth, minWidth: sidebarWidth, '--sidebar-width': `${sidebarWidth}px`, '--panel-left': `${panelLeft}px`, '--panel-width': `${panelWidth}px` }
                                : { '--panel-left': `${panelLeft}px`, '--panel-width': `${panelWidth}px` };

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
        <ToastContainer />
        </ToastProvider>
    );
}

export default DashboardLayout;
