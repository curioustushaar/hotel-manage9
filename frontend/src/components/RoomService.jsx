import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config/api';
import { useAuth } from '../context/AuthContext';
import './RoomService.css';

const RoomService = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Permission Check
    const hasAccess = user?.role !== 'staff' || (user?.permissions?.includes('Rooms (Room Service)'));

    if (!hasAccess) {
        return (
            <div className="rs-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚫</div>
                <h2>Access Denied</h2>
                <p>You do not have permission to access Room Service.</p>
                <button
                    className="rs-back-btn"
                    style={{ marginTop: '20px', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    onClick={() => navigate('/admin/dashboard')}
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const [rooms, setRooms] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

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
                // Get all checked-in bookings first
                const checkedInBookings = (bookingsData.data || []).filter(b =>
                    b.status === 'Checked-in' || b.status === 'CheckedIn' || b.status === 'IN_HOUSE'
                );

                // Get rooms that are either Occupied OR have a checked-in booking
                const checkedInRoomNumbers = checkedInBookings.map(b => b.roomNumber);

                const inHouseRooms = (roomsData.data || []).filter(r =>
                    r.status === 'Occupied' ||
                    r.status === 'In House' ||
                    r.status === 'IN_HOUSE' ||
                    checkedInRoomNumbers.includes(r.roomNumber)
                );

                const mappedRooms = inHouseRooms.map(room => {
                    const activeBooking = checkedInBookings.find(b =>
                        b.roomNumber === room.roomNumber
                    );
                    return {
                        ...room,
                        guestName: activeBooking?.guestName || activeBooking?.guest?.name || 'Occupied'
                    };
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
            { key: 'Delivered', label: 'READY', color: '#22c55e' }, // 4th step to match image placeholder
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
                                <div className={`rs-step-circle ${done ? 'done' : active ? 'active' : ''}`} />
                                <span className="rs-step-label">
                                    {step.label}
                                </span>
                            </div>
                            {!isLast && (
                                <div
                                    className={`rs-step-line ${done ? 'done' : ''}`}
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

                        return (
                            <div key={room._id} className="rs-card">
                                {/* Top Section: Badge, Type Title, and Plus Button */}
                                <div className="rs-card-top">
                                    <div className="rs-top-left">
                                        <div className="rs-room-badge-sq">
                                            {room.roomNumber}
                                        </div>
                                        <h4 className="rs-room-type-title">
                                            {room.roomType || room.type || 'Standard Room'}
                                        </h4>
                                    </div>
                                    <button
                                        className="rs-plus-btn-sq"
                                        onClick={() => navigate('/admin/dashboard', {
                                            state: {
                                                activeMenu: 'food-order',
                                                orderMode: 'roomservice',
                                                room: { ...room, id: room._id, source: 'room-service' },
                                                source: 'room-service'
                                            }
                                        })}
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Middle Section: Progress Tracker */}
                                <div className="rs-card-mid">
                                    {renderTracker(status)}
                                </div>

                                {/* Bottom Section: Info Grid + Bill Button */}
                                <div className="rs-card-bottom">
                                    <div className="rs-bottom-info">
                                        <div className="rs-info-item">
                                            <span className="rs-label-grey">TYPE</span>
                                            <span className="rs-val-bold">{room.roomNumber}</span>
                                        </div>
                                        <div className="rs-info-item">
                                            <span className="rs-label-grey">CATEGORY</span>
                                            <span className="rs-val-bold rs-red-text">{room.bedType || 'Double'}</span>
                                        </div>
                                    </div>

                                    {roomOrder && (
                                        <button
                                            className="rs-rect-bill-btn"
                                            onClick={() => navigate('/admin/dashboard', {
                                                state: {
                                                    activeMenu: 'cashier-section',
                                                    refresh: true,
                                                    room: { ...room, id: room._id, orderId: roomOrder._id }
                                                }
                                            })}
                                        >
                                            Bill
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="rs-empty">
                        {searchQuery ? 'No rooms found matching your search' : 'No active orders or rooms found'}
                    </div>
                )}
            </div>
        </div >
    );
};

export default RoomService;
