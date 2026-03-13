import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBadge from './StatusBadge';
import { useSettings } from '../context/SettingsContext';

const ReservationCard = ({ reservation, onUpdateStatus, onEdit, onDelete, onGenerateInvoice = () => { }, onSelect, isSelected, onActionSelect }) => {
    const { getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();
    const [isExpanded, setIsExpanded] = useState(false);

    const getPrimaryAction = (status) => {
        switch (status) {
            case 'RESERVED':
                return { label: 'CHECK-IN', action: 'IN_HOUSE', type: 'checkIn', className: 'btn-check-in' };
            case 'IN_HOUSE':
                return { label: 'CHECK-OUT', action: 'CHECKED_OUT', type: 'checkOut', className: 'btn-check-out' };
            case 'CHECKED_OUT':
                return { label: 'VIEW INVOICE', action: 'viewInvoice', type: 'invoice', className: 'btn-invoice' };
            default:
                return null;
        }
    };

    const primaryAction = getPrimaryAction(reservation.status);

    const handlePrimaryAction = (e) => {
        e.stopPropagation();
        if (primaryAction.type === 'checkOut') {
            onGenerateInvoice(reservation);
        } else if (primaryAction.type === 'invoice') {
            onGenerateInvoice({ ...reservation, actionType: 'viewInvoice' });
        } else {
            onUpdateStatus(reservation.id, primaryAction.action);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    };

    const isMultiRoom = reservation.rooms && reservation.rooms.length > 1;

    // Financial calculations for Multi-Room
    const calculateMultiRoomTotals = () => {
        if (!isMultiRoom) return { total: reservation.totalAmount, paid: reservation.paidAmount, balance: reservation.balanceDue };

        const total = reservation.rooms.reduce((sum, room) => {
            const rate = room.ratePerNight || 0;
            const discount = room.discount || 0;
            return sum + (rate * (reservation.nights || 1)) - discount;
        }, 0);

        const paid = reservation.paidAmount || 0;
        const balance = total - paid;

        return { total, paid, balance };
    };

    const totals = calculateMultiRoomTotals();

    const renderSingleRoomCard = () => (
        <>
            <div className="res-card-header">
                <h3 className="guest-name">{reservation.guestName}</h3>
                <span className={`status-text ${reservation.status.toLowerCase()}`}>
                    {reservation.status === 'IN_HOUSE' ? 'IN_HOUSE' :
                        reservation.status === 'CHECKED_OUT' ? 'CHECKED_OUT' : 'RESERVED'}
                </span>
            </div>

            <div className="res-card-ref">
                Ref: {reservation.referenceNumber || reservation.id?.substring(0, 10) + '...'}
            </div>

            <div className="res-card-dates">
                <span className="date">{formatDate(reservation.checkInDate)}</span>
                <span className="arrow">→</span>
                <span className="date">{formatDate(reservation.checkOutDate)}</span>
                <span className="nights">{reservation.nights} night(s)</span>
            </div>

            <div className="res-card-rooms-v2">
                <div className="rooms-left">
                    <span className="icon-v2-sm room">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"></path><path d="M2 8h18a2 2 0 0 1 2 2v10"></path><path d="M2 17h20"></path><path d="M6 8v9"></path></svg>
                    </span>
                    <span className="room-count-text">{reservation.rooms?.length || 1} Room(s)</span>
                </div>
                {reservation.roomNumber && (
                    <span className="room-number-badge">
                        Room: {reservation.roomNumber}
                    </span>
                )}
            </div>

            {/* Folio-aware calculations */}
            {(() => {
                const transactions = reservation.transactions || [];
                const primaryFolioId = 0; // Standard Primary Folio ID
                
                // Primary Folio Charges (excluding base room rate which is shown separately)
                const primaryCharges = transactions
                    .filter(t => Number(t.folioId || 0) === primaryFolioId && t.type?.toLowerCase() === 'charge' && !['Room Tariff', 'Room Rent'].includes(t.particulars))
                    .reduce((sum, t) => sum + (Math.abs(Number(t.amount)) || 0), 0);

                // Other Folios Charges (sum of all other folios)
                const otherCharges = transactions
                    .filter(t => Number(t.folioId || 0) !== primaryFolioId && t.type?.toLowerCase() === 'charge')
                    .reduce((sum, t) => sum + (Math.abs(Number(t.amount)) || 0), 0);

                // Payments breakdown
                const primaryPaid = transactions
                    .filter(t => Number(t.folioId || 0) === primaryFolioId && t.type?.toLowerCase() === 'payment')
                    .reduce((sum, t) => sum + (Math.abs(Number(t.amount)) || 0), 0);
                
                const otherPaid = transactions
                    .filter(t => Number(t.folioId || 0) !== primaryFolioId && t.type?.toLowerCase() === 'payment')
                    .reduce((sum, t) => sum + (Math.abs(Number(t.amount)) || 0), 0);

                const roomCharges = reservation.roomCharges || 0;
                const totalPaid = primaryPaid + otherPaid;
                const bookingBalance = (reservation.totalAmount || 0) - totalPaid;

                return (
                    <div className="res-card-amount-summary">
                        <div className="amount-summary-header">BILLING SUMMARY</div>
                        
                        <div className="summary-row">
                            <span className="label">Room Charges</span>
                            <span className="value">{cs}{roomCharges.toLocaleString('en-IN')}</span>
                        </div>

                        {primaryCharges > 0 && (
                            <div className="summary-row">
                                <span className="label">Extra Charges (Primary)</span>
                                <span className="value">{cs}{primaryCharges.toLocaleString('en-IN')}</span>
                            </div>
                        )}

                        {otherCharges > 0 && (
                            <div className="summary-row" style={{ color: '#6366f1', borderTop: '1px dashed #e5e7eb', marginTop: '4px', paddingTop: '4px' }}>
                                <span className="label">Other Folios ({transactions.filter(t => Number(t.folioId || 0) !== 0 && t.type?.toLowerCase() === 'charge').length} items)</span>
                                <span className="value">{cs}{otherCharges.toLocaleString('en-IN')}</span>
                            </div>
                        )}

                        <div className="summary-row bold total-row" style={{ marginTop: otherCharges > 0 ? '4px' : '8px' }}>
                            <span className="label">Grand Total</span>
                            <span className="value">{cs}{reservation.totalAmount?.toLocaleString('en-IN')}</span>
                        </div>

                        <div className="summary-row text-green" style={{ borderTop: '1px solid #d1fae5', marginTop: '4px', paddingTop: '4px' }}>
                            <span className="label">Total Paid Amount</span>
                            <span className="value">{cs}{totalPaid.toLocaleString('en-IN')}</span>
                        </div>

                        <div className="summary-row text-red" style={{ borderTop: '1px solid #fee2e2', marginTop: '4px', paddingTop: '4px' }}>
                            <span className="label">Total Balance Due</span>
                            <span className="value" style={{ fontWeight: '800' }}>{cs}{Math.max(0, bookingBalance).toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                );
            })()}

            <div className="res-card-contact">
                <div className="contact-row">
                    <span className="icon-v2 phone">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.28-2.28a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    </span>
                    <span>{reservation.guestPhone}</span>
                </div>
                <div className="contact-row">
                    <span className="icon-v2 email">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                    </span>
                    <span className="email-text">{reservation.guestEmail || 'No Email'}</span>
                </div>
            </div>
        </>
    );

    const renderMultiRoomCard = () => (
        <>
            <div className="multi-room-badge">
                <span className="dot">●</span> MULTI ROOM BOOKING
            </div>

            <div className="res-card-header">
                <h3 className="guest-name">{reservation.guestName}</h3>
                <span className={`status-text ${reservation.status.toLowerCase()}`}>
                    {reservation.status === 'IN_HOUSE' ? 'IN_HOUSE' :
                        reservation.status === 'CHECKED_OUT' ? 'CHECKED_OUT' : 'RESERVED'}
                </span>
            </div>

            <div className="res-card-dates-nights">
                <div className="dates">
                    <span className="date">{formatDate(reservation.checkInDate)}</span>
                    <span className="arrow">→</span>
                    <span className="date">{formatDate(reservation.checkOutDate)}</span>
                </div>
                <span className="nights-badge">{reservation.nights} Nights</span>
            </div>

            <div className="multi-room-summary" onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}>
                <span className="room-count">🏨 {reservation.rooms.length} Rooms Booked</span>
                <span className={`expand-icon ${isExpanded ? 'rotated' : ''}`}>▼</span>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        className="room-breakdown-container"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="room-breakdown-list">
                            {reservation.rooms.map((room, idx) => (
                                <div key={idx} className="room-breakdown-row">
                                    <div className="room-info">
                                        <span className="r-num">Room {room.roomNumber}</span>
                                        <span className="r-type">{room.roomType}</span>
                                    </div>
                                    <div className="room-pricing">
                                        <span className="r-rate">{cs}{room.ratePerNight}/nt {room.discount > 0 && `(-${cs}${room.discount} disc)`}</span>
                                        <span className="r-subtotal">{cs}{((room.ratePerNight * (reservation.nights || 1)) - (room.discount || 0)).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="res-card-amount-summary">
                <div className="amount-summary-header">AMOUNT SUMMARY</div>
                
                <div className="summary-row">
                    <span className="label">Room Charges</span>
                    <span className="value">{cs}{(totals.total - (reservation.folioCharges || 0)).toLocaleString('en-IN')}</span>
                </div>

                <div className="summary-row">
                    <span className="label">Folio Charges</span>
                    <span className="value">{cs}{(reservation.folioCharges || 0).toLocaleString('en-IN')}</span>
                </div>

                <div className="summary-row bold total-row">
                    <span className="label">Total Amount</span>
                    <span className="value">{cs}{totals.total?.toLocaleString('en-IN')}</span>
                </div>

                <div className="summary-row text-green">
                    <span className="label">Paid</span>
                    <span className="value">{cs}{totals.paid?.toLocaleString('en-IN')}</span>
                </div>

                <div className="summary-row text-red">
                    <span className="label">Balance</span>
                    <span className="value">{cs}{totals.balance?.toLocaleString('en-IN')}</span>
                </div>
            </div>

            <div className="res-card-contact compact">
                <div className="contact-row">
                    <span className="icon">📞</span>
                    <span>{reservation.guestPhone}</span>
                </div>
            </div>
        </>
    );

    return (
        <div
            className={`reservation-card ${isSelected ? 'selected' : ''} ${isMultiRoom ? 'multi-room-card' : ''}`}
            onClick={() => onSelect && onSelect(reservation)}
        >
            {isMultiRoom ? renderMultiRoomCard() : renderSingleRoomCard()}

            <div className="res-card-footer">
                {primaryAction && (
                    <button
                        className={`btn-main-action ${primaryAction.className}`}
                        onClick={handlePrimaryAction}
                    >
                        {primaryAction.label}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ReservationCard;
