import React, { useState, useEffect } from 'react';
import './Customers.css';

const Customers = () => {
    const [activeTab, setActiveTab] = useState('current');
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [customersData, setCustomersData] = useState([]);

    // Load customers from localStorage
    useEffect(() => {
        const storedCustomers = localStorage.getItem('customers');
        if (storedCustomers) {
            setCustomersData(JSON.parse(storedCustomers));
        } else {
            // Sample data
            const sampleCustomers = [
                {
                    id: 1,
                    name: 'Rajesh Kumar',
                    email: 'rajesh@email.com',
                    phone: '9876543210',
                    room: '101',
                    checkIn: '2026-02-01',
                    checkOut: '2026-02-05',
                    status: 'Checked In',
                    isCurrent: true
                },
                {
                    id: 2,
                    name: 'Priya Sharma',
                    email: 'priya.sharma@email.com',
                    phone: '9988776655',
                    room: '205',
                    checkIn: '2026-01-28',
                    checkOut: '2026-02-02',
                    status: 'Checked Out',
                    isCurrent: false
                },
                {
                    id: 3,
                    name: 'Amit Patel',
                    email: 'amit.p@email.com',
                    phone: '9123456789',
                    room: '303',
                    checkIn: '2026-02-03',
                    checkOut: '2026-02-08',
                    status: 'Checked In',
                    isCurrent: true
                }
            ];
            setCustomersData(sampleCustomers);
            localStorage.setItem('customers', JSON.stringify(sampleCustomers));
        }
    }, []);

    const saveToLocalStorage = (data) => {
        localStorage.setItem('customers', JSON.stringify(data));
    };

    // Calculate stay duration
    const calculateStayDuration = (checkIn, checkOut) => {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} ${diffDays === 1 ? 'Day' : 'Days'}`;
    };

    // Filter customers based on active tab
    const filteredByTab = customersData.filter(customer => 
        activeTab === 'current' ? customer.isCurrent : !customer.isCurrent
    );

    // Apply search filter
    const filteredCustomers = filteredByTab.filter(customer => {
        const matchesSearch = 
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.includes(searchTerm);

        const matchesDateRange = (() => {
            if (!startDate && !endDate) return true;
            const checkInDate = new Date(customer.checkIn);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            if (start && end) {
                return checkInDate >= start && checkInDate <= end;
            } else if (start) {
                return checkInDate >= start;
            } else if (end) {
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
        } else if (sortBy === 'date') {
            return new Date(b.checkIn) - new Date(a.checkIn);
        }
        return 0;
    });

    const handleViewDetails = (customer) => {
        alert(`Customer Details:\n\nName: ${customer.name}\nEmail: ${customer.email}\nPhone: ${customer.phone}\nRoom: ${customer.room}\nCheck-in: ${customer.checkIn}\nCheck-out: ${customer.checkOut}\nStatus: ${customer.status}`);
    };

    const handleCheckOut = (id) => {
        const updatedCustomers = customersData.map(customer =>
            customer.id === id ? { ...customer, isCurrent: false, status: 'Checked Out' } : customer
        );
        setCustomersData(updatedCustomers);
        saveToLocalStorage(updatedCustomers);
    };

    const handleDelete = (id) => {
        const updatedCustomers = customersData.filter(customer => customer.id !== id);
        setCustomersData(updatedCustomers);
        saveToLocalStorage(updatedCustomers);
    };

    return (
        <div className="customers-page">
            <div className="customers-header">
                <h1>👥 Customers</h1>
            </div>

            {/* Tabs */}
            <div className="customers-tabs">
                <button
                    className={`customers-tab ${activeTab === 'current' ? 'active' : ''}`}
                    onClick={() => setActiveTab('current')}
                >
                    <div className="tab-content">
                        <span className="tab-title">Current Guests</span>
                        <span className="tab-subtitle">Currently checked-in guests</span>
                    </div>
                </button>
                <button
                    className={`customers-tab ${activeTab === 'past' ? 'active' : ''}`}
                    onClick={() => setActiveTab('past')}
                >
                    <div className="tab-content">
                        <span className="tab-title">Past Guests</span>
                        <span className="tab-subtitle">Previously checked-out guests</span>
                    </div>
                </button>
            </div>

            {/* Filters Section */}
            <div className="customers-filters">
                <div className="search-filter">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by name, phone or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="customers-search-input"
                    />
                </div>

                <div className="date-filters">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="date-input"
                    />
                    <span className="date-separator">to</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="date-input"
                    />
                </div>

                <div className="sort-filter">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
                        <option value="name">Sort by Name</option>
                        <option value="date">Sort by Date</option>
                    </select>
                </div>

                <div className="result-count">
                    {sortedCustomers.length}
                </div>
            </div>

            {/* No Customers Found Message */}
            {sortedCustomers.length === 0 && (
                <div className="no-customers-alert">
                    <span className="alert-icon">✕</span>
                    <span className="alert-text">No customers found.</span>
                </div>
            )}

            {/* Customers Table */}
            {sortedCustomers.length > 0 && (
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
                                                {new Date(customer.checkIn).toLocaleDateString()} - {new Date(customer.checkOut).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${customer.status === 'Checked In' ? 'checked-in' : 'checked-out'}`}>
                                            {customer.status}
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
