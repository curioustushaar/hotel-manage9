import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
    FaBell, 
    FaCog,
    FaBuilding,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaFileInvoice,
    FaCalendarAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaHotel,
    FaPlus
} from 'react-icons/fa';
import { MdDashboard, MdLogout } from 'react-icons/md';
import './SuperAdminDashboard.css';

const HotelDetails = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showRenewModal, setShowRenewModal] = useState(false);
    const [renewDuration, setRenewDuration] = useState('12');
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradePlan, setUpgradePlan] = useState('premium');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        fetchHotelDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchHotelDetails = async () => {
        try {
            const token = user?.token;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            const response = await axios.get(`/api/super-admin/hotel/${id}`, config);
            setHotel(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching hotel details');
            setLoading(false);
        }
    };

    const handleSuspend = async () => {
        if (!window.confirm('Are you sure you want to suspend this hotel?')) return;
        
        setActionLoading(true);
        try {
            const token = user?.token;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            await axios.patch(`/api/super-admin/suspend/${id}`, {}, config);
            setSuccess('Hotel suspended successfully');
            fetchHotelDetails();
        } catch (err) {
            setError(err.response?.data?.message || 'Error suspending hotel');
        } finally {
            setActionLoading(false);
        }
    };

    const handleActivate = async () => {
        setActionLoading(true);
        try {
            const token = user?.token;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            await axios.patch(`/api/super-admin/activate/${id}`, {}, config);
            setSuccess('Hotel activated successfully');
            fetchHotelDetails();
        } catch (err) {
            setError(err.response?.data?.message || 'Error activating hotel');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRenew = async () => {
        setActionLoading(true);
        try {
            const token = user?.token;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            await axios.patch(`/api/super-admin/renew/${id}`, 
                { duration: renewDuration }, 
                config
            );
            setSuccess('Subscription renewed successfully');
            setShowRenewModal(false);
            fetchHotelDetails();
        } catch (err) {
            setError(err.response?.data?.message || 'Error renewing subscription');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpgrade = async () => {
        setActionLoading(true);
        try {
            const token = user?.token;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            await axios.patch(`/api/super-admin/upgrade-plan/${id}`, 
                { plan: upgradePlan }, 
                config
            );
            setSuccess('Subscription plan updated successfully');
            setShowUpgradeModal(false);
            fetchHotelDetails();
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating plan');
        } finally {
            setActionLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return 'SA';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getDaysRemaining = (expiryDate) => {
        const now = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    if (loading) {
        return (
            <div className="sa-container">
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100vh',
                    fontSize: '18px',
                    color: '#64748b'
                }}>
                    Loading hotel details...
                </div>
            </div>
        );
    }

    if (!hotel) {
        return (
            <div className="sa-container">
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100vh',
                    fontSize: '18px',
                    color: '#ef4444'
                }}>
                    Hotel not found
                </div>
            </div>
        );
    }

    const daysRemaining = getDaysRemaining(hotel.subscription.expiryDate);
    const isExpired = daysRemaining < 0;

    return (
        <>
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
                        className="sa-nav-item active"
                        onClick={() => navigate('/super-admin/hotels')}
                    >
                        <FaHotel />
                        Hotels
                    </button>
                    <button
                        className="sa-nav-item"
                        onClick={() => navigate('/super-admin/create-hotel')}
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
                    <h3 className="sa-section-title">Hotel Details</h3>

                    {/* Alerts */}
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

                    {/* Hotel Details Grid */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', 
                        gap: '24px',
                        marginBottom: '24px'
                    }}>
                        {/* Hotel Information Card */}
                        <div className="sa-card">
                            <div style={{
                                padding: '20px',
                                borderBottom: '1px solid #e5e7eb',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                background: 'linear-gradient(135deg, #fef2f2 0%, #fff 100%)'
                            }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #EF4444 0%, #E31E24 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '24px'
                                }}>
                                    <FaBuilding />
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                                    Hotel Information
                                </h3>
                            </div>
                            <div style={{ padding: '24px' }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ 
                                        fontSize: '12px', 
                                        fontWeight: '600', 
                                        color: '#6b7280', 
                                        marginBottom: '6px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        HOTEL NAME
                                    </div>
                                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                                        {hotel.name}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ 
                                        fontSize: '12px', 
                                        fontWeight: '600', 
                                        color: '#6b7280', 
                                        marginBottom: '6px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        <FaMapMarkerAlt style={{ fontSize: '10px' }} /> ADDRESS
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6' }}>
                                        {hotel.address}
                                    </div>
                                </div>
                                {hotel.gstNumber && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ 
                                            fontSize: '12px', 
                                            fontWeight: '600', 
                                            color: '#6b7280', 
                                            marginBottom: '6px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            <FaFileInvoice style={{ fontSize: '10px' }} /> GST NUMBER
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#4b5563', fontFamily: 'monospace' }}>
                                            {hotel.gstNumber}
                                        </div>
                                    </div>
                                )}
                                {hotel.phone && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ 
                                            fontSize: '12px', 
                                            fontWeight: '600', 
                                            color: '#6b7280', 
                                            marginBottom: '6px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            <FaPhone style={{ fontSize: '10px' }} /> PHONE
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#4b5563' }}>
                                            {hotel.phone}
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <div style={{ 
                                        fontSize: '12px', 
                                        fontWeight: '600', 
                                        color: '#6b7280', 
                                        marginBottom: '6px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        STATUS
                                    </div>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        background: hotel.isActive ? '#d1fae5' : '#fee2e2',
                                        color: hotel.isActive ? '#047857' : '#E31E24'
                                    }}>
                                        {hotel.isActive ? <FaCheckCircle /> : <FaTimesCircle />}
                                        {hotel.isActive ? 'Active' : 'Suspended'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Admin Information Card */}
                        <div className="sa-card">
                            <div style={{
                                padding: '20px',
                                borderBottom: '1px solid #e5e7eb',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                background: 'linear-gradient(135deg, #fef2f2 0%, #fff 100%)'
                            }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #EF4444 0%, #E31E24 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '24px'
                                }}>
                                    <FaUser />
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                                    Admin Information
                                </h3>
                            </div>
                            <div style={{ padding: '24px' }}>
                                {hotel.adminId ? (
                                    <>
                                        <div style={{ marginBottom: '20px' }}>
                                            <div style={{ 
                                                fontSize: '12px', 
                                                fontWeight: '600', 
                                                color: '#6b7280', 
                                                marginBottom: '6px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}>
                                                <FaUser style={{ fontSize: '10px' }} /> NAME
                                            </div>
                                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                                                {hotel.adminId.name}
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '20px' }}>
                                            <div style={{ 
                                                fontSize: '12px', 
                                                fontWeight: '600', 
                                                color: '#6b7280', 
                                                marginBottom: '6px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}>
                                                <FaEnvelope style={{ fontSize: '10px' }} /> EMAIL
                                            </div>
                                            <div style={{ fontSize: '14px', color: '#4b5563' }}>
                                                {hotel.adminId.email}
                                            </div>
                                        </div>
                                        {hotel.adminId.phone && (
                                            <div>
                                                <div style={{ 
                                                    fontSize: '12px', 
                                                    fontWeight: '600', 
                                                    color: '#6b7280', 
                                                    marginBottom: '6px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}>
                                                    <FaPhone style={{ fontSize: '10px' }} /> PHONE
                                                </div>
                                                <div style={{ fontSize: '14px', color: '#4b5563' }}>
                                                    {hotel.adminId.phone}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div style={{ 
                                        padding: '40px', 
                                        textAlign: 'center', 
                                        color: '#9ca3af',
                                        fontSize: '14px'
                                    }}>
                                        No admin assigned
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Subscription Information Card - Full Width */}
                    <div className="sa-card" style={{ marginBottom: '24px' }}>
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid #e5e7eb',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: 'linear-gradient(135deg, #fef2f2 0%, #fff 100%)'
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #EF4444 0%, #E31E24 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '24px'
                            }}>
                                <FaCalendarAlt />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                                Subscription Information
                            </h3>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                                gap: '24px' 
                            }}>
                                <div>
                                    <div style={{ 
                                        fontSize: '12px', 
                                        fontWeight: '600', 
                                        color: '#6b7280', 
                                        marginBottom: '8px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        PLAN
                                    </div>
                                    <div style={{
                                        display: 'inline-flex',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        textTransform: 'uppercase',
                                        background: hotel.subscription.plan === 'premium' 
                                            ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                                            : 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                                        color: 'white',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}>
                                        {hotel.subscription.plan}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ 
                                        fontSize: '12px', 
                                        fontWeight: '600', 
                                        color: '#6b7280', 
                                        marginBottom: '8px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        START DATE
                                    </div>
                                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>
                                        {formatDate(hotel.subscription.startDate)}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ 
                                        fontSize: '12px', 
                                        fontWeight: '600', 
                                        color: '#6b7280', 
                                        marginBottom: '8px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        EXPIRY DATE
                                    </div>
                                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>
                                        {formatDate(hotel.subscription.expiryDate)}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ 
                                        fontSize: '12px', 
                                        fontWeight: '600', 
                                        color: '#6b7280', 
                                        marginBottom: '8px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        DAYS REMAINING
                                    </div>
                                    <div style={{ 
                                        fontSize: '20px', 
                                        fontWeight: '700',
                                        color: isExpired ? '#E31E24' : daysRemaining <= 7 ? '#f59e0b' : '#10b981'
                                    }}>
                                        {isExpired ? 'Expired' : `${daysRemaining} days`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ 
                        display: 'flex', 
                        gap: '16px', 
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        padding: '24px 0'
                    }}>
                        {hotel.isActive ? (
                            <button 
                                onClick={handleSuspend}
                                disabled={actionLoading}
                                style={{
                                    padding: '12px 32px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    background: 'linear-gradient(135deg, #EF4444 0%, #E31E24 100%)',
                                    color: 'white',
                                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                                    opacity: actionLoading ? 0.7 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <FaTimesCircle />
                                Suspend Hotel
                            </button>
                        ) : (
                            <button 
                                onClick={handleActivate}
                                disabled={actionLoading}
                                style={{
                                    padding: '12px 32px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                    opacity: actionLoading ? 0.7 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <FaCheckCircle />
                                Activate Hotel
                            </button>
                        )}

                        <button 
                            onClick={() => setShowRenewModal(true)}
                            disabled={actionLoading}
                            style={{
                                padding: '12px 32px',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: actionLoading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                color: 'white',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                opacity: actionLoading ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <FaCalendarAlt />
                            Renew Subscription
                        </button>

                        <button 
                            onClick={() => setShowUpgradeModal(true)}
                            disabled={actionLoading}
                            style={{
                                padding: '12px 32px',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: actionLoading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                color: 'white',
                                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                                opacity: actionLoading ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <FaCheckCircle />
                            Change Plan
                        </button>
                    </div>
                </div>
            </main>
        </div>

        {/* Renew Subscription Modal */}
        {showRenewModal && (
            <div className="modal-overlay" onClick={() => setShowRenewModal(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3>Renew Subscription</h3>
                        <button onClick={() => setShowRenewModal(false)} className="modal-close">
                            ×
                        </button>
                    </div>
                    
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Select Duration (Months)</label>
                            <select
                                value={renewDuration}
                                onChange={(e) => setRenewDuration(e.target.value)}
                            >
                                <option value="1">1 Month</option>
                                <option value="3">3 Months</option>
                                <option value="6">6 Months</option>
                                <option value="12">12 Months</option>
                                <option value="24">24 Months</option>
                            </select>
                        </div>

                        <div className="modal-actions">
                            <button 
                                onClick={() => setShowRenewModal(false)} 
                                className="btn-cancel"
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleRenew} 
                                className="btn-create"
                                disabled={actionLoading}
                            >
                                {actionLoading ? 'Renewing...' : 'Renew'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Upgrade Plan Modal */}
        {showUpgradeModal && (
            <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3>Change Subscription Plan</h3>
                        <button onClick={() => setShowUpgradeModal(false)} className="modal-close">
                            ×
                        </button>
                    </div>
                    
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Select Plan</label>
                            <select
                                value={upgradePlan}
                                onChange={(e) => setUpgradePlan(e.target.value)}
                            >
                                <option value="basic">Basic</option>
                                <option value="premium">Premium</option>
                            </select>
                        </div>

                        <div className="modal-actions">
                            <button 
                                onClick={() => setShowUpgradeModal(false)} 
                                className="btn-cancel"
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleUpgrade} 
                                className="btn-create"
                                disabled={actionLoading}
                            >
                                {actionLoading ? 'Updating...' : 'Update Plan'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </>
    );
};

export default HotelDetails;
