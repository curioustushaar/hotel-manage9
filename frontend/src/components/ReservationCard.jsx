<<<<<<< HEAD
import StatusBadge from './StatusBadge';

const ReservationCard = ({ reservation, onUpdateStatus, onEdit, onDelete, onGenerateInvoice = () => { }, onSelect, isSelected, onActionSelect }) => {

=======
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBadge from './StatusBadge';

const ReservationCard = ({ reservation, onUpdateStatus, onEdit, onDelete, onGenerateInvoice = () => { }, onSelect, isSelected, onActionSelect }) => {
    const [isExpanded, setIsExpanded] = useState(false);
>>>>>>> main

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

<<<<<<< HEAD
    return (
        <div
            className={`reservation-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect && onSelect(reservation)}
        >
=======
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
>>>>>>> main
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

            <div className="res-card-rooms">
<<<<<<< HEAD
                <span className="room-icon">🛏</span>
=======
                <span className="room-icon"></span>
>>>>>>> main
                <span>{reservation.rooms?.length || 1} Room(s)</span>
                {reservation.roomNumber && (
                    <span className="room-number-label" style={{ marginLeft: 'auto', color: '#4f46e5', background: '#eef2ff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #c7d2fe' }}>
                        Room: {reservation.roomNumber}
                    </span>
                )}
            </div>

            <div className="res-card-financials">
                <div className="fin-col">
                    <label>AMOUNT</label>
                    <span className="amount">₹{reservation.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="fin-col">
                    <label className="text-green">PAID</label>
                    <span className="amount text-green">₹{reservation.paidAmount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="fin-col">
                    <label className="text-red">BALANCE</label>
                    <span className="amount text-red">₹{reservation.balanceDue?.toLocaleString('en-IN')}</span>
                </div>
            </div>

            <div className="res-card-contact">
                <div className="contact-row">
<<<<<<< HEAD
                    <span className="icon">📞</span>
                    <span>{reservation.guestPhone}</span>
                </div>
                <div className="contact-row">
                    <span className="icon">📧</span>
                    <span className="email-text">{reservation.guestEmail || 'No Email'}</span>
                </div>
            </div>
=======
                    <span className="icon"></span>
                    <span>{reservation.guestPhone}</span>
                </div>
                <div className="contact-row">
                    <span className="icon"></span>
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
                                        <span className="r-rate">₹{room.ratePerNight}/nt {room.discount > 0 && `(-₹${room.discount} disc)`}</span>
                                        <span className="r-subtotal">₹{((room.ratePerNight * (reservation.nights || 1)) - (room.discount || 0)).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="res-card-financials multi">
                <div className="fin-col">
                    <label>TOTAL AMOUNT</label>
                    <span className="amount">₹{totals.total?.toLocaleString('en-IN')}</span>
                </div>
                <div className="fin-col">
                    <label className="text-green">PAID</label>
                    <span className="amount text-green">₹{totals.paid?.toLocaleString('en-IN')}</span>
                </div>
                <div className="fin-col">
                    <label className="text-red">BALANCE</label>
                    <span className="amount text-red">₹{totals.balance?.toLocaleString('en-IN')}</span>
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
>>>>>>> main

            <div className="res-card-footer">
                {primaryAction && (
                    <button
                        className={`btn-main-action ${primaryAction.className}`}
                        onClick={handlePrimaryAction}
                    >
                        {primaryAction.label}
                    </button>
                )}
<<<<<<< HEAD

=======
>>>>>>> main
            </div>
        </div>
    );
};

export default ReservationCard;
