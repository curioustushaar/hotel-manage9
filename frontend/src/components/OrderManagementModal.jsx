import { useState, useEffect } from 'react';
import './OrderManagementModal.css';
import DocumentPreviewModal from './DocumentPreviewModal';
import { orderStorage } from '../utils/orderStorage';
import { useSettings } from '../context/SettingsContext';

const OrderManagementModal = ({ isOpen, onClose, room, currentOrder, onAddFood, onUpdateOrder }) => {
    const { getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();
    const [cart, setCart] = useState([]);
    const [showPreview, setShowPreview] = useState(false);
    const [previewType, setPreviewType] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [notification, setNotification] = useState(null);

    // Initialize cart from current order
    useEffect(() => {
        if (currentOrder && currentOrder.items) {
            setCart(JSON.parse(JSON.stringify(currentOrder.items))); // Deep copy to avoid mutating prop directly
        }
    }, [currentOrder]);

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + tax;

    // Show Notification
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Update Quantity
    const updateQuantity = (itemId, change) => {
        setCart(prevCart => {
            return prevCart.map(item => {
                if (item.id === itemId) {
                    const newQty = Math.max(0, item.quantity + change);
                    return { ...item, quantity: newQty };
                }
                return item;
            }).filter(item => item.quantity > 0); // Remove items with 0 quantity
        });
    };

    // Save Order (Persist changes)
    const handleSaveOrder = (silent = false) => {
        if (cart.length === 0) {
            // If cart is empty, do we cancel the order? 
            // For now, let's just warn or allow empty save (which effectively cancels?)
            // Usually we shouldn't have empty orders.
            if (!silent) showNotification('Cannot save empty order. Use Cancel instead.', 'error');
            return false;
        }

        try {
            const updatedOrder = {
                ...currentOrder,
                items: cart,
                subtotal,
                tax,
                total,
                savedAt: new Date().toISOString()
            };

            orderStorage.saveOrder(room.id, updatedOrder);
            if (onUpdateOrder) onUpdateOrder();
            if (!silent) showNotification('Order updated successfully! ✓', 'success');
            return true;
        } catch (error) {
            console.error('Error saving order:', error);
            if (!silent) showNotification('Failed to save order.', 'error');
            return false;
        }
    };

    // Handle "Add Food"
    const handleAddFoodClick = () => {
        // Auto-save before navigating? 
        // User said "Navigate user to Food Order page".
        // If we don't save, changes might be lost. 
        // Let's save if there are changes.
        handleSaveOrder(true);
        if (onAddFood) onAddFood(room);
        onClose(); // Close this modal
    };

    // Cancel Order Flow
    const handleCancelClick = () => {
        setShowCancelConfirm(true);
    };

    const confirmCancelOrder = () => {
        try {
            orderStorage.deleteOrder(room.id);
            if (onUpdateOrder) onUpdateOrder();
            onClose();
        } catch (error) {
            console.error('Error cancelling order:', error);
            showNotification('Failed to cancel order.', 'error');
        }
    };

    // Print KOT
    const handlePrintKOT = () => {
        // Save first to ensure consistency?
        // Let's just generate preview from current state (like FoodOrderPage)
        if (cart.length === 0) return;

        const kotData = {
            kotNumber: `KOT-${Date.now()}`,
            room: {
                roomNumber: room.roomNumber,
                guestName: room.guestName
            },
            orderType: currentOrder.orderType || 'roomservice',
            items: cart,
            totalItems: cart.reduce((sum, item) => sum + item.quantity, 0),
            date: new Date().toLocaleDateString('en-IN'),
            time: new Date().toLocaleTimeString('en-IN')
        };

        setPreviewData(kotData);
        setPreviewType('kot');
        setShowPreview(true);
    };

    // Print Bill
    const handlePrintBill = () => {
        if (cart.length === 0) return;

        const billData = {
            billNumber: currentOrder.orderId || `INV-${Date.now()}`,
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

        setPreviewData(billData);
        setPreviewType('bill');
        setShowPreview(true);
    };

    // Settle
    const handleSettle = () => {
        // Same as Cancel/Delete but implies payment.
        // For now, just remove order as per FoodOrderPage logic
        if (window.confirm('Are you sure you want to settle this order?')) {
            orderStorage.deleteOrder(room.id);
            if (onUpdateOrder) onUpdateOrder();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="management-modal-overlay">
            <div className="management-modal">
                {/* Header */}
                <div className="management-header">
                    <div className="header-left">
                        <h2>Order Details: Room {room?.roomNumber}</h2>
                        <p>{room?.guestName}</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn-add-food" onClick={handleAddFoodClick}>
                            <span>+</span> Add Food
                        </button>
                        <button className="btn-cancel-order" onClick={handleCancelClick}>
                            Cancel Order
                        </button>
                        <button className="btn-close-modal" onClick={onClose}>×</button>
                    </div>
                </div>

                {/* Items List */}
                <div className="management-content">
                    {/* Notification Toast */}
                    {notification && (
                        <div style={{
                            padding: '10px',
                            margin: '10px',
                            borderRadius: '4px',
                            textAlign: 'center',
                            backgroundColor: notification.type === 'error' ? '#f8d7da' : '#d1e7dd',
                            color: notification.type === 'error' ? '#721c24' : '#0f5132',
                            animation: 'fadeIn 0.3s'
                        }}>
                            {notification.message}
                        </div>
                    )}

                    <div className="items-list-container">
                        {cart.length > 0 ? (
                            cart.map(item => (
                                <div key={item.id} className="order-edit-item">
                                    <div className="item-info">
                                        <span className="item-name">{item.name}</span>
                                        <span className="item-price">{cs}{item.price}</span>
                                    </div>
                                    <div className="item-controls">
                                        <div className="qty-control-group">
                                            <button
                                                className="btn-qty"
                                                onClick={() => updateQuantity(item.id, -1)}
                                            >
                                                −
                                            </button>
                                            <span className="qty-display">{item.quantity}</span>
                                            <button
                                                className="btn-qty"
                                                onClick={() => updateQuantity(item.id, 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="item-total">
                                            {cs}{item.price * item.quantity}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                No items in order. Add food or cancel order.
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    <div className="order-summary-section">
                        <div className="summary-row">
                            <span>Subtotal:</span>
                            <span>{cs}{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Tax (5%):</span>
                            <span>{cs}{tax.toFixed(2)}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Grand Total:</span>
                            <span>{cs}{total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="management-actions">
                    <button className="action-btn btn-print-kot" onClick={handlePrintKOT} disabled={cart.length === 0}>
                        🖨️ Print KOT
                    </button>
                    <button className="action-btn btn-save" onClick={() => handleSaveOrder(false)} disabled={cart.length === 0}>
                        💾 Save Order
                    </button>
                    <button className="action-btn btn-print-bill" onClick={handlePrintBill} disabled={cart.length === 0}>
                        🧾 Print Bill
                    </button>
                    <button className="action-btn btn-settle" onClick={handleSettle} disabled={cart.length === 0}>
                        💰 Settle
                    </button>
                </div>
            </div>

            {/* Document Preview Modal for KOT/Bill */}
            {showPreview && (
                <DocumentPreviewModal
                    isOpen={showPreview}
                    onClose={() => setShowPreview(false)}
                    documentType={previewType}
                    data={previewData}
                />
            )}

            {/* Confirmation Popup */}
            {showCancelConfirm && (
                <div className="confirm-overlay" onClick={() => setShowCancelConfirm(false)}>
                    <div className="confirm-box" onClick={e => e.stopPropagation()}>
                        <h3>Cancel Order?</h3>
                        <p>Are you sure you want to cancel this order? This action cannot be undone.</p>
                        <div className="confirm-actions">
                            <button className="confirm-btn confirm-no" onClick={() => setShowCancelConfirm(false)}>
                                Keep Order
                            </button>
                            <button className="confirm-btn confirm-yes" onClick={confirmCancelOrder}>
                                Yes, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagementModal;
