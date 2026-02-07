import React, { useState } from 'react';
import './EditReservationModal.css';
import ReservationHeader from './ReservationHeader';
import ReservationTabs from './ReservationTabs';
import FolioOperations from './FolioOperations';

const EditReservationModal = ({ isOpen, onClose, reservation }) => {
    const [activeTab, setActiveTab] = useState('folio-operations');

    if (!isOpen || !reservation) return null;

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains('edit-modal-overlay')) {
            onClose();
        }
    };

    return (
        <div className="edit-modal-overlay" onClick={handleOverlayClick}>
            <div className="edit-modal-card">
                {/* Close Button */}
                <button className="edit-modal-close" onClick={onClose}>
                    ✕
                </button>

                {/* Header Section */}
                <div className="edit-modal-header">
                    <div className="guest-info-header">
                        <div className="guest-avatar-circle">👤</div>
                        <div className="guest-name-section">
                            <h2 className="guest-name-modal">{reservation.guestName}</h2>
                            <p className="guest-phone-modal">📞 {reservation.guestPhone}</p>
                        </div>
                    </div>
                </div>

                {/* Booking Summary Row */}
                <div className="booking-summary-modal">
                    <div className="summary-info-row">
                        <div className="summary-col">
                            <span className="summary-label-modal">BOOKING DATE</span>
                            <span className="summary-value-modal">
                                {new Date(reservation.createdAt).toLocaleDateString('en-GB', { 
                                    day: '2-digit', 
                                    month: '2-digit', 
                                    year: 'numeric' 
                                })}
                            </span>
                        </div>
                        <div className="summary-col">
                            <span className="summary-label-modal">ARRIVAL</span>
                            <span className="summary-value-modal">
                                {new Date(reservation.checkInDate).toLocaleDateString('en-GB', { 
                                    day: '2-digit', 
                                    month: '2-digit', 
                                    year: 'numeric' 
                                })}
                            </span>
                        </div>
                        <div className="summary-col">
                            <span className="summary-label-modal">DEPARTURE</span>
                            <span className="summary-value-modal">
                                {new Date(reservation.checkOutDate).toLocaleDateString('en-GB', { 
                                    day: '2-digit', 
                                    month: '2-digit', 
                                    year: 'numeric' 
                                })}
                            </span>
                        </div>
                        <div className="summary-col">
                            <span className="summary-label-modal">NIGHTS</span>
                            <span className="summary-value-modal">
                                {Math.max(1, Math.ceil((new Date(reservation.checkOutDate) - new Date(reservation.checkInDate)) / (1000 * 60 * 60 * 24)))}
                            </span>
                        </div>
                        <div className="summary-col">
                            <span className="summary-label-modal">ROOM / ROOM TYPE</span>
                            <span className="summary-value-modal">
                                102 / Deluxe
                            </span>
                        </div>
                        <div className="summary-col">
                            <span className="summary-label-modal">RESERVATION NO</span>
                            <span className="summary-value-modal">{reservation.id}</span>
                        </div>
                        <div className="summary-col">
                            <span className="summary-label-modal">RESERVATION STATUS</span>
                            <span className={`status-badge-modal ${reservation.status.toLowerCase()}`}>
                                {reservation.status.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                    <div className="check-in-action">
                        <button className="btn-check-in-modal">Check-in</button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="modal-tabs-section">
                    <ReservationTabs 
                        activeTab={activeTab} 
                        onTabChange={setActiveTab} 
                    />
                </div>

                {/* Tab Content */}
                <div className="modal-content-area">
                    {activeTab === 'folio-operations' && (
                        <FolioOperations reservation={reservation} />
                    )}
                    {activeTab === 'booking-details' && (
                        <div className="tab-placeholder-modal">
                            <h3>Booking Details</h3>
                            <p>Booking details content coming soon...</p>
                        </div>
                    )}
                    {activeTab === 'guest-details' && (
                        <div className="tab-placeholder-modal">
                            <h3>Guest Details</h3>
                            <p>Guest details content coming soon...</p>
                        </div>
                    )}
                    {activeTab === 'room-charges' && (
                        <div className="tab-placeholder-modal">
                            <h3>Room Charges</h3>
                            <p>Room charges content coming soon...</p>
                        </div>
                    )}
                    {activeTab === 'audit-trail' && (
                        <div className="tab-placeholder-modal">
                            <h3>Audit Trail</h3>
                            <p>Audit trail content coming soon...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditReservationModal;
