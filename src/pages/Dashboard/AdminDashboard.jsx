import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '../../config/api';
import FoodMenuDashboard from '../FoodMenu/FoodMenuDashboard';
import FoodPaymentReport from '../FoodPaymentReport/FoodPaymentReport';
import Settings from '../Settings/Settings';
import Customers from '../Customers/Customers';
import DashboardHome from '../DashboardHome/DashboardHome';
import MyProfile from '../Profile/MyProfile';
import ReservationStayManagement from "../../components/ReservationStayManagement";
import GuestMealService from '../GuestMealService/GuestMealService';
import DiscountManagement from '../DiscountManagement/DiscountManagement';
import TaxConfiguration from '../TaxConfiguration/TaxConfiguration';
import TaxMapping from '../TaxMapping/TaxMapping';
import FoodOrderPage from '../../components/FoodOrderPage'; // Import FoodOrderPage
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [reservationView, setReservationView] = useState('dashboard'); // State for Reservation Sub-views
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showViewProfile, setShowViewProfile] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [openConfigDropdown, setOpenConfigDropdown] = useState(false);
    const [openReservationDropdown, setOpenReservationDropdown] = useState(false); // State for Reservation Dropdown
    const [userData, setUserData] = useState({
        name: 'Admin User',
        email: 'admin@bireena.com',
        role: 'Administrator',
        password: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    // Rooms management states
    const [rooms, setRooms] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('All Types');
    const [selectedStatus, setSelectedStatus] = useState('All Status');
    const [showAddRoomModal, setShowAddRoomModal] = useState(false);
    const [showEditRoomModal, setShowEditRoomModal] = useState(false);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [roomFormData, setRoomFormData] = useState({
        roomNumber: '',
        roomType: '',
        price: '',
        capacity: ''
    });
    const [roomErrorMessage, setRoomErrorMessage] = useState('');

    // Generate Room QR states
    const [selectedStore, setSelectedStore] = useState('Testing 3.0');
    const [selectedQRCategory, setSelectedQRCategory] = useState('');
    const [selectedQRRoom, setSelectedQRRoom] = useState('');
    const [qrSearchTable, setQRSearchTable] = useState('');
    const [qrRoomsData, setQRRoomsData] = useState([]);
    const [filteredQRRooms, setFilteredQRRooms] = useState([]);
    const [showQRModal, setShowQRModal] = useState(false);
    const [qrModalData, setQRModalData] = useState(null);
    const [qrLoading, setQRLoading] = useState(false);

    // Room type categories
    const roomTypeCategories = {
        'Club Rooms': [
            'Club AC Single Room',
            'Club AC Double Room',
            'Club Non-AC Single Room',
            'Club Non-AC Double Room'
        ],
        'Deluxe Rooms': [
            'Deluxe AC Single Room',
            'Deluxe AC Double Room',
            'Deluxe Non-AC Single Room',
            'Deluxe Non-AC Double Room'
        ],
        'Suite Rooms': [
            'Suite Single Room',
            'Suite Double Room',
            'Family Suite'
        ]
    };

    const statusOptions = ['All Status', 'Available', 'Booked', 'Occupied', 'Under Maintenance'];

    // Load user data from localStorage
    useEffect(() => {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            setUserData(JSON.parse(storedUserData));
        }
    }, []);

    // Set active menu based on URL path
    useEffect(() => {
        const path = location.pathname;
        if (path.includes('/reservations')) {
            setActiveMenu('reservations');
        } else if (path.includes('/rooms')) {
            setActiveMenu('rooms');
        } else if (path.includes('/guest-meal-service')) {
            setActiveMenu('guest-meal-service');
        } else if (path.includes('/food-menu')) {
            setActiveMenu('food-menu');
        } else if (path.includes('/customers')) {
            setActiveMenu('customers');
        } else if (path.includes('/settings')) {
            setActiveMenu('settings');
        } else if (path.includes('/dashboard')) {
            setActiveMenu('dashboard');
        }
    }, [location]);

    // Load rooms from MongoDB API
    useEffect(() => {
        fetchRoomsFromAPI();
    }, []);

    // Auto-refresh rooms data every 5 seconds to show real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            fetchRoomsFromAPI();
        }, 5000); // Refresh every 5 seconds

        return () => clearInterval(interval);
    }, []);

    // Refresh when page becomes visible (user switches back to tab)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchRoomsFromAPI();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    const fetchRoomsFromAPI = async () => {
        try {
            // Clear old localStorage data
            localStorage.removeItem('hotelRooms');

            const response = await fetch(`${API_URL}/api/rooms/list`);
            const data = await response.json();
            if (data.success) {
                setRooms(data.data);
            }
        } catch (error) {
            console.error('Error fetching rooms from database:', error);
            setRooms([]);
        }
    };

    // Filter rooms based on search and filters
    useEffect(() => {
        let filtered = [...rooms];

        if (searchQuery) {
            filtered = filtered.filter(room =>
                room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                room.roomType.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedType !== 'All Types') {
            filtered = filtered.filter(room => room.roomType === selectedType);
        }

        if (selectedStatus !== 'All Status') {
            filtered = filtered.filter(room => room.status === selectedStatus);
        }

        setFilteredRooms(filtered);
    }, [rooms, searchQuery, selectedType, selectedStatus]);

    // Filter QR rooms based on search and category
    useEffect(() => {
        let filtered = [...rooms];

        if (qrSearchTable) {
            filtered = filtered.filter(room =>
                room.roomNumber.toLowerCase().includes(qrSearchTable.toLowerCase()) ||
                room.roomType.toLowerCase().includes(qrSearchTable.toLowerCase())
            );
        }

        if (selectedQRCategory) {
            filtered = filtered.filter(room => {
                const roomType = room.roomType.toLowerCase();
                const category = selectedQRCategory.toLowerCase();
                return roomType.includes(category);
            });
        }

        if (selectedQRRoom) {
            filtered = filtered.filter(room => room.roomNumber === selectedQRRoom);
        }

        setFilteredQRRooms(filtered);
    }, [rooms, qrSearchTable, selectedQRCategory, selectedQRRoom]);

    // Function to get user initials
    const getUserInitials = (name) => {
        const names = name.split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const handleLogout = () => {
        // Clear any stored tokens/session
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        // Redirect to login
        navigate('/login');
    };

    const handleViewProfile = () => {
        setActiveMenu('my-profile');
        setShowProfileDropdown(false);
    };

    const handleChangePassword = () => {
        setShowChangePassword(true);
        setShowProfileDropdown(false);
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        // Validate current password
        if (passwordData.currentPassword !== userData.password) {
            setPasswordError('Current password is incorrect');
            return;
        }

        // Validate new password
        if (passwordData.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters');
            return;
        }

        // Validate confirm password
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        // Update password in localStorage
        const updatedUserData = {
            ...userData,
            password: passwordData.newPassword
        };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
        setUserData(updatedUserData);

        // Show success message
        setPasswordSuccess('Password changed successfully!');

        // Reset form after 2 seconds
        setTimeout(() => {
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setShowChangePassword(false);
            setPasswordSuccess('');
        }, 2000);
    };

    const menuItems = [
        { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
        { id: 'rooms', icon: '🛏️', label: 'Rooms' },
        {
            id: 'reservations',
            icon: '🏨',
            label: 'Reservation & Stay Management',
            hasDropdown: true,
            dropdownItems: [
                { id: 'new-reservation', label: 'New Reservation', icon: '📅' },
                { id: 'housekeeping', label: 'Housekeeping View', icon: '🧹' },
                { id: 'room-service', label: 'Room Service', icon: '🛎️' },
                { id: 'food-order', label: 'Food Order', icon: '🍽️' }
            ]
        },
        { id: 'guest-meal-service', icon: '🍴', label: 'Guest Meal Service' },
        { id: 'food-menu', icon: '🍽️', label: 'Food Menu' },
        {
            id: 'proper-configuration',
            icon: '⚙️',
            label: 'Proper Configuration',
            hasDropdown: true,
            dropdownItems: [
                { id: 'discount', label: 'Discount', icon: '💸' },
                { id: 'taxes', label: 'Taxes', icon: '🧾' },
                { id: 'tax-mapping', label: 'Tax Mapping', icon: '🔗' },
                { id: 'generate-room-qr', label: 'Generate Room QR', icon: '📱' }
            ]
        },
        { id: 'add-booking', icon: '➕', label: 'Add Booking' },
        { id: 'customers', icon: '👥', label: 'Customers' },
        { id: 'settings', icon: '⚙️', label: 'Settings' },
        { id: 'cashier-report', icon: '💰', label: 'Cashier Report' },
        { id: 'food-payment-report', icon: '🧾', label: 'Food Payment Report' },
    ];

    const handleMenuClick = (menuId) => {
        // Handle Sub-menu routing for Reservation Dropdown
        if (menuId === 'new-reservation') {
            setActiveMenu('reservations');
            setReservationView('form');
        } else if (menuId === 'housekeeping') {
            setActiveMenu('reservations');
            setReservationView('housekeeping');
        } else if (menuId === 'room-service') {
            setActiveMenu('reservations');
            setReservationView('roomservice');
        } else if (menuId === 'food-order') {
            setActiveMenu('food-order-pos'); // Separate view for POS
        }
        // Handle main menu items
        else if (menuId === 'reservations') {
            toggleDropdown('reservations');
        }
        else {
            setActiveMenu(menuId);
        }

        // Reset search and filters when switching menus
        if (menuId === 'rooms') {
            setSearchQuery('');
            setSelectedType('All Types');
            setSelectedStatus('All Status');
        }
    };

    // Helper to toggle specific dropdowns
    const toggleDropdown = (id) => {
        if (id === 'proper-configuration') {
            setOpenConfigDropdown(!openConfigDropdown);
        } else if (id === 'reservations') {
            setOpenReservationDropdown(!openReservationDropdown);
        }
    };

    // Generate/View QR Code for Room
    const handleViewQR = async (room) => {
        setQRLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/qr/generate/${room._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                setQRModalData({
                    room: room,
                    qrCode: data.data.qrCode,
                    qrData: data.data.qrData
                });
                setShowQRModal(true);
            } else {
                alert('Failed to generate QR code: ' + data.message);
            }
        } catch (error) {
            console.error('Error generating QR:', error);
            alert('Failed to generate QR code. Please try again.');
        } finally {
            setQRLoading(false);
        }
    };

    // Download QR Code
    const handleDownloadQR = () => {
        if (!qrModalData) return;

        const link = document.createElement('a');
        link.download = `Room-${qrModalData.room.roomNumber}-QR.png`;
        link.href = qrModalData.qrCode;
        link.click();
    };

    // Room management functions
    const getAllRoomTypes = () => {
        const types = ['All Types'];
        Object.values(roomTypeCategories).forEach(category => {
            types.push(...category);
        });
        return types;
    };

    const handleAddRoom = () => {
        setRoomFormData({ roomNumber: '', roomType: '', price: '', capacity: '' });
        setRoomErrorMessage('');
        setShowAddRoomModal(true);
    };

    const handleEditRoom = (room) => {
        setCurrentRoom(room);
        setRoomFormData({
            roomNumber: room.roomNumber,
            roomType: room.roomType,
            price: room.price.toString(),
            capacity: room.capacity.toString()
        });
        setRoomErrorMessage('');
        setShowEditRoomModal(true);
    };

    const handleRoomSubmit = async (e) => {
        e.preventDefault();
        setRoomErrorMessage('');

        if (!roomFormData.roomNumber || !roomFormData.roomType || !roomFormData.price || !roomFormData.capacity) {
            setRoomErrorMessage('All fields are required');
            return;
        }

        try {
            if (showAddRoomModal) {
                const newRoom = {
                    roomNumber: roomFormData.roomNumber,
                    roomType: roomFormData.roomType,
                    capacity: parseInt(roomFormData.capacity),
                    price: parseInt(roomFormData.price),
                    status: 'Available'
                };

                const response = await fetch(`${API_URL}/api/rooms/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newRoom)
                });

                const data = await response.json();

                if (!data.success) {
                    setRoomErrorMessage(data.message || 'Failed to add room');
                    return;
                }

                await fetchRoomsFromAPI();
                setShowAddRoomModal(false);
            } else if (showEditRoomModal) {
                const updatedRoom = {
                    roomNumber: roomFormData.roomNumber,
                    roomType: roomFormData.roomType,
                    capacity: parseInt(roomFormData.capacity),
                    price: parseInt(roomFormData.price)
                };

                const response = await fetch(`${API_URL}/api/rooms/update/${currentRoom._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedRoom)
                });

                const data = await response.json();

                if (!data.success) {
                    setRoomErrorMessage(data.message || 'Failed to update room');
                    return;
                }

                await fetchRoomsFromAPI();
                setShowEditRoomModal(false);
            }

            setRoomFormData({ roomNumber: '', roomType: '', price: '', capacity: '' });
            setCurrentRoom(null);
        } catch (error) {
            console.error('Error submitting room:', error);
            setRoomErrorMessage('Failed to save room. Please try again.');
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Available':
                return 'status-available';
            case 'Booked':
                return 'status-booked';
            case 'Occupied':
                return 'status-occupied';
            case 'Under Maintenance':
                return 'status-maintenance';
            default:
                return '';
        }
    };

    const getRoomTypeShort = (roomType) => {
        return roomType.replace('Room', '').trim();
    };

    const handleComingSoon = () => {
        alert('Coming Soon!');
    };

    return (
        <div className="admin-dashboard">
            {/* Left Sidebar */}
            <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h2 className="sidebar-logo">Bareena</h2>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => {
                        const isOpen = item.id === 'proper-configuration' ? openConfigDropdown :
                            item.id === 'reservations' ? openReservationDropdown : false;

                        return item.hasDropdown ? (
                            <div key={item.id} className="nav-dropdown-wrapper">
                                <button
                                    className={`nav-item nav-item-dropdown ${isOpen ? 'dropdown-open' : ''}`}
                                    onClick={() => toggleDropdown(item.id)}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    <span className="nav-label">{item.label}</span>
                                    <svg
                                        className={`dropdown-arrow ${isOpen ? 'rotated' : ''}`}
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                <div className={`nav-dropdown-menu ${isOpen ? 'show' : ''}`}>
                                    {item.dropdownItems.map((subItem) => {
                                        // Determine active state for sub-items
                                        const isActive =
                                            // For Reservations: activeMenu is 'reservations' AND sub-view matches
                                            (item.id === 'reservations' && activeMenu === 'reservations' && reservationView === subItem.id) ||
                                            // For Food Order POS: activeMenu is 'food-order-pos'
                                            (subItem.id === 'food-order' && activeMenu === 'food-order-pos') ||
                                            // For Normal items: activeMenu matches subItem.id directly
                                            (activeMenu === subItem.id);

                                        return (
                                            <button
                                                key={subItem.id}
                                                className={`nav-dropdown-item ${isActive ? 'active' : ''}`}
                                                onClick={() => handleMenuClick(subItem.id)}
                                            >
                                                <span className="nav-icon">{subItem.icon}</span>
                                                <span className="nav-label">{subItem.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <button
                                key={item.id}
                                className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
                                onClick={() => handleMenuClick(item.id)}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span className="nav-label">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <button className="logout-btn" onClick={handleLogout}>
                    <span className="nav-icon">🔓</span>
                    <span className="nav-label">Logout</span>
                </button>
            </div>

            {/* Main Content */}
            <div className={`main-content ${sidebarOpen ? '' : 'full-width'}`}>
                {/* Top Bar */}
                <div className="top-bar">
                    <div className="top-bar-left">
                        <button className="hamburger-menu" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                        <h2 className="top-bar-logo">Bareena</h2>
                    </div>
                    <div className="top-bar-right">
                        <button className="top-icon-btn" onClick={handleComingSoon} title="Search">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <button className="top-icon-btn" onClick={handleComingSoon} title="Bookmarks">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <button className="top-icon-btn" onClick={handleComingSoon} title="Shopping">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <div className="profile-dropdown-wrapper">
                            <button
                                className="profile-avatar-btn"
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                            >
                                <div className="avatar-initials">
                                    {getUserInitials(userData.name)}
                                </div>
                                <span className="dropdown-arrow">▼</span>
                            </button>

                            {showProfileDropdown && (
                                <div className="profile-dropdown">
                                    <button className="dropdown-item" onClick={handleViewProfile}>
                                        <span className="dropdown-icon">👤</span>
                                        My Profile
                                    </button>
                                    <button className="dropdown-item" onClick={handleChangePassword}>
                                        <span className="dropdown-icon">🔒</span>
                                        Change Password
                                    </button>
                                    <button className="dropdown-item logout" onClick={handleLogout}>
                                        <span className="dropdown-icon">🚪</span>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className="dashboard-content">
                    {/* Dashboard View */}
                    {activeMenu === 'dashboard' && (
                        <DashboardHome />
                    )}

                    {/* Rooms View */}
                    {activeMenu === 'rooms' && (
                        <div className="rooms-section">
                            {/* Rooms Header */}
                            <div className="section-header">
                                <h2>🛏️ Rooms Management</h2>
                            </div>

                            {/* Search and Filters */}
                            <div className="rooms-controls">
                                <div className="search-box">
                                    <span className="search-icon">🔍</span>
                                    <input
                                        type="text"
                                        placeholder="Search room..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <select
                                    className="filter-select"
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                >
                                    {getAllRoomTypes().map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                                <select
                                    className="filter-select"
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                >
                                    {statusOptions.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                                <button className="add-room-btn" onClick={handleAddRoom}>
                                    + Add Room
                                </button>
                            </div>

                            {/* Rooms Grid */}
                            <div className="rooms-grid">
                                <AnimatePresence>
                                    {filteredRooms.map((room) => (
                                        <motion.div
                                            key={room.id}
                                            className={`room-card ${getStatusClass(room.status)}`}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="room-card-header">
                                                <h3>Room {room.roomNumber}</h3>
                                            </div>
                                            <div className="room-card-body">
                                                <p className="room-type">{getRoomTypeShort(room.roomType)}</p>
                                                <p className="room-capacity">Capacity: {room.capacity} persons</p>
                                                <p className="room-price">₹{room.price}/night</p>
                                            </div>
                                            <div className="room-card-footer">
                                                <span className={`room-status ${getStatusClass(room.status)}`}>
                                                    {room.status}
                                                </span>
                                                {room.status === 'Available' && (
                                                    <button className="edit-btn" onClick={() => handleEditRoom(room)}>
                                                        ✏️ Edit
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {filteredRooms.length === 0 && (
                                <div className="no-rooms">
                                    <p>No rooms found</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reservation & Stay Management View */}
                    {activeMenu === 'reservations' && (
                        <ReservationStayManagement viewMode={reservationView} />
                    )}

                    {/* Food Order POS View */}
                    {activeMenu === 'food-order-pos' && (
                        <div style={{ position: 'relative', height: 'calc(100vh - 64px)', width: '100%' }}>
                            <FoodOrderPage room={{ roomNumber: 'POS', guestName: 'Walk-in / Direct' }} onClose={() => setActiveMenu('reservations')} />
                        </div>
                    )}

                    {/* Guest Meal Service View */}
                    {activeMenu === 'guest-meal-service' && (
                        <GuestMealService />
                    )}

                    {/* Food Menu View */}
                    {activeMenu === 'food-menu' && (
                        <FoodMenuDashboard />
                    )}

                    {/* Food Payment Report View */}
                    {activeMenu === 'food-payment-report' && (
                        <FoodPaymentReport />
                    )}

                    {/* Proper Configuration Options */}
                    {activeMenu === 'discount' && (
                        <DiscountManagement />
                    )}

                    {activeMenu === 'taxes' && (
                        <TaxConfiguration />
                    )}

                    {activeMenu === 'tax-mapping' && (
                        <TaxMapping />
                    )}

                    {activeMenu === 'generate-room-qr' && (
                        <div className="content-section generate-qr-section">
                            <div className="qr-header">
                                <div className="qr-header-title">
                                    <span className="qr-icon">📱</span>
                                    <h1>Generate Room QR</h1>
                                </div>
                            </div>

                            <div className="qr-filters-row">
                                <div className="qr-filter-group">
                                    <label>Select Store</label>
                                    <select
                                        className="qr-select"
                                        value={selectedStore}
                                        onChange={(e) => setSelectedStore(e.target.value)}
                                    >
                                        <option value="Testing 3.0">Testing 3.0</option>
                                        <option value="Store 1">Store 1</option>
                                        <option value="Store 2">Store 2</option>
                                    </select>
                                </div>
                            </div>

                            <div className="qr-filters-row qr-filters-row-multi">
                                <div className="qr-filter-group">
                                    <select
                                        className="qr-select"
                                        value={selectedQRCategory}
                                        onChange={(e) => {
                                            setSelectedQRCategory(e.target.value);
                                            setSelectedQRRoom('');
                                        }}
                                    >
                                        <option value="">Select Category</option>
                                        {[...new Set(rooms.map(room => room.roomType))].map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="qr-filter-group">
                                    <select
                                        className="qr-select"
                                        value={selectedQRRoom}
                                        onChange={(e) => setSelectedQRRoom(e.target.value)}
                                        disabled={!selectedQRCategory}
                                    >
                                        <option value="">Select Room</option>
                                        {rooms
                                            .filter(room => !selectedQRCategory || room.roomType === selectedQRCategory)
                                            .map(room => (
                                                <option key={room._id} value={room.roomNumber}>
                                                    {room.roomNumber}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>

                                <div className="qr-filter-group qr-search-group">
                                    <input
                                        type="text"
                                        className="qr-search-input"
                                        placeholder="Search Table"
                                        value={qrSearchTable}
                                        onChange={(e) => setQRSearchTable(e.target.value)}
                                    />
                                    <span className="qr-search-icon">🔍</span>
                                </div>
                            </div>

                            <div className="qr-table-container">
                                <table className="qr-table">
                                    <thead>
                                        <tr>
                                            <th>Category</th>
                                            <th>Room Name</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredQRRooms.length > 0 ? (
                                            filteredQRRooms.map((room) => (
                                                <tr key={room._id}>
                                                    <td>
                                                        <span className={`qr-category-badge ${room.roomType.toLowerCase().replace(/\s+/g, '-')}`}>
                                                            {room.roomType}
                                                        </span>
                                                    </td>
                                                    <td>{room.roomNumber}</td>
                                                    <td>
                                                        <div className="qr-action-buttons">
                                                            <button
                                                                className="qr-action-btn qr-view-btn"
                                                                title="Generate/View QR"
                                                                onClick={() => handleViewQR(room)}
                                                                disabled={qrLoading}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                                    <circle cx="12" cy="12" r="3"></circle>
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                                                    {rooms.length === 0 ? 'No rooms available' : 'No rooms found matching your search'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Settings View */}
                    {activeMenu === 'settings' && (
                        <Settings />
                    )}

                    {/* Customers View */}
                    {activeMenu === 'customers' && (
                        <Customers />
                    )}

                    {/* My Profile View */}
                    {activeMenu === 'my-profile' && (
                        <MyProfile />
                    )}

                    {/* View Profile Modal */}
                    {showViewProfile && (
                        <div className="modal-overlay" onClick={() => setShowViewProfile(false)}>
                            <motion.div
                                className="modal-content"
                                onClick={(e) => e.stopPropagation()}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="modal-header">
                                    <h2>View Profile</h2>
                                    <button className="modal-close" onClick={() => setShowViewProfile(false)}>
                                        ✕
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="profile-avatar-section">
                                        <div className="profile-avatar-large">
                                            {getUserInitials(userData.name)}
                                        </div>
                                    </div>
                                    <div className="profile-details">
                                        <div className="detail-row">
                                            <span className="detail-label">Email:</span>
                                            <span className="detail-value">{userData.email}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Role:</span>
                                            <span className="detail-value role-badge">{userData.role}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={() => setShowViewProfile(false)}>
                                        Close
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* Change Password Modal */}
                    {showChangePassword && (
                        <div className="modal-overlay" onClick={() => setShowChangePassword(false)}>
                            <motion.div
                                className="modal-content"
                                onClick={(e) => e.stopPropagation()}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="modal-header">
                                    <h2>Change Password</h2>
                                    <button className="modal-close" onClick={() => setShowChangePassword(false)}>
                                        ✕
                                    </button>
                                </div>
                                <form onSubmit={handlePasswordChange}>
                                    <div className="modal-body">
                                        {passwordError && (
                                            <div className="alert alert-error">
                                                {passwordError}
                                            </div>
                                        )}
                                        {passwordSuccess && (
                                            <div className="alert alert-success">
                                                {passwordSuccess}
                                            </div>
                                        )}
                                        <div className="form-group">
                                            <label>Current Password</label>
                                            <input
                                                type="password"
                                                className="form-input"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({
                                                    ...passwordData,
                                                    currentPassword: e.target.value
                                                })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>New Password</label>
                                            <input
                                                type="password"
                                                className="form-input"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({
                                                    ...passwordData,
                                                    newPassword: e.target.value
                                                })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Confirm New Password</label>
                                            <input
                                                type="password"
                                                className="form-input"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({
                                                    ...passwordData,
                                                    confirmPassword: e.target.value
                                                })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowChangePassword(false)}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            Update Password
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}

                    {/* Add Room Modal */}
                    {showAddRoomModal && (
                        <div className="modal-overlay" onClick={() => setShowAddRoomModal(false)}>
                            <motion.div
                                className="modal-content room-modal"
                                onClick={(e) => e.stopPropagation()}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="modal-header">
                                    <h2>Add New Room</h2>
                                    <button className="modal-close" onClick={() => setShowAddRoomModal(false)}>
                                        ✕
                                    </button>
                                </div>

                                {roomErrorMessage && (
                                    <div className="error-alert">
                                        ⚠️ {roomErrorMessage}
                                    </div>
                                )}

                                <form onSubmit={handleRoomSubmit}>
                                    <div className="form-group">
                                        <label>ROOM NUMBER *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g., 101, 102"
                                            value={roomFormData.roomNumber}
                                            onChange={(e) => setRoomFormData({ ...roomFormData, roomNumber: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>ROOM TYPE *</label>
                                        <select
                                            className="form-input"
                                            value={roomFormData.roomType}
                                            onChange={(e) => setRoomFormData({ ...roomFormData, roomType: e.target.value })}
                                        >
                                            <option value="">-- Select Room Type --</option>
                                            {Object.entries(roomTypeCategories).map(([category, types]) => (
                                                <optgroup key={category} label={category}>
                                                    {types.map(type => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>PRICE PER NIGHT (₹) *</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="0"
                                            value={roomFormData.price}
                                            onChange={(e) => setRoomFormData({ ...roomFormData, price: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>ROOM CAPACITY *</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="1"
                                            value={roomFormData.capacity}
                                            onChange={(e) => setRoomFormData({ ...roomFormData, capacity: e.target.value })}
                                        />
                                    </div>

                                    <div className="modal-actions">
                                        <button type="button" className="btn-cancel" onClick={() => setShowAddRoomModal(false)}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn-submit">
                                            Add Room
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}

                    {/* Edit Room Modal */}
                    {showEditRoomModal && (
                        <div className="modal-overlay" onClick={() => setShowEditRoomModal(false)}>
                            <motion.div
                                className="modal-content room-modal"
                                onClick={(e) => e.stopPropagation()}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="modal-header">
                                    <h2>Edit Room</h2>
                                    <button className="modal-close" onClick={() => setShowEditRoomModal(false)}>
                                        ✕
                                    </button>
                                </div>

                                {roomErrorMessage && (
                                    <div className="error-alert">
                                        ⚠️ {roomErrorMessage}
                                    </div>
                                )}

                                <form onSubmit={handleRoomSubmit}>
                                    <div className="form-group">
                                        <label>ROOM NUMBER *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g., 101, 102"
                                            value={roomFormData.roomNumber}
                                            onChange={(e) => setRoomFormData({ ...roomFormData, roomNumber: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>ROOM TYPE *</label>
                                        <select
                                            className="form-input"
                                            value={roomFormData.roomType}
                                            onChange={(e) => setRoomFormData({ ...roomFormData, roomType: e.target.value })}
                                        >
                                            <option value="">-- Select Room Type --</option>
                                            {Object.entries(roomTypeCategories).map(([category, types]) => (
                                                <optgroup key={category} label={category}>
                                                    {types.map(type => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>PRICE PER NIGHT (₹) *</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="0"
                                            value={roomFormData.price}
                                            onChange={(e) => setRoomFormData({ ...roomFormData, price: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>ROOM CAPACITY *</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="1"
                                            value={roomFormData.capacity}
                                            onChange={(e) => setRoomFormData({ ...roomFormData, capacity: e.target.value })}
                                        />
                                    </div>

                                    <div className="modal-actions">
                                        <button type="button" className="btn-cancel" onClick={() => setShowEditRoomModal(false)}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn-submit">
                                            Update Room
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}

                    {/* QR Code Modal */}
                    {showQRModal && qrModalData && (
                        <div className="modal-overlay" onClick={() => setShowQRModal(false)}>
                            <motion.div
                                className="modal-content qr-modal-content"
                                onClick={(e) => e.stopPropagation()}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="qr-modal-header">
                                    <div>
                                        <h2>Room QR Code</h2>
                                        <p className="qr-room-info">Room {qrModalData.room.roomNumber} - {qrModalData.room.roomType}</p>
                                    </div>
                                    <button
                                        className="close-modal-btn"
                                        onClick={() => setShowQRModal(false)}
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="qr-modal-body">
                                    <div className="qr-display-section">
                                        <div className="qr-code-container">
                                            <img src={qrModalData.qrCode} alt="Room QR Code" className="qr-code-image" />
                                        </div>

                                        <div className="qr-info-section">
                                            <div className="qr-info-card">
                                                <h4>Scan Instructions</h4>
                                                <p>To order from your Room {qrModalData.room.roomNumber}</p>
                                                <p className="qr-instruction">Please scan this QR code on your mobile phone</p>
                                                <p className="qr-store-name">{selectedStore}</p>
                                            </div>

                                            <div className="qr-details-card">
                                                <div className="qr-detail-item">
                                                    <span className="detail-label">Room Number:</span>
                                                    <span className="detail-value">{qrModalData.room.roomNumber}</span>
                                                </div>
                                                <div className="qr-detail-item">
                                                    <span className="detail-label">Category:</span>
                                                    <span className="detail-value">{qrModalData.room.roomType}</span>
                                                </div>
                                                <div className="qr-detail-item">
                                                    <span className="detail-label">Status:</span>
                                                    <span className={`detail-value status-${qrModalData.room.status?.toLowerCase()}`}>
                                                        {qrModalData.room.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="qr-action-section">
                                        <button
                                            className="qr-download-btn"
                                            onClick={handleDownloadQR}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                <polyline points="7 10 12 15 17 10"></polyline>
                                                <line x1="12" y1="15" x2="12" y2="3"></line>
                                            </svg>
                                            Download QR
                                        </button>

                                        <button
                                            className="qr-print-btn"
                                            onClick={() => window.print()}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                                <rect x="6" y="14" width="12" height="8"></rect>
                                            </svg>
                                            Print
                                        </button>

                                        <button
                                            className="qr-regenerate-btn"
                                            onClick={() => handleViewQR(qrModalData.room)}
                                            disabled={qrLoading}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="23 4 23 10 17 10"></polyline>
                                                <polyline points="1 20 1 14 7 14"></polyline>
                                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                                            </svg>
                                            Regenerate
                                        </button>
                                    </div>

                                    <div className="qr-notes">
                                        <p><strong>Note:</strong> Please make sure to generate every room's QR separately.</p>
                                        <p>Click <a href={qrModalData.qrData.scanUrl} target="_blank" rel="noopener noreferrer">here</a> to open the app.</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
