import { useState, useEffect } from 'react';
import { orderStorage } from '../utils/orderStorage';
import DocumentPreviewModal from './DocumentPreviewModal';
import './FoodOrderPage.css';

const FoodOrderPage = ({ room, onClose }) => {
    // Categories
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

    // Food items database
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

    const [selectedCategory, setSelectedCategory] = useState(1);
    const [searchFood, setSearchFood] = useState('');
    const [searchCategory, setSearchCategory] = useState('');
    const [cart, setCart] = useState([]);
    const [orderType, setOrderType] = useState('roomservice');
    const [kotPrinted, setKotPrinted] = useState(false);
    const [orderSaved, setOrderSaved] = useState(false);
    const [notification, setNotification] = useState(null);

    // Modal state for document preview
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [documentData, setDocumentData] = useState(null);
    const [documentType, setDocumentType] = useState(null);

    // Get current food items based on selected category
    const currentFoodItems = foodItems[selectedCategory] || [];

    // Filter food items based on search
    const filteredFoodItems = currentFoodItems.filter(item =>
        item.name.toLowerCase().includes(searchFood.toLowerCase())
    );

    // Show notification
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Add item to cart
    const addToCart = (item) => {
        const existingItem = cart.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
            setCart(cart.map(cartItem =>
                cartItem.id === item.id
                    ? { ...cartItem, quantity: cartItem.quantity + 1 }
                    : cartItem
            ));
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }
        showNotification(`${item.name} added to cart!`, 'success');
    };

    // Update quantity
    const updateQuantity = (itemId, change) => {
        setCart(cart.map(item => {
            if (item.id === itemId) {
                const newQuantity = item.quantity + change;
                return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    // Remove item from cart
    const removeFromCart = (itemId) => {
        const item = cart.find(i => i.id === itemId);
        setCart(cart.filter(item => item.id !== itemId));
        if (item) {
            showNotification(`${item.name} removed from cart`, 'info');
        }
    };

    // Load saved order on mount (if exists)
    useEffect(() => {
        const savedOrder = orderStorage.getOrder(room.id);
        if (savedOrder) {
            // Load saved order data
            setCart(savedOrder.items);
            setOrderType(savedOrder.orderType);
            setKotPrinted(savedOrder.kotPrinted || false);
            setOrderSaved(true);
        }
    }, [room.id]);

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + tax;

    // Order type counts (mock data)
    const orderCounts = {
        dineIn: 12,
        sell: 8,
        delivery: 5
    };

    // Print KOT Handler - Show Popup Modal
    const handlePrintKOT = () => {
        if (cart.length === 0) {
            showNotification('Cart is empty! Add items first.', 'error');
            return;
        }

        const kotData = {
            kotNumber: `KOT-${Date.now()}`,
            room: {
                roomNumber: room.roomNumber,
                guestName: room.guestName
            },
            orderType,
            items: cart,
            totalItems: cart.reduce((sum, item) => sum + item.quantity, 0),
            date: new Date().toLocaleDateString('en-IN'),
            time: new Date().toLocaleTimeString('en-IN')
        };

        setDocumentData(kotData);
        setDocumentType('kot');
        setShowDocumentModal(true);
        setKotPrinted(true);
        showNotification('KOT preview opened! ✓', 'success');
    };

    // Save Order Handler - Save to localStorage
    const handleSaveOrder = () => {
        if (cart.length === 0) {
            showNotification('Cart is empty! Add items first.', 'error');
            return;
        }

        try {
            const orderData = {
                room: {
                    id: room.id,
                    roomNumber: room.roomNumber,
                    guestName: room.guestName,
                },
                orderType,
                items: cart,
                subtotal,
                tax,
                total,
                kotPrinted,
            };

            const savedOrder = orderStorage.saveOrder(room.id, orderData);
            setOrderSaved(true);
            showNotification(`Order saved successfully! Order ID: ${savedOrder.orderId}`, 'success');

            // Redirect back to Room Service page after 1.5 seconds
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            console.error('Error saving order:', error);
            showNotification('Error saving order. Please try again.', 'error');
        }
    };

    // Print Bill Handler - Show Popup Modal
    const handlePrintBill = () => {
        if (cart.length === 0) {
            showNotification('Cart is empty! Add items first.', 'error');
            return;
        }

        const billData = {
            billNumber: `INV-${Date.now()}`,
            room: {
                roomNumber: room.roomNumber,
                guestName: room.guestName
            },
            items: cart,
            subtotal,
            tax,
            total,
            date: new Date().toLocaleDateString('en-IN'),
            time: new Date().toLocaleTimeString('en-IN')
        };

        setDocumentData(billData);
        setDocumentType('bill');
        setShowDocumentModal(true);
        showNotification('Bill preview opened! ✓', 'success');
    };

    // Settle Handler - Clear order and localStorage
    const handleSettle = () => {
        if (cart.length === 0) {
            showNotification('Cart is empty! Nothing to settle.', 'error');
            return;
        }

        const confirmSettle = window.confirm(
            `Settle Order?\n\nRoom: ${room.roomNumber}\nGuest: ${room.guestName}\nTotal Amount: ₹${total.toFixed(2)}\n\nThis will clear the cart and complete the order.`
        );

        if (confirmSettle) {
            try {
                // Delete order from localStorage
                orderStorage.deleteOrder(room.id);

                // Clear cart and reset states
                setCart([]);
                setKotPrinted(false);
                setOrderSaved(false);

                showNotification('Order settled successfully! ✓', 'success');

                // Redirect back to Room Service page
                setTimeout(() => {
                    onClose();
                }, 1000);
            } catch (error) {
                console.error('Error settling order:', error);
                showNotification('Error settling order. Please try again.', 'error');
            }
        }
    };


    // Helper function to get category code
    const getCategoryCode = (categoryId) => {
        const codes = {
            1: 'ST', // Starters
            2: 'MC', // Main Course
            3: 'BR', // Breads
            4: 'RC', // Rice
            5: 'DS', // Desserts
            6: 'BV', // Beverages
        };
        return codes[categoryId] || 'IT';
    };

    return (
        <div className="food-order-page">
            {/* Notification Toast */}
            {notification && (
                <div className={`notification-toast ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            {/* Top Action Bar - KEEP AS IS */}
            <div className="order-top-bar">
                <div className="top-bar-left">
                    <button className="back-btn-order" onClick={onClose}>
                        ← Back
                    </button>
                    <div className="room-info-badge">
                        Room {room?.roomNumber} - {room?.guestName}
                    </div>
                    <div className="search-group">
                        <input
                            type="text"
                            placeholder="Search Food Item..."
                            value={searchFood}
                            onChange={(e) => setSearchFood(e.target.value)}
                            className="search-input-order"
                        />
                        <input
                            type="text"
                            placeholder="Search by Category / Code..."
                            value={searchCategory}
                            onChange={(e) => setSearchCategory(e.target.value)}
                            className="search-input-order"
                        />
                    </div>
                </div>
                <div className="top-bar-right">
                    <button
                        className={`order-type-btn ${orderType === 'dinein' ? 'active' : ''}`}
                        onClick={() => setOrderType('dinein')}
                    >
                        Dine In <span className="count-badge">{orderCounts.dineIn}</span>
                    </button>
                    <button
                        className={`order-type-btn ${orderType === 'sell' ? 'active' : ''}`}
                        onClick={() => setOrderType('sell')}
                    >
                        Sell <span className="count-badge">{orderCounts.sell}</span>
                    </button>
                    <button
                        className={`order-type-btn ${orderType === 'delivery' ? 'active' : ''}`}
                        onClick={() => setOrderType('delivery')}
                    >
                        Delivery <span className="count-badge">{orderCounts.delivery}</span>
                    </button>
                    <button
                        className={`order-type-btn ${orderType === 'roomservice' ? 'active' : ''}`}
                        onClick={() => setOrderType('roomservice')}
                    >
                        Room Service
                    </button>
                </div>
            </div>

            {/* MIDDLE SECTION - POS LAYOUT: LEFT | CENTER | RIGHT */}
            <div className="pos-middle-section">
                {/* LEFT - Categories Sidebar */}
                <div className="categories-sidebar-left">
                    <div className="categories-header">Categories</div>
                    <div className="categories-list-pos">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                className={`category-btn-pos ${selectedCategory === category.id ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category.id)}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* CENTER - Food Items Grid (POS Style) */}
                <div className="food-items-center">
                    <div className="food-grid-pos">
                        {filteredFoodItems.map(item => {
                            const cartItem = cart.find(c => c.id === item.id);
                            const quantity = cartItem ? cartItem.quantity : 0;

                            return (
                                <div key={item.id} className="food-card-pos">
                                    <div className="food-card-header">
                                        <span className="food-code">{getCategoryCode(item.category)}{String(item.id).slice(-2)}</span>
                                        <span className="food-emoji">{item.image}</span>
                                    </div>
                                    <div className="food-name-pos">{item.name}</div>
                                    <div className="food-price-pos">₹{item.price}</div>
                                    <div className="qty-controls-pos">
                                        <button
                                            className="qty-btn-pos minus"
                                            onClick={() => quantity > 0 && updateQuantity(item.id, -1)}
                                            disabled={quantity === 0}
                                        >
                                            −
                                        </button>
                                        <span className="qty-value-pos">{quantity}</span>
                                        <button
                                            className="qty-btn-pos plus"
                                            onClick={() => addToCart(item)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT - Order Panel */}
                <div className="order-panel-right">
                    <div className="order-panel-header">
                        Order Summary
                        <div className="order-badges">
                            {kotPrinted && <span className="status-badge-small kot">KOT ✓</span>}
                            {orderSaved && <span className="status-badge-small saved">Saved ✓</span>}
                        </div>
                    </div>
                    <div className="order-items-list">
                        {cart.length > 0 ? (
                            cart.map(item => (
                                <div key={item.id} className="order-item-pos">
                                    <div className="order-item-top">
                                        <span className="order-item-name">{item.name}</span>
                                        <button
                                            className="order-item-remove"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <div className="order-item-bottom">
                                        <span className="order-item-qty">{item.quantity} × ₹{item.price}</span>
                                        <span className="order-item-total">₹{item.price * item.quantity}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="order-empty">No items in order</div>
                        )}
                    </div>
                    <div className="order-panel-total">
                        <div className="total-label">Total:</div>
                        <div className="total-amount">₹{total.toFixed(2)}</div>
                    </div>
                </div>
            </div>

            {/* BOTTOM SECTION - Billing & KOT (Full Width) */}
            <div className="billing-bottom-section">
                <div className="billing-left">
                    <div className="billing-header">Order Items ({cart.length})</div>
                    <div className="billing-items-scroll">
                        {cart.length > 0 ? (
                            <div className="billing-items-grid">
                                {cart.map(item => (
                                    <div key={item.id} className="billing-item-compact">
                                        <span className="billing-item-name">{item.name}</span>
                                        <span className="billing-item-detail">{item.quantity} × ₹{item.price}</span>
                                        <span className="billing-item-total">₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="billing-empty">No items in cart</div>
                        )}
                    </div>
                </div>

                <div className="billing-right">
                    <div className="billing-summary-compact">
                        <div className="summary-line">
                            <span>Subtotal:</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-line">
                            <span>Tax (5%):</span>
                            <span>₹{tax.toFixed(2)}</span>
                        </div>
                        <div className="summary-line total">
                            <span>Total:</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="action-buttons-grid">
                        <button
                            className="action-btn-pos kot"
                            onClick={handlePrintKOT}
                            disabled={cart.length === 0}
                        >
                            PRINT KOT
                        </button>
                        <button
                            className="action-btn-pos save"
                            onClick={handleSaveOrder}
                            disabled={cart.length === 0}
                        >
                            SAVE ORDER
                        </button>
                        <button
                            className="action-btn-pos print"
                            onClick={handlePrintBill}
                            disabled={cart.length === 0}
                        >
                            PRINT BILL
                        </button>
                        <button
                            className="action-btn-pos settle"
                            onClick={handleSettle}
                            disabled={cart.length === 0}
                        >
                            SETTLE
                        </button>
                    </div>
                </div>
            </div>

            {showDocumentModal && (
                <DocumentPreviewModal
                    isOpen={showDocumentModal}
                    onClose={() => setShowDocumentModal(false)}
                    documentType={documentType}
                    data={documentData}
                />
            )}
        </div>
    );
};

export default FoodOrderPage;
