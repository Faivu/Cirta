import React from 'react';
import { createRoot } from 'react-dom/client';
import DashboardLayout from './components/DashboardLayout';
import './styles/session.css';
import './styles/dashboard.css';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('dashboard-app');

    if (container) {
        const root = createRoot(container);
        root.render(<DashboardLayout />);
    }
});
