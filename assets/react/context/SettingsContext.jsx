import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const DEFAULTS = {
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

const CACHE_KEY = 'cirta_settings';

const SettingsContext = createContext({ ...DEFAULTS, _loaded: false });

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(() => {
        try {
            const stored = localStorage.getItem(CACHE_KEY);
            return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : DEFAULTS;
        } catch {
            return DEFAULTS;
        }
    });
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        fetch('/api/settings', { headers: { Accept: 'application/json' } })
            .then(r => r.json())
            .then(data => {
                setSettings(data);
                setLoaded(true);
                try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
            })
            .catch(() => setLoaded(true));
    }, []);

    return (
        <SettingsContext.Provider value={{ ...settings, _loaded: loaded }}>
            {children}
        </SettingsContext.Provider>
    );
}

SettingsProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export function useSettings() {
    return useContext(SettingsContext);
}

export default SettingsContext;
