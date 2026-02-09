import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RoomService.css';
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

        return matchesSearch && matchesFilter;
    });

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
                            <div key={room.id} className="room-card">
                                {/* Left Section - Room & Guest Info */}
                                <div className="room-info-section">
                                    <div className="room-number">{room.roomNumber}</div>
                                    <div className="guest-name">{room.guestName}</div>
                                </div>

                                {/* Middle Section - Details */}
                                <div className="room-details-section">
                                    {/* Check-in */}
                                    <div className="detail-item">
                                        <div className="detail-label">Check-in</div>
                                        <div className="detail-value">
                                            <span className="detail-date">{checkInData.date}</span>
                                            <span className="detail-time">{checkInData.time}</span>
                                        </div>
                                    </div>

                                    {/* Check-out */}
                                    <div className="detail-item">
                                        <div className="detail-label">Check-out</div>
                                        <div className="detail-value">
                                            <span className="detail-date">{checkOutData.date}</span>
                                            <span className="detail-time">{checkOutData.time}</span>
                                        </div>
                                    </div>

                                    {/* Rate */}
                                    <div className="detail-item">
                                        <div className="detail-label">Rate</div>
                                        <div className="detail-value rate-value">
                                            ₹{room.rate.toLocaleString()}
                                        </div>
                                    </div>

                                    {/* Guests */}
                                    <div className="detail-item">
                                        <div className="detail-label">Guests</div>
                                        <div className="detail-value guests-icons">
                                            {room.maleGuests > 0 && (
                                                <span className="guest-icon">
                                                    👨 × {room.maleGuests}
                                                </span>
                                            )}
                                            {room.femaleGuests > 0 && (
                                                <span className="guest-icon">
                                                    👩 × {room.femaleGuests}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section - Services & Action */}
                                <div className="room-actions-section">
                                    {/* Service Icons */}
                                    <div className="service-icons">
                                        {room.services.includes('wifi') && (
                                            <span className="service-icon" title="WiFi">📶</span>
                                        )}
                                        {room.services.includes('breakfast') && (
                                            <span className="service-icon" title="Breakfast">🍳</span>
                                        )}
                                        {room.services.includes('laundry') && (
                                            <span className="service-icon" title="Laundry">👔</span>
                                        )}
                                        {room.services.includes('spa') && (
                                            <span className="service-icon" title="Spa">💆</span>
                                        )}
                                    </div>

                                    {/* Action Button - Show View Order or Add Service */}
                                    {foodOrders.includes(room.id) ? (
                                        <button
                                            className="btn-view-order"
                                            onClick={() => handleAddService(room)}
                                            title="View Order"
                                        >
                                            🍽️ View Order
                                        </button>
                                    ) : (
                                        <button
                                            className="btn-room-action"
                                            onClick={() => handleAddService(room)}
                                            title="Add Service"
                                        >
                                            +
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
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
        </div>
    );
};

export default RoomService;
