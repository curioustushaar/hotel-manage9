import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config/api';
import './StayOverview.css';
import './StayOverviewModals.css';

const StayOverview = () => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState('2026-02-01'); // Start from Feb 1st 2026 as per image
    const timelineRef = useRef(null);

    // Navigation handlers
    const handleNavigateToReservation = () => {
        // Navigate to reservation page with 'form' view (Create New Reservation)
        navigate('/admin/reservation-stay-management', { state: { viewMode: 'form' } });
    };

    const handleNavigateToViewReservation = () => {
        // Navigate to reservation page with 'dashboard' view (View Reservations)
        navigate('/admin/reservation-stay-management', { state: { viewMode: 'dashboard' } });
    };

    const handleNavigateToRoomService = () => {
        // Navigate to reservation page with 'roomservice' view
        navigate('/admin/reservation-stay-management', { state: { viewMode: 'roomservice' } });
    };

    // Date navigation handlers
    const handleToday = () => {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        setSelectedDate(formattedDate);
    };

    const handlePrevious = () => {
        const currentDate = new Date(selectedDate);
        currentDate.setDate(currentDate.getDate() - 1);
        const formattedDate = currentDate.toISOString().split('T')[0];
        setSelectedDate(formattedDate);
    };

    const handleNext = () => {
        const currentDate = new Date(selectedDate);
        currentDate.setDate(currentDate.getDate() + 1);
        const formattedDate = currentDate.toISOString().split('T')[0];
        setSelectedDate(formattedDate);
    };

    // Modal states for Quick Reservation flow
    const [showDateModal, setShowDateModal] = useState(false);
    const [showQuickReservationModal, setShowQuickReservationModal] = useState(false);
    const [selectedCellData, setSelectedCellData] = useState({
        date: '',
        roomNumber: '',
        roomType: '',
        price: 0
    });
    const [quickReservationData, setQuickReservationData] = useState({
        arrivalDate: '',
        arrivalTime: '01:51 PM',
        departureDate: '',
        departureTime: '01:51 PM',
        category: '',
        roomNumber: ''
    });

    // Handle clicking on an available date cell
    const handleDateCellClick = (date, room) => {
        // Only allow clicking on available (empty) cells
        const reservation = getReservationForRoomDate(room.roomNumber, date);
        if (reservation) return; // Cell is occupied, don't open modal

        const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;

        setSelectedCellData({
            date: formattedDate,
            roomNumber: room.roomNumber,
            roomType: room.roomType || 'Standard Room',
            price: room.price || 0
        });
        setShowDateModal(true);
    };

    // Handle "Quick Reservation" button click from Date Modal
    const handleQuickReservationClick = () => {
        // Pre-fill quick reservation form with selected cell data
        const dateObj = new Date(selectedCellData.date.split('-').reverse().join('-'));
        const arrivalDate = dateObj.toISOString().split('T')[0];

        // Set departure date to next day
        const departureObj = new Date(dateObj);
        departureObj.setDate(departureObj.getDate() + 1);
        const departureDate = departureObj.toISOString().split('T')[0];

        setQuickReservationData({
            arrivalDate,
            arrivalTime: '01:51 PM',
            departureDate,
            departureTime: '01:51 PM',
            category: selectedCellData.roomType,
            roomNumber: selectedCellData.roomNumber
        });

        setShowDateModal(false);
        setShowQuickReservationModal(true);
    };

    // Handle "Confirm" button click from Quick Reservation Modal
    const handleQuickReservationConfirm = () => {
        // Navigate to Create New Reservation with pre-filled data
        navigate('/admin/reservation-stay-management', {
            state: {
                viewMode: 'form',
                autoOpenGuestModal: true, // Auto-open guest creation modal
                prefilledData: {
                    checkInDate: quickReservationData.arrivalDate,
                    checkInTime: quickReservationData.arrivalTime,
                    checkOutDate: quickReservationData.departureDate,
                    checkOutTime: quickReservationData.departureTime,
                    roomType: quickReservationData.category,
                    roomNumber: quickReservationData.roomNumber
                }
            }
        });
    };

    // Handle "Cancel" button click
    const handleModalCancel = () => {
        setShowDateModal(false);
        setShowQuickReservationModal(false);
        setSelectedCellData({
            date: '',
            roomNumber: '',
            roomType: '',
            price: 0
        });
        setQuickReservationData({
            arrivalDate: '',
            arrivalTime: '01:51 PM',
            departureDate: '',
            departureTime: '01:51 PM',
            category: '',
            roomNumber: ''
        });
    };

    // Timeline Configuration
    const daysToShow = 25;
    const startDate = useMemo(() => {
        const d = new Date(selectedDate);
        return d;
    }, [selectedDate]);

    const dateRange = useMemo(() => {
        const dates = [];
        for (let i = 0; i < daysToShow; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            dates.push(d);
        }
        return dates;
    }, [startDate]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [roomsRes, bookingsRes, reservationsRes] = await Promise.all([
                fetch(`${API_URL}/api/rooms/list`),
                fetch(`${API_URL}/api/bookings/list`),
                fetch(`${API_URL}/api/reservations/list`)
            ]);

            const roomsData = await roomsRes.json();
            const bookingsData = await bookingsRes.json();
            const reservationsData = await reservationsRes.json();

            console.log('📊 Fetched Rooms:', roomsData.data?.length || 0);
            console.log('📊 Fetched Bookings:', bookingsData.data?.length || 0);
            console.log('📊 Fetched Reservations:', reservationsData.data?.length || 0);

            if (roomsData.success && roomsData.data) {
                // Mark rooms as dirty based on status or random for demo
                const updatedRooms = roomsData.data.map((r, i) => ({
                    ...r,
                    isDirty: r.status === 'Dirty' || (i % 7 === 0 && r.status === 'Available')
                }));
                setRooms(updatedRooms);

                // Log room prices for debugging
                console.log('💰 Room Prices Loaded:');
                updatedRooms.forEach(r => {
                    console.log(`  Room ${r.roomNumber} (${r.roomType}): ₹${r.price || 'NOT SET'}`);
                });
            }

            let allBookings = [];

            // Add bookings
            if (bookingsData.success && bookingsData.data) {
                const mappedBookings = bookingsData.data.map(booking => ({
                    ...booking,
                    guestName: booking.guestName,
                    roomNumber: booking.roomNumber || 'TBD',
                    numberOfNights: booking.numberOfNights ||
                        Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24)),
                    checkInDate: booking.checkInDate,
                    checkOutDate: booking.checkOutDate,
                    status: booking.status
                }));
                allBookings = [...allBookings, ...mappedBookings];
            }

            // Add reservations
            if (reservationsData.success && reservationsData.data) {
                const mappedReservations = reservationsData.data.map(res => ({
                    ...res,
                    bookingId: res.referenceId || res._id,
                    guestName: res.guestName,
                    mobileNumber: res.phone,
                    roomNumber: res.roomNumber || 'TBD',
                    numberOfNights: res.nights || 1,
                    checkInDate: res.checkInDate,
                    checkOutDate: res.checkOutDate,
                    status: res.status
                }));
                allBookings = [...allBookings, ...mappedReservations];
            }

            console.log('📊 Total Combined Bookings:', allBookings.length);
            setReservations(allBookings);
        } catch (error) {
            console.error('❌ Error fetching stay overview data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate Stats - LIVE from actual data
    const stats = useMemo(() => {
        const total = rooms.length;
        const vacant = rooms.filter(r => r.status === 'Available').length;
        const occupied = rooms.filter(r => r.status === 'Occupied').length;
        const booked = rooms.filter(r => r.status === 'Booked').length;
        const dirty = rooms.filter(r => r.isDirty).length;

        // Count reservations by status
        const reserved = reservations.filter(r =>
            r.status === 'Upcoming' || r.status === 'RESERVED'
        ).length;

        const inHouse = reservations.filter(r =>
            r.status === 'Checked-in' || r.status === 'IN_HOUSE'
        ).length;

        const today = new Date().toISOString().split('T')[0];
        const checkout = reservations.filter(r => {
            const checkOutDate = new Date(r.checkOutDate).toISOString().split('T')[0];
            return checkOutDate === today;
        }).length;

        return {
            all: total,
            vacant,
            inHouse: occupied || inHouse,
            reserved: booked || reserved,
            overdue: 0, // Calculate based on late checkouts
            checkout,
            dirty
        };
    }, [rooms, reservations]);

    // Group rooms by category - LIVE from actual room types
    const groupedRooms = useMemo(() => {
        if (rooms.length === 0) return {};

        const groups = {};
        rooms.forEach(room => {
            const cat = room.roomType || 'Standard Room';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(room);
        });

        return groups;
    }, [rooms]);

    const getReservationForRoomDate = (roomNumber, date) => {
        return reservations.find(res => {
            if (!res.roomNumber || res.roomNumber === 'TBD' || res.roomNumber === '') return false;

            const checkIn = new Date(res.checkInDate);
            const checkOut = new Date(res.checkOutDate);
            const d = new Date(date);

            d.setHours(0, 0, 0, 0);
            checkIn.setHours(0, 0, 0, 0);
            checkOut.setHours(0, 0, 0, 0);

            return res.roomNumber === roomNumber && d >= checkIn && d < checkOut;
        });
    };

    if (loading) return <div className="stay-overview-loading">Loading Stay Overview...</div>;

    return (
        <div className="stay-overview-container">
            {/* Top Navigation Bar */}
            <div className="stay-top-nav">
                <div className="date-selector-wrapper">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="date-picker-input-modern"
                    />
                </div>

                <div className="nav-buttons-group">
                    <button className="nav-btn" onClick={handleNavigateToReservation}>Reservation</button>
                    <button className="nav-btn" onClick={handleNavigateToViewReservation}>View Reservation</button>
                    <button className="nav-btn" onClick={handleNavigateToRoomService}>Room Service</button>
                    <button className="nav-gear-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                        <span style={{ marginLeft: '4px' }}>◆</span>
                    </button>
                </div>
            </div>

            {/* Status Filters Bar */}
            <div className="status-filters-bar">
                <div className="status-pill all">All <span className="count-mini">{stats.all}</span></div>
                <div className="status-pill vacant">Vacant ({stats.vacant}) <span className="count-circle">{stats.vacant}</span></div>
                <div className="status-pill in-house">In house <span className="count-circle">{stats.inHouse}</span></div>
                <div className="status-pill reserved">Reserved <span className="count-circle">{stats.reserved}</span></div>
                <div className="status-pill overdue">Over Due <span className="count-circle">{stats.overdue}</span></div>
                <div className="status-pill checkout">Checkout <span className="count-circle">{stats.checkout}</span></div>
                <div className="status-pill dirty">Dirty <span className="count-circle">{stats.dirty}</span></div>

                <div className="timeline-nav-group">
                    <button className="timeline-action-btn" onClick={handleToday}>Today</button>
                    <button className="timeline-action-btn previous" onClick={handlePrevious}>Previous</button>
                    <button className="timeline-action-btn next" onClick={handleNext}>Next</button>
                </div>
            </div>

            {/* Main Timeline Table */}
            <div className="timeline-grid-wrapper" ref={timelineRef}>
                <table className="timeline-table">
                    <thead>
                        <tr>
                            <th className="room-col-header sticky-left"></th>
                            {dateRange.map((date, idx) => (
                                <th key={idx} className="date-header_cell">
                                    <div className="date-header_content">
                                        <div className="day-name_mini">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                        <div className="day-num_large">{date.getDate()}</div>
                                        <div className="month-name_mini">{date.toLocaleDateString('en-US', { month: 'short' })}</div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(groupedRooms).map(([category, catRooms]) => (
                            <React.Fragment key={category}>
                                <tr className="category-row">
                                    <td className="sticky-left category-name_cell">
                                        <span className="warning-icon_red">⚠️</span> {category}
                                    </td>
                                    {dateRange.map((_, idx) => {
                                        // Calculate average price for this category
                                        const avgPrice = catRooms.length > 0
                                            ? Math.round(catRooms.reduce((sum, r) => sum + (r.price || 0), 0) / catRooms.length)
                                            : 0;

                                        return (
                                            <td key={idx} className="category-data_cell">
                                                <div className="info-box">
                                                    <div className="mini-num">{catRooms.length}</div>
                                                    <div className="mini-price">₹{avgPrice.toFixed(2)}</div>
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                                {catRooms.map(room => (
                                    <tr key={room.roomNumber} className="room-data-row">
                                        <td className="sticky-left room-name_cell">
                                            <div className="room-name_wrapper">
                                                <div className="room-id-container">
                                                    <span className="room-number_text">{room.roomNumber}</span>
                                                    {room.isDirty && <span className="dirty-broom-icon" title="Dirty / Needs Cleaning">🧹</span>}
                                                </div>
                                                <span className={`room-status-indicator ${room.status === 'Available' ? 'available' : 'warning'}`}>⚠️</span>
                                            </div>
                                        </td>
                                        {dateRange.map((date, idx) => {
                                            const reservation = getReservationForRoomDate(room.roomNumber, date);
                                            const checkInDate = reservation ? new Date(reservation.checkInDate) : null;
                                            const isCheckInDay = checkInDate && checkInDate.getDate() === date.getDate() && checkInDate.getMonth() === date.getMonth();

                                            return (
                                                <td
                                                    key={idx}
                                                    className={`grid-cell ${!reservation ? 'available-cell' : ''}`}
                                                    onClick={() => !reservation && handleDateCellClick(date, room)}
                                                    style={{ cursor: !reservation ? 'pointer' : 'default' }}
                                                >
                                                    {isCheckInDay && (
                                                        <div
                                                            className={`booking-strip ${reservation.status === 'Checked-in' || reservation.status === 'IN_HOUSE' ? 'active-stay' : 'reserved-stay'}`}
                                                            style={{
                                                                width: `calc(${reservation.numberOfNights * 100}% - 12px)`,
                                                                zIndex: 10
                                                            }}
                                                            title={`${reservation.guestName} (${reservation.numberOfNights} Nights)`}
                                                        >
                                                            {reservation.guestName}
                                                            {reservation.numberOfNights > 2 && <span className="night-badge">{reservation.numberOfNights}</span>}
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Date Modal (Image 1) - Shows when clicking on available cell */}
            {showDateModal && (
                <div className="modal-overlay-stay" onClick={handleModalCancel}>
                    <div className="modal-content-stay" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-stay">
                            <span>Date: {selectedCellData.date}</span>
                            <span style={{ marginLeft: '40px' }}>Room No: {selectedCellData.roomNumber}</span>
                        </div>
                        <div className="modal-actions-stay">
                            <button className="btn-quick-reservation" onClick={handleQuickReservationClick}>
                                Quick Reservation
                            </button>
                            <button className="btn-cancel-stay" onClick={handleModalCancel}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Reservation Modal (Image 2) - Shows after clicking Quick Reservation */}
            {showQuickReservationModal && (
                <div className="modal-overlay-stay" onClick={handleModalCancel}>
                    <div className="modal-content-quick" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-quick">
                            <h3>Quick Reservation</h3>
                            <button className="modal-close-btn" onClick={handleModalCancel}>×</button>
                        </div>
                        <div className="modal-body-quick">
                            <div className="form-row-quick">
                                <div className="form-group-quick">
                                    <label>Arrival Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        value={`${quickReservationData.arrivalDate}T${quickReservationData.arrivalTime.replace(' ', '').toLowerCase()}`}
                                        onChange={(e) => {
                                            const [date, time] = e.target.value.split('T');
                                            setQuickReservationData({
                                                ...quickReservationData,
                                                arrivalDate: date,
                                                arrivalTime: time
                                            });
                                        }}
                                        className="input-datetime-quick"
                                    />
                                </div>
                                <div className="form-group-quick">
                                    <label>Departure Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        value={`${quickReservationData.departureDate}T${quickReservationData.departureTime.replace(' ', '').toLowerCase()}`}
                                        onChange={(e) => {
                                            const [date, time] = e.target.value.split('T');
                                            setQuickReservationData({
                                                ...quickReservationData,
                                                departureDate: date,
                                                departureTime: time
                                            });
                                        }}
                                        className="input-datetime-quick"
                                    />
                                </div>
                            </div>
                            <div className="form-row-quick">
                                <div className="form-group-quick">
                                    <label>Category</label>
                                    <input
                                        type="text"
                                        value={quickReservationData.category}
                                        onChange={(e) => setQuickReservationData({
                                            ...quickReservationData,
                                            category: e.target.value
                                        })}
                                        className="input-text-quick"
                                        placeholder="Room Category"
                                    />
                                </div>
                                <div className="form-group-quick">
                                    <label>Room No</label>
                                    <input
                                        type="text"
                                        value={quickReservationData.roomNumber}
                                        onChange={(e) => setQuickReservationData({
                                            ...quickReservationData,
                                            roomNumber: e.target.value
                                        })}
                                        className="input-text-quick"
                                        placeholder="Room Number"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer-quick">
                            <button className="btn-confirm-quick" onClick={handleQuickReservationConfirm}>
                                Confirm
                            </button>
                            <button className="btn-cancel-quick" onClick={handleModalCancel}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Simple React Fragment fallback
import React from 'react';

export default StayOverview;
