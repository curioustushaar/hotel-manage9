import React, { useState, useEffect } from 'react';
import API_URL from '../../config/api';
import './Customers.css';

const Customers = () => {
    const [activeTab, setActiveTab] = useState('current');
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [customersData, setCustomersData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch bookings from API
    const fetchBookingsData = async () => {
        try {
            setIsLoading(true);

            // Fetch from both endpoints to get all data
            const [bookingsResponse, reservationsResponse] = await Promise.all([
                fetch(`${API_URL}/api/bookings/list`).catch(err => ({ ok: false })),
                fetch(`${API_URL}/api/reservations/list`).catch(err => ({ ok: false }))
            ]);

            let allBookings = [];

            // Process Bookings API
            if (bookingsResponse.ok) {
                try {
                    const bookingData = await bookingsResponse.json();
                    if (bookingData.success && Array.isArray(bookingData.data)) {
                        allBookings = [...allBookings, ...bookingData.data];
                    }
                } catch (e) { console.error("Error parsing bookings data", e); }
            }

            // Process Reservations API
            if (reservationsResponse.ok) {
                try {
                    const reservationData = await reservationsResponse.json();
                    if (reservationData.success && Array.isArray(reservationData.data)) {
                        allBookings = [...allBookings, ...reservationData.data];
                    }
                } catch (e) { console.error("Error parsing reservations data", e); }
            }

            // Deduplicate by ID
            const uniqueMap = new Map();
            allBookings.forEach(item => {
                const id = item._id || item.id;
                if (id) uniqueMap.set(id, item);
            });
            const uniqueBookings = Array.from(uniqueMap.values());

            // Transform booking data to customer format
            const customers = uniqueBookings.map(booking => {
                // Normalize status
                let status = 'RESERVED';
                const rawStatus = booking.status?.toUpperCase() || '';

                if (rawStatus === 'CHECKED-IN' || rawStatus === 'IN_HOUSE' || rawStatus === 'CHECKED IN') {
                    status = 'IN_HOUSE';
                } else if (rawStatus === 'CHECKED-OUT' || rawStatus === 'CHECKED OUT') {
                    status = 'CHECKED_OUT';
                } else if (rawStatus === 'RESERVED' || rawStatus === 'CONFIRMED') {
                    status = 'RESERVED';
                } else if (rawStatus === 'CANCELLED') {
                    status = 'CANCELLED';
                }

                // Get Room Number safely
                const roomNum = booking.rooms?.[0]?.roomNumber || booking.roomNumber || 'TBD';

                return {
                    id: booking._id || booking.id,
                    name: booking.guestName || 'N/A',
                    email: booking.email || booking.guestEmail || 'N/A',
                    phone: booking.mobileNumber || booking.guestPhone || 'N/A',
                    room: roomNum,
                    checkIn: booking.checkInDate,
                    checkOut: booking.checkOutDate,
                    status: status,
                    // Use normalized status for boolean flags. 
                    // Current Guest = IN_HOUSE
                    isCurrent: status === 'IN_HOUSE',
                    isPast: status === 'CHECKED_OUT'
                };
            }).filter(c => c.status === 'IN_HOUSE' || c.status === 'CHECKED_OUT'); // Only show Active or Past guests

            setCustomersData(customers);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setCustomersData([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Load customers data on mount
    useEffect(() => {
        fetchBookingsData();
    }, []);

    // Reset filters function
    const handleResetFilters = () => {
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
        setSortBy('name');
        fetchBookingsData(); // Refresh data
    };

    // Calculate stay duration
    const calculateStayDuration = (checkIn, checkOut) => {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} ${diffDays === 1 ? 'Day' : 'Days'}`;
    };

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    };

    // Filter customers based on active tab
    const filteredByTab = customersData.filter(customer =>
        activeTab === 'current' ? customer.isCurrent : !customer.isCurrent
    );

    // Apply search filter
    const filteredCustomers = filteredByTab.filter(customer => {
        // Search filter
        const matchesSearch = !searchTerm ||
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.includes(searchTerm);

        // Date range filter
        const matchesDateRange = (() => {
            if (!startDate && !endDate) return true;

            const checkInDate = new Date(customer.checkIn);
            checkInDate.setHours(0, 0, 0, 0); // Reset time for accurate comparison

            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                return checkInDate >= start && checkInDate <= end;
            } else if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                return checkInDate >= start;
            } else if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                return checkInDate <= end;
            }
            return true;
        })();

        return matchesSearch && matchesDateRange;
    });

    // Sort customers
    const sortedCustomers = [...filteredCustomers].sort((a, b) => {
        if (sortBy === 'name') {
            return a.name.localeCompare(b.name);
        } else if (sortBy === 'checkIn') {
            return new Date(b.checkIn) - new Date(a.checkIn);
        } else if (sortBy === 'checkOut') {
            return new Date(b.checkOut) - new Date(a.checkOut);
        }
        return 0;
    });

    const handleViewDetails = (customer) => {
        alert(`Customer Details:\n\nName: ${customer.name}\nEmail: ${customer.email}\nPhone: ${customer.phone}\nRoom: ${customer.room}\nCheck-in: ${customer.checkIn}\nCheck-out: ${customer.checkOut}\nStatus: ${customer.status}`);
    };

    const handleCheckOut = async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/bookings/status/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'CHECKED_OUT' }),
            });
            const data = await response.json();
            if (data.success) {
                fetchBookingsData(); // Refresh data
            }
        } catch (error) {
            console.error('Error checking out customer:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                const response = await fetch(`${API_URL}/api/bookings/delete/${id}`, {
                    method: 'DELETE',
                });
                const data = await response.json();
                if (data.success) {
                    fetchBookingsData(); // Refresh data
                }
            } catch (error) {
                console.error('Error deleting customer:', error);
            }
        }
    };

    return (
        <div className="customers-page">
            <div className="customers-header">
                <h1>👥 Customers</h1>
                <button
                    className="refresh-btn"
                    onClick={handleResetFilters}
                    title="Refresh & Reset Filters"
                >
                    🔄
                </button>
            </div>

            {/* Navigation Bar */}
            <div className="customers-navbar">
                {/* Tabs */}
                <div className="customers-tabs">
                    <button
                        className={`customers-tab ${activeTab === 'current' ? 'active' : ''}`}
                        onClick={() => setActiveTab('current')}
                    >
                        Current Guests
                    </button>
                    <button
                        className={`customers-tab ${activeTab === 'past' ? 'active' : ''}`}
                        onClick={() => setActiveTab('past')}
                    >
                        Past Guests
                    </button>
                </div>

                {/* Filters */}
                <div className="customers-filters">
                    <div className="search-filter">
                        <input
                            type="text"
                            placeholder="Search by name, phone or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="customers-search-input"
                        />
                    </div>

                    <div className="date-filter">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="date-input"
                            id="start-date-input"
                        />
                        <label htmlFor="start-date-input" className="calendar-icon">📅</label>
                    </div>

                    <div className="date-filter">
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="date-input"
                            id="end-date-input"
                        />
                        <label htmlFor="end-date-input" className="calendar-icon">📅</label>
                    </div>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
                        <option value="name">Sort by Name</option>
                        <option value="checkIn">Sort by Check-in</option>
                        <option value="checkOut">Sort by Check-out</option>
                    </select>

                    <button className="result-count" onClick={handleResetFilters} title="Refresh">
                        {sortedCustomers.length}
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="loading-state">
                    <div className="loader"></div>
                    <p>Loading customers data...</p>
                </div>
            )}

            {/* No Customers Found Message */}
            {!isLoading && sortedCustomers.length === 0 && (
                <div className="no-customers-alert">
                    <span className="alert-icon">✕</span>
                    <span className="alert-text">No customers found.</span>
                </div>
            )}

            {/* Customers Table */}
            {!isLoading && sortedCustomers.length > 0 && (
                <div className="customers-table-container">
                    <table className="customers-table">
                        <thead>
                            <tr>
                                <th>GUEST DETAILS</th>
                                <th>ROOM</th>
                                <th>STAY DURATION</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedCustomers.map((customer) => (
                                <tr key={customer.id}>
                                    <td>
                                        <div className="guest-details">
                                            <span className="guest-name">{customer.name}</span>
                                            <span className="guest-email">{customer.email}</span>
                                            <span className="guest-phone">{customer.phone}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="room-number">Room {customer.room}</span>
                                    </td>
                                    <td>
                                        <div className="stay-duration">
                                            <span className="duration-text">
                                                {calculateStayDuration(customer.checkIn, customer.checkOut)}
                                            </span>
                                            <span className="duration-dates">
                                                {formatDate(customer.checkIn)} - {formatDate(customer.checkOut)}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${customer.status === 'IN_HOUSE' ? 'checked-in' : 'checked-out'}`}>
                                            {customer.status === 'IN_HOUSE' ? 'CHECKED IN' : 'CHECKED OUT'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="customer-actions">
                                            <button
                                                className="action-btn view-btn"
                                                onClick={() => handleViewDetails(customer)}
                                                title="View Details"
                                            >
                                                👁️
                                            </button>
                                            {customer.isCurrent && (
                                                <button
                                                    className="action-btn checkout-btn"
                                                    onClick={() => handleCheckOut(customer.id)}
                                                    title="Check Out"
                                                >
                                                    ✓
                                                </button>
                                            )}
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() => handleDelete(customer.id)}
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Customers;
