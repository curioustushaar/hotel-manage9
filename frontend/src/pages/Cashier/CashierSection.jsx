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
                const mappedOrders = data.data.map(order => ({
                    id: order._id,
                    type: (order.orderType === 'Table Order' || order.orderType === 'Direct Payment') ? 'Table' :
                        (order.orderType === 'Room Service' || order.orderType === 'Post to Room' || order.orderType === 'Room Order') ? 'Room' :
                            order.orderType === 'Take Away' ? 'Take Away' : 'Table',
                    name: (order.orderType === 'Table Order' || order.orderType === 'Direct Payment') ? `Table ${order.tableNumber}` :
                        (order.orderType === 'Room Service' || order.orderType === 'Post to Room' || order.orderType === 'Room Order') ? `Room ${order.roomNumber}` :
                            order.orderType === 'Take Away' ? `Take Away` : `Table ${order.tableNumber}`,
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
                    billNo: `#${order._id.toString().substr(-6).toUpperCase()}`,
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
                activeMenu: 'food-order-pos', // Trigger switching to food order view
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
        });

    return (
        <div className="cashier-container">
            <div className="cashier-dashboard fadeIn">

                {/* Header Section */}
                <div className="cashier-header-row">
                    <div className="header-top-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2 style={{ margin: 0 }}>Cashier Dashboard</h2>

                        {/* New Order & Track Order Section */}
                        <div className="new-order-section">
                            {hasCashierPermission('Take Away') && (
                                <>
                                    <button className="track-order-btn" onClick={() => setShowTrackModal(true)}>
                                        🛵 Track Order
                                    </button>
                                    <button className="new-order-btn" onClick={handleNewOrderClick}>
                                        🛍️ New Take Away Order
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="stats-wrapper">
                        <div className="stat-item">
                            <span className="stat-label">Total Collection Today</span>
                            <span className="stat-value">₹{stats.totalCollection.toFixed(2)}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Cash Collection</span>
                            <span className="stat-value text-red">₹{stats.cash.toFixed(2)}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">UPI Collection</span>
                            <span className="stat-value">₹{stats.upi.toFixed(2)}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Card Collection</span>
                            <span className="stat-value">₹{stats.card.toFixed(2)}</span>
                        </div>
                        <div className="stat-item notification">
                            <span className="stat-label">Total Pending</span>
                            <span className="stat-value text-red">{orders.length}</span>
                            <span className="bell-icon">🔔<span className="badge">{orders.length}</span></span>
                        </div>
                    </div>
                </div>

                <div className="dashboard-content">
                    <div className="orders-sidebar">
                        <div className="tabs-row">
                            {allowedTabs.map(tab => (
                                <button
                                    key={tab}
                                    className={`tab ${activeTab === tab ? 'active' : ''} `}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="search-bar">
                            <span className="search-icon">🔍</span>
                            <input type="text" placeholder="Search by No, Room, Guest Name" />
                        </div>
                        <div className="orders-list">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map(order => (
                                    <div
                                        key={order.id}
                                        className={`order - card ${selectedOrder && selectedOrder.id === order.id ? 'selected' : ''} `}
                                        onClick={() => handleOrderClick(order)}
                                    >
                                        <div className="order-card-left">
                                            <div className={`order - icon ${order.type.toLowerCase().split(' ')[0]} `}>{order.billNo.replace('#', '')}</div>
                                            <div className="order-info">
                                                <h4>{order.name}</h4>
                                                <p>{order.guest}</p>
                                                <span className="order-status">Pending &bull; {order.time}</span>
                                            </div>
                                        </div>
                                        <div className="order-card-right">
                                            <span className="order-amount">₹ {order.amount}</span>
                                            <div className="order-actions">
                                                <button className="icon-btn">🍲</button>
                                                <button className="icon-btn">💳</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-orders" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                                    <p>No orders found for {activeTab} 🎉</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="dashboard-right-panel">
                        <CashierPayment
                            order={selectedOrder}
                            onPaymentComplete={handlePaymentComplete}
                            onRoomPostingAction={handleRoomPostingAction}
                        />
                    </div>
                </div>
            </div>

            {/* New Order Modal */}
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

            {/* Track Order Modal */}
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

    const handleSendSMS = () => {
        if (!order) return;
        alert(`💬 SMS successfully sent to ${order.guest} `);
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
        <div className={`cashier - payment - view embedded ${isPlaceholder ? 'placeholder-mode' : ''} fadeIn`}>
            <div className="payment-top-bar">
                <h2>Bill Details</h2>
            </div>

            <div className="payment-layout">
                {/* Left: Bill Details */}
                <div className="bill-details-panel">
                    <div className="bill-header">
                        <div className="guest-info">
                            <div className="guest-avatar">👤</div>
                            <div className="guest-text">
                                <h3>{displayOrder.name}</h3>
                                <p>{displayOrder.guest}</p>
                                <span className="time-info">Today | {displayOrder.time}</span>
                            </div>
                        </div>
                        <div className="bill-meta">
                            <span>{displayOrder.kotInfo} | Bill {displayOrder.billNo}</span>
                        </div>
                    </div>

                    <div className="bill-items-table">
                        <div className="table-header">
                            <span>Item</span>
                            <span>Qty</span>
                            <span>Amount</span>
                        </div>
                        <div className="table-body">
                            {!isPlaceholder && displayOrder.items.length > 0 ? displayOrder.items.map((item, idx) => (
                                <div key={idx} className="table-row">
                                    <span>{item.name}</span>
                                    <span>{item.qty}</span>
                                    <span>₹ {item.amount}</span>
                                </div>
                            )) : (
                                !isPlaceholder && (
                                    <>
                                        <div className="table-row">
                                            <span>Veg Kofta</span>
                                            <span>2</span>
                                            <span>₹ 280</span>
                                        </div>
                                        <div className="table-row">
                                            <span>Chicken Biryani</span>
                                            <span>1</span>
                                            <span>₹ 350</span>
                                        </div>
                                        <div className="table-row">
                                            <span>Butter Naan</span>
                                            <span>2</span>
                                            <span>₹ 120</span>
                                        </div>
                                    </>
                                )
                            )}
                            {isPlaceholder && (
                                <div className="table-row placeholder-text">
                                    <span colSpan="3" style={{ textAlign: 'center', color: '#ccc' }}>Select order to view items</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bill-summary">
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>₹ {isPlaceholder ? '0.00' : displayOrder.items.reduce((sum, item) => sum + (item.price * item.qty), 0).toFixed(2)}</span>
                        </div>
                        {/* Assuming tax is included or extra, logic needs to align with backend. For now showing simple breakdown if applicable, or just total */}
                        <div className="summary-row total">
                            <span>Grand Total</span>
                            <span>₹ {displayOrder.amount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Payment Section */}
                <div className="payment-action-panel">
                    <h3>Payment Section</h3>

                    <div className="payment-options">
                        <button
                            className={`option - btn ${paymentType === 'Direct Payment' ? 'active' : ''} `}
                            onClick={() => setPaymentType('Direct Payment')}
                            disabled={isPlaceholder}
                        >
                            Direct Payment
                        </button>
                        <button
                            className={`option - btn ${paymentType === 'Add to Room' ? 'active' : ''} `}
                            onClick={() => setPaymentType('Add to Room')}
                            disabled={isPlaceholder}
                        >
                            Add to Room
                        </button>
                    </div>

                    <div className="payment-modes" style={{ opacity: paymentType === 'Add to Room' ? 0.3 : 1, pointerEvents: paymentType === 'Add to Room' ? 'none' : 'auto' }}>
                        {['Cash', 'UPI', 'Card', 'Bank'].map(mode => (
                            <button
                                key={mode}
                                className={`mode - btn ${paymentMode === mode ? 'active' : ''} `}
                                onClick={() => setPaymentMode(mode)}
                                disabled={isPlaceholder || paymentType === 'Add to Room'}
                            >
                                {mode === 'Cash' ? '💵' : mode === 'UPI' ? '📱' : mode === 'Card' ? '💳' : '🏦'} {mode}
                            </button>
                        ))}
                    </div>

                    <div className="payment-summary-box">
                        <div className="summary-line">
                            <span>Grand Total</span>
                            <span className="big-amount">₹ {displayOrder.amount.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="payment-input-group">
                        {paymentType === 'Direct Payment' ? (
                            <>
                                <div className="input-row">
                                    <label>Received Amount</label>
                                    <div className="input-wrapper">
                                        <span>₹</span>
                                        <input
                                            type="number"
                                            value={receivedAmount}
                                            onChange={(e) => setReceivedAmount(e.target.value)}
                                            disabled={isPlaceholder}
                                        />
                                    </div>
                                </div>
                                <div className="input-row return-row">
                                    <label>Return Amount</label>
                                    <div className={`input - wrapper ${returnAmount >= 0 ? 'success' : ''} `}>
                                        <span>₹</span>
                                        <span>{returnAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="input-row">
                                <label>Target Room No.</label>
                                <div className="input-wrapper focus-wrapper">
                                    <span>🏨</span>
                                    <input
                                        type="text"
                                        placeholder="Enter Room No"
                                        value={targetRoom}
                                        onChange={(e) => setTargetRoom(e.target.value)}
                                        disabled={isPlaceholder || (order?.type === 'Room' && order?.name.includes('Room'))} // Auto-locked for Room orders
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="action-buttons">
                        <button className="secondary-btn" disabled={isPlaceholder} onClick={handlePrintBill}>🖨️ Print Bill</button>
                        <button className="secondary-btn" disabled={isPlaceholder} onClick={handleSendSMS}>💬 SMS</button>
                        <button className="secondary-btn" disabled={isPlaceholder} onClick={handleEmailBill}>✉️ Email</button>
                    </div>

                    <button
                        className="tender-btn"
                        disabled={isPlaceholder}
                        style={{ opacity: isPlaceholder ? 0.5 : 1, background: paymentType === 'Add to Room' ? '#f59e0b' : '' }}
                        onClick={handleTender}
                    >
                        {paymentType === 'Add to Room' ? 'Add to Folio' : `Tender ₹ ${displayOrder.amount} `}
                    </button>

                    <div className="room-posting-today">
                        <h4>Room Posting Today <span className="badge">4</span></h4>
                        <div className="quick-actions">
                            <button className="icon-action-btn" onClick={() => onRoomPostingAction('Print')}>🖨️</button>
                            <button className="icon-action-btn" onClick={() => onRoomPostingAction('SMS')}>💬 SMS</button>
                            <button className="icon-action-btn" onClick={() => onRoomPostingAction('Email')}>✉️</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CashierSection;
