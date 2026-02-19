<<<<<<< HEAD
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../Profile/MyProfile.css';

const SuperAdminProfile = () => {
=======
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './MyProfile.css';

const MyProfile = () => {
>>>>>>> main
    const { user } = useAuth();

    // Form state
    const [formData, setFormData] = useState({
        fullName: user?.name || '',
<<<<<<< HEAD
        email: user?.username || user?.email || '',
        role: 'Super Administrator'
    });

=======
        mobileNumber: user?.phone || '',
        email: user?.username || user?.email || '',
        role: user?.role === 'admin' ? 'Administrator' : user?.role === 'super_admin' ? 'Super Admin' : 'Staff'
    });

    // Hotel information state
    const [hotelInfo, setHotelInfo] = useState(null);
    const [loadingHotel, setLoadingHotel] = useState(false);

>>>>>>> main
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPasswordError, setShowPasswordError] = useState('');
    const [showPasswordSuccess, setShowPasswordSuccess] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);

<<<<<<< HEAD
=======
    // Fetch hotel information if user is admin
    useEffect(() => {
        const fetchHotelInfo = async () => {
            if (user?.hotelId && user?.role !== 'super_admin') {
                setLoadingHotel(true);
                try {
                    const token = user?.token;
                    const config = {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    };
                    
                    // Fetch hotel details
                    const response = await axios.get(`/api/hotel/${user.hotelId}`, config);
                    setHotelInfo(response.data);
                } catch (error) {
                    console.error('Error fetching hotel info:', error);
                } finally {
                    setLoadingHotel(false);
                }
            }
        };

        fetchHotelInfo();
    }, [user]);

    // Update form data when user changes
    useEffect(() => {
        setFormData({
            fullName: user?.name || '',
            mobileNumber: user?.phone || '',
            email: user?.username || user?.email || '',
            role: user?.role === 'admin' ? 'Administrator' : user?.role === 'super_admin' ? 'Super Admin' : 'Staff'
        });
    }, [user]);

>>>>>>> main
    // Account activity data
    const accountActivity = {
        lastLogin: user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A',
        lastLoginIP: '192.168.1.100',
        accountCreated: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'
    };

    // Get user initials
    const getUserInitials = (name) => {
<<<<<<< HEAD
        const names = name?.split(' ') || [];
        if (names.length >= 2) {
            return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }
        return name ? name.substring(0, 2).toUpperCase() : 'SA';
=======
        const names = name.split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
>>>>>>> main
    };

    // Handle form input changes
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Handle password input changes
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({
            ...passwordData,
            [name]: value
        });
    };

    // Handle photo upload
    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle save changes
    const handleSaveChanges = () => {
        console.log('Saving profile changes:', formData);
        alert('Profile updated successfully!');
        setEditMode(false);
    };

    // Handle password update
    const handlePasswordUpdate = (e) => {
        e.preventDefault();
        setShowPasswordError('');
        setShowPasswordSuccess('');

        // Validation
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setShowPasswordError('All password fields are required');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setShowPasswordError('New password must be at least 8 characters');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setShowPasswordError('New passwords do not match');
            return;
        }

        // Success
        setShowPasswordSuccess('Password changed successfully!');
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });

        setTimeout(() => {
            setShowPasswordSuccess('');
        }, 3000);
    };

    // Handle cancel
    const handleCancel = () => {
        setEditMode(false);
        setFormData({
            fullName: user?.name || '',
<<<<<<< HEAD
            email: user?.username || user?.email || '',
            role: 'Super Administrator'
=======
            mobileNumber: user?.phone || '',
            email: user?.username || user?.email || '',
            role: user?.role === 'admin' ? 'Administrator' : user?.role === 'super_admin' ? 'Super Admin' : 'Staff'
>>>>>>> main
        });
    };

    return (
<<<<<<< HEAD
        <div className="my-profile-container" style={{ padding: '0' }}>
=======
        <div className="my-profile-container">
>>>>>>> main
            {/* Page Header */}
            <motion.div 
                className="profile-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="header-content">
                    <h1 className="header-title">My Profile</h1>
<<<<<<< HEAD
                    <p className="header-subtitle">Manage your super admin account settings</p>
=======
                    <p className="header-subtitle">Manage your personal information and security</p>
>>>>>>> main
                </div>
                <div className="breadcrumb">
                    <span>Dashboard</span> / <span className="breadcrumb-active">My Profile</span>
                </div>
            </motion.div>

            {/* Profile Content */}
            <div className="profile-content">
                {/* CARD 1: Profile Overview */}
                <motion.div 
                    className="profile-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <div className="card-header">
                        <h2>Profile Overview</h2>
                    </div>
                    <div className="profile-overview">
                        {/* Left: Avatar */}
                        <div className="avatar-section">
                            <div className="avatar-container">
                                {photoPreview ? (
                                    <img 
                                        src={photoPreview} 
                                        alt="Profile" 
                                        className="avatar-image"
                                    />
                                ) : (
                                    <div className="avatar-initials">
                                        {getUserInitials(formData.fullName)}
                                    </div>
                                )}
                            </div>
                            <label htmlFor="photo-upload" className="upload-photo-btn">
                                📷 Upload Photo
                            </label>
                            <input
                                id="photo-upload"
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                style={{ display: 'none' }}
                            />
                        </div>

                        {/* Right: Profile Info */}
                        <div className="profile-info">
                            <div className="info-row">
                                <span className="info-label">Full Name</span>
                                <span className="info-value">{formData.fullName}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Role</span>
<<<<<<< HEAD
                                <span className="role-badge" style={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', color: 'white' }}>
                                    {formData.role}
                                </span>
=======
                                <span className="role-badge">{formData.role}</span>
>>>>>>> main
                            </div>
                            <div className="info-row">
                                <span className="info-label">Email</span>
                                <span className="info-value">{formData.email}</span>
                            </div>
<<<<<<< HEAD
=======
                            <div className="info-row">
                                <span className="info-label">Mobile</span>
                                <span className="info-value">{formData.mobileNumber}</span>
                            </div>
>>>>>>> main
                        </div>
                    </div>
                </motion.div>

                {/* CARD 2: Personal Information */}
                <motion.div 
                    className="profile-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <div className="card-header">
                        <h2>Personal Information</h2>
                        <button
                            className={`edit-btn ${editMode ? 'active' : ''}`}
                            onClick={() => setEditMode(!editMode)}
                        >
                            {editMode ? '✕ Done Editing' : '✏️ Edit'}
                        </button>
                    </div>

                    <div className="form-content">
                        <div className="form-grid">
                            {/* Full Name */}
                            <div className="form-group">
                                <label className="form-label">
                                    Full Name <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    className={`form-input ${!editMode ? 'disabled' : ''}`}
                                    value={formData.fullName}
                                    onChange={handleFormChange}
                                    disabled={!editMode}
                                    placeholder="Enter your full name"
                                />
<<<<<<< HEAD
                                <span className="helper-text">Your legal name as super administrator</span>
=======
                                <span className="helper-text">Your legal name as used in official documents</span>
                            </div>

                            {/* Mobile Number */}
                            <div className="form-group">
                                <label className="form-label">
                                    Mobile Number <span className="required">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="mobileNumber"
                                    className={`form-input ${!editMode ? 'disabled' : ''}`}
                                    value={formData.mobileNumber}
                                    onChange={handleFormChange}
                                    disabled={!editMode}
                                    placeholder="+91 XXXXX XXXXX"
                                />
                                <span className="helper-text">Contact number for important notifications</span>
>>>>>>> main
                            </div>

                            {/* Email Address (Disabled) */}
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-input disabled"
                                    value={formData.email}
                                    disabled
                                    placeholder="email@example.com"
                                />
                                <span className="helper-text">Email cannot be changed. Contact support if needed.</span>
                            </div>

                            {/* Role (Disabled) */}
                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <input
                                    type="text"
                                    name="role"
                                    className="form-input disabled"
                                    value={formData.role}
                                    disabled
<<<<<<< HEAD
                                    placeholder="Super Administrator"
                                />
                                <span className="helper-text">Highest level of system access</span>
=======
                                    placeholder="Administrator"
                                />
                                <span className="helper-text">Role is assigned by account owner</span>
>>>>>>> main
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* CARD 3: Security Settings */}
                <motion.div 
                    className="profile-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                >
                    <div className="card-header">
                        <h2>🔐 Security Settings</h2>
                    </div>

                    <div className="form-content">
                        {showPasswordError && (
                            <div className="alert alert-error">
                                ⚠️ {showPasswordError}
                            </div>
                        )}

                        {showPasswordSuccess && (
                            <div className="alert alert-success">
                                ✓ {showPasswordSuccess}
                            </div>
                        )}

                        <form onSubmit={handlePasswordUpdate}>
                            <div className="form-grid-single">
                                {/* Current Password */}
                                <div className="form-group">
                                    <label className="form-label">
                                        Current Password <span className="required">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        className="form-input"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Enter your current password"
                                    />
                                </div>

                                {/* New Password */}
                                <div className="form-group">
                                    <label className="form-label">
                                        New Password <span className="required">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        className="form-input"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Enter new password"
                                    />
                                    <span className="helper-text">Minimum 8 characters with uppercase, lowercase, and numbers</span>
                                </div>

                                {/* Confirm New Password */}
                                <div className="form-group">
                                    <label className="form-label">
                                        Confirm New Password <span className="required">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        className="form-input"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Re-enter new password"
                                    />
                                </div>
                            </div>

                            <div className="security-actions">
                                <button type="submit" className="btn btn-primary">
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>

                {/* CARD 4: Account Activity */}
                <motion.div 
                    className="profile-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                >
                    <div className="card-header">
                        <h2>📊 Account Activity</h2>
                    </div>

                    <div className="activity-content">
                        <div className="activity-row">
                            <span className="activity-label">Last Login</span>
                            <span className="activity-value">{accountActivity.lastLogin}</span>
                        </div>
                        <div className="activity-row">
                            <span className="activity-label">Last Login IP</span>
                            <span className="activity-value">{accountActivity.lastLoginIP}</span>
                        </div>
                        <div className="activity-row">
                            <span className="activity-label">Account Created</span>
                            <span className="activity-value">{accountActivity.accountCreated}</span>
                        </div>
                    </div>
                </motion.div>
<<<<<<< HEAD
=======

                {/* CARD 5: Hotel Information - Only for Admin and Staff */}
                {user?.role !== 'super_admin' && (
                    <motion.div 
                        className="profile-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                    >
                        <div className="card-header">
                            <h2>🏨 Hotel Information</h2>
                        </div>

                        {loadingHotel ? (
                            <div className="loading-state">
                                <p>Loading hotel information...</p>
                            </div>
                        ) : hotelInfo ? (
                            <div className="hotel-info-content">
                                <div className="hotel-info-grid">
                                    <div className="info-card">
                                        <div className="info-icon">🏨</div>
                                        <div className="info-details">
                                            <span className="info-label">Hotel Name</span>
                                            <span className="info-value">{hotelInfo.name}</span>
                                        </div>
                                    </div>

                                    <div className="info-card">
                                        <div className="info-icon">📍</div>
                                        <div className="info-details">
                                            <span className="info-label">Address</span>
                                            <span className="info-value">{hotelInfo.address}</span>
                                        </div>
                                    </div>

                                    <div className="info-card">
                                        <div className="info-icon">📞</div>
                                        <div className="info-details">
                                            <span className="info-label">Phone</span>
                                            <span className="info-value">{hotelInfo.phone || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="info-card">
                                        <div className="info-icon">🏷️</div>
                                        <div className="info-details">
                                            <span className="info-label">GST Number</span>
                                            <span className="info-value">{hotelInfo.gstNumber || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="info-card">
                                        <div className="info-icon">⭐</div>
                                        <div className="info-details">
                                            <span className="info-label">Subscription Plan</span>
                                            <span className={`subscription-badge ${hotelInfo.subscription?.plan}`}>
                                                {hotelInfo.subscription?.plan?.toUpperCase() || 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="info-card">
                                        <div className="info-icon">📅</div>
                                        <div className="info-details">
                                            <span className="info-label">Subscription Expiry</span>
                                            <span className="info-value">
                                                {hotelInfo.subscription?.expiryDate 
                                                    ? new Date(hotelInfo.subscription.expiryDate).toLocaleDateString()
                                                    : 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="info-card">
                                        <div className="info-icon">✅</div>
                                        <div className="info-details">
                                            <span className="info-label">Hotel Status</span>
                                            <span className={`status-badge ${hotelInfo.isActive ? 'active' : 'inactive'}`}>
                                                {hotelInfo.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="info-card">
                                        <div className="info-icon">🔒</div>
                                        <div className="info-details">
                                            <span className="info-label">Subscription Status</span>
                                            <span className={`status-badge ${hotelInfo.subscription?.isActive ? 'active' : 'inactive'}`}>
                                                {hotelInfo.subscription?.isActive ? 'Active' : 'Expired'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="no-hotel-info">
                                <p>No hotel information available. Please contact support.</p>
                            </div>
                        )}
                    </motion.div>
                )}
>>>>>>> main
            </div>

            {/* Action Buttons */}
            {editMode && (
                <motion.div 
                    className="action-buttons"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <button className="btn btn-secondary" onClick={handleCancel}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSaveChanges}>
                        Save Changes
                    </button>
                </motion.div>
            )}
        </div>
    );
};

<<<<<<< HEAD
export default SuperAdminProfile;
=======
export default MyProfile;
>>>>>>> main
