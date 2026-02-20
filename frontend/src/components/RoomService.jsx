import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config/api';
import { useAuth } from '../context/AuthContext';
import './RoomService.css';

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

        return matchesSearch && matchesFilter;
    });

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
                    onClick={() => navigate('/admin/dashboard', { state: { activeMenu: 'food-order-pos', orderMode: 'roomservice', source: 'room-service' } })}
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
                                                                orderMode: 'roomservice',
                                                                room: { ...room, id: room._id, source: 'room-service' },
                                                                source: 'room-service'
                                                            }
                                                        });
                                                    }}>Add Order</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

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
                                            orderMode: 'roomservice',
                                            room: { ...room, id: room._id, source: 'room-service' },
                                            source: 'room-service'
                                        }
                                    })}
                                    title="Add Order"
                                >
                                    +
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <div className="rs-empty">
                        {searchQuery ? 'No rooms found matching your search' : 'No active orders or rooms found'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomService;
