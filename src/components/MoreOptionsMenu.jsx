import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './MoreOptionsMenu.css';

const MoreOptionsMenu = ({ booking, onActionSelect, buttonLabel = '⋯' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    const actions = [
        { 
            id: 'check-in', 
            label: '✓ Check-In', 
            color: '#16a34a',
            disabled: booking.status === 'Checked-in' || booking.status === 'Cancelled' || booking.status === 'Voided'
        },
        { 
            id: 'add-payment', 
            label: '💳 Add Payment', 
            color: '#2563eb',
            disabled: booking.status === 'Cancelled' || booking.status === 'Voided'
        },
        { 
            id: 'amend-stay', 
            label: '📅 Amend Stay', 
            color: '#7c3aed',
            disabled: booking.status === 'Checked-out' || booking.status === 'Cancelled' || booking.status === 'Voided'
        },
        { 
            id: 'room-move', 
            label: '🚪 Room Move', 
            color: '#ea580c',
            disabled: booking.status === 'Cancelled' || booking.status === 'Voided'
        },
        { 
            id: 'exchange-room', 
            label: '🔄 Exchange Room', 
            color: '#0891b2',
            disabled: booking.status === 'Cancelled' || booking.status === 'Voided'
        },
        { 
            id: 'add-visitor', 
            label: '👤 Add/Show Visitor', 
            color: '#65a30d',
            disabled: booking.status === 'Cancelled' || booking.status === 'Voided'
        },
        { 
            id: 'no-show', 
            label: '❌ No-Show', 
            color: '#ca8a04',
            disabled: booking.status !== 'Upcoming'
        },
        { 
            id: 'void', 
            label: '🗑️ Void Reservation', 
            color: '#dc2626',
            disabled: booking.status === 'Voided'
        },
        { 
            id: 'cancel', 
            label: '⚠️ Cancel Reservation', 
            color: '#dc2626',
            disabled: booking.status === 'Checked-in' || booking.status === 'Cancelled' || booking.status === 'Voided'
        }
    ];

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleActionClick = (action) => {
        if (!action.disabled) {
            onActionSelect(action.id, booking);
            setIsOpen(false);
        }
    };

    return (
        <div className="more-options-wrapper" ref={menuRef}>
            <button 
                className="more-options-trigger"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
            >
                {buttonLabel}
                {buttonLabel !== '⋯' && <span className="dropdown-arrow">▼</span>}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="more-options-dropdown"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                    >
                        {actions.map((action, index) => (
                            <motion.button
                                key={action.id}
                                className={`more-options-item ${action.disabled ? 'disabled' : ''}`}
                                style={{ 
                                    borderLeft: `4px solid ${action.disabled ? '#d1d5db' : action.color}`
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleActionClick(action);
                                }}
                                disabled={action.disabled}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                whileHover={!action.disabled ? { x: 4, backgroundColor: '#fef2f2' } : {}}
                                whileTap={!action.disabled ? { scale: 0.98 } : {}}
                            >
                                {action.label}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MoreOptionsMenu;
