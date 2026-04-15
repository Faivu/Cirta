import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { useSettings } from '../context/SettingsContext';
import ConfirmModal from './ConfirmModal';

const locales = { 'en-US': enUS };

const WEEK_START_MAP = {
    sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
    thursday: 4, friday: 5, saturday: 6,
};

const DnDCalendar = withDragAndDrop(BigCalendar);

const PALETTE = [
    '#3b82f6', '#ef4444', '#22c55e', '#a855f7',
    '#f97316', '#ec4899', '#14b8a6', '#f59e0b',
    '#6366f1', '#6b7280',
];

function ColorSwatches({ selected, onChange }) {
    return (
        <div className="calendar-color-swatches">
            {PALETTE.map(c => (
                <button
                    key={c}
                    type="button"
                    className={`calendar-color-swatch${selected === c ? ' selected' : ''}`}
                    style={{ background: c }}
                    onClick={() => onChange(c)}
                />
            ))}
        </div>
    );
}

/**
 * Custom toolbar component
 */
function CustomToolbar({ label, onNavigate, onView, view }) {
    return (
        <div className="custom-toolbar">
            <div className="toolbar-nav">
                <button className="today-btn" onClick={() => onNavigate('TODAY')}>
                    Today
                </button>
                <button className="nav-btn" onClick={() => onNavigate('PREV')}>
                    &lt;
                </button>
                <button className="nav-btn" onClick={() => onNavigate('NEXT')}>
                    &gt;
                </button>
                <span className="toolbar-label">{label}</span>
            </div>
            <div className="toolbar-views">
                <button
                    className={view === 'month' ? 'active' : ''}
                    onClick={() => onView('month')}
                >
                    Month
                </button>
                <button
                    className={view === 'week' ? 'active' : ''}
                    onClick={() => onView('week')}
                >
                    Week
                </button>
                <button
                    className={view === 'day' ? 'active' : ''}
                    onClick={() => onView('day')}
                >
                    Day
                </button>
            </div>
        </div>
    );
}

CustomToolbar.propTypes = {
    label: PropTypes.node.isRequired,
    onNavigate: PropTypes.func.isRequired,
    onView: PropTypes.func.isRequired,
    view: PropTypes.string.isRequired,
};

/**
 * Custom event component - shows title, and time only if duration >= 45 min (not for all-day)
 */
function CustomEvent({ event, onMouseEnter, onMouseLeave }) {
    const { calendarTimeFormat } = useSettings();
    const timeFmt = calendarTimeFormat === '24h' ? 'HH:mm' : 'h:mm a';
    const isAllDay = event.allDay;
    const durationMinutes = (event.end - event.start) / (1000 * 60);
    const showTime = !isAllDay && durationMinutes >= 45;
    const isShort = !isAllDay && durationMinutes <= 15;
    const timeText = `${format(event.start, timeFmt)} - ${format(event.end, timeFmt)}`;

    return (
        <div
            className={`custom-event ${isShort ? 'custom-event-short' : ''}`}
            onMouseEnter={(e) => onMouseEnter && onMouseEnter(event, e)}
            onMouseLeave={onMouseLeave}
        >
            <span className="custom-event-title">{event.title}</span>
            {showTime && (
                <span className="custom-event-time">{timeText}</span>
            )}
        </div>
    );
}

CustomEvent.propTypes = {
    event: PropTypes.object.isRequired,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
};

/**
 * Calendar component using react-big-calendar
 * Displays events fetched from the API
 */
function Calendar() {
    const { calendarDragConfirm, calendarDefaultView, calendarWeekStart, calendarTimeFormat } = useSettings();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Initialize directly from (localStorage-cached) settings, no flash
    const [view, setView] = useState(calendarDefaultView);
    const [date, setDate] = useState(new Date());
    const [dateRange, setDateRange] = useState(null);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEventModal, setShowEventModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventColor, setNewEventColor] = useState(PALETTE[0]);
    const [newEventAllDay, setNewEventAllDay] = useState(false);
    const [editEventTitle, setEditEventTitle] = useState('');
    const [editEventColor, setEditEventColor] = useState(PALETTE[0]);
    const [editEventAllDay, setEditEventAllDay] = useState(false);
    const [saving, setSaving] = useState(false);

    // Tooltip state
    const [tooltip, setTooltip] = useState({ visible: false, event: null, x: 0, y: 0 });

    // Confirm modal state
    const [confirmModal, setConfirmModal] = useState({ isOpen: false });

    const showConfirm = useCallback((options) => new Promise((resolve) => {
        setConfirmModal({ ...options, isOpen: true, resolve });
    }), []);

    const handleConfirmResponse = (result) => {
        confirmModal.resolve(result);
        setConfirmModal({ isOpen: false });
    };

    // Dynamic localizer based on week start setting
    const localizer = useMemo(() => {
        const weekStartsOn = WEEK_START_MAP[calendarWeekStart] ?? 1;
        return dateFnsLocalizer({
            format,
            parse,
            startOfWeek: (date) => startOfWeek(date, { weekStartsOn }),
            getDay,
            locales,
        });
    }, [calendarWeekStart]);

    // Time format for gutter/agenda
    const timeFmt = calendarTimeFormat === '24h' ? 'HH:mm' : 'h:mm a';

    // Keyboard event handler for modals
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (showCreateModal) {
                    handleCloseCreateModal();
                } else if (showEventModal) {
                    handleCloseEventModal();
                }
            }
        };

        if (showCreateModal || showEventModal) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [showCreateModal, showEventModal, isEditing, editEventTitle, newEventTitle]);

    // Fetch events from API with optional date range
    const fetchEvents = useCallback(async (start, end) => {
        try {
            setLoading(true);

            let url = '/api/events';
            if (start && end) {
                const params = new URLSearchParams({
                    start: start.toISOString(),
                    end: end.toISOString(),
                });
                url += `?${params}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }

            const data = await response.json();

            // Transform API data to react-big-calendar format
            const calendarEvents = data.map(event => ({
                id: event.id,
                title: event.title,
                start: new Date(event.startAt),
                end: new Date(event.endAt),
                allDay: event.allDay,
                resource: {
                    color: event.color,
                    category: event.category,
                },
            }));

            setEvents(calendarEvents);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // Refetch when date range changes
    useEffect(() => {
        if (dateRange) {
            fetchEvents(dateRange.start, dateRange.end);
        }
    }, [dateRange, fetchEvents]);

    // Handle range change (when navigating or changing view)
    const handleRangeChange = (range) => {
        if (Array.isArray(range)) {
            // Month view returns array of dates, day view returns array with one date
            const start = range[0];
            const end = range[range.length - 1];
            // For day view (single date), set end to end of that day
            if (range.length === 1) {
                const endOfDay = new Date(start);
                endOfDay.setHours(23, 59, 59, 999);
                setDateRange({ start, end: endOfDay });
            } else {
                setDateRange({ start, end });
            }
        } else if (range.start && range.end) {
            // Week view returns object with start/end
            setDateRange(range);
        }
    };

    // Custom event styling based on event color
    const eventStyleGetter = (event) => {
        const backgroundColor = event.resource?.color || '#3b82f6';
        return {
            style: {
                backgroundColor,
                borderRadius: '4px',
                opacity: 0.9,
                color: 'white',
                border: 'none',
                display: 'block',
            },
        };
    };

    const hideTooltip = useCallback(() => {
        setTooltip({ visible: false, event: null, x: 0, y: 0 });
    }, []);

    // Hide tooltip on any mousedown (covers drag start and clicks)
    useEffect(() => {
        document.addEventListener('mousedown', hideTooltip);
        return () => document.removeEventListener('mousedown', hideTooltip);
    }, [hideTooltip]);

    // Tooltip handlers — memoized so components object stays stable across tooltip state changes
    const handleEventMouseEnter = useCallback((event, e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            visible: true,
            event,
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
        });
    }, []);

    const handleEventMouseLeave = hideTooltip;

    const calendarComponents = useMemo(() => ({
        toolbar: CustomToolbar,
        event: (props) => (
            <CustomEvent
                {...props}
                onMouseEnter={handleEventMouseEnter}
                onMouseLeave={handleEventMouseLeave}
            />
        ),
    }), [handleEventMouseEnter, handleEventMouseLeave]);

    // Handle event click - show event details modal
    const handleSelectEvent = (event) => {
        setTooltip({ visible: false, event: null, x: 0, y: 0 });
        setSelectedEvent(event);
        setEditEventTitle(event.title);
        setIsEditing(false);
        setShowEventModal(true);
    };

    // Handle closing event modal with unsaved changes check
    const handleCloseEventModal = async () => {
        if (saving) return;

        const hasChanges = isEditing && (
            editEventTitle !== selectedEvent?.title ||
            editEventColor !== (selectedEvent?.resource?.color || PALETTE[0]) ||
            editEventAllDay !== (selectedEvent?.allDay ?? false)
        );
        if (hasChanges) {
            const confirmed = await showConfirm({
                title: 'Discard Changes',
                message: 'You have unsaved changes. Are you sure you want to discard them?',
                confirmText: 'Discard',
                cancelText: 'Keep Editing',
            });
            if (!confirmed) return;
        }
        setShowEventModal(false);
        setIsEditing(false);
    };

    // Handle closing create modal with unsaved changes check
    const handleCloseCreateModal = async () => {
        if (saving) return;

        const hasChanges = newEventTitle.trim() !== '';
        if (hasChanges) {
            const confirmed = await showConfirm({
                title: 'Discard Changes',
                message: 'You have unsaved changes. Are you sure you want to discard them?',
                confirmText: 'Discard',
                cancelText: 'Keep Editing',
            });
            if (!confirmed) return;
        }
        setShowCreateModal(false);
        setNewEventTitle('');
        setNewEventColor(PALETTE[0]);
        setNewEventAllDay(false);
    };

    // Handle slot selection - open create modal
    const handleSelectSlot = ({ start, end }) => {
        setSelectedSlot({ start, end });
        setNewEventTitle('');
        setShowCreateModal(true);
    };

    // Create new event
    const handleCreateEvent = async () => {
        if (!newEventTitle.trim() || !selectedSlot) return;

        setSaving(true);
        try {
            const response = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newEventTitle,
                    color: newEventColor,
                    allDay: newEventAllDay,
                    startAt: selectedSlot.start.toISOString(),
                    endAt: selectedSlot.end.toISOString(),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create event');
            }

            const newEvent = await response.json();
            setEvents(prev => [...prev, {
                id: newEvent.id,
                title: newEvent.title,
                start: new Date(newEvent.startAt),
                end: new Date(newEvent.endAt),
                allDay: newEvent.allDay,
                resource: {
                    color: newEvent.color,
                    category: newEvent.category,
                },
            }]);
            setShowCreateModal(false);
            setNewEventTitle('');
            setNewEventColor(PALETTE[0]);
            setNewEventAllDay(false);
            setSelectedSlot(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // Update event
    const handleUpdateEvent = async () => {
        if (!selectedEvent || !editEventTitle.trim()) return;

        setSaving(true);
        try {
            const response = await fetch(`/api/events/${selectedEvent.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editEventTitle,
                    color: editEventColor,
                    allDay: editEventAllDay,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update event');
            }

            const updatedEvent = await response.json();
            setEvents(prev => prev.map(e =>
                e.id === selectedEvent.id
                    ? { ...e, title: updatedEvent.title, allDay: updatedEvent.allDay, resource: { ...e.resource, color: updatedEvent.color } }
                    : e
            ));
            setShowEventModal(false);
            setSelectedEvent(null);
            setIsEditing(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // Delete event
    const handleDeleteEvent = async () => {
        if (!selectedEvent) return;

        const confirmed = await showConfirm({
            title: 'Delete Event',
            message: `Delete "${selectedEvent.title}"? This cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            destructive: true,
        });
        if (!confirmed) return;

        setSaving(true);
        try {
            const response = await fetch(`/api/events/${selectedEvent.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete event');
            }

            setEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
            setShowEventModal(false);
            setSelectedEvent(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // Handle event drag and drop (move event)
    const handleEventDrop = async ({ event, start, end }) => {
        if (calendarDragConfirm) {
            const confirmed = await showConfirm({
                title: 'Move Event',
                message: `Move "${event.title}" to the new time?`,
                confirmText: 'Move',
                cancelText: 'Cancel',
            });
            if (!confirmed) return;
        }
        try {
            const response = await fetch(`/api/events/${event.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startAt: start.toISOString(),
                    endAt: end.toISOString(),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to move event');
            }

            setEvents(prev => prev.map(e =>
                e.id === event.id ? { ...e, start, end } : e
            ));
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle event resize
    const handleEventResize = async ({ event, start, end }) => {
        try {
            const response = await fetch(`/api/events/${event.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startAt: start.toISOString(),
                    endAt: end.toISOString(),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to resize event');
            }

            setEvents(prev => prev.map(e =>
                e.id === event.id ? { ...e, start, end } : e
            ));
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div className="calendar-container">
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    Loading events...
                </div>
            </div>
        );
    }

    return (
        <div className="calendar-container" onMouseLeave={hideTooltip}>
            {error && (
                <div style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '10px' }}>
                    {error}
                </div>
            )}
            <DnDCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                view={view}
                onView={setView}
                date={date}
                onNavigate={setDate}
                onRangeChange={handleRangeChange}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                onEventDrop={handleEventDrop}
                onEventResize={handleEventResize}
                resizable
                selectable
                popup
                step={15}
                timeslots={4}
                views={['month', 'week', 'day']}
                components={calendarComponents}
                formats={{
                    eventTimeRangeFormat: () => null,
                    timeGutterFormat: timeFmt,
                    agendaTimeFormat: timeFmt,
                }}
                style={{ height: '100%' }}
            />

            {/* Create Event Modal */}
            {showCreateModal && (
                <div
                    className="calendar-modal-overlay"
                    onClick={handleCloseCreateModal}
                >
                    <div className="calendar-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Create Event</h3>
                        <input
                            type="text"
                            placeholder="Event title"
                            value={newEventTitle}
                            onChange={(e) => setNewEventTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && newEventTitle.trim() && !saving) {
                                    handleCreateEvent();
                                }
                            }}
                            className="calendar-modal-input"
                            autoFocus
                        />
                        <p className="calendar-modal-time">
                            {selectedSlot && (newEventAllDay
                                ? format(selectedSlot.start, 'PP')
                                : `${format(selectedSlot.start, 'PPp')} - ${format(selectedSlot.end, 'p')}`
                            )}
                        </p>
                        <ColorSwatches selected={newEventColor} onChange={setNewEventColor} />
                        <label className="calendar-modal-allday">
                            <input
                                type="checkbox"
                                checked={newEventAllDay}
                                onChange={(e) => setNewEventAllDay(e.target.checked)}
                            />
                            All day
                        </label>
                        <div className="calendar-modal-actions">
                            <button
                                onClick={handleCloseCreateModal}
                                className="calendar-modal-btn cancel"
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateEvent}
                                className="calendar-modal-btn confirm"
                                disabled={saving || !newEventTitle.trim()}
                            >
                                {saving ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Event Details Modal */}
            {showEventModal && selectedEvent && (
                <div
                    className="calendar-modal-overlay"
                    onClick={handleCloseEventModal}
                >
                    <div className="calendar-modal" onClick={(e) => e.stopPropagation()}>
                        {!isEditing && (
                            <button
                                className="calendar-modal-close"
                                onClick={handleCloseEventModal}
                                disabled={saving}
                            >
                                &times;
                            </button>
                        )}
                        {isEditing ? (
                            <>
                                <input
                                    type="text"
                                    value={editEventTitle}
                                    onChange={(e) => setEditEventTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && editEventTitle.trim() && !saving) {
                                            handleUpdateEvent();
                                        }
                                    }}
                                    className="calendar-modal-input"
                                    autoFocus
                                />
                                <ColorSwatches selected={editEventColor} onChange={setEditEventColor} />
                                <label className="calendar-modal-allday">
                                    <input
                                        type="checkbox"
                                        checked={editEventAllDay}
                                        onChange={(e) => setEditEventAllDay(e.target.checked)}
                                    />
                                    All day
                                </label>
                            </>
                        ) : (
                            <h3>{selectedEvent.title}</h3>
                        )}
                        <p className="calendar-modal-time">
                            {selectedEvent.allDay
                                ? format(selectedEvent.start, 'PP')
                                : `${format(selectedEvent.start, 'PPp')} - ${format(selectedEvent.end, 'p')}`
                            }
                        </p>
                        <div className="calendar-modal-actions">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleCloseEventModal}
                                        className="calendar-modal-btn cancel"
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateEvent}
                                        className="calendar-modal-btn confirm"
                                        disabled={saving || !editEventTitle.trim()}
                                    >
                                        {saving ? 'Saving...' : 'Save'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleDeleteEvent}
                                        className="calendar-modal-btn delete"
                                        disabled={saving}
                                        style={{ marginRight: 'auto' }}
                                    >
                                        {saving ? 'Deleting...' : 'Delete'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(true);
                                            setEditEventColor(selectedEvent.resource?.color || PALETTE[0]);
                                            setEditEventAllDay(selectedEvent.allDay ?? false);
                                        }}
                                        className="calendar-modal-btn confirm"
                                        disabled={saving}
                                    >
                                        Edit
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Event Tooltip */}
            {tooltip.visible && tooltip.event && (
                <div
                    className="event-tooltip"
                    style={{
                        position: 'fixed',
                        left: tooltip.x,
                        top: tooltip.y,
                        transform: 'translate(-50%, -100%)',
                        background: '#1f2937',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        whiteSpace: 'pre-line',
                        zIndex: 10000,
                        pointerEvents: 'none',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                >
                    <div style={{ fontWeight: 500 }}>{tooltip.event.title}</div>
                    {!tooltip.event.allDay && (
                        <div style={{ opacity: 0.85, marginTop: '2px' }}>
                            {format(tooltip.event.start, timeFmt)} - {format(tooltip.event.end, timeFmt)}
                        </div>
                    )}
                </div>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message || ''}
                confirmText={confirmModal.confirmText}
                cancelText={confirmModal.cancelText}
                destructive={confirmModal.destructive}
                onConfirm={() => handleConfirmResponse(true)}
                onCancel={() => handleConfirmResponse(false)}
            />
        </div>
    );
}

export default Calendar;
