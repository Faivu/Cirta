import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useToast } from '../context/ToastContext';

const STRATEGY_ACCENT = {
    pomodoro:      '#ef4444',
    flowtime:      '#3b82f6',
    time_blocking: '#92400e',
};

function Toast({ id, title, message, strategy, duration }) {
    const { dismissToast } = useToast();
    const [visible, setVisible] = useState(false);
    const hideTimerRef = useRef(null);
    const remainingRef = useRef(duration);
    const pausedAtRef = useRef(null);

    const startHideTimer = (delay) => {
        hideTimerRef.current = setTimeout(() => {
            setVisible(false);
            setTimeout(() => dismissToast(id), 300);
        }, delay);
    };

    useEffect(() => {
        const showTimer = requestAnimationFrame(() => setVisible(true));
        startHideTimer(duration);

        return () => {
            cancelAnimationFrame(showTimer);
            clearTimeout(hideTimerRef.current);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleMouseEnter = () => {
        clearTimeout(hideTimerRef.current);
        pausedAtRef.current = Date.now();
    };

    const handleMouseLeave = () => {
        const elapsed = Date.now() - pausedAtRef.current;
        remainingRef.current = Math.max(0, remainingRef.current - elapsed);
        startHideTimer(remainingRef.current);
    };

    return (
        <div
            className={`toast${visible ? ' toast-visible' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="toast-body">
                <span className="toast-title">{title}</span>
                {message && <span className="toast-message">{message}</span>}
            </div>
            <button
                className="toast-close"
                onClick={() => {
                    setVisible(false);
                    setTimeout(() => dismissToast(id), 300);
                }}
            >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>
        </div>
    );
}

Toast.propTypes = {
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string,
    strategy: PropTypes.string,
    duration: PropTypes.number.isRequired,
};

Toast.defaultProps = {
    message: null,
    strategy: null,
};

function ToastContainer() {
    const { toasts } = useToast();

    return (
        <div className="toast-container">
            {toasts.map(toast => <Toast key={toast.id} {...toast} />)}
        </div>
    );
}

export default ToastContainer;
