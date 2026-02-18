import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API_URL_CONFIG from '../config/api';
import './ViewOrderPage.css';
import ItemStockStatus from './ItemStockStatus';
import OutletCurrentStatus from './OutletCurrentStatus';

const ViewOrderPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // Top Tabs State
    const [activeTab, setActiveTab] = useState('Bill View');
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [currentTime, setCurrentTime] = useState(new Date());

    // Local storage for preparing start times
    const [preparingTimes, setPreparingTimes] = useState({});

    // Update current time for elapsed timer
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 10000);
        return () => clearInterval(timer);
    }, []);

    // Handle initial filter from navigation
    useEffect(() => {
        if (location.state && location.state.activeFilter) {
            setActiveFilter(location.state.activeFilter);
        }
    }, [location.state]);

    // Fetch Orders from API
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL_CONFIG}/api/guest-meal/orders`);
            const data = await response.json();
            if (data.success) {
                const mappedOrders = data.data.map(order => ({
                    id: order._id,
                    createdAt: new Date(order.createdAt),
                    time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    table: order.roomNumber || order.tableNumber.toString(),
                    type: order.orderType || 'Dine In',
                    items: order.items || [],
                    status: order.status === 'Active' ? 'Pending' : order.status,
                    amount: order.finalAmount || 0,
                    updatedAt: new Date(order.updatedAt),
                    guestName: order.guestName || ''
                }));
                setOrders(mappedOrders);

                // Initialize preparing times
                const newPrepTimes = { ...preparingTimes };
                mappedOrders.forEach(o => {
                    if (o.status === 'Preparing' && !newPrepTimes[o.id]) {
                        newPrepTimes[o.id] = o.updatedAt;
                    }
                });
                setPreparingTimes(newPrepTimes);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleStatusUpdate = async (orderId, newStatus) => {
        // Find order index
        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;

        const order = orders[orderIndex];
        if (order.status === 'Billed' || order.status === newStatus) return;

        // Validation: No backward transition
        if (order.status === 'Ready' && (newStatus === 'Preparing' || newStatus === 'Pending')) return;
        if (order.status === 'Preparing' && newStatus === 'Pending') return;

        // OPTIMISTIC UPDATE
        const previousOrders = [...orders];
        const updatedOrders = [...orders];
        updatedOrders[orderIndex] = { ...order, status: newStatus };
        setOrders(updatedOrders);

        // Timer Start
        if (newStatus === 'Preparing') {
            setPreparingTimes(prev => ({ ...prev, [orderId]: new Date() }));
        }

        try {
            const response = await fetch(`${API_URL_CONFIG}/api/guest-meal/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Status update failed:", errorData);
                setOrders(previousOrders);
                alert(`Failed to update status: ${errorData.message || 'Unknown Error'}`);
                return false;
            } else {
                fetchOrders(); // Sync
                return true;
            }
        } catch (error) {
            console.error('Error updating status:', error);
            setOrders(previousOrders);
            return false;
        }
    };

    const handleSendNotification = async (orderId, status) => {
        if (status !== 'Ready') {
            alert('Order must be READY before sending.');
            return;
        }

        // Find the order to check its type
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        if (order.type === 'Take Away' || order.type === 'Post to Room' || order.type === 'Room Order') {
            // Take Away / Room Service: Set to 'Pending Payment' and navigate to cashier
            const success = await handleStatusUpdate(orderId, 'Pending Payment');
            if (success) {
                alert('Order sent to cashier successfully');
            }
        } else {
            // Table orders: Set to 'Served' (green blink in table view)
            await handleStatusUpdate(orderId, 'Served');
        }
    };

    const handleCompleteOrder = (orderId, status) => {
        if (status !== 'Ready') {
            alert('Order must be READY before completing.');
            return;
        }
        handleStatusUpdate(orderId, 'Billed');
    };

    // Elapsed calculation helpers
    const getMinutesElapsed = (startTime) => {
        if (!startTime) return 0;
        return Math.floor((currentTime - startTime) / 60000);
    };

    // Filter Logic
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch =
                searchQuery === '' ||
                (order.table && order.table.toString().toLowerCase().includes(searchQuery.toLowerCase())) ||
                (order.guestName && order.guestName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

            let matchesFilter = true;
            if (activeFilter !== 'All') {
                if (activeFilter === 'Dine In') matchesFilter = order.type === 'Dine In';
                else if (activeFilter === 'Room Order') matchesFilter = order.type === 'Post to Room' || order.type === 'Room Order';
                else if (activeFilter === 'Take Away') matchesFilter = order.type === 'Take Away';
            }
            return matchesSearch && matchesFilter;
        });
    }, [searchQuery, activeFilter, orders]);

    return (
        <div className="view-order-container">
            {/* Top Tabs */}
            <div className="view-order-tabs">
                {['Bill View', 'KOT View', 'Outlet Current Status', 'Item Stock Status'].map(tab => (
                    <button
                        key={tab}
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Switch */}
            {activeTab === 'Item Stock Status' ? (
                <ItemStockStatus />
            ) : activeTab === 'Outlet Current Status' ? (
                <OutletCurrentStatus />
            ) : (
                <>
                    {/* Filters */}
                    <div className="view-order-filters">
                        <div className="search-wrapper">
                            <span style={{ position: 'absolute', left: '15px', top: '12px', color: '#64748b' }}>🔍</span>
                            <input
                                type="text"
                                placeholder="Search Table or Item..."
                                className="filter-search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {['All', 'Dine In', 'Room Order', 'Take Away'].map(filter => (
                            <button
                                key={filter}
                                className={`filter-pill ${activeFilter === filter ? 'active' : ''}`}
                                onClick={() => setActiveFilter(filter)}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="orders-grid">
                        {filteredOrders.map(order => {
                            const isBilled = order.status === 'Billed';
                            const isReady = order.status === 'Ready';
                            const pendingElapsed = getMinutesElapsed(order.createdAt);
                            const prepElapsed = getMinutesElapsed(preparingTimes[order.id]);

                            return (
                                <div className={`order-card ${isBilled ? 'completed' : ''}`} key={order.id}>
                                    {/* Header */}
                                    {/* Header - Clickable for navigation */}
                                    <div
                                        className="card-header"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => {
                                            if (order.type === 'Take Away') {
                                                navigate('/admin/cashier', { state: { activeTab: 'Take Away' } });
                                            } else if (order.type === 'Post to Room' || order.type === 'Room Order') {
                                                navigate('/admin/dashboard', { state: { activeMenu: 'reservations', viewMode: 'roomservice' } });
                                            } else {
                                                // For table orders (Dine In), navigate to guest meal service
                                                navigate('/admin/dashboard', { state: { activeMenu: 'guestmealservice' } });
                                            }
                                        }}
                                    >
                                        <span className="header-table">
                                            {(order.type === 'Take Away') ? `${order.guestName}` :
                                                (order.type === 'Post to Room' || order.type === 'Room Order') ? `Room: ${order.table}` :
                                                    `Table: ${order.table}`}
                                        </span>
                                        <span className="header-time">{order.time}</span>
                                    </div>

                                    {/* Status Strip */}
                                    {!isBilled && order.status === 'Pending' && (
                                        <div className="status-strip pending-delay">
                                            ⚠️ DELAY {pendingElapsed}m elapsed
                                        </div>
                                    )}
                                    {!isBilled && order.status === 'Preparing' && (
                                        <div className={`status-strip ${prepElapsed > 15 ? 'preparing-delay' : 'preparing-timer'}`}>
                                            {prepElapsed > 15 ? `⚠️ DELAY in preparation (${prepElapsed}m)` : `Preparing • ${prepElapsed}m`}
                                        </div>
                                    )}
                                    {(isBilled || order.status === 'Ready') && (
                                        <div className="status-strip"></div>
                                    )}

                                    {/* Body */}
                                    <div className="card-body">
                                        <div className="item-list">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="order-item">
                                                    <span className="item-name-qty">
                                                        {item.name} {item.quantity > 1 ? `×${item.quantity}` : ''}
                                                    </span>
                                                    <div className="item-separator"></div>
                                                    <span className="item-price">₹{item.price * item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Status Buttons Row */}
                                    <div className="status-actions">
                                        <button
                                            className={`status-btn ${order.status === 'Pending' && !isBilled ? 'blinking pending' : ''} ${isBilled ? 'disabled' : ''}`}
                                            onClick={() => handleStatusUpdate(order.id, 'Pending')}
                                        >
                                            <span className="status-icon">⏱</span>
                                            <span>Pending</span>
                                        </button>
                                        <button
                                            className={`status-btn ${order.status === 'Preparing' && !isBilled ? 'blinking preparing' : ''} ${isBilled ? 'disabled' : ''}`}
                                            onClick={() => handleStatusUpdate(order.id, 'Preparing')}
                                        >
                                            <span className="status-icon">🔥</span>
                                            <span>Preparing</span>
                                        </button>
                                        <button
                                            className={`status-btn ${order.status === 'Ready' && !isBilled ? 'blinking ready' : ''} ${isBilled ? 'disabled' : ''}`}
                                            onClick={() => handleStatusUpdate(order.id, 'Ready')}
                                        >
                                            <span className="status-icon">✔</span>
                                            <span>Ready</span>
                                        </button>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="card-footer">
                                        <button
                                            className={`action-btn send ${order.status === 'Ready' && !isBilled ? 'blinking-green' : ''} ${!isReady || isBilled ? 'disabled' : ''}`}
                                            onClick={() => handleSendNotification(order.id, order.status)}
                                            style={{
                                                opacity: isReady && !isBilled ? 1 : 0.4,
                                                cursor: isReady && !isBilled ? 'pointer' : 'not-allowed',
                                                backgroundColor: '#fff',
                                                color: isReady && !isBilled ? '#dc2626' : '#94a3b8'
                                            }}
                                        >
                                            {(order.type === 'Take Away' || order.type === 'Post to Room' || order.type === 'Room Order') ? 'Send To' : 'Send'}
                                        </button>
                                        <button
                                            className={`action-btn complete ${isBilled ? 'completed-done' : (isReady ? '' : 'disabled')}`}
                                            onClick={() => handleCompleteOrder(order.id, order.status)}
                                            style={{
                                                opacity: (isReady || isBilled) ? 1 : 0.4,
                                                cursor: (isReady || isBilled) ? 'pointer' : 'not-allowed'
                                            }}
                                        >
                                            {isBilled ? 'Completed' : 'Complete'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default ViewOrderPage;
