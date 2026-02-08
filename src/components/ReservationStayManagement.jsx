import { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import API_URL_CONFIG from '../config/api';
import './ReservationStayManagement.css';
import './CreateGuestForm.css';
import RoomRow from './RoomRow';
import GuestModal from './GuestModal';
import BillingSummary from './BillingSummary';
import ReservationCard from './ReservationCard';
import InvoiceGenerator from './InvoiceGenerator';
import InvoiceView from './InvoiceView';
import './InvoiceView.css';
import EditReservationModal from './EditReservationModal';
import MoreOptionsMenu from './MoreOptionsMenu';
import BookingActionsManager from './BookingActionsManager';
import HousekeepingView from './HousekeepingView';
import RoomService from './RoomService';

const ReservationStayManagement = () => {
    const [view, setView] = useState('dashboard'); // 'dashboard', 'form', 'housekeeping', or 'roomservice'
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'reserved', 'in-house', 'checked-out'
    const [showEditModal, setShowEditModal] = useState(false); // Edit Reservation Modal state

    // Reservation/Booking Data
    const [reservations, setReservations] = useState([]);
    const [isEditingMode, setIsEditingMode] = useState(false);
    const [editingReservationId, setEditingReservationId] = useState(null);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = `${API_URL_CONFIG}/api/bookings`;

    // Fetch reservations from MongoDB
    useEffect(() => {
        fetchReservationsFromAPI();
        fetchGuestsFromAPI();
    }, []);

    const fetchReservationsFromAPI = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/list`);
            const data = await response.json();

            if (data.success && data.data) {
                // Map MongoDB bookings to reservation format
                const mappedReservations = data.data.map(booking => ({
                    id: booking._id,
                    reservationType: 'Confirm',
                    bookingSource: 'Direct',
                    businessSource: 'Walk-In',
                    referenceNumber: booking.bookingId || '',
                    arrivalFrom: '',
                    purposeOfVisit: '',
                    guestId: booking._id,
                    guestName: booking.guestName,
                    guestEmail: booking.email || '',
                    guestPhone: booking.mobileNumber,
                    checkInDate: new Date(booking.checkInDate).toISOString().split('T')[0],
                    checkInTime: '14:00',
                    checkOutDate: new Date(booking.checkOutDate).toISOString().split('T')[0],
                    checkOutTime: '11:00',
                    flexibleCheckout: false,
                    rooms: [{
                        id: 1,
                        categoryId: booking.roomType?.toLowerCase().replace(/ /g, '-') || 'deluxe-ac-double',
                        roomNumber: booking.roomNumber || '',
                        mealPlan: 'CP',
                        adultsCount: booking.numberOfGuests || 1,
                        childrenCount: 0,
                        ratePerNight: booking.pricePerNight || 0,
                        discount: 0
                    }],
                    nights: booking.numberOfNights || 1,
                    status: booking.status === 'Upcoming' ? 'RESERVED' :
                        booking.status === 'Checked-in' ? 'IN_HOUSE' :
                            booking.status === 'Checked-out' ? 'CHECKED_OUT' : 'RESERVED',
                    roomCharges: booking.totalAmount || 0,
                    discount: 0,
                    tax: 0,
                    totalAmount: booking.totalAmount || 0,
                    paidAmount: booking.advancePaid || 0,
                    balanceDue: booking.remainingAmount || 0,
                    paymentMode: 'Cash',
                    taxExempt: false,
                    createdAt: booking.createdAt || new Date().toISOString(),
                    updatedAt: booking.updatedAt || new Date().toISOString()
                }));

                console.log('Fetched and mapped reservations:', mappedReservations);
                setReservations(mappedReservations);
            }
        } catch (error) {
            console.error('Error fetching reservations:', error);
            setReservations([]);
        } finally {
            setLoading(false);
        }
    };

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
        roomNumber: '',
        mealPlan: 'CP',
        adultsCount: 1,
        childrenCount: 0,
        ratePerNight: 3000,
        discount: 0
    }]);

    // Form State - Guest Information
    const [selectedGuest, setSelectedGuest] = useState(null);
    const [showGuestModal, setShowGuestModal] = useState(false);
    const [guests, setGuests] = useState([]);

    // Fetch guests from API
    const fetchGuestsFromAPI = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/guests/list');
            const data = await response.json();
            
            if (data.success && data.data) {
                setGuests(data.data);
            }
        } catch (error) {
            console.error('Error fetching guests:', error);
            // Fallback to dummy data if API fails
            setGuests(getDummyGuests());
        }
    };

    // Billing State
    const [paidAmount, setPaidAmount] = useState(0);
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [taxExempt, setTaxExempt] = useState(false);

    // Invoice State
    const [invoices, setInvoices] = useState([]);
    const [currentInvoice, setCurrentInvoice] = useState(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [invoiceGenerationInProgress, setInvoiceGenerationInProgress] = useState(false);

    // More Options Menu State
    const [showMoreOptions, setShowMoreOptions] = useState(false);
    const [showAmendStayModal, setShowAmendStayModal] = useState(false);

    // Action Drawer State for More Options
    const [actionDrawerOpen, setActionDrawerOpen] = useState(false);
    const [currentAction, setCurrentAction] = useState(null);
    const [actionBooking, setActionBooking] = useState(null);

    // Amend Stay State
    const [amendArrivalDate, setAmendArrivalDate] = useState('');
    const [amendArrivalTime, setAmendArrivalTime] = useState('');
    const [amendArrivalPeriod, setAmendArrivalPeriod] = useState('PM');
    const [amendDepartureDate, setAmendDepartureDate] = useState('');
    const [amendDepartureTime, setAmendDepartureTime] = useState('');
    const [amendDeparturePeriod, setAmendDeparturePeriod] = useState('AM');

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

    // Handle More Options action selection
    const handleMoreOptionsAction = (actionType) => {
        if (!selectedReservation) return;

        // Convert reservation to booking format for the actions
        const bookingData = {
            _id: selectedReservation.id,
            bookingId: selectedReservation.referenceNumber,
            guestName: selectedReservation.guestName,
            mobileNumber: selectedReservation.guestPhone,
            email: selectedReservation.guestEmail,
            roomNumber: selectedReservation.rooms?.[0]?.roomNumber || '',
            roomType: selectedReservation.rooms?.[0]?.categoryId?.replace(/-/g, ' ').toUpperCase() || '',
            checkInDate: selectedReservation.checkInDate,
            checkOutDate: selectedReservation.checkOutDate,
            numberOfNights: selectedReservation.nights,
            numberOfGuests: selectedReservation.rooms?.[0]?.adultsCount || 1,
            pricePerNight: selectedReservation.rooms?.[0]?.ratePerNight || 0,
            totalAmount: selectedReservation.totalAmount || 0,
            advancePaid: selectedReservation.paidAmount || 0,
            status: selectedReservation.status === 'RESERVED' ? 'Upcoming' :
                selectedReservation.status === 'IN_HOUSE' ? 'Checked-in' :
                    selectedReservation.status === 'CHECKED_OUT' ? 'Checked-out' : 'Upcoming',
            visitors: [],
            transactions: []
        };

        setCurrentAction(actionType);
        setActionBooking(bookingData);
        setActionDrawerOpen(true);
    };

    // Handle action success - refresh reservations
    const handleActionSuccess = async () => {
        await fetchReservationsFromAPI();
        // Update selected reservation if it's still in the list
        if (selectedReservation) {
            const updated = reservations.find(r => r.id === selectedReservation.id);
            if (updated) {
                setSelectedReservation(updated);
            }
        }
    };

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
    const handleUpdateReservationStatus = useCallback(async (reservationId, newStatus) => {
        try {
            // Map UI status to MongoDB booking status
            const bookingStatus = newStatus === 'RESERVED' ? 'Upcoming' :
                newStatus === 'IN_HOUSE' ? 'Checked-in' :
                    newStatus === 'CHECKED_OUT' ? 'Checked-out' :
                        'Upcoming';

            const response = await fetch(`${API_URL}/status/${reservationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: bookingStatus })
            });

            const data = await response.json();
            if (data.success) {
                await fetchReservationsFromAPI();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    }, []);

    // Reset Form
    const resetForm = useCallback(() => {
        setIsEditingMode(false);
        setEditingReservationId(null);
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
        setRooms([{ id: 1, categoryId: 'deluxe-ac-double', roomNumber: '', mealPlan: 'CP', adultsCount: 1, childrenCount: 0, ratePerNight: 3000, discount: 0 }]);
        setSelectedGuest(null);
        setPaidAmount(0);
        setPaymentMode('Cash');
        setTaxExempt(false);
        setShowGuestModal(false);
        setShowInvoiceModal(false);
        setCurrentInvoice(null);
    }, []);

    // Handle Save Reservation
    const handleSaveReservation = async (e) => {
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

        // Map reservation data to MongoDB booking format
        const bookingData = {
            guestName: selectedGuest.fullName || selectedGuest.name,
            mobileNumber: selectedGuest.mobile || selectedGuest.phone,
            email: selectedGuest.email,
            roomType: rooms[0].categoryId.replace(/-/g, ' ').toUpperCase(),
            roomNumber: rooms[0].roomNumber || 'TBD',
            numberOfGuests: rooms[0].adultsCount + rooms[0].childrenCount,
            checkInDate,
            checkOutDate,
            numberOfNights: nights,
            pricePerNight: rooms[0].ratePerNight,
            totalAmount: billingData.totalAmount,
            advancePaid: billingData.paidAmount || 0,
            status: 'Upcoming'
        };

        try {
            if (isEditingMode) {
                // Update existing booking
                const response = await fetch(`${API_URL}/update/${editingReservationId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookingData)
                });

                const data = await response.json();
                if (data.success) {
                    await fetchReservationsFromAPI();
                    alert('Reservation updated successfully!');
                } else {
                    alert(`Error: ${data.message}`);
                    return;
                }
            } else {
                // Create new booking
                const response = await fetch(`${API_URL}/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookingData)
                });

                const data = await response.json();
                if (data.success) {
                    await fetchReservationsFromAPI();
                    alert('Reservation created successfully!');
                } else {
                    alert(`Error: ${data.message}`);
                    return;
                }
            }

            resetForm();
            setView('dashboard');
        } catch (error) {
            console.error('Error saving reservation:', error);
            alert('Failed to save reservation. Please check if the server is running.');
        }
    };

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
    const handleDeleteReservation = async (reservationId) => {
        if (!confirm('Are you sure you want to delete this reservation?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/delete/${reservationId}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (data.success) {
                await fetchReservationsFromAPI();
                alert('Reservation deleted successfully');
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error deleting reservation:', error);
            alert('Failed to delete reservation');
        }
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

    // Convert 24-hour to 12-hour format
    const convertTo12Hour = (time24) => {
        if (!time24) return { time: '12:00', period: 'PM' };
        const [hours, minutes] = time24.split(':');
        let hour = parseInt(hours);
        const period = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;
        return { time: `${hour.toString().padStart(2, '0')}:${minutes}`, period };
    };

    // Convert 12-hour to 24-hour format
    const convertTo24Hour = (time12, period) => {
        if (!time12) return '00:00';
        const [hours, minutes] = time12.split(':');
        let hour = parseInt(hours);
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        return `${hour.toString().padStart(2, '0')}:${minutes}`;
    };

    // Handle Amend Stay Submit
    const handleAmendStaySubmit = () => {
        if (!selectedReservation) return;

        if (!amendArrivalDate || !amendDepartureDate) {
            alert('Please enter both arrival and departure dates');
            return;
        }

        if (!amendArrivalTime || !amendDepartureTime) {
            alert('Please enter both arrival and departure times');
            return;
        }

        if (new Date(amendDepartureDate) <= new Date(amendArrivalDate)) {
            alert('Departure date must be after arrival date');
            return;
        }

        // Convert to 24-hour format for storage
        const arrivalTime24 = convertTo24Hour(amendArrivalTime, amendArrivalPeriod);
        const departureTime24 = convertTo24Hour(amendDepartureTime, amendDeparturePeriod);

        const updatedReservation = {
            ...selectedReservation,
            checkInDate: amendArrivalDate,
            checkInTime: arrivalTime24,
            checkOutDate: amendDepartureDate,
            checkOutTime: departureTime24,
            updatedAt: new Date().toISOString()
        };

        // Recalculate nights
        const inDate = new Date(amendArrivalDate);
        const outDate = new Date(amendDepartureDate);
        const calculatedNights = Math.max(1, Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24)));

        // Recalculate billing
        const roomCharges = updatedReservation.rooms.reduce((sum, room) => sum + (room.ratePerNight * calculatedNights), 0);
        const totalDiscount = updatedReservation.rooms.reduce((sum, room) => sum + (room.discount * calculatedNights), 0);
        const subtotal = roomCharges - totalDiscount;
        const taxAmount = updatedReservation.taxExempt ? 0 : Math.round(subtotal * 0.12);
        const totalAmount = subtotal + taxAmount;
        const balanceDue = Math.max(0, totalAmount - updatedReservation.paidAmount);

        updatedReservation.nights = calculatedNights;
        updatedReservation.roomCharges = roomCharges;
        updatedReservation.totalAmount = totalAmount;
        updatedReservation.balanceDue = balanceDue;

        setReservations(reservations.map(r => r.id === selectedReservation.id ? updatedReservation : r));
        setSelectedReservation(updatedReservation);
        setShowAmendStayModal(false);
        alert(`Stay updated successfully!\nCheck-in: ${amendArrivalDate} at ${amendArrivalTime} ${amendArrivalPeriod}\nCheck-out: ${amendDepartureDate} at ${amendDepartureTime} ${amendDeparturePeriod}\nTotal nights: ${calculatedNights}`);
    };

    // Room Service View
    if (view === 'roomservice') {
        return (
            <div className="reservation-management-container">
                <button className="back-btn" onClick={() => setView('dashboard')}>
                    ← Back to Dashboard
                </button>
                <RoomService />
            </div>
        );
    }

    // Housekeeping View
    if (view === 'housekeeping') {
        return (
            <div className="reservation-management-container">
                <button className="back-btn" onClick={() => setView('dashboard')}>
                    ← Back to Dashboard
                </button>
                <HousekeepingView />
            </div>
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
                                <GuestModal 
                                    isOpen={showGuestModal} 
                                    onClose={() => setShowGuestModal(false)} 
                                    onSelectGuest={setSelectedGuest} 
                                    guests={guests}
                                    onRefreshGuests={fetchGuestsFromAPI}
                                />
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
                                        roomNumber: '',
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
                    <button className="btn btn-primary" onClick={() => setView('form')}>
                        <span style={{ marginRight: '0.5rem' }}>📅</span>
                        + New Reservation
                    </button>
                    <button className="btn btn-primary" onClick={() => setView('housekeeping')}>
                        <span style={{ marginRight: '0.5rem' }}>🧹</span>
                        Housekeeping View
                    </button>
                    <button className="btn btn-primary" onClick={() => setView('roomservice')}>
                        <span style={{ marginRight: '0.5rem' }}>🔔</span>
                        Room Service
                    </button>
                </div>
            </div>

            {/* Tabs */}
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

            {/* Reservation Cards and Details Panel */}
            <div className="reservation-content-layout">
                <div className={`reservation-cards-grid ${selectedReservation ? 'with-details' : ''}`}>
                    {filteredReservations.length > 0 ? (
                        filteredReservations.map(reservation => (
                            <ReservationCard
                                key={reservation.id}
                                reservation={reservation}
                                onUpdateStatus={handleUpdateReservationStatus}
                                onEdit={handleEditReservation}
                                onDelete={handleDeleteReservation}
                                onGenerateInvoice={handleGenerateInvoice}
                                onSelect={(res) => {
                                    setSelectedReservation(res);
                                    // setShowEditModal(true); // Disabled - modal won't open on card click
                                }}
                                isSelected={selectedReservation?.id === reservation.id}
                            />
                        ))
                    ) : (
                        <div className="no-data-message">
                            <p>No reservations found for this status</p>
                        </div>
                    )}
                </div>

                {/* Details Panel */}
                {selectedReservation && (
                    <div className="reservation-details-panel">
                        <div className="details-header">
                            <button
                                className="close-details-btn-top"
                                onClick={() => setSelectedReservation(null)}
                            >
                                ✕
                            </button>
                            <div className="details-guest-info">
                                <div className="guest-info-row">
                                    <span className="guest-icon">👤</span>
                                    <span className="guest-name-header">{selectedReservation.guestName}</span>
                                </div>
                                <div className="guest-info-row">
                                    <span className="phone-icon">📞</span>
                                    <span className="phone-number">{selectedReservation.guestPhone}</span>
                                </div>
                            </div>
                            <div className="details-header-top">
                                <div className="header-tabs">
                                    <button
                                        className="tab-option active"
                                        onClick={() => setShowEditModal(true)}
                                    >
                                        Edit Reservation
                                    </button>
                                    <div className="more-options-wrapper-stay">
                                        <MoreOptionsMenu
                                            booking={selectedReservation ? {
                                                _id: selectedReservation.id,
                                                status: selectedReservation.status === 'RESERVED' ? 'Upcoming' :
                                                    selectedReservation.status === 'IN_HOUSE' ? 'Checked-in' :
                                                        selectedReservation.status === 'CHECKED_OUT' ? 'Checked-out' : 'Upcoming',
                                                advancePaid: selectedReservation.paidAmount || 0
                                            } : {}}
                                            onActionSelect={handleMoreOptionsAction}
                                            buttonLabel="More Options"
                                        />
                                    </div>
                                    <button className="tab-option tab-print">Print</button>
                                </div>
                            </div>
                        </div>

                        <div className="details-content">
                            <table className="details-table">
                                <tbody>
                                    <tr>
                                        <td className="details-label">Reservation Number</td>
                                        <td className="details-value">{selectedReservation.id}</td>
                                    </tr>
                                    <tr>
                                        <td className="details-label">Status</td>
                                        <td className="details-value">
                                            <span className={`status-badge-small ${selectedReservation.status.toLowerCase()}`}>
                                                {selectedReservation.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="details-label">Arrival Date</td>
                                        <td className="details-value">{new Date(selectedReservation.checkInDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                                    </tr>
                                    <tr>
                                        <td className="details-label">Departure Date</td>
                                        <td className="details-value">{new Date(selectedReservation.checkOutDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                                    </tr>
                                    <tr>
                                        <td className="details-label">Booking Date</td>
                                        <td className="details-value">{new Date(selectedReservation.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                                    </tr>
                                    <tr>
                                        <td className="details-label">Reservation Type</td>
                                        <td className="details-value">{selectedReservation.reservationType}</td>
                                    </tr>
                                    <tr>
                                        <td className="details-label">Level Type</td>
                                        <td className="details-value">{selectedReservation.rooms?.[0]?.categoryId?.replace(/-/g, ' ').toUpperCase() || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td className="details-label">Room / Occupancy</td>
                                        <td className="details-value">{selectedReservation.rooms?.[0]?.adultsCount || 0} Adult(s), {selectedReservation.rooms?.[0]?.childrenCount || 0} Child(ren)</td>
                                    </tr>
                                    <tr>
                                        <td className="details-label">Total Bills</td>
                                        <td className="details-value details-value-highlight">₹{selectedReservation.totalAmount?.toLocaleString('en-IN') || '0'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Amend Stay Modal */}
            {showAmendStayModal && (
                <div className="amend-stay-modal-overlay" onClick={() => setShowAmendStayModal(false)}>
                    <div className="amend-stay-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="amend-stay-header">
                            <h3>AmmendStay</h3>
                            <button className="close-modal-btn" onClick={() => setShowAmendStayModal(false)}>✕</button>
                        </div>

                        <div className="amend-stay-content">
                            <div className="amend-date-row">
                                <label>Arrival Date</label>
                                <div className="date-time-inputs-full">
                                    <input
                                        type="date"
                                        value={amendArrivalDate}
                                        onChange={(e) => setAmendArrivalDate(e.target.value)}
                                        className="date-input"
                                    />
                                    <div className="time-with-period">
                                        <select
                                            value={amendArrivalPeriod}
                                            onChange={(e) => setAmendArrivalPeriod(e.target.value)}
                                            className="period-select-inline"
                                        >
                                            <option value="AM">AM</option>
                                            <option value="PM">PM</option>
                                        </select>
                                        <input
                                            type="time"
                                            value={amendArrivalTime}
                                            onChange={(e) => setAmendArrivalTime(e.target.value)}
                                            className="time-input-12"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="amend-date-row">
                                <label>Departure Date</label>
                                <div className="date-time-inputs-full">
                                    <input
                                        type="date"
                                        value={amendDepartureDate}
                                        onChange={(e) => setAmendDepartureDate(e.target.value)}
                                        className="date-input"
                                    />
                                    <div className="time-with-period">
                                        <select
                                            value={amendDeparturePeriod}
                                            onChange={(e) => setAmendDeparturePeriod(e.target.value)}
                                            className="period-select-inline"
                                        >
                                            <option value="AM">AM</option>
                                            <option value="PM">PM</option>
                                        </select>
                                        <input
                                            type="time"
                                            value={amendDepartureTime}
                                            onChange={(e) => setAmendDepartureTime(e.target.value)}
                                            className="time-input-12"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="next-reservation-section">
                                <h4>Next Reservation</h4>
                                <div className="next-res-field">
                                    <label>Reservation Number</label>
                                    <input type="text" className="text-input" disabled />
                                </div>
                                <div className="next-res-field">
                                    <label>Guest</label>
                                    <input type="text" className="text-input" disabled />
                                </div>
                                <div className="next-res-field">
                                    <label>Arrival</label>
                                    <input type="text" className="text-input" disabled />
                                </div>
                                <div className="next-res-field">
                                    <label>Departure</label>
                                    <input type="text" className="text-input" disabled />
                                </div>
                            </div>

                            <div className="amend-stay-actions">
                                <button
                                    className="btn-add-amend"
                                    onClick={handleAmendStaySubmit}
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Reservation Modal */}
            <EditReservationModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                reservation={selectedReservation}
            />

            {/* More Options Action Drawer */}
            <BookingActionsManager
                isOpen={actionDrawerOpen}
                onClose={() => {
                    setActionDrawerOpen(false);
                    setCurrentAction(null);
                    setActionBooking(null);
                }}
                actionType={currentAction}
                booking={actionBooking}
                onSuccess={handleActionSuccess}
            />
        </div>
    );
};

// Dummy Data Functions
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

export default ReservationStayManagement;
