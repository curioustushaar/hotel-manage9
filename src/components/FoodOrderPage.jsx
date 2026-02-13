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
            if (onClose) onClose();
        }, 1000);
    };

    const handleSavePrintKOT = () => {
        saveOrderToStorage();
        setPrintModal('KOT');
    };

    const handleSaveBill = () => {
        saveOrderToStorage();
        addToast('Bill saved successfully');
        setTimeout(() => {
            if (onClose) onClose();
        }, 1000);
    };

    const handleSavePrintBill = () => {
        saveOrderToStorage();
        setPrintModal('BILL');
    };

    const handleRoomPosting = () => {
        saveOrderToStorage();
        addToast('Room posted successfully');
        setTimeout(() => {
            if (onClose) onClose();
        }, 1000);
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
