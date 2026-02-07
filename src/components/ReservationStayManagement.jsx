import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import './ReservationStayManagement.css';
import './CreateGuestForm.css';
import RoomRow from './RoomRow';
import GuestModal from './GuestModal';
import BillingSummary from './BillingSummary';
import ReservationCard from './ReservationCard';
import ReservationDetailsView from './ReservationDetailsView';
import InvoiceGenerator from './InvoiceGenerator';
import InvoiceView from './InvoiceView';
import './InvoiceView.css';

const ReservationStayManagement = () => {
    const [view, setView] = useState('dashboard'); // 'dashboard', 'form', or 'details'
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [sectionTab, setSectionTab] = useState('stay-overview'); // 'stay-overview', 'reservation', 'housekeeping', 'room-service'
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'reserved', 'in-house', 'checked-out'
    const [currentRoomIndex, setCurrentRoomIndex] = useState(0); // Track which room is being edited
    
    // Reservation/Booking Data
    const [reservations, setReservations] = useState(getDummyReservations());
    const [isEditingMode, setIsEditingMode] = useState(false);
    const [editingReservationId, setEditingReservationId] = useState(null);

    // Form State - Reservation Meta
    const [reservationType, setReservationType] = useState('Confirm');
    const [bookingSource, setBookingSource] = useState('Direct');
    const [businessSource, setBusinessSource] = useState('Walk-In');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [arrivalFrom, setArrivalFrom] = useState('');
    const [purposeOfVisit, setPurposeOfVisit] = useState('');

    // Form State - Stay Details
    const [checkInDate, setCheckInDate] = useState('');
    const [checkInTime, setCheckInTime] = useState('14:00');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [checkOutTime, setCheckOutTime] = useState('11:00');
    const [flexibleCheckout, setFlexibleCheckout] = useState(false);

    // Form State - Room Details
    const [rooms, setRooms] = useState([{
        id: 1,
        categoryId: 'deluxe-ac-double',
        mealPlan: 'Veg',
        adultsCount: 1,
        childrenCount: 0,
        ratePerNight: 3000,
        discount: 0
    }]);

    // Form State - Guest Information
    const [selectedGuest, setSelectedGuest] = useState(null);
    const [showGuestModal, setShowGuestModal] = useState(false);
    const [guests] = useState(getDummyGuests());

    // Billing State
    const [paidAmount, setPaidAmount] = useState(0);
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [taxExempt, setTaxExempt] = useState(false);

    // Invoice State
    const [invoices, setInvoices] = useState([]);
    const [currentInvoice, setCurrentInvoice] = useState(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [_invoiceGenerationInProgress, setInvoiceGenerationInProgress] = useState(false);

    // Housekeeping State
    const [housekeepingItems, _setHousekeepingItems] = useState(getDummyHousekeepingItems());
    const [housekeepingSearch, setHousekeepingSearch] = useState('');
    const [showHousekeepingModal, setShowHousekeepingModal] = useState(false);
    const [housekeepingFormData, setHousekeepingFormData] = useState({ name: '', colorCode: '#ff4444', status: 'Active' });

    // Room Service State (now Food Ordering)
    const [roomServiceItems, _setRoomServiceItems] = useState(getDummyRoomServiceItems());
    const [foodItems, _setFoodItems] = useState(getDummyFoodItems());
    const [foodSearch, setFoodSearch] = useState('');
    const [foodCodeSearch, setFoodCodeSearch] = useState('');
    const [selectedFoodCategory, setSelectedFoodCategory] = useState('Ala Carte');
    const [roomServiceView, setRoomServiceView] = useState('list'); // 'list' or 'food'
    const [selectedFoods, setSelectedFoods] = useState({});
    const [roomServiceSearch, setRoomServiceSearch] = useState('');
    const [roomServiceFilter, setRoomServiceFilter] = useState('all'); // 'all', 'running', 'reservation'

    // Room Categories
    const roomCategories = useMemo(() => ({
        'deluxe-ac-double': { name: 'Deluxe AC Double', baseRate: 3000 },
        'deluxe-ac-single': { name: 'Deluxe AC Single', baseRate: 2000 },
        'deluxe-non-ac': { name: 'Deluxe Non-AC', baseRate: 1500 },
        'club-ac-double': { name: 'Club AC Double', baseRate: 4000 },
        'club-ac-single': { name: 'Club AC Single', baseRate: 2800 },
        'suite': { name: 'Executive Suite', baseRate: 5500 }
    }), []);

    // Calculate nights
    const calculateNights = useCallback(() => {
        if (!checkInDate || !checkOutDate) return 0;
        const inDate = new Date(checkInDate);
        const outDate = new Date(checkOutDate);
        return Math.max(1, Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24)));
    }, [checkInDate, checkOutDate]);

    const nights = calculateNights();

    // Calculate billing
    const billingData = useMemo(() => {
        const roomCharges = rooms.reduce((sum, room) => sum + (room.ratePerNight * nights), 0);
        const totalDiscount = rooms.reduce((sum, room) => sum + (room.discount * nights), 0);
        const subtotal = roomCharges - totalDiscount;
        const taxAmount = taxExempt ? 0 : Math.round(subtotal * 0.12);
        const totalAmount = subtotal + taxAmount;
        const balanceDue = Math.max(0, totalAmount - (paidAmount || 0));

        return {
            roomCharges,
            totalDiscount,
            subtotal,
            taxAmount,
            totalAmount,
            paidAmount: paidAmount || 0,
            balanceDue,
            paymentMode
        };
    }, [rooms, nights, paidAmount, paymentMode, taxExempt]);

    // Handle View Invoice
    const handleViewInvoice = useCallback((invoiceId) => {
        const invoice = invoices.find(inv => inv.invoiceId === invoiceId);
        if (invoice) {
            setCurrentInvoice(invoice);
            setShowInvoiceModal(true);
        }
    }, [invoices]);

    // Handle Generate Invoice
    const handleGenerateInvoice = useCallback(async (reservation) => {
        if (reservation.actionType === 'viewInvoice') {
            if (reservation.invoiceId) {
                handleViewInvoice(reservation.invoiceId);
            }
            return;
        }

        if (reservation.status !== 'IN_HOUSE' && reservation.status !== 'CHECKED_OUT') {
            alert('Invoice can only be generated during check-out');
            return;
        }

        setInvoiceGenerationInProgress(true);
        
        try {
            const billingDataForInvoice = {
                roomCharges: reservation.roomCharges,
                totalDiscount: reservation.discount,
                subtotal: reservation.roomCharges - reservation.discount,
                taxAmount: reservation.tax,
                totalAmount: reservation.totalAmount,
                paidAmount: reservation.paidAmount,
                balanceDue: reservation.balanceDue,
                paymentMode: reservation.paymentMode
            };

            const invoice = InvoiceGenerator.generateInvoice(reservation, billingDataForInvoice);
            await InvoiceGenerator.saveInvoice(invoice);
            
            setInvoices([...invoices, invoice]);
            setCurrentInvoice(invoice);
            setShowInvoiceModal(true);

            setReservations(reservations.map(r => 
                r.id === reservation.id ? {
                    ...r,
                    status: 'CHECKED_OUT',
                    invoiceId: invoice.invoiceId,
                    updatedAt: new Date().toISOString()
                } : r
            ));

            alert('Invoice generated successfully!');
        } finally {
            setInvoiceGenerationInProgress(false);
        }
    }, [invoices, reservations, handleViewInvoice]);

    // Handle Update Status
    const handleUpdateReservationStatus = useCallback((reservationId, newStatus) => {
        setReservations(reservations.map(r =>
            r.id === reservationId ? { ...r, status: newStatus, updatedAt: new Date().toISOString() } : r
        ));
    }, [reservations]);

    // Reset Form
    const resetForm = useCallback(() => {
        setIsEditingMode(false);
        setEditingReservationId(null);
        setSelectedReservation(null);
        setReservationType('Confirm');
        setBookingSource('Direct');
        setBusinessSource('Walk-In');
        setReferenceNumber('');
        setArrivalFrom('');
        setPurposeOfVisit('');
        setCheckInDate('');
        setCheckInTime('14:00');
        setCheckOutDate('');
        setCheckOutTime('11:00');
        setFlexibleCheckout(false);
        setRooms([{ id: 1, categoryId: 'deluxe-ac-double', mealPlan: 'Veg', adultsCount: 1, childrenCount: 0, ratePerNight: 3000, discount: 0 }]);
        setSelectedGuest(null);
        setPaidAmount(0);
        setPaymentMode('Cash');
        setTaxExempt(false);
        setShowGuestModal(false);
        setShowInvoiceModal(false);
        setCurrentInvoice(null);
    }, []);

    // Handle Save Reservation
    const handleSaveReservation = (e) => {
        e.preventDefault();

        if (!selectedGuest) {
            alert('Please select a guest');
            return;
        }

        if (!checkInDate || !checkOutDate) {
            alert('Please enter check-in and check-out dates');
            return;
        }

        if (new Date(checkOutDate) <= new Date(checkInDate)) {
            alert('Check-out date must be after check-in date');
            return;
        }

        const newReservation = {
            id: isEditingMode ? editingReservationId : 'RES-' + Date.now(),
            reservationType,
            bookingSource,
            businessSource,
            referenceNumber,
            arrivalFrom,
            purposeOfVisit,
            guestId: selectedGuest.guestId || selectedGuest.id,
            guestName: selectedGuest.fullName || selectedGuest.name,
            guestEmail: selectedGuest.email,
            guestPhone: selectedGuest.mobile || selectedGuest.phone,
            checkInDate,
            checkInTime,
            checkOutDate,
            checkOutTime,
            flexibleCheckout,
            rooms: JSON.parse(JSON.stringify(rooms)),
            nights,
            status: isEditingMode ? reservations.find(r => r.id === editingReservationId)?.status : 'RESERVED',
            ...billingData,
            createdAt: isEditingMode ? reservations.find(r => r.id === editingReservationId)?.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (isEditingMode) {
            setReservations(reservations.map(r => r.id === editingReservationId ? newReservation : r));
        } else {
            setReservations([newReservation, ...reservations]);
        }

        resetForm();
        setView('dashboard');
        alert(isEditingMode ? 'Reservation updated successfully!' : 'Reservation created successfully!');
    };

    // Handle View Reservation Details
    const handleViewReservationDetails = useCallback((reservation) => {
        setSelectedReservation(reservation);
        setView('details');
    }, []);

    // Handle Close Details View
    const handleCloseDetailsView = useCallback(() => {
        setSelectedReservation(null);
        setView('dashboard');
    }, []);

    // Handle Edit
    const handleEditReservation = (reservation) => {
        setEditingReservationId(reservation.id);
        setIsEditingMode(true);
        setReservationType(reservation.reservationType);
        setBookingSource(reservation.bookingSource);
        setBusinessSource(reservation.businessSource);
        setReferenceNumber(reservation.referenceNumber);
        setArrivalFrom(reservation.arrivalFrom);
        setPurposeOfVisit(reservation.purposeOfVisit);
        setCheckInDate(reservation.checkInDate);
        setCheckInTime(reservation.checkInTime);
        setCheckOutDate(reservation.checkOutDate);
        setCheckOutTime(reservation.checkOutTime);
        setFlexibleCheckout(reservation.flexibleCheckout);
        setRooms(JSON.parse(JSON.stringify(reservation.rooms)));
        setSelectedGuest({
            id: reservation.guestId,
            name: reservation.guestName,
            email: reservation.guestEmail,
            phone: reservation.guestPhone
        });
        setPaidAmount(reservation.paidAmount);
        setPaymentMode(reservation.paymentMode);
        setTaxExempt(reservation.taxExempt);
        setView('form');
    };

    // Handle Delete
    const handleDeleteReservation = (reservationId) => {
        setReservations(reservations.filter(r => r.id !== reservationId));
    };

    // Housekeeping Handlers
    const handleAddHousekeepingItem = () => {
        if (housekeepingFormData.name.trim()) {
            const _newItem = {
                id: Date.now(),
                name: housekeepingFormData.name,
                count: 0,
                status: housekeepingFormData.status,
                colorCode: housekeepingFormData.colorCode
            };
            // In a real app, this would be an API call
            setShowHousekeepingModal(false);
            setHousekeepingFormData({ name: '', colorCode: '#ff4444', status: 'Active' });
        }
    };

    const handleOpenHousekeepingModal = () => {
        setHousekeepingFormData({ name: '', colorCode: '#ff4444', status: 'Active' });
        setShowHousekeepingModal(true);
    };

    const handleCloseHousekeepingModal = () => {
        setShowHousekeepingModal(false);
        setHousekeepingFormData({ name: '', colorCode: '#ff4444', status: 'Active' });
    };

    // Room Service Handlers
    const handleOpenRoomServiceModal = () => {
        setRoomServiceView('food');
    };


    // Filter reservations
    const filteredReservations = useMemo(() => {
        return reservations.filter(r => {
            if (activeTab === 'all') return true;
            if (activeTab === 'reserved') return r.status === 'RESERVED';
            if (activeTab === 'in-house') return r.status === 'IN_HOUSE';
            if (activeTab === 'checked-out') return r.status === 'CHECKED_OUT';
            return true;
        });
    }, [reservations, activeTab]);

    if (view === 'details' && selectedReservation) {
        return (
            <ReservationDetailsView
                reservation={selectedReservation}
                onClose={handleCloseDetailsView}
                onUpdateStatus={handleUpdateReservationStatus}
                onEdit={(reservation) => {
                    handleEditReservation(reservation);
                    setView('form');
                }}
                onGenerateInvoice={handleGenerateInvoice}
            />
        );
    }

    if (view === 'form') {
        return (
            <div className="reservation-management-container">
                <div className="form-container">
                    <div className="form-main">
                        <button className="back-btn" onClick={() => { resetForm(); setView('dashboard'); }}>
                            ← Back to Dashboard
                        </button>
                        <h1>{isEditingMode ? 'Edit Reservation' : 'Create New Reservation'}</h1>

                        <form onSubmit={handleSaveReservation} className="reservation-form-view">
                            {/* Reservation Details Section */}
                            <div className="form-section">
                                <h3 className="section-title">📋 Reservation Details</h3>
                                <div className="form-grid-2">
                                    <div className="form-row">
                                        <label>Reservation Type</label>
                                        <select value={reservationType} onChange={(e) => setReservationType(e.target.value)}>
                                            <option value="Confirm">Confirm</option>
                                            <option value="Provisional">Provisional</option>
                                            <option value="Tentative">Tentative</option>
                                        </select>
                                    </div>
                                    <div className="form-row">
                                        <label>Booking Source</label>
                                        <select value={bookingSource} onChange={(e) => setBookingSource(e.target.value)}>
                                            <option value="Direct">Direct</option>
                                            <option value="OTA">OTA</option>
                                            <option value="Travel Agent">Travel Agent</option>
                                            <option value="Corporate">Corporate</option>
                                        </select>
                                    </div>
                                    <div className="form-row">
                                        <label>Business Source</label>
                                        <select value={businessSource} onChange={(e) => setBusinessSource(e.target.value)}>
                                            <option value="Walk-In">Walk-In</option>
                                            <option value="Phone">Phone</option>
                                            <option value="Email">Email</option>
                                            <option value="Website">Website</option>
                                        </select>
                                    </div>
                                    <div className="form-row">
                                        <label>Reference Number</label>
                                        <input type="text" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="Booking reference..." />
                                    </div>
                                    <div className="form-row">
                                        <label>Arrival From</label>
                                        <input type="text" value={arrivalFrom} onChange={(e) => setArrivalFrom(e.target.value)} />
                                    </div>
                                    <div className="form-row">
                                        <label>Purpose of Visit</label>
                                        <input type="text" value={purposeOfVisit} onChange={(e) => setPurposeOfVisit(e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            {/* Guest Selection Section */}
                            <div className="form-section">
                                <h3 className="section-title">👤 Guest Information</h3>
                                {selectedGuest ? (
                                    <div className="guest-selection">
                                        <div className="selected-guest-card">
                                            <div className="guest-info">
                                                <p className="guest-name">{selectedGuest.fullName || selectedGuest.name}</p>
                                                <p className="guest-details">{selectedGuest.mobile || selectedGuest.phone} | {selectedGuest.email}</p>
                                            </div>
                                            <button type="button" className="btn btn-sm btn-outline" onClick={() => setShowGuestModal(true)}>
                                                Change
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="no-guest-selected">
                                        <p>No guest selected</p>
                                        <button type="button" className="btn btn-primary" onClick={() => setShowGuestModal(true)}>
                                            + Select or Create Guest
                                        </button>
                                    </div>
                                )}
                                <GuestModal isOpen={showGuestModal} onClose={() => setShowGuestModal(false)} onSelectGuest={setSelectedGuest} guests={guests} />
                            </div>

                            {/* Stay Details Section */}
                            <div className="form-section">
                                <h3 className="section-title">🏨  Stay Details</h3>
                                <div className="form-grid-2">
                                    <div className="form-row">
                                        <label>Check-In Date</label>
                                        <input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} required />
                                    </div>
                                    <div className="form-row">
                                        <label>Check-In Time</label>
                                        <input type="time" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} />
                                    </div>
                                    <div className="form-row">
                                        <label>Check-Out Date</label>
                                        <input type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} required />
                                    </div>
                                    <div className="form-row">
                                        <label>Check-Out Time</label>
                                        <input type="time" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} />
                                    </div>
                                </div>
                                <label className="checkbox-label">
                                    <input type="checkbox" checked={flexibleCheckout} onChange={(e) => setFlexibleCheckout(e.target.checked)} />
                                    Flexible Checkout
                                </label>
                            </div>

                            {/* Rooms Section */}
                            <div className="form-section">
                                <h3 className="section-title">🛏️ Room Details ({nights} nights)</h3>
                                <div className="rooms-list">
                                    {rooms.map((room, index) => (
                                        <RoomRow
                                            key={index}
                                            room={room}
                                            index={index}
                                            roomCategories={roomCategories}
                                            onUpdate={(idx, updatedRoom) => {
                                                const newRooms = [...rooms];
                                                newRooms[idx] = updatedRoom;
                                                setRooms(newRooms);
                                            }}
                                            onRemove={(idx) => setRooms(rooms.filter((_, i) => i !== idx))}
                                        />
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-add-room"
                                    onClick={() => setRooms([...rooms, {
                                        id: rooms.length + 1,
                                        categoryId: 'deluxe-ac-double',
                                        mealPlan: 'CP',
                                        adultsCount: 1,
                                        childrenCount: 0,
                                        ratePerNight: 3000,
                                        discount: 0
                                    }])}
                                >
                                    + Add Room
                                </button>
                            </div>

                            {/* Form Actions */}
                            <div className="form-actions">
                                <button type="button" className="btn btn-outline" onClick={() => { resetForm(); setView('dashboard'); }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {isEditingMode ? 'Update Reservation' : 'Create Reservation'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Billing Summary Panel */}
                    <BillingSummary
                        roomCharges={billingData.roomCharges}
                        discount={billingData.totalDiscount}
                        tax={billingData.taxAmount}
                        totalAmount={billingData.totalAmount}
                        paidAmount={paidAmount}
                        balanceDue={billingData.balanceDue}
                        paymentMode={paymentMode}
                        onPaymentModeChange={setPaymentMode}
                        onPaidAmountChange={setPaidAmount}
                        onTaxExemptChange={setTaxExempt}
                        taxExempt={taxExempt}
                    />
                </div>

                {/* Invoice Modal */}
                <AnimatePresence>
                    {showInvoiceModal && currentInvoice && (
                        <div className="invoice-modal-overlay">
                            <div className="invoice-modal-content">
                                <InvoiceView
                                    invoice={currentInvoice}
                                    onClose={() => setShowInvoiceModal(false)}
                                    onPrint={() => console.log('Print invoice')}
                                    isModal={true}
                                />
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // Dashboard View
    return (
        <div className="reservation-management-container">
            {/* Header */}
            <div className="reservation-header">
                <div className="header-title">
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1a1a1a', margin: '0 0 0.5rem 0' }}>
                        🏨 Reservations & Stay Management
                    </h2>
                    <p>Manage guest reservations, check-ins, check-outs, and billing</p>
                </div>
                <div className="header-actions">
                    {/* New Reservation button hidden as per requirements */}
                </div>
            </div>

            {/* Section Tabs */}
            <div className="section-tabs-container">
                {['stay-overview', 'reservation', 'housekeeping', 'room-service'].map(tab => (
                    <button
                        key={tab}
                        className={`section-tab-btn ${sectionTab === tab ? 'active' : ''}`}
                        onClick={() => setSectionTab(tab)}
                    >
                        {tab === 'stay-overview' && '👁️ Stay Overview'}
                        {tab === 'reservation' && '📋 Reservation'}
                        {tab === 'housekeeping' && '🧹 HouseKeeping View'}
                        {tab === 'room-service' && '🛎️ Room Service'}
                    </button>
                ))}
            </div>

            {/* Show Form when Reservation tab is selected */}
            {sectionTab === 'reservation' && (
                <div className="reservation-form-wrapper">
                    <div className="form-container">
                        <form className="reservation-form" onSubmit={handleSaveReservation}>
                            {/* Reservation Meta Section */}
                            <div className="form-section">
                                <h3 className="section-title">📋 Reservation Details</h3>
                                <div className="form-grid-3">
                                    <div className="form-row">
                                        <label>Reservation Type</label>
                                        <select value={reservationType} onChange={(e) => setReservationType(e.target.value)}>
                                            <option>Confirm</option>
                                            <option>Tentative</option>
                                            <option>Cancelled</option>
                                        </select>
                                    </div>
                                    <div className="form-row">
                                        <label>Booking Source</label>
                                        <select value={bookingSource} onChange={(e) => setBookingSource(e.target.value)}>
                                            <option>Direct</option>
                                            <option>OTA</option>
                                            <option>RefCode</option>
                                            <option>Agent</option>
                                        </select>
                                    </div>
                                    <div className="form-row">
                                        <label>Business Source</label>
                                        <select value={businessSource} onChange={(e) => setBusinessSource(e.target.value)}>
                                            <option>Walk-In</option>
                                            <option>Phone</option>
                                            <option>Email</option>
                                            <option>Online</option>
                                            <option>Travel Agent</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-grid-2">
                                    <div className="form-row">
                                        <label>Reference Number</label>
                                        <input type="text" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="e.g., WEB-2024-001" />
                                    </div>
                                    <div className="form-row">
                                        <label>Arrival From</label>
                                        <input type="text" value={arrivalFrom} onChange={(e) => setArrivalFrom(e.target.value)} placeholder="City/Location" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <label>Purpose of Visit</label>
                                    <input type="text" value={purposeOfVisit} onChange={(e) => setPurposeOfVisit(e.target.value)} placeholder="Business, Leisure, etc." />
                                </div>
                            </div>

                            {/* Guest Selection Section */}
                            <div className="form-section">
                                <h3 className="section-title">👤 Guest Information</h3>
                                {selectedGuest ? (
                                    <div className="selected-guest-info">
                                        <div className="guest-card">
                                            <div className="guest-details">
                                                <p><strong>{selectedGuest.fullName || selectedGuest.name}</strong></p>
                                                <p>{selectedGuest.email}</p>
                                                <p>{selectedGuest.mobile || selectedGuest.phone}</p>
                                            </div>
                                            <button type="button" className="btn btn-danger btn-sm" onClick={() => setSelectedGuest(null)}>Change</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="no-guest-selected">
                                        <p>No guest selected</p>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => setShowGuestModal(true)}
                                        >
                                            + Select or Create Guest
                                        </button>
                                    </div>
                                )}
                                <GuestModal isOpen={showGuestModal} onClose={() => setShowGuestModal(false)} onSelectGuest={setSelectedGuest} guests={guests} />
                            </div>

                            {/* Stay Details Section */}
                            <div className="form-section">
                                <h3 className="section-title">🏨 Stay Details</h3>
                                <div className="form-grid-2">
                                    <div className="form-row">
                                        <label>Check-In Date</label>
                                        <input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} required />
                                    </div>
                                    <div className="form-row">
                                        <label>Check-In Time</label>
                                        <input type="time" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} />
                                    </div>
                                    <div className="form-row">
                                        <label>Check-Out Date</label>
                                        <input type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} required />
                                    </div>
                                    <div className="form-row">
                                        <label>Check-Out Time</label>
                                        <input type="time" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <label className="checkbox-label">
                                        <input type="checkbox" checked={flexibleCheckout} onChange={(e) => setFlexibleCheckout(e.target.checked)} />
                                        Flexible Checkout
                                    </label>
                                    <label className="checkbox-label">
                                        <input type="checkbox" checked={!flexibleCheckout} onChange={(e) => setFlexibleCheckout(!e.target.checked)} />
                                        Fixed Checkout
                                    </label>
                                </div>
                            </div>

                            {/* Rooms Section */}
                            <div className="form-section">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 className="section-title" style={{ margin: 0 }}>🛏️ Room Details ({nights} nights)</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>No. of Rooms:</label>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            value={rooms.length}
                                            style={{ width: '60px', padding: '0.4rem', fontSize: '0.85rem', borderRadius: '0.4rem', border: '1px solid #ddd' }}
                                            onChange={(e) => {
                                                const newCount = parseInt(e.target.value) || 1;
                                                const currentCount = rooms.length;
                                                if (newCount > currentCount) {
                                                    const newRooms = [...rooms];
                                                    for (let i = currentCount; i < newCount; i++) {
                                                        newRooms.push({
                                                            id: i + 1,
                                                            categoryId: 'deluxe-ac-double',
                                                            mealPlan: 'Veg',
                                                            adultsCount: 1,
                                                            childrenCount: 0,
                                                            ratePerNight: 3000,
                                                            discount: 0
                                                        });
                                                    }
                                                    setRooms(newRooms);
                                                } else if (newCount < currentCount) {
                                                    setRooms(rooms.slice(0, newCount));
                                                    if (currentRoomIndex >= newCount) {
                                                        setCurrentRoomIndex(newCount - 1);
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                {rooms.length > 0 && (
                                    <div className="room-item" style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '0.55rem', border: '1px solid #e5e5e5' }}>
                                        <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #ddd' }}>
                                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#666' }}>Room {currentRoomIndex + 1} of {rooms.length}</p>
                                        </div>
                                        
                                        <RoomRow
                                            room={rooms[currentRoomIndex]}
                                            index={currentRoomIndex}
                                            roomCategories={roomCategories}
                                            onUpdate={(idx, updatedRoom) => {
                                                const newRooms = [...rooms];
                                                newRooms[idx] = updatedRoom;
                                                setRooms(newRooms);
                                            }}
                                            onRemove={() => {}}
                                        />

                                        {/* Remove Button Below Card */}
                                        {rooms.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setRooms(rooms.filter((_, i) => i !== currentRoomIndex));
                                                    if (currentRoomIndex >= rooms.length - 1) {
                                                        setCurrentRoomIndex(Math.max(0, currentRoomIndex - 1));
                                                    }
                                                }}
                                                style={{
                                                    marginTop: '1rem',
                                                    padding: '0.4rem 0.8rem',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    backgroundColor: '#dc3545',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '0.3rem',
                                                    cursor: 'pointer',
                                                    width: 'fit-content'
                                                }}
                                            >
                                                ✕ Remove Room
                                            </button>
                                        )}

                                        {/* Navigation Buttons */}
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
                                            <button
                                                type="button"
                                                disabled={currentRoomIndex === 0}
                                                onClick={() => setCurrentRoomIndex(currentRoomIndex - 1)}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    backgroundColor: currentRoomIndex === 0 ? '#ddd' : '#dc3545',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '0.4rem',
                                                    cursor: currentRoomIndex === 0 ? 'not-allowed' : 'pointer',
                                                    opacity: currentRoomIndex === 0 ? 0.6 : 1
                                                }}
                                            >
                                                ← Previous
                                            </button>
                                            <button
                                                type="button"
                                                disabled={currentRoomIndex === rooms.length - 1}
                                                onClick={() => setCurrentRoomIndex(currentRoomIndex + 1)}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    backgroundColor: currentRoomIndex === rooms.length - 1 ? '#ddd' : '#dc3545',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '0.4rem',
                                                    cursor: currentRoomIndex === rooms.length - 1 ? 'not-allowed' : 'pointer',
                                                    opacity: currentRoomIndex === rooms.length - 1 ? 0.6 : 1
                                                }}
                                            >
                                                Next →
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-add-room"
                                    onClick={() => setRooms([...rooms, {
                                        id: rooms.length + 1,
                                        categoryId: 'deluxe-ac-double',
                                        mealPlan: 'CP',
                                        adultsCount: 1,
                                        childrenCount: 0,
                                        ratePerNight: 3000,
                                        discount: 0
                                    }])}
                                >
                                    + Add Room
                                </button>
                            </div>

                            {/* Form Actions */}
                            <div className="form-actions" style={{ justifyContent: 'flex-end', gap: '0.5rem', display: 'flex', flexDirection: 'row' }}>
                                <button type="button" className="btn btn-outline" onClick={() => { resetForm(); setSectionTab('stay-overview'); }} style={{ padding: '0.55rem 0.95rem', fontSize: '0.78rem' }}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-primary" style={{ padding: '0.65rem 1.1rem', fontSize: '0.82rem' }}>
                                    Check In
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.1rem', fontSize: '0.82rem' }}>
                                    Reservation
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Billing Summary Panel */}
                    <BillingSummary
                        roomCharges={billingData.roomCharges}
                        discount={billingData.totalDiscount}
                        tax={billingData.taxAmount}
                        totalAmount={billingData.totalAmount}
                        paidAmount={paidAmount}
                        balanceDue={billingData.balanceDue}
                        paymentMode={paymentMode}
                        onPaymentModeChange={setPaymentMode}
                        onPaidAmountChange={setPaidAmount}
                        onTaxExemptChange={setTaxExempt}
                        taxExempt={taxExempt}
                    />
                </div>
            )}

            {/* Show Dashboard when Stay Overview tab is selected */}
            {sectionTab === 'stay-overview' && (
                <>
                    <div className="reservation-tabs">
                        {['all', 'reserved', 'in-house', 'checked-out'].map(tab => (
                            <button
                                key={tab}
                                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab === 'all' ? 'All Reservations' : tab.replace('-', ' ').toUpperCase()}
                                <span style={{ marginLeft: '0.5rem' }}>({filteredReservations.length})</span>
                            </button>
                        ))}
                    </div>

                    {/* Reservation Cards */}
                    <div className="reservation-cards-grid">
                        {filteredReservations.length > 0 ? (
                            filteredReservations.map(reservation => (
                                <div
                                    key={reservation.id}
                                    onClick={() => handleViewReservationDetails(reservation)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <ReservationCard
                                        reservation={reservation}
                                        onUpdateStatus={handleUpdateReservationStatus}
                                        onEdit={handleEditReservation}
                                        onDelete={handleDeleteReservation}
                                        onGenerateInvoice={handleGenerateInvoice}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="no-data-message">
                                <p>No reservations found for this status</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Housekeeping View */}
            {sectionTab === 'housekeeping' && (
                <div className="housekeeping-view">
                    <div className="housekeeping-header">
                        <h2>🧹 HouseKeeping Management</h2>
                        <input
                            type="text"
                            placeholder="Search by name..."
                            className="housekeeping-search"
                            value={housekeepingSearch}
                            onChange={(e) => setHousekeepingSearch(e.target.value)}
                        />
                        <button className="btn btn-primary" onClick={handleOpenHousekeepingModal} style={{ fontSize: '0.85rem', padding: '0.6rem 1rem' }}>
                            + Add Item
                        </button>
                    </div>

                    <div className="housekeeping-table-wrapper">
                        <table className="housekeeping-table">
                            <thead>
                                <tr>
                                    <th>Sno</th>
                                    <th>Name</th>
                                    <th>Count</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {housekeepingItems
                                    .filter(item => item.name.toLowerCase().includes(housekeepingSearch.toLowerCase()))
                                    .map((item, index) => (
                                        <tr key={item.id}>
                                            <td>{index + 1}</td>
                                            <td>{item.name}</td>
                                            <td>{item.count}</td>
                                            <td>
                                                <span className={`status-badge status-${item.status.toLowerCase()}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button className="action-btn edit-btn" title="Edit">
                                                        ✏️
                                                    </button>
                                                    <button className="action-btn delete-btn" title="Delete">
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Housekeeping Item Modal */}
            {showHousekeepingModal && (
                <div className="modal-overlay" onClick={handleCloseHousekeepingModal}>
                    <div className="modal-content housekeeping-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add Housekeeping Item</h3>
                            <button className="modal-close" onClick={handleCloseHousekeepingModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Enter name</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Towels, Bedsheets"
                                    value={housekeepingFormData.name}
                                    onChange={(e) => setHousekeepingFormData({ ...housekeepingFormData, name: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Enter color code</label>
                                <div className="color-input-wrapper">
                                    <input
                                        type="color"
                                        value={housekeepingFormData.colorCode}
                                        onChange={(e) => setHousekeepingFormData({ ...housekeepingFormData, colorCode: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="#ff4444"
                                        value={housekeepingFormData.colorCode}
                                        onChange={(e) => setHousekeepingFormData({ ...housekeepingFormData, colorCode: e.target.value })}
                                        className="color-code-input"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Status</label>
                                <div className="radio-group">
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="Active"
                                            checked={housekeepingFormData.status === 'Active'}
                                            onChange={(e) => setHousekeepingFormData({ ...housekeepingFormData, status: e.target.value })}
                                        />
                                        <span>Active</span>
                                    </label>
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="Inactive"
                                            checked={housekeepingFormData.status === 'Inactive'}
                                            onChange={(e) => setHousekeepingFormData({ ...housekeepingFormData, status: e.target.value })}
                                        />
                                        <span>Inactive</span>
                                    </label>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={housekeepingFormData.isDirty || false}
                                        onChange={(e) => setHousekeepingFormData({ ...housekeepingFormData, isDirty: e.target.checked })}
                                    />
                                    <span>Mark as Dirty</span>
                                </label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={handleCloseHousekeepingModal}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleAddHousekeepingItem}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Room Service View */}
            {sectionTab === 'room-service' && roomServiceView === 'food' && (
                <div className="food-ordering-view">
                    <div className="food-header">
                        <button className="btn-back" onClick={() => setRoomServiceView('list')}>
                            ← Back
                        </button>
                        <h2>Food Ordering</h2>
                    </div>

                    <div className="food-container">
                        {/* Search Bars */}
                        <div className="search-section">
                            <div className="search-bar">
                                <input
                                    type="text"
                                    placeholder="Search items by name or code..."
                                    value={foodSearch}
                                    onChange={(e) => setFoodSearch(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                            <div className="search-bar">
                                <input
                                    type="text"
                                    placeholder="Short Code..."
                                    value={foodCodeSearch}
                                    onChange={(e) => setFoodCodeSearch(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                        </div>

                        <div className="food-main-layout">
                            {/* Sidebar with Categories */}
                            <div className="food-sidebar">
                                <h3>Categories</h3>
                                {['Ala Carte', 'Beverages', 'Breads', 'Breakfast', 'Budget Food', 'Chinese', 'Khabashe Combos', 'Kulcha', 'Haleem', "Pizza's", 'Biryani', 'Rice'].map((cat) => (
                                    <button
                                        key={cat}
                                        className={`category-btn ${selectedFoodCategory === cat ? 'active' : ''}`}
                                        onClick={() => setSelectedFoodCategory(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Food Items Grid */}
                            <div className="food-items-grid">
                                {foodItems
                                    .filter(item => 
                                        item.category === selectedFoodCategory &&
                                        (foodSearch === '' || item.name.toLowerCase().includes(foodSearch.toLowerCase()) || item.code.toLowerCase().includes(foodSearch.toLowerCase())) &&
                                        (foodCodeSearch === '' || item.shortCode.toLowerCase().includes(foodCodeSearch.toLowerCase()))
                                    )
                                    .map((item) => (
                                        <div key={item.id} className="food-card">
                                            <div className="food-card-body">
                                                <h4>{item.name}</h4>
                                                <div className="food-card-info">
                                                    <span className="code-badge">{item.code}</span>
                                                    <span className="price">₹{item.price}</span>
                                                </div>
                                                <div className="quantity-selector">
                                                    <button 
                                                        className="qty-btn"
                                                        onClick={() => {
                                                            const current = selectedFoods[item.id] || 0;
                                                            if (current > 0) {
                                                                setSelectedFoods({
                                                                    ...selectedFoods,
                                                                    [item.id]: current - 1
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        −
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={selectedFoods[item.id] || 0}
                                                        onChange={(e) => {
                                                            const val = Math.max(0, parseInt(e.target.value) || 0);
                                                            setSelectedFoods({
                                                                ...selectedFoods,
                                                                [item.id]: val
                                                            });
                                                        }}
                                                        className="qty-input"
                                                    />
                                                    <button
                                                        className="qty-btn"
                                                        onClick={() => {
                                                            const current = selectedFoods[item.id] || 0;
                                                            setSelectedFoods({
                                                                ...selectedFoods,
                                                                [item.id]: current + 1
                                                            });
                                                        }}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Room Service View */}
            {sectionTab === 'room-service' && roomServiceView === 'list' && (
                <div className="room-service-view">
                    <div className="room-service-header">
                        <h2>🛎️ Room Service</h2>
                        <input
                            type="text"
                            placeholder="Search"
                            className="room-service-search"
                            value={roomServiceSearch}
                            onChange={(e) => setRoomServiceSearch(e.target.value)}
                        />
                    </div>

                    <div className="room-service-filter-buttons">
                        <button 
                            className={`filter-btn ${roomServiceFilter === 'all' ? 'filter-btn-active' : ''}`}
                            onClick={() => setRoomServiceFilter('all')}
                        >
                            All
                        </button>
                        <button 
                            className={`filter-btn ${roomServiceFilter === 'running' ? 'filter-btn-active' : ''}`}
                            onClick={() => setRoomServiceFilter('running')}
                        >
                            Running
                        </button>
                        <button 
                            className={`filter-btn ${roomServiceFilter === 'reservation' ? 'filter-btn-active' : ''}`}
                            onClick={() => setRoomServiceFilter('reservation')}
                        >
                            Reservation
                        </button>
                    </div>

                    <div className="room-service-table-wrapper">
                        <table className="room-service-table">
                            <thead>
                                <tr>
                                    <th>Room No.</th>
                                    <th>Service Type</th>
                                    <th>Room Status</th>
                                    <th>Check In</th>
                                    <th>Check Out</th>
                                    <th>Rate</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roomServiceItems
                                    .filter(item => {
                                        const matchesSearch = item.roomNumber.toLowerCase().includes(roomServiceSearch.toLowerCase()) || item.serviceType.toLowerCase().includes(roomServiceSearch.toLowerCase());
                                        if (roomServiceFilter === 'all') return matchesSearch;
                                        if (roomServiceFilter === 'running') return matchesSearch && item.filter === 'running';
                                        if (roomServiceFilter === 'reservation') return matchesSearch && item.filter === 'reservation';
                                        return matchesSearch;
                                    })
                                    .map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <div className="room-with-guest">
                                                    <span className="room-number">🚪 {item.roomNumber}</span>
                                                    <span className="guest-name">{item.guestName}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="service-badge">{item.serviceType}</span>
                                            </td>
                                            <td>
                                                <span className={`status-badge service-status-${item.status.toLowerCase()}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="date-cell">{item.checkInDate}</td>
                                            <td className="date-cell">{item.checkOutDate}</td>
                                            <td className="rate-cell">
                                                <span className="rate-badge">₹{item.rate}</span>
                                            </td>
                                            <td>
                                                <button className="action-btn service-action-btn" onClick={handleOpenRoomServiceModal} title="Add Service">
                                                    +
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// Dummy Data Functions
function getDummyHousekeepingItems() {
    return [
        { id: 1, name: 'Dry', count: 5, status: 'Active', type: 'laundry' },
        { id: 2, name: 'Clean', count: 12, status: 'Active', type: 'status' },
        { id: 3, name: 'Maintenance', count: 2, status: 'Pending', type: 'status' },
        { id: 4, name: 'Busy', count: 3, status: 'Active', type: 'status' },
    ];
}

function getDummyRoomServiceItems() {
    return [
        { id: 1, roomNumber: '101', guestName: 'Rajesh Kumar', serviceType: 'Detox', status: 'Open', checkInDate: '2024-02-07', checkOutDate: '2024-02-10', rate: 3000, filter: 'running' },
        { id: 2, roomNumber: '102', guestName: 'Priya Sharma', serviceType: 'Aroma', status: 'Closed', checkInDate: '2024-02-06', checkOutDate: '2024-02-08', rate: 2500, filter: 'reservation' },
        { id: 3, roomNumber: '201', guestName: 'Amit Patel', serviceType: 'Massage', status: 'Open', checkInDate: '2024-02-07', checkOutDate: '2024-02-12', rate: 4000, filter: 'running' },
        { id: 4, roomNumber: '202', guestName: 'Neha Singh', serviceType: 'Spa', status: 'Open', checkInDate: '2024-02-07', checkOutDate: '2024-02-09', rate: 5000, filter: 'reservation' },
    ];
}

function getDummyReservations() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextMonth = new Date(today);
    nextMonth.setDate(nextMonth.getDate() + 30);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    return [
        {
            id: 'RES-001',
            reservationType: 'Confirm',
            bookingSource: 'Direct',
            businessSource: 'Walk-In',
            referenceNumber: 'WEB-2024-001',
            arrivalFrom: 'Delhi',
            purposeOfVisit: 'Leisure',
            guestId: 'G-001',
            guestName: 'Rajesh Kumar',
            guestEmail: 'rajesh@email.com',
            guestPhone: '9876543210',
            checkInDate: today.toISOString().split('T')[0],
            checkInTime: '14:00',
            checkOutDate: tomorrow.toISOString().split('T')[0],
            checkOutTime: '11:00',
            flexibleCheckout: false,
            rooms: [{ id: 1, categoryId: 'deluxe-ac-double', mealPlan: 'CP', adultsCount: 2, childrenCount: 1, ratePerNight: 3000, discount: 0 }],
            nights: 1,
            status: 'RESERVED',
            roomCharges: 3000,
            discount: 0,
            tax: 360,
            totalAmount: 3360,
            paidAmount: 1680,
            balanceDue: 1680,
            paymentMode: 'Card',
            taxExempt: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'RES-002',
            reservationType: 'Confirm',
            bookingSource: 'OTA',
            businessSource: 'Phone',
            referenceNumber: 'OTA-2024-045',
            arrivalFrom: 'Mumbai',
            purposeOfVisit: 'Business',
            guestId: 'G-002',
            guestName: 'Priya Singh',
            guestEmail: 'priya@email.com',
            guestPhone: '8765432109',
            checkInDate: today.toISOString().split('T')[0],
            checkInTime: '16:00',
            checkOutDate: nextWeek.toISOString().split('T')[0],
            checkOutTime: '11:00',
            flexibleCheckout: true,
            rooms: [{ id: 1, categoryId: 'club-ac-single', mealPlan: 'MAP', adultsCount: 1, childrenCount: 0, ratePerNight: 2800, discount: 100 }],
            nights: 7,
            status: 'IN_HOUSE',
            roomCharges: 19600,
            discount: 700,
            tax: 2268,
            totalAmount: 21168,
            paidAmount: 21168,
            balanceDue: 0,
            paymentMode: 'Online',
            taxExempt: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'RES-003',
            reservationType: 'Confirm',
            bookingSource: 'RefCode',
            businessSource: 'Email',
            referenceNumber: 'REF-2024-089',
            arrivalFrom: 'Bangalore',
            purposeOfVisit: 'Business',
            guestId: 'G-003',
            guestName: 'Amit Patel',
            guestEmail: 'amit@email.com',
            guestPhone: '7654321098',
            checkInDate: yesterday.toISOString().split('T')[0],
            checkInTime: '15:00',
            checkOutDate: today.toISOString().split('T')[0],
            checkOutTime: '11:00',
            flexibleCheckout: false,
            rooms: [{ id: 1, categoryId: 'suite', mealPlan: 'FB', adultsCount: 2, childrenCount: 0, ratePerNight: 5500, discount: 500 }],
            nights: 1,
            status: 'CHECKED_OUT',
            roomCharges: 5500,
            discount: 500,
            tax: 600,
            totalAmount: 5600,
            paidAmount: 5600,
            balanceDue: 0,
            paymentMode: 'Cash',
            taxExempt: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'RES-004',
            reservationType: 'Confirm',
            bookingSource: 'Direct',
            businessSource: 'Walk-In',
            referenceNumber: 'WEB-2024-156',
            arrivalFrom: 'Hyderabad',
            purposeOfVisit: 'Leisure',
            guestId: 'G-004',
            guestName: 'Neha Verma',
            guestEmail: 'neha@email.com',
            guestPhone: '6543210987',
            checkInDate: nextMonth.toISOString().split('T')[0],
            checkInTime: '14:00',
            checkOutDate: new Date(nextMonth.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            checkOutTime: '11:00',
            flexibleCheckout: true,
            rooms: [{ id: 1, categoryId: 'deluxe-ac-single', mealPlan: 'CP', adultsCount: 1, childrenCount: 0, ratePerNight: 2000, discount: 100 }],
            nights: 3,
            status: 'RESERVED',
            roomCharges: 6000,
            discount: 300,
            tax: 684,
            totalAmount: 6384,
            paidAmount: 3200,
            balanceDue: 3184,
            paymentMode: 'Card',
            taxExempt: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'RES-005',
            reservationType: 'Confirm',
            bookingSource: 'OTA',
            businessSource: 'Phone',
            referenceNumber: 'OTA-2024-201',
            arrivalFrom: 'Pune',
            purposeOfVisit: 'Business',
            guestId: 'G-005',
            guestName: 'Vikram Sharma',
            guestEmail: 'vikram.sharma@email.com',
            guestPhone: '5432109876',
            checkInDate: lastWeek.toISOString().split('T')[0],
            checkInTime: '14:00',
            checkOutDate: yesterday.toISOString().split('T')[0],
            checkOutTime: '11:00',
            flexibleCheckout: false,
            rooms: [{ id: 1, categoryId: 'club-ac-double', mealPlan: 'MAP', adultsCount: 2, childrenCount: 0, ratePerNight: 4000, discount: 200 }],
            nights: 6,
            status: 'CHECKED_OUT',
            roomCharges: 24000,
            discount: 1200,
            tax: 2736,
            totalAmount: 25536,
            paidAmount: 25536,
            balanceDue: 0,
            paymentMode: 'Online',
            taxExempt: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'RES-006',
            reservationType: 'Confirm',
            bookingSource: 'Direct',
            businessSource: 'Walk-In',
            referenceNumber: 'WEB-2024-267',
            arrivalFrom: 'Gurgaon',
            purposeOfVisit: 'Leisure',
            guestId: 'G-006',
            guestName: 'Anjali Kapoor',
            guestEmail: 'anjali.kapoor@email.com',
            guestPhone: '4321098765',
            checkInDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            checkInTime: '15:00',
            checkOutDate: new Date(today.getTime() + 17 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            checkOutTime: '11:00',
            flexibleCheckout: false,
            rooms: [{ id: 1, categoryId: 'deluxe-ac-double', mealPlan: 'CP', adultsCount: 2, childrenCount: 2, ratePerNight: 3000, discount: 300 }],
            nights: 3,
            status: 'RESERVED',
            roomCharges: 9000,
            discount: 900,
            tax: 972,
            totalAmount: 9072,
            paidAmount: 4536,
            balanceDue: 4536,
            paymentMode: 'Card',
            taxExempt: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];
}

function getDummyGuests() {
    return [
        {
            guestId: 'G-001',
            fullName: 'Rajesh Kumar',
            email: 'rajesh@email.com',
            mobile: '9876543210',
            gender: 'Male',
            nationality: 'Indian',
            address: { line: '123 Main Street', city: 'Mumbai', state: 'Maharashtra', country: 'India', pinCode: '400001' },
            idProof: { type: 'Aadhaar', number: '1234-5678-9012' },
            bookingCount: 5,
            createdAt: new Date().toISOString()
        },
        {
            guestId: 'G-002',
            fullName: 'Priya Singh',
            email: 'priya@email.com',
            mobile: '8765432109',
            gender: 'Female',
            nationality: 'Indian',
            address: { line: '456 Park Avenue', city: 'Delhi', state: 'Delhi', country: 'India', pinCode: '110001' },
            idProof: { type: 'Passport', number: 'P5678901' },
            bookingCount: 3,
            createdAt: new Date().toISOString()
        },
        {
            guestId: 'G-003',
            fullName: 'Amit Patel',
            email: 'amit@email.com',
            mobile: '7654321098',
            gender: 'Male',
            nationality: 'Indian',
            address: { line: '789 Business Park', city: 'Bangalore', state: 'Karnataka', country: 'India', pinCode: '560001' },
            idProof: { type: 'Driving License', number: 'DL-9876543' },
            bookingCount: 8,
            createdAt: new Date().toISOString()
        },
        {
            guestId: 'G-004',
            fullName: 'Neha Verma',
            email: 'neha@email.com',
            mobile: '6543210987',
            gender: 'Female',
            nationality: 'Indian',
            address: { line: '321 Corporate Street', city: 'Hyderabad', state: 'Telangana', country: 'India', pinCode: '500001' },
            idProof: { type: 'Voter ID', number: 'V1234567890' },
            bookingCount: 4,
            createdAt: new Date().toISOString()
        },
        {
            guestId: 'G-005',
            fullName: 'Vikram Sharma',
            email: 'vikram.sharma@email.com',
            mobile: '5432109876',
            gender: 'Male',
            nationality: 'Indian',
            address: { line: '555 Tech Avenue', city: 'Pune', state: 'Maharashtra', country: 'India', pinCode: '411001' },
            idProof: { type: 'Aadhaar', number: '9876-5432-1098' },
            bookingCount: 6,
            createdAt: new Date().toISOString()
        },
        {
            guestId: 'G-006',
            fullName: 'Anjali Kapoor',
            email: 'anjali.kapoor@email.com',
            mobile: '4321098765',
            gender: 'Female',
            nationality: 'Indian',
            address: { line: '888 Luxury Heights', city: 'Gurgaon', state: 'Haryana', country: 'India', pinCode: '122001' },
            idProof: { type: 'Passport', number: 'P1234567' },
            bookingCount: 2,
            createdAt: new Date().toISOString()
        },
        {
            guestId: 'G-007',
            fullName: 'Sujit Ghosh',
            email: 'sujit.ghosh@email.com',
            mobile: '3210987654',
            gender: 'Male',
            nationality: 'Indian',
            address: { line: '999 Business District', city: 'Kolkata', state: 'West Bengal', country: 'India', pinCode: '700001' },
            idProof: { type: 'Driving License', number: 'DL-1234567' },
            bookingCount: 7,
            createdAt: new Date().toISOString()
        },
        {
            guestId: 'G-008',
            fullName: 'Deepika Desai',
            email: 'deepika.desai@email.com',
            mobile: '2109876543',
            gender: 'Female',
            nationality: 'Indian',
            address: { line: '111 Marina Bay', city: 'Chennai', state: 'Tamil Nadu', country: 'India', pinCode: '600001' },
            idProof: { type: 'Voter ID', number: 'V9876543210' },
            bookingCount: 3,
            createdAt: new Date().toISOString()
        },
        {
            guestId: 'G-009',
            fullName: 'Rohan Mehta',
            email: 'rohan.mehta@email.com',
            mobile: '1098765432',
            gender: 'Male',
            nationality: 'Indian',
            address: { line: '222 Golden Gate', city: 'Ahmedabad', state: 'Gujarat', country: 'India', pinCode: '380001' },
            idProof: { type: 'Aadhaar', number: '5432-1098-7654' },
            bookingCount: 5,
            createdAt: new Date().toISOString()
        },
        {
            guestId: 'G-010',
            fullName: 'Meera Iyer',
            email: 'meera.iyer@email.com',
            mobile: '9012345678',
            gender: 'Female',
            nationality: 'Indian',
            address: { line: '333 Coastal View', city: 'Kochi', state: 'Kerala', country: 'India', pinCode: '682001' },
            idProof: { type: 'Passport', number: 'P9876543' },
            bookingCount: 4,
            createdAt: new Date().toISOString()
        }
    ];
}

function getDummyFoodItems() {
    const foodData = {
        'Ala Carte': [
            { id: 1, name: 'Grilled Chicken', category: 'Ala Carte', price: 320, code: 'GC001', shortCode: 'GC' },
            { id: 2, name: 'Fish Fry', category: 'Ala Carte', price: 280, code: 'FF001', shortCode: 'FF' },
            { id: 3, name: 'Tandoori Paneer', category: 'Ala Carte', price: 240, code: 'TP001', shortCode: 'TP' },
            { id: 4, name: 'Butter Chicken', category: 'Ala Carte', price: 300, code: 'BC001', shortCode: 'BC' },
            { id: 5, name: 'Dal Makhani', category: 'Ala Carte', price: 180, code: 'DM001', shortCode: 'DM' },
            { id: 6, name: 'Chana Masala', category: 'Ala Carte', price: 160, code: 'CM001', shortCode: 'CM' },
            { id: 7, name: 'Palak Paneer', category: 'Ala Carte', price: 220, code: 'PP001', shortCode: 'PP' },
            { id: 8, name: 'Biryani Rice', category: 'Ala Carte', price: 200, code: 'BR001', shortCode: 'BR' },
            { id: 9, name: 'Shrimp Curry', category: 'Ala Carte', price: 350, code: 'SC001', shortCode: 'SC' },
            { id: 10, name: 'Lamb Kebab', category: 'Ala Carte', price: 380, code: 'LK001', shortCode: 'LK' },
            { id: 11, name: 'Mixed Vegetable', category: 'Ala Carte', price: 150, code: 'MV001', shortCode: 'MV' },
            { id: 12, name: 'Egg Curry', category: 'Ala Carte', price: 140, code: 'EC001', shortCode: 'EC' },
        ],
        'Beverages': [
            { id: 13, name: 'Orange Juice', category: 'Beverages', price: 80, code: 'OJ001', shortCode: 'OJ' },
            { id: 14, name: 'Mango Lassi', category: 'Beverages', price: 90, code: 'ML001', shortCode: 'ML' },
            { id: 15, name: 'Iced Tea', category: 'Beverages', price: 60, code: 'IT001', shortCode: 'IT' },
            { id: 16, name: 'Coffee', category: 'Beverages', price: 70, code: 'CF001', shortCode: 'CF' },
            { id: 17, name: 'Lemon Water', category: 'Beverages', price: 40, code: 'LW001', shortCode: 'LW' },
            { id: 18, name: 'Soft Drinks', category: 'Beverages', price: 50, code: 'SD001', shortCode: 'SD' },
            { id: 19, name: 'Milkshake', category: 'Beverages', price: 100, code: 'MS001', shortCode: 'MS' },
            { id: 20, name: 'Fresh Lemonade', category: 'Beverages', price: 75, code: 'FL001', shortCode: 'FL' },
            { id: 21, name: 'Buttermilk', category: 'Beverages', price: 50, code: 'BM001', shortCode: 'BM' },
            { id: 22, name: 'Cucumber Water', category: 'Beverages', price: 45, code: 'CW001', shortCode: 'CW' },
            { id: 23, name: 'Guava Juice', category: 'Beverages', price: 85, code: 'GJ001', shortCode: 'GJ' },
            { id: 24, name: 'Pomegranate Juice', category: 'Beverages', price: 110, code: 'PJ001', shortCode: 'PJ' },
        ],
        'Breads': [
            { id: 25, name: 'Naan', category: 'Breads', price: 40, code: 'NN001', shortCode: 'NN' },
            { id: 26, name: 'Roti', category: 'Breads', price: 20, code: 'RT001', shortCode: 'RT' },
            { id: 27, name: 'Paratha', category: 'Breads', price: 50, code: 'PT001', shortCode: 'PT' },
            { id: 28, name: 'Puri', category: 'Breads', price: 30, code: 'PR001', shortCode: 'PR' },
            { id: 29, name: 'Bhature', category: 'Breads', price: 60, code: 'BH001', shortCode: 'BH' },
            { id: 30, name: 'Dosa', category: 'Breads', price: 70, code: 'DS001', shortCode: 'DS' },
            { id: 31, name: 'Idli', category: 'Breads', price: 50, code: 'ID001', shortCode: 'ID' },
            { id: 32, name: 'Uttapam', category: 'Breads', price: 80, code: 'UP001', shortCode: 'UP' },
            { id: 33, name: 'Garlic Naan', category: 'Breads', price: 55, code: 'GN001', shortCode: 'GN' },
            { id: 34, name: 'Butter Naan', category: 'Breads', price: 50, code: 'BUN001', shortCode: 'BUN' },
            { id: 35, name: 'Cheese Naan', category: 'Breads', price: 70, code: 'CHN001', shortCode: 'CHN' },
            { id: 36, name: 'Stuffed Paratha', category: 'Breads', price: 75, code: 'SP001', shortCode: 'SP' },
        ],
        'Breakfast': [
            { id: 37, name: 'Omelette', category: 'Breakfast', price: 80, code: 'OM001', shortCode: 'OM' },
            { id: 38, name: 'Pancakes', category: 'Breakfast', price: 100, code: 'PC001', shortCode: 'PC' },
            { id: 39, name: 'Poha', category: 'Breakfast', price: 60, code: 'PH001', shortCode: 'PH' },
            { id: 40, name: 'Upma', category: 'Breakfast', price: 70, code: 'UP001', shortCode: 'UP' },
            { id: 41, name: 'Toast & Jam', category: 'Breakfast', price: 50, code: 'TJ001', shortCode: 'TJ' },
            { id: 42, name: 'Cornflakes', category: 'Breakfast', price: 40, code: 'CF001', shortCode: 'CF' },
            { id: 43, name: 'Bread Omelette', category: 'Breakfast', price: 90, code: 'BO001', shortCode: 'BO' },
            { id: 44, name: 'Scrambled Eggs', category: 'Breakfast', price: 85, code: 'SE001', shortCode: 'SE' },
            { id: 45, name: 'Aloo Parathas', category: 'Breakfast', price: 75, code: 'AP001', shortCode: 'AP' },
            { id: 46, name: 'Chole Bhature', category: 'Breakfast', price: 120, code: 'CB001', shortCode: 'CB' },
            { id: 47, name: 'Masala Dosa', category: 'Breakfast', price: 90, code: 'MDS001', shortCode: 'MDS' },
            { id: 48, name: 'Fruit Salad', category: 'Breakfast', price: 110, code: 'FS001', shortCode: 'FS' },
        ],
        'Budget Food': [
            { id: 49, name: 'Rice Plate', category: 'Budget Food', price: 80, code: 'RP001', shortCode: 'RP' },
            { id: 50, name: 'Dal Rice', category: 'Budget Food', price: 90, code: 'DR001', shortCode: 'DR' },
            { id: 51, name: 'Sabzi Rice', category: 'Budget Food', price: 85, code: 'SR001', shortCode: 'SR' },
            { id: 52, name: 'Pickle & Rice', category: 'Budget Food', price: 75, code: 'PKR001', shortCode: 'PKR' },
            { id: 53, name: 'Egg Rice', category: 'Budget Food', price: 95, code: 'ER001', shortCode: 'ER' },
            { id: 54, name: 'Simple Roti', category: 'Budget Food', price: 30, code: 'SR001', shortCode: 'SR' },
            { id: 55, name: 'Vegetable Curry', category: 'Budget Food', price: 70, code: 'VC001', shortCode: 'VC' },
            { id: 56, name: 'Bean Curry', category: 'Budget Food', price: 65, code: 'BN001', shortCode: 'BN' },
            { id: 57, name: 'Peas Curry', category: 'Budget Food', price: 60, code: 'PS001', shortCode: 'PS' },
            { id: 58, name: 'Radish Curry', category: 'Budget Food', price: 50, code: 'RC001', shortCode: 'RC' },
            { id: 59, name: 'Carrot Curry', category: 'Budget Food', price: 55, code: 'CR001', shortCode: 'CR' },
            { id: 60, name: 'Spinach Curry', category: 'Budget Food', price: 60, code: 'SC001', shortCode: 'SC' },
        ],
        'Chinese': [
            { id: 61, name: 'Fried Rice', category: 'Chinese', price: 150, code: 'FR001', shortCode: 'FR' },
            { id: 62, name: 'Hakka Noodles', category: 'Chinese', price: 140, code: 'HN001', shortCode: 'HN' },
            { id: 63, name: 'Chow Mein', category: 'Chinese', price: 130, code: 'CM001', shortCode: 'CM' },
            { id: 64, name: 'Spring Rolls', category: 'Chinese', price: 120, code: 'SR001', shortCode: 'SR' },
            { id: 65, name: 'Manchuria', category: 'Chinese', price: 160, code: 'MC001', shortCode: 'MC' },
            { id: 66, name: 'Hot & Sour Soup', category: 'Chinese', price: 100, code: 'HSS001', shortCode: 'HSS' },
            { id: 67, name: 'Honey Chilli Potato', category: 'Chinese', price: 140, code: 'HCP001', shortCode: 'HCP' },
            { id: 68, name: 'Garlic Mushroom', category: 'Chinese', price: 150, code: 'GM001', shortCode: 'GM' },
            { id: 69, name: 'Paneer 65', category: 'Chinese', price: 170, code: 'P65001', shortCode: 'P65' },
            { id: 70, name: 'Chicken 65', category: 'Chinese', price: 180, code: 'C65001', shortCode: 'C65' },
            { id: 71, name: 'Corn Soup', category: 'Chinese', price: 90, code: 'CRS001', shortCode: 'CRS' },
            { id: 72, name: 'Schezwan Noodles', category: 'Chinese', price: 160, code: 'SN001', shortCode: 'SN' },
        ],
        'Khabashe Combos': [
            { id: 73, name: 'Samosa Combo', category: 'Khabashe Combos', price: 120, code: 'SCMB001', shortCode: 'SCMB' },
            { id: 74, name: 'Pakora Combo', category: 'Khabashe Combos', price: 140, code: 'PCMB001', shortCode: 'PCMB' },
            { id: 75, name: 'Chaat Combo', category: 'Khabashe Combos', price: 160, code: 'CHATCMB001', shortCode: 'CHATCMB' },
            { id: 76, name: 'Spice Mix', category: 'Khabashe Combos', price: 100, code: 'SM001', shortCode: 'SM' },
            { id: 77, name: 'Snack Platter', category: 'Khabashe Combos', price: 200, code: 'SP001', shortCode: 'SP' },
            { id: 78, name: 'Evening Special', category: 'Khabashe Combos', price: 180, code: 'ES001', shortCode: 'ES' },
            { id: 79, name: 'Jalebi Combo', category: 'Khabashe Combos', price: 130, code: 'JCB001', shortCode: 'JCB' },
            { id: 80, name: 'Fafda Combo', category: 'Khabashe Combos', price: 140, code: 'FCB001', shortCode: 'FCB' },
            { id: 81, name: 'Bhel Combo', category: 'Khabashe Combos', price: 110, code: 'BHELCMB001', shortCode: 'BHELCMB' },
            { id: 82, name: 'Pani Puri Combo', category: 'Khabashe Combos', price: 100, code: 'PPCOMBO001', shortCode: 'PPCOMBO' },
            { id: 83, name: 'Dahi Bhalle', category: 'Khabashe Combos', price: 120, code: 'DB001', shortCode: 'DB' },
            { id: 84, name: 'Namkeen Mix', category: 'Khabashe Combos', price: 90, code: 'NM001', shortCode: 'NM' },
        ],
        'Kulcha': [
            { id: 85, name: 'Aloo Kulcha', category: 'Kulcha', price: 80, code: 'AK001', shortCode: 'AK' },
            { id: 86, name: 'Paneer Kulcha', category: 'Kulcha', price: 100, code: 'PK001', shortCode: 'PK' },
            { id: 87, name: 'Onion Kulcha', category: 'Kulcha', price: 70, code: 'OK001', shortCode: 'OK' },
            { id: 88, name: 'Peas Kulcha', category: 'Kulcha', price: 75, code: 'PEASK001', shortCode: 'PEASK' },
            { id: 89, name: 'Mixed Veg Kulcha', category: 'Kulcha', price: 85, code: 'MVK001', shortCode: 'MVK' },
            { id: 90, name: 'Methi Kulcha', category: 'Kulcha', price: 80, code: 'MK001', shortCode: 'MK' },
            { id: 91, name: 'Cauliflower Kulcha', category: 'Kulcha', price: 90, code: 'CK001', shortCode: 'CK' },
            { id: 92, name: 'Spinach Kulcha', category: 'Kulcha', price: 80, code: 'SPINK001', shortCode: 'SPINK' },
            { id: 93, name: 'Corn Kulcha', category: 'Kulcha', price: 85, code: 'CORNK001', shortCode: 'CORNK' },
            { id: 94, name: 'Cheese Kulcha', category: 'Kulcha', price: 110, code: 'CHEESEK001', shortCode: 'CHEESEK' },
            { id: 95, name: 'Tandoori Kulcha', category: 'Kulcha', price: 120, code: 'TK001', shortCode: 'TK' },
            { id: 96, name: 'Butter Kulcha', category: 'Kulcha', price: 90, code: 'BK001', shortCode: 'BK' },
        ],
        'Haleem': [
            { id: 97, name: 'Chicken Haleem', category: 'Haleem', price: 200, code: 'CH001', shortCode: 'CH' },
            { id: 98, name: 'Mutton Haleem', category: 'Haleem', price: 250, code: 'MH001', shortCode: 'MH' },
            { id: 99, name: 'Beef Haleem', category: 'Haleem', price: 280, code: 'BH001', shortCode: 'BH' },
            { id: 100, name: 'Fish Haleem', category: 'Haleem', price: 240, code: 'FH001', shortCode: 'FH' },
            { id: 101, name: 'Vegetable Haleem', category: 'Haleem', price: 160, code: 'VH001', shortCode: 'VH' },
            { id: 102, name: 'Paneer Haleem', category: 'Haleem', price: 180, code: 'PH001', shortCode: 'PH' },
            { id: 103, name: 'Mixed Haleem', category: 'Haleem', price: 220, code: 'MIX001', shortCode: 'MIX' },
            { id: 104, name: 'Hyderabadi Haleem', category: 'Haleem', price: 260, code: 'HYD001', shortCode: 'HYD' },
            { id: 105, name: 'Spicy Haleem', category: 'Haleem', price: 210, code: 'SPYH001', shortCode: 'SPYH' },
            { id: 106, name: 'Mild Haleem', category: 'Haleem', price: 190, code: 'MILDH001', shortCode: 'MILDH' },
            { id: 107, name: 'Premium Haleem', category: 'Haleem', price: 300, code: 'PRM001', shortCode: 'PRM' },
            { id: 108, name: 'Biryani Haleem', category: 'Haleem', price: 270, code: 'BIR001', shortCode: 'BIR' },
        ],
        "Pizza's": [
            { id: 109, name: 'Margherita Pizza', category: "Pizza's", price: 250, code: 'MPI001', shortCode: 'MPI' },
            { id: 110, name: 'Pepperoni Pizza', category: "Pizza's", price: 280, code: 'PPI001', shortCode: 'PPI' },
            { id: 111, name: 'Veggie Pizza', category: "Pizza's", price: 220, code: 'VPI001', shortCode: 'VPI' },
            { id: 112, name: 'Paneer Pizza', category: "Pizza's", price: 240, code: 'PNPI001', shortCode: 'PNPI' },
            { id: 113, name: 'Chicken Pizza', category: "Pizza's", price: 300, code: 'CPI001', shortCode: 'CPI' },
            { id: 114, name: 'BBQ Chicken Pizza', category: "Pizza's", price: 320, code: 'BBQPI001', shortCode: 'BBQPI' },
            { id: 115, name: 'Cheese Burst Pizza', category: "Pizza's", price: 310, code: 'CBPI001', shortCode: 'CBPI' },
            { id: 116, name: 'Mexican Pizza', category: "Pizza's", price: 290, code: 'MEPI001', shortCode: 'MEPI' },
            { id: 117, name: 'Tandoori Pizza', category: "Pizza's", price: 300, code: 'TAPI001', shortCode: 'TAPI' },
            { id: 118, name: 'Garlic Bread Pizza', category: "Pizza's", price: 200, code: 'GBPI001', shortCode: 'GBPI' },
            { id: 119, name: 'Mushroom Pizza', category: "Pizza's", price: 260, code: 'MUPI001', shortCode: 'MUPI' },
            { id: 120, name: 'Olive Pizza', category: "Pizza's", price: 240, code: 'OLPI001', shortCode: 'OLPI' },
        ],
        'Biryani': [
            { id: 121, name: 'Chicken Biryani', category: 'Biryani', price: 280, code: 'CBR001', shortCode: 'CBR' },
            { id: 122, name: 'Mutton Biryani', category: 'Biryani', price: 320, code: 'MBR001', shortCode: 'MBR' },
            { id: 123, name: 'Beef Biryani', category: 'Biryani', price: 340, code: 'BBR001', shortCode: 'BBR' },
            { id: 124, name: 'Fish Biryani', category: 'Biryani', price: 300, code: 'FBR001', shortCode: 'FBR' },
            { id: 125, name: 'Vegetable Biryani', category: 'Biryani', price: 180, code: 'VBR001', shortCode: 'VBR' },
            { id: 126, name: 'Paneer Biryani', category: 'Biryani', price: 220, code: 'PBR001', shortCode: 'PBR' },
            { id: 127, name: 'Hyderabadi Biryani', category: 'Biryani', price: 330, code: 'HBR001', shortCode: 'HBR' },
            { id: 128, name: 'Lucknowi Biryani', category: 'Biryani', price: 350, code: 'LBR001', shortCode: 'LBR' },
            { id: 129, name: 'Kolkati Biryani', category: 'Biryani', price: 310, code: 'KBR001', shortCode: 'KBR' },
            { id: 130, name: 'Egg Biryani', category: 'Biryani', price: 240, code: 'EBR001', shortCode: 'EBR' },
            { id: 131, name: 'Prawn Biryani', category: 'Biryani', price: 360, code: 'PRBR001', shortCode: 'PRBR' },
            { id: 132, name: 'Mixed Biryani', category: 'Biryani', price: 380, code: 'MIXBR001', shortCode: 'MIXBR' },
        ],
        'Rice': [
            { id: 133, name: 'Plain Rice', category: 'Rice', price: 60, code: 'PR001', shortCode: 'PR' },
            { id: 134, name: 'Jeera Rice', category: 'Rice', price: 70, code: 'JR001', shortCode: 'JR' },
            { id: 135, name: 'Tamarind Rice', category: 'Rice', price: 80, code: 'TR001', shortCode: 'TR' },
            { id: 136, name: 'Lemon Rice', category: 'Rice', price: 75, code: 'LR001', shortCode: 'LR' },
            { id: 137, name: 'Curd Rice', category: 'Rice', price: 70, code: 'CR001', shortCode: 'CR' },
            { id: 138, name: 'Tomato Rice', category: 'Rice', price: 75, code: 'TOMR001', shortCode: 'TOMR' },
            { id: 139, name: 'Coconut Rice', category: 'Rice', price: 85, code: 'COR001', shortCode: 'COR' },
            { id: 140, name: 'Peas Rice', category: 'Rice', price: 80, code: 'PER001', shortCode: 'PER' },
            { id: 141, name: 'Corn Rice', category: 'Rice', price: 80, code: 'CORR001', shortCode: 'CORR' },
            { id: 142, name: 'Mixed Vegetable Rice', category: 'Rice', price: 90, code: 'MVR001', shortCode: 'MVR' },
            { id: 143, name: 'Garlic Rice', category: 'Rice', price: 85, code: 'GR001', shortCode: 'GR' },
            { id: 144, name: 'Fried Rice', category: 'Rice', price: 110, code: 'FR001', shortCode: 'FR' },
        ],
    };
    
    const allItems = [];
    Object.values(foodData).forEach(items => allItems.push(...items));
    return allItems;
}

export default ReservationStayManagement;
