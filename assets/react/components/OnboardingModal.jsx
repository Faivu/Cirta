import React, { useState } from 'react';
import ReactDOM from 'react-dom';

const STORAGE_KEY = 'cirta_onboarded';

function OnboardingModal() {
    const [visible, setVisible] = useState(() => !localStorage.getItem(STORAGE_KEY));

    const handleStart = () => {
        localStorage.setItem(STORAGE_KEY, '1');
        setVisible(false);
    };

    if (!visible) return null;

    return ReactDOM.createPortal(
        <div className="onboarding-overlay">
            <div className="onboarding-content">
                <div className="onboarding-header">
                    <img src="/images/logo.png" alt="Cirta" className="onboarding-logo" />
                    <h1 className="onboarding-title">Great to have you here on Cirta</h1>
                </div>
                <p className="onboarding-subtitle">
                    A productivity tool built to help you manage your time and enhance your performance, without needing a lot of effort learning the app.
                    Cirta guides you to maintain better habits and techniques without it being a chore, no productivity experience needed!
                </p>

                <div className="onboarding-hints">
                    <div className="onboarding-hint">
                        <span className="onboarding-hint-arrow">←</span>
                        <span>
                            On the left lives the main bar, it contains the main features of the app: Session, Calendar, To-Do and Analytics Panels
                        </span>
                    </div>
                    <div className="onboarding-hint">
                        <span className="onboarding-hint-q">?</span>
                        <span>
                            Look for the <strong>?</strong> button inside each panel whenever
                            you need a quick guide on how that feature works. Good luck!
                        </span>
                    </div>
                </div>

                <button className="onboarding-cta" onClick={handleStart}>
                    Get Started
                </button>
            </div>
        </div>,
        document.body
    );
}

export default OnboardingModal;
