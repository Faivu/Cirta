import React, { useState, useRef, useEffect } from 'react';
import SessionApp from './SessionApp';
import SessionHistory from './SessionHistory';
import TodoList from './TodoList';
import Calendar from './Calendar';
import MainBar from './MainBar';
import ResizeHandle from './ResizeHandle';
import InfoButton from './InfoButton';
import OnboardingModal from './OnboardingModal';
import { SessionProvider } from '../context/SessionContext';
import { ToastProvider } from '../context/ToastContext';
import ToastContainer from './ToastContainer';
import { SettingsProvider, useSettings } from '../context/SettingsContext';
import AnalyticsPanel from './AnalyticsPanel';
import { useLayoutStorage } from '../hooks/useLayoutStorage';
import { useResize } from '../hooks/useResize';

const TODO_SLIDES = [
    {
        title: 'To-Do List',
        description: 'To-Do List Panel allows you to add and manage your tasks. You can also synergies it with Session panel by dragging any task directly onto a session to link it to it.',
        media: '/videos/To-do_tutorial.mp4',
    },
];

const SESSION_SLIDES = [
    {
        title: 'Focus Sessions',
        description: 'The Session Panel is a timer, used when working on a focus task. Since people are different, there are different strategies with different philosophies of managing time and focus to choose from. Pick the strategy that makes you productive the most!',
        media: '/videos/Session_tutorial_intro.mp4',
    },
    {
        title: 'Pomodoro',
        description: 'Work in timed intervals (25 min by default), then take a short break. After every 4 sessions, take a longer break. Great for keeping energy high across a full day.',
        media: '/images/Session_tutorial_pomodoro.png',
    },
    {
        title: 'Flowtime',
        description: 'Start working and stop when you naturally lose focus. Your break time is earned proportionally to how long you worked (break is %20 of focus time by default). Great for maintaining flow state.',
        media: '/images/Session_tutorial_flowtime.png',
    },
    {
        title: 'Time Blocking',
        description: 'Reserve a fixed block of time for a specific task. The session ends automatically when the block is up. Great for keeping your schedule intact.',
        media: '/images/Session_tutorial_timeblocking.png',
    },
    {
        title: 'Goals & Task Linking',
        description: 'Type a goal to stay intentional, or drag a task from your To-Do List directly onto the session panel to link it. When you finish, you can mark the task as done in one click.',
        media: '/videos/Session_tutorial_TaskLinking.mp4',
    },
];

const TOPBAR_WIDTH = 60;
const DEFAULT_SIDEBAR_WIDTH = 320;
const LAYOUT_STORAGE_KEY = 'cirta_layout';

const LAYOUT_DEFAULTS = {
    primaryPanel: 'session',
    secondaryPanel: 'calendar',
    isPrimaryLeft: true,
    sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
};

function PanelContent({ panelId, taskFilter, setTaskFilter, fullPanel }) {
    const [sidebarTab, setSidebarTab] = useState('timer');
    const [todoTab, setTodoTab]       = useState('tasks');

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
                        <div className="sidebar-tab-info">
                            <InfoButton slides={SESSION_SLIDES} />
                        </div>
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
                        <div className="sidebar-tab-info">
                            <InfoButton slides={TODO_SLIDES} />
                        </div>
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
    const { primaryPanel, secondaryPanel, isPrimaryLeft, sidebarWidth } = layout;

    const setPrimaryPanel   = setField('primaryPanel');
    const setSecondaryPanel = setField('secondaryPanel');
    const setIsPrimaryLeft  = setField('isPrimaryLeft');
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
        <OnboardingModal />
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
