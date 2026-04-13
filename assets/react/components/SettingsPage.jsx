import React, { useState, useEffect, useCallback, useRef } from 'react';

const TIMEZONES = Intl.supportedValuesOf
    ? Intl.supportedValuesOf('timeZone')
    : ['UTC', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'America/New_York',
       'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Asia/Tokyo',
       'Asia/Shanghai', 'Asia/Kolkata', 'Australia/Sydney', 'Africa/Algiers'];

const DEFAULTS = {
    darkMode: false,
    calendarDragConfirm: true,
    calendarWeekStart: 'monday',
    calendarDefaultView: 'month',
    calendarTimeFormat: '24h',
    defaultStrategy: 'pomodoro',
    pomodoroSeriousMode: false,
    pomodoroWorkDuration: 25,
    pomodoroShortBreak: 5,
    pomodoroLongBreak: 15,
    flowtimeBreakRatio: 5,
    todoDefaultFilter: 'today',
    todoKeepFinishedVisible: true,
    todoUncheckedNoConfirm: false,
    timezone: 'UTC',
};

export default function SettingsPage() {
    const [settings, setSettings] = useState(DEFAULTS);
    const [saved, setSaved] = useState(DEFAULTS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const isDirty = JSON.stringify(settings) !== JSON.stringify(saved);

    useEffect(() => {
        document.documentElement.dataset.theme = settings.darkMode ? 'dark' : 'light';
    }, [settings.darkMode]);

    useEffect(() => {
        fetch('/api/settings', { headers: { Accept: 'application/json' } })
            .then(r => r.json())
            .then(data => { setSettings(data); setSaved(data); })
            .catch(() => setError('Failed to load settings.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!isDirty) return;
        const handler = (e) => { e.preventDefault(); e.returnValue = ''; };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [isDirty]);

    const set = (key) => (value) => setSettings(prev => ({ ...prev, [key]: value }));

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(settings),
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setSettings(data);
            setSaved(data);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2500);
        } catch {
            setError('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="settings-loading">Loading settings...</div>;

    return (
        <div className="settings-page">
            <div className="settings-header">
                <a href="/main" className="settings-back">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back
                </a>
                <h1 className="settings-title">Settings</h1>
            </div>

            <div className="settings-body">

                {/* Calendar */}
                <section className="settings-section">
                    <h2 className="settings-section-title">Calendar</h2>

                    <ToggleSetting
                        label="Ask for confirmation when moving an event"
                        description="Show a confirmation dialog before saving drag-and-drop changes."
                        value={settings.calendarDragConfirm}
                        onChange={set('calendarDragConfirm')}
                    />
                    <SelectSetting
                        label="Start week on"
                        value={settings.calendarWeekStart}
                        onChange={set('calendarWeekStart')}
                        options={[
                            { value: 'monday', label: 'Monday' },
                            { value: 'tuesday', label: 'Tuesday' },
                            { value: 'wednesday', label: 'Wednesday' },
                            { value: 'thursday', label: 'Thursday' },
                            { value: 'friday', label: 'Friday' },
                            { value: 'saturday', label: 'Saturday' },
                            { value: 'sunday', label: 'Sunday' },
                        ]}
                    />
                    <SelectSetting
                        label="Default calendar view"
                        value={settings.calendarDefaultView}
                        onChange={set('calendarDefaultView')}
                        options={[
                            { value: 'month', label: 'Month' },
                            { value: 'week', label: 'Week' },
                            { value: 'day', label: 'Day' },
                        ]}
                    />
                    <SelectSetting
                        label="Time format"
                        value={settings.calendarTimeFormat}
                        onChange={set('calendarTimeFormat')}
                        options={[
                            { value: '24h', label: '24-hour' },
                            { value: '12h', label: '12-hour' },
                        ]}
                    />
                </section>

                {/* Session */}
                <section className="settings-section">
                    <h2 className="settings-section-title">Session</h2>

                    <SelectSetting
                        label="Default strategy"
                        description="The strategy selected when you open the app."
                        value={settings.defaultStrategy}
                        onChange={set('defaultStrategy')}
                        options={[
                            { value: 'pomodoro', label: 'Pomodoro' },
                            { value: 'flowtime', label: 'Flowtime' },
                            { value: 'time_blocking', label: 'Time Blocking' },
                        ]}
                    />
                    <ToggleSetting
                        label="Pomodoro serious mode"
                        description="Disables manual mode switching. You must follow the work → break sequence."
                        value={settings.pomodoroSeriousMode}
                        onChange={set('pomodoroSeriousMode')}
                    />
                    <NumberSetting
                        label="Pomodoro work duration"
                        description="Default work session length in minutes."
                        value={settings.pomodoroWorkDuration}
                        onChange={set('pomodoroWorkDuration')}
                        min={1} max={99} unit="min"
                    />
                    <NumberSetting
                        label="Pomodoro short break"
                        value={settings.pomodoroShortBreak}
                        onChange={set('pomodoroShortBreak')}
                        min={1} max={30} unit="min"
                    />
                    <NumberSetting
                        label="Pomodoro long break"
                        value={settings.pomodoroLongBreak}
                        onChange={set('pomodoroLongBreak')}
                        min={1} max={60} unit="min"
                    />
                    <NumberSetting
                        label="Flowtime break ratio"
                        description="Minutes of work per minute of break. Default 5 means 25 min work = 5 min break."
                        value={settings.flowtimeBreakRatio}
                        onChange={set('flowtimeBreakRatio')}
                        min={1} max={10} unit="∶1"
                    />
                </section>

                {/* To-do */}
                <section className="settings-section">
                    <h2 className="settings-section-title">To-do List</h2>

                    <SelectSetting
                        label="Default tasks tab"
                        value={settings.todoDefaultFilter}
                        onChange={set('todoDefaultFilter')}
                        options={[
                            { value: 'today', label: 'Today' },
                            { value: 'all', label: 'All' },
                        ]}
                    />
                    <ToggleSetting
                        label="Keep finished tasks visible in Today"
                        description="Completed tasks remain visible and checked in the Today tab."
                        value={settings.todoKeepFinishedVisible}
                        onChange={set('todoKeepFinishedVisible')}
                    />
                    <ToggleSetting
                        label="Skip confirmation when unchecking tasks"
                        description="Uncheck finished tasks without a confirmation dialog."
                        value={settings.todoUncheckedNoConfirm}
                        onChange={set('todoUncheckedNoConfirm')}
                    />
                </section>

                {/* General */}
                <section className="settings-section">
                    <h2 className="settings-section-title">General</h2>

                    <div className="settings-row">
                        <div className="settings-row-label">
                            <span>Timezone</span>
                            <span className="settings-row-desc">Used to display session timestamps correctly.</span>
                        </div>
                        <TimezonePicker value={settings.timezone} onChange={set('timezone')} />
                    </div>
                </section>

                {/* Appearance */}
                <section className="settings-section">
                    <h2 className="settings-section-title">Appearance</h2>
                    <ToggleSetting
                        label="Dark mode"
                        description="Switch the interface to a dark color scheme."
                        value={settings.darkMode}
                        onChange={set('darkMode')}
                    />
                </section>

                {/* Account */}
                <section className="settings-section">
                    <h2 className="settings-section-title">Account</h2>
                    <div className="settings-row">
                        <div className="settings-row-label">
                            <span>Sign out</span>
                            <span className="settings-row-desc">Log out of your account.</span>
                        </div>
                        <a href="/logout" className="settings-btn-danger">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Logout
                        </a>
                    </div>
                </section>

            </div>

            {/* Sticky footer */}
            <div className="settings-footer">
                {error && <span className="settings-error">{error}</span>}
                {saveSuccess && <span className="settings-success">Settings saved.</span>}
                {isDirty && !saving && (
                    <span className="settings-unsaved">You have unsaved changes.</span>
                )}
                <button
                    className="settings-save-btn"
                    onClick={handleSave}
                    disabled={saving || !isDirty}
                >
                    {saving ? 'Saving...' : 'Save settings'}
                </button>
            </div>
        </div>
    );
}

function ToggleSetting({ label, description, value, onChange }) {
    return (
        <div className="settings-row">
            <div className="settings-row-label">
                <span>{label}</span>
                {description && <span className="settings-row-desc">{description}</span>}
            </div>
            <button
                className={`settings-toggle ${value ? 'on' : 'off'}`}
                onClick={() => onChange(!value)}
                aria-pressed={value}
            >
                <span className="settings-toggle-knob" />
            </button>
        </div>
    );
}

function SelectSetting({ label, description, value, onChange, options }) {
    return (
        <div className="settings-row">
            <div className="settings-row-label">
                <span>{label}</span>
                {description && <span className="settings-row-desc">{description}</span>}
            </div>
            <select
                className="settings-select"
                value={value}
                onChange={e => onChange(e.target.value)}
            >
                {options.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </div>
    );
}

function NumberSetting({ label, description, value, onChange, min, max, unit }) {
    return (
        <div className="settings-row">
            <div className="settings-row-label">
                <span>{label}</span>
                {description && <span className="settings-row-desc">{description}</span>}
            </div>
            <div className="settings-number">
                <input
                    type="number"
                    className="settings-number-input"
                    value={value}
                    min={min}
                    max={max}
                    onChange={e => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || min)))}
                />
                {unit && <span className="settings-number-unit">{unit}</span>}
            </div>
        </div>
    );
}

function TimezonePicker({ value, onChange }) {
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const filtered = search
        ? TIMEZONES.filter(tz => tz.toLowerCase().includes(search.toLowerCase()))
        : TIMEZONES;

    const handleSelect = (tz) => {
        onChange(tz);
        setSearch('');
        setOpen(false);
    };

    const handleBlur = (e) => {
        if (!containerRef.current?.contains(e.relatedTarget)) {
            setSearch('');
            setOpen(false);
        }
    };

    return (
        <div className="tz-picker" ref={containerRef} onBlur={handleBlur}>
            <div className="tz-input-row">
                <input
                    ref={inputRef}
                    type="text"
                    className="settings-select tz-search"
                    value={open ? search : value}
                    placeholder="Search timezones..."
                    onChange={e => { setSearch(e.target.value); setOpen(true); }}
                    onFocus={() => { setSearch(''); setOpen(true); }}
                />
                {value !== browserTz && (
                    <button
                        type="button"
                        className="tz-detect-btn"
                        onClick={() => handleSelect(browserTz)}
                        title={`Use detected timezone: ${browserTz}`}
                    >
                        Use {browserTz}
                    </button>
                )}
            </div>
            {open && (
                <div className="tz-dropdown">
                    {filtered.length === 0 ? (
                        <div className="tz-option tz-empty">No results</div>
                    ) : (
                        filtered.slice(0, 100).map(tz => (
                            <button
                                key={tz}
                                type="button"
                                className={`tz-option${tz === value ? ' active' : ''}`}
                                onMouseDown={() => handleSelect(tz)}
                            >
                                {tz}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
