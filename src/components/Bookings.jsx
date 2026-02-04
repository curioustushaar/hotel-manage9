import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BookingRow from './BookingRow';
import './Bookings.css';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [showAddBookingModal, setShowAddBookingModal] = useState(false);
    const [showEditBookingModal, setShowEditBookingModal] = useState(false);
    const [currentBooking, setCurrentBooking] = useState(null);
    const [bookingErrorMessage, setBookingErrorMessage] = useState('');
    const [bookingFormData, setBookingFormData] = useState({
        bookingId: '',
        guestName: '',
        roomNumber: '',
        roomType: '',
        checkInDate: '',
        checkOutDate: '',
        status: 'Upcoming'
    });

    const statusOptions = ['All', 'Upcoming', 'Checked-in', 'Checked-out', 'Cancelled'];

    // Load bookings from localStorage
    useEffect(() => {
        const storedBookings = localStorage.getItem('hotelBookings');
        if (storedBookings) {
            setBookings(JSON.parse(storedBookings));
        } else {
            // Initialize with sample data - EXACT STRUCTURE
            const sampleBookings = [
                {
                    id: 1,
                    bookingId: 'BKG001',
                    guestName: 'John Smith',
                    roomNumber: '101',
                    roomType: 'Deluxe King',
                    checkInDate: '2026-02-10',
                    status: 'Upcoming'
                },
                {
                    id: 2,
                    bookingId: 'BKG002',
                    guestName: 'Jane Doe',
                    roomNumber: '102',
                    roomType: 'Standard Single',
                    checkInDate: '2026-02-05',
                    status: 'Checked-in'
                },
                {
                    id: 3,
                    bookingId: 'BKG003',
                    guestName: 'Robert Williams',
                    roomNumber: '205',
                    roomType: 'Standard Double',
                    checkInDate: '2026-02-08',
                    status: 'Checked-out'
                },
                {
                    id: 4,
                    bookingId: 'BKG004',
                    guestName: 'Emily Davis',
                    roomNumber: '103',
                    roomType: 'Deluxe King',
                    checkInDate: '2026-02-08',
                    status: 'Checked-out'
                },
                {
                    id: 5,
                    bookingId: 'BKG005',
                    guestName: 'Robert Johnson',
                    roomNumber: '310',
                    roomType: 'Executive Suite',
                    checkInDate: '2026-02-01',
                    status: 'Checked-out'
                },
                {
                    id: 6,
                    bookingId: 'BKG006',
                    guestName: 'Michael Brown',
                    roomNumber: '401',
                    roomType: 'Family Room',
                    checkInDate: '2026-02-22',
                    status: 'Cancelled'
                }
            ];
            setBookings(sampleBookings);
            localStorage.setItem('hotelBookings', JSON.stringify(sampleBookings));
        }
    }, []);

    // Filter bookings based on search and status
    useEffect(() => {
        let filtered = [...bookings];

        if (searchQuery) {
            filtered = filtered.filter(booking =>
                booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                booking.bookingId.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedStatus !== 'All') {
            filtered = filtered.filter(booking => booking.status === selectedStatus);
        }

        setFilteredBookings(filtered);
    }, [searchQuery, selectedStatus, bookings]);

    const handleAddBooking = () => {
        setBookingFormData({
            bookingId: '',
            guestName: '',
            roomNumber: '',
            roomType: '',
            checkInDate: '',
            checkOutDate: '',
            status: 'Upcoming'
        });
        setBookingErrorMessage('');
        setShowAddBookingModal(true);
    };

    const handleEditBooking = (booking) => {
        setCurrentBooking(booking);
        setBookingFormData({
            bookingId: booking.bookingId,
            guestName: booking.guestName,
            roomNumber: booking.roomNumber,
            roomType: booking.roomType,
            checkInDate: booking.checkInDate,
            checkOutDate: booking.checkOutDate || '',
            status: booking.status
        });
        setBookingErrorMessage('');
        setShowEditBookingModal(true);
    };

    const handleDeleteBooking = (id) => {
        if (confirm('Are you sure you want to delete this booking?')) {
            const updatedBookings = bookings.filter(booking => booking.id !== id);
            setBookings(updatedBookings);
            localStorage.setItem('hotelBookings', JSON.stringify(updatedBookings));
        }
    };

    const handleBookingSubmit = (e) => {
        e.preventDefault();

        if (!bookingFormData.bookingId || !bookingFormData.guestName || !bookingFormData.roomNumber || !bookingFormData.checkInDate) {
            setBookingErrorMessage('All fields are required');
            return;
        }

        if (showAddBookingModal) {
            const newBooking = {
                id: Date.now(),
                bookingId: bookingFormData.bookingId,
                guestName: bookingFormData.guestName,
                roomNumber: bookingFormData.roomNumber,
                roomType: bookingFormData.roomType,
                checkInDate: bookingFormData.checkInDate,
                checkOutDate: bookingFormData.checkOutDate,
                status: bookingFormData.status
            };
            const updatedBookings = [...bookings, newBooking];
            setBookings(updatedBookings);
            localStorage.setItem('hotelBookings', JSON.stringify(updatedBookings));
            setShowAddBookingModal(false);
        } else if (showEditBookingModal) {
            const updatedBookings = bookings.map(booking =>
                booking.id === currentBooking.id
                    ? {
                        ...booking,
                        bookingId: bookingFormData.bookingId,
                        guestName: bookingFormData.guestName,
                        roomNumber: bookingFormData.roomNumber,
                        roomType: bookingFormData.roomType,
                        checkInDate: bookingFormData.checkInDate,
                        checkOutDate: bookingFormData.checkOutDate,
                        status: bookingFormData.status
                    }
                    : booking
            );
            setBookings(updatedBookings);
            localStorage.setItem('hotelBookings', JSON.stringify(updatedBookings));
            setShowEditBookingModal(false);
        }

        setBookingFormData({
            bookingId: '',
            guestName: '',
            roomNumber: '',
            roomType: '',
            checkInDate: '',
            checkOutDate: '',
            status: 'Upcoming'
        });
        setCurrentBooking(null);
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Upcoming':
                return 'status-upcoming';
            case 'Checked-in':
                return 'status-checkedin';
            case 'Checked-out':
                return 'status-checkedout';
            case 'Cancelled':
                return 'status-cancelled';
            default:
                return '';
        }
    };

    return (
        <div className="bookings-section">
            {/* Bookings Header */}
            <div className="section-header">
                <div className="header-title">
                    <h2>📅 Bookings</h2>
                    <p>Manage all hotel reservations</p>
                </div>
                <button className="add-booking-btn" onClick={handleAddBooking}>
                    + Add Booking
                </button>
            </div>

            {/* Search and Filters */}
            <div className="bookings-controls">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Guest name / Mobile number"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <input
                        type="date"
                        className="filter-input date-input"
                        placeholder="Check-in date"
                    />
                </div>

                <div className="filter-group">
                    <select
                        className="filter-input status-filter"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        {statusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bookings-table-wrapper">
                <table className="bookings-table">
                    <thead>
                        <tr>
                            <th className="text-left">Booking ID</th>
                            <th className="text-left">Guest Name</th>
                            <th className="text-center">Room No</th>
                            <th className="text-left">Room Type</th>
                            <th className="text-center">Check-in Date</th>
                            <th className="text-center">Status</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.length > 0 ? (
                            filteredBookings.map((booking) => (
                                <BookingRow
                                    key={booking.id}
                                    booking={booking}
                                    onEdit={handleEditBooking}
                                    onDelete={handleDeleteBooking}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="no-data">
                                    No bookings found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Booking Modal */}
            {showAddBookingModal && (
                <div className="modal-overlay" onClick={() => setShowAddBookingModal(false)}>
                    <motion.div
                        className="modal-content booking-modal"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="modal-header">
                            <h2>Add New Booking</h2>
                            <button className="modal-close" onClick={() => setShowAddBookingModal(false)}>
                                ✕
                            </button>
                        </div>

                        {bookingErrorMessage && (
                            <div className="error-alert">
                                ⚠️ {bookingErrorMessage}
                            </div>
                        )}

                        <form onSubmit={handleBookingSubmit}>
                            <div className="form-group">
                                <label>BOOKING ID *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., BKG001"
                                    value={bookingFormData.bookingId}
                                    onChange={(e) => setBookingFormData({ ...bookingFormData, bookingId: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>GUEST NAME *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter guest name"
                                    value={bookingFormData.guestName}
                                    onChange={(e) => setBookingFormData({ ...bookingFormData, guestName: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>ROOM NUMBER *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., 101"
                                    value={bookingFormData.roomNumber}
                                    onChange={(e) => setBookingFormData({ ...bookingFormData, roomNumber: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>ROOM TYPE</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., Deluxe King"
                                    value={bookingFormData.roomType}
                                    onChange={(e) => setBookingFormData({ ...bookingFormData, roomType: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>CHECK-IN DATE *</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={bookingFormData.checkInDate}
                                    onChange={(e) => setBookingFormData({ ...bookingFormData, checkInDate: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>CHECK-OUT DATE</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={bookingFormData.checkOutDate}
                                    onChange={(e) => setBookingFormData({ ...bookingFormData, checkOutDate: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>STATUS</label>
                                <select
                                    className="form-input"
                                    value={bookingFormData.status}
                                    onChange={(e) => setBookingFormData({ ...bookingFormData, status: e.target.value })}
                                >
                                    <option value="Upcoming">Upcoming</option>
                                    <option value="Checked-in">Checked-in</option>
                                    <option value="Checked-out">Checked-out</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowAddBookingModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit">
                                    Add Booking
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Edit Booking Modal */}
            {showEditBookingModal && (
                <div className="modal-overlay" onClick={() => setShowEditBookingModal(false)}>
                    <motion.div
                        className="modal-content booking-modal"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="modal-header">
                            <h2>Edit Booking</h2>
                            <button className="modal-close" onClick={() => setShowEditBookingModal(false)}>
                                ✕
                            </button>
                        </div>

                        {bookingErrorMessage && (
                            <div className="error-alert">
                                ⚠️ {bookingErrorMessage}
                            </div>
                        )}

                        <form onSubmit={handleBookingSubmit}>
                            <div className="form-group">
                                <label>BOOKING ID *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., BKG001"
                                    value={bookingFormData.bookingId}
                                    onChange={(e) => setBookingFormData({ ...bookingFormData, bookingId: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>GUEST NAME *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter guest name"
                                    value={bookingFormData.guestName}
                                    onChange={(e) => setBookingFormData({ ...bookingFormData, guestName: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>ROOM NUMBER *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., 101"
                                    value={bookingFormData.roomNumber}
                                    onChange={(e) => setBookingFormData({ ...bookingFormData, roomNumber: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>ROOM TYPE</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., Deluxe King"
                                    value={bookingFormData.roomType}
                                    onChange={(e) => setBookingFormData({ ...bookingFormData, roomType: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>CHECK-IN DATE *</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={bookingFormData.checkInDate}
                                    onChange={(e) => setBookingFormData({ ...bookingFormData, checkInDate: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>CHECK-OUT DATE</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={bookingFormData.checkOutDate}
                                    onChange={(e) => setBookingFormData({ ...bookingFormData, checkOutDate: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>STATUS</label>
                                <select
                                    className="form-input"
                                    value={bookingFormData.status}
                                    onChange={(e) => setBookingFormData({ ...bookingFormData, status: e.target.value })}
                                >
                                    <option value="Upcoming">Upcoming</option>
                                    <option value="Checked-in">Checked-in</option>
                                    <option value="Checked-out">Checked-out</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowEditBookingModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit">
                                    Update Booking
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Bookings;
