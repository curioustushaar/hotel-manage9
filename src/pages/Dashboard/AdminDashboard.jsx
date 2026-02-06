import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FoodMenuDashboard from '../FoodMenu/FoodMenuDashboard';
import FoodPaymentReport from '../FoodPaymentReport/FoodPaymentReport';
import Settings from '../Settings/Settings';
import Customers from '../Customers/Customers';
import DashboardHome from '../DashboardHome/DashboardHome';
import MyProfile from '../Profile/MyProfile';
import ReservationStayManagement from "../../components/ReservationStayManagement";
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [showViewProfile, setShowViewProfile] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
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
            
            const response = await fetch('http://localhost:5000/api/rooms/list');
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
        { id: 'reservations', icon: '🏨', label: 'Reservation & Stay Management' },
        { id: 'food-menu', icon: '🍽️', label: 'Food Menu' },
        { id: 'customers', icon: '👥', label: 'Customers' },
        { id: 'settings', icon: '⚙️', label: 'Settings' },
        { id: 'cashier-report', icon: '💰', label: 'Cashier Report' },
        { id: 'food-payment-report', icon: '🧾', label: 'Food Payment Report' },
    ];

    const handleMenuClick = (menuId) => {
        setActiveMenu(menuId);
        // Reset search and filters when switching menus
        if (menuId === 'rooms') {
            setSearchQuery('');
            setSelectedType('All Types');
            setSelectedStatus('All Status');
        }
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

                const response = await fetch('http://localhost:5000/api/rooms/add', {
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

                const response = await fetch(`http://localhost:5000/api/rooms/update/${currentRoom._id}`, {
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

    return (
        <div className="admin-dashboard">
            {/* Left Sidebar */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <h2 className="sidebar-logo">Bireena</h2>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
                            onClick={() => handleMenuClick(item.id)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <button className="logout-btn" onClick={handleLogout}>
                    <span className="nav-icon">🔓</span>
                    <span className="nav-label">Logout</span>
                </button>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {/* Top Bar */}
                <div className="top-bar">
                    <div className="top-bar-right">
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
                        <ReservationStayManagement />
                    )}

                    {/* Food Menu View */}
                    {activeMenu === 'food-menu' && (
                        <FoodMenuDashboard />
                    )}

                    {/* Food Payment Report View */}
                    {activeMenu === 'food-payment-report' && (
                        <FoodPaymentReport />
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
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
