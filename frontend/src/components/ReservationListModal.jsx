import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';

const ReservationListModal = ({ table, onClose, onCancel, onAdd }) => {
    const { getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();
    const [searchQuery, setSearchQuery] = useState('');
    const reservations = table.reservations || [];

    // Filter and Sort reservations
    const filteredReservations = reservations
        .filter(res => 
            (res.name || res.guestName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (res.phone || '').includes(searchQuery)
        )
        .sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.startTime.localeCompare(b.startTime);
        });

    return (
        <div className="add-payment-overlay" onClick={onClose}>
            <div className="add-payment-modal reservation-list-premium" onClick={(e) => e.stopPropagation()}>
                {/* Modern Premium Header */}
                <div className="premium-payment-header">
                    <div className="header-icon-wrap">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                    <div className="header-text">
                        <h3>Reservations - {table.tableName}</h3>
                        <span>Upcoming dining schedule</span>
                    </div>
                    <button className="premium-close-btn" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="add-payment-body">
                    {/* Search Box */}
                    <div className="payment-field-group">
                        <div className="input-with-icon-premium">
                            <span className="field-icon" style={{ color: '#3b82f6' }}>🔍</span>
                            <input
                                type="text"
                                placeholder="Search by name or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="premium-input-field"
                            />
                        </div>
                    </div>

                    <div className="reservations-scroll-area">
                        {filteredReservations.length === 0 ? (
                            <div className="empty-reservations">
                                <div className="empty-calendar-icon">
                                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="3" y="4" width="18" height="18" rx="4" fill="#60A5FA" fillOpacity="0.2" stroke="#3B82F6" strokeWidth="1.5" />
                                        <path d="M3 10H21" stroke="#3B82F6" strokeWidth="1.5" />
                                        <path d="M8 2V6" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
                                        <path d="M16 2V6" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
                                        <rect x="7" y="13" width="2" height="2" rx="0.5" fill="#3B82F6" />
                                        <rect x="11" y="13" width="2" height="2" rx="0.5" fill="#3B82F6" />
                                        <rect x="15" y="13" width="2" height="2" rx="0.5" fill="#3B82F6" />
                                        <rect x="7" y="17" width="2" height="2" rx="0.5" fill="#3B82F6" />
                                        <rect x="11" y="17" width="2" height="2" rx="0.5" fill="#F43F5E" />
                                    </svg>
                                </div>
                                <p>No reservations found for this table.</p>
                            </div>
                        ) : (
                            <div className="reservations-list-premium-grid">
                                {filteredReservations.map(res => (
                                    <div key={res._id || res.id} className="reservation-item-premium">
                                        <div className="res-time-block">
                                            <span className="res-time">{res.startTime}</span>
                                            <span className="res-date">{res.date}</span>
                                        </div>
                                        <div className="res-info-block">
                                            <div className="res-guest-name">{res.name || res.guestName}</div>
                                            <div className="res-guest-meta">
                                                {res.guests} Guests • {res.phone}
                                            </div>
                                            {res.advancePayment > 0 && (
                                                <div className="res-advance-tag">
                                                    Advance: {cs}{res.advancePayment}
                                                </div>
                                            )}
                                        </div>
                                        <div className="res-actions-block">
                                            <span className={`res-status-pill status-${(res.status || 'Upcoming').toLowerCase()}`}>
                                                {res.status || 'Upcoming'}
                                            </span>
                                            {res.status === 'Upcoming' && (
                                                <button
                                                    className="res-cancel-btn"
                                                    onClick={() => onCancel(res._id || res.id)}
                                                    title="Cancel Reservation"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="payment-modal-footer">
                    <button className="btn-secondary premium-outline-btn" onClick={onClose}>
                        CLOSE
                    </button>
                    <button className="btn-primary" onClick={() => { onClose(); onAdd && onAdd(); }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"></path></svg>
                        ADD NEW
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReservationListModal;

