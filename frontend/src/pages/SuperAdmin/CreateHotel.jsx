import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    FaBell, 
    FaCog,
    FaHotel,
    FaMapMarkerAlt,
    FaPhone,
    FaFileInvoice,
    FaStar,
    FaClock,
    FaUser,
    FaEnvelope,
    FaLock,
    FaPlus
} from 'react-icons/fa';
import { MdDashboard, MdLogout } from 'react-icons/md';
import './SuperAdminDashboard.css';

const ADMIN_SCREEN_OPTIONS = [
    'Dashboard',
    'Reservations',
    'Rooms (Dashboard)',
    'Rooms (New Reservation)',
    'Room Service',
    'Housekeeping',
    'Reservation Card',
    'Food Order',
    'Cashier Section (Table)',
    'Cashier Section (Room Service)',
    'Cashier Section (Take Away)',
    'Table View',
    'KOT Order',
    'View order',
    'Customer List',
    'Cashier Logs',
    'Payment Logs',
    'Reports',
    'Property Setup',
    'Property Configuration',
    'CRM Model',
    'Settings'
];

const CreateHotel = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [formData, setFormData] = useState({
        hotelName: '',
        address: '',
        gstNumber: '',
        phone: '',
        subscriptionPlan: 'basic',
        subscriptionDuration: '12',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
        adminPhone: '',
        adminPermissions: []
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        setError('');
    };

    const toggleAdminPermission = (permissionLabel) => {
        setFormData((prev) => {
            const alreadySelected = prev.adminPermissions.includes(permissionLabel);
            const nextPermissions = alreadySelected
                ? prev.adminPermissions.filter((item) => item !== permissionLabel)
                : [...prev.adminPermissions, permissionLabel];

            return {
                ...prev,
                adminPermissions: nextPermissions
            };
        });
        setError('');
    };

    const validateForm = () => {
        // Validate hotel name
        if (formData.hotelName.trim().length < 3) {
            setError('Hotel name must be at least 3 characters long');
            return false;
        }

        // Validate address
        if (formData.address.trim().length < 10) {
            setError('Please provide a complete address');
            return false;
        }

        // Validate phone if provided
        if (formData.phone && !/^\+?[0-9\s-]{10,}$/.test(formData.phone)) {
            setError('Please enter a valid phone number');
            return false;
        }

        // Validate admin name
        if (formData.adminName.trim().length < 3) {
            setError('Admin name must be at least 3 characters long');
            return false;
        }

        // Validate admin email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.adminEmail)) {
            setError('Please enter a valid email address');
            return false;
        }

        // Validate admin phone if provided
        if (formData.adminPhone && !/^\+?[0-9\s-]{10,}$/.test(formData.adminPhone)) {
            setError('Please enter a valid admin phone number');
            return false;
        }

        // Validate admin password
        if (formData.adminPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }

        // Validate at least one screen permission for admin
        if (!Array.isArray(formData.adminPermissions) || formData.adminPermissions.length === 0) {
            setError('Please select at least one screen access for admin');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = user?.token;
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            await axios.post(
                '/api/super-admin/create-hotel',
                formData,
                config
            );

            setSuccess('Hotel and admin created successfully! Redirecting...');
            
            // Reset form  
            setFormData({
                hotelName: '',
                address: '',
                gstNumber: '',
                phone: '',
                subscriptionPlan: 'basic',
                subscriptionDuration: '12',
                adminName: '',
                adminEmail: '',
                adminPassword: '',
                adminPhone: '',
                adminPermissions: []
            });

            setTimeout(() => {
                navigate('/super-admin/hotels');
            }, 2000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error creating hotel. Please try again.';
            setError(errorMessage);
            console.error('Error creating hotel:', err);
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'SA';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="sa-container">
            {/* Sidebar */}
            <aside className={`sa-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sa-sidebar-header">
                    <span style={{ fontSize: '24px', color: '#e11d48' }}>⚡</span>
                    <h2>SUPER ADMIN</h2>
                </div>

                <nav className="sa-nav">
                    <button
                        className="sa-nav-item"
                        onClick={() => navigate('/super-admin/dashboard')}
                    >
                        <MdDashboard />
                        Dashboard
                    </button>
                    <button
                        className="sa-nav-item"
                        onClick={() => navigate('/super-admin/hotels')}
                    >
                        <FaHotel />
                        Hotels
                    </button>
                    <button
                        className="sa-nav-item active"
                    >
                        <FaPlus />
                        Create Hotel
                    </button>
                    <button
                        className="sa-nav-item"
                        onClick={handleLogout}
                    >
                        <MdLogout />
                        Logout
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="sa-main">
                {/* Header */}
                <header className="sa-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button className="sa-icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: 'none' }}>
                            ☰
                        </button>
                        <div className="sa-header-logo">
                            {/* Chef Hat Icon */}
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 13.87C4.31 13.12 3.25 11.53 3.5 9.77C3.76 7.91 5.38 6.54 7.26 6.54C7.54 6.54 7.82 6.57 8.08 6.63C8.62 3.96 11.08 2 14 2C17.31 2 20 4.69 20 8C20 8.35 19.96 8.69 19.89 9.03C21.43 9.94 22.34 11.64 22.09 13.43C21.82 15.35 20.15 16.71 18.23 16.71H17V19C17 20.66 15.66 22 14 22H9C7.34 22 6 20.66 6 19V17H5.77C5.83 15.89 5.86 14.86 6 13.87ZM8 17H15V19C15 19.55 14.55 20 14 20H9C8.45 20 8 19.55 8 19V17Z" fill="#374151" />
                            </svg>
                            <span>BIREENA ATITHI</span>
                        </div>
                    </div>

                    <div className="sa-header-actions">
                        <button className="sa-icon-btn">
                            <FaCog />
                        </button>
                        <button className="sa-icon-btn">
                            <FaBell />
                        </button>
                        <div className="sa-profile">
                            {getInitials(user?.name)}
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="sa-content">
                    <h3 className="sa-section-title">Create New Hotel</h3>

                    {/* Create Hotel Form */}
                    <div className="sa-card" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        {error && (
                            <div style={{
                                padding: '16px',
                                marginBottom: '24px',
                                background: '#fee2e2',
                                border: '1px solid #ef4444',
                                borderRadius: '8px',
                                color: '#E31E24',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}>
                                {error}
                            </div>
                        )}

                        {success && (
                            <div style={{
                                padding: '16px',
                                marginBottom: '24px',
                                background: '#d1fae5',
                                border: '1px solid #10b981',
                                borderRadius: '8px',
                                color: '#047857',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}>
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                            {/* Hotel Information Section */}
                            <div style={{ marginBottom: '32px' }}>
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: '700',
                                    color: '#1f2937',
                                    marginBottom: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    borderBottom: '2px solid #e5e7eb',
                                    paddingBottom: '12px'
                                }}>
                                    <FaHotel style={{ marginRight: '10px', color: '#EF4444' }} />
                                    Hotel Information
                                </h3>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#374151',
                                            marginBottom: '8px'
                                        }}>
                                            <FaHotel style={{ marginRight: '6px', fontSize: '14px' }} />
                                            Hotel Name <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="hotelName"
                                            value={formData.hotelName}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter hotel name"
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                transition: 'all 0.2s',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>

                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#374151',
                                            marginBottom: '8px'
                                        }}>
                                            <FaPhone style={{ marginRight: '6px', fontSize: '14px' }} />
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+91 1234567890"
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                transition: 'all 0.2s',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        marginBottom: '8px'
                                    }}>
                                        <FaMapMarkerAlt style={{ marginRight: '6px', fontSize: '14px' }} />
                                        Address <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                        rows="3"
                                        placeholder="Enter complete address"
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            transition: 'all 0.2s',
                                            outline: 'none',
                                            fontFamily: 'inherit',
                                            resize: 'vertical'
                                        }}
                                    ></textarea>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        marginBottom: '8px'
                                    }}>
                                        <FaFileInvoice style={{ marginRight: '6px', fontSize: '14px' }} />
                                        GST Number
                                    </label>
                                    <input
                                        type="text"
                                        name="gstNumber"
                                        value={formData.gstNumber}
                                        onChange={handleChange}
                                        placeholder="Enter GST number"
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            transition: 'all 0.2s',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Subscription Section */}
                            <div style={{ marginBottom: '32px' }}>
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: '700',
                                    color: '#1f2937',
                                    marginBottom: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    borderBottom: '2px solid #e5e7eb',
                                    paddingBottom: '12px'
                                }}>
                                    <FaStar style={{ marginRight: '10px', color: '#EF4444' }} />
                                    Subscription Details
                                </h3>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#374151',
                                            marginBottom: '8px'
                                        }}>
                                            <FaStar style={{ marginRight: '6px', fontSize: '14px' }} />
                                            Subscription Plan <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
                                        </label>
                                        <select
                                            name="subscriptionPlan"
                                            value={formData.subscriptionPlan}
                                            onChange={handleChange}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                transition: 'all 0.2s',
                                                outline: 'none',
                                                cursor: 'pointer',
                                                backgroundColor: 'white'
                                            }}
                                        >
                                            <option value="basic">Basic Plan</option>
                                            <option value="premium">Premium Plan</option>
                                        </select>
                                    </div>

                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#374151',
                                            marginBottom: '8px'
                                        }}>
                                            <FaClock style={{ marginRight: '6px', fontSize: '14px' }} />
                                            Duration (Months) <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
                                        </label>
                                        <select
                                            name="subscriptionDuration"
                                            value={formData.subscriptionDuration}
                                            onChange={handleChange}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                transition: 'all 0.2s',
                                                outline: 'none',
                                                cursor: 'pointer',
                                                backgroundColor: 'white'
                                            }}
                                        >
                                            <option value="1">1 Month</option>
                                            <option value="3">3 Months</option>
                                            <option value="6">6 Months</option>
                                            <option value="12">12 Months</option>
                                            <option value="24">24 Months</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Admin Information Section */}
                            <div style={{ marginBottom: '32px' }}>
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: '700',
                                    color: '#1f2937',
                                    marginBottom: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    borderBottom: '2px solid #e5e7eb',
                                    paddingBottom: '12px'
                                }}>
                                    <FaUser style={{ marginRight: '10px', color: '#EF4444' }} />
                                    Admin Details
                                </h3>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#374151',
                                            marginBottom: '8px'
                                        }}>
                                            <FaUser style={{ marginRight: '6px', fontSize: '14px' }} />
                                            Admin Name <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="adminName"
                                            value={formData.adminName}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter admin name"
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                transition: 'all 0.2s',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>

                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#374151',
                                            marginBottom: '8px'
                                        }}>
                                            <FaPhone style={{ marginRight: '6px', fontSize: '14px' }} />
                                            Admin Phone
                                        </label>
                                        <input
                                            type="tel"
                                            name="adminPhone"
                                            value={formData.adminPhone}
                                            onChange={handleChange}
                                            placeholder="+91 1234567890"
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                transition: 'all 0.2s',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#374151',
                                            marginBottom: '8px'
                                        }}>
                                            <FaEnvelope style={{ marginRight: '6px', fontSize: '14px' }} />
                                            Admin Email <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="adminEmail"
                                            value={formData.adminEmail}
                                            onChange={handleChange}
                                            required
                                            placeholder="admin@hotel.com"
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                transition: 'all 0.2s',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>

                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#374151',
                                            marginBottom: '8px'
                                        }}>
                                            <FaLock style={{ marginRight: '6px', fontSize: '14px' }} />
                                            Admin Password <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
                                        </label>
                                        <input
                                            type="password"
                                            name="adminPassword"
                                            value={formData.adminPassword}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter secure password"
                                            minLength="6"
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                transition: 'all 0.2s',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginTop: '8px' }}>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        marginBottom: '10px'
                                    }}>
                                        Assign Admin Screen Access <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
                                    </label>
                                    <p style={{
                                        margin: '0 0 12px 0',
                                        fontSize: '12px',
                                        color: '#6b7280'
                                    }}>
                                        Admin ko sirf selected screens hi dikhenge.
                                    </p>

                                    <div style={{
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '10px',
                                        padding: '14px',
                                        background: '#fafafa',
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                        gap: '10px'
                                    }}>
                                        {ADMIN_SCREEN_OPTIONS.map((permissionLabel) => {
                                            const checked = formData.adminPermissions.includes(permissionLabel);
                                            return (
                                                <label
                                                    key={permissionLabel}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        fontSize: '13px',
                                                        color: '#1f2937',
                                                        cursor: 'pointer',
                                                        background: checked ? '#fee2e2' : '#fff',
                                                        border: checked ? '1px solid #ef4444' : '1px solid #e5e7eb',
                                                        borderRadius: '8px',
                                                        padding: '8px 10px'
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => toggleAdminPermission(permissionLabel)}
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                    <span>{permissionLabel}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div style={{ 
                                display: 'flex', 
                                gap: '16px', 
                                justifyContent: 'flex-end',
                                marginTop: '32px',
                                paddingTop: '24px',
                                borderTop: '2px solid #e5e7eb'
                            }}>
                                <button
                                    type="button"
                                    onClick={() => navigate('/super-admin/hotels')}
                                    disabled={loading}
                                    style={{
                                        padding: '12px 32px',
                                        border: '2px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        background: 'white',
                                        color: '#64748b',
                                        opacity: loading ? 0.5 : 1
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        padding: '12px 32px',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        background: 'linear-gradient(135deg, #EF4444 0%, #E31E24 100%)',
                                        color: 'white',
                                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                                        opacity: loading ? 0.7 : 1
                                    }}
                                >
                                    {loading ? 'Creating...' : 'Create Hotel'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreateHotel;
