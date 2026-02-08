import React from 'react';
import './ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', isProcessing = false }) => {
    if (!isOpen) return null;

    return (
        <div className="confirmation-modal-overlay" onClick={onClose}>
            <div className="confirmation-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="confirmation-modal-header">
                    <h3>{title}</h3>
                    <button className="confirmation-close-btn" onClick={onClose}>×</button>
                </div>
                <div className="confirmation-modal-body">
                    <p>{message}</p>
                </div>
                <div className="confirmation-modal-footer">
                    <button 
                        className="confirmation-cancel-btn" 
                        onClick={onClose}
                        disabled={isProcessing}
                    >
                        {cancelText}
                    </button>
                    <button 
                        className="confirmation-confirm-btn" 
                        onClick={onConfirm}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
