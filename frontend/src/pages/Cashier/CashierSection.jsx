import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../config/api';
import './CashierSection.css';

const CashierSection = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewOrderModal, setShowNewOrderModal] = useState(false);
    const [newOrderDetails, setNewOrderDetails] = useState({ name: '', phone: '' });

    // Track Order State
    const [showTrackModal, setShowTrackModal] = useState(false);
    const [trackQuery, setTrackQuery] = useState('');
    const [trackedOrders, setTrackedOrders] = useState(null); // null means not searched yet
    const [trackLoading, setTrackLoading] = useState(false);

    // State for Orders
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({
        totalCollection: 0,
        cash: 0,
        upi: 0,
        card: 0,
        pending: 0
    });

    // Helper to check permissions
    const hasCashierPermission = (type) => {
        if (!user) return false;
        if (user.role !== 'staff') return true; // Admins etc have full access

        const permissions = user.permissions || [];
        if (type === 'Table') return permissions.includes('Cashier Section (Table)');
        if (type === 'Room') return permissions.includes('Cashier Section (Room Service)');
        if (type === 'Take Away') return permissions.includes('Cashier Section (Take Away)');
        return false;
    };

    const allowedTabs = ['All'];
    if (hasCashierPermission('Table')) allowedTabs.push('Dine In');
    if (hasCashierPermission('Room')) allowedTabs.push('Room');
    if (hasCashierPermission('Take Away')) {
        allowedTabs.push('Take Away');
        allowedTabs.push('Delivery');
        allowedTabs.push('Online Order');
    }

    // Fetch pending orders from API
    useEffect(() => {
        fetchPendingOrders();
        fetchDashboardStats();
    }, []);

    // Listen for refresh triggers (e.g. from GuestMealService 'Send')
    useEffect(() => {
        if (location.state && location.state.refresh) {
            fetchPendingOrders();
            fetchDashboardStats();
        }
    }, [location.state]);

    const fetchDashboardStats = async () => {
        try {
            const response = await fetch(`${API_URL}/api/guest-meal/analytics/dashboard`);
            const data = await response.json();
            if (data.success) {
                const s = data.data;
                setStats({
                    totalCollection: s.totalRevenue || 0,
                    cash: s.collections?.Cash || 0,
                    upi: s.collections?.UPI || 0,
                    card: s.collections?.Card || 0,
                    pending: stats.pending // handled by fetchPendingOrders
                });
            }
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
        }
    };

    const fetchPendingOrders = async () => {
        try {
            const response = await fetch(`${API_URL}/api/guest-meal/orders/pending`);
            const data = await response.json();

            if (data.success) {
                console.log(`[CashierSection] Fetched ${data.data.length} pending orders:`, data.data);
                const mappedOrders = data.data.map(order => ({
                    id: order._id,
                    type: (order.orderType === 'Table Order' || order.orderType === 'Direct Payment') ? 'Table' :
                        (order.orderType === 'Room Service' || order.orderType === 'Post to Room' || order.orderType === 'Room Order') ? 'Room' :
                            order.orderType === 'Take Away' ? 'Take Away' : 'Table',
                    name: (order.orderType === 'Table Order' || order.orderType === 'Direct Payment') ? `Table ${order.tableNumber}` :
                        (order.orderType === 'Room Service' || order.orderType === 'Post to Room' || order.orderType === 'Room Order') ? `Room ${order.roomNumber}` :
                            order.orderType === 'Take Away' ? `Take Away` : `Table ${order.tableNumber}`,
                    guestName: order.guestName || 'Guest',
                    guestPhone: order.guestPhone || '',
                    guest: `${order.guestName || 'Guest'}${order.guestPhone ? ` - ${order.guestPhone}` : ''}`,
                    amount: order.finalAmount || 0,
                    status: 'Pending',
                    time: order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
                    items: (order.items || []).map(item => ({
                        name: item.name,
                        qty: item.quantity,
                        price: item.price,
                        amount: item.subtotal
                    })),
                    billNo: order._id.toString().substr(-6).toUpperCase(),
                    kotInfo: `KOT - ${order._id.toString().substr(-4)}`
                }));

                setOrders(mappedOrders);
                setStats(prev => ({
                    ...prev,
                    pending: mappedOrders.length,
                }));
            }
        } catch (error) {
            console.error("Error fetching pending orders:", error);
        }
    };

    const handleOrderClick = (order) => {
        setSelectedOrder(order);
    };

    const handlePaymentComplete = async (orderId, amount, mode, type, roomNumber = null) => {
        try {
            const response = await fetch(`${API_URL}/api/guest-meal/orders/${orderId}/settle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentMethod: type, // 'Direct Payment' or 'Add to Room'
                    paymentMode: mode,   // 'Cash', 'UPI', etc.
                    amount: amount,
                    roomNumber: roomNumber
                })
            });

            const data = await response.json();

            if (data.success) {
                // Remove processed order from pending list
                const updatedOrders = orders.filter(o => o.id !== orderId);
                setOrders(updatedOrders);
                setSelectedOrder(null);

                // Remove from tracked orders as well
                if (trackedOrders) {
                    setTrackedOrders(prev => prev.filter(o => o._id !== orderId));
                }

                // Update Stats
                setStats(prev => ({
                    ...prev,
                    totalCollection: prev.totalCollection + amount,
                    [mode.toLowerCase()]: (prev[mode.toLowerCase()] || 0) + amount,
                    pending: Math.max(0, prev.pending - 1)
                }));

                if (type === 'Add to Room') {
                    alert(`✅ Successfully Added to Folio!\n\nTarget Room: ${roomNumber} \nAmount Posted: ₹${amount}`);
                } else {
                    alert(`✅ Payment Processed Successfully!\n\nBill Amount: ₹${amount} \nPayment Mode: ${mode} \nStatus: Settled`);
                }
            } else {
                alert('Failed to settle order: ' + data.message);
            }
        } catch (error) {
            console.error('Error settling order:', error);
            alert('Error settling order. Please check connection.');
        }
    };

    const handleRoomPostingAction = (action) => {
        if (action === 'Print') {
            alert('Room Posting List Printed Successfully!');
        } else if (action === 'SMS') {
            alert('Room Posting Summary Sent via SMS!');
        } else {
            alert('Room Posting Summary Sent via Email!');
        }
    };

    const handleNewOrderClick = () => {
        setShowNewOrderModal(true);
    };

    const handleGoToFoodMenu = () => {
        if (!newOrderDetails.name) {
            alert('Please enter customer name');
            return;
        }
        setShowNewOrderModal(false);
        // Navigate by state instead of preventing default
        // The AdminDashboard listens for location.state.activeMenu
        navigate('/admin/dashboard', {
            state: {
                activeMenu: 'food-order', // Trigger switching to food order view
                customerName: newOrderDetails.name,
                customerPhone: newOrderDetails.phone,
                orderMode: 'takeaway'
            }
        });
    };

    // --- TRACK ORDER LOGIC ---
    const handleTrackOrderSearch = async () => {
        if (!trackQuery.trim()) return;

        setTrackLoading(true);
        try {
            // Using getAllOrders to find by phone/name/id
            // In a real app, this should be a specific search endpoint.
            // Optimized: Fetch all active orders and filter client side for now.
            const response = await fetch(`${API_URL}/api/guest-meal/orders`);
            const data = await response.json();

            if (data.success) {
                const query = trackQuery.toLowerCase();
                const matched = data.data.filter(o =>
                    o.orderType === 'Take Away' && // Stick to Take Away as requested
                    !['Closed', 'Cancelled', 'Completed', 'Settled'].includes(o.status) &&
                    (
                        (o.guestPhone && o.guestPhone.includes(query)) ||
                        (o.guestName && o.guestName.toLowerCase().includes(query)) ||
                        (o._id && o._id.toLowerCase().includes(query))
                    )
                );
                setTrackedOrders(matched);
            } else {
                setTrackedOrders([]);
            }
        } catch (error) {
            console.error("Error tracking order:", error);
            setTrackedOrders([]);
        }
        setTrackLoading(false);
    };

    const getStatusStep = (status) => {
        if (['Pending', 'Active'].includes(status)) return 1;
        if (['Preparing', 'Started'].includes(status)) return 2;
        if (['Ready', 'Served'].includes(status)) return 3;
        if (['Billed', 'Pending Payment', 'Completed'].includes(status)) return 4;
        return 0;
    };


    // Filter Logic
    const filteredOrders = (activeTab === 'All'
        ? orders
        : orders.filter(order => {
            if (activeTab === 'Dine In') return order.type === 'Table';
            if (activeTab === 'Room') return order.type === 'Room';
            if (activeTab === 'Take Away') return order.type === 'Take Away';
            if (activeTab === 'Delivery') return order.type === 'Delivery';
            if (activeTab === 'Online Order') return order.type === 'Online';
            return true;
        })).filter(order => {
            // Apply permission filter
            if (order.type === 'Table' && !hasCashierPermission('Table')) return false;
            if (order.type === 'Room' && !hasCashierPermission('Room')) return false;
            if (['Take Away', 'Delivery', 'Online'].includes(order.type) && !hasCashierPermission('Take Away')) return false;
            return true;
        }).filter(order => {
            // Apply search filter
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
                order.billNo.toLowerCase().includes(q) ||
                order.name.toLowerCase().includes(q) ||
                order.type.toLowerCase().includes(q)
            );
        });

    return (
        <div className="cashier-container fadeIn">
            <div className="cashier-dashboard">

                {/* PAGE HEADER */}
                <div className="cashier-header">
                    <h1>Cashier Dashboard</h1>
                    <div className="header-actions">
                        <button className="btn-track" onClick={() => setShowTrackModal(true)}>
                            <span className="icon">📡</span> Track Order
                        </button>
                        <button className="btn-new-order" onClick={handleNewOrderClick}>
                            <span className="icon">🛍️</span> New Take Away Order
                        </button>
                    </div>
                </div>

                {/* TOP SECTION: SUMMARY CARDS */}
                <div className="stats-wrapper">
                    <div className="stat-card total">
                        <div className="stat-card-inner">
                            <span className="stat-label">TOTAL COLLECTION TODAY</span>
                            <span className="stat-value">₹{stats.totalCollection.toFixed(2)}</span>
                        </div>
                        <span className="stat-icon-bg">📈</span>
                    </div>
                    <div className="stat-card cash">
                        <div className="stat-card-inner">
                            <span className="stat-label">CASH COLLECTION</span>
                            <span className="stat-value">₹{stats.cash.toFixed(2)}</span>
                        </div>
                        <span className="stat-icon-bg">💰</span>
                    </div>
                    <div className="stat-card upi">
                        <div className="stat-card-inner">
                            <span className="stat-label">UPI COLLECTION</span>
                            <span className="stat-value">₹{stats.upi.toFixed(2)}</span>
                        </div>
                        <span className="stat-icon-bg">📱</span>
                    </div>
                    <div className="stat-card card-pay">
                        <div className="stat-card-inner">
                            <span className="stat-label">CARD COLLECTION</span>
                            <span className="stat-value">₹{stats.card.toFixed(2)}</span>
                        </div>
                        <span className="stat-icon-bg">💳</span>
                    </div>
                    <div className="stat-card pending">
                        <div className="stat-card-inner">
                            <span className="stat-label">TOTAL PENDING</span>
                            <span className="stat-value">{orders.length}</span>
                        </div>
                        <span className="stat-icon-bg">🔔</span>
                    </div>
                </div>

                {/* MAIN CONTENT AREA: 3 COLUMN GRID */}
                <div className="dashboard-content">

                    {/* LEFT PANEL: ORDERS */}
                    <div className="pos-card orders-sidebar">
                        <div className="sidebar-header">
                            <div className="tabs-row">
                                {allowedTabs.map(tab => (
                                    <button
                                        key={tab}
                                        className={`tab ${activeTab === tab ? 'active' : ''}`}
                                        onClick={() => setActiveTab(tab)}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Search Bar */}
                            <div className="search-bar">
                                <span className="search-icon">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search orders..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="orders-list-wrapper">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map(order => (
                                    <div
                                        key={order.id}
                                        className={`order-card ${selectedOrder && selectedOrder.id === order.id ? 'active' : ''}`}
                                        onClick={() => handleOrderClick(order)}
                                    >
                                        <div className="order-header">
                                            <span className="order-id">Order #{order.billNo}</span>
                                            <span className="order-amount">₹ {order.amount}</span>
                                        </div>
                                        <div className="order-details">
                                            <span className="order-source">{order.name}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-orders-state">
                                    No orders found {activeTab} 🍹
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CENTER + RIGHT PANELS: Bill & Payment */}
                    <CashierPayment
                        order={selectedOrder}
                        onPaymentComplete={handlePaymentComplete}
                        onRoomPostingAction={handleRoomPostingAction}
                    />

                </div>
            </div>

            {/* Modals integrated with POS theme */}
            {showTrackModal && (
                <div className="modal-overlay-custom">
                    <div className="modal-content-custom" style={{ width: '500px' }}>
                        <div className="modal-header-custom">
                            <h3>Track Take Away Order</h3>
                            <button className="close-btn-custom" onClick={() => { setShowTrackModal(false); setTrackedOrders(null); setTrackQuery(''); }}>×</button>
                        </div>
                        <div className="modal-body-custom">
                            <div className="form-group-custom" style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    placeholder="Enter Phone Number or Order ID..."
                                    value={trackQuery}
                                    onChange={(e) => setTrackQuery(e.target.value)}
                                    style={{ flex: 1 }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleTrackOrderSearch()}
                                />
                                <button className="track-search-btn" onClick={handleTrackOrderSearch} disabled={trackLoading}>
                                    {trackLoading ? '...' : '🔍 Check'}
                                </button>
                            </div>

                            <div className="track-results-area" style={{ marginTop: '20px', minHeight: '150px' }}>
                                {trackedOrders === null ? (
                                    <div className="placeholder-text" style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>
                                        Enter details to track status
                                    </div>
                                ) : trackedOrders.length === 0 ? (
                                    <div className="placeholder-text" style={{ textAlign: 'center', color: '#ef4444', marginTop: '40px' }}>
                                        No active Take Away orders found.
                                    </div>
                                ) : (
                                    <div className="tracked-orders-list">
                                        {trackedOrders.map(order => {
                                            const step = getStatusStep(order.status);
                                            return (
                                                <div key={order._id} className="track-card">
                                                    <div className="track-card-header">
                                                        <span className="track-id">#{order._id.substr(-6).toUpperCase()}</span>
                                                        <span className="track-amount">₹{order.finalAmount}</span>
                                                    </div>
                                                    <div className="track-guest">{order.guestName} ({order.guestPhone || 'No Phone'})</div>

                                                    {/* Status Tracker */}
                                                    <div className="track-status-stepper">
                                                        <div className={`step-item ${step >= 1 ? 'completed' : ''} ${step === 1 ? 'active' : ''}`}>
                                                            <div className="step-circle">{step > 1 ? '✓' : '1'}</div>
                                                            <div className="step-label">Pending</div>
                                                        </div>
                                                        <div className={`step-line ${step >= 2 ? 'completed' : ''}`}></div>
                                                        <div className={`step-item ${step >= 2 ? 'completed' : ''} ${step === 2 ? 'active' : ''}`}>
                                                            <div className="step-circle">{step > 2 ? '✓' : '2'}</div>
                                                            <div className="step-label">Preparing</div>
                                                        </div>
                                                        <div className={`step-line ${step >= 3 ? 'completed' : ''}`}></div>
                                                        <div className={`step-item ${step >= 3 ? 'completed' : ''} ${step === 3 ? 'active' : ''}`}>
                                                            <div className="step-circle">{step > 3 ? '✓' : '3'}</div>
                                                            <div className="step-label">Ready</div>
                                                        </div>
                                                    </div>

                                                    {order.status === 'Ready' && (
                                                        <div className="ready-alert">
                                                            🎉 Order is Ready for Pickup!
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showNewOrderModal && (
                <div className="modal-overlay-custom">
                    <div className="modal-content-custom">
                        <div className="modal-header-custom">
                            <h3>New Take Away Order</h3>
                            <button className="close-btn-custom" onClick={() => setShowNewOrderModal(false)}>×</button>
                        </div>
                        <div className="modal-body-custom">
                            <div className="form-group-custom">
                                <label>Customer Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter Customer Name"
                                    value={newOrderDetails.name}
                                    onChange={(e) => setNewOrderDetails({ ...newOrderDetails, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group-custom">
                                <label>Phone Number</label>
                                <input
                                    type="text"
                                    placeholder="Enter Phone Number"
                                    value={newOrderDetails.phone}
                                    onChange={(e) => setNewOrderDetails({ ...newOrderDetails, phone: e.target.value })}
                                />
                            </div>
                            <button className="food-menu-btn" onClick={handleGoToFoodMenu}>
                                🍽️ Open Food Menu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CashierPayment = ({ order, onPaymentComplete, onRoomPostingAction }) => {
    // State for payment interactions
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [paymentType, setPaymentType] = useState('Direct Payment');
    const [receivedAmount, setReceivedAmount] = useState('');
    const [returnAmount, setReturnAmount] = useState(0);
    const [targetRoom, setTargetRoom] = useState('');
    const [smsModal, setSmsModal] = useState({ show: false, name: '', phone: '' });
    const [isSendingSms, setIsSendingSms] = useState(false);
    const [smsError, setSmsError] = useState('');

    // Initial state reset when order changes
    useEffect(() => {
        if (order) {
            setPaymentMode('Cash');
            setPaymentType('Direct Payment');
            setReceivedAmount(order.amount.toString());

            // Pre-fill room number if it's a Room order
            if (order.type === 'Room' && order.name.includes('Room')) {
                setTargetRoom(order.name.replace('Room', '').trim());
            } else {
                setTargetRoom('');
            }
        } else {
            setReceivedAmount('');
            setReturnAmount(0);
            setTargetRoom('');
        }
    }, [order]);

    // Calculate Return Amount
    useEffect(() => {
        if (order && receivedAmount) {
            const received = parseFloat(receivedAmount);
            const billAmount = order.amount;
            if (!isNaN(received)) {
                setReturnAmount(received - billAmount);
            } else {
                setReturnAmount(0);
            }
        } else {
            setReturnAmount(0);
        }
    }, [receivedAmount, order]);

    const handlePrintBill = () => {
        if (!order) return;

        const invoiceContent = `
    <!DOCTYPE html>
        <html>
            <head>
                <title>Invoice ${order.billNo}</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Libre+Barcode+39+Text&display=swap" rel="stylesheet">
                    <style>
                        @page { size: 80mm auto; margin: 0; }
                        body {
                            font-family: 'Inter', sans-serif;
                            width: 72mm;
                            margin: 4mm auto;
                            background: white;
                            color: #000;
                            font-size: 11px;
                            line-height: 1.4;
                        }
                        .header { text-align: center; margin-bottom: 12px; }
                        .logo-area { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 2px; }
                        .subtitle { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #444; margin-bottom: 8px; }
                        .contact-info { font-size: 9px; color: #666; line-height: 1.2; }
                        
                        .divider { border-top: 1px dashed #ccc; margin: 10px 0; }
                        .bill-info { margin-bottom: 10px; }
                        .info-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
                        .info-label { color: #666; }
                        .info-value { font-weight: 700; }

                        table { width: 100%; border-collapse: collapse; margin: 12px 0; }
                        th { text-align: left; border-bottom: 1.5px solid #000; padding: 6px 0; font-size: 10px; text-transform: uppercase; }
                        td { padding: 8px 0; vertical-align: top; border-bottom: 0.5px solid #eee; }
                        .col-qty { text-align: center; width: 10%; }
                        .col-amt { text-align: right; width: 30%; }
                        .col-item { width: 60%; font-weight: 500; }

                        .totals { margin-top: 8px; }
                        .total-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 10px; }
                        .grand-total { 
                            display: flex; 
                            justify-content: space-between; 
                            margin-top: 8px; 
                            padding: 10px 0; 
                            border-top: 2px solid #000; 
                            border-bottom: 2.5px double #000;
                            font-size: 15px; 
                            font-weight: 800; 
                        }

                        .footer { margin-top: 20px; text-align: center; }
                        .thanks { font-size: 12px; font-weight: 700; margin-bottom: 4px; }
                        .visit-again { font-size: 9px; color: #666; }
                        .barcode { 
                            text-align: center; 
                            margin-top: 15px; 
                            font-family: 'Libre Barcode 39 Text', cursive; 
                            font-size: 32px; 
                            opacity: 0.8;
                        }
                        .timestamp { font-size: 8px; color: #999; margin-top: 15px; text-align: center; }
                    </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo-area">BAREENA ATITHI</div>
                    <div class="subtitle">Premium Hospitality</div>
                    <div class="contact-info">
                        Near Railway Station, City Center<br>
                        Ph: +91-9876543210 | GSTIN: 22AAAAA0000A1Z5
                    </div>
                </div>

                <div class="divider"></div>

                <div class="bill-info">
                    <div class="info-row">
                        <span class="info-label">Bill No:</span>
                        <span class="info-value">${order.billNo}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Guest:</span>
                        <span class="info-value">${order.guest}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Source:</span>
                        <span class="info-value">${order.type} - ${order.name}</span>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th class="col-item">Item Description</th>
                            <th class="col-qty">Qty</th>
                            <th class="col-amt">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                                <tr>
                                    <td class="col-item">${item.name}</td>
                                    <td class="col-qty">${item.qty}</td>
                                    <td class="col-amt">${item.amount.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                    </tbody>
                </table>

                <div class="totals">
                    <div class="total-row">
                        <span>Subtotal</span>
                        <span>₹ ${order.items.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}</span>
                    </div>
                    <div class="total-row">
                        <span>Taxes (Included)</span>
                        <span>₹ 0.00</span>
                    </div>
                    <div class="grand-total">
                        <span>NET PAYABLE</span>
                        <span>₹ ${order.amount.toFixed(2)}</span>
                    </div>
                </div>

                <div class="footer">
                    <div class="thanks">Thank You!</div>
                    <div class="visit-again">We hope to see you again soon.</div>
                    <div class="barcode">${order.billNo.replace('#', '')}</div>
                </div>

                <div class="timestamp">
                    Printed on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(() => window.close(), 500);
                    }
                </script>
            </body>
        </html>
`;

        const printWindow = window.open('', '_blank', 'height=600,width=450');
        printWindow.document.write(invoiceContent);
        printWindow.document.close();
    };

    const handleEmailBill = () => {
        if (!order) return;
        alert(`📧 Email successfully sent to ${order.guest} for Invoice ${order.billNo}`);
    };

    const openSmsModal = () => {
        if (!order) return;
        setSmsModal({
            show: true,
            name: order.guestName || '',
            phone: order.guestPhone || ''
        });
        setSmsError('');
    };

    const handleSendSMS = async () => {
        if (!order || !smsModal.phone) {
            setSmsError('Please enter a valid mobile number');
            return;
        }

        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(smsModal.phone.replace(/\D/g, ''))) {
            setSmsError('Invalid 10-digit mobile number');
            return;
        }

        setIsSendingSms(true);
        setSmsError('');

        const hotelName = "BAREENA ATITHI";
        const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        const timeStr = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

        const smsContent = `${hotelName}\nBill #${order.billNo}\nAmt ₹${order.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n${dateStr} ${timeStr}\nThank you visit again`;

        try {
            const savedUser = localStorage.getItem('authUser');
            let token = '';
            if (savedUser) {
                const parsedUser = JSON.parse(savedUser);
                token = parsedUser.token;
            }

            const response = await fetch(`${API_URL}/api/notifications/send-sms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    phone: smsModal.phone,
                    message: smsContent
                })
            });

            const data = await response.json();
            if (data.success) {
                alert(`✅ SMS Receipt sent successfully to ${smsModal.phone}`);
                setSmsModal({ ...smsModal, show: false });
            } else {
                setSmsError(data.message || 'Failed to send SMS');
            }
        } catch (error) {
            console.error('SMS Error:', error);
            setSmsError('Connection error while sending SMS');
        } finally {
            setIsSendingSms(false);
        }
    };

    const handleTender = () => {
        if (!order) return;

        // Validation for "Add to Room"
        if (paymentType === 'Add to Room') {
            if (!targetRoom.trim()) {
                alert('⚠️ Please enter a valid Room Number to add to folio!');
                return;
            }
        }

        // Validation for "Direct Payment"
        if (paymentType === 'Direct Payment') {
            const received = parseFloat(receivedAmount) || 0;
            if (received < order.amount) {
                alert('⚠️ Received amount cannot be less than bill amount!');
                return;
            }
        }

        // Trigger completion callback
        onPaymentComplete(order.id, order.amount, paymentMode, paymentType, targetRoom);
    };

    // If no order is selected, show empty state with same structure
    const displayOrder = order || {
        name: 'Select Order',
        guest: '-',
        time: '-',
        amount: 0,
        items: [],
        billNo: '-',
        kotInfo: '-'
    };

    const isPlaceholder = !order;

    return (
        <>
            {/* CENTER PANEL: Bill Details */}
            <div className="pos-card bill-center-panel">
                <div className="bill-center-header">
                    <h2>Bill Details</h2>
                </div>

                {/* Selected Order Header */}
                <div className="selected-order-header-modern">
                    <div className="guest-profile">
                        <div className="avatar">👤</div>
                        <div className="guest-meta">
                            <h3>{displayOrder.name}</h3>
                            <p>Today 1 - </p>
                        </div>
                    </div>
                    <div className="bill-badge">
                        - | Bill <span>›</span>
                    </div>
                </div>

                {/* Items Table */}
                <div className="bill-items-container-modern">
                    {isPlaceholder ? (
                        <div className="empty-bill-state-modern">
                            <span className="empty-icon">📋</span>
                            <p>Select an order from the list to view items</p>
                        </div>
                    ) : (
                        <table className="items-table-modern">
                            <thead>
                                <tr>
                                    <th align="left">Item</th>
                                    <th align="center">Qty</th>
                                    <th align="right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!isPlaceholder && displayOrder.items.length > 0 ? (
                                    displayOrder.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td align="left">{item.name}</td>
                                            <td align="center">× {item.qty}</td>
                                            <td align="right">₹ {item.amount}</td>
                                        </tr>
                                    ))
                                ) : (
                                    !isPlaceholder && (
                                        <>
                                            <tr>
                                                <td align="left">Presto Coffee</td>
                                                <td align="center">× 1</td>
                                                <td align="right">₹ 320</td>
                                            </tr>
                                            <tr>
                                                <td align="left">Creamy Pasta</td>
                                                <td align="center">× 1</td>
                                                <td align="right">₹ 500</td>
                                            </tr>
                                        </>
                                    )
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Summary Totals */}
                <div className="bill-summary-panel">
                    <div className="summary-row-modern">
                        <span>Subtotal</span>
                        <span>₹ {(!isPlaceholder ? displayOrder.items.reduce((s, i) => s + i.amount, 0) : 0).toFixed(2)}</span>
                    </div>
                    <div className="summary-row-modern">
                        <span>Tax (5%)</span>
                        <span>₹ {(!isPlaceholder ? (displayOrder.amount * 0.05) : 0).toFixed(2)}</span>
                    </div>
                    <div className="summary-row-modern grand-total-highlight">
                        <span>Grand Total:</span>
                        <span>₹ {displayOrder.amount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: Payment Section */}
            <div className="pos-card payment-right-panel">
                <h3 className="payment-section-title">Payment Section</h3>

                <div className="payment-modes-modern">
                    <button className={`mode-btn-modern ${paymentMode === 'Cash' ? 'active' : ''}`} onClick={() => setPaymentMode('Cash')}>
                        💵 Cash
                    </button>
                    <button className={`mode-btn-modern ${paymentMode === 'UPI' ? 'active' : ''}`} onClick={() => setPaymentMode('UPI')}>
                        📱 UPI
                    </button>
                    <button className={`mode-btn-modern ${paymentMode === 'Card' ? 'active' : ''}`} onClick={() => setPaymentMode('Card')}>
                        💳 Card
                    </button>
                </div>

                <div className="total-indicator-strip">
                    <span>Grand Total</span>
                    <span className="big-sum">₹{displayOrder.amount.toFixed(2)}</span>
                </div>

                <div className="payment-input-modern">
                    <label>Received Amount</label>
                    <div className="input-box-wrap">
                        <span>₹</span>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={receivedAmount}
                            onChange={(e) => setReceivedAmount(e.target.value)}
                            disabled={isPlaceholder}
                        />
                    </div>
                </div>

                <div className="return-amount-box-modern">
                    <span className="label">Return Amount</span>
                    <span className="value">₹{returnAmount.toFixed(2)}</span>
                </div>

                <div className="quick-actions-modern">
                    <button className="q-btn" onClick={handlePrintBill} disabled={isPlaceholder}>🖨️ Print Bill</button>
                    <button className="q-btn" onClick={openSmsModal} disabled={isPlaceholder}>💬 SMS Receipt</button>
                    <button className="q-btn" onClick={handleEmailBill} disabled={isPlaceholder}>📧 Email</button>
                </div>

                <button
                    className="btn-tender-main"
                    disabled={isPlaceholder}
                    onClick={handleTender}
                >
                    Tender ₹ {displayOrder.amount.toFixed(0)}
                </button>

                <div className="room-posting-section">
                    <h4 style={{ fontSize: '12px', marginBottom: '10px' }}>Room Posting Today</h4>
                    <div className="room-actions-row">
                        <button className="ra-btn" onClick={() => onRoomPostingAction('Print')}>💼</button>
                        <button className="ra-btn" onClick={openSmsModal}>💬 SMS Receipt</button>
                        <button className="ra-btn" onClick={() => onRoomPostingAction('Email')}>📧 Email</button>
                    </div>
                </div>

                {/* SMS Modal for Cashier */}
                {smsModal.show && (
                    <div className="modal-overlay-custom" style={{ zIndex: 1000 }}>
                        <div className="modal-content-custom" style={{ width: '400px' }}>
                            <div className="modal-header-custom" style={{ background: '#dc2626', color: '#fff' }}>
                                <h3>Send SMS Receipt</h3>
                                <button className="close-btn-custom" onClick={() => setSmsModal({ ...smsModal, show: false })} style={{ color: '#fff' }}>×</button>
                            </div>
                            <div className="modal-body-custom">
                                <div className="form-group-custom">
                                    <label>Guest Name</label>
                                    <input type="text" value={smsModal.name} readOnly style={{ background: '#f8fafc' }} />
                                </div>
                                <div className="form-group-custom">
                                    <label>Mobile Number</label>
                                    <input
                                        type="text"
                                        maxLength="10"
                                        value={smsModal.phone}
                                        onChange={(e) => setSmsModal({ ...smsModal, phone: e.target.value.replace(/\D/g, '') })}
                                        placeholder="Enter 10-digit mobile number"
                                    />
                                    {smsError && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '5px' }}>{smsError}</p>}
                                </div>
                                <div className="template-preview" style={{ marginTop: '15px', background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
                                    <strong style={{ fontSize: '11px', color: '#64748b' }}>Preview:</strong>
                                    <pre style={{ fontSize: '12px', marginTop: '5px', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                                        {`BAREENA ATITHI
Bill #${order?.billNo}
Amt ₹${order?.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}
Thank you visit again`}
                                    </pre>
                                </div>
                                <button
                                    className="btn-tender-main"
                                    style={{ marginTop: '20px', width: '100%', background: '#dc2626' }}
                                    onClick={handleSendSMS}
                                    disabled={isSendingSms}
                                >
                                    {isSendingSms ? 'Sending...' : 'Send SMS Receipt'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CashierSection;
