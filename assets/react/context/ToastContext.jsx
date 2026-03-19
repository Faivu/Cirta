import React, { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback(({ title, message = null, strategy = null, duration = 6000 }) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, title, message, strategy, duration }]);
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, dismissToast, toasts }}>
            {children}
        </ToastContext.Provider>
    );
}

ToastProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}

export default ToastContext;
