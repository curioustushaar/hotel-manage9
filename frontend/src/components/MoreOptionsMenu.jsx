import React, { useState, useRef, useEffect } from 'react';
import './MoreOptionsMenu.css';

const MoreOptionsMenu = ({ onAction, buttonLabel = "More Options", buttonClassName = "", reservationStatus = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleOptionClick = (action) => {
        onAction?.(action);
        setIsOpen(false);
    };

    const status = (reservationStatus || '').toUpperCase().replace(/[-_ ]/g, '');

    const isCheckedIn = ['CHECKEDIN', 'INHOUSE', 'IN_HOUSE'].includes(status);
    const isUpcoming = ['RESERVED', 'CONFIRMED', 'UPCOMING', 'PENDING'].includes(status);
    const isClosed = ['CHECKEDOUT', 'CANCELLED', 'NOSHOW', 'VOID', 'VOIDED'].includes(status);

    const options = [
        { label: 'Check-In', value: 'check-in', icon: '✓', type: 'success', show: isUpcoming },
        { label: 'Add Payment', value: 'add-payment', icon: '💳', type: 'normal', show: !isClosed },
        { label: 'Amend Stay', value: 'amend-stay', icon: '📅', type: 'normal', show: !isClosed },
        { label: 'Room Move', value: 'room-move', icon: '🚪', type: 'normal', show: isCheckedIn },
        { label: 'Exchange Room', value: 'exchange-room', icon: '⇄', type: 'normal', show: isCheckedIn || isUpcoming },
        { label: 'Add Visitor', value: 'add-visitor', icon: '👤', type: 'normal', show: isCheckedIn },
        { label: 'No-Show', value: 'no-show', icon: '✕', type: 'danger', show: isUpcoming },
        { label: 'Void', value: 'void', icon: '🗑', type: 'danger', show: isUpcoming },
        { label: 'Cancel', value: 'cancel', icon: '⚠️', type: 'danger', show: isUpcoming || isCheckedIn },
    ];

    const visibleOptions = options.filter(o => o.show);

    return (
        <div className="more-options-menu-container" ref={dropdownRef}>
            <button
                className={`more-options-btn ${buttonClassName} ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                {buttonLabel}
                <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
            </button>

            <div className={`more-options-dropdown ${isOpen ? 'show' : ''}`}>
                {visibleOptions.length > 0 ? visibleOptions.map((option) => (
                    <div
                        key={option.value}
                        className={`more-options-item ${option.type}`}
                        onClick={() => handleOptionClick(option.value)}
                    >
                        <span className="option-icon">{option.icon}</span>
                        <span className="option-label">{option.label}</span>
                    </div>
                )) : (
                    <div className="more-options-item normal" style={{ cursor: 'default', opacity: 0.5 }}>
                        <span className="option-label">No actions available</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MoreOptionsMenu;
