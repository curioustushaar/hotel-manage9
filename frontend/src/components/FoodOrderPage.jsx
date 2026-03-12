import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL_CONFIG from '../config/api';
import { useSettings } from '../context/SettingsContext';
import './FoodOrderPage.css';

const FoodOrderPage = ({ onClose, room: roomProp }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { settings, getCurrencySymbol, getFullAddress } = useSettings();
    const cs = getCurrencySymbol();
    const { room: roomState, source, orderMode } = location.state || {};

    // Prefer prop over state (prop comes from AdminDashboard posGuestDetails)
    const room = roomProp || roomState;

    const isDirectAccess = !room && !source && !orderMode;

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
        localStorage.removeItem('authUser');
        navigate('/login');
    };

    const handleClose = () => {
        if (onClose) {
            onClose();
            return;
        }

        if (source === 'room-service') {
            navigate('/admin/room-service');
        } else if (source === 'table-order') {
            navigate('/admin/guest-meal-service');
        } else if (source === 'food-menu') {
            navigate('/admin/food-menu');
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
                setMenuItems(data.data);
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
            quantityAvailable: item.quantity !== undefined ? item.quantity : 0,
            status: item.status,
            description: item.description,
            image: item.image || null
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
    const [activeOrderType, setActiveOrderType] = useState(() => {
        if (location.state?.orderMode === 'takeaway') return 'takeaway';
        if (room?.mode === 'takeaway' || room?.roomNumber === 'Take Away') return 'takeaway';
        if (source === 'room-service' || orderMode === 'roomservice') return 'roomservice';
        if (room?.id) return 'dinein';
        return 'dinein';
    });

    useEffect(() => {
        if (location.state?.orderMode === 'takeaway') {
            setActiveOrderType('takeaway');
        } else if (room?.mode === 'takeaway' || room?.roomNumber === 'Take Away') {
            setActiveOrderType('takeaway');
        } else if (source === 'room-service' || orderMode === 'roomservice') {
            setActiveOrderType('roomservice');
        } else if (room?.id) {
            setActiveOrderType('dinein');
        }
    }, [room, source, orderMode, location.state]);

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

    const [orderId, setOrderId] = useState(location.state?.orderId || null);
    const [taxRate, setTaxRate] = useState(5); // Default 5%
    const [isTaxApplied, setIsTaxApplied] = useState(false);

    // New Features States
    const [billComment, setBillComment] = useState('');
    const [kotNote, setKotNote] = useState('');
    const [activeNoteType, setActiveNoteType] = useState('BILL'); // 'BILL' or 'KOT'
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    // Tender Modal States
    const [showTenderModal, setShowTenderModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [receivedAmount, setReceivedAmount] = useState('');
    const [smsModal, setSmsModal] = useState({ show: false, name: '', phone: '' });
    const [emailModal, setEmailModal] = useState({ show: false, name: '', email: '' });
    const [validationErrors, setValidationErrors] = useState({});
    const [isSendingSms, setIsSendingSms] = useState(false);

    // Initialize customer if room-service or if guest details passed in state
    useEffect(() => {
        if (room) {
            setSelectedCustomer({
                id: room.guestId || room._id,
                name: room.guestName,
                phone: room.guestPhone || room.mobileNumber || room.phoneNumber,
                roomNumber: room.roomNumber,
                type: (activeOrderType === 'roomservice' || activeOrderType === 'room') ? 'room' : 'direct'
            });
        }
    }, [room, activeOrderType]);

    // Fetch existing order if available
    useEffect(() => {
        if (orderId) {
            fetchOrderById(orderId);
        } else if (room?.id) {
            fetchExistingOrder();
        }
    }, [room, orderId]);

    const fetchOrderById = async (id) => {
        try {
            const response = await fetch(`${API_URL_CONFIG}/api/guest-meal/orders/${id}`);
            const data = await response.json();
            if (data.success && data.data) {
                setOrderId(data.data._id);
                setTaxRate(data.data.taxRate || 5);
                setIsTaxApplied((data.data.tax || 0) > 0);
                setBillComment(data.data.notes || '');
                setKotNote(data.data.kotNote || ''); // Populate KOT Note
                // Map items back to cart format
                const mappedCart = data.data.items.map(item => ({
                    id: item.id || item.menuItem || item._id,
                    name: item.name || item.itemName,
                    price: item.price,
                    quantity: item.quantity,
                    category: item.category,
                    subtotal: item.subtotal
                }));
                setCart(mappedCart);
            }
        } catch (error) {
            console.error('Error fetching order by ID:', error);
        }
    };

    const fetchExistingOrder = async () => {
        try {
            const response = await fetch(`${API_URL_CONFIG}/api/guest-meal/orders/table/${room.id}`);
            const data = await response.json();
            if (data.success && data.data) {
                setOrderId(data.data._id);
                setTaxRate(data.data.taxRate || 5);
                setIsTaxApplied((data.data.tax || 0) > 0);
                setBillComment(data.data.notes || '');
                setKotNote(data.data.kotNote || ''); // Populate KOT Note
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
            }
        } catch (error) {
            console.error('Error fetching existing order:', error);
        }
    };

    // Calculations
    // Calculations
    const subtotal = Array.isArray(cart) ? cart.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0) : 0;
    const taxAmount = isTaxApplied ? (subtotal * Number(taxRate || 0)) / 100 : 0;
    const total = subtotal + taxAmount;

    // Handlers
    const saveOrderToBackend = async () => {
        if (!settings.posEnabled) {
            alert('POS is currently disabled. Please enable POS from Company Settings to create orders.');
            return false;
        }
        try {
            // Robust check: allow missing room for takeaway and room service
            const effectiveRoom = room ||
                (activeOrderType === 'takeaway' ? { roomNumber: 'Take Away', guestName: 'Walk-in' } :
                    (activeOrderType === 'roomservice' ? { roomNumber: 'Room Service', guestName: 'Guest' } : null));

            if (!effectiveRoom) return false;

            const tId = effectiveRoom.id || effectiveRoom._id;
            const tNum = parseInt((effectiveRoom.roomNumber ? String(effectiveRoom.roomNumber) : '0').replace(/\D/g, ''), 10) || 0;
            const finalGuestName = effectiveRoom.guestName || location.state?.customerName || 'Walk-in';

            // Only block if it's a dine-in order with no table
            if (!tId && !orderId && activeOrderType !== 'takeaway' && activeOrderType !== 'roomservice' && activeOrderType !== 'room') {
                console.error('Missing table ID and order ID');
                return false;
            }

            const orderData = {
                tableId: (activeOrderType === 'takeaway' || activeOrderType === 'roomservice' || activeOrderType === 'room') ? null : tId,
                tableNumber: activeOrderType === 'takeaway' ? 0 : tNum,
                guestName: selectedCustomer?.name || finalGuestName,
                guestPhone: selectedCustomer?.phone || effectiveRoom.phoneNumber || location.state?.customerPhone || null,
                roomNumber: selectedCustomer?.roomNumber || effectiveRoom.roomNumber || 'Take Away',
                orderType: (activeOrderType === 'roomservice' || activeOrderType === 'room') ? 'Post to Room' :
                    activeOrderType === 'takeaway' ? 'Take Away' : 'Direct Payment',
                taxRate: isTaxApplied ? Number(taxRate) : 0,
                notes: billComment, // Bill Wise Comment
                kotNote: kotNote, // Special Note (KOT Only)
                guest: selectedCustomer?.id || null, // Link to Guest model
                items: cart.map(item => ({
                    id: item.id || item._id, // Ensure id is passed
                    name: item.name,
                    price: Number(item.price),
                    quantity: Number(item.quantity),
                    category: item.category,
                    subtotal: Number(item.price) * Number(item.quantity)
                }))
            };

            let response;
            if (orderId) {
                response = await fetch(`${API_URL_CONFIG}/api/guest-meal/orders/${orderId}/items`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: orderData.items,
                        taxRate: orderData.taxRate,
                        notes: orderData.notes,
                        kotNote: orderData.kotNote,
                        guestName: orderData.guestName,
                        guestPhone: orderData.guestPhone,
                        guest: orderData.guest
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
        // Validation for Dine In - Require Table
        if (activeOrderType !== 'takeaway' && activeOrderType !== 'roomservice' && !room?.id && !orderId) {
            addToast('Error: No table selected');
            return;
        }

        const success = await saveOrderToBackend();
        if (success) {
            addToast('Saved to KOT');
            // Navigate immediately to Current Orders (KOT View) showing All orders
            // This ensures the new order is visible along with outlet status functionality
            navigate('/admin/dashboard', {
                state: {
                    activeMenu: 'view-order',
                    activeFilter: 'All', // Show all types (Dine In, Take Away, Room, Online)
                    activeTab: 'Current Orders' // Force to Current Orders view (previously KOT View)
                }
            });
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
            let targetFilter = 'All';
            if (activeOrderType === 'takeaway') targetFilter = 'Take Away';
            else if (activeOrderType === 'roomservice') targetFilter = 'Room Order';
            else if (activeOrderType === 'dinein') targetFilter = 'Dine In';

            navigate('/admin/dashboard', { state: { activeMenu: 'view-order', activeFilter: targetFilter } });
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
            // Show SMS/Email options directly or stay on page
            // For now, staying on page to allow SMS/Email then navigate
        } else {
            addToast('Failed to post to room');
        }
    };

    const handleTenderSubmit = async () => {
        const success = await saveOrderToBackend();
        if (success) {
            addToast(`Payment of ${cs}${total} received via ${paymentMethod}`);
            // Success logic - we can either close or stay to show SMS/Email
        } else {
            addToast('Error processing payment');
        }
    };

    const openSmsModal = () => {
        setSmsModal({
            show: true,
            name: selectedCustomer?.name || room?.guestName || '',
            phone: selectedCustomer?.phone || room?.guestPhone || ''
        });
    };

    const openEmailModal = () => {
        setEmailModal({
            show: true,
            name: selectedCustomer?.name || room?.guestName || '',
            email: selectedCustomer?.email || room?.guestEmail || ''
        });
    };

    const sendSms = async () => {
        // Validation: 10-digit Indian mobile number
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!smsModal.phone || !phoneRegex.test(smsModal.phone.replace(/\D/g, ''))) {
            setValidationErrors({ ...validationErrors, phone: 'Enter a valid 10-digit mobile number' });
            return;
        }

        setIsSendingSms(true);
        setValidationErrors({ ...validationErrors, phone: null });

        // Generate dynamic mall-style message content
        const hotelName = settings.name || "Hotel";
        const billNo = orderId ? orderId.toString().slice(-6).toUpperCase() : 'N/A';
        const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        const timeStr = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

        const smsContent = `${hotelName}\nBill #${billNo}\nAmt ${getCurrencySymbol()}${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n${dateStr} ${timeStr}\n${settings.thankYouMessage || 'Thank you visit again'}`;

        try {
            const savedUser = localStorage.getItem('authUser');
            let token = '';
            if (savedUser) {
                const parsedUser = JSON.parse(savedUser);
                token = parsedUser.token;
            }

            // Realistic API call (triggering backend notification service)
            const response = await fetch(`${API_URL_CONFIG}/api/notifications/send-sms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    phone: smsModal.phone,
                    message: smsContent,
                    orderId: orderId,
                    type: 'TRANSACTIONAL_RECEIPT'
                })
            });

            const data = await response.json();

            if (data.success) {
                addToast(`SMS receipt sent to ${smsModal.phone}`);
                setSmsModal({ ...smsModal, show: false });
            } else {
                throw new Error(data.message || 'Failed to send SMS');
            }
        } catch (error) {
            console.error('SMS Send Error:', error);
            // Fallback for demonstration since actual backend might not have the route yet
            addToast(`Error: ${error.message || 'Failed to send SMS'}`);
        } finally {
            setIsSendingSms(false);
        }
    };

    const sendEmail = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailModal.email || !emailRegex.test(emailModal.email)) {
            setValidationErrors({ ...validationErrors, email: 'Enter a valid email address' });
            return;
        }
        setValidationErrors({ ...validationErrors, email: null });
        addToast(`Email sent successfully to ${emailModal.email}`);
        setEmailModal({ ...emailModal, show: false });
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

        if (printModal === 'KOT') addToast('Saved to KOT & downloaded');
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
            addToast('Saved to KOT');
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
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="pos-layout-wrapper"
        >
            {!settings.posEnabled && (
                <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px 20px', margin: '10px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>⚠️</span>
                    <span style={{ color: '#991b1b', fontWeight: 600 }}>POS is disabled. Order creation is blocked. Enable POS from Company Settings.</span>
                </div>
            )}
            <div className="pos-container">
                {/* LEFT PANEL (60%) */}
                <div className="pos-left-panel">
                    {/* A. Top Search Row */}
                    <div className="pos-search-row">
                        <input
                            className="pos-search-input"
                            placeholder="Search item by name"
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
                                    const isOutOfStock = item.status === 'Inactive';

                                    return (
                                        <div
                                            key={item.id}
                                            className={`pos-food-card ${inCartQty > 0 ? 'has-qty' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
                                            onClick={() => !isOutOfStock && addToCart(item)}
                                        >
                                            {/* Food Image */}
                                            <div className="pos-card-image-wrapper">
                                                {item.image ? (
                                                    <img
                                                        src={`${API_URL_CONFIG}${item.image}`}
                                                        alt={item.name}
                                                        className="pos-card-image"
                                                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                    />
                                                ) : null}
                                                <div className="pos-card-image-placeholder" style={item.image ? { display: 'none' } : {}}>
                                                    <span>🍽️</span>
                                                </div>
                                                {inCartQty > 0 && (
                                                    <div className="pos-card-badge">Qty: {inCartQty}</div>
                                                )}
                                                {isOutOfStock && (
                                                    <div className="out-of-stock-badge">Out of Stock</div>
                                                )}
                                            </div>
                                            {/* Card Body */}
                                            <div className="pos-card-body">
                                                <div className="pos-card-code">#{item.code || item.id.substring(0, 6)}</div>
                                                <div className="pos-card-name">{item.name}</div>
                                                {item.description && (
                                                    <div className="pos-card-description">{item.description}</div>
                                                )}
                                            </div>
                                            {/* Card Footer */}
                                            <div className="pos-card-footer">
                                                <div className="pos-card-qty-available">
                                                    {isOutOfStock ? 'Unavailable' : 'Available'}
                                                </div>
                                                <div className="pos-card-price">{cs}{item.price}</div>
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
                            disabled={(orderMode && orderMode !== 'dinein') || source === 'room-service' || isDirectAccess}
                            style={{ opacity: ((orderMode && orderMode !== 'dinein') || source === 'room-service' || isDirectAccess) ? 0.5 : 1, cursor: ((orderMode && orderMode !== 'dinein') || source === 'room-service' || isDirectAccess) ? 'not-allowed' : 'pointer' }}
                        >
                            Dine In (F1)
                        </button>
                        <button
                            className={`pos-mode-btn ${activeOrderType === 'takeaway' ? 'active' : ''}`}
                            onClick={() => setActiveOrderType('takeaway')}
                            disabled={(orderMode && orderMode !== 'takeaway') || source === 'room-service' || isDirectAccess}
                            style={{ opacity: ((orderMode && orderMode !== 'takeaway') || source === 'room-service' || isDirectAccess) ? 0.5 : 1, cursor: ((orderMode && orderMode !== 'takeaway') || source === 'room-service' || isDirectAccess) ? 'not-allowed' : 'pointer' }}
                        >
                            Take Away (F3)
                        </button>
                        <button
                            className={`pos-mode-btn ${activeOrderType === 'online' ? 'active' : ''}`}
                            onClick={() => setActiveOrderType('online')}
                            disabled={!!orderMode || source === 'room-service' || isDirectAccess}
                            style={{ opacity: (!!orderMode || source === 'room-service' || isDirectAccess) ? 0.5 : 1, cursor: (!!orderMode || source === 'room-service' || isDirectAccess) ? 'not-allowed' : 'pointer' }}
                        >
                            Online Order (F5)
                        </button>
                        <button
                            className={`pos-mode-btn ${activeOrderType === 'roomservice' ? 'active' : ''}`}
                            onClick={() => setActiveOrderType('roomservice')}
                            disabled={(orderMode && orderMode !== 'roomservice') || isDirectAccess}
                            style={{ opacity: (orderMode && orderMode !== 'roomservice' || isDirectAccess) ? 0.5 : 1, cursor: (orderMode && orderMode !== 'roomservice' || isDirectAccess) ? 'not-allowed' : 'pointer' }}
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
                            <div className="pos-room-no">
                                {activeOrderType === 'dinein' ? 'Table ' : (activeOrderType === 'roomservice' ? 'Room ' : '')}
                                {room?.roomNumber || (activeOrderType === 'takeaway' ? 'Take Away' : '')}
                            </div>
                            <div className="pos-guest-name">{room?.guestName || 'Guest Name'}</div>
                        </div>
                        <div className="pos-action-buttons-group">
                            <button
                                className={`pos-action-btn ${selectedCustomer ? 'active' : ''}`}
                                onClick={() => setShowCustomerModal(true)}
                            >
                                {selectedCustomer ? '👤 ' + selectedCustomer.name.split(' ')[0] : 'Add Customer'}
                            </button>
                            <button
                                className={`pos-action-btn ${billComment ? 'active' : ''}`}
                                onClick={() => { setActiveNoteType('BILL'); setShowCommentModal(true); }}
                            >
                                {billComment ? '📝 Note Added' : 'Bill Wise Comment'}
                            </button>
                            <button className="pos-action-btn">Delivery Boy</button>
                            <button className="pos-action-btn">Home Delivery</button>
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
                                            <td style={{ textAlign: 'right' }} className="pos-cart-price">{cs}{item.price * item.quantity}</td>
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
                            <span>{cs}{subtotal.toFixed(2)}</span>
                        </div>

                        {isTaxApplied && (
                            <div className="pos-total-row">
                                <span>Tax ({taxRate}%)</span>
                                <span>{cs}{taxAmount.toFixed(2)}</span>
                            </div>
                        )}

                        <div className="pos-total-row final" style={{ borderTop: '2px solid #e2e8f0', marginTop: '10px', paddingTop: '10px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>Grand Total</span>
                                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '500' }}>
                                    {isTaxApplied ? `Incl. ${taxRate}% Tax` : 'Zero Tax'}
                                </span>
                            </div>
                            <span style={{ fontSize: '1.4rem', color: '#dc2626' }}>{cs}{total.toFixed(2)}</span>
                        </div>

                        {/* ACTION BAR */}
                        <div className="pos-action-bar">
                            <button className="pos-action-btn" style={{ width: '100%' }} onClick={() => { setActiveNoteType('KOT'); setShowCommentModal(true); }}>Special Note</button>
                        </div>

                        {/* TWO ROWS BELOW */}
                        <div className="pos-footer-rows">
                            {/* KOT ROW */}
                            <div className="pos-footer-row" style={{ height: '40px' }}>
                                <div className="pos-row-label kot" style={{ fontSize: '10px' }}>KOT</div>
                                <div className="pos-row-btns">
                                    <button className="pos-footer-btn" onClick={handleSaveKOT}>Save (K)</button>
                                    <button className="pos-footer-btn" onClick={handleSavePrintKOT}>Save & Print(F4)</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Customer Modal */}
            <AnimatePresence>
                {showCustomerModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="pos-modal-overlay"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="pos-modal-content"
                            style={{ width: '500px' }}
                        >
                            <div className="pos-modal-header">
                                <h3>Add Customer</h3>
                                <button className="pos-modal-close" onClick={() => setShowCustomerModal(false)}>×</button>
                            </div>
                            <div className="pos-modal-body" style={{ background: '#fff', padding: '20px', display: 'block' }}>
                                <div className="customer-modal-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                                    <button className="pos-footer-btn active">Search / New</button>
                                    <button className="pos-footer-btn" onClick={() => {
                                        setShowCustomerModal(false);
                                        // Logic for room guests can be added here
                                    }}>In-House Room</button>
                                </div>

                                <div className="customer-form">
                                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#666' }}>MOBILE NUMBER</label>
                                    <input
                                        type="text"
                                        className="pos-search-input"
                                        placeholder="Enter mobile number..."
                                        style={{ width: '100%', marginBottom: '15px', background: '#fff' }}
                                        onChange={async (e) => {
                                            if (e.target.value.length >= 10) {
                                                try {
                                                    const res = await fetch(`${API_URL_CONFIG}/api/guests/search?query=${e.target.value}`);
                                                    const data = await res.json();
                                                    if (data.success && data.data && data.data.length > 0) {
                                                        const g = data.data[0];
                                                        setSelectedCustomer({
                                                            id: g._id,
                                                            name: g.fullName,
                                                            phone: g.mobile,
                                                            type: 'regular'
                                                        });
                                                    }
                                                } catch (err) { }
                                            }
                                        }}
                                    />

                                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#666' }}>GUEST NAME</label>
                                    <input
                                        type="text"
                                        className="pos-search-input"
                                        placeholder="Enter guest name..."
                                        value={selectedCustomer?.name || ''}
                                        style={{ width: '100%', marginBottom: '15px', background: '#fff' }}
                                        onChange={(e) => setSelectedCustomer({ ...selectedCustomer, name: e.target.value, type: 'walkin' })}
                                    />

                                    <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '6px', fontSize: '13px', color: '#dc2626' }}>
                                        {selectedCustomer ? `Linked to: ${selectedCustomer.name}` : 'No customer linked'}
                                    </div>
                                </div>
                            </div>
                            <div className="pos-modal-footer">
                                <button className="pos-modal-btn cancel" onClick={() => {
                                    setSelectedCustomer(null);
                                    setShowCustomerModal(false);
                                }}>Clear</button>
                                <button className="pos-modal-btn print" onClick={() => setShowCustomerModal(false)}>Apply</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {showCommentModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="pos-modal-overlay"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="pos-modal-content"
                            style={{ width: '400px' }}
                        >
                            <div className="pos-modal-header">
                                <h3>{activeNoteType === 'KOT' ? 'Special KOT Note' : 'Bill Wise Comment'}</h3>
                                <button className="pos-modal-close" onClick={() => setShowCommentModal(false)}>×</button>
                            </div>
                            <div className="pos-modal-body" style={{ background: '#fff', padding: '20px', display: 'block' }}>
                                <textarea
                                    className="pos-search-input"
                                    placeholder={activeNoteType === 'KOT' ? "Add note for the kitchen..." : "Add comment for the bill..."}
                                    style={{ width: '100%', height: '120px', resize: 'none', background: '#fff', fontSize: '14px' }}
                                    value={activeNoteType === 'KOT' ? kotNote : billComment}
                                    onChange={(e) => activeNoteType === 'KOT' ? setKotNote(e.target.value) : setBillComment(e.target.value)}
                                />
                            </div>
                            <div className="pos-modal-footer">
                                <button className="pos-modal-btn cancel" onClick={() => {
                                    activeNoteType === 'KOT' ? setKotNote('') : setBillComment('');
                                    setShowCommentModal(false);
                                }}>Clear</button>
                                <button className="pos-modal-btn print" onClick={() => setShowCommentModal(false)}>Save Note</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {showTenderModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="pos-modal-overlay"
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="pos-tender-modal"
                        >
                            <div className="pos-modal-header">
                                <h3>PAYMENT SECTION</h3>
                                <button className="pos-modal-close" onClick={() => setShowTenderModal(false)}>×</button>
                            </div>
                            <div className="pos-tender-body">
                                <div className="payment-method-grid">
                                    <button className={`method-btn ${paymentMethod === 'Cash' ? 'active' : ''}`} onClick={() => setPaymentMethod('Cash')}>
                                        <span>💵</span> Cash
                                    </button>
                                    <button className={`method-btn ${paymentMethod === 'UPI' ? 'active' : ''}`} onClick={() => setPaymentMethod('UPI')}>
                                        <span>📱</span> UPI
                                    </button>
                                    <button className={`method-btn ${paymentMethod === 'Card' ? 'active' : ''}`} onClick={() => setPaymentMethod('Card')}>
                                        <span>💳</span> Card
                                    </button>
                                </div>

                                <div className="tender-total-display">
                                    <span className="label">Grand Total</span>
                                    <span className="value">{cs}{total.toFixed(2)}</span>
                                </div>

                                <div className="received-input-wrapper">
                                    <label>RECEIVED AMOUNT</label>
                                    <div className="input-group">
                                        <span className="currency">{cs}</span>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={receivedAmount}
                                            onChange={(e) => setReceivedAmount(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="return-amount-row">
                                    <span className="label">Return Amount</span>
                                    <span className="value">{cs}{Math.max(0, (Number(receivedAmount) - total)).toFixed(2)}</span>
                                </div>

                                <div className="tender-utility-btns">
                                    <button className="utility-btn" onClick={() => setPrintModal('BILL')}>
                                        <span>📄</span> Print Bill
                                    </button>
                                    <button className="utility-btn" onClick={openSmsModal}>
                                        <span>💬</span> SMS Receipt
                                    </button>
                                    <button className="utility-btn" onClick={openEmailModal}>
                                        <span>📧</span> Email
                                    </button>
                                </div>

                                <button className="main-tender-btn" onClick={handleTenderSubmit}>
                                    Tender {cs}{total}
                                </button>

                                <div className="room-posting-section">
                                    <h4>Room Posting Today</h4>
                                    <div className="posting-row">
                                        <button className="posting-btn room" onClick={handleRoomPosting}>
                                            <span>🏨</span>
                                        </button>
                                        <button className="posting-btn sms" onClick={openSmsModal}>
                                            <span>💬</span> SMS Receipt
                                        </button>
                                        <button className="posting-btn email" onClick={openEmailModal}>
                                            <span>📧</span> Email
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {smsModal.show && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="pos-modal-overlay"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="message-modal"
                        >
                            <div className="pos-modal-header">
                                <h3>Send SMS Receipt</h3>
                                <button className="pos-modal-close" onClick={() => setSmsModal({ ...smsModal, show: false })}>×</button>
                            </div>
                            <div className="message-modal-body">
                                <div className="form-field">
                                    <label>Customer Name</label>
                                    <input
                                        type="text"
                                        value={smsModal.name}
                                        onChange={(e) => setSmsModal({ ...smsModal, name: e.target.value })}
                                        placeholder="Guest Name"
                                    />
                                </div>
                                <div className="form-field">
                                    <label>Mobile Number {!smsModal.phone && <span style={{ color: '#dc2626' }}>*</span>}</label>
                                    <input
                                        type="text"
                                        maxLength="10"
                                        value={smsModal.phone}
                                        onChange={(e) => setSmsModal({ ...smsModal, phone: e.target.value.replace(/\D/g, '') })}
                                        placeholder="Enter 10-digit mobile number"
                                        style={{ borderColor: validationErrors.phone ? '#dc2626' : '#e2e8f0' }}
                                    />
                                    {validationErrors.phone && <span className="error-text" style={{ color: '#dc2626', fontSize: '11px', marginTop: '4px', display: 'block' }}>{validationErrors.phone}</span>}
                                </div>
                                <div className="template-preview" style={{ marginTop: '15px' }}>
                                    <strong style={{ fontSize: '12px', color: '#64748b' }}>SMS Receipt Preview (Mall Style):</strong>
                                    <div style={{
                                        background: '#f8fafc',
                                        padding: '12px',
                                        borderRadius: '6px',
                                        border: '1px dashed #cbd5e1',
                                        fontSize: '13px',
                                        lineHeight: '1.5',
                                        color: '#1e293b',
                                        marginTop: '8px',
                                        whiteSpace: 'pre-wrap',
                                        fontFamily: 'monospace'
                                    }}>
                                        {`${settings.name || 'Hotel'}
Bill #${orderId ? orderId.toString().slice(-6).toUpperCase() : 'N/A'}
Amt ${getCurrencySymbol()}${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}
${settings.thankYouMessage || 'Thank you visit again'}`}
                                    </div>
                                </div>
                            </div>
                            <div className="pos-modal-footer">
                                <button
                                    className="pos-modal-btn print"
                                    onClick={sendSms}
                                    disabled={isSendingSms}
                                    style={{ opacity: isSendingSms ? 0.7 : 1, width: '100%', justifyContent: 'center' }}
                                >
                                    {isSendingSms ? 'Sending Receipt...' : 'Send SMS Receipt'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {emailModal.show && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="pos-modal-overlay"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="message-modal"
                        >
                            <div className="pos-modal-header">
                                <h3>Send Payment Email</h3>
                                <button className="pos-modal-close" onClick={() => setEmailModal({ ...emailModal, show: false })}>×</button>
                            </div>
                            <div className="message-modal-body">
                                <div className="form-field">
                                    <label>Customer Name</label>
                                    <input
                                        type="text"
                                        value={emailModal.name}
                                        onChange={(e) => setEmailModal({ ...emailModal, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-field">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        value={emailModal.email}
                                        onChange={(e) => setEmailModal({ ...emailModal, email: e.target.value })}
                                    />
                                    {validationErrors.email && <span className="error-text">{validationErrors.email}</span>}
                                </div>
                                <div className="template-preview">
                                    <strong>Preview:</strong>
                                    <p>Subject: Payment Receipt – {settings.name || 'Hotel'}</p>
                                    <p>Dear {emailModal.name || 'Customer'}, We have received your payment of {getCurrencySymbol()}{total}. Thank you for choosing {settings.name || 'Hotel'}.</p>
                                </div>
                            </div>
                            <div className="pos-modal-footer">
                                <button className="pos-modal-btn print" onClick={sendEmail}>Send Email</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {printModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="pos-modal-overlay"
                    >
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className="pos-modal-content"
                        >
                            <div className="pos-modal-header">
                                <h3>{printModal === 'KOT' ? 'KOT PREVIEW' : 'BILL PREVIEW'}</h3>
                                <button className="pos-modal-close" onClick={() => setPrintModal(null)}>×</button>
                            </div>
                            <div className="pos-modal-body" style={{ background: '#fff' }}>
                                {printModal === 'BILL' ? (
                                    <div className="pos-preview-bill-v2" style={{ padding: '20px', width: '100%' }}>
                                        <h2 style={{ textAlign: 'center', margin: '0' }}>{settings.name || 'Hotel'}</h2>
                                        <p style={{ textAlign: 'center', marginBottom: '15px' }}>Receipt / Bill</p>
                                        <div style={{ fontSize: '13px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                            <p>Room: {room?.roomNumber}</p>
                                            <p>Guest: {room?.guestName}</p>
                                        </div>
                                        <table style={{ width: '100%', marginTop: '10px', fontSize: '13px' }}>
                                            <thead><tr style={{ borderBottom: '1px solid #eee' }}><th align="left">Item</th><th>Qty</th><th align="right">Total</th></tr></thead>
                                            <tbody>{cart.map(item => <tr key={item.id}><td>{item.name}</td><td align="center">{item.quantity}</td><td align="right">{getCurrencySymbol()}{item.price * item.quantity}</td></tr>)}</tbody>
                                        </table>
                                        <div style={{ borderTop: '2px solid #333', marginTop: '15px', paddingTop: '10px', textAlign: 'right' }}>
                                            <h3 style={{ margin: '0' }}>Total: {getCurrencySymbol()}{total.toFixed(2)}</h3>
                                            {billComment && <p style={{ marginTop: '15px', fontStyle: 'italic', background: '#f8f9fa', padding: '10px', textAlign: 'left', border: '1px solid #eee', fontSize: '12px' }}><strong>Note:</strong> {billComment}</p>}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="pos-preview-kot-v2" style={{ padding: '20px', width: '100%' }}>
                                        <h2 style={{ textAlign: 'center' }}>KITCHEN ORDER</h2>
                                        <div style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '10px' }}>
                                            <p>Room: {room?.roomNumber}</p>
                                            <p>Time: {new Date().toLocaleTimeString()}</p>
                                        </div>
                                        <table style={{ width: '100%' }}>
                                            <thead><tr style={{ borderBottom: '1px solid #eee' }}><th align="left">Item</th><th>Qty</th></tr></thead>
                                            <tbody>{cart.map(item => <tr key={item.id}><td>{item.name}</td><td align="center">{item.quantity}</td></tr>)}</tbody>
                                        </table>
                                        {kotNote && <div style={{ marginTop: '15px', border: '1px dashed #333', padding: '8px', fontSize: '13px' }}><strong>KOT NOTE:</strong> {kotNote}</div>}
                                    </div>
                                )}
                            </div>
                            <div className="pos-modal-footer">
                                <button className="pos-modal-btn cancel" onClick={handleModalClose}>Cancel</button>
                                <button className="pos-modal-btn" onClick={handleModalDownload} style={{ background: '#4b5563', color: '#fff' }}>Download</button>
                                <button className="pos-modal-btn print" onClick={handleModalPrint}>Print Now</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default FoodOrderPage;
