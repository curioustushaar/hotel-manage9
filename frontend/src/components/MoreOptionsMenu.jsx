import React, { useState, useRef, useEffect } from 'react';
import './MoreOptionsMenu.css';

const MoreOptionsMenu = ({ onAction, buttonLabel = "More Options", buttonClassName = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleOpen = () => setIsOpen(!isOpen);

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleOptionClick = (action) => {
        if (onAction) {
            onAction(action);
        }
        setIsOpen(false);
    };

    const options = [
        { label: 'Check-In', value: 'check-in', icon: '✓', type: 'success' },
        { label: 'Add Payment', value: 'add-payment', icon: '💳', type: 'normal' },
        { label: 'Amend Stay', value: 'amend-stay', icon: '📅', type: 'normal' },
        { label: 'Room Move', value: 'room-move', icon: '🚪', type: 'normal' },
        { label: 'Exchange Room', value: 'exchange-room', icon: '⇄', type: 'normal' },
        { label: 'Add Visitor', value: 'add-visitor', icon: '👤', type: 'normal' },
        { label: 'No-Show', value: 'no-show', icon: '✕', type: 'danger' },
        { label: 'Void', value: 'void', icon: '🗑', type: 'danger' },
        { label: 'Cancel', value: 'cancel', icon: '⚠️', type: 'danger' }
    ];

    return (
        <div className="more-options-menu-container" ref={dropdownRef}>
            <button
                className={`more-options-btn ${buttonClassName} ${isOpen ? 'active' : ''}`}
                onClick={toggleOpen}
                type="button"
            >
                {buttonLabel}
                <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
            </button>

            <div className={`more-options-dropdown ${isOpen ? 'show' : ''}`}>
                {options.map((option) => (
                    <div
                        key={option.value}
                        className={`more-options-item ${option.type}`}
                        onClick={() => handleOptionClick(option.value)}
                    >
                        <span className="option-icon">{option.icon}</span>
                        <span className="option-label">{option.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MoreOptionsMenu;
