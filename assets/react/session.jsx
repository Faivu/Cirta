import React from 'react';
import { createRoot } from 'react-dom/client';
import SessionApp from './components/SessionApp';
import { SessionProvider } from './context/SessionContext';
import './styles/session.css';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('session-app');

    if (container) {
        const root = createRoot(container);
        root.render(
            <SessionProvider>
                <SessionApp />
            </SessionProvider>
        );
    }
});
