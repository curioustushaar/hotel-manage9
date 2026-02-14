import React from 'react';
import './EditReservationModal.css';
import VisitorList from './visitors/VisitorList';

const GuestDetails = ({ reservation }) => {
    if (!reservation) return null;

    return (
        <div className="booking-details-container">
            <h3 className="details-section-title">Guest Profile</h3>

            <div className="details-grid">
                <div className="detail-item">
                    <span className="detail-label">Guest Name</span>
                    <span className="detail-value">{reservation.guestName}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Mobile Number</span>
                    <span className="detail-value">{reservation.guestPhone}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Email Address</span>
                    <span className="detail-value">{reservation.guestEmail || '-'}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">ID Proof Type</span>
                    <span className="detail-value">{reservation.idProofType || '-'}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">ID Proof Number</span>
                    <span className="detail-value">{reservation.idProofNumber || '-'}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Vehicle Number</span>
                    <span className="detail-value">{reservation.vehicleNumber || '-'}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Nationality</span>
                    <span className="detail-value">{reservation.nationality || 'Indian'}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Gender</span>
                    <span className="detail-value">{reservation.gender || '-'}</span>
                </div>
            </div>

            <h3 className="details-section-title" style={{ marginTop: '24px' }}>Additional Information</h3>
            <div className="details-grid">
                <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                    <span className="detail-label">Address</span>
                    <span className="detail-value">{reservation.address || '-'}</span>
                </div>
                <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                    <span className="detail-label">Special Requests / Notes</span>
                    <span className="detail-value">{reservation.notes || '-'}</span>
                </div>
            </div>

            {/* Visitors Section */}
            <div style={{ marginTop: '24px', borderTop: '1px solid #f3f4f6', paddingTop: '24px' }}>
                <h3 className="details-section-title">
                    Visitors ({reservation.visitors?.length || 0})
                </h3>
                <VisitorList reservationId={reservation._id || reservation.id} refreshTrigger={reservation.updatedAt} />
            </div>
        </div>
    );
};

export default GuestDetails;
