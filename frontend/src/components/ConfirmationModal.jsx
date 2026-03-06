import React from 'react';
import { createPortal } from 'react-dom';
import './ConfirmationModal.css';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isProcessing = false,
    variant = 'primary', // primary, success, danger
    icon = null
}) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="confirmation-modal-overlay" onClick={onClose}>
            <div className="confirmation-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="confirmation-modal-header">
                    <div className="header-title-group">
                        {icon && <span className="modal-icon">{icon}</span>}
                        <h3>{title}</h3>
                    </div>
                    <button className="confirmation-close-btn" onClick={onClose}>×</button>
                </div>
                <div className="confirmation-modal-body">
                    <p className="modal-message">{message}</p>
                </div>
                <div className="confirmation-modal-footer">
                    {cancelText !== null && (
                        <button
                            className="confirmation-cancel-btn"
                            onClick={onClose}
                            disabled={isProcessing}
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        className={`confirmation-confirm-btn variant-${variant}`}
                        onClick={onConfirm}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmationModal;
