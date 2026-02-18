import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
    FaBell,
    FaCog,
    FaHotel,
    FaShieldAlt,
    FaExclamationTriangle,
    FaClock,
    FaPlus,
    FaChevronRight,
    FaBars,
    FaBuilding
} from 'react-icons/fa';
import { MdDashboard, MdLogout } from 'react-icons/md';
import './SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
    const { logout, user } = useAuth();
    const [activePage, setActivePage] = useState('dashboard');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

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

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        userId: '', // Renamed from email to match concept better, but backend expects 'username' (which is email)
        email: '',
        password: '',
        hotelName: '',
        phone: '',
        subscriptionEnd: ''
    });

    // Fetch Data
    const fetchHotels = async () => {
        try {
            const token = user?.token;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            const response = await axios.get('/api/super-admin/admins', config);
            const data = response.data;
            setHotels(data);

            // Calculate Statistics
            const total = data.length;
            const active = data.filter(h => h.isActive).length;
            const suspended = total - active;

            // Expiring soon (within 30 days)
            const now = new Date();
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(now.getDate() + 30);

            const expiring = data.filter(h => {
                if (!h.subscriptionEnd) return false;
                const date = new Date(h.subscriptionEnd);
                return date > now && date <= thirtyDaysFromNow;
            }).length;

            setStatistics({
                totalHotels: total,
                activeHotels: active,
                suspended: suspended,
                expiringSoon: expiring
            });
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load dashboard data');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHotels();
    }, [user]);

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    const getInitials = (name) => {
        if (!name) return 'SA';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = user?.token;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            const payload = {
                ...formData,
                phone: formData.phone || '0000000000',
                gstNumber: 'NA',
                subscriptionStart: new Date().toISOString()
            };

            await axios.post('/api/super-admin/create-admin', payload, config);

            setShowCreateModal(false);
            setFormData({
                name: '',
                email: '',
                password: '',
                hotelName: '',
                phone: '',
                subscriptionEnd: ''
            });
            fetchHotels();
            alert('Hotel created successfully!');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to create hotel');
        }
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
                        className={`sa-nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActivePage('dashboard')}
                    >
                        <MdDashboard />
                        Dashboard
                    </button>
                    <button
                        className={`sa-nav-item ${activePage === 'hotels' ? 'active' : ''}`}
                        onClick={() => setActivePage('hotels')}
                    >
                        <FaHotel />
                        Hotels
                    </button>
                    <button
                        className={`sa-nav-item ${activePage === 'create' ? 'active' : ''}`}
                        onClick={() => setShowCreateModal(true)}
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
                        <div className="sa-header-title">
                            <h1>SUPER ADMIN DASHBOARD</h1>
                        </div>
                    </div>

                    <div className="sa-header-actions">
                        <button className="sa-icon-btn">
                            <FaCog />
                        </button>
                        <button className="sa-icon-btn">
                            <FaBell />
                            <span className="sa-badge">3</span>
                        </button>
                        <div className="sa-profile">
                            {getInitials(user?.name)}
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="sa-content">
                    {activePage === 'dashboard' && (
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

                            {/* Subscription Table */}
                            <div className="sa-card">
                                <div className="sa-card-header">
                                    <div className="sa-card-title">Subscription Status</div>
                                    <button className="sa-view-all">
                                        View All <FaChevronRight style={{ fontSize: '10px' }} />
                                    </button>
                                </div>
                                <table className="sa-table">
                                    <thead>
                                        <tr>
                                            <th>Hotel Details</th>
                                            <th>Admin Contact</th>
                                            <th>Subscription</th>
                                            <th style={{ textAlign: 'right' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {hotels.length > 0 ? (
                                            hotels.map((hotel) => {
                                                const daysLeft = getDaysLeft(hotel.subscriptionEnd);
                                                const isExpiring = daysLeft < 30;
                                                return (
                                                    <tr key={hotel._id}>
                                                        <td>
                                                            <div className="font-bold text-gray-800">{hotel.hotelName}</div>
                                                            <div className="text-xs opacity-70 mt-1">ID: {hotel._id.slice(-6)}</div>
                                                        </td>
                                                        <td>
                                                            <div style={{ fontWeight: 500 }}>{hotel.name}</div>
                                                            <div className="text-xs opacity-70 mt-1">{hotel.username}</div>
                                                        </td>
                                                        <td>
                                                            <div className={`font-bold ${isExpiring ? 'text-red' : 'text-green'}`}>
                                                                {formatDate(hotel.subscriptionEnd)}
                                                            </div>
                                                            <div className={`text-xs mt-1 ${isExpiring ? 'text-red' : 'opacity-70'}`}>
                                                                {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                                                                {isExpiring && <FaExclamationTriangle style={{ marginLeft: '4px' }} />}
                                                            </div>
                                                        </td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <button className="sa-icon-btn">
                                                                <FaChevronRight />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                                                    No hotels found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {activePage !== 'dashboard' && activePage !== 'create' && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                            <FaHotel style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.5 }} />
                            <p style={{ fontSize: '20px' }}>Select <b>Dashboard</b> to view statistics.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="sa-modal-overlay">
                    <div className="sa-modal-content">
                        <div className="sa-modal-header">
                            <h3>Create New Hotel</h3>
                            <button className="sa-close-btn" onClick={() => setShowCreateModal(false)}>×</button>
                        </div>
                        <div className="sa-modal-body">
                            <form onSubmit={handleCreateSubmit}>
                                <div className="form-group">
                                    <label>Hotel Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="hotelName"
                                        placeholder="Name of the hotel"
                                        value={formData.hotelName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="form-group">
                                        <label>Admin Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            name="name"
                                            placeholder="Full name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            className="form-input"
                                            name="phone"
                                            placeholder="Contact number"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Admin Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        name="email"
                                        placeholder="admin@hotel.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        name="password"
                                        placeholder="Secure password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Subscription End Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        name="subscriptionEnd"
                                        value={formData.subscriptionEnd}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="sa-modal-footer" style={{ padding: '0', border: 'none', marginTop: '24px' }}>
                                    <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary">Create Hotel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard;
