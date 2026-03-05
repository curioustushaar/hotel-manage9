import React from 'react';
import './ReservationHeader.css';

const ReservationHeader = ({ reservation }) => {
    if (!reservation) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const calculateNights = () => {
        if (!reservation.checkInDate || !reservation.checkOutDate) return 0;
        const inDate = new Date(reservation.checkInDate);
        const outDate = new Date(reservation.checkOutDate);
        return Math.max(1, Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24)));
    };

    return (
        <div className="reservation-header-edit">
            <div className="guest-header-section">
                <div className="guest-avatar-section">
                    <div className="guest-avatar-icon">👤</div>
                    <div className="guest-info-section">
                        <h2 className="guest-name-title">{reservation.guestName}</h2>
                        <p className="guest-phone-text">📞 {reservation.guestPhone}</p>
                    </div>
                </div>
            </div>

            <div className="booking-summary-row">
                <div className="summary-item">
                    <span className="summary-label">BOOKING DATE</span>
                    <span className="summary-value">{formatDate(reservation.createdAt)}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">ARRIVAL</span>
                    <span className="summary-value">{formatDate(reservation.checkInDate)}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">DEPARTURE</span>
                    <span className="summary-value">{formatDate(reservation.checkOutDate)}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">NIGHTS</span>
                    <span className="summary-value">{calculateNights()}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">ROOM / ROOM TYPE</span>
                    <span className="summary-value">
                        {reservation.rooms?.[0]?.categoryId?.replace(/-/g, ' ').toUpperCase() || 'N/A'}
                    </span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">RESERVATION NO</span>
                    <span className="summary-value">{reservation.id}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">RESERVATION STATUS</span>
                    <span className={`status-badge-header ${reservation.status.toLowerCase()}`}>
                        {reservation.status.replace('_', ' ')}
                    </span>
                </div>
                <div className="header-action-section">
                    <button className="btn-check-in-header">
                        {['IN_HOUSE', 'Checked-in', 'Occupied', 'CheckedIn'].includes(reservation.status) ? 'Checkout' : 'Check-in'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReservationHeader;
