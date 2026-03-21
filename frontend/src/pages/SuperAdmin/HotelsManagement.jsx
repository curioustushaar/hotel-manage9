import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    FaBell,
    FaCog,
    FaHotel,
    FaSearch,
    FaFilter,
    FaTimes,
    FaCheck,
    FaBan,
    FaRedo,
    FaEdit,
    FaEye,
    FaTrash,
    FaDownload,
    FaPlus,
    FaSortUp,
    FaSortDown,
    FaSort,
    FaCheckSquare,
    FaSquare,
    FaClock,
    FaExclamationTriangle,
    FaBars,
    FaUserShield,
    FaSave
} from 'react-icons/fa';
import { MdDashboard, MdLogout } from 'react-icons/md';
import './SuperAdminDashboard.css';

/**
 * REASONING FOR THIS IMPLEMENTATION:
 * 
 * 1. COMPREHENSIVE TABLE VIEW: Hotels need detailed information display
 *    with sortable columns for better data management
 * 
 * 2. ADVANCED FILTERS: Multiple filter criteria (status, plan, expiry)
 *    help super admin quickly find specific hotels
 * 
 * 3. BULK OPERATIONS: Managing multiple hotels simultaneously saves time
 *    when extending subscriptions or changing status
 * 
 * 4. PAGINATION: Essential for scaling - as hotel count grows, pagination
 *    prevents performance issues and improves UX
 * 
 * 5. SORTING: Allows super admin to organize data by different criteria
 *    (name, expiry date, creation date, etc.)
 * 
 * 6. EXPORT FUNCTIONALITY: Generate reports for stakeholders and record-keeping
 * 
 * 7. RESPONSIVE DESIGN: Ensures accessibility across devices
 */

const HotelsManagement = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    
    // UI States
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    
    // Data States
    const [hotels, setHotels] = useState([]);
    const [selectedHotels, setSelectedHotels] = useState([]);
    
    // Filter & Search States
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPlan, setFilterPlan] = useState('all');
    const [filterExpiry, setFilterExpiry] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    
    // Sorting States
    const [sortField, setSortField] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');
    
    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    // View State
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
    
    // Modals
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [permissionModal, setPermissionModal] = useState({ open: false, hotel: null });
    const [editingPermissions, setEditingPermissions] = useState([]);
    const [permissionSaving, setPermissionSaving] = useState(false);

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

    // Fetch Hotels Data
    const fetchHotels = async () => {
        try {
            const token = user?.token;
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const response = await axios.get('/api/super-admin/hotels', config);
            setHotels(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching hotels:', err);
            setError('Failed to load hotels data');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHotels();
    }, [user]);

    // Utility Functions
    const getDaysLeft = (dateString) => {
        if (!dateString) return 0;
        const diff = new Date(dateString) - new Date();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (hotel) => {
        const daysLeft = getDaysLeft(hotel.subscription?.expiryDate);
        const isActive = hotel.isActive && hotel.subscription?.isActive;
        
        if (!isActive) {
            return <span className="badge badge-danger">Suspended</span>;
        } else if (daysLeft < 0) {
            return <span className="badge badge-danger">Expired</span>;
        } else if (daysLeft <= 7) {
            return <span className="badge badge-warning">Expiring Soon</span>;
        } else {
            return <span className="badge badge-success">Active</span>;
        }
    };

    // Filter & Sort Logic
    const filteredAndSortedHotels = useMemo(() => {
        let filtered = [...hotels];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(hotel =>
                hotel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                hotel.adminId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                hotel.adminId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                hotel.phone?.includes(searchTerm)
            );
        }

        // Status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(hotel => {
                const isActive = hotel.isActive && hotel.subscription?.isActive;
                const daysLeft = getDaysLeft(hotel.subscription?.expiryDate);
                
                switch(filterStatus) {
                    case 'active':
                        return isActive && daysLeft > 7;
                    case 'suspended':
                        return !isActive;
                    case 'expiring':
                        return isActive && daysLeft <= 7 && daysLeft >= 0;
                    case 'expired':
                        return daysLeft < 0;
                    default:
                        return true;
                }
            });
        }

        // Plan filter
        if (filterPlan !== 'all') {
            filtered = filtered.filter(hotel => hotel.subscription?.plan === filterPlan);
        }

        // Expiry filter
        if (filterExpiry !== 'all') {
            filtered = filtered.filter(hotel => {
                const daysLeft = getDaysLeft(hotel.subscription?.expiryDate);
                switch(filterExpiry) {
                    case 'week':
                        return daysLeft <= 7 && daysLeft >= 0;
                    case 'month':
                        return daysLeft <= 30 && daysLeft >= 0;
                    case 'expired':
                        return daysLeft < 0;
                    default:
                        return true;
                }
            });
        }

        // Sorting
        filtered.sort((a, b) => {
            let aValue, bValue;
            
            switch(sortField) {
                case 'name':
                    aValue = a.name?.toLowerCase() || '';
                    bValue = b.name?.toLowerCase() || '';
                    break;
                case 'expiryDate':
                    aValue = new Date(a.subscription?.expiryDate || 0);
                    bValue = new Date(b.subscription?.expiryDate || 0);
                    break;
                case 'createdAt':
                    aValue = new Date(a.createdAt || 0);
                    bValue = new Date(b.createdAt || 0);
                    break;
                case 'plan':
                    aValue = a.subscription?.plan || '';
                    bValue = b.subscription?.plan || '';
                    break;
                default:
                    return 0;
            }

            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [hotels, searchTerm, filterStatus, filterPlan, filterExpiry, sortField, sortDirection]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredAndSortedHotels.length / itemsPerPage);
    const paginatedHotels = filteredAndSortedHotels.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Selection Handlers
    const toggleSelectAll = () => {
        if (selectedHotels.length === paginatedHotels.length) {
            setSelectedHotels([]);
        } else {
            setSelectedHotels(paginatedHotels.map(h => h._id));
        }
    };

    const toggleSelectHotel = (hotelId) => {
        if (selectedHotels.includes(hotelId)) {
            setSelectedHotels(selectedHotels.filter(id => id !== hotelId));
        } else {
            setSelectedHotels([...selectedHotels, hotelId]);
        }
    };

    // Action Handlers
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field) => {
        if (sortField !== field) return <FaSort />;
        return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
    };

    const handleExtendSubscription = async (hotelId, days = 30) => {
        if (!window.confirm(`Extend subscription by ${days} days?`)) return;

        setActionLoading(hotelId);
        try {
            const token = user?.token;
            await axios.patch(
                `/api/super-admin/renew/${hotelId}`,
                { days },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            await fetchHotels();
            alert('Subscription extended successfully!');
        } catch (err) {
            alert('Failed to extend subscription: ' + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleStatus = async (hotelId) => {
        setActionLoading(hotelId);
        try {
            const token = user?.token;
            await axios.patch(
                `/api/super-admin/suspend/${hotelId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            await fetchHotels();
            alert('Hotel status updated successfully!');
        } catch (err) {
            alert('Failed to update status: ' + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    const handleBulkExtend = async () => {
        if (selectedHotels.length === 0) {
            alert('Please select hotels first');
            return;
        }
        
        const days = prompt('Enter number of days to extend:', '30');
        if (!days) return;

        setActionLoading('bulk');
        try {
            const token = user?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            await Promise.all(
                selectedHotels.map(hotelId =>
                    axios.patch(`/api/super-admin/renew/${hotelId}`, { days }, config)
                )
            );

            await fetchHotels();
            setSelectedHotels([]);
            alert(`${selectedHotels.length} hotels extended successfully!`);
        } catch (err) {
            alert('Some operations failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    const handleBulkSuspend = async () => {
        if (selectedHotels.length === 0) {
            alert('Please select hotels first');
            return;
        }
        
        if (!confirm(`Suspend ${selectedHotels.length} hotels?`)) return;

        setActionLoading('bulk');
        try {
            const token = user?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            await Promise.all(
                selectedHotels.map(hotelId =>
                    axios.patch(`/api/super-admin/suspend/${hotelId}`, {}, config)
                )
            );

            await fetchHotels();
            setSelectedHotels([]);
            alert(`${selectedHotels.length} hotels suspended successfully!`);
        } catch (err) {
            alert('Some operations failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    const handleExportCSV = () => {
        const csvData = filteredAndSortedHotels.map(hotel => ({
            Name: hotel.name,
            Admin: hotel.adminId?.name || '-',
            Email: hotel.adminId?.email || '-',
            Phone: hotel.phone || '-',
            Plan: hotel.subscription?.plan,
            'Expiry Date': formatDate(hotel.subscription?.expiryDate),
            'Days Left': getDaysLeft(hotel.subscription?.expiryDate),
            Status: hotel.isActive && hotel.subscription?.isActive ? 'Active' : 'Suspended',
            'Created At': formatDate(hotel.createdAt)
        }));

        const headers = Object.keys(csvData[0] || {});
        const csv = [
            headers.join(','),
            ...csvData.map(row => headers.map(h => `"${row[h]}"`).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hotels_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilterStatus('all');
        setFilterPlan('all');
        setFilterExpiry('all');
    };

    const openPermissionModal = (hotel) => {
        if (!hotel.adminId?._id) {
            alert('No admin assigned for this hotel');
            return;
        }
        setPermissionModal({ open: true, hotel });
        setEditingPermissions(Array.isArray(hotel.adminId.permissions) ? hotel.adminId.permissions : []);
    };

    const closePermissionModal = () => {
        setPermissionModal({ open: false, hotel: null });
        setEditingPermissions([]);
        setPermissionSaving(false);
    };

    const togglePermission = (label) => {
        setEditingPermissions((prev) => (
            prev.includes(label)
                ? prev.filter((item) => item !== label)
                : [...prev, label]
        ));
    };

    const savePermissions = async () => {
        if (!permissionModal.hotel?._id) return;
        if (editingPermissions.length === 0) {
            alert('Select at least one screen permission');
            return;
        }

        setPermissionSaving(true);
        try {
            const token = user?.token;
            const payload = { permissions: editingPermissions };
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const adminUserId = permissionModal.hotel?.adminId?._id;

            // Try primary endpoint first, then fallback aliases for compatibility.
            try {
                await axios.patch(
                    `/api/super-admin/hotel/${permissionModal.hotel._id}/admin-permissions`,
                    payload,
                    config
                );
            } catch (primaryError) {
                try {
                    await axios.patch(
                        `/api/super-admin/hotel/${permissionModal.hotel._id}/permissions`,
                        payload,
                        config
                    );
                } catch (secondaryError) {
                    // Stable fallback: existing staff update endpoint can update admin user fields too.
                    if (!adminUserId) {
                        throw secondaryError;
                    }

                    await axios.put(
                        `/api/staff/${adminUserId}`,
                        payload,
                        config
                    );
                }
            }

            await fetchHotels();
            closePermissionModal();
            alert('Permissions updated successfully');
        } catch (err) {
            const status = err.response?.status;
            const message = err.response?.data?.message || err.message || 'Failed to update permissions';
            alert(`Failed to update permissions${status ? ` (${status})` : ''}: ${message}`);
            console.error('Permission update error:', err.response?.data || err);
        } finally {
            setPermissionSaving(false);
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

    if (loading) return <div className="sa-loading">Loading Hotels...</div>;

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
                        onClick={() => navigate('/super-admin/hotels')}
                    >
                        <FaHotel />
                        Hotels
                    </button>
                    <button
                        className="sa-nav-item"
                        onClick={() => navigate('/super-admin/hotels/create')}
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
                        <button className="sa-icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            <FaBars />
                        </button>
                        <div className="sa-header-logo">
                            <FaHotel style={{ color: '#e11d48' }} />
                            <span>HOTELS MANAGEMENT</span>
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

                <div className="sa-content">
                    {/* Action Bar */}
                    <div className="action-bar">
                        <div className="search-bar">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search hotels, admins, email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <button
                                className="filter-toggle-btn"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <FaFilter /> Filters
                            </button>
                            
                            {selectedHotels.length > 0 && (
                                <>
                                    <button
                                        className="action-btn secondary"
                                        onClick={handleBulkExtend}
                                        disabled={actionLoading === 'bulk'}
                                    >
                                        <FaRedo /> Extend ({selectedHotels.length})
                                    </button>
                                    <button
                                        className="action-btn danger"
                                        onClick={handleBulkSuspend}
                                        disabled={actionLoading === 'bulk'}
                                    >
                                        <FaBan /> Suspend ({selectedHotels.length})
                                    </button>
                                </>
                            )}
                            
                            <button
                                className="action-btn secondary"
                                onClick={handleExportCSV}
                            >
                                <FaDownload /> Export CSV
                            </button>
                            
                            <button
                                className="action-btn primary"
                                onClick={() => navigate('/super-admin/hotels/create')}
                            >
                                <FaPlus /> New Hotel
                            </button>
                        </div>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="filters-panel">
                            <div className="filters-grid">
                                <div>
                                    <label>Status</label>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="filter-select"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="suspended">Suspended</option>
                                        <option value="expiring">Expiring Soon</option>
                                        <option value="expired">Expired</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label>Plan</label>
                                    <select
                                        value={filterPlan}
                                        onChange={(e) => setFilterPlan(e.target.value)}
                                        className="filter-select"
                                    >
                                        <option value="all">All Plans</option>
                                        <option value="basic">Basic</option>
                                        <option value="premium">Premium</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label>Expiry</label>
                                    <select
                                        value={filterExpiry}
                                        onChange={(e) => setFilterExpiry(e.target.value)}
                                        className="filter-select"
                                    >
                                        <option value="all">All Dates</option>
                                        <option value="week">Within 7 Days</option>
                                        <option value="month">Within 30 Days</option>
                                        <option value="expired">Expired</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button onClick={clearFilters} className="action-btn secondary">
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Results Summary */}
                    <div className="results-summary">
                        <div>
                            Showing {paginatedHotels.length} of {filteredAndSortedHotels.length} hotels
                            {selectedHotels.length > 0 && ` (${selectedHotels.length} selected)`}
                        </div>
                    </div>

                    {/* Hotels Table */}
                    <div className="sa-card">
                        <div className="table-responsive">
                            <table className="sa-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px' }}>
                                            <button
                                                onClick={toggleSelectAll}
                                                className="checkbox-btn"
                                            >
                                                {selectedHotels.length === paginatedHotels.length && paginatedHotels.length > 0 ? 
                                                    <FaCheckSquare /> : <FaSquare />}
                                            </button>
                                        </th>
                                        <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                                            Hotel Name {getSortIcon('name')}
                                        </th>
                                        <th>Admin Info</th>
                                        <th onClick={() => handleSort('plan')} style={{ cursor: 'pointer' }}>
                                            Plan {getSortIcon('plan')}
                                        </th>
                                        <th onClick={() => handleSort('expiryDate')} style={{ cursor: 'pointer' }}>
                                            Expiry Date {getSortIcon('expiryDate')}
                                        </th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedHotels.length > 0 ? (
                                        paginatedHotels.map((hotel) => {
                                            const daysLeft = getDaysLeft(hotel.subscription?.expiryDate);
                                            const isActive = hotel.isActive && hotel.subscription?.isActive;
                                            
                                            return (
                                                <tr key={hotel._id} className={selectedHotels.includes(hotel._id) ? 'selected' : ''}>
                                                    <td>
                                                        <button
                                                            onClick={() => toggleSelectHotel(hotel._id)}
                                                            className="checkbox-btn"
                                                        >
                                                            {selectedHotels.includes(hotel._id) ? 
                                                                <FaCheckSquare /> : <FaSquare />}
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <div className="font-bold">{hotel.name}</div>
                                                        <div className="text-xs opacity-70">{hotel.phone || '-'}</div>
                                                    </td>
                                                    <td>
                                                        <div>{hotel.adminId?.name || 'No Admin'}</div>
                                                        <div className="text-xs opacity-70">
                                                            {hotel.adminId?.email || '-'}
                                                        </div>
                                                        {hotel.adminId?._id && (
                                                            <div className="permission-pill-row">
                                                                <span className="permission-count-pill">
                                                                    {(hotel.adminId?.permissions || []).length} permissions
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className={`badge badge-${hotel.subscription?.plan === 'premium' ? 'primary' : 'secondary'}`}>
                                                            {hotel.subscription?.plan?.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className={daysLeft < 7 ? 'text-red' : ''}>
                                                            {formatDate(hotel.subscription?.expiryDate)}
                                                        </div>
                                                        <div className="text-xs">
                                                            {daysLeft >= 0 ? `${daysLeft} days left` : `${Math.abs(daysLeft)} days overdue`}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {getStatusBadge(hotel)}
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                            <button
                                                                className="icon-btn"
                                                                title="View Details"
                                                                onClick={() => navigate(`/super-admin/hotel/${hotel._id}`)}
                                                            >
                                                                <FaEye />
                                                            </button>
                                                            <button
                                                                className="icon-btn permission-icon-btn"
                                                                title="View/Edit Permissions"
                                                                onClick={() => openPermissionModal(hotel)}
                                                                disabled={!hotel.adminId?._id}
                                                            >
                                                                <FaUserShield />
                                                            </button>
                                                            <button
                                                                className="icon-btn"
                                                                title="Extend Subscription"
                                                                onClick={() => handleExtendSubscription(hotel._id)}
                                                                disabled={actionLoading === hotel._id}
                                                            >
                                                                <FaRedo />
                                                            </button>
                                                            <button
                                                                className="icon-btn"
                                                                title={isActive ? 'Suspend' : 'Activate'}
                                                                onClick={() => handleToggleStatus(hotel._id)}
                                                                disabled={actionLoading === hotel._id}
                                                            >
                                                                {isActive ? <FaBan /> : <FaCheck />}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                                                <div style={{ opacity: 0.5 }}>
                                                    <FaHotel style={{ fontSize: '48px', marginBottom: '16px' }} />
                                                    <p>No hotels found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="pagination-btn"
                                >
                                    Previous
                                </button>
                                
                                <div className="pagination-info">
                                    Page {currentPage} of {totalPages}
                                </div>
                                
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="pagination-btn"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {permissionModal.open && (
                <div className="perm-modal-overlay" onClick={closePermissionModal}>
                    <div className="perm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="perm-modal-header">
                            <div>
                                <h3>Admin Screen Permissions</h3>
                                <p>
                                    {permissionModal.hotel?.name} · {permissionModal.hotel?.adminId?.name || 'Admin'}
                                </p>
                            </div>
                            <button className="perm-close-btn" onClick={closePermissionModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="perm-modal-toolbar">
                            <button
                                className="action-btn secondary"
                                type="button"
                                onClick={() => setEditingPermissions(ADMIN_SCREEN_OPTIONS)}
                            >
                                Select All
                            </button>
                            <button
                                className="action-btn secondary"
                                type="button"
                                onClick={() => setEditingPermissions([])}
                            >
                                Clear All
                            </button>
                            <span className="perm-selected-count">
                                {editingPermissions.length} selected
                            </span>
                        </div>

                        <div className="perm-grid">
                            {ADMIN_SCREEN_OPTIONS.map((label) => {
                                const checked = editingPermissions.includes(label);
                                return (
                                    <label
                                        key={label}
                                        className={`perm-item ${checked ? 'checked' : ''}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => togglePermission(label)}
                                        />
                                        <span>{label}</span>
                                    </label>
                                );
                            })}
                        </div>

                        <div className="perm-modal-actions">
                            <button className="action-btn secondary" type="button" onClick={closePermissionModal}>
                                Cancel
                            </button>
                            <button
                                className="action-btn primary"
                                type="button"
                                onClick={savePermissions}
                                disabled={permissionSaving}
                            >
                                <FaSave /> {permissionSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HotelsManagement;
