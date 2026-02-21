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
    const [toast, setToast] = useState(null);

    // Show toast notification
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Local storage for preparing start times
    const [preparingTimes, setPreparingTimes] = useState({});

    // Update current time for elapsed timer
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 10000);
        return () => clearInterval(timer);
    }, []);

    // Handle initial filter and tab from navigation
    useEffect(() => {
        if (location.state) {
            if (location.state.activeFilter) {
                setActiveFilter(location.state.activeFilter);
            }
            if (location.state.activeTab) {
                setActiveTab(location.state.activeTab);
            }
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
                    table: order.roomNumber || order.tableNumber?.toString() || '-',
                    type: order.orderType || 'Dine In',
                    items: order.items || [],
                    status: order.status === 'Active' ? 'Pending' :
                        order.status === 'Started' ? 'In Service' : order.status,
                    rawStatus: order.status, // Keep raw for API calls
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
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleStatusUpdate = async (orderId, newStatus) => {
        // Find order index
        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;

        const order = orders[orderIndex];
        // Use rawStatus for comparison to avoid display-mapped values
        const currentRaw = order.rawStatus || order.status;
        if (currentRaw === 'Billed' || currentRaw === newStatus) return;

        // Validation: No backward transition
        if ((currentRaw === 'Ready' || order.status === 'Ready') && (newStatus === 'Preparing' || newStatus === 'Pending')) return;
        if ((currentRaw === 'Preparing' || order.status === 'Preparing') && newStatus === 'Pending') return;

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
        if (status !== 'Ready' && status !== 'In Service') {
            alert('Order must be READY before sending.');
            return;
        }

        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        if (order.type === 'Post to Room' || order.type === 'Room Order' || order.type === 'Room Service') {
            // Room Service: Mark as 'Started' → shows in Room Service 'In Service' tab
            const success = await handleStatusUpdate(orderId, 'Started');
            if (success) showToast('✅ Order sent — delivery started!');
        } else if (order.type === 'Take Away') {
            const success = await handleStatusUpdate(orderId, 'Pending Payment');
            if (success) showToast('✅ Order sent to cashier!');
        } else if (order.type === 'Online' || order.type === 'Delivery') {
            const success = await handleStatusUpdate(orderId, 'Started');
            if (success) showToast('✅ Online order — delivery started!');
        } else {
            await handleStatusUpdate(orderId, 'Served');
            showToast('✅ Order served to table!');
        }
    };

    const handleCompleteOrder = (orderId, status) => {
        if (status !== 'Ready' && status !== 'In Service') {
            alert('Order must be READY or In Service before completing.');
            return;
        }
        handleStatusUpdate(orderId, 'Billed');
    };

    const handleDeleteOrder = async (orderId) => {
        try {
            const response = await fetch(`${API_URL_CONFIG}/api/guest-meal/orders/${orderId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                showToast('🗑️ Order deleted successfully', 'success');
                fetchOrders(); // Refresh list
            } else {
                // Show actual error from backend if available
                alert(data.message || data.error || 'Failed to delete order');
            }
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Error connecting to server');
        }
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
                if (activeFilter === 'Dine In') matchesFilter = order.type === 'Dine In' || order.type === 'Dine-In' || order.type === 'Direct Payment';
                else if (activeFilter === 'Room Order') matchesFilter = order.type === 'Post to Room' || order.type === 'Room Order' || order.type === 'Room Service';
                else if (activeFilter === 'Take Away') matchesFilter = order.type === 'Take Away';
                else if (activeFilter === 'Online Order') matchesFilter = order.type === 'Online' || order.type === 'Delivery';
            }
            return matchesSearch && matchesFilter;
        });
    }, [searchQuery, activeFilter, orders]);

    return (
        <div className="view-order-container">
            {/* Toast Notification */}
            {toast && (
                <div style={{
                    position: 'fixed',
                    top: '80px',
                    right: '24px',
                    background: toast.type === 'success' ? '#22c55e' : '#ef4444',
                    color: '#fff',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '14px',
                    zIndex: 9999,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    animation: 'slideInRight 0.3s ease'
                }}>
                    {toast.message}
                </div>
            )}
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
                            <input
                                type="text"
                                placeholder="Search Table or Item..."
                                className="filter-search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {['All', 'Dine In', 'Room Order', 'Take Away', 'Online Order'].map(filter => (
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
                            const isReady = order.status === 'Ready' || order.status === 'In Service';
                            const pendingElapsed = getMinutesElapsed(order.createdAt);
                            const prepElapsed = getMinutesElapsed(preparingTimes[order.id]);

                            return (
                                <div className={`order-card ${isBilled ? 'completed' : ''}`} key={order.id}>
                                    <div
                                        className="card-header"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => {
                                            if (order.type === 'Take Away') {
                                                navigate('/admin/cashier', { state: { activeTab: 'Take Away' } });
                                            } else if (order.type === 'Post to Room' || order.type === 'Room Order' || order.type === 'Room Service') {
                                                navigate('/admin/dashboard', { state: { activeMenu: 'guest-meal-service' } });
                                            } else if (order.type === 'Online' || order.type === 'Delivery') {
                                                navigate('/admin/dashboard', { state: { activeMenu: 'view-order', activeFilter: 'Online Order' } });
                                            } else {
                                                navigate('/admin/dashboard', { state: { activeMenu: 'guestmealservice' } });
                                            }
                                        }}
                                    >
                                        <span className="header-table">
                                            {(order.type === 'Take Away') ? `${order.guestName || 'Take Away'}` :
                                                (order.type === 'Online' || order.type === 'Delivery') ? `Online: ${order.guestName || 'Order'}` :
                                                    (order.type === 'Post to Room' || order.type === 'Room Order' || order.type === 'Room Service') ? `Room: ${order.table}` :
                                                        order.table === '-' ? 'Walk-in' : `Table: ${order.table}`}
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
                                    {!isBilled && order.status === 'In Service' && (
                                        <div className="status-strip" style={{ background: '#8b5cf6', color: '#fff', fontWeight: '700' }}>
                                            🛵 In Service — Delivery on the way
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

                                    {/* Status Buttons Row — locked when In Service */}
                                    <div className="status-actions">
                                        <button
                                            className={`status-btn ${order.status === 'Pending' && !isBilled ? 'blinking pending' : ''} ${(isBilled || order.status === 'In Service') ? 'disabled' : ''}`}
                                            onClick={() => handleStatusUpdate(order.id, 'Pending')}
                                            disabled={isBilled || order.status === 'In Service'}
                                        >
                                            <span className="status-icon">⏱</span>
                                            <span>Pending</span>
                                        </button>
                                        <button
                                            className={`status-btn ${order.status === 'Preparing' && !isBilled ? 'blinking preparing' : ''} ${(isBilled || order.status === 'In Service') ? 'disabled' : ''}`}
                                            onClick={() => handleStatusUpdate(order.id, 'Preparing')}
                                            disabled={isBilled || order.status === 'In Service'}
                                        >
                                            <span className="status-icon">🔥</span>
                                            <span>Preparing</span>
                                        </button>
                                        <button
                                            className={`status-btn ${order.status === 'Ready' && !isBilled ? 'blinking ready' : ''} ${(isBilled || order.status === 'In Service') ? 'disabled' : ''}`}
                                            onClick={() => handleStatusUpdate(order.id, 'Ready')}
                                            disabled={isBilled || order.status === 'In Service'}
                                        >
                                            <span className="status-icon">✔</span>
                                            <span>Ready</span>
                                        </button>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="card-footer">
                                        <button
                                            className={`action-btn send ${isReady && !isBilled ? 'blinking-green' : ''} ${!isReady || isBilled ? 'disabled' : ''}`}
                                            onClick={() => handleSendNotification(order.id, order.status)}
                                            style={{
                                                opacity: isReady && !isBilled ? 1 : 0.4,
                                                cursor: isReady && !isBilled ? 'pointer' : 'not-allowed'
                                            }}
                                        >
                                            {order.type === 'Take Away' ? 'To Customer' : 'Send'}
                                        </button>
                                        <button
                                            className={`action-btn done ${isBilled ? 'disabled' : ''}`}
                                            onClick={() => handleDeleteOrder(order.id)}
                                            disabled={isBilled}
                                        >
                                            Done
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
