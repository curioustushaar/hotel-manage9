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
        { label: 'Check-In', value: 'check-in', icon: '✓', color: '#10b981' }, // Green
        { label: 'Add Payment', value: 'add-payment', icon: '💳', color: '#0ea5e9' }, // Blue
        { label: 'Amend Stay', value: 'amend-stay', icon: '📅', color: '#f59e0b' }, // Amber
        { label: 'Room Move', value: 'room-move', icon: '🚪', color: '#d97706' }, // Orange
        { label: 'Exchange Room', value: 'exchange-room', icon: '⇄', color: '#6366f1' }, // Indigo
        { label: 'Add Visitor', value: 'add-visitor', icon: '👤', color: '#8b5cf6' }, // Violet
        { label: 'No-Show', value: 'no-show', icon: '✕', color: '#ef4444' }, // Red
        { label: 'Void', value: 'void', icon: '🗑', color: '#6b7280' }, // Gray
        { label: 'Cancel', value: 'cancel', icon: '⚠️', color: '#f97316' } // Orange
    ];

    return (
        <div className="more-options-menu-container" ref={dropdownRef}>
            <button
                className={`more-options-btn ${buttonClassName} ${isOpen ? 'active' : ''}`}
                onClick={toggleOpen}
                type="button"
            >
                {buttonLabel}
                <span className="dropdown-arrow">▼</span>
            </button>

            {isOpen && (
                <div className="more-options-dropdown">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`more-options-item ${option.value}`}
                            onClick={() => handleOptionClick(option.value)}
                        >
                            <span className="option-icon" style={{ color: option.color }}>{option.icon}</span>
                            <span className="option-label">{option.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MoreOptionsMenu;
