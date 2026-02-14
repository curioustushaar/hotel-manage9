import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import API_URL_CONFIG from '../config/api';
import './FoodOrderPage.css';

const FoodOrderPage = ({ onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { room, source } = location.state || {};

    const handleMenuClick = (menuId) => {
        const routeMap = {
            'dashboard': '/admin/dashboard',
            'rooms': '/admin/rooms',
            'reservations': '/admin/reservations',
            'new-reservation': '/admin/reservations',
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
            navigate(-1);
        } else {
            navigate('/admin/dashboard');
        }
    };

    // Categories - matching database categories
    const categories = [
        { id: 1, name: 'Starters' },
        { id: 2, name: 'Main Course' },
        { id: 3, name: 'Breakfast' },
        { id: 4, name: 'Rice' },
        { id: 5, name: 'Desserts' },
        { id: 6, name: 'Beverages' },
        { id: 7, name: 'Chinese' },
        { id: 8, name: 'Continental' }
    ];

    const [selectedCategory, setSelectedCategory] = useState(1);
    const [cart, setCart] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [searchCode, setSearchCode] = useState('');
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch menu items from API
    useEffect(() => {
        fetchMenuItems();
    }, []);

    const fetchMenuItems = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL_CONFIG}/api/menu/list`);
            const data = await response.json();

            if (data.success && data.data) {
                // Filter only active items
                const activeItems = data.data.filter(item => item.status === 'Active');
                setMenuItems(activeItems);
            }
        } catch (error) {
            console.error('Error fetching menu items:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get current category name
    const getCurrentCategoryName = () => {
        const category = categories.find(cat => cat.id === selectedCategory);
        return category ? category.name : '';
    };

    // Filter items based on search or category
    const getFilteredItems = () => {
        // Map items with code
        const allItems = menuItems.map(item => ({
            id: item._id,
            code: item.foodCode || '',
            name: item.itemName,
            category: item.category,
            price: item.price,
            quantityAvailable: 10,
            description: item.description
        }));

        // Priority 1: Search by Name
        if (searchName) {
            return allItems.filter(item =>
                item.name.toLowerCase().includes(searchName.toLowerCase())
            );
        }

        // Priority 2: Search by Code
        if (searchCode) {
            return allItems.filter(item =>
                item.code.toLowerCase().includes(searchCode.toLowerCase())
            );
        }

        // Priority 3: Filter by Category
        const currentCatName = getCurrentCategoryName();
        return allItems.filter(item => item.category === currentCatName);
    };

    const currentItems = getFilteredItems();

    // Toast State
    const [toasts, setToasts] = useState([]);

    // Print State
    const [printMode, setPrintMode] = useState(null); // 'BILL' or 'KOT' triggers window.print()
    const [printModal, setPrintModal] = useState(null); // 'BILL' or 'KOT' shows Modal

    // Order Type State ( Default: Dine In )
    const [activeOrderType, setActiveOrderType] = useState('dinein');

    useEffect(() => {
        if (source === 'room-service') {
            setActiveOrderType('roomservice');
        } else if (room?.id) {
            setActiveOrderType('dinein');
        }
    }, [room, source]);

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
        const id = `${Date.now()}-${Math.random()}`;
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

    const [orderId, setOrderId] = useState(null);
    const [taxRate, setTaxRate] = useState(5); // Default 5%
    const [isTaxApplied, setIsTaxApplied] = useState(false);

    // Fetch existing order if available
    useEffect(() => {
        if (room?.id) {
            fetchExistingOrder();
        }
    }, [room]);

    const fetchExistingOrder = async () => {
        if (!room?.id) {
            console.log('[DEBUG] No room ID provided, skipping existing order fetch');
            return;
        }

        console.log(`[DEBUG] Fetching existing order for room ID: ${room.id}`);
        try {
            const response = await fetch(`${API_URL_CONFIG}/api/guest-meal/orders/table/${room.id}`);
            if (!response.ok) {
                console.warn(`[WARN] Fetch order returned status ${response.status}`);
                return;
            }
            const data = await response.json();
            if (data.success && data.data) {
                console.log('[DEBUG] Found existing order:', data.data._id);
                setOrderId(data.data._id);
                setTaxRate(data.data.taxRate || 5);
                setIsTaxApplied((data.data.tax || 0) > 0);
                // Map items back to cart format
                const mappedCart = data.data.items.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    category: item.category,
                    subtotal: item.subtotal
                }));
                setCart(mappedCart);
            } else {
                console.log('[DEBUG] No active order found for this room');
            }
        } catch (error) {
            console.error('Error fetching existing order:', error);
        }
    };

    // Calculations
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = isTaxApplied ? (subtotal * taxRate) / 100 : 0;
    const total = subtotal + taxAmount;

    // Handlers
    const saveOrderToBackend = async () => {
        try {
            if (!room) return false;

            const isRoomService = activeOrderType === 'roomservice';

            // Only use table ID for Dine In. 
            // For Room service, room.id is the ROOM ID, not Table ID.
            // If room.id is numeric (dummy), send null. If ObjectId, send as roomId.
            const rawId = room.id || room._id;
            const validObjectId = (typeof rawId === 'string' && rawId.length === 24);

            const tableId = (!isRoomService && validObjectId) ? rawId : null;
            const roomId = (isRoomService && validObjectId) ? rawId : null;

            const tNum = parseInt(room.roomNumber?.toString().replace(/\D/g, ''), 10) || 0;

            // Only validation: need tableId OR roomId OR simple roomNumber (for room service)
            if (!tableId && !roomId && !orderId && !isRoomService) {
                console.error('Missing table ID and order ID');
                // Allow proceeding if room service has room number
                if (!isRoomService) return false;
            }

            const orderData = {
                tableId: tableId,
                roomId: roomId,
                tableNumber: tNum,
                guestName: room.guestName || 'Walk-in',
                roomNumber: room.roomNumber,
                orderType: isRoomService ? 'Post to Room' : 'Direct Payment',
                taxRate: isTaxApplied ? taxRate : 0,
                items: cart.map(item => ({
                    ...item,
                    subtotal: item.price * item.quantity
                }))
            };

            let response;
            if (orderId) {
                response = await fetch(`${API_URL_CONFIG}/api/guest-meal/orders/${orderId}/items`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: orderData.items,
                        taxRate: orderData.taxRate
                    })
                });
            } else {
                response = await fetch(`${API_URL_CONFIG}/api/guest-meal/orders/create`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                });
            }

            const data = await response.json();
            if (data.success) {
                if (!orderId) {
                    const newId = data.data.order ? data.data.order._id : (data.data._id || data.data.id);
                    setOrderId(newId);
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error saving order:', error);
            return false;
        }
    };

    const handleSaveKOT = async () => {
        if (!room?.id && !orderId) {
            addToast('Error: No table selected');
            return;
        }

        const success = await saveOrderToBackend();
        if (success) {
            addToast('KOT saved successfully');
            // Navigate immediately
            navigate('/admin/dashboard', { state: { activeMenu: 'view-order' } });
        } else {
            addToast('Failed to save KOT');
        }
    };

    const handleSavePrintKOT = async () => {
        const success = await saveOrderToBackend();
        if (success) {
            setPrintModal('KOT');
        } else {
            addToast('Failed to save KOT');
        }
    };

    const handleSaveBill = async () => {
        const success = await saveOrderToBackend();
        if (success) {
            addToast('Bill saved successfully');
            navigate('/admin/dashboard', { state: { activeMenu: 'view-order' } });
        } else {
            addToast('Failed to save bill');
        }
    };

    const handleSavePrintBill = async () => {
        const success = await saveOrderToBackend();
        if (success) {
            setPrintModal('BILL');
        } else {
            addToast('Failed to save bill');
        }
    };

    const handleRoomPosting = async () => {
        const success = await saveOrderToBackend();
        if (success) {
            addToast('Room posted successfully');
            navigate('/admin/dashboard', { state: { activeMenu: 'view-order' } });
        } else {
            addToast('Failed to post to room');
        }
    };

    // Modal Action Handlers
    const handleModalPrint = () => {
        setPrintMode(printModal); // Triggers useEffect -> window.print()
        // Close after print
        setTimeout(() => {
            if (onClose) onClose();
        }, 1500);
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

        // Close after download
        setTimeout(() => {
            if (onClose) onClose();
        }, 1500);
    };

    const handleModalClose = () => {
        const wasKOT = printModal === 'KOT';
        const wasBILL = printModal === 'BILL';
        setPrintModal(null);

        if (wasKOT) {
            addToast('KOT saved successfully');
            setTimeout(() => {
                if (onClose) onClose();
            }, 1000);
        } else if (wasBILL) {
            addToast('Bill saved successfully');
            setTimeout(() => {
                if (onClose) onClose();
            }, 1000);
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
                                {loading ? (
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        height: '300px',
                                        fontSize: '18px',
                                        color: '#666'
                                    }}>
                                        Loading menu items...
                                    </div>
                                ) : currentItems.length === 0 ? (
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        height: '300px',
                                        fontSize: '16px',
                                        color: '#999'
                                    }}>
                                        No items available in this category
                                    </div>
                                ) : (
                                    currentItems.map(item => {
                                        // Find current quantity in cart
                                        const cartItem = cart.find(x => x.id === item.id);
                                        const inCartQty = cartItem ? cartItem.quantity : 0;

                                        return (
                                            <div
                                                key={item.id}
                                                className={`pos-food-card ${inCartQty > 0 ? 'has-qty' : ''}`}
                                                onClick={() => addToCart(item)}
                                            >
                                                <div className="pos-card-code">#{item.code || item.id.substring(0, 6)}</div>
                                                {inCartQty > 0 && (
                                                    <div className="pos-card-badge">Qty: {inCartQty}</div>
                                                )}
                                                <div className="pos-card-content">
                                                    <div className="pos-card-name">{item.name}</div>
                                                </div>
                                                <div className="pos-card-footer">
                                                    <div className="pos-card-qty-available">Qty: {item.quantityAvailable}</div>
                                                    <div className="pos-card-price">₹{item.price}</div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL (40%) */}
                    <div className="pos-right-panel">
                        {/* A. Mode Buttons */}
                        <div className="pos-mode-bar">
                            <button
                                className={`pos-mode-btn ${activeOrderType === 'dinein' ? 'active' : ''}`}
                                onClick={() => setActiveOrderType('dinein')}
                            >
                                Dine In (F1)
                            </button>
                            <button
                                className={`pos-mode-btn ${activeOrderType === 'takeaway' ? 'active' : ''}`}
                                onClick={() => setActiveOrderType('takeaway')}
                            >
                                Take Away (F3)
                            </button>
                            <button
                                className={`pos-mode-btn ${activeOrderType === 'online' ? 'active' : ''}`}
                                onClick={() => setActiveOrderType('online')}
                            >
                                Online Order (F5)
                            </button>
                            <button
                                className={`pos-mode-btn ${activeOrderType === 'roomservice' ? 'active' : ''}`}
                                onClick={() => setActiveOrderType('roomservice')}
                            >
                                Room Service
                            </button>
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
                            <div className="pos-tax-controls" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                marginBottom: '10px',
                                padding: '8px 12px',
                                background: '#f8fafc',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0'
                            }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={isTaxApplied}
                                        onChange={(e) => setIsTaxApplied(e.target.checked)}
                                        style={{ width: '16px', height: '16px', accentColor: '#dc2626' }}
                                    />
                                    Apply Tax (%)
                                </label>
                                {isTaxApplied && (
                                    <input
                                        type="number"
                                        value={taxRate}
                                        onChange={(e) => setTaxRate(Number(e.target.value))}
                                        style={{
                                            width: '60px',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            border: '1px solid #cbd5e1',
                                            textAlign: 'center',
                                            fontSize: '0.9rem',
                                            fontWeight: '700'
                                        }}
                                    />
                                )}
                            </div>

                            <div className="pos-total-row">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>

                            {isTaxApplied && (
                                <div className="pos-total-row">
                                    <span>Tax ({taxRate}%)</span>
                                    <span>₹{taxAmount.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="pos-total-row final" style={{ borderTop: '2px solid #e2e8f0', marginTop: '10px', paddingTop: '10px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>Grand Total</span>
                                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '500' }}>
                                        {isTaxApplied ? `Incl. ${taxRate}% Tax` : 'Zero Tax'}
                                    </span>
                                </div>
                                <span style={{ fontSize: '1.4rem', color: '#dc2626' }}>₹{total.toFixed(2)}</span>
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
                                        {(activeOrderType === 'dinein' || activeOrderType === 'roomservice') && (
                                            <button className="pos-footer-btn" onClick={handleRoomPosting}>Room Posting</button>
                                        )}
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
