import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
}

// Convert internal YYYY-MM-DD to display DD/MM/YYYY
function toDisplay(isoStr) {
    if (!isoStr) return '';
    const [y, m, d] = isoStr.split('-');
    return `${d}/${m}/${y}`;
}

// Parse display DD/MM/YYYY to internal YYYY-MM-DD (returns null if invalid)
function fromDisplay(displayStr) {
    const match = displayStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) return null;
    const [, d, m, y] = match;
    const day = parseInt(d, 10);
    const month = parseInt(m, 10);
    const year = parseInt(y, 10);
    if (month < 1 || month > 12 || day < 1) return null;
    const maxDays = new Date(year, month, 0).getDate();
    if (day > maxDays) return null;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

function DatePicker({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const [textValue, setTextValue] = useState(toDisplay(value));
    const [viewDate, setViewDate] = useState(() => {
        if (value) return new Date(value + 'T00:00:00');
        return new Date();
    });
    const [slideClass, setSlideClass] = useState('');
    const containerRef = useRef(null);

    useEffect(() => {
        setTextValue(toDisplay(value));
        if (value) setViewDate(new Date(value + 'T00:00:00'));
    }, [value]);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfWeek(year, month);
    const todayStr = new Date().toISOString().split('T')[0];
    const monthLabel = viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    const navigate = (dir) => {
        setSlideClass(dir === 1 ? 'slide-out-left' : 'slide-out-right');
        setTimeout(() => {
            setViewDate((prev) => {
                const d = new Date(prev);
                d.setMonth(d.getMonth() + dir);
                return d;
            });
            setSlideClass(dir === 1 ? 'slide-in-right' : 'slide-in-left');
            setTimeout(() => setSlideClass(''), 150);
        }, 150);
    };

    const selectDay = (day) => {
        const m = String(month + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        const val = `${year}-${m}-${d}`;
        onChange(val);
        setOpen(false);
    };

    const handleTextChange = (e) => {
        let raw = e.target.value;

        // Strip everything except digits
        const digits = raw.replace(/\D/g, '');

        // Auto-format: DD/MM/YYYY
        let formatted = '';
        for (let i = 0; i < digits.length && i < 8; i++) {
            if (i === 2 || i === 4) formatted += '/';
            formatted += digits[i];
        }

        setTextValue(formatted);

        const parsed = fromDisplay(formatted);
        if (parsed) {
            onChange(parsed);
            setViewDate(new Date(parsed + 'T00:00:00'));
        } else if (formatted === '') {
            onChange('');
        }
    };

    const handleFocus = (e) => {
        e.target.select();
        setOpen(true);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const now = new Date();
            const digits = textValue.replace(/\D/g, '');
            let completed = textValue;

            // Auto-complete partial input: DD -> DD/MM/YYYY, DD/MM -> DD/MM/YYYY
            if (/^\d{1,2}$/.test(digits)) {
                const d = digits.padStart(2, '0');
                const m = String(now.getMonth() + 1).padStart(2, '0');
                completed = `${d}/${m}/${now.getFullYear()}`;
            } else if (/^\d{3,4}$/.test(digits)) {
                const d = digits.slice(0, 2);
                const m = digits.slice(2).padStart(2, '0');
                completed = `${d}/${m}/${now.getFullYear()}`;
            }

            const parsed = fromDisplay(completed);
            if (parsed) {
                setTextValue(completed);
                onChange(parsed);
                setViewDate(new Date(parsed + 'T00:00:00'));
                setOpen(false);
            }
        }
    };

    return (
        <div className="datepicker-wrapper" ref={containerRef}>
            <input
                type="text"
                className="datepicker-text-input"
                value={textValue}
                onChange={handleTextChange}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
                placeholder="DD/MM/YYYY"
            />
            {open && (
                <div className="datepicker-dropdown">
                    <div className="datepicker-header">
                        <button type="button" className="datepicker-nav" onClick={() => navigate(-1)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <span className="datepicker-month-label">{monthLabel}</span>
                        <button type="button" className="datepicker-nav" onClick={() => navigate(1)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 6 15 12 9 18" />
                            </svg>
                        </button>
                    </div>
                    <div className="datepicker-grid-container">
                        <div className={`datepicker-grid ${slideClass}`}>
                            <div className="datepicker-days-header">
                                {DAYS.map((d) => (
                                    <span key={d} className="datepicker-day-label">{d}</span>
                                ))}
                            </div>
                            <div className="datepicker-days">
                                {Array.from({ length: firstDay }).map((_, i) => (
                                    <span key={`e-${i}`} className="datepicker-day empty" />
                                ))}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1;
                                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                    const isSelected = dateStr === value;
                                    const isToday = dateStr === todayStr;
                                    return (
                                        <button
                                            key={day}
                                            type="button"
                                            className={`datepicker-day${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}`}
                                            onClick={() => selectDay(day)}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

DatePicker.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
};

export default DatePicker;
