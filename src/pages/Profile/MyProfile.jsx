import { useState } from 'react';
import { motion } from 'framer-motion';
import './MyProfile.css';

const MyProfile = () => {
    // Form state
    const [formData, setFormData] = useState({
        fullName: 'Himanshu Yadav',
        mobileNumber: '+91 98765 43210',
        email: 'admin@bireena.com',
        role: 'Administrator'
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPasswordError, setShowPasswordError] = useState('');
    const [showPasswordSuccess, setShowPasswordSuccess] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);

    // Account activity data (mock)
    const accountActivity = {
        lastLogin: 'Feb 5, 2026 at 10:30 AM',
        lastLoginIP: '192.168.1.100',
        accountCreated: 'Jan 15, 2026'
    };

    // Get user initials
    const getUserInitials = (name) => {
        const names = name.split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
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
            fullName: 'Himanshu Yadav',
            mobileNumber: '+91 98765 43210',
            email: 'admin@bireena.com',
            role: 'Administrator'
        });
    };

    return (
        <div className="my-profile-container">
            {/* Page Header */}
            <motion.div 
                className="profile-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="header-content">
                    <h1 className="header-title">My Profile</h1>
                    <p className="header-subtitle">Manage your personal information and security</p>
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
                                <span className="role-badge">{formData.role}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Email</span>
                                <span className="info-value">{formData.email}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Mobile</span>
                                <span className="info-value">{formData.mobileNumber}</span>
                            </div>
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
                                    placeholder="Administrator"
                                />
                                <span className="helper-text">Role is assigned by account owner</span>
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

export default MyProfile;
