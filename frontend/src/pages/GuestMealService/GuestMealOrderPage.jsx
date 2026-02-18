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

    // Categories configuration matching the database
    const categories = [
        { id: 'Starters', name: 'Starters', icon: '🍴' },
        { id: 'Main Course', name: 'Main Course', icon: '🍛' },
        { id: 'Breads', name: 'Breads', icon: '🍞' },
        { id: 'Breakfast', name: 'Breakfast', icon: '☕' },
        { id: 'Rice', name: 'Rice', icon: '🍚' },
        { id: 'Desserts', name: 'Desserts', icon: '🍨' },
        { id: 'Beverages', name: 'Beverages', icon: '🥤' },
        { id: 'Chinese', name: 'Chinese', icon: '🥡' },
        { id: 'Continental', name: 'Continental', icon: '🍝' }
    ];

    const [groupedItems, setGroupedItems] = useState({});

    // Fetch menu items from API
    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await fetch(`${API_URL}/api/menu/list`);
                const data = await response.json();
                if (data.success) {
                    const groups = {};
                    data.data.forEach(item => {
                        // Map API data to UI format
                        const mappedItem = {
                            id: item._id,
                            name: item.itemName,
                            price: item.price,
                            category: item.category,
                            description: item.description,
                            status: item.status, // 'Active' or 'Inactive'
                            image: getItemIcon(item.category)
                        };

                        if (!groups[item.category]) groups[item.category] = [];
                        groups[item.category].push(mappedItem);
                    });
                    setGroupedItems(groups);
                }
            } catch (err) {
                console.error('Error fetching menu:', err);
                showNotification('Failed to load menu items', 'error');
            }
        };
        fetchMenu();
    }, []);

    const getItemIcon = (category) => {
        const cat = categories.find(c => c.name === category);
        return cat ? cat.icon : '🍽️';
    };

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
                        {categories.map(cat => {
                            const items = groupedItems[cat.name] || [];
                            if (items.length === 0) return null;

                            return (
                                <div key={cat.id} className="gmo-category">
                                    <h3>{cat.icon} {cat.name}</h3>
                                    <div className="gmo-items-grid">
                                        {items.map(item => (
                                            <div key={item.id} className={`gmo-item-card ${item.status === 'Inactive' ? 'out-of-stock' : ''}`}>
                                                <div className="item-image">{item.image}</div>
                                                <div className="item-name">{item.name}</div>
                                                <div className="item-price">₹{item.price.toFixed(2)}</div>
                                                {item.status === 'Inactive' ? (
                                                    <button className="item-add-btn disabled" disabled style={{ background: '#ccc', cursor: 'not-allowed' }}>
                                                        🚫 Out of Stock
                                                    </button>
                                                ) : (
                                                    <button className="item-add-btn" onClick={() => addToCart(item)}>
                                                        + Add
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
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
            {
                showBillingModal && (
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
                )
            }
        </div >
    );
};

export default GuestMealOrderPage;
