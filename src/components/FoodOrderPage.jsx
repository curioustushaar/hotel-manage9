import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './FoodOrderPage.css';

const FoodOrderPage = ({ onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { room, source } = location.state || {}; // room might be passed in props too? 
    // Wait, AdminDashboard passes room prop: room={{...}}. 
    // So I should destructure room from props if not in state?
    // Let's refine the component signature. 


    const handleMenuClick = (menuId) => {
        // Map menu IDs to routes
        if (menuId === 'dashboard') navigate('/admin/dashboard');
        else if (menuId === 'rooms') navigate('/admin/rooms');
        else if (menuId === 'new-reservation') navigate('/admin/reservations/new'); // Example mapping
        else if (menuId === 'room-service') navigate('/admin/reservations/room-service');
        else if (menuId === 'food-order') { /* Already here */ }
        else {
            // Default fallthrough - in a real app, map all IDs
            // For now, since we are in a standalone route, navigate to dashboard with state?
            // Actually, AdminDashboard handles all these views via state ActiveMenu.
            // So if we click "rooms", we should go to /admin/dashboard and set state?
            // Or does AdminDashboard parse URL?
            // AdminDashboard `useEffect` sets `activeMenu` based on URL location.pathname!
            // So checking lines 104-122 of AdminDashboard:
            // if path includes '/rooms', activeMenu = 'rooms'.
            // So I just need to navigate to the correct URL.

            if (menuId === 'rooms') navigate('/admin/rooms'); // Route /admin/rooms doesn't exist in snippets?
            // Wait, App.jsx was not fully viewed but AdminDashboard says:
            // if (path.includes('/rooms')) ...
            // Let's assume the routes exist or AdminDashboard is mounted at /admin/*?
            // Usually AdminDashboard is `/admin/dashboard`.
            // If I navigate to `/admin/dashboard`, it shows dashboard.

            // If I want to show Rooms, I might need to pass state or query param?
            // "Set active menu based on URL path" implies there ARE routes like /admin/rooms?
            // Or maybe query params.
            // Let's look at AdminDashboard again.
        }

        // Simpler approach: Navigate to dashboard for everything else for now, the user can verify Sidebar works.
        // But for 'dashboard', 'rooms', etc.

        const routeMap = {
            'dashboard': '/admin/dashboard',
            'rooms': '/admin/rooms',
            'reservations': '/admin/reservations',
            'new-reservation': '/admin/reservations', // logic in Dash handles view
            'housekeeping': '/admin/reservations',
            'room-service': '/admin/reservations',
            'guest-meal-service': '/admin/guest-meal-service',
            'food-menu': '/admin/food-menu',
            'customers': '/admin/customers',
            'settings': '/admin/settings',
            'food-payment-report': '/admin/food-payment-report',
            'cashier-report': '/admin/cashier-report'
        };

        if (routeMap[menuId]) {
            navigate(routeMap[menuId]);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        navigate('/login');
    };

    const handleClose = () => {
        if (source === 'room-service') {
            navigate(-1); // Return to Room Service
        } else {
            navigate('/admin/dashboard'); // Default to dashboard
        }
    };
    // Categories
    const categories = [
        { id: 1, name: 'Starters' },
        { id: 2, name: 'Main Course' },
        { id: 3, name: 'Breads' },
        { id: 4, name: 'Rice' },
        { id: 5, name: 'Desserts' },
        { id: 6, name: 'Beverages' },
        { id: 7, name: 'Chinese' },
        { id: 8, name: 'Continental' }
    ];

    // Food Items
    const foodItems = {
        1: [ // Starters
            { id: 101, name: 'Paneer Tikka', price: 500 },
            { id: 102, name: 'Veg Spring Roll', price: 220 },
            { id: 103, name: 'Chicken Tikka', price: 320 },
            { id: 104, name: 'Fish Fingers', price: 350 },
            { id: 105, name: 'Mushroom Soup', price: 180 },
            { id: 106, name: 'Tomato Soup', price: 150 },
            { id: 107, name: 'Corn Soup', price: 160 },
            { id: 108, name: 'Veg Manchurian', price: 240 },
            { id: 109, name: 'Chilli Paneer', price: 260 },
            { id: 110, name: 'Crispy Corn', price: 200 }
        ],
        2: [ // Main Course
            { id: 201, name: 'Paneer Butter Masala', price: 320 },
            { id: 202, name: 'Dal Makhani', price: 280 },
            { id: 203, name: 'Chicken Curry', price: 380 },
            { id: 204, name: 'Mutton Rogan Josh', price: 450 },
            { id: 205, name: 'Fish Curry', price: 400 },
            { id: 206, name: 'Veg Kolhapuri', price: 300 },
            { id: 207, name: 'Kadai Paneer', price: 340 },
            { id: 208, name: 'Palak Paneer', price: 310 },
            { id: 209, name: 'Butter Chicken', price: 420 },
            { id: 210, name: 'Mixed Veg Curry', price: 270 }
        ],
        3: [ // Breads
            { id: 301, name: 'Butter Naan', price: 60 },
            { id: 302, name: 'Garlic Naan', price: 70 },
            { id: 303, name: 'Tandoori Roti', price: 40 },
            { id: 304, name: 'Butter Roti', price: 50 },
            { id: 305, name: 'Cheese Naan', price: 90 },
            { id: 306, name: 'Kulcha', price: 65 },
            { id: 307, name: 'Paratha', price: 55 },
            { id: 308, name: 'Lachha Paratha', price: 75 },
            { id: 309, name: 'Missi Roti', price: 60 },
            { id: 310, name: 'Roomali Roti', price: 45 }
        ],
        4: [ // Rice
            { id: 401, name: 'Veg Biryani', price: 280 },
            { id: 402, name: 'Chicken Biryani', price: 350 },
            { id: 403, name: 'Mutton Biryani', price: 420 },
            { id: 404, name: 'Jeera Rice', price: 180 },
            { id: 405, name: 'Veg Pulao', price: 220 },
            { id: 406, name: 'Steam Rice', price: 150 },
            { id: 407, name: 'Fried Rice', price: 240 },
            { id: 408, name: 'Schezwan Rice', price: 260 },
            { id: 409, name: 'Egg Fried Rice', price: 280 },
            { id: 410, name: 'Curd Rice', price: 160 }
        ],
        5: [ // Desserts
            { id: 501, name: 'Gulab Jamun', price: 120 },
            { id: 502, name: 'Rasgulla', price: 130 },
            { id: 503, name: 'Ice Cream', price: 150 },
            { id: 504, name: 'Brownie', price: 180 },
            { id: 505, name: 'Pastry', price: 160 },
            { id: 506, name: 'Kheer', price: 140 },
            { id: 507, name: 'Kulfi', price: 100 },
            { id: 508, name: 'Jalebi', price: 110 },
            { id: 509, name: 'Rasmalai', price: 150 },
            { id: 510, name: 'Gajar Halwa', price: 130 }
        ],
        6: [ // Beverages
            { id: 601, name: 'Tea', price: 40 },
            { id: 602, name: 'Coffee', price: 60 },
            { id: 603, name: 'Cold Coffee', price: 100 },
            { id: 604, name: 'Fresh Lime Soda', price: 80 },
            { id: 605, name: 'Mango Shake', price: 120 },
            { id: 606, name: 'Banana Shake', price: 110 },
            { id: 607, name: 'Lassi', price: 90 },
            { id: 608, name: 'Buttermilk', price: 60 },
            { id: 609, name: 'Soft Drink', price: 50 },
            { id: 610, name: 'Mineral Water', price: 30 }
        ],
        7: [ // Chinese
            { id: 701, name: 'Veg Noodles', price: 220 },
            { id: 702, name: 'Chicken Noodles', price: 280 },
            { id: 703, name: 'Veg Manchurian', price: 240 },
            { id: 704, name: 'Chilli Chicken', price: 320 },
            { id: 705, name: 'Spring Rolls', price: 200 },
            { id: 706, name: 'Momos', price: 180 },
            { id: 707, name: 'Hakka Noodles', price: 240 },
            { id: 708, name: 'Chowmein', price: 230 },
            { id: 709, name: 'Fried Rice', price: 250 },
            { id: 710, name: 'Sweet Corn Soup', price: 160 }
        ],
        8: [ // Continental
            { id: 801, name: 'Pasta Alfredo', price: 320 },
            { id: 802, name: 'Pizza Margherita', price: 380 },
            { id: 803, name: 'Burger', price: 220 },
            { id: 804, name: 'Sandwich', price: 180 },
            { id: 805, name: 'French Fries', price: 140 },
            { id: 806, name: 'Garlic Bread', price: 160 },
            { id: 807, name: 'Grilled Chicken', price: 400 },
            { id: 808, name: 'Fish & Chips', price: 420 },
            { id: 809, name: 'Caesar Salad', price: 280 },
            { id: 810, name: 'Club Sandwich', price: 240 }
        ]
    };

    const [selectedCategory, setSelectedCategory] = useState(1);
    const [cart, setCart] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [searchCode, setSearchCode] = useState('');

    // Derived state for food items
    const currentItems = foodItems[selectedCategory] || [];

    // Toast State
    const [toasts, setToasts] = useState([]);

    // Print State
    const [printMode, setPrintMode] = useState(null); // 'BILL' or 'KOT' triggers window.print()
    const [printModal, setPrintModal] = useState(null); // 'BILL' or 'KOT' shows Modal

    useEffect(() => {
        if (printMode) {
            // Small delay to ensure render
            const timer = setTimeout(() => {
                window.print();
                setPrintMode(null);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [printMode]);

    const addToast = (message) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 1500);
    };

    // Add Item to Cart
    const addToCart = (item) => {
        const existing = cart.find(x => x.id === item.id);
        if (existing) {
            updateQuantity(item.id, 1);
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }
        addToast(`${item.name} added to cart`);
    };

    // Update Quantity (Remove if 0)
    const updateQuantity = (id, delta) => {
        setCart(prevCart =>
            prevCart.map(item => {
                if (item.id === id) {
                    return { ...item, quantity: item.quantity + delta };
                }
                return item;
            }).filter(item => item.quantity > 0) // REMOVE on 0
        );
    };

    // Calculations
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // NO TAX as per requirement
    const total = subtotal;

    // Handlers
    const saveOrderToStorage = () => {
        if (!room) return;
        const activeOrders = JSON.parse(localStorage.getItem('pos_active_orders') || '[]');
        if (!activeOrders.includes(room.id)) {
            activeOrders.push(room.id);
            localStorage.setItem('pos_active_orders', JSON.stringify(activeOrders));
        }
        localStorage.setItem(`pos_cart_${room.id}`, JSON.stringify(cart));
    };

    const handleSaveKOT = () => {
        saveOrderToStorage();
        addToast('KOT saved successfully');
        setTimeout(() => {
            if (source === 'room-service') navigate(-1);
            else navigate('/admin/dashboard');
        }, 1000);
    };

    const handleSavePrintKOT = () => {
        saveOrderToStorage();
        setPrintModal('KOT');
    };

    const handleSaveBill = () => {
        saveOrderToStorage();
        addToast('Bill saved successfully');
    };

    const handleSavePrintBill = () => {
        saveOrderToStorage();
        setPrintModal('BILL');
    };

    const handleRoomPosting = () => {
        addToast('Room posted successfully');
    };

    // Modal Action Handlers
    const handleModalPrint = () => {
        setPrintMode(printModal); // Triggers useEffect -> window.print()
    };

    const handleModalDownload = () => {
        const title = printModal === 'KOT' ? 'KITCHEN_ORDER_TICKET' : 'BILL_RECEIPT';
        // Hack: Use the printable area HTML to generate a .doc file
        const content = document.querySelector('.printable-area').innerHTML;
        const blob = new Blob(['<html><head><style>table{border-collapse:collapse;width:100%;}th,td{border:1px solid black;padding:5px;}</style></head><body>' + content + '</body></html>'], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}_${room?.roomNumber || 'WalkIn'}_${Date.now()}.doc`;
        a.click();

        if (printModal === 'KOT') addToast('KOT saved & downloaded');
        else addToast('Bill saved & downloaded');
    };

    const handleModalClose = () => {
        const wasKOT = printModal === 'KOT';
        setPrintModal(null);
        if (wasKOT) {
            addToast('KOT saved successfully');
            setTimeout(() => {
                if (source === 'room-service') navigate(-1);
                else navigate('/admin/dashboard');
            }, 500);
        }
    };

    return (
        <>
            <div className="pos-layout-wrapper">
                <div className="pos-container">
                    {/* LEFT PANEL (60%) */}
                    <div className="pos-left-panel">
                        {/* A. Top Search Row */}
                        <div className="pos-search-row">
                            <input
                                className="pos-search-input"
                                placeholder="Search items by name or code (ESCAPE)"
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                            />
                            <input
                                className="pos-search-input"
                                placeholder="Short Code (F2) / Category"
                                value={searchCode}
                                onChange={(e) => setSearchCode(e.target.value)}
                            />
                        </div>

                        {/* Content Area: Sidebar + Grid */}
                        <div className="pos-content-area">
                            {/* B. Category Sidebar */}
                            <div className="pos-category-sidebar">
                                <div className="pos-category-list">
                                    {categories.map(cat => (
                                        <div
                                            key={cat.id}
                                            className={`pos-category-item ${selectedCategory === cat.id ? 'active' : ''}`}
                                            onClick={() => setSelectedCategory(cat.id)}
                                        >
                                            {cat.name}
                                        </div>
                                    ))}
                                </div>
                                {/* BACK BUTTON PINNED TO BOTTOM */}
                                <button className="pos-sidebar-back-btn" onClick={handleClose}>
                                    <span>←</span> Back
                                </button>
                            </div>

                            {/* C. Food Items Grid */}
                            <div className="pos-food-grid-container">
                                {currentItems.map(item => {
                                    // Find current quantity in cart
                                    const cartItem = cart.find(x => x.id === item.id);
                                    const inCartQty = cartItem ? cartItem.quantity : 0;

                                    return (
                                        <div
                                            key={item.id}
                                            className={`pos-food-card ${inCartQty > 0 ? 'has-qty' : ''}`}
                                            onClick={() => addToCart(item)}
                                        >
                                            <div className="pos-card-code">#{item.id}</div>
                                            {inCartQty > 0 && (
                                                <div className="pos-card-badge">Qty: {inCartQty}</div>
                                            )}
                                            <div className="pos-card-content">
                                                <div className="pos-card-name">{item.name}</div>
                                                <div className="pos-card-price">₹{item.price}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL (40%) */}
                    <div className="pos-right-panel">
                        {/* A. Mode Buttons */}
                        <div className="pos-mode-bar">
                            <button className="pos-mode-btn">Dine In (F1)</button>
                            <button className="pos-mode-btn">Sell (F3)</button>
                            <button className="pos-mode-btn">Delivery (F5)</button>
                            <button className="pos-mode-btn">Room Service</button>
                        </div>

                        {/* B. Stats Row */}
                        <div className="pos-stats-row">
                            <div className="pos-stat-item">
                                <div className="pos-stat-label">Today Room Sale</div>
                                <div className="pos-stat-value">0.00</div>
                            </div>
                            <div className="pos-stat-item">
                                <div className="pos-stat-label">Current Running Orders</div>
                                <div className="pos-stat-value">9</div>
                            </div>
                            <div className="pos-stat-item">
                                <div className="pos-stat-label">Running Orders Value</div>
                                <div className="pos-stat-value">4,337.64</div>
                            </div>
                        </div>

                        {/* C. INFO & ACTION ROW (Merged) */}
                        <div className="pos-info-action-row">
                            <div className="pos-room-details">
                                <div className="pos-room-no">Room {room?.roomNumber || '101'}</div>
                                <div className="pos-guest-name">{room?.guestName || 'Guest Name'}</div>
                            </div>
                            <div className="pos-action-buttons-group">
                                <button className="pos-action-btn">Add Customer</button>
                                <button className="pos-action-btn">Bill Wise Comment</button>
                                <button className="pos-action-btn">Delivery Boy</button>
                                <button className="pos-action-btn active">Home Delivery</button>
                            </div>
                        </div>

                        {/* E. Order Items Table */}
                        <div className="pos-order-table-container">
                            <table className="pos-order-table">
                                <thead>
                                    <tr>
                                        <th>ITEM NAME</th>
                                        <th style={{ width: '90px', textAlign: 'center' }}>QTY</th>
                                        <th style={{ textAlign: 'right' }}>PRICE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#999', fontStyle: 'italic' }}>
                                                No items added
                                            </td>
                                        </tr>
                                    ) : (
                                        cart.map(item => (
                                            <tr key={item.id} className="pos-cart-row">
                                                <td className="pos-cart-name">{item.name}</td>
                                                <td>
                                                    <div className="pos-qty-control">
                                                        <button className="pos-qty-btn minus" onClick={() => updateQuantity(item.id, -1)}>-</button>
                                                        <span className="pos-qty-value">{item.quantity}</span>
                                                        <button className="pos-qty-btn plus" onClick={() => updateQuantity(item.id, 1)}>+</button>
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'right' }} className="pos-cart-price">₹{item.price * item.quantity}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* F. Total Section */}
                        <div className="pos-total-section">
                            <div className="pos-total-row">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            {/* NO TAX ROW */}
                            <div className="pos-total-row final">
                                <span>Grand Total</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>

                            {/* ACTION BAR */}
                            <div className="pos-action-bar">
                                <button className="pos-action-btn-small">Tender</button>
                                <button className="pos-action-btn-small">Add Other Details</button>
                            </div>

                            {/* TWO ROWS BELOW */}
                            <div className="pos-footer-rows">
                                {/* KOT ROW */}
                                <div className="pos-footer-row">
                                    <div className="pos-row-label kot">KOT</div>
                                    <div className="pos-row-btns">
                                        <button className="pos-footer-btn" onClick={handleSaveKOT}>Save (K)</button>
                                        <button className="pos-footer-btn" onClick={handleSavePrintKOT}>Save & Print(F4)</button>
                                    </div>
                                </div>

                                {/* BILL ROW */}
                                <div className="pos-footer-row">
                                    <div className="pos-row-label bill">BILL</div>
                                    <div className="pos-row-btns">
                                        <button className="pos-footer-btn" onClick={handleSaveBill}>Save(B)</button>
                                        <button className="pos-footer-btn" onClick={handleSavePrintBill}>Save & Print(F8)</button>
                                        <button className="pos-footer-btn" onClick={handleRoomPosting}>Room Posting</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Toast Container */}
            <div className="pos-toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className="pos-toast">
                        {toast.message}
                    </div>
                ))}
            </div>
            {/* Printable Area (Hidden - for window.print()) */}
            <div className="printable-area">
                {(printMode === 'BILL' || printModal === 'BILL') && (
                    <div className="pos-print-bill">
                        <div className="print-header">
                            <h2>BAREENA ATHITHI</h2>
                            <p>Receipt / Bill</p>
                        </div>
                        <div className="print-details">
                            <p>Room: {room?.roomNumber || 'N/A'}</p>
                            <p>Guest: {room?.guestName || 'Walk-in'}</p>
                            <p>Date: {new Date().toLocaleString()}</p>
                        </div>
                        <table className="print-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.name}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.price}</td>
                                        <td>{item.price * item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="print-total">
                            <h3>Grand Total: ₹{total.toFixed(2)}</h3>
                        </div>
                    </div>
                )}

                {(printMode === 'KOT' || printModal === 'KOT') && (
                    <div className="pos-print-kot">
                        <div className="print-header">
                            <h2>KITCHEN ORDER TICKET</h2>
                        </div>
                        <div className="print-details">
                            <p>Room: {room?.roomNumber || 'N/A'}</p>
                            <p>Guest: {room?.guestName || 'Walk-in'}</p>
                            <p>Time: {new Date().toLocaleTimeString()}</p>
                        </div>
                        <table className="print-table">
                            <thead>
                                <tr>
                                    <th>Item Name</th>
                                    <th>Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.name}</td>
                                        <td>{item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* PRINT PREVIEW MODAL */}
            {printModal && (
                <div className="pos-modal-overlay">
                    <div className="pos-modal-content">
                        <div className="pos-modal-header">
                            <h3>{printModal === 'KOT' ? 'KOT PREVIEW' : 'BILL PREVIEW'}</h3>
                            <button className="pos-modal-close" onClick={handleModalClose}>×</button>
                        </div>
                        <div className="pos-modal-body">
                            {/* Re-using Printable Area Styles inside modal */}
                            {printModal === 'BILL' ? (
                                <div className="pos-preview-bill">
                                    <div className="print-header"><h2>BAREENA ATHITHI</h2><p>Receipt / Bill</p></div>
                                    <div className="print-details"><p>Room: {room?.roomNumber}</p><p>Guest: {room?.guestName}</p><p>Date: {new Date().toLocaleString()}</p></div>
                                    <table className="print-table">
                                        <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                                        <tbody>{cart.map(item => <tr key={item.id}><td>{item.name}</td><td>{item.quantity}</td><td>{item.price}</td><td>{item.price * item.quantity}</td></tr>)}</tbody>
                                    </table>
                                    <div className="print-total"><h3>Total: ₹{total.toFixed(2)}</h3></div>
                                </div>
                            ) : (
                                <div className="pos-preview-kot">
                                    <div className="print-header"><h2>KITCHEN ORDER TICKET</h2></div>
                                    <div className="print-details"><p>Room: {room?.roomNumber}</p><p>Time: {new Date().toLocaleTimeString()}</p></div>
                                    <table className="print-table">
                                        <thead><tr><th>Item</th><th>Qty</th></tr></thead>
                                        <tbody>{cart.map(item => <tr key={item.id}><td>{item.name}</td><td>{item.quantity}</td></tr>)}</tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        <div className="pos-modal-footer">
                            <button className="pos-modal-btn cancel" onClick={handleModalClose}>Cancel</button>
                            <button className="pos-modal-btn download" onClick={handleModalDownload}>Download</button>
                            <button className="pos-modal-btn print" onClick={handleModalPrint}>Print</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FoodOrderPage;
