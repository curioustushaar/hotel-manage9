import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    FaBell, 
    FaCog, 
    FaSearch,
    FaPlus,
    FaChevronRight,
    FaExclamationTriangle,
    FaHotel,
    FaRedo,
    FaBan,
    FaCheck,
    FaEdit
} from 'react-icons/fa';
import { MdDashboard, MdLogout } from 'react-icons/md';
import './SuperAdminDashboard.css';

const HotelsManagement = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchHotels = async () => {
        try {
            const token = user?.token;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    search: searchQuery || undefined,
                    status: activeFilter !== 'all' ? activeFilter : undefined
                }
            };

            const response = await axios.get('/api/super-admin/hotels', config);
            setHotels(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching hotels:', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHotels();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFilter, searchQuery]);

    const handleSuspend = async (hotelId, currentStatus, e) => {
        e.stopPropagation();
        const action = currentStatus ? 'suspend' : 'activate';
        if (!window.confirm(`Are you sure you want to ${action} this hotel?`)) return;

        setActionLoading(hotelId);
        try {
            const token = user?.token;
            await axios.patch(
                `/api/super-admin/hotel/${hotelId}/toggle-status`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchHotels();
        } catch (err) {
            console.error('Error toggling hotel status:', err);
            alert(`Error ${action}ing hotel`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleExtendSubscription = async (hotelId, e, days = 30) => {
        e.stopPropagation();
        if (!window.confirm(`Extend subscription by ${days} days?`)) return;
        
        setActionLoading(hotelId);
        try {
            const token = user?.token;
            await axios.post(
                `/api/super-admin/hotel/${hotelId}/extend-subscription`,
                { days },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            fetchHotels();
            alert('Subscription extended successfully!');
        } catch (err) {
            alert('Failed to extend subscription: ' + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    const getDaysLeft = (expiryDate) => {
        const now = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return 'SA';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const activeCount = hotels.filter(h => h.subscription?.active).length;
    const suspendedCount = hotels.filter(h => !h.subscription?.active).length;

    const filteredHotels = hotels.filter(hotel => {
        if (activeFilter === 'active') return hotel.subscription?.active;
        if (activeFilter === 'suspended') return !hotel.subscription?.active;
        return true;
    });

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
                        className="sa-nav-item active"
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
                    <h3 className="sa-section-title">All Hotels</h3>

                    {/* Search & Filter Section */}
                    <div className="search-filter-section">
                        <div className="search-bar">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search hotels by name, admin email, or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        
                        <button 
                            onClick={() => navigate('/super-admin/create-hotel')}
                            className="filter-toggle-btn"
                            style={{ gap: '10px' }}
                        >
                            <FaPlus />
                            Create Hotel
                        </button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="filter-options" style={{ padding: '12px 16px', marginBottom: '20px' }}>
                        <button
                            className={`filter-btn-tab ${activeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('all')}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: activeFilter === 'all' ? '2px solid #EF4444' : '2px solid #e2e8f0',
                                background: activeFilter === 'all' ? '#fef2f2' : 'white',
                                color: activeFilter === 'all' ? '#EF4444' : '#64748b',
                                fontWeight: '600',
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {activeFilter === 'all' && <FaCheck />}
                            All
                        </button>
                        <button
                            className={`filter-btn-tab ${activeFilter === 'active' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('active')}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: activeFilter === 'active' ? '2px solid #EF4444' : '2px solid #e2e8f0',
                                background: activeFilter === 'active' ? '#fef2f2' : 'white',
                                color: activeFilter === 'active' ? '#EF4444' : '#64748b',
                                fontWeight: '600',
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            Active
                            <span style={{
                                padding: '2px 8px',
                                borderRadius: '12px',
                                background: activeFilter === 'active' ? '#EF4444' : '#e2e8f0',
                                color: activeFilter === 'active' ? 'white' : '#64748b',
                                fontSize: '12px',
                                fontWeight: '700'
                            }}>{activeCount}</span>
                        </button>
                        <button
                            className={`filter-btn-tab ${activeFilter === 'suspended' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('suspended')}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: activeFilter === 'suspended' ? '2px solid #EF4444' : '2px solid #e2e8f0',
                                background: activeFilter === 'suspended' ? '#fef2f2' : 'white',
                                color: activeFilter === 'suspended' ? '#EF4444' : '#64748b',
                                fontWeight: '600',
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            Suspended
                            <span style={{
                                padding: '2px 8px',
                                borderRadius: '12px',
                                background: activeFilter === 'suspended' ? '#EF4444' : '#e2e8f0',
                                color: activeFilter === 'suspended' ? 'white' : '#64748b',
                                fontSize: '12px',
                                fontWeight: '700'
                            }}>{suspendedCount}</span>
                        </button>
                    </div>

                    {/* Hotels Table */}
                    <div className="sa-card">
                        <div className="sa-card-header">
                            <div className="sa-card-title">Hotels List ({filteredHotels.length})</div>
                        </div>
                        <table className="sa-table">
                            <thead>
                                <tr>
                                    <th>Hotel Details</th>
                                    <th>Admin Contact</th>
                                    <th>Subscription</th>
                                    <th style={{ textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                                            Loading hotels...
                                        </td>
                                    </tr>
                                ) : filteredHotels.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                                            {searchQuery ? 'No hotels match your search.' : 'No hotels found.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredHotels.map((hotel) => {
                                        const daysLeft = getDaysLeft(hotel.subscription?.expiryDate);
                                        const isExpiring = daysLeft < 7 && daysLeft >= 0;
                                        const isExpired = daysLeft < 0;
                                        const isActive = hotel.subscription?.active;
                                        
                                        return (
                                            <tr key={hotel._id}>
                                                <td onClick={() => navigate(`/super-admin/hotel/${hotel._id}`)} style={{ cursor: 'pointer' }}>
                                                    <div className="font-bold text-gray-800">{hotel.name}</div>
                                                    <div className="text-xs opacity-70 mt-1">
                                                        {hotel.subscription?.plan.toUpperCase()}
                                                        {!isActive && <span style={{ marginLeft: '8px', padding: '2px 6px', background: '#fee', color: '#c00', borderRadius: '4px', fontSize: '10px' }}>SUSPENDED</span>}
                                                    </div>
                                                </td>
                                                <td onClick={() => navigate(`/super-admin/hotel/${hotel._id}`)} style={{ cursor: 'pointer' }}>
                                                    <div style={{ fontWeight: 500 }}>
                                                        {hotel.adminId?.name || 'No Admin'}
                                                    </div>
                                                    <div className="text-xs opacity-70 mt-1">
                                                        {hotel.adminId?.email || '-'}
                                                    </div>
                                                </td>
                                                <td onClick={() => navigate(`/super-admin/hotel/${hotel._id}`)} style={{ cursor: 'pointer' }}>
                                                    <div className={`font-bold ${isExpired ? 'text-red' : isExpiring ? 'text-red' : 'text-green'}`}>
                                                        {formatDate(hotel.subscription?.expiryDate)}
                                                    </div>
                                                    <div className={`text-xs mt-1 ${isExpired || isExpiring ? 'text-red' : 'opacity-70'}`}>
                                                        {isExpired ? 'Expired' : `${daysLeft} days left`}
                                                        {isExpiring && <FaExclamationTriangle style={{ marginLeft: '4px' }} />}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                                                        <button 
                                                            className="action-btn extend-btn"
                                                            onClick={(e) => handleExtendSubscription(hotel._id, e)}
                                                            disabled={actionLoading === hotel._id}
                                                            title="Extend 30 days"
                                                        >
                                                            <FaRedo />
                                                        </button>
                                                        <button 
                                                            className={`action-btn ${isActive ? 'suspend-btn' : 'activate-btn'}`}
                                                            onClick={(e) => handleSuspend(hotel._id, isActive, e)}
                                                            disabled={actionLoading === hotel._id}
                                                            title={isActive ? 'Suspend' : 'Activate'}
                                                        >
                                                            {isActive ? <FaBan /> : <FaCheck />}
                                                        </button>
                                                        <button 
                                                            className="action-btn edit-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/super-admin/hotel/${hotel._id}`);
                                                            }}
                                                            title="View Details"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HotelsManagement;
