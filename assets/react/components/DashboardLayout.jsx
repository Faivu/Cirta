import React, { useState, useRef, useEffect } from 'react';
import SessionApp from './SessionApp';
import SessionHistory from './SessionHistory';
import TodoList from './TodoList';
import Calendar from './Calendar';
import MainBar from './MainBar';
import ResizeHandle from './ResizeHandle';
import { SessionProvider } from '../context/SessionContext';
import { ToastProvider } from '../context/ToastContext';
import ToastContainer from './ToastContainer';
import { SettingsProvider, useSettings } from '../context/SettingsContext';
import AnalyticsPanel from './AnalyticsPanel';
import { useLayoutStorage } from '../hooks/useLayoutStorage';
import { useResize } from '../hooks/useResize';

const TOPBAR_WIDTH = 60;
const DEFAULT_SIDEBAR_WIDTH = 320;
const LAYOUT_STORAGE_KEY = 'cirta_layout';

const LAYOUT_DEFAULTS = {
    primaryPanel: 'session',
    secondaryPanel: 'calendar',
    isPrimaryLeft: true,
    sidebarTab: 'timer',
    todoTab: 'tasks',
    sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
};

function PanelContent({ panelId, sidebarTab, setSidebarTab, todoTab, setTodoTab, taskFilter, setTaskFilter, fullPanel }) {
    switch (panelId) {
        case 'session':
            return (
                <>
                    <div className="sidebar-tabs">
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
                            <SessionApp compact={true} fullPanel={fullPanel} />
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
                    <div className="sidebar-content todo-sidebar-content">
                        <TodoList view={todoTab} filter={taskFilter} onFilterChange={setTaskFilter} />
                    </div>
                </>
            );
        case 'calendar':
            return <Calendar />;
        case 'analytics':
            return <AnalyticsPanel />;
        default:
            return null;
    }
}

function DashboardContent() {
    const { todoDefaultFilter } = useSettings();
    const [layout, setField] = useLayoutStorage(LAYOUT_STORAGE_KEY, LAYOUT_DEFAULTS);
    const { primaryPanel, secondaryPanel, isPrimaryLeft, sidebarTab, todoTab, sidebarWidth } = layout;

    const setPrimaryPanel   = setField('primaryPanel');
    const setSecondaryPanel = setField('secondaryPanel');
    const setIsPrimaryLeft  = setField('isPrimaryLeft');
    const setSidebarTab     = setField('sidebarTab');
    const setTodoTab        = setField('todoTab');
    const setSidebarWidth   = setField('sidebarWidth');

    // taskFilter is a startup default from settings — not persisted in localStorage
    const [taskFilter, setTaskFilter] = useState(todoDefaultFilter);

    const { handleDragStart, handleDrag } = useResize(sidebarWidth, setSidebarWidth);

    // Derived layout
    const leftPanel  = isPrimaryLeft ? primaryPanel  : secondaryPanel;
    const rightPanel = isPrimaryLeft ? secondaryPanel : primaryPanel;
    const panels = [leftPanel, rightPanel].filter(Boolean);

    const handleTogglePanel = (panelId) => {
        if (panelId === primaryPanel) return;
        if (primaryPanel) {
            setSecondaryPanel(prev => prev === panelId ? null : panelId);
        } else {
            if (secondaryPanel !== panelId) setSecondaryPanel(panelId);
        }
    };

    const handleSetPrimary = (panelId) => {
        if (panelId === primaryPanel) return;
        setPrimaryPanel(panelId);
        if (panelId === secondaryPanel) {
            setSecondaryPanel(primaryPanel);
        } else {
            setSecondaryPanel(primaryPanel || secondaryPanel);
        }
        setIsPrimaryLeft(true);
    };

    const handleRemoveFromSlot = () => {
        setSecondaryPanel(primaryPanel);
        setPrimaryPanel(null);
    };

    const handleSwap = () => {
        if (primaryPanel && secondaryPanel) {
            setIsPrimaryLeft(prev => !prev);
            setSidebarWidth(window.innerWidth - TOPBAR_WIDTH - sidebarWidth);
        }
    };

    return (
        <ToastProvider>
        <SessionProvider>
            <div className="dashboard-wrapper">
                <MainBar
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
                                    <PanelContent
                                        panelId={panelId}
                                        sidebarTab={sidebarTab}
                                        setSidebarTab={setSidebarTab}
                                        todoTab={todoTab}
                                        setTodoTab={setTodoTab}
                                        taskFilter={taskFilter}
                                        setTaskFilter={setTaskFilter}
                                        fullPanel={panels.length === 1}
                                    />
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </SessionProvider>
        <ToastContainer />
        </ToastProvider>
    );
}

function DashboardLayout() {
    return (
        <SettingsProvider>
            <DashboardContent />
        </SettingsProvider>
    );
}

export default DashboardLayout;
