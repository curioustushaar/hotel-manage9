import React from 'react';
import './EditReservationModal.css';
import { useSettings } from '../context/SettingsContext';

const BookingDetails = ({ reservation }) => {
    if (!reservation) return null;
    const { formatDate: settingsFormatDate, getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return settingsFormatDate(dateString);
    };

    const formatCurrency = (amount) => {
        return `${cs}${Number(amount || 0).toLocaleString('en-IN')}`;
    };

    return (
        <div className="booking-details-container">
            {/* Section 1: Reservation & Guest Info */}
            <div className="details-section">
                <h3 className="details-section-title">Reservation Information</h3>
                <div className="details-grid">
                    <div className="detail-item">
                        <span className="detail-label">Reservation ID</span>
                        <span className="detail-value">{reservation.id}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Status</span>
                        <span className={`status-badge-modal ${reservation.status?.toLowerCase()}`}>
                            {reservation.status?.replace('_', ' ')}
                        </span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Reservation Type</span>
                        <span className="detail-value">{reservation.reservationType}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Booking Source</span>
                        <span className="detail-value">{reservation.bookingSource}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Business Source</span>
                        <span className="detail-value">{reservation.businessSource}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Reference Number</span>
                        <span className="detail-value">{reservation.referenceNumber || '-'}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Created At</span>
                        <span className="detail-value">{formatDate(reservation.createdAt)}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Updated At</span>
                        <span className="detail-value">{formatDate(reservation.updatedAt)}</span>
                    </div>
                </div>
            </div>

            {/* Section 2: Stay Information */}
            <div className="details-section">
                <h3 className="details-section-title">Stay Information</h3>
                <div className="details-grid">
                    <div className="detail-item">
                        <span className="detail-label">Arrival Date</span>
                        <span className="detail-value">{formatDate(reservation.checkInDate)}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Arrival Time</span>
                        <span className="detail-value">{reservation.checkInTime}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Departure Date</span>
                        <span className="detail-value">{formatDate(reservation.checkOutDate)}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Departure Time</span>
                        <span className="detail-value">{reservation.checkOutTime}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Duration</span>
                        <span className="detail-value">{reservation.nights} Night(s)</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Arrival From</span>
                        <span className="detail-value">{reservation.arrivalFrom || '-'}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Purpose of Visit</span>
                        <span className="detail-value">{reservation.purposeOfVisit || '-'}</span>
                    </div>
                </div>
            </div>

            {/* Section 3: Room Details */}
            <div className="details-section">
                <h3 className="details-section-title">Room Details</h3>
                <div className="details-table-container">
                    <table className="details-table">
                        <thead>
                            <tr>
                                <th>Room No</th>
                                <th>Category</th>
                                <th>Meal Plan</th>
                                <th>Occupancy</th>
                                <th className="text-right">Rate/Night</th>
                                <th className="text-right">Discount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservation.rooms?.map((room, index) => (
                                <tr key={index}>
                                    <td>{room.roomNumber || 'Unassigned'}</td>
                                    <td>{room.categoryId?.replace(/-/g, ' ').toUpperCase()}</td>
                                    <td>{room.mealPlan}</td>
                                    <td>{room.adultsCount} Adult(s), {room.childrenCount} Child(ren)</td>
                                    <td className="text-right">{formatCurrency(room.ratePerNight)}</td>
                                    <td className="text-right">{formatCurrency(room.discount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Section 4: Billing Summary - Folio Aware */}
            {(() => {
                const transactions = reservation.transactions || [];
                const primaryFolioId = 0;

                const primaryCharges = transactions
                    .filter(t => Number(t.folioId || 0) === primaryFolioId && t.type?.toLowerCase() === 'charge' && !['Room Tariff', 'Room Rent'].includes(t.particulars))
                    .reduce((sum, t) => sum + (Math.abs(Number(t.amount)) || 0), 0);
                
                const otherCharges = transactions
                    .filter(t => Number(t.folioId || 0) !== primaryFolioId && t.type?.toLowerCase() === 'charge')
                    .reduce((sum, t) => sum + (Math.abs(Number(t.amount)) || 0), 0);

                const primaryPaid = transactions
                    .filter(t => Number(t.folioId || 0) === primaryFolioId && t.type?.toLowerCase() === 'payment')
                    .reduce((sum, t) => sum + (Math.abs(Number(t.amount)) || 0), 0);
                
                const otherPaid = transactions
                    .filter(t => Number(t.folioId || 0) !== primaryFolioId && t.type?.toLowerCase() === 'payment')
                    .reduce((sum, t) => sum + (Math.abs(Number(t.amount)) || 0), 0);

                const baseRoom = reservation.roomCharges || 0;
                const primaryTotal = baseRoom + primaryCharges;
                const primaryRemaining = primaryTotal - primaryPaid;

                return (
                    <div className="details-section">
                        <h3 className="details-section-title">Billing Summary</h3>
                        <div className="billing-summary-grid">
                            <div className="billing-row">
                                <span className="billing-label">Base Room Charges</span>
                                <span className="billing-value">{formatCurrency(baseRoom)}</span>
                            </div>
                            <div className="billing-row">
                                <span className="billing-label">Folio Charges (Primary)</span>
                                <span className="billing-value">{formatCurrency(primaryCharges)}</span>
                            </div>
                            {otherCharges > 0 && (
                                <div className="billing-row" style={{ fontStyle: 'italic', color: '#6366f1' }}>
                                    <span className="billing-label">Other Folio Charges</span>
                                    <span className="billing-value">{formatCurrency(otherCharges)}</span>
                                </div>
                            )}
                            <div className="billing-row total-row">
                                <span className="billing-label">Booking Grand Total</span>
                                <span className="billing-value total">{formatCurrency(reservation.totalAmount)}</span>
                            </div>
                            <div className="billing-row">
                                <span className="billing-label">Primary Folio Paid</span>
                                <span className="billing-value paid">{formatCurrency(primaryPaid)}</span>
                            </div>
                            <div className="billing-row balance-row">
                                <span className="billing-label">Primary Balance</span>
                                <span className="billing-value balance">{formatCurrency(primaryRemaining)}</span>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default BookingDetails;
