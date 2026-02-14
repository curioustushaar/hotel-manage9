import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CashierSection.css';

const CashierSection = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [activeTab, setActiveTab] = useState('All');
    const [showNewOrderModal, setShowNewOrderModal] = useState(false);
    const [newOrderDetails, setNewOrderDetails] = useState({ name: '', phone: '' });

    // State for Orders
    const [orders, setOrders] = useState([]);

    // Fetch pending orders from API
    useEffect(() => {
        fetchPendingOrders();
    }, []);

    // Listen for refresh triggers (e.g. from GuestMealService 'Send')
    useEffect(() => {
        if (location.state && location.state.refresh) {
            fetchPendingOrders();
            // Clear the state so it doesn't re-trigger unnecessarily if we navigated back and forth differently?
            // Actually, react-router state persists, so it's fine to just read it.
            // Ideally we'd consume it, but for now just fetching is safe.
        }
    }, [location.state]);

    const fetchPendingOrders = async () => {
        try {
            const response = await fetch('http://localhost:5002/api/guest-meal/orders/pending');
            const data = await response.json();

            if (data.success) {
                // Map backend orders to UI format
                // Backend fields: _id, tableNumber, roomNumber, orderType, guestName, finalAmount, items
                // UI fields: id, type, name, guest, amount, status, time, items (name, qty, price, amount), billNo

                const mappedOrders = data.data.map(order => ({
                    id: order._id, // Use _id as unique key
                    type: order.orderType === 'Table Order' ? 'Table' :
                        order.orderType === 'Room Service' ? 'Room' :
                            order.orderType === 'Take Away' ? 'Take Away' : 'Table',
                    name: order.orderType === 'Room Service' ? `Room ${order.roomNumber}` : `Table ${order.tableNumber}`,
                    guest: order.guestName || 'Guest',
                    amount: order.finalAmount || 0,
                    status: 'Pending',
                    time: order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
                    items: (order.items || []).map(item => ({
                        name: item.name,
                        qty: item.quantity,
                        price: item.price,
                        amount: item.subtotal
                    })),
                    billNo: `#${order._id.substr(-6).toUpperCase()}`,
                    kotInfo: `KOT - ${order._id.substr(-4)}`
                }));

                setOrders(mappedOrders);

                // Update stats based on real data
                const totalPendingAmt = mappedOrders.reduce((sum, o) => sum + o.amount, 0);
                setStats(prev => ({
                    ...prev,
                    pending: mappedOrders.length,
                    // Note: Cash/UPI collections would typically come from a separate 'daily collection' API, keeping dummy for now or 0
                }));
            }
        } catch (error) {
            console.error("Error fetching pending orders:", error);
        }
    };

    const [stats, setStats] = useState({
        totalCollection: 8270.00,
        cash: 7000.00,
        upi: 1030.00,
        card: 240.00,
        pending: 4
    });

    const handleOrderClick = (order) => {
        setSelectedOrder(order);
    };

    const handlePaymentComplete = (orderId, amount, mode, type, roomNumber = null) => {
        // Remove processed order from pending list
        const updatedOrders = orders.filter(o => o.id !== orderId);
        setOrders(updatedOrders);
        setSelectedOrder(null);

        // Update Stats (Simulation)
        setStats(prev => ({
            ...prev,
            totalCollection: prev.totalCollection + amount,
            [mode.toLowerCase()]: (prev[mode.toLowerCase()] || 0) + amount,
            pending: Math.max(0, prev.pending - 1)
        }));

        // Different success messages based on type
        if (type === 'Add to Room') {
            alert(`✅ Successfully Added to Folio!\n\nTarget Room: ${roomNumber} \nAmount Posted: ₹${amount} `);
        } else {
            alert(`✅ Payment Processed Successfully!\n\nBill Amount: ₹${amount} \nPayment Mode: ${mode} \nStatus: Settled`);
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
                customerPhone: newOrderDetails.phone
            }
        });
    };

    // Filter Logic
    const filteredOrders = activeTab === 'All'
        ? orders
        : orders.filter(order => {
            if (activeTab === 'Dine In') return order.type === 'Table';
            if (activeTab === 'Room') return order.type === 'Room';
            if (activeTab === 'Take Away') return order.type === 'Counter';
            if (activeTab === 'Delivery') return order.type === 'Delivery';
            if (activeTab === 'Online Order') return order.type === 'Online';
            return true;
        });

    return (
        <div className="cashier-container">
            <div className="cashier-dashboard fadeIn">

                {/* Header Section */}
                <div className="cashier-header-row">
                    <div className="header-top-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2 style={{ margin: 0 }}>Cashier Dashboard</h2>

                        {/* New Order Section - Added as requested above stats */}
                        <div className="new-order-section">
                            <button className="new-order-btn" onClick={handleNewOrderClick}>
                                🛍️ New Take Away Order
                            </button>
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
                            {['All', 'Dine In', 'Room', 'Take Away', 'Delivery', 'Online Order'].map(tab => (
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
    < !DOCTYPE html >
        <html>
            <head>
                <title>Invoice #${order.billNo}</title>
                <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+39+Text&display=swap" rel="stylesheet">
                    <style>
                        @page {size: 80mm auto; margin: 0; }
                        body {
                            font - family: 'Courier New', monospace;
                        width: 76mm;
                        margin: 2mm auto;
                        background: white;
                        color: #000;
                        font-size: 12px;
                        }
                        .header {text - align: center; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 5px; }
                        .hotel-name {font - size: 16px; font-weight: bold; margin-bottom: 4px; text-transform: uppercase; }
                        .address {font - size: 10px; line-height: 1.2; }
                        .bill-info {margin: 10px 0; border-bottom: 1px dashed #000; padding-bottom: 5px; }
                        .row {display: flex; justify-content: space-between; margin-bottom: 2px; }
                        .label {font - weight: bold; }

                        table {width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                        th {text - align: left; border-bottom: 1px dashed #000; padding: 4px 0; font-size: 11px; }
                        td {padding: 4px 0; vertical-align: top; }
                        .col-qty {text - align: center; width: 15%; }
                        .col-price {text - align: right; width: 25%; }
                        .col-item {width: 60%; }

                        .totals {border - top: 1px dashed #000; padding-top: 5px; }
                        .total-row {display: flex; justify-content: space-between; margin-bottom: 3px; }
                        .grand-total {font - weight: bold; font-size: 14px; border-top: 1px dashed #000; border-bottom: 1px dashed #000; margin-top: 5px; padding: 5px 0; }

                        .footer {margin - top: 15px; text-align: center; font-size: 10px; }
                        .barcode {text - align: center; margin-top: 10px; letter-spacing: 5px; font-family: 'Libre Barcode 39 Text', cursive; font-size: 24px; }
                    </style>
            </head>
            <body>
                <div class="header">
                    <div class="hotel-name">BAREENA ATITHI</div>
                    <div class="address">Near Railway Station, City Center</div>
                    <div class="address">Ph: +91-9876543210 | GSTIN: 22AAAAA0000A1Z5</div>
                </div>

                <div class="bill-info">
                    <div class="row"><span class="label">Bill No:</span> <span>${order.billNo}</span></div>
                    <div class="row"><span class="label">Date:</span> <span>${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                    <div class="row"><span class="label">Guest:</span> <span>${order.guest}</span></div>
                    <div class="row"><span class="label">Type:</span> <span>${order.type} - ${order.name}</span></div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th class="col-item">Item</th>
                            <th class="col-qty">Qty</th>
                            <th class="col-price">Amt</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                                <tr>
                                    <td class="col-item">${item.name}</td>
                                    <td class="col-qty">${item.qty}</td>
                                    <td class="col-price">${item.amount.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                    </tbody>
                </table>

                <div class="totals">
                    <div class="total-row"><span>Subtotal</span> <span>${order.items.reduce((sum, item) => sum + (item.price * item.qty), 0).toFixed(2)}</span></div>
                    <div class="total-row"><span>CGST (2.5%)</span> <span>${(order.amount * 0.025).toFixed(2)}</span></div>
                    <div class="total-row"><span>SGST (2.5%)</span> <span>${(order.amount * 0.025).toFixed(2)}</span></div>
                    ${order.items.some(i => i.name === 'Discount') ? `<div class="total-row"><span>Discount</span> <span>-50.00</span></div>` : ''}

                    <div class="total-row grand-total">
                        <span>TOTAL</span>
                        <span>Rs. ${order.amount.toFixed(2)}</span>
                    </div>
                    <div class="total-row" style="margin-top: 5px; font-size: 11px;">
                        <span>Mode: ${paymentType === 'Add to Room' ? 'Room Folio' : paymentMode}</span>
                    </div>
                </div>

                <div class="footer">
                    <p>Thank you for dining with us!</p>
                    <p>Plz Visit Again</p>
                </div>

                <div style="text-align: center; margin-top: 10px;">
                    *** ${order.billNo} ***
                </div>

                <script>
                    window.onload = function() {window.print(); }
                </script>
            </body>
        </html>
`;

        const printWindow = window.open('', '', 'height=600,width=400');
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
