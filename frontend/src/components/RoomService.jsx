import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Plus, ArrowLeft, Utensils, CheckCircle } from 'lucide-react';
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
            <div className="rs-container-error">
                <div className="rs-error-icon">🚫</div>
                <h2>Access Denied</h2>
                <p>You do not have permission to access Room Service.</p>
                <button className="rs-error-btn" onClick={() => navigate('/admin/dashboard')}>
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
                const checkedInBookings = (bookingsData.data || []).filter(b =>
                    ['Checked-in', 'CheckedIn', 'IN_HOUSE'].includes(b.status)
                );
                const checkedInRoomNumbers = checkedInBookings.map(b => b.roomNumber);

                const inHouseRooms = (roomsData.data || []).filter(r =>
                    ['Occupied', 'In House', 'IN_HOUSE'].includes(r.status) ||
                    checkedInRoomNumbers.includes(r.roomNumber)
                );

                const mappedRooms = inHouseRooms.map(room => {
                    const activeBooking = checkedInBookings.find(b => b.roomNumber === room.roomNumber);
                    return {
                        ...room,
                        guestName: activeBooking?.guestName || activeBooking?.guest?.name || 'Occupied Room'
                    };
                });
                setRooms(mappedRooms);
            }

            if (allOrdersData.success) {
                const roomOrders = allOrdersData.data.filter(o =>
                    ['Post to Room', 'Room Order', 'Room Service'].includes(o.orderType) &&
                    o.status !== 'Completed' && o.status !== 'Settled'
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
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, []);

    const filteredRooms = rooms.filter(room => {
        const roomOrder = orders.find(o => o.roomNumber === room.roomNumber);
        const matchesSearch =
            room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (room.guestName || '').toLowerCase().includes(searchQuery.toLowerCase());

        const status = roomOrder?.status || '';
        let matchesFilter = true;
        if (activeFilter === 'pending') matchesFilter = (status === 'Pending' || status === 'Active');
        else if (activeFilter === 'preparing') matchesFilter = status === 'Preparing';
        else if (activeFilter === 'inservice') matchesFilter = status === 'Started';

        return matchesSearch && matchesFilter;
    });

    const formatCurrentDate = () => {
        const now = new Date();
        const options = { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false };
        return now.toLocaleString('en-US', options).replace(',', ' •').toUpperCase();
    };

    const getTimeDifference = (updatedAt) => {
        if (!updatedAt) return '';
        const diff = Math.floor((new Date() - new Date(updatedAt)) / (1000 * 60));
        return `${diff} mins ago`;
    };

    const renderStatusBar = (status) => {
        const stages = ['PENDING', 'PREPARING', 'READY', 'SERVICE'];
        const statusMap = { 'Active': 0, 'Pending': 0, 'Preparing': 1, 'Ready': 2, 'Started': 3 };
        const currentIdx = statusMap[status] ?? -1;

        return (
            <div className="rs-status-tracking-container">
                <div className="rs-tracking-header">
                    <span className="rs-tracking-label-main">STATUS TRACKING</span>
                    {currentIdx >= 2 && <span className="rs-final-stage-badge">FINAL STAGE</span>}
                </div>
                <div className="rs-progress-bar-wrap">
                    {stages.map((stage, idx) => (
                        <div key={stage} className="rs-progress-segment-wrap">
                            <div className={`rs-progress-segment ${idx <= currentIdx ? 'active' : ''}`} />
                            <span className={`rs-progress-label ${idx <= currentIdx ? 'active' : ''}`}>
                                {stage}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="rs-management-wrapper">
            {/* Top Bar Header */}
            <header className="rs-top-header">
                <div className="rs-header-main-left">
                    <button className="rs-back-circle-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </button>
                    <div className="rs-title-section">
                        <h1 className="rs-main-title">Room Service Management</h1>
                        <p className="rs-active-ops">ACTIVE OPERATIONS • {formatCurrentDate()}</p>
                    </div>
                </div>
                <div className="rs-header-main-right">
                    <div className="rs-orders-count-badge">
                        <Utensils size={16} />
                        <span>{orders.length} Active Orders</span>
                    </div>
                    <button className="rs-bell-btn">
                        <Bell size={20} />
                    </button>
                </div>
            </header>

            {/* Controls Bar */}
            <div className="rs-controls-bar">
                <div className="rs-search-container">
                    <Search className="rs-search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search rooms, guests or items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="rs-search-field"
                    />
                </div>
                <div className="rs-filter-pills">
                    {[
                        { key: 'all', label: 'All Orders' },
                        { key: 'pending', label: 'Pending' },
                        { key: 'preparing', label: 'Preparing' },
                        { key: 'inservice', label: 'In Service' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            className={`rs-pill-btn ${activeFilter === key ? 'active' : ''}`}
                            onClick={() => setActiveFilter(key)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Room Cards Grid */}
            <main className="rs-cards-grid">
                {loading ? (
                    <div className="rs-status-msg">Loading current operations...</div>
                ) : filteredRooms.length > 0 ? (
                    filteredRooms.map(room => {
                        const roomOrder = orders.find(o => o.roomNumber === room.roomNumber);
                        const status = roomOrder?.status || '';

                        return (
                            <div key={room._id} className="rs-operation-card">
                                <div className="rs-card-header">
                                    <div className="rs-room-basic-info">
                                        <div className="rs-room-num-box">
                                            {room.roomNumber}
                                        </div>
                                        <div className="rs-room-meta">
                                            <h3 className="rs-room-type-name">{room.roomType || 'Standard Room'}</h3>
                                            <button
                                                className="rs-add-order-plus"
                                                onClick={() => navigate('/admin/dashboard', {
                                                    state: {
                                                        activeMenu: 'food-order',
                                                        orderMode: 'roomservice',
                                                        room: { ...room, id: room._id, source: 'room-service' },
                                                        source: 'room-service'
                                                    }
                                                })}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="rs-order-status-tag">
                                        {status === 'Started' ? 'STARTED' : status.toUpperCase()}
                                    </div>
                                </div>

                                <div className="rs-card-body">
                                    <div className="rs-guest-display">
                                        <span className="rs-label-small">GUEST:</span>
                                        <span className="rs-guest-name-val">{room.guestName.toUpperCase()}</span>
                                    </div>

                                    {renderStatusBar(status)}

                                    <div className="rs-order-details-summary">
                                        <div className="rs-detail-column">
                                            <span className="rs-label-small">TYPE</span>
                                            <span className="rs-detail-val">{roomOrder?.items?.[0]?.name || 'N/A'}</span>
                                        </div>
                                        <div className="rs-detail-column">
                                            <span className="rs-label-small">CATEGORY</span>
                                            <div className="rs-category-tag">
                                                <CheckCircle size={14} />
                                                <span>{roomOrder?.orderType || 'Post to Room'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rs-card-footer">
                                    <span className="rs-time-lapsed">
                                        🕒 {roomOrder ? getTimeDifference(roomOrder.updatedAt) : 'No recent updates'}
                                    </span>
                                    <button
                                        className="rs-bill-details-btn"
                                        onClick={() => navigate('/admin/dashboard', {
                                            state: {
                                                activeMenu: 'cashier-section',
                                                refresh: true,
                                                room: { ...room, id: room._id, orderId: roomOrder?._id }
                                            }
                                        })}
                                    >
                                        Bill Details
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="rs-status-msg">No matching operations found</div>
                )}
            </main>

            <footer className="rs-page-footer">
                Viewing {rooms.length} occupied rooms
            </footer>
        </div>
    );
};

export default RoomService;
