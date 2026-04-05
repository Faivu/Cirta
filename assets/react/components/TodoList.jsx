import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import DatePicker from './DatePicker';
import { useSession } from '../context/SessionContext';
import { useToast } from '../context/ToastContext';
import { useSettings } from '../context/SettingsContext';

import { playTickSound } from '../utils/sounds';

const formatDuration = (minutes) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

function TodoList({ view = 'tasks', filter = 'all', onFilterChange }) {
    const { linkedTask, taskDoneSignal, sessionEndSignal } = useSession();
    const { showToast } = useToast();
    const { todoUncheckedNoConfirm, todoKeepFinishedVisible } = useSettings();
    const [tasks, setTasks] = useState([]);
    const [newTitle, setNewTitle] = useState('');
    const [scheduleDate, setScheduleDate] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editScheduleDate, setEditScheduleDate] = useState('');
    const [editShowDates, setEditShowDates] = useState(false);
    const [collapsedSections, setCollapsedSections] = useState({});
    const inputRef = useRef(null);
    const editFormRef = useRef(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        if (!taskDoneSignal) return;
        fetchTasks();
    }, [taskDoneSignal]);

    useEffect(() => {
        if (!sessionEndSignal) return;
        fetchTasks();
    }, [sessionEndSignal]);

    const fetchTasks = async () => {
        try {
            const res = await fetch('/api/tasks');
            if (res.ok) {
                const data = await res.json();
                setTasks(data);
            }
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    const addTask = async (e) => {
        e.preventDefault();
        const title = newTitle.trim();
        if (!title || submitting) return;

        setSubmitting(true);
        try {
            const body = { title };
            if (scheduleDate) body.scheduleDate = scheduleDate;

            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                const task = { totalDuration: 0, ...await res.json() };
                setTasks((prev) => [task, ...prev]);
                closeAddModal();
            }
        } catch (err) {
            console.error('Failed to add task:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const toggleTask = async (id, currentChecked) => {
        if (!currentChecked && linkedTask?.id === id) {
            showToast({
                title: 'Task is linked to an active session',
                message: 'Mark it done when you finish a session or unlink it from the session panel.',
                duration: 4000,
            });
            return;
        }

        const newChecked = !currentChecked;

        // Confirm before unchecking from history or today view (unless disabled in settings)
        if (!todoUncheckedNoConfirm && currentChecked && (view === 'history' || (view === 'tasks' && filter === 'today'))) {
            if (!window.confirm('Uncheck this task?')) return;
        }

        if (newChecked) playTickSound();

        setTasks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, isChecked: newChecked } : t))
        );

        try {
            const res = await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isChecked: newChecked }),
            });
            if (!res.ok) {
                setTasks((prev) =>
                    prev.map((t) => (t.id === id ? { ...t, isChecked: currentChecked } : t))
                );
            }
        } catch {
            setTasks((prev) =>
                prev.map((t) => (t.id === id ? { ...t, isChecked: currentChecked } : t))
            );
        }
    };

    const deleteTask = async (id) => {
        if (linkedTask?.id === id) {
            showToast({
                title: 'Task is linked to an active session',
                message: 'Mark it done when you finish a session or unlink it from the session panel.',
                duration: 4000,
            });
            return;
        }
        if (!window.confirm('Delete this task?')) return;

        const prev = tasks;
        setTasks((t) => t.filter((task) => task.id !== id));
        if (editingId === id) setEditingId(null);

        try {
            const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                setTasks(prev);
            }
        } catch {
            setTasks(prev);
        }
    };

    const startEditing = (task) => {
        if (!editMode) return;
        if (linkedTask?.id === task.id) {
            showToast({
                title: 'Task is linked to an active session',
                message: 'Mark it done when you finish a session or unlink it from the session panel.',
                duration: 4000,
            });
            return;
        }
        const toDateInput = (dateStr) => {
            if (!dateStr) return '';
            return new Date(dateStr).toISOString().split('T')[0];
        };
        setEditingId(task.id);
        setEditTitle(task.title);
        setEditScheduleDate(toDateInput(task.scheduleDate));
        setEditShowDates(false);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditShowDates(false);
    };

    const saveEdit = async () => {
        const title = editTitle.trim();
        if (!title) return;

        const task = tasks.find((t) => t.id === editingId);
        if (!task) return;

        const body = { title };
        body.scheduleDate = editScheduleDate || null;

        // Optimistic update
        setTasks((prev) =>
            prev.map((t) => (t.id === editingId ? {
                ...t,
                title,
                scheduleDate: editScheduleDate || null,
            } : t))
        );
        setEditingId(null);
        setEditShowDates(false);

        try {
            const res = await fetch(`/api/tasks/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                setTasks((prev) =>
                    prev.map((t) => (t.id === task.id ? task : t))
                );
            }
        } catch {
            setTasks((prev) =>
                prev.map((t) => (t.id === task.id ? task : t))
            );
        }
    };

    const handleEditKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEdit();
        } else if (e.key === 'Escape') {
            cancelEditing();
        }
    };

    const toggleEditMode = () => {
        if (editMode) {
            // Exiting edit mode — cancel any in-progress edit
            setEditingId(null);
            setEditShowDates(false);
        }
        setEditMode(!editMode);
        setShowAddForm(false);
    };

    const toggleSection = (key) => {
        setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const openAddModal = () => {
        setShowAddForm(true);
        setNewTitle('');
        setScheduleDate(filter === 'today' ? new Date().toISOString().split('T')[0] : '');
        setEditMode(false);
        setEditingId(null);
    };

    const closeAddModal = () => {
        setShowAddForm(false);
        setNewTitle('');
        setScheduleDate('');
    };

    const handleModalKeyDown = (e) => {
        if (e.key === 'Escape') closeAddModal();
    };

    const todayStr = new Date().toISOString().split('T')[0];
    const isScheduledToday = scheduleDate === todayStr;
    const isEditScheduledToday = editScheduleDate === todayStr;

    const toggleToday = () => {
        setScheduleDate(isScheduledToday ? '' : todayStr);
    };

    const toggleEditToday = () => {
        setEditScheduleDate(isEditScheduledToday ? '' : todayStr);
    };

    const isScheduledForToday = (t) => {
        if (!t.scheduleDate) return false;
        const today = new Date();
        const schedule = new Date(t.scheduleDate);
        return schedule.getFullYear() === today.getFullYear()
            && schedule.getMonth() === today.getMonth()
            && schedule.getDate() === today.getDate();
    };

    // Filter tasks based on view and filter
    const getFilteredTasks = () => {
        if (view === 'history') {
            return tasks.filter((t) => t.isChecked);
        }

        if (filter === 'today') {
            return tasks.filter(t => isScheduledForToday(t) && (todoKeepFinishedVisible || !t.isChecked));
        }

        // 'all' filter: only unchecked tasks
        return tasks.filter((t) => !t.isChecked);
    };

    const filteredTasks = getFilteredTasks();

    // For today view, split into unchecked and checked for display with separator
    const todayUnchecked = (view === 'tasks' && filter === 'today')
        ? filteredTasks.filter((t) => !t.isChecked)
        : filteredTasks;
    const todayChecked = (view === 'tasks' && filter === 'today')
        ? filteredTasks.filter((t) => t.isChecked)
        : [];

    // For 'all' filter: split into 3 groups
    // noDate and upcoming show only unchecked; today shows all (checked + unchecked)
    const noDateTasks = (view === 'tasks' && filter === 'all')
        ? tasks.filter((t) => !t.isChecked && !t.scheduleDate)
        : [];
    const upcomingTasks = (view === 'tasks' && filter === 'all')
        ? tasks.filter((t) => !t.isChecked && t.scheduleDate && !isScheduledForToday(t))
        : [];
    const todayGroupTasks = (view === 'tasks' && filter === 'all')
        ? tasks.filter(isScheduledForToday)
        : [];

    // For non-'all' views/filters only — 'all' always renders its section headers
    const isAllFilterEmpty = view === 'tasks' && filter === 'all'
        ? false
        : filteredTasks.length === 0;

    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        const currentYear = new Date().getFullYear();
        const opts = { month: 'short', day: 'numeric' };
        if (d.getFullYear() !== currentYear) opts.year = 'numeric';
        return d.toLocaleDateString(undefined, opts);
    };

    const renderTask = (task) => {
        const isEditing = editingId === task.id;
        const isChecked = task.isChecked;

        if (isEditing) {
            return (
                <div key={task.id} className={`todo-item editing ${isChecked ? 'checked' : ''}`} ref={editFormRef}>
                    <div className="todo-edit-area">
                        <input
                            type="text"
                            className="todo-edit-input"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={handleEditKeyDown}
                            autoFocus
                        />
                        <div className="todo-add-toolbar">
                            <div className="todo-add-toolbar-left">
                                <button
                                    type="button"
                                    className={`todo-toolbar-btn ${isEditScheduledToday ? 'active' : ''}`}
                                    onClick={toggleEditToday}
                                >
                                    Today
                                </button>
                                <button
                                    type="button"
                                    className={`todo-toolbar-btn ${editShowDates ? 'active' : ''}`}
                                    onClick={() => setEditShowDates(!editShowDates)}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    <span>Dates</span>
                                </button>
                            </div>
                            <div className="todo-edit-actions">
                                <button
                                    type="button"
                                    className="todo-cancel-btn"
                                    onClick={cancelEditing}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="todo-add-btn"
                                    disabled={!editTitle.trim()}
                                    onClick={saveEdit}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                        {editShowDates && (
                            <div className="todo-add-options">
                                <div className="todo-date-field">
                                    <span>Scheduled</span>
                                    <DatePicker value={editScheduleDate} onChange={setEditScheduleDate} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        const draggable = !editMode && !isChecked;

        return (
            <div
                key={task.id}
                className={`todo-item ${isChecked ? 'checked' : ''} ${editMode ? 'edit-mode' : ''} ${draggable ? 'draggable' : ''} ${linkedTask?.id === task.id ? 'session-linked' : ''}`}
                onClick={() => startEditing(task)}
                draggable={draggable}
                onDragStart={draggable ? (e) => {
                    e.dataTransfer.setData('taskId', task.id);
                    e.dataTransfer.setData('taskTitle', task.title);
                    e.dataTransfer.effectAllowed = 'link';
                } : undefined}
            >
                <button
                    className={`todo-checkbox ${isChecked ? 'checked' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleTask(task.id, task.isChecked); }}
                >
                    {isChecked ? (
                        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" strokeWidth="1.5">
                            <rect x="1" y="1" width="14" height="14" rx="3" fill="#3b82f6" stroke="#3b82f6" />
                            <polyline points="4 8 7 11 12 5" fill="none" stroke="white" strokeWidth="2" />
                        </svg>
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="1" y="1" width="14" height="14" rx="3" />
                        </svg>
                    )}
                </button>
                <div className="todo-content">
                    <span className="todo-title">{task.title}</span>
                    {(task.scheduleDate || task.totalDuration > 0) && (
                        <div className="todo-dates">
                            {task.scheduleDate && (
                                <span className="todo-date scheduled">{formatDate(task.scheduleDate)}</span>
                            )}
                            {task.totalDuration > 0 && (
                                <span className="todo-duration">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    {formatDuration(task.totalDuration)}
                                </span>
                            )}
                        </div>
                    )}
                </div>
                {editMode && (
                    <button
                        className="todo-delete visible"
                        onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                        title="Delete"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                )}
            </div>
        );
    };

    const renderSection = (key, title, sectionTasks) => {
        const isCollapsed = !!collapsedSections[key];

        // Today section shows checked tasks below a separator (like the dedicated Today filter)
        const unchecked = key === 'today' ? sectionTasks.filter((t) => !t.isChecked) : sectionTasks;
        const checked = key === 'today' ? sectionTasks.filter((t) => t.isChecked) : [];

        return (
            <div key={key} className="todo-section">
                <button
                    type="button"
                    className="todo-section-header"
                    onClick={() => toggleSection(key)}
                >
                    <svg
                        className={`todo-section-chevron ${isCollapsed ? 'collapsed' : ''}`}
                        width="14" height="14" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2.5"
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                    <span className="todo-section-title">{title}</span>
                    <span className="todo-section-count">{unchecked.length}</span>
                </button>
                {!isCollapsed && (
                    <div className="todo-section-tasks">
                        {unchecked.map(renderTask)}
                        {checked.length > 0 && unchecked.length > 0 && (
                            <div className="todo-separator" />
                        )}
                        {checked.map(renderTask)}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="todo-list">
                <div className="todo-loading">Loading tasks...</div>
            </div>
        );
    }

    const emptyMessages = {
        tasks: {
            all: { title: 'No tasks yet', subtitle: 'Add your first task with the + button below' },
            today: { title: 'No tasks for today', subtitle: 'Tasks scheduled for today will appear here' },
        },
        history: { title: 'No completed tasks', subtitle: 'Completed tasks will appear here' },
    };

    const getEmptyMessage = () => {
        if (view === 'history') return emptyMessages.history;
        return emptyMessages.tasks[filter] || emptyMessages.tasks.all;
    };

    return (
        <div className="todo-list">
            {view === 'tasks' && (
                <div className="history-filter">
                    <button
                        className={`history-filter-btn ${filter === 'today' ? 'active' : ''}`}
                        onClick={() => onFilterChange('today')}
                    >
                        Today
                    </button>
                    <button
                        className={`history-filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => onFilterChange('all')}
                    >
                        All
                    </button>
                </div>
            )}

            <div className="todo-items-wrapper">
                {isAllFilterEmpty ? (
                    <div className="todo-empty">
                        <p>{getEmptyMessage().title}</p>
                        <span>{getEmptyMessage().subtitle}</span>
                    </div>
                ) : view === 'tasks' && filter === 'all' ? (
                    <div className="todo-items">
                        {renderSection('noDate', 'No date', noDateTasks)}
                        {renderSection('upcoming', 'Upcoming', upcomingTasks)}
                        {renderSection('today', 'Today', todayGroupTasks)}
                    </div>
                ) : (
                    <div className="todo-items">
                        {todayUnchecked.map(renderTask)}
                        {todayChecked.length > 0 && todayUnchecked.length > 0 && (
                            <div className="todo-separator" />
                        )}
                        {todayChecked.map(renderTask)}
                    </div>
                )}
            </div>

            {view === 'tasks' && (
                <div className="todo-bottom-bar">
                    <button
                        className="todo-bottom-btn"
                        onClick={openAddModal}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span>Add</span>
                    </button>
                    <button
                        className={`todo-bottom-btn ${editMode ? 'active' : ''}`}
                        onClick={toggleEditMode}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        <span>{editMode ? 'Done' : 'Edit'}</span>
                    </button>
                </div>
            )}

            {showAddForm && (
                <div className="todo-modal-overlay" onClick={closeAddModal} onKeyDown={handleModalKeyDown}>
                    <div className="todo-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="todo-modal-header">
                            <h3>New Task</h3>
                            <button type="button" className="todo-modal-close" onClick={closeAddModal}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={addTask}>
                            <div className="todo-modal-field">
                                <label>Title</label>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    className="todo-modal-input"
                                    placeholder="What needs to be done?"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    disabled={submitting}
                                    autoFocus
                                />
                            </div>
                            <div className="todo-modal-dates">
                                <div className="todo-modal-field">
                                    <label>Scheduled</label>
                                    <DatePicker value={scheduleDate} onChange={setScheduleDate} />
                                </div>
                            </div>
                            <div className="todo-modal-actions">
                                <button
                                    type="button"
                                    className={`todo-toolbar-btn ${isScheduledToday ? 'active' : ''}`}
                                    onClick={toggleToday}
                                >
                                    Today
                                </button>
                                <button
                                    type="submit"
                                    className="todo-add-btn"
                                    disabled={!newTitle.trim() || submitting}
                                >
                                    Add Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

TodoList.propTypes = {
    view: PropTypes.oneOf(['tasks', 'history']),
    filter: PropTypes.oneOf(['all', 'today']),
    onFilterChange: PropTypes.func,
};

export default TodoList;
