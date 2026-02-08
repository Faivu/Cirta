import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const DnDCalendar = withDragAndDrop(BigCalendar);

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
    const isAllDay = event.allDay;
    const durationMinutes = (event.end - event.start) / (1000 * 60);
    const showTime = !isAllDay && durationMinutes >= 45;
    const isShort = !isAllDay && durationMinutes <= 15;
    const timeText = `${format(event.start, 'p')} - ${format(event.end, 'p')}`;

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
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [view, setView] = useState('week');
    const [date, setDate] = useState(new Date());
    const [dateRange, setDateRange] = useState(null);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEventModal, setShowEventModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [editEventTitle, setEditEventTitle] = useState('');
    const [saving, setSaving] = useState(false);

    // Tooltip state
    const [tooltip, setTooltip] = useState({ visible: false, event: null, x: 0, y: 0 });

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

    // Tooltip handlers
    const handleEventMouseEnter = (event, e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            visible: true,
            event,
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
        });
    };

    const handleEventMouseLeave = () => {
        setTooltip({ visible: false, event: null, x: 0, y: 0 });
    };

    // Handle event click - show event details modal
    const handleSelectEvent = (event) => {
        setTooltip({ visible: false, event: null, x: 0, y: 0 });
        setSelectedEvent(event);
        setEditEventTitle(event.title);
        setIsEditing(false);
        setShowEventModal(true);
    };

    // Handle closing event modal with unsaved changes check
    const handleCloseEventModal = () => {
        if (saving) return;

        const hasChanges = isEditing && editEventTitle !== selectedEvent?.title;
        if (hasChanges) {
            if (window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
                setShowEventModal(false);
                setIsEditing(false);
            }
        } else {
            setShowEventModal(false);
            setIsEditing(false);
        }
    };

    // Handle closing create modal with unsaved changes check
    const handleCloseCreateModal = () => {
        if (saving) return;

        const hasChanges = newEventTitle.trim() !== '';
        if (hasChanges) {
            if (window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
                setShowCreateModal(false);
                setNewEventTitle('');
            }
        } else {
            setShowCreateModal(false);
            setNewEventTitle('');
        }
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
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update event');
            }

            const updatedEvent = await response.json();
            setEvents(prev => prev.map(e =>
                e.id === selectedEvent.id
                    ? { ...e, title: updatedEvent.title }
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
        <div className="calendar-container">
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
                components={{
                    toolbar: CustomToolbar,
                    event: (props) => (
                        <CustomEvent
                            {...props}
                            onMouseEnter={handleEventMouseEnter}
                            onMouseLeave={handleEventMouseLeave}
                        />
                    ),
                }}
                formats={{
                    eventTimeRangeFormat: () => null,
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
                            {selectedSlot && format(selectedSlot.start, 'PPp')} - {selectedSlot && format(selectedSlot.end, 'p')}
                        </p>
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
                        ) : (
                            <h3>{selectedEvent.title}</h3>
                        )}
                        <p className="calendar-modal-time">
                            {format(selectedEvent.start, 'PPp')} - {format(selectedEvent.end, 'p')}
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
                                        onClick={() => setIsEditing(true)}
                                        className="calendar-modal-btn confirm"
                                        disabled={saving}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={handleDeleteEvent}
                                        className="calendar-modal-btn delete"
                                        disabled={saving}
                                    >
                                        {saving ? 'Deleting...' : 'Delete'}
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
                            {format(tooltip.event.start, 'p')} - {format(tooltip.event.end, 'p')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Calendar;
