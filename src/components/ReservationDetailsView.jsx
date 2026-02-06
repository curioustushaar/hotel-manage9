import { useState } from 'react';
import './ReservationDetailsView.css';
import StatusBadge from './StatusBadge';
import BillingSummary from './BillingSummary';

const ReservationDetailsView = ({ reservation, onClose, onUpdateStatus, onEdit, onGenerateInvoice }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [paidAmount, setPaidAmount] = useState(reservation.paidAmount || 0);
    const [paymentMode, setPaymentMode] = useState(reservation.paymentMode || 'Cash');
    const [taxExempt, setTaxExempt] = useState(reservation.taxExempt || false);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const handlePrimaryAction = () => {
        if (reservation.status === 'RESERVED') {
            onUpdateStatus(reservation.id, 'IN_HOUSE');
        } else if (reservation.status === 'IN_HOUSE') {
            onGenerateInvoice(reservation);
        } else if (reservation.status === 'CHECKED_OUT') {
            onGenerateInvoice({ ...reservation, actionType: 'viewInvoice' });
        }
    };

    const getPrimaryActionLabel = () => {
        switch (reservation.status) {
            case 'RESERVED':
                return 'CHECK-IN';
            case 'IN_HOUSE':
                return 'CHECK-OUT';
            case 'CHECKED_OUT':
                return 'VIEW INVOICE';
            default:
                return '';
        }
    };

    return (
        <div className="reservation-details-container">
            {/* Header with Back Button */}
            <div className="details-header">
                <button className="back-btn" onClick={onClose}>
                    ← Back
                </button>
                <div className="header-info">
                    <h1>{reservation.guestName}</h1>
                    <p className="res-ref">Ref: {reservation.id}</p>
                </div>
                <StatusBadge status={reservation.status} />
            </div>

            <div className="details-wrapper">
                {/* Left Section - Main Content */}
                <div className="details-main">
                    {/* Tabs Navigation */}
                    <div className="tabs-navigation">
                        <button
                            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            📊 Stay Overview
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'reservation' ? 'active' : ''}`}
                            onClick={() => setActiveTab('reservation')}
                        >
                            📋 Reservation
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'housekeeping' ? 'active' : ''}`}
                            onClick={() => setActiveTab('housekeeping')}
                        >
                            🧹 Housekeeping View
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
                            onClick={() => setActiveTab('services')}
                        >
                            🛎️ Room Service
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="tab-content">
                        {/* Stay Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="tab-pane">
                                <h2>Stay Overview</h2>

                                {/* Quick Stats */}
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <div className="stat-label">Check-In</div>
                                        <div className="stat-value">{formatDate(reservation.checkInDate)}</div>
                                        <div className="stat-time">{reservation.checkInTime}</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-label">Check-Out</div>
                                        <div className="stat-value">{formatDate(reservation.checkOutDate)}</div>
                                        <div className="stat-time">{reservation.checkOutTime}</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-label">Nights</div>
                                        <div className="stat-value">{reservation.nights}</div>
                                        <div className="stat-time">night(s)</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-label">Rooms</div>
                                        <div className="stat-value">{reservation.rooms?.length || 1}</div>
                                        <div className="stat-time">room(s)</div>
                                    </div>
                                </div>

                                {/* Rooms Summary */}
                                <div className="section-box">
                                    <h3>🛏️ Room Details</h3>
                                    <div className="rooms-overview">
                                        {reservation.rooms?.map((room, idx) => (
                                            <div key={idx} className="room-overview-card">
                                                <div className="room-name">Room {idx + 1}: {room.categoryId?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</div>
                                                <div className="room-details">
                                                    <span>👥 {room.adultsCount} Adult{room.adultsCount > 1 ? 's' : ''}</span>
                                                    {room.childrenCount > 0 && <span>👶 {room.childrenCount} Child{room.childrenCount > 1 ? 'ren' : ''}</span>}
                                                    <span>🍽️ {room.mealPlan}</span>
                                                </div>
                                                <div className="room-rate">₹{room.ratePerNight?.toLocaleString()} per night</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Stay Duration */}
                                <div className="section-box">
                                    <h3>📅 Stay Duration</h3>
                                    <div className="duration-info">
                                        <div className="info-row">
                                            <span className="label">From:</span>
                                            <span className="value">{formatDate(reservation.checkInDate)} at {reservation.checkInTime}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">To:</span>
                                            <span className="value">{formatDate(reservation.checkOutDate)} at {reservation.checkOutTime}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Total Stay:</span>
                                            <span className="value">{reservation.nights} night(s)</span>
                                        </div>
                                        {reservation.flexibleCheckout && (
                                            <div className="info-row highlight">
                                                <span className="label">✓ Flexible Checkout</span>
                                                <span className="value">Enabled</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Reservation Tab */}
                        {activeTab === 'reservation' && (
                            <div className="tab-pane">
                                <h2>Reservation Details</h2>

                                {/* Booking Form */}
                                <div className="reservation-form-section">
                                    {/* Reservation Details */}
                                    <div className="form-section-box">
                                        <h3>Reservation Details</h3>
                                        <div className="form-group-row">
                                            <div className="form-group">
                                                <label>Reservation Type</label>
                                                <select defaultValue={reservation.reservationType}>
                                                    <option value="Confirm">Confirm Booking</option>
                                                    <option value="Provisional">Provisional</option>
                                                    <option value="Tentative">Tentative</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Booking Source</label>
                                                <select defaultValue={reservation.bookingSource}>
                                                    <option value="Direct">Direct</option>
                                                    <option value="OTA">OTA</option>
                                                    <option value="Travel Agent">Travel Agent</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Business Source</label>
                                                <select defaultValue={reservation.businessSource}>
                                                    <option value="Walk-In">Walk-In</option>
                                                    <option value="Phone">Phone</option>
                                                    <option value="Email">Email</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Room Details */}
                                    <div className="form-section-box">
                                        <h3>Room Details</h3>
                                        <div className="rooms-table">
                                            <div className="table-header">
                                                <div className="col-room">Room</div>
                                                <div className="col-adult">Adult</div>
                                                <div className="col-child">Child</div>
                                                <div className="col-rate">Rate (₹)</div>
                                                <div className="col-actions">Actions</div>
                                            </div>
                                            {reservation.rooms?.map((room, idx) => (
                                                <div key={idx} className="table-row">
                                                    <div className="col-room">
                                                        <span className="room-type">{room.categoryId?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                                                    </div>
                                                    <div className="col-adult">{room.adultsCount}</div>
                                                    <div className="col-child">{room.childrenCount}</div>
                                                    <div className="col-rate">₹{room.ratePerNight?.toLocaleString()}</div>
                                                    <div className="col-actions">
                                                        <button className="btn-small btn-edit-room">✏️</button>
                                                        <button className="btn-small btn-delete-room">🗑️</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="btn-add-room">+ Add Room</button>
                                    </div>

                                    {/* Check-in/Check-out */}
                                    <div className="form-section-box">
                                        <h3>Check-in & Check-out</h3>
                                        <div className="form-group-row">
                                            <div className="form-group">
                                                <label>Check-in Date & Time</label>
                                                <div className="datetime-group">
                                                    <input type="date" defaultValue={reservation.checkInDate} />
                                                    <input type="time" defaultValue={reservation.checkInTime} />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>Check-out Date & Time</label>
                                                <div className="datetime-group">
                                                    <input type="date" defaultValue={reservation.checkOutDate} />
                                                    <input type="time" defaultValue={reservation.checkOutTime} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Guest Information */}
                                    <div className="form-section-box">
                                        <h3>Guest Information</h3>
                                        <div className="guest-info-display">
                                            <div className="guest-field">
                                                <label>Name:</label>
                                                <span>{reservation.guestName}</span>
                                            </div>
                                            <div className="guest-field">
                                                <label>Email:</label>
                                                <span>{reservation.guestEmail}</span>
                                            </div>
                                            <div className="guest-field">
                                                <label>Mobile No.:</label>
                                                <span>{reservation.guestPhone}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Housekeeping Tab */}
                        {activeTab === 'housekeeping' && (
                            <div className="tab-pane">
                                <h2>Housekeeping View</h2>

                                <div className="section-box">
                                    <h3>🧹 Room Status & Housekeeping</h3>
                                    <div className="housekeeping-grid">
                                        {reservation.rooms?.map((room, idx) => (
                                            <div key={idx} className="housekeeping-card">
                                                <div className="room-title">Room {idx + 1}</div>
                                                <div className="housekeeping-status">
                                                    <div className="status-item">
                                                        <span className="status-label">Current Status:</span>
                                                        <span className="status-value">
                                                            {reservation.status === 'RESERVED' && 'Upcoming'}
                                                            {reservation.status === 'IN_HOUSE' && 'Occupied'}
                                                            {reservation.status === 'CHECKED_OUT' && 'Vacant'}
                                                        </span>
                                                    </div>
                                                    <div className="status-item">
                                                        <span className="status-label">Cleanliness:</span>
                                                        <span className="status-value status-clean">✓ Clean</span>
                                                    </div>
                                                    <div className="status-item">
                                                        <span className="status-label">Maintenance:</span>
                                                        <span className="status-value status-ok">✓ No Issues</span>
                                                    </div>
                                                    <div className="status-item">
                                                        <span className="status-label">Last Checked:</span>
                                                        <span className="status-value">Today at 10:30 AM</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="section-box">
                                    <h3>📝 Housekeeping Notes</h3>
                                    <textarea
                                        className="housekeeping-notes"
                                        placeholder="Add housekeeping notes, special requests, or maintenance issues..."
                                        defaultValue="Extra pillows requested. Room is stocked with towels."
                                    />
                                </div>
                            </div>
                        )}

                        {/* Room Service Tab */}
                        {activeTab === 'services' && (
                            <div className="tab-pane">
                                <h2>Room Service Orders</h2>

                                <div className="section-box">
                                    <h3>🍽️ Food & Beverage Orders</h3>
                                    <div className="services-list">
                                        <div className="service-item">
                                            <div className="service-header">
                                                <span className="service-time">Today 10:30 AM</span>
                                                <span className="service-status">Delivered</span>
                                            </div>
                                            <div className="service-details">
                                                <span>Breakfast - Tea & Toast</span>
                                                <span className="service-charge">₹250</span>
                                            </div>
                                        </div>
                                        <div className="service-item">
                                            <div className="service-header">
                                                <span className="service-time">Today 01:00 PM</span>
                                                <span className="service-status">Delivered</span>
                                            </div>
                                            <div className="service-details">
                                                <span>Lunch - Veg Thali</span>
                                                <span className="service-charge">₹450</span>
                                            </div>
                                        </div>
                                        <div className="service-item">
                                            <div className="service-header">
                                                <span className="service-time">Today 07:00 PM</span>
                                                <span className="service-status">Pending</span>
                                            </div>
                                            <div className="service-details">
                                                <span>Dinner - Chicken Biryani</span>
                                                <span className="service-charge">₹550</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="section-box">
                                    <h3>🧳 Additional Services</h3>
                                    <div className="services-grid">
                                        <div className="service-card">
                                            <div className="service-icon">🚗</div>
                                            <div className="service-name">Cab Service</div>
                                            <div className="service-status-badge">Available</div>
                                        </div>
                                        <div className="service-card">
                                            <div className="service-icon">💆</div>
                                            <div className="service-name">Spa & Massage</div>
                                            <div className="service-status-badge">Available</div>
                                        </div>
                                        <div className="service-card">
                                            <div className="service-icon">🎫</div>
                                            <div className="service-name">Tour Booking</div>
                                            <div className="service-status-badge">Available</div>
                                        </div>
                                        <div className="service-card">
                                            <div className="service-icon">🏊</div>
                                            <div className="service-name">Pool Access</div>
                                            <div className="service-status-badge">Available</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Section - Action Buttons & Billing */}
                <div className="details-sidebar">
                    {/* Action Buttons */}
                    <div className="action-buttons-panel">
                        <h3>Actions</h3>
                        <button
                            className="btn btn-primary btn-full"
                            onClick={handlePrimaryAction}
                        >
                            {getPrimaryActionLabel()}
                        </button>
                        <button
                            className="btn btn-secondary btn-full"
                            onClick={() => onEdit(reservation)}
                        >
                            ✏️ Edit Reservation
                        </button>
                        <button className="btn btn-secondary btn-full">
                            📞 Contact Guest
                        </button>
                    </div>

                    {/* Billing Summary */}
                    <BillingSummary
                        roomCharges={reservation.roomCharges}
                        discount={reservation.discount}
                        tax={reservation.tax}
                        totalAmount={reservation.totalAmount}
                        paidAmount={paidAmount}
                        balanceDue={reservation.balanceDue}
                        paymentMode={paymentMode}
                        onPaymentModeChange={setPaymentMode}
                        onPaidAmountChange={setPaidAmount}
                        onTaxExemptChange={setTaxExempt}
                        taxExempt={taxExempt}
                    />
                </div>
            </div>
        </div>
    );
};

export default ReservationDetailsView;
