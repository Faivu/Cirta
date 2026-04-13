import React from 'react';
import { createRoot } from 'react-dom/client';
import SettingsPage from './components/SettingsPage';
import './styles/variables.css';
import './styles/dark.css';
import './styles/settings.css';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('settings-app');
    if (container) {
        const root = createRoot(container);
        root.render(<SettingsPage />);
    }
});
