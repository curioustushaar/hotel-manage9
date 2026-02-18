import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReservationDetailsView.css';

const ReservationDetailsView = ({ reservation, onClose, onUpdate }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('roomCharges');
    const [showPrintMenu, setShowPrintMenu] = useState(false);

    const handlePrintAction = (action) => {
        setShowPrintMenu(false);
        // Trigger the action via onUpdate
        // Assuming onUpdate can handle action requests
        if (onUpdate) {
            onUpdate({ type: 'OPEN_ACTION', action, reservation });
        } else {
            console.warn('onUpdate prop is missing in ReservationDetailsView');
        }
    };
    const [charges, setCharges] = useState([
        {
            id: 1,
            day: '03-02-2026 Tue',
            particulars: 'Room Tariff',
            description: `Room Charges: 2000.0 for 03-02-2026 Room No ${reservation?.roomNumber || '102'}`,
            amount: 2000,
            user: 'superadmin#7729080895'
        }
    ]);

    const tabs = [
        { id: 'folioOperations', label: 'Folio Operations' },
        { id: 'bookingDetails', label: 'Booking Details' },
        { id: 'guestDetails', label: 'Guest Details' },
        { id: 'roomCharges', label: 'Room Charges' },
        { id: 'auditTrail', label: 'Audit Trail' }
    ];

    const handleAddPayment = () => {
        // Add payment logic
        alert('Add Payment functionality');
    };

    const handleAddCharges = () => {
        // Add charges logic
        alert('Add Charges functionality');
    };

    const handleApplyDiscount = () => {
        // Apply discount logic
        alert('Apply Discount functionality');
    };

    const calculateTotals = () => {
        const subTotal = charges.reduce((sum, charge) => sum + charge.amount, 0);
        const grandTotal = subTotal;
        const balance = grandTotal;

        return { subTotal, grandTotal, balance, paid: 0 };
    };

    const totals = calculateTotals();

    return (
        <div className="reservation-details-overlay">
            <div className="reservation-details-container">
                {/* Header */}
                <div className="reservation-header">
                    <div className="header-left">
                        <button className="back-btn" onClick={onClose}>
                            ← Back
                        </button>
                        <h2 className="guest-name">
                            👤 {reservation?.guestName || 'Mr. Shahrukh Ahmed'}
                        </h2>
                    </div>
                    <div className="header-actions relative">
                        <div className="relative">
                            <button
                                className="action-btn"
                                onClick={() => setShowPrintMenu(!showPrintMenu)}
                            >
                                🖨️ Print / Send ▼
                            </button>
                            {showPrintMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                    <button
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => handlePrintAction('print-summary')}
                                    >
                                        📄 Print Summary
                                    </button>
                                    <button
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => handlePrintAction('print-invoice')}
                                    >
                                        🧾 Print Invoice
                                    </button>
                                    <button
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => handlePrintAction('print-grc')}
                                    >
                                        📋 Print GRC
                                    </button>
                                    <button
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => handlePrintAction('print-grc-all')}
                                    >
                                        📋 Print GRC All
                                    </button>
                                </div>
                            )}
                        </div>
                        <button className="close-btn" onClick={onClose}>✕</button>
                    </div>
                </div>

                {/* Booking Info Bar */}
                <div className="booking-info-bar">
                    <div className="info-item">
                        <label>Booking Date</label>
                        <div className="info-value">
                            {reservation?.checkInDate ?
                                new Date(reservation.checkInDate).toLocaleDateString('en-GB') + ' ' +
                                new Date(reservation.checkInDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                                : '03-02-2026 01:32 PM'}
                        </div>
                    </div>
                    <div className="info-item">
                        <label>Arrival</label>
                        <div className="info-value">
                            {reservation?.checkInDate ?
                                new Date(reservation.checkInDate).toLocaleDateString('en-GB') + ' ' +
                                new Date(reservation.checkInDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                                : '03-02-2026 01:28 PM'}
                        </div>
                    </div>
                    <div className="info-item">
                        <label>Departure</label>
                        <div className="info-value">
                            {reservation?.checkOutDate ?
                                new Date(reservation.checkOutDate).toLocaleDateString('en-GB') + ' 12:00 PM'
                                : '04-02-2026 12:00 PM'}
                        </div>
                    </div>
                    <div className="info-item">
                        <label>Nights</label>
                        <div className="info-value">1</div>
                    </div>
                    <div className="info-item">
                        <label>Room / Room Type</label>
                        <div className="info-value">
                            {reservation?.roomNumber || '102'} - {reservation?.roomType || 'Deluxe'}
                            {/* PHASE 3 UPGRADE: Display enterprise room details */}
                            {(reservation?.roomViewType || reservation?.smokingPolicy || reservation?.roomSize) && (
                                <span className="room-details-extra">
                                    {reservation?.roomViewType && ` | ${reservation.roomViewType}`}
                                    {reservation?.smokingPolicy && ` | ${reservation.smokingPolicy}`}
                                    {reservation?.roomSize > 0 && ` | ${reservation.roomSize} sq ft`}
                                    {reservation?.isSmartRoom && ' ⚡'}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="info-item">
                        <label>Reservation No</label>
                        <div className="info-value">{reservation?.bookingId || '51'}</div>
                    </div>
                    <div className="info-item">
                        <label>Reservation Status</label>
                        <div className="status-badge confirmed">CONFIRMED</div>
                    </div>
                    <div className="info-item">
                        <button className="checkout-btn">Checkout</button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="content-area">
                    {/* Sidebar */}
                    <div className="sidebar">
                        <div className="room-folio-section">
                            <div className="folio-header">Room / Folio</div>
                            <div className="folio-card selected">
                                <div className="room-number">{reservation?.roomNumber || '102'}</div>
                                <div className="guest-info">
                                    <div className="guest-icon">👤</div>
                                    <span>{reservation?.guestName || 'Mr. Shahrukh Ahmed'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="main-content">
                        {/* Tabs */}
                        <div className="tabs-container">
                            <div className="tabs">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="tab-actions">
                                <button className="tab-action-btn" onClick={handleAddPayment}>
                                    Add Payment
                                </button>
                                <button className="tab-action-btn" onClick={handleAddCharges}>
                                    Add Charges
                                </button>
                                <button className="tab-action-btn" onClick={handleApplyDiscount}>
                                    Apply Discount
                                </button>
                                <button className="tab-action-btn">Folio Operations</button>
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="tab-content">
                            {activeTab === 'roomCharges' && (
                                <div className="room-charges-content">
                                    <div className="charges-filters">
                                        <div className="filter-buttons">
                                            <button className="filter-btn">📋 Unposted</button>
                                            <button className="filter-btn active">✅ Posted</button>
                                            <button className="filter-btn">📝 All</button>
                                            <button className="filter-btn">📞 Contact</button>
                                            <button className="filter-btn">📧 Email</button>
                                        </div>
                                    </div>

                                    <table className="charges-table">
                                        <thead>
                                            <tr>
                                                <th>Day</th>
                                                <th>Particulars</th>
                                                <th>Description</th>
                                                <th>Amount</th>
                                                <th>User</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {charges.map(charge => (
                                                <tr key={charge.id}>
                                                    <td>{charge.day}</td>
                                                    <td>{charge.particulars}</td>
                                                    <td>{charge.description}</td>
                                                    <td>₹ {charge.amount}</td>
                                                    <td>{charge.user}</td>
                                                    <td>
                                                        <button className="action-icon-btn">⋮</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'bookingDetails' && (
                                <div className="booking-details-content">
                                    <h3>Booking Information</h3>
                                    <div className="details-grid">
                                        <div className="detail-item">
                                            <label>Booking ID:</label>
                                            <span>{reservation?.bookingId || 'BKG123456'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Guest Name:</label>
                                            <span>{reservation?.guestName || 'Mr. Shahrukh Ahmed'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Room Number:</label>
                                            <span>{reservation?.roomNumber || '102'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Room Type:</label>
                                            <span>{reservation?.roomType || 'Deluxe'}</span>
                                        </div>
                                        {/* PHASE 3 UPGRADE: Show enterprise room details in booking details */}
                                        {reservation?.roomViewType && (
                                            <div className="detail-item">
                                                <label>View Type:</label>
                                                <span>{reservation.roomViewType}</span>
                                            </div>
                                        )}
                                        {reservation?.smokingPolicy && (
                                            <div className="detail-item">
                                                <label>Smoking Policy:</label>
                                                <span>{reservation.smokingPolicy}</span>
                                            </div>
                                        )}
                                        {reservation?.roomSize > 0 && (
                                            <div className="detail-item">
                                                <label>Room Size:</label>
                                                <span>{reservation.roomSize} sq ft</span>
                                            </div>
                                        )}
                                        {reservation?.isSmartRoom && (
                                            <div className="detail-item">
                                                <label>Smart Room:</label>
                                                <span>⚡ Yes</span>
                                            </div>
                                        )}
                                        {reservation?.dynamicRateEnabled && (
                                            <div className="detail-item">
                                                <label>Pricing:</label>
                                                <span className="dynamic-badge">Dynamic Rate</span>
                                            </div>
                                        )}
                                        <div className="detail-item">
                                            <label>Check-in Date:</label>
                                            <span>{reservation?.checkInDate || '03-02-2026'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Check-out Date:</label>
                                            <span>{reservation?.checkOutDate || '04-02-2026'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Status:</label>
                                            <span className="status-badge confirmed">
                                                {reservation?.status || 'CONFIRMED'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'guestDetails' && (
                                <div className="guest-details-content">
                                    <h3>Guest Information</h3>
                                    <div className="details-grid">
                                        <div className="detail-item">
                                            <label>Name:</label>
                                            <span>{reservation?.guestName || 'Mr. Shahrukh Ahmed'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Mobile:</label>
                                            <span>{reservation?.mobileNumber || '+91 9876543210'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Email:</label>
                                            <span>guest@example.com</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Address:</label>
                                            <span>Mumbai, Maharashtra</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'folioOperations' && (
                                <div className="folio-operations-content">
                                    <h3>Folio Operations</h3>
                                    <p>Manage payments, transfers, and folio operations here.</p>
                                </div>
                            )}

                            {activeTab === 'auditTrail' && (
                                <div className="audit-trail-content">
                                    <h3>Audit Trail</h3>
                                    <p>View all activities and changes made to this reservation.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Summary */}
                <div className="summary-footer">
                    <div className="summary-item">
                        <label>Sub Total</label>
                        <span>₹ {totals.subTotal}</span>
                    </div>
                    <div className="summary-item">
                        <label>Grand Total</label>
                        <span>₹ {totals.grandTotal}</span>
                    </div>
                    <div className="summary-item">
                        <label>Paid</label>
                        <span className="paid-amount">₹ {totals.paid}</span>
                    </div>
                    <div className="summary-item">
                        <label>Sub Total</label>
                        <span>₹ {totals.subTotal}</span>
                    </div>
                    <div className="summary-item">
                        <label>Grand Total</label>
                        <span>₹ {totals.grandTotal}</span>
                    </div>
                    <div className="summary-item highlight">
                        <label>Balance</label>
                        <span>₹ {totals.balance}</span>
                    </div>
                    <div className="summary-item">
                        <label>Paid</label>
                        <span className="paid-amount">₹ {totals.paid}</span>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ReservationDetailsView;
