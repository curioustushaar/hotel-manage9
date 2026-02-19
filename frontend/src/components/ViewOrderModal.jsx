import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import './ViewOrderModal.css';

const ViewOrderModal = ({ isOpen, onClose, room, currentOrder, onUpdateOrder }) => {
    const [orderItems, setOrderItems] = useState([]);
    const [serviceItems, setServiceItems] = useState([]);
    const [activeTab, setActiveTab] = useState('food'); // 'food' or 'service'
    const [showFoodSelector, setShowFoodSelector] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(1);
    const [selectedServiceCategory, setSelectedServiceCategory] = useState(1);
    const [toastMessage, setToastMessage] = useState('');

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
            { id: 101, name: 'Paneer Tikka', price: 500, quantityAvailable: 8 },
            { id: 102, name: 'Veg Spring Roll', price: 220, quantityAvailable: 5 },
            { id: 103, name: 'Chicken Tikka', price: 320, quantityAvailable: 6 },
            { id: 104, name: 'Fish Fingers', price: 350, quantityAvailable: 4 },
            { id: 105, name: 'Mushroom Soup', price: 180, quantityAvailable: 10 },
            { id: 106, name: 'Tomato Soup', price: 150, quantityAvailable: 7 },
            { id: 107, name: 'Corn Soup', price: 160, quantityAvailable: 9 },
            { id: 108, name: 'Veg Manchurian', price: 240, quantityAvailable: 5 },
            { id: 109, name: 'Chilli Paneer', price: 260, quantityAvailable: 6 },
            { id: 110, name: 'Crispy Corn', price: 200, quantityAvailable: 8 }
        ],
        2: [ // Main Course
            { id: 201, name: 'Paneer Butter Masala', price: 320, quantityAvailable: 7 },
            { id: 202, name: 'Dal Makhani', price: 280, quantityAvailable: 10 },
            { id: 203, name: 'Chicken Curry', price: 380, quantityAvailable: 5 },
            { id: 204, name: 'Mutton Rogan Josh', price: 450, quantityAvailable: 4 },
            { id: 205, name: 'Fish Curry', price: 400, quantityAvailable: 6 },
            { id: 206, name: 'Veg Kolhapuri', price: 300, quantityAvailable: 8 },
            { id: 207, name: 'Kadai Paneer', price: 340, quantityAvailable: 9 },
            { id: 208, name: 'Palak Paneer', price: 310, quantityAvailable: 7 },
            { id: 209, name: 'Butter Chicken', price: 420, quantityAvailable: 5 },
            { id: 210, name: 'Mixed Veg Curry', price: 270, quantityAvailable: 10 }
        ],
        3: [ // Breads
            { id: 301, name: 'Butter Naan', price: 60, quantityAvailable: 15 },
            { id: 302, name: 'Garlic Naan', price: 70, quantityAvailable: 12 },
            { id: 303, name: 'Tandoori Roti', price: 40, quantityAvailable: 20 },
            { id: 304, name: 'Butter Roti', price: 50, quantityAvailable: 18 },
            { id: 305, name: 'Cheese Naan', price: 90, quantityAvailable: 8 },
            { id: 306, name: 'Kulcha', price: 65, quantityAvailable: 10 },
            { id: 307, name: 'Paratha', price: 55, quantityAvailable: 14 },
            { id: 308, name: 'Lachha Paratha', price: 75, quantityAvailable: 9 },
            { id: 309, name: 'Missi Roti', price: 60, quantityAvailable: 11 },
            { id: 310, name: 'Roomali Roti', price: 45, quantityAvailable: 16 }
        ],
        4: [ // Rice
            { id: 401, name: 'Veg Biryani', price: 280, quantityAvailable: 6 },
            { id: 402, name: 'Chicken Biryani', price: 350, quantityAvailable: 5 },
            { id: 403, name: 'Mutton Biryani', price: 420, quantityAvailable: 4 },
            { id: 404, name: 'Jeera Rice', price: 180, quantityAvailable: 10 },
            { id: 405, name: 'Veg Pulao', price: 220, quantityAvailable: 8 },
            { id: 406, name: 'Steam Rice', price: 150, quantityAvailable: 12 },
            { id: 407, name: 'Fried Rice', price: 240, quantityAvailable: 7 },
            { id: 408, name: 'Schezwan Rice', price: 260, quantityAvailable: 6 },
            { id: 409, name: 'Egg Fried Rice', price: 280, quantityAvailable: 5 },
            { id: 410, name: 'Curd Rice', price: 160, quantityAvailable: 9 }
        ],
        5: [ // Desserts
            { id: 501, name: 'Gulab Jamun', price: 120, quantityAvailable: 15 },
            { id: 502, name: 'Rasgulla', price: 130, quantityAvailable: 12 },
            { id: 503, name: 'Ice Cream', price: 150, quantityAvailable: 8 },
            { id: 504, name: 'Brownie', price: 180, quantityAvailable: 6 },
            { id: 505, name: 'Pastry', price: 160, quantityAvailable: 7 },
            { id: 506, name: 'Kheer', price: 140, quantityAvailable: 10 },
            { id: 507, name: 'Kulfi', price: 100, quantityAvailable: 14 },
            { id: 508, name: 'Jalebi', price: 110, quantityAvailable: 16 },
            { id: 509, name: 'Rasmalai', price: 150, quantityAvailable: 9 },
            { id: 510, name: 'Gajar Halwa', price: 130, quantityAvailable: 11 }
        ],
        6: [ // Beverages
            { id: 601, name: 'Tea', price: 40, quantityAvailable: 20 },
            { id: 602, name: 'Coffee', price: 60, quantityAvailable: 18 },
            { id: 603, name: 'Cold Coffee', price: 100, quantityAvailable: 10 },
            { id: 604, name: 'Fresh Lime Soda', price: 80, quantityAvailable: 12 },
            { id: 605, name: 'Mango Shake', price: 120, quantityAvailable: 8 },
            { id: 606, name: 'Banana Shake', price: 110, quantityAvailable: 9 },
            { id: 607, name: 'Lassi', price: 90, quantityAvailable: 11 },
            { id: 608, name: 'Buttermilk', price: 60, quantityAvailable: 15 },
            { id: 609, name: 'Soft Drink', price: 50, quantityAvailable: 25 },
            { id: 610, name: 'Mineral Water', price: 30, quantityAvailable: 30 }
        ],
        7: [ // Chinese
            { id: 701, name: 'Veg Noodles', price: 220, quantityAvailable: 8 },
            { id: 702, name: 'Chicken Noodles', price: 280, quantityAvailable: 6 },
            { id: 703, name: 'Veg Manchurian', price: 240, quantityAvailable: 7 },
            { id: 704, name: 'Chilli Chicken', price: 320, quantityAvailable: 5 },
            { id: 705, name: 'Spring Rolls', price: 200, quantityAvailable: 10 },
            { id: 706, name: 'Momos', price: 180, quantityAvailable: 12 },
            { id: 707, name: 'Hakka Noodles', price: 240, quantityAvailable: 7 },
            { id: 708, name: 'Chowmein', price: 230, quantityAvailable: 8 },
            { id: 709, name: 'Fried Rice', price: 250, quantityAvailable: 9 },
            { id: 710, name: 'Sweet Corn Soup', price: 160, quantityAvailable: 11 }
        ],
        8: [ // Continental
            { id: 801, name: 'Pasta Alfredo', price: 320, quantityAvailable: 6 },
            { id: 802, name: 'Pizza Margherita', price: 380, quantityAvailable: 5 },
            { id: 803, name: 'Burger', price: 220, quantityAvailable: 10 },
            { id: 804, name: 'Sandwich', price: 180, quantityAvailable: 12 },
            { id: 805, name: 'French Fries', price: 140, quantityAvailable: 15 },
            { id: 806, name: 'Garlic Bread', price: 160, quantityAvailable: 11 },
            { id: 807, name: 'Grilled Chicken', price: 400, quantityAvailable: 4 },
            { id: 808, name: 'Fish & Chips', price: 420, quantityAvailable: 5 },
            { id: 809, name: 'Caesar Salad', price: 280, quantityAvailable: 8 },
            { id: 810, name: 'Club Sandwich', price: 240, quantityAvailable: 9 }
        ]
    };

    // Service Categories
    const serviceCategories = [
        { id: 1, name: 'Housekeeping' },
        { id: 2, name: 'Toiletries' },
        { id: 3, name: 'Maintenance' },
        { id: 4, name: 'Guest Requests' }
    ];

    // Service Items
    const serviceList = {
        1: [ // Housekeeping
            { id: 1001, name: 'Room Cleaning', price: 0 },
            { id: 1002, name: 'Extra Bed Sheets', price: 0 },
            { id: 1003, name: 'Pillow Change', price: 0 },
            { id: 1004, name: 'Trash Pickup', price: 0 },
            { id: 1005, name: 'Make Up Room', price: 0 }
        ],
        2: [ // Toiletries
            { id: 2001, name: 'Bath Towel', price: 0 },
            { id: 2002, name: 'Hand Towel', price: 0 },
            { id: 2003, name: 'Soap / Shampoo', price: 0 },
            { id: 2004, name: 'Toothbrush Kit', price: 0 },
            { id: 2005, name: 'Toilet Paper', price: 0 }
        ],
        3: [ // Maintenance
            { id: 3001, name: 'AC Check', price: 0 },
            { id: 3002, name: 'TV Issue', price: 0 },
            { id: 3003, name: 'Plumbing / Leak', price: 0 },
            { id: 3004, name: 'Light Replacement', price: 0 },
            { id: 3005, name: 'Door Lock Issue', price: 0 }
        ],
        4: [ // Guest Requests
            { id: 4001, name: 'Wake Up Call', price: 0 },
            { id: 4002, name: 'Iron & Board', price: 0 },
            { id: 4003, name: 'Hair Dryer', price: 0 },
            { id: 4004, name: 'Distilled Water', price: 0 },
            { id: 4005, name: 'Do Not Disturb', price: 0 }
        ]
    };

    useEffect(() => {
        if (currentOrder && currentOrder.items) {
            setOrderItems(currentOrder.items);
        } else {
            // Load from localStorage if exists
            const savedCart = localStorage.getItem(`pos_cart_${room?.id}`);
            if (savedCart) {
                setOrderItems(JSON.parse(savedCart));
            }
            // Load Services
            const savedServices = localStorage.getItem(`service_cart_${room?.id}`);
            if (savedServices) {
                setServiceItems(JSON.parse(savedServices));
            }
        }
    }, [currentOrder, room]);

    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(''), 2000);
    };

    const updateQuantity = (itemId, delta) => {
        setOrderItems(prevItems => {
            const updated = prevItems.map(item => {
                if (item.id === itemId) {
                    return { ...item, quantity: item.quantity + delta };
                }
                return item;
            }).filter(item => item.quantity > 0);

            // Save to localStorage
            localStorage.setItem(`pos_cart_${room?.id}`, JSON.stringify(updated));
            return updated;
        });
    };

    const addFoodItem = (item) => {
        const existing = orderItems.find(x => x.id === item.id);
        if (existing) {
            updateQuantity(item.id, 1);
        } else {
            const updated = [...orderItems, { ...item, quantity: 1 }];
            setOrderItems(updated);
            localStorage.setItem(`pos_cart_${room?.id}`, JSON.stringify(updated));
        }
        showToast(`${item.name} added to order`);
    };

    const addServiceItem = (item) => {
        const existing = serviceItems.find(x => x.id === item.id);
        if (!existing) {
            const updated = [...serviceItems, { ...item, status: 'Pending', time: new Date().toLocaleTimeString() }];
            setServiceItems(updated);
            localStorage.setItem(`service_cart_${room?.id}`, JSON.stringify(updated));
            showToast(`${item.name} requested`);
        } else {
            showToast(`${item.name} already requested`);
        }
    };

    const removeServiceItem = (itemId) => {
        const updated = serviceItems.filter(item => item.id !== itemId);
        setServiceItems(updated);
        localStorage.setItem(`service_cart_${room?.id}`, JSON.stringify(updated));
    };

    const handleCancelOrder = () => {
        // Remove from localStorage
        localStorage.removeItem(`pos_cart_${room?.id}`);
        const activeOrders = JSON.parse(localStorage.getItem('pos_active_orders') || '[]');
        const filtered = activeOrders.filter(id => id !== room?.id);
        localStorage.setItem('pos_active_orders', JSON.stringify(filtered));

        showToast('Order cancelled successfully');
        setTimeout(() => {
            onUpdateOrder();
            onClose();
        }, 1000);
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const activeList = activeTab === 'food' ? orderItems : serviceItems;
        const title = activeTab === 'food' ? 'Kitchen Order Ticket' : 'Service Request Ticket';

        // Header
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('BAREENA ATHITHI', pageWidth / 2, 20, { align: 'center' });

        doc.setFontSize(14);
        doc.text(title, pageWidth / 2, 30, { align: 'center' });

        // Room Details
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Room: ${room?.roomNumber || 'N/A'}`, 20, 45);
        doc.text(`Guest: ${room?.guestName || 'N/A'}`, 20, 52);
        doc.text(`Date: ${new Date().toLocaleString()}`, 20, 59);

        // Line separator
        doc.setLineWidth(0.5);
        doc.line(20, 65, pageWidth - 20, 65);

        // Table Header
        let yPos = 75;
        doc.setFont('helvetica', 'bold');
        doc.text('Item / Service', 20, yPos);

        if (activeTab === 'food') {
            doc.text('Qty', pageWidth - 60, yPos);
            doc.text('Price', pageWidth - 30, yPos);
        } else {
            doc.text('Status', pageWidth - 40, yPos);
        }

        yPos += 5;
        doc.line(20, yPos, pageWidth - 20, yPos);

        // Items
        yPos += 10;
        doc.setFont('helvetica', 'normal');
        activeList.forEach(item => {
            doc.text(item.name, 20, yPos);
            if (activeTab === 'food') {
                doc.text(item.quantity.toString(), pageWidth - 60, yPos);
                doc.text(`₹${item.price * item.quantity}`, pageWidth - 30, yPos);
            } else {
                doc.text(item.status || 'Pending', pageWidth - 40, yPos);
            }
            yPos += 8;
        });

        // Total (Food Only)
        if (activeTab === 'food') {
            yPos += 5;
            doc.setLineWidth(0.5);
            doc.line(20, yPos, pageWidth - 20, yPos);
            yPos += 10;

            const total = activeList.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(13);
            doc.text(`TOTAL: ₹${total.toFixed(2)}`, pageWidth - 30, yPos, { align: 'right' });
        }

        // Footer
        yPos += 20;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('Thank you!', pageWidth / 2, yPos, { align: 'center' });

        return doc;
    };

    const handleSaveAndPrint = () => {
        // Save to localStorage
        localStorage.setItem(`pos_cart_${room?.id}`, JSON.stringify(orderItems));
        localStorage.setItem(`service_cart_${room?.id}`, JSON.stringify(serviceItems));

        // Generate and download PDF
        const doc = generatePDF();
        doc.save(`KOT_Room_${room?.roomNumber}_${Date.now()}.pdf`);

        showToast('Order saved & printed successfully');
        setTimeout(() => {
            onUpdateOrder();
        }, 1000);
    };

    const handleRoomPosting = () => {
        // Save to localStorage
        localStorage.setItem(`pos_cart_${room?.id}`, JSON.stringify(orderItems));
        localStorage.setItem(`service_cart_${room?.id}`, JSON.stringify(serviceItems));

        showToast('Room posted successfully');
        setTimeout(() => {
            onUpdateOrder();
            onClose();
        }, 1000);
    };

    const currentFoodItems = foodItems[selectedCategory] || [];
    const currentServiceItems = serviceList[selectedServiceCategory] || [];
    const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (!isOpen) return null;

    return (
        <>
            <div className="view-order-overlay" onClick={onClose}>
                <div className="view-order-modal" onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="view-order-header">
                        <h2>Room Service Order – Room {room?.roomNumber} ({room?.guestName})</h2>
                        <button className="view-order-close" onClick={onClose}>×</button>
                    </div>

                    <div className="view-order-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'food' ? 'active' : ''}`}
                            onClick={() => setActiveTab('food')}
                        >
                            Food Order
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'service' ? 'active' : ''}`}
                            onClick={() => setActiveTab('service')}
                        >
                            Room Service
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="view-order-actions">
                        {activeTab === 'food' ? (
                            <>
                                <button
                                    className="view-order-btn add-food"
                                    onClick={() => setShowFoodSelector(!showFoodSelector)}
                                >
                                    Add Food Item
                                </button>
                                <button
                                    className="view-order-btn cancel-order"
                                    onClick={handleCancelOrder}
                                >
                                    Clear Order
                                </button>
                            </>
                        ) : (
                            <div className="service-instructions">Select a category to request services</div>
                        )}
                    </div>

                    {/* Food Selector (Conditional & Tab Dependent) */}
                    {activeTab === 'food' && showFoodSelector && (
                        <div className="food-selector-section">
                            <div className="food-categories">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        className={`food-cat-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(cat.id)}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                            <div className="food-items-grid">
                                {currentFoodItems.map(item => (
                                    <div
                                        key={item.id}
                                        className="food-item-card"
                                        onClick={() => addFoodItem(item)}
                                    >
                                        <div className="food-item-code">#{item.id}</div>
                                        <div className="food-item-name">{item.name}</div>
                                        <div className="food-item-footer">
                                            <div className="food-item-qty">Qty: {item.quantityAvailable}</div>
                                            <div className="food-item-price">₹{item.price}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Service Selector (Tab Dependent) */}
                    {activeTab === 'service' && (
                        <div className="food-selector-section">
                            <div className="food-categories">
                                {serviceCategories.map(cat => (
                                    <button
                                        key={cat.id}
                                        className={`food-cat-btn ${selectedServiceCategory === cat.id ? 'active' : ''}`}
                                        onClick={() => setSelectedServiceCategory(cat.id)}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                            <div className="food-items-grid">
                                {currentServiceItems.map(item => (
                                    <div
                                        key={item.id}
                                        className="food-item-card service-card"
                                        onClick={() => addServiceItem(item)}
                                    >
                                        <div className="food-item-name">{item.name}</div>
                                        <div className="food-item-footer">
                                            <div className="food-item-qty">Request</div>
                                            <div className="food-item-price">Free</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Order Items Table */}
                    <div className="view-order-items">
                        <h3>{activeTab === 'food' ? 'Ordered Items' : 'Requested Services'}</h3>

                        {activeTab === 'food' ? (
                            orderItems.length === 0 ? (
                                <div className="no-items-message">No food items ordered.</div>
                            ) : (
                                <div className="order-items-list">
                                    {orderItems.map(item => (
                                        <div key={item.id} className="order-item-row">
                                            <div className="order-item-name">{item.name}</div>
                                            <div className="order-item-controls">
                                                <button
                                                    className="qty-btn minus"
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                >
                                                    ➖
                                                </button>
                                                <span className="qty-value">{item.quantity}</span>
                                                <button
                                                    className="qty-btn plus"
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                >
                                                    ➕
                                                </button>
                                            </div>
                                            <div className="order-item-price">₹{item.price * item.quantity}</div>
                                        </div>
                                    ))}
                                    <div className="order-total-row">
                                        <span>Total:</span>
                                        <span>₹{total.toFixed(2)}</span>
                                    </div>
                                </div>
                            )
                        ) : (
                            serviceItems.length === 0 ? (
                                <div className="no-items-message">No services requested.</div>
                            ) : (
                                <div className="order-items-list">
                                    {serviceItems.map(item => (
                                        <div key={item.id} className="order-item-row">
                                            <div className="order-item-name">{item.name}</div>
                                            <div className="service-info">
                                                <span className="service-time">{item.time}</span>
                                                <span className="service-status">{item.status}</span>
                                            </div>
                                            <button
                                                className="qty-btn minus"
                                                onClick={() => removeServiceItem(item.id)}
                                                title="Remove Request"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="view-order-footer">
                        <button className="footer-btn cancel" onClick={onClose}>Cancel</button>
                        <button className="footer-btn room-posting" onClick={handleRoomPosting}>Room Posting</button>
                        <button className="footer-btn save-print" onClick={handleSaveAndPrint}>Save & Print</button>
                    </div>
                </div>
            </div>

            {/* Toast */}
            {toastMessage && (
                <div className="view-order-toast">
                    {toastMessage}
                </div>
            )}
        </>
    );
};

export default ViewOrderModal;
