import React from 'react';
import PropTypes from 'prop-types';

/**
 * ConfirmModal - A simple confirmation dialog
 */
function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText, cancelText }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {title && <h3 className="modal-title">{title}</h3>}
                <p className="modal-message">{message}</p>
                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className="btn btn-danger" onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

ConfirmModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    title: PropTypes.string,
    message: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
};

ConfirmModal.defaultProps = {
    title: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
};

export default ConfirmModal;
