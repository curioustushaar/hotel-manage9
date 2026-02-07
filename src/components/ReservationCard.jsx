import { useState } from 'react';
import StatusBadge from './StatusBadge';

const ReservationCard = ({ reservation, onUpdateStatus, onEdit, onDelete, onGenerateInvoice = () => {}, onSelect, isSelected }) => {
    const [showMenu, setShowMenu] = useState(false);

    const getPrimaryAction = (status) => {
        switch (status) {
            case 'RESERVED':
                return { label: 'CHECK-IN', action: 'IN_HOUSE', type: 'checkIn' };
            case 'IN_HOUSE':
                return { label: 'CHECK-OUT', action: 'CHECKED_OUT', type: 'checkOut' };
            case 'CHECKED_OUT':
                return { label: 'VIEW INVOICE', action: 'viewInvoice', type: 'invoice' };
            default:
                return null;
        }
    };

    const primaryAction = getPrimaryAction(reservation.status);

    const handlePrimaryAction = () => {
        if (primaryAction.type === 'checkOut') {
            onGenerateInvoice(reservation);
        } else if (primaryAction.type === 'invoice') {
            onGenerateInvoice({ ...reservation, actionType: 'viewInvoice' });
        } else {
            onUpdateStatus(reservation.id, primaryAction.action);
        }
        setShowMenu(false);
    };

    const nights = reservation.nights || 0;
    const checkInDate = new Date(reservation.checkInDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    const checkOutDate = new Date(reservation.checkOutDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

    return (
        <div 
            className={`reservation-card-compact ${isSelected ? 'selected' : ''}`}
        >
            {/* Compact Header */}
            <div 
                className="compact-header clickable-header"
                onClick={() => onSelect && onSelect(reservation)}
            >
                <div className="name-section">
                    <h3 
                        className="guest-name" 
                    >
                        {reservation.guestName}
                    </h3>
                    <StatusBadge status={reservation.status} />
                </div>
            </div>

            {/* Reservation ID */}
            <p className="res-id-compact">Ref: {reservation.id.substring(0, 8)}...</p>

            {/* Dates and Nights */}
            <div className="dates-row">
                <span className="date">{checkInDate}</span>
                <span className="arrow">→</span>
                <span className="date">{checkOutDate}</span>
                <span className="nights">{nights} night(s)</span>
            </div>

            {/* Rooms */}
            <p className="rooms-row">
                🛏️ {reservation.rooms?.length || 1} Room(s)
            </p>

            {/* Billing Summary */}
            <div className="billing-row">
                <div className="billing-item">
                    <span className="billing-label">Amount</span>
                    <span className="billing-value">₹{reservation.totalAmount?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '0'}</span>
                </div>
                <div className="billing-item">
                    <span className="billing-label billing-label-green">Paid</span>
                    <span className="billing-value billing-green">₹{reservation.paidAmount?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '0'}</span>
                </div>
                <div className="billing-item">
                    <span className="billing-label billing-label-red">Balance</span>
                    <span className="billing-value billing-red">₹{(reservation.balanceDue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
            </div>

            {/* Contact Info */}
            <div className="contact-row">
                <div className="contact-item">
                    <span className="contact-icon">📞</span>
                    <span className="contact-value">{reservation.guestPhone || 'N/A'}</span>
                </div>
                <div className="contact-item">
                    <span className="contact-icon">📧</span>
                    <span className="contact-value" title={reservation.guestEmail}>{reservation.guestEmail || 'N/A'}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="compact-actions">
                {primaryAction && (
                    <button
                        className="btn-primary-action"
                        onClick={handlePrimaryAction}
                    >
                        {primaryAction.label}
                    </button>
                )}
                <div className="menu-container">
                    <button
                        className="btn-menu"
                        onClick={() => setShowMenu(!showMenu)}
                    >
                        ⋮
                    </button>
                    {showMenu && (
                        <div className="menu-dropdown">
                            <button
                                className="menu-item menu-edit"
                                onClick={() => {
                                    onEdit(reservation);
                                    setShowMenu(false);
                                }}
                            >
                                ✏️ Edit
                            </button>
                            {reservation.status !== 'CANCELLED' && (
                                <button
                                    className="menu-item menu-cancel"
                                    onClick={() => {
                                        if (confirm('Cancel this reservation?')) {
                                            onUpdateStatus(reservation.id, 'CANCELLED');
                                            setShowMenu(false);
                                        }
                                    }}
                                >
                                    ✕ Cancel
                                </button>
                            )}
                            <button
                                className="menu-item menu-delete"
                                onClick={() => {
                                    if (confirm('Delete this reservation?')) {
                                        onDelete(reservation.id);
                                        setShowMenu(false);
                                    }
                                }}
                            >
                                🗑️ Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReservationCard;
