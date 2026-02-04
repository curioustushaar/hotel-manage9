import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
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

    // Load user data from localStorage
    useEffect(() => {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            setUserData(JSON.parse(storedUserData));
        }
    }, []);

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
        setShowViewProfile(true);
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
        { id: 'bookings', icon: '📅', label: 'Bookings' },
        { id: 'food-menu', icon: '🍽️', label: 'Food Menu' },
        { id: 'add-booking', icon: '➕', label: 'Add Booking' },
        { id: 'customers', icon: '👥', label: 'Customers' },
        { id: 'settings', icon: '⚙️', label: 'Settings' },
        { id: 'cashier-report', icon: '💰', label: 'Cashier Report' },
        { id: 'food-payment-report', icon: '🧾', label: 'Food Payment Report' },
    ];

    const handleMenuClick = (menuId) => {
        setActiveMenu(menuId);
        // Navigate to respective pages
        switch (menuId) {
            case 'dashboard':
                // Already on dashboard
                break;
            case 'rooms':
                navigate('/admin/rooms');
                break;
            case 'bookings':
                navigate('/admin/bookings');
                break;
            case 'food-menu':
                navigate('/admin/food-menu');
                break;
            case 'add-booking':
                navigate('/admin/add-booking');
                break;
            case 'customers':
                navigate('/admin/customers');
                break;
            case 'settings':
                navigate('/admin/settings');
                break;
            case 'cashier-report':
                navigate('/admin/cashier-report');
                break;
            case 'food-payment-report':
                navigate('/admin/food-payment-report');
                break;
            default:
                console.log(`Navigating to: ${menuId}`);
        }
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
                    <motion.div
                        className="admin-profile-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="profile-header">
                            <h1>Welcome to Admin Dashboard</h1>
                            <p>Manage your hotel operations from here</p>
                        </div>

                        <div className="profile-card">
                            <div className="profile-card-header">
                                <h2>My Profile</h2>
                            </div>

                            <div className="profile-content">
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

                                <div className="profile-actions">
                                    <button className="btn btn-primary" onClick={handleViewProfile}>
                                        <span className="btn-icon">👤</span>
                                        View Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

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
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
