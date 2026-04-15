import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

function MediaSlot({ src }) {
    if (!src) {
        return (
            <div className="info-modal-placeholder">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                    <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Screenshot coming soon</span>
            </div>
        );
    }

    if (src.match(/\.(mp4|webm|ogg)$/i)) {
        return (
            <video
                src={src}
                autoPlay
                loop
                muted
                playsInline
                className="info-modal-media"
            />
        );
    }

    return <img src={src} alt="" className="info-modal-media" />;
}

function InfoModal({ isOpen, slides, onClose }) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (!isOpen) return;
        setIndex(0);
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const slide = slides[index];
    const total = slides.length;

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="info-modal" onClick={(e) => e.stopPropagation()}>
                <button className="info-modal-close" onClick={onClose} aria-label="Close">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </button>

                <div className="info-modal-body">
                    <h3 className="info-modal-title">{slide.title}</h3>
                    <p className="info-modal-desc">{slide.description}</p>
                </div>

                <div className="info-modal-image">
                    <MediaSlot src={slide.media} />
                </div>

                {total > 1 && (
                    <div className="info-modal-nav">
                        {index > 0 ? (
                            <button
                                className="info-modal-arrow"
                                onClick={() => setIndex(i => i - 1)}
                                aria-label="Back"
                            >
                                Back
                            </button>
                        ) : (
                            <div className="info-modal-arrow-placeholder" />
                        )}

                        <div className="info-modal-dots">
                            {slides.map((_, i) => (
                                <button
                                    key={i}
                                    className={`info-modal-dot ${i === index ? 'active' : ''}`}
                                    onClick={() => setIndex(i)}
                                    aria-label={`Go to slide ${i + 1}`}
                                />
                            ))}
                        </div>

                        {index < total - 1 ? (
                            <button
                                className="info-modal-arrow"
                                onClick={() => setIndex(i => i + 1)}
                                aria-label="Next"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                className="info-modal-arrow info-modal-arrow-gotit"
                                onClick={onClose}
                                aria-label="Got it"
                            >
                                Got it!
                            </button>
                        )}
                    </div>
                )}

            </div>
        </div>,
        document.body
    );
}

InfoModal.propTypes = {
    isOpen:  PropTypes.bool.isRequired,
    slides:  PropTypes.arrayOf(PropTypes.shape({
        title:       PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        media:       PropTypes.string,
    })).isRequired,
    onClose: PropTypes.func.isRequired,
};

export default InfoModal;
