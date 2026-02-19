import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RoomService.css';
<<<<<<< HEAD
import FoodOrderPage from './FoodOrderPage';
import OrderManagementModal from './OrderManagementModal';
import ViewOrderModal from './ViewOrderModal';
import { orderStorage } from '../utils/orderStorage';

const RoomService = () => {
    // Sample room data
    const [rooms, setRooms] = useState([
        {
            id: 1,
            roomNumber: '101',
            guestName: 'Rajesh Kumar',
            checkIn: '2026-02-08T14:00',
            checkOut: '2026-02-10T11:00',
            rate: 3000,
            maleGuests: 2,
            femaleGuests: 1,
            status: 'running',
            services: ['wifi', 'breakfast', 'laundry']
        },
        {
            id: 2,
            roomNumber: '102',
            guestName: 'Priya Sharma',
            checkIn: '2026-02-07T15:00',
            checkOut: '2026-02-09T12:00',
            rate: 3500,
            maleGuests: 1,
            femaleGuests: 2,
            status: 'running',
            services: ['wifi', 'breakfast']
        },
        {
            id: 3,
            roomNumber: '201',
            guestName: 'Amit Patel',
            checkIn: '2026-02-09T13:00',
            checkOut: '2026-02-11T10:00',
            rate: 4000,
            maleGuests: 1,
            femaleGuests: 1,
            status: 'reservation',
            services: ['wifi', 'breakfast', 'laundry', 'spa']
        },
        {
            id: 4,
            roomNumber: '202',
            guestName: 'Sneha Reddy',
            checkIn: '2026-02-10T14:00',
            checkOut: '2026-02-12T11:00',
            rate: 2800,
            maleGuests: 0,
            femaleGuests: 2,
            status: 'reservation',
            services: ['wifi']
        },
        {
            id: 5,
            roomNumber: '301',
            guestName: 'Vikram Singh',
            checkIn: '2026-02-08T12:00',
            checkOut: '2026-02-09T10:00',
            rate: 3200,
            maleGuests: 3,
            femaleGuests: 0,
            status: 'running',
            services: ['wifi', 'breakfast', 'laundry']
        },
        {
            id: 6,
            roomNumber: '302',
            guestName: 'Ananya Gupta',
            checkIn: '2026-02-11T15:00',
            checkOut: '2026-02-13T11:00',
            rate: 3800,
            maleGuests: 1,
            femaleGuests: 1,
            status: 'reservation',
            services: ['wifi', 'spa']
        }
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [showOrderPage, setShowOrderPage] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [activeOrders, setActiveOrders] = useState({});
    const [foodOrders, setFoodOrders] = useState([]);

    // Order Management Modal State
    const [showManagementModal, setShowManagementModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // View Order Modal State
    const [showViewOrderModal, setShowViewOrderModal] = useState(false);
    const [viewOrderRoom, setViewOrderRoom] = useState(null);

    // Load active orders on mount
    useEffect(() => {
        const orders = orderStorage.getAllOrders();
        setActiveOrders(orders);

        // Load Food Orders
        const storedFood = JSON.parse(localStorage.getItem('pos_active_orders') || '[]');
        setFoodOrders(storedFood);
    }, [showOrderPage]);

    // Filter rooms based on search and active filter
    const filteredRooms = rooms.filter(room => {
        const matchesSearch =
            room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            room.guestName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter =
            activeFilter === 'all' ||
            room.status === activeFilter;
=======
import API_URL from '../config/api';
import { useAuth } from '../context/AuthContext';

const RoomService = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [rooms, setRooms] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [openMenuId, setOpenMenuId] = useState(null);

    // Fetch rooms and orders
    const fetchData = async () => {
        try {
            setLoading(true);
            const [roomsRes, allOrdersRes, bookingsRes] = await Promise.all([
                fetch(`${API_URL}/api/rooms/list`),
                fetch(`${API_URL}/api/guest-meal/orders`),
                fetch(`${API_URL}/api/bookings/list`)
            ]);

            const roomsData = await roomsRes.json();
            const allOrdersData = await allOrdersRes.json();
            const bookingsData = await bookingsRes.json();

            if (roomsData.success && bookingsData.success) {
                const inHouseRooms = roomsData.data.filter(r => r.status === 'Occupied');
                const mappedRooms = inHouseRooms.map(room => {
                    const activeBooking = bookingsData.data?.find(b =>
                        b.roomNumber === room.roomNumber && b.status === 'Checked-in'
                    );
                    return { ...room, guestName: activeBooking?.guestName || 'Occupied' };
                });
                setRooms(mappedRooms);
            }

            if (allOrdersData.success) {
                const roomOrders = allOrdersData.data.filter(o =>
                    o.orderType === 'Post to Room' || o.orderType === 'Room Order' || o.orderType === 'Room Service'
                );
                setOrders(roomOrders);
            }
        } catch (error) {
            console.error('Error fetching room service data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    // Filter logic
    const filteredRooms = rooms.filter(room => {
        const roomOrder = orders.find(o => o.roomNumber === room.roomNumber);
        const matchesSearch =
            room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (room.guestName || '').toLowerCase().includes(searchQuery.toLowerCase());

        const currentStatus = roomOrder?.status === 'Active' ? 'Pending' : (roomOrder?.status || '');

        let matchesFilter = true;
        if (activeFilter === 'pending') matchesFilter = currentStatus === 'Pending';
        else if (activeFilter === 'preparing') matchesFilter = currentStatus === 'Preparing';
        else if (activeFilter === 'inservice') matchesFilter = currentStatus === 'Started';
>>>>>>> main

        return matchesSearch && matchesFilter;
    });

<<<<<<< HEAD
    // Calculate counts for each filter
    const allCount = rooms.length;
    const runningCount = rooms.filter(room => room.status === 'running').length;
    const reservationCount = rooms.filter(room => room.status === 'reservation').length;

    // Format date and time
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const dateStr = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short'
        });
        const timeStr = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        return { date: dateStr, time: timeStr };
    };

    const navigate = useNavigate();

    // Handle add service or view order
    const handleAddService = (room) => {
        const existingOrder = foodOrders.includes(room.id);

        if (existingOrder) {
            // Open View Order Modal (NOT navigate)
            setViewOrderRoom(room);
            setShowViewOrderModal(true);
        } else {
            // Navigate to Food Order embedded in Dashboard
            navigate('/admin/dashboard', {
                state: {
                    activeMenu: 'food-order-pos',
                    room: room,
                    source: 'room-service'
                }
            });
        }
    };

    // Callback to refresh orders when modified in modal
    const handleUpdateOrder = () => {
        const orders = orderStorage.getAllOrders();
        setActiveOrders(orders);

        // Reload food orders
        const storedFood = JSON.parse(localStorage.getItem('pos_active_orders') || '[]');
        setFoodOrders(storedFood);
    };

    // If order page is open, show it - REMOVED for routing refactor
    // if (showOrderPage && selectedRoom) { ... }

    return (
        <div className="room-service-container">
            {/* Header */}
            <div className="room-service-header">
                <div className="header-title">
                    <h2>🔔 Room Service</h2>
                    <p>Manage room services and guest requests</p>
                </div>
            </div>

            {/* Controls Section */}
            <div className="room-service-controls">
                {/* Search Bar */}
                <div className="search-box-room">
                    <input
                        type="text"
                        placeholder="Search by Room No or Guest Name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input-room"
                    />
                    <span className="search-icon-room">🔍</span>
                </div>

                {/* Filter Buttons */}
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('all')}
                    >
                        All ({allCount})
                    </button>
                    <button
                        className={`filter-btn ${activeFilter === 'running' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('running')}
                    >
                        Running ({runningCount})
                    </button>
                    <button
                        className={`filter-btn ${activeFilter === 'reservation' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('reservation')}
                    >
                        Reservation ({reservationCount})
                    </button>
                </div>
            </div>

            {/* Room List */}
            <div className="room-list-container">
                {filteredRooms.length > 0 ? (
                    filteredRooms.map(room => {
                        const checkInData = formatDateTime(room.checkIn);
                        const checkOutData = formatDateTime(room.checkOut);

                        return (
                            <div key={room.id} className="room-card-list-item">
                                {/* Left Section - Room & Guest */}
                                <div className="card-left">
                                    <div className="room-badge">
                                        <span>{room.roomNumber}</span>
                                    </div>
                                    <h4 className="guest-name-list">{room.guestName}</h4>
                                </div>

                                {/* Middle Section - Info Columns */}
                                <div className="card-middle">
                                    <div className="info-col">
                                        <label>CHECK-IN</label>
                                        <span className="info-val-date">{checkInData.date}</span>
                                        <span className="info-val-time">{checkInData.time}</span>
                                    </div>
                                    <div className="info-col">
                                        <label>CHECK-OUT</label>
                                        <span className="info-val-date">{checkOutData.date}</span>
                                        <span className="info-val-time">{checkOutData.time}</span>
                                    </div>
                                    <div className="info-col">
                                        <label>RATE</label>
                                        <span className="info-val-rate">₹{room.rate.toLocaleString()}</span>
                                    </div>
                                    <div className="info-col">
                                        <label>GUESTS</label>
                                        <div className="guest-display">
                                            {room.maleGuests > 0 && <span title="Male">👨 × {room.maleGuests}</span>}
                                            {room.femaleGuests > 0 && <span title="Female">👩 × {room.femaleGuests}</span>}
=======
    // Status helpers
    const getStatusLabel = (status) => {
        if (!status) return 'No Order';
        if (status === 'Active') return 'Pending';
        if (status === 'Started') return 'In Service';
        return status;
    };

    const getStatusColor = (status) => {
        if (status === 'Started') return '#8b5cf6';
        if (status === 'Ready') return '#22c55e';
        if (status === 'Preparing') return '#3b82f6';
        if (status === 'Pending' || status === 'Active') return '#f59e0b';
        return '#64748b';
    };

    const getBorderColor = (status) => {
        if (status === 'Started') return '#8b5cf6';
        if (status === 'Ready') return '#22c55e';
        if (status === 'Preparing') return '#3b82f6';
        if (status === 'Pending' || status === 'Active') return '#f59e0b';
        return '#e5e7eb';
    };

    // Progress tracker
    const renderTracker = (rawStatus) => {
        const steps = [
            { key: 'Pending', label: 'PENDING', color: '#f59e0b' },
            { key: 'Preparing', label: 'PREPARING', color: '#3b82f6' },
            { key: 'Ready', label: 'READY', color: '#22c55e' },
        ];

        const statusOrder = { 'Active': 0, 'Pending': 0, 'Preparing': 1, 'Ready': 2, 'Started': 3 };
        const currentIdx = statusOrder[rawStatus] ?? 0;

        return (
            <div className="rs-tracker">
                {steps.map((step, idx) => {
                    const done = idx < currentIdx || rawStatus === 'Started';
                    const active = idx === currentIdx && rawStatus !== 'Started';
                    const isLast = idx === steps.length - 1;

                    return (
                        <div key={step.key} className="rs-tracker-step-wrap">
                            <div className="rs-tracker-step">
                                <div
                                    className={`rs-step-circle ${done ? 'done' : active ? 'active' : ''}`}
                                    style={{
                                        background: done ? '#22c55e' : active ? step.color : '#e5e7eb',
                                        borderColor: done ? '#22c55e' : active ? step.color : '#e5e7eb',
                                    }}
                                >
                                    {done ? '✓' : active ? '●' : ''}
                                </div>
                                <span
                                    className="rs-step-label"
                                    style={{ color: done ? '#22c55e' : active ? step.color : '#9ca3af' }}
                                >
                                    {step.label}
                                </span>
                            </div>
                            {!isLast && (
                                <div
                                    className="rs-step-line"
                                    style={{ background: done ? '#22c55e' : '#e5e7eb' }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="rs-container">
            {/* Header */}
            <div className="rs-header">
                <div className="rs-header-left">
                    <button className="rs-back-btn" onClick={() => navigate(-1)}>←</button>
                    <div>
                        <h2 className="rs-title">Room Service</h2>
                        <p className="rs-subtitle">Live status of all room orders and service requests</p>
                    </div>
                </div>
                <button
                    className="rs-add-btn"
                    onClick={() => navigate('/admin/dashboard', { state: { activeMenu: 'food-order-pos' } })}
                >
                    + Add Order
                </button>
            </div>

            {/* Controls */}
            <div className="rs-controls">
                <input
                    type="text"
                    placeholder="Search Room or Guest..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rs-search"
                />
                <div className="rs-filters">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'pending', label: 'Pending' },
                        { key: 'preparing', label: 'Preparing' },
                        { key: 'inservice', label: 'In Service' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            className={`rs-filter-btn ${activeFilter === key ? 'active' : ''}`}
                            onClick={() => setActiveFilter(key)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Room Cards */}
            <div className="rs-list">
                {loading ? (
                    <div className="rs-empty">Loading room data...</div>
                ) : filteredRooms.length > 0 ? (
                    filteredRooms.map(room => {
                        const roomOrder = orders.find(o => o.roomNumber === room.roomNumber);
                        const status = roomOrder?.status || null;
                        const borderColor = getBorderColor(status);

                        return (
                            <div
                                key={room._id}
                                className="rs-card"
                                style={{ borderLeft: `4px solid ${borderColor}` }}
                            >
                                {/* Row 1: Badge + Guest Info + Tracker + Menu */}
                                <div className="rs-card-main">
                                    {/* Left: Room badge + guest */}
                                    <div className="rs-card-left">
                                        <div className="rs-room-badge">
                                            <span>{room.roomNumber}</span>
                                        </div>
                                        <div className="rs-guest-info">
                                            <h4 className="rs-guest-name">{room.guestName || 'Occupied'}</h4>
                                            {status && (
                                                <span
                                                    className="rs-status-badge"
                                                    style={{ background: getStatusColor(status) }}
                                                >
                                                    {getStatusLabel(status).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Middle: Room type label + tracker */}
                                    <div className="rs-card-center">
                                        <div className="rs-type-row">
                                            <span className="rs-type-label">TYPE</span>
                                            <span className="rs-type-val">{room.roomType || room.type || '—'}</span>
                                        </div>
                                        {roomOrder ? renderTracker(status) : (
                                            <span className="rs-no-order">No active order</span>
                                        )}
                                    </div>

                                    {/* Right: Menu button */}
                                    <div className="rs-card-right">
                                        <div className="rs-menu-wrap">
                                            <button
                                                className="rs-menu-btn"
                                                onClick={() => setOpenMenuId(openMenuId === room._id ? null : room._id)}
                                            >
                                                ⋯
                                            </button>
                                            {openMenuId === room._id && (
                                                <div className="rs-dropdown">
                                                    <button onClick={() => {
                                                        setOpenMenuId(null);
                                                        navigate('/admin/dashboard', {
                                                            state: { activeMenu: 'view-order', activeFilter: 'Room Order' }
                                                        });
                                                    }}>View Order</button>
                                                    <button onClick={() => {
                                                        setOpenMenuId(null);
                                                        navigate('/admin/dashboard', {
                                                            state: {
                                                                activeMenu: 'food-order-pos',
                                                                room: { ...room, id: room._id, source: 'room-service' },
                                                                source: 'room-service'
                                                            }
                                                        });
                                                    }}>Add Order</button>
                                                </div>
                                            )}
>>>>>>> main
                                        </div>
                                    </div>
                                </div>

<<<<<<< HEAD
                                {/* Right Section - Actions */}
                                <div className="card-right">
                                    <div className="action-icons-list">
                                        <button className="icon-btn-list blue" title="Stats">📊</button>
                                        <button className="icon-btn-list dark" title="Inspect">🔍</button>
                                        <button className="icon-btn-list blue" title="Laundry">👔</button>
                                        <button className="icon-btn-list orange" title="Profile">👤</button>
                                    </div>

                                    {foodOrders.includes(room.id) ? (
                                        <button
                                            className="btn-view-order-list"
                                            onClick={() => handleAddService(room)}
                                            title="View Order"
                                        >
                                            View Order
                                        </button>
                                    ) : (
                                        <button
                                            className="btn-add-service-list"
                                            onClick={() => handleAddService(room)}
                                            title="Add Service"
                                        >
                                            +
                                        </button>
                                    )}
                                </div>
=======
                                {/* Row 2: Info columns */}
                                <div className="rs-card-info">
                                    <div className="rs-info-col">
                                        <span className="rs-info-label">TYPE</span>
                                        <span className="rs-info-val">{room.roomNumber}</span>
                                    </div>
                                    <div className="rs-info-col">
                                        <span className="rs-info-label">CAPACITY</span>
                                        <span className="rs-info-val">{room.capacity || '—'} Pax</span>
                                    </div>
                                    <div className="rs-info-col">
                                        <span className="rs-info-label">CATEGORY</span>
                                        <span className="rs-info-val">{room.bedType || 'Double'}</span>
                                    </div>
                                    <div className="rs-info-col">
                                        <span className="rs-info-label">CATEGORY</span>
                                        <span className="rs-info-val rs-info-red">{room.bedType || 'Double'}</span>
                                    </div>
                                </div>

                                {/* Floating add button */}
                                <button
                                    className="rs-fab"
                                    onClick={() => navigate('/admin/dashboard', {
                                        state: {
                                            activeMenu: 'food-order-pos',
                                            room: { ...room, id: room._id, source: 'room-service' },
                                            source: 'room-service'
                                        }
                                    })}
                                    title="Add Order"
                                >
                                    +
                                </button>
>>>>>>> main
                            </div>
                        );
                    })
                ) : (
<<<<<<< HEAD
                    <div className="no-rooms-message">
                        {searchQuery ? 'No rooms found matching your search' : 'No rooms available'}
                    </div>
                )}
            </div>

            {/* Order Management Modal (Editable) */}
            {showManagementModal && (
                <OrderManagementModal
                    isOpen={showManagementModal}
                    onClose={() => setShowManagementModal(false)}
                    room={selectedOrder?.room}
                    currentOrder={selectedOrder}
                    onAddFood={(room) => {
                        // Switch to Food Order Page
                        setSelectedRoom(room);
                        setShowOrderPage(true);
                    }}
                    onUpdateOrder={handleUpdateOrder}
                />
            )}

            {/* View Order Modal */}
            {showViewOrderModal && (
                <ViewOrderModal
                    isOpen={showViewOrderModal}
                    onClose={() => setShowViewOrderModal(false)}
                    room={viewOrderRoom}
                    currentOrder={null}
                    onUpdateOrder={handleUpdateOrder}
                />
            )}
=======
                    <div className="rs-empty">
                        {searchQuery ? 'No rooms found matching your search' : 'No active orders or rooms found'}
                    </div>
                )}
            </div>
>>>>>>> main
        </div>
    );
};

export default RoomService;
