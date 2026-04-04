import { useState, useEffect } from 'react';

export function useLayoutStorage(key, defaults) {
    const [state, setState] = useState(() => {
        try {
            const saved = localStorage.getItem(key);
            if (saved) {
                const parsed = JSON.parse(saved);
                return Object.fromEntries(
                    Object.keys(defaults).map(k => [k, k in parsed ? parsed[k] : defaults[k]])
                );
            }
        } catch {}
        return { ...defaults };
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch {}
    }, [key, state]);

    const setField = (fieldKey) => (value) =>
        setState(prev => ({
            ...prev,
            [fieldKey]: typeof value === 'function' ? value(prev[fieldKey]) : value,
        }));

    return [state, setField];
}
