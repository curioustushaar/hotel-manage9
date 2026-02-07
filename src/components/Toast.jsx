import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, onClose, type = 'success' }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <>
            <div className="toast-overlay"></div>
            <div className={`toast-notification toast-${type}`}>
                <div className="toast-content">
                    <div className="toast-icon">
                        {type === 'success' && (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        )}
                    </div>
                    <div className="toast-message">{message}</div>
                </div>
            </div>
        </>
    );
};

export default Toast;
