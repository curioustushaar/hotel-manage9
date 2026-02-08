import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API_URL from '../../config/api';
import './GuestMealOrderPage.css';

const GuestMealOrderPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [table, setTable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cart, setCart] = useState([]);
    const [showBillingModal, setShowBillingModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [isProcessing, setIsProcessing] = useState(false);
    const [notification, setNotification] = useState(null);

    // Food items database (same as FoodOrderPage)
    const foodItems = {
        1: [ // Starters
            { id: 101, name: 'Paneer Tikka', price: 280, image: '🧀', category: 1 },
            { id: 102, name: 'Veg Spring Roll', price: 220, image: '🥟', category: 1 },
            { id: 103, name: 'Chicken Tikka', price: 320, image: '🍗', category: 1 },
            { id: 104, name: 'Fish Fingers', price: 350, image: '🐟', category: 1 },
            { id: 105, name: 'Mushroom Soup', price: 180, image: '🍄', category: 1 },
            { id: 106, name: 'Tomato Soup', price: 150, image: '🍅', category: 1 },
            { id: 107, name: 'Corn Soup', price: 160, image: '🌽', category: 1 },
            { id: 108, name: 'Veg Manchurian', price: 240, image: '🥘', category: 1 },
            { id: 109, name: 'Chilli Paneer', price: 260, image: '🌶️', category: 1 },
            { id: 110, name: 'Crispy Corn', price: 200, image: '🌽', category: 1 }
        ],
        2: [ // Main Course
            { id: 201, name: 'Paneer Butter Masala', price: 320, image: '🧈', category: 2 },
            { id: 202, name: 'Dal Makhani', price: 280, image: '🥘', category: 2 },
            { id: 203, name: 'Chicken Curry', price: 380, image: '🍗', category: 2 },
            { id: 204, name: 'Mutton Rogan Josh', price: 450, image: '🍖', category: 2 },
            { id: 205, name: 'Fish Curry', price: 400, image: '🐟', category: 2 },
            { id: 206, name: 'Veg Kolhapuri', price: 300, image: '🥗', category: 2 },
            { id: 207, name: 'Kadai Paneer', price: 340, image: '🧀', category: 2 },
            { id: 208, name: 'Palak Paneer', price: 310, image: '🥬', category: 2 },
            { id: 209, name: 'Butter Chicken', price: 420, image: '🍗', category: 2 },
            { id: 210, name: 'Mixed Veg Curry', price: 270, image: '🥘', category: 2 }
        ],
        3: [ // Breads
            { id: 301, name: 'Butter Naan', price: 60, image: '🫓', category: 3 },
            { id: 302, name: 'Garlic Naan', price: 70, image: '🫓', category: 3 },
            { id: 303, name: 'Tandoori Roti', price: 40, image: '🫓', category: 3 },
            { id: 304, name: 'Butter Roti', price: 50, image: '🫓', category: 3 },
            { id: 305, name: 'Cheese Naan', price: 90, image: '🫓', category: 3 },
            { id: 306, name: 'Kulcha', price: 65, image: '🫓', category: 3 },
            { id: 307, name: 'Paratha', price: 55, image: '🫓', category: 3 },
            { id: 308, name: 'Lachha Paratha', price: 75, image: '🫓', category: 3 },
            { id: 309, name: 'Missi Roti', price: 60, image: '🫓', category: 3 },
            { id: 310, name: 'Roomali Roti', price: 45, image: '🫓', category: 3 }
        ],
        4: [ // Rice
            { id: 401, name: 'Veg Biryani', price: 280, image: '🍚', category: 4 },
            { id: 402, name: 'Chicken Biryani', price: 350, image: '🍚', category: 4 },
            { id: 403, name: 'Mutton Biryani', price: 420, image: '🍚', category: 4 },
            { id: 404, name: 'Jeera Rice', price: 180, image: '🍚', category: 4 },
            { id: 405, name: 'Veg Pulao', price: 220, image: '🍚', category: 4 },
            { id: 406, name: 'Steam Rice', price: 150, image: '🍚', category: 4 },
            { id: 407, name: 'Fried Rice', price: 240, image: '🍚', category: 4 },
            { id: 408, name: 'Schezwan Rice', price: 260, image: '🍚', category: 4 },
            { id: 409, name: 'Egg Fried Rice', price: 280, image: '🍚', category: 4 },
            { id: 410, name: 'Curd Rice', price: 160, image: '🍚', category: 4 }
        ],
        5: [ // Desserts
            { id: 501, name: 'Gulab Jamun', price: 120, image: '🍮', category: 5 },
            { id: 502, name: 'Rasgulla', price: 130, image: '🍮', category: 5 },
            { id: 503, name: 'Ice Cream', price: 150, image: '🍨', category: 5 },
            { id: 504, name: 'Brownie', price: 180, image: '🍰', category: 5 },
            { id: 505, name: 'Pastry', price: 160, image: '🍰', category: 5 },
            { id: 506, name: 'Kheer', price: 140, image: '🍮', category: 5 },
            { id: 507, name: 'Kulfi', price: 100, image: '🍨', category: 5 },
            { id: 508, name: 'Jalebi', price: 110, image: '🍮', category: 5 },
            { id: 509, name: 'Rasmalai', price: 150, image: '🍮', category: 5 },
            { id: 510, name: 'Gajar Halwa', price: 130, image: '🥕', category: 5 }
        ],
        6: [ // Beverages
            { id: 601, name: 'Tea', price: 40, image: '☕', category: 6 },
            { id: 602, name: 'Coffee', price: 60, image: '☕', category: 6 },
            { id: 603, name: 'Cold Coffee', price: 100, image: '🥤', category: 6 },
            { id: 604, name: 'Fresh Lime Soda', price: 80, image: '🍋', category: 6 },
            { id: 605, name: 'Mango Shake', price: 120, image: '🥭', category: 6 },
            { id: 606, name: 'Banana Shake', price: 110, image: '🍌', category: 6 },
            { id: 607, name: 'Lassi', price: 90, image: '🥛', category: 6 },
            { id: 608, name: 'Buttermilk', price: 60, image: '🥛', category: 6 },
            { id: 609, name: 'Soft Drink', price: 50, image: '🥤', category: 6 },
            { id: 610, name: 'Mineral Water', price: 30, image: '💧', category: 6 }
        ],
        7: [ // Chinese
            { id: 701, name: 'Veg Noodles', price: 220, image: '🍜', category: 7 },
            { id: 702, name: 'Chicken Noodles', price: 280, image: '🍜', category: 7 },
            { id: 703, name: 'Veg Manchurian', price: 240, image: '🥘', category: 7 },
            { id: 704, name: 'Chilli Chicken', price: 320, image: '🌶️', category: 7 },
            { id: 705, name: 'Spring Rolls', price: 200, image: '🥟', category: 7 },
            { id: 706, name: 'Momos', price: 180, image: '🥟', category: 7 },
            { id: 707, name: 'Hakka Noodles', price: 240, image: '🍜', category: 7 },
            { id: 708, name: 'Chowmein', price: 230, image: '🍜', category: 7 },
            { id: 709, name: 'Fried Rice', price: 250, image: '🍚', category: 7 },
            { id: 710, name: 'Sweet Corn Soup', price: 160, image: '🌽', category: 7 }
        ],
        8: [ // Continental
            { id: 801, name: 'Pasta Alfredo', price: 320, image: '🍝', category: 8 },
            { id: 802, name: 'Pizza Margherita', price: 380, image: '🍕', category: 8 },
            { id: 803, name: 'Burger', price: 220, image: '🍔', category: 8 },
            { id: 804, name: 'Sandwich', price: 180, image: '🥪', category: 8 },
            { id: 805, name: 'French Fries', price: 140, image: '🍟', category: 8 },
            { id: 806, name: 'Garlic Bread', price: 160, image: '🥖', category: 8 },
            { id: 807, name: 'Grilled Chicken', price: 400, image: '🍗', category: 8 },
            { id: 808, name: 'Fish & Chips', price: 420, image: '🐟', category: 8 },
            { id: 809, name: 'Caesar Salad', price: 280, image: '🥗', category: 8 },
            { id: 810, name: 'Club Sandwich', price: 240, image: '🥪', category: 8 }
        ]
    };

    const categories = [
        { id: 1, name: 'Starters', icon: '🥗' },
        { id: 2, name: 'Main Course', icon: '🍛' },
        { id: 3, name: 'Breads', icon: '🍞' },
        { id: 4, name: 'Rice', icon: '🍚' },
        { id: 5, name: 'Desserts', icon: '🍰' },
        { id: 6, name: 'Beverages', icon: '☕' },
        { id: 7, name: 'Chinese', icon: '🥡' },
        { id: 8, name: 'Continental', icon: '🍝' }
    ];

    // Show notification
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Load order on mount
    useEffect(() => {
        const loadOrder = async () => {
            try {
                setLoading(true);
                const { tableId, orderId, existingOrder } = location.state || {};

                if (!tableId || !orderId) {
                    setError('Missing table or order information');
                    return;
                }

                // If existing order passed in state, use it
                if (existingOrder) {
                    setOrder(existingOrder);
                    setCart(existingOrder.items || []);
                } else {
                    // Fetch order from API
                    const response = await fetch(`${API_URL}/api/guest-meal/orders/${orderId}`);
                    const data = await response.json();

                    if (data.success) {
                        setOrder(data.data);
                        setCart(data.data.items || []);
                    } else {
                        setError('Failed to load order');
                    }
                }

                // Fetch table info
                const tableResponse = await fetch(`${API_URL}/api/guest-meal/tables/${tableId}`);
                const tableData = await tableResponse.json();
                if (tableData.success) {
                    setTable(tableData.data);
                }
            } catch (err) {
                console.error('Error loading order:', err);
                setError('Error connecting to server');
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [location.state]);

    // Add item to cart
    const addToCart = (item) => {
        const existingItem = cart.find(i => i.id === item.id);
        if (existingItem) {
            updateQuantity(item.id, 1);
        } else {
            setCart([...cart, { ...item, quantity: 1, subtotal: item.price }]);
            showNotification(`${item.name} added!`, 'success');
        }
    };

    // Update quantity
    const updateQuantity = (itemId, change) => {
        setCart(cart.map(item => {
            if (item.id === itemId) {
                const newQuantity = item.quantity + change;
                if (newQuantity > 0) {
                    return { ...item, quantity: newQuantity, subtotal: item.price * newQuantity };
                }
                return null;
            }
            return item;
        }).filter(Boolean));
    };

    // Remove from cart
    const removeFromCart = (itemId) => {
        const item = cart.find(i => i.id === itemId);
        setCart(cart.filter(i => i.id !== itemId));
        if (item) {
            showNotification(`${item.name} removed`, 'info');
        }
    };

    // Save order to backend
    const handleSaveOrder = async () => {
        if (cart.length === 0) {
            showNotification('Cart is empty!', 'error');
            return;
        }

        try {
            setIsProcessing(true);
            const { orderId } = location.state;

            const response = await fetch(`${API_URL}/api/guest-meal/orders/${orderId}/items`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: cart })
            });

            const data = await response.json();
            if (data.success) {
                setOrder(data.data);
                showNotification('Order saved successfully!', 'success');
            } else {
                showNotification('Error saving order', 'error');
            }
        } catch (err) {
            console.error('Error saving order:', err);
            showNotification('Error saving order', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    // Process billing
    const handleBilling = async () => {
        if (cart.length === 0) {
            showNotification('Cart is empty!', 'error');
            return;
        }

        try {
            setIsProcessing(true);
            const { orderId } = location.state;

            // First save items
            let saveResponse = await fetch(`${API_URL}/api/guest-meal/orders/${orderId}/items`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: cart })
            });

            if (!saveResponse.ok) throw new Error('Failed to save items');

            // Then bill the order
            const billResponse = await fetch(`${API_URL}/api/guest-meal/orders/${orderId}/bill`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentMethod })
            });

            const billData = await billResponse.json();
            if (billData.success) {
                showNotification('Order billed successfully!', 'success');
                setShowBillingModal(false);

                // Close order after 1.5 seconds
                setTimeout(() => {
                    closeOrder();
                }, 1500);
            } else {
                showNotification(billData.message || 'Error billing order', 'error');
            }
        } catch (err) {
            console.error('Error billing order:', err);
            showNotification('Error billing order', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    // Close order and reset table
    const closeOrder = async () => {
        try {
            const { orderId } = location.state;

            const response = await fetch(`${API_URL}/api/guest-meal/orders/${orderId}/close`, {
                method: 'POST'
            });

            const data = await response.json();
            if (data.success) {
                showNotification('Table reset successfully!', 'success');
                // Navigate back to guest meal service after 1 second
                setTimeout(() => {
                    navigate('/admin/guests-meal-service');
                }, 1000);
            } else {
                showNotification('Error closing order', 'error');
            }
        } catch (err) {
            console.error('Error closing order:', err);
            showNotification('Error closing order', 'error');
        }
    };

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    if (loading) {
        return <div className="gmo-loading">Loading order...</div>;
    }

    if (error) {
        return (
            <div className="gmo-error">
                <p>{error}</p>
                <button onClick={() => navigate('/admin/guests-meal-service')}>Back to Tables</button>
            </div>
        );
    }

    return (
        <div className="guest-meal-order-page">
            {/* Header */}
            <div className="gmo-header">
                <div className="gmo-header-info">
                    <h1>🍽️ Table {table?.tableNumber} - Order Management</h1>
                    <button className="gmo-back-btn" onClick={() => navigate('/admin/guests-meal-service')}>
                        ← Back to Tables
                    </button>
                </div>
                <div className="gmo-header-details">
                    <span className="detail-badge">Order Type: {order?.orderType}</span>
                    {order?.roomNumber && <span className="detail-badge">Room: {order.roomNumber}</span>}
                </div>
            </div>

            {/* Main Layout */}
            <div className="gmo-container">
                {/* Menu Section */}
                <div className="gmo-menu-section">
                    <h2>Select Items</h2>
                    <div className="gmo-categories">
                        {categories.map(cat => (
                            <div key={cat.id} className="gmo-category">
                                <h3>{cat.icon} {cat.name}</h3>
                                <div className="gmo-items-grid">
                                    {(foodItems[cat.id] || []).map(item => (
                                        <div key={item.id} className="gmo-item-card">
                                            <div className="item-image">{item.image}</div>
                                            <div className="item-name">{item.name}</div>
                                            <div className="item-price">₹{item.price}</div>
                                            <button className="item-add-btn" onClick={() => addToCart(item)}>
                                                + Add
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cart Section */}
                <div className="gmo-cart-section">
                    <h2>Order Summary</h2>

                    {notification && (
                        <div className={`notification ${notification.type}`}>
                            {notification.message}
                        </div>
                    )}

                    <div className="gmo-cart">
                        {cart.length === 0 ? (
                            <div className="gmo-empty-cart">
                                <p>🛒 No items added yet</p>
                            </div>
                        ) : (
                            <>
                                <div className="gmo-items-list">
                                    {cart.map(item => (
                                        <div key={item.id} className="gmo-cart-item">
                                            <div className="item-info">
                                                <span className="item-name">{item.name}</span>
                                                <span className="item-price">₹{item.price}</span>
                                            </div>
                                            <div className="item-controls">
                                                <button onClick={() => updateQuantity(item.id, -1)}>−</button>
                                                <span className="quantity">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                                            </div>
                                            <div className="item-total">₹{item.subtotal}</div>
                                            <button className="item-remove" onClick={() => removeFromCart(item.id)}>
                                                🗑️
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="gmo-totals">
                                    <div className="total-row">
                                        <span>Subtotal:</span>
                                        <span>₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="total-row">
                                        <span>Tax (5%):</span>
                                        <span>₹{tax.toFixed(2)}</span>
                                    </div>
                                    <div className="total-row-final">
                                        <span>Total:</span>
                                        <span>₹{total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="gmo-actions">
                                    <button
                                        className="btn-save"
                                        onClick={handleSaveOrder}
                                        disabled={isProcessing}
                                    >
                                        💾 Save Order
                                    </button>
                                    <button
                                        className="btn-bill"
                                        onClick={() => setShowBillingModal(true)}
                                        disabled={isProcessing}
                                    >
                                        💳 Process Billing
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Billing Modal */}
            {showBillingModal && (
                <div className="modal-overlay" onClick={() => setShowBillingModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Process Payment</h2>
                            <button className="modal-close" onClick={() => setShowBillingModal(false)}>✕</button>
                        </div>

                        <div className="modal-body">
                            <div className="billing-summary">
                                <div className="summary-row">
                                    <span>Subtotal:</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Tax (5%):</span>
                                    <span>₹{tax.toFixed(2)}</span>
                                </div>
                                <div className="summary-row-total">
                                    <span>Total Amount:</span>
                                    <span>₹{total.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="payment-options">
                                <label className="payment-option">
                                    <input
                                        type="radio"
                                        value="Cash"
                                        checked={paymentMethod === 'Cash'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span>💵 Cash Payment</span>
                                </label>
                                <label className="payment-option">
                                    <input
                                        type="radio"
                                        value="Card"
                                        checked={paymentMethod === 'Card'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span>💳 Card Payment</span>
                                </label>
                                <label className="payment-option">
                                    <input
                                        type="radio"
                                        value="Online"
                                        checked={paymentMethod === 'Online'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span>📱 Online Payment</span>
                                </label>
                                {order?.orderType === 'Post to Room' && (
                                    <label className="payment-option">
                                        <input
                                            type="radio"
                                            value="Room Billing"
                                            checked={paymentMethod === 'Room Billing'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <span>🏨 Post to Room</span>
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn-cancel"
                                onClick={() => setShowBillingModal(false)}
                                disabled={isProcessing}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-confirm"
                                onClick={handleBilling}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Processing...' : `Confirm Payment - ₹${total.toFixed(2)}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GuestMealOrderPage;
