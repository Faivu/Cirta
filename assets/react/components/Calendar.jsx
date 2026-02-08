import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

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
            // Month view returns array of dates
            setDateRange({
                start: range[0],
                end: range[range.length - 1],
            });
        } else if (range.start && range.end) {
            // Week/day view returns object with start/end
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

    // Handle event click
    const handleSelectEvent = (event) => {
        // TODO: Open event detail modal
        // For now, this is a placeholder for future implementation
    };

    // Handle slot selection (for creating new events)
    const handleSelectSlot = ({ start, end }) => {
        // TODO: Open create event modal
        // For now, this is a placeholder for future implementation
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
            <BigCalendar
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
                selectable
                popup
                views={['month', 'week', 'day']}
                components={{ toolbar: CustomToolbar }}
                style={{ height: '100%' }}
            />
        </div>
    );
}

export default Calendar;
