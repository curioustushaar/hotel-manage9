import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    FaBell,
    FaCog,
    FaHotel,
    FaShieldAlt,
    FaExclamationTriangle,
    FaClock,
    FaChevronRight,
    FaBars,
    FaBuilding,
    FaPlus,
    FaUser,
    FaSearch,
    FaFilter,
    FaTimes,
    FaCheck,
    FaBan,
    FaRedo,
    FaEdit
} from 'react-icons/fa';
import { MdDashboard, MdLogout } from 'react-icons/md';
import './SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeView, setActiveView] = useState('dashboard');

    // Data States
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statistics, setStatistics] = useState({
        totalHotels: 0,
        activeHotels: 0,
        suspended: 0,
        expiringSoon: 0
    });

    // Search & Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPlan, setFilterPlan] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    // Notification States
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);

    // Subscription Management States
    const [actionLoading, setActionLoading] = useState(null);



    // Fetch Data
    const fetchDashboardData = async () => {
        try {
            const token = user?.token;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            // Fetch dashboard statistics
            const statsResponse = await axios.get('/api/super-admin/dashboard', config);
            setStatistics(statsResponse.data);

            // Fetch hotels list
            const hotelsResponse = await axios.get('/api/super-admin/hotels', config);
            setHotels(hotelsResponse.data);

            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load dashboard data');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    // Generate Notifications
    useEffect(() => {
        if (hotels.length > 0) {
            const notifs = [];
            hotels.forEach(hotel => {
                const daysLeft = getDaysLeft(hotel.subscription?.expiryDate);
                
                if (daysLeft < 0) {
                    notifs.push({
                        id: hotel._id,
                        type: 'expired',
                        message: `${hotel.name}'s subscription has expired`,
                        hotel: hotel.name,
                        priority: 'high'
                    });
                } else if (daysLeft <= 7) {
                    notifs.push({
                        id: hotel._id,
                        type: 'expiring',
                        message: `${hotel.name}'s subscription expires in ${daysLeft} days`,
                        hotel: hotel.name,
                        priority: 'medium'
                    });
                }
                
                if (!hotel.subscription?.active) {
                    notifs.push({
                        id: hotel._id + '_suspended',
                        type: 'suspended',
                        message: `${hotel.name} is currently suspended`,
                        hotel: hotel.name,
                        priority: 'high'
                    });
                }
            });
            setNotifications(notifs);
        }
    }, [hotels]);

    // Filter Hotels based on search and filters
    const filteredHotels = useMemo(() => {
        return hotels.filter(hotel => {
            // Search filter
            const matchesSearch = searchTerm === '' || 
                hotel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                hotel.adminId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                hotel.adminId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                hotel.phone?.includes(searchTerm);

            // Status filter
            const matchesStatus = filterStatus === 'all' || 
                (filterStatus === 'active' && hotel.subscription?.active) ||
                (filterStatus === 'suspended' && !hotel.subscription?.active) ||
                (filterStatus === 'expiring' && getDaysLeft(hotel.subscription?.expiryDate) <= 7 && getDaysLeft(hotel.subscription?.expiryDate) >= 0);

            // Plan filter
            const matchesPlan = filterPlan === 'all' || hotel.subscription?.plan === filterPlan;

            return matchesSearch && matchesStatus && matchesPlan;
        });
    }, [hotels, searchTerm, filterStatus, filterPlan]);

    // Subscription Management Functions
    const handleExtendSubscription = async (hotelId, days = 30) => {
        if (!window.confirm(`Extend subscription by ${days} days?`)) return;
        
        setActionLoading(hotelId);
        try {
            const token = user?.token;
            await axios.post(
                `/api/super-admin/hotel/${hotelId}/extend-subscription`,
                { days },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            await fetchDashboardData();
            alert('Subscription extended successfully!');
        } catch (err) {
            alert('Failed to extend subscription: ' + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleStatus = async (hotelId, currentStatus) => {
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
            
            await fetchDashboardData();
            alert(`Hotel ${action}d successfully!`);
        } catch (err) {
            alert(`Failed to ${action} hotel: ` + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilterStatus('all');
        setFilterPlan('all');
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    const getInitials = (name) => {
        if (!name) return 'SA';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };



    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getDaysLeft = (dateString) => {
        if (!dateString) return 0;
        const diff = new Date(dateString) - new Date();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
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
                        className={`sa-nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveView('dashboard')}
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
                            <FaBars />
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
                        <div style={{ position: 'relative' }}>
                            <button 
                                className="sa-icon-btn" 
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <FaBell />
                                {notifications.length > 0 && (
                                    <span className="sa-badge">{notifications.length}</span>
                                )}
                            </button>
                            
                            {/* Notification Panel */}
                            {showNotifications && (
                                <div className="notification-panel">
                                    <div className="notification-header">
                                        <h3>Notifications</h3>
                                        <button onClick={() => setShowNotifications(false)}>
                                            <FaTimes />
                                        </button>
                                    </div>
                                    <div className="notification-list">
                                        {notifications.length === 0 ? (
                                            <div className="notification-empty">
                                                <FaCheck style={{ fontSize: '32px', opacity: 0.3 }} />
                                                <p>No new notifications</p>
                                            </div>
                                        ) : (
                                            notifications.map(notif => (
                                                <div 
                                                    key={notif.id} 
                                                    className={`notification-item ${notif.priority}`}
                                                >
                                                    <div className="notification-icon">
                                                        {notif.type === 'expired' && <FaExclamationTriangle />}
                                                        {notif.type === 'expiring' && <FaClock />}
                                                        {notif.type === 'suspended' && <FaBan />}
                                                    </div>
                                                    <div className="notification-content">
                                                        <p>{notif.message}</p>
                                                        <small>{notif.hotel}</small>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="sa-profile">
                            {getInitials(user?.name)}
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="sa-content">
                    {activeView === 'dashboard' ? (
                        <>
                            {/* Stats Section */}
                            <h3 className="sa-section-title">Hotel Statistics</h3>
                            <div className="sa-stats-grid">
                                <div className="sa-stat-card">
                                    <FaBuilding className="sa-stat-icon-large" />
                                    <div className="sa-stat-content">
                                        <div className="sa-stat-icon-wrapper">
                                            <FaBuilding />
                                        </div>
                                        <div className="sa-stat-label">Total Hotels</div>
                                        <div className="sa-stat-value">{statistics.totalHotels}</div>
                                    </div>
                                </div>
                                <div className="sa-stat-card">
                                    <FaShieldAlt className="sa-stat-icon-large" />
                                    <div className="sa-stat-content">
                                        <div className="sa-stat-icon-wrapper">
                                            <FaShieldAlt />
                                        </div>
                                        <div className="sa-stat-label">Active Hotels</div>
                                        <div className="sa-stat-value">{statistics.activeHotels}</div>
                                    </div>
                                </div>
                                <div className="sa-stat-card">
                                    <FaExclamationTriangle className="sa-stat-icon-large" />
                                    <div className="sa-stat-content">
                                        <div className="sa-stat-icon-wrapper">
                                            <FaExclamationTriangle />
                                        </div>
                                        <div className="sa-stat-label">Suspended Hotels</div>
                                        <div className="sa-stat-value">{statistics.suspended}</div>
                                    </div>
                                </div>
                                <div className="sa-stat-card">
                                    <FaClock className="sa-stat-icon-large" />
                                    <div className="sa-stat-content">
                                        <div className="sa-stat-icon-wrapper">
                                            <FaClock />
                                        </div>
                                        <div className="sa-stat-label">Expiring Soon</div>
                                        <div className="sa-stat-value">{statistics.expiringSoon}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Search & Filter Section */}
                            <div className="search-filter-section">
                                <div className="search-bar">
                                    <FaSearch className="search-icon" />
                                    <input
                                        type="text"
                                        placeholder="Search hotels by name, admin email, or phone..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="search-input"
                                    />
                                    {searchTerm && (
                                        <button 
                                            className="clear-search"
                                            onClick={() => setSearchTerm('')}
                                        >
                                            <FaTimes />
                                        </button>
                                    )}
                                </div>
                                
                                <button 
                                    className="filter-toggle-btn"
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <FaFilter />
                                    Filters
                                    {(filterStatus !== 'all' || filterPlan !== 'all') && (
                                        <span className="filter-active-badge"></span>
                                    )}
                                </button>
                            </div>

                            {/* Filter Options */}
                            {showFilters && (
                                <div className="filter-options">
                                    <div className="filter-group">
                                        <label>Status:</label>
                                        <select 
                                            value={filterStatus} 
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                        >
                                            <option value="all">All Status</option>
                                            <option value="active">Active</option>
                                            <option value="suspended">Suspended</option>
                                            <option value="expiring">Expiring Soon</option>
                                        </select>
                                    </div>
                                    
                                    <div className="filter-group">
                                        <label>Plan:</label>
                                        <select 
                                            value={filterPlan} 
                                            onChange={(e) => setFilterPlan(e.target.value)}
                                        >
                                            <option value="all">All Plans</option>
                                            <option value="basic">Basic</option>
                                            <option value="premium">Premium</option>
                                            <option value="enterprise">Enterprise</option>
                                        </select>
                                    </div>
                                    
                                    <button 
                                        className="clear-filters-btn"
                                        onClick={clearFilters}
                                    >
                                        <FaTimes /> Clear All
                                    </button>
                                    
                                    <div className="filter-results">
                                        Showing {filteredHotels.length} of {hotels.length} hotels
                                    </div>
                                </div>
                            )}

                            {/* Subscription Table */}
                            <div className="sa-card">
                                <div className="sa-card-header">
                                    <div className="sa-card-title">Subscription Status</div>
                                    <button 
                                        className="sa-view-all"
                                        onClick={() => navigate('/super-admin/hotels')}
                                    >
                                        View All <FaChevronRight style={{ fontSize: '10px' }} />
                                    </button>
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
                                        {filteredHotels.length > 0 ? (
                                            filteredHotels.slice(0, 5).map((hotel) => {
                                                const daysLeft = getDaysLeft(hotel.subscription?.expiryDate);
                                                const isExpiring = daysLeft < 7 && daysLeft >= 0;
                                                const isExpired = daysLeft < 0;
                                                const isActive = hotel.subscription?.active;
                                                return (
                                                    <tr 
                                                        key={hotel._id}
                                                    >
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
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleExtendSubscription(hotel._id);
                                                                    }}
                                                                    disabled={actionLoading === hotel._id}
                                                                    title="Extend 30 days"
                                                                >
                                                                    <FaRedo />
                                                                </button>
                                                                <button 
                                                                    className={`action-btn ${isActive ? 'suspend-btn' : 'activate-btn'}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleToggleStatus(hotel._id, isActive);
                                                                    }}
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
                                        ) : (
                                            <tr>
                                                <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                                                    {searchTerm || filterStatus !== 'all' || filterPlan !== 'all' 
                                                        ? 'No hotels match your filters.' 
                                                        : 'No hotels found.'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : null}
                </div>
            </main>
        </div>
    );
};

export default SuperAdminDashboard;
