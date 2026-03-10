import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import API_URL from '../../config/api';
import { Users, User, Calendar, DollarSign, Plus, Edit2, Search, Briefcase, FileText, CheckCircle, X, Shield, Trash2, Check, Lock } from 'lucide-react';
import './CRMModel.css';

const CRMModel = () => {
    const { user } = useAuth();
    const { getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();
    const [staffData, setStaffData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('All');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [showPayrollModal, setShowPayrollModal] = useState(false);
    const [showShiftModal, setShowShiftModal] = useState(false);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [showPerformanceModal, setShowPerformanceModal] = useState(false);
    const [showPermissionsViewModal, setShowPermissionsViewModal] = useState(false);
    const [showSalaryModal, setShowSalaryModal] = useState(false);
    const [salaryEditStaff, setSalaryEditStaff] = useState(null);
    const [salaryEditValue, setSalaryEditValue] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [permDropdownOpen, setPermDropdownOpen] = useState(false);
    const [customPermInput, setCustomPermInput] = useState('');
    const [showCustomPermInput, setShowCustomPermInput] = useState(false);
    const [customRoleInput, setCustomRoleInput] = useState('');
    const [showCustomRoleInput, setShowCustomRoleInput] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        role: 'staff',
        outlet: 'Dine-In',
        shift: 'Morning',
        salary: '',
        attendanceStatus: 'Present',
        performance: 0,
        image: '',
        permissions: []
    });

    const OUTLET_OPTIONS = [
        'Dine-In', 'Room Service', 'Bar', 'Pool', 'Garden', 'Banquet', 
        'Conference', 'Reception', 'Housekeeping', 'Maintenance', 
        'Security', 'Kitchen', 'General'
    ];

    const [roleOptions, setRoleOptions] = useState([
        { value: 'staff', label: 'Staff' },
        { value: 'waiter', label: 'Waiter' },
        { value: 'manager', label: 'Manager' },
        { value: 'receptionist', label: 'Receptionist' },
        { value: 'chef', label: 'Chef' },
        { value: 'housekeeping', label: 'Housekeeping' },
    ]);

    // Add custom role
    const handleAddCustomRole = () => {
        const trimmed = customRoleInput.trim();
        if (trimmed && !roleOptions.find(r => r.value === trimmed.toLowerCase())) {
            const newRole = { value: trimmed.toLowerCase(), label: trimmed };
            setRoleOptions(prev => [...prev, newRole]);
            setFormData({...formData, role: newRole.value});
            setCustomRoleInput('');
            setShowCustomRoleInput(false);
        }
    };

    // All page permissions
    const [permissionOptions, setPermissionOptions] = useState([
        'Dashboard', 'Reservations', 'Housekeeping',
        'Room Service', 'Reservation Card',
        'Table View', 'Food Order', 'View Order',
        'Cashier Section (Table)', 'Cashier Section (Room Service)', 'Cashier Section (Take Away)',
        'Customer List', 'Cashier Logs', 'Payment Logs',
        'Property Setup', 'Property Configuration', 'Reports',
        'CRM Model'
    ]);

    // Add custom permission
    const handleAddCustomPermission = () => {
        const trimmed = customPermInput.trim();
        if (trimmed && !permissionOptions.includes(trimmed)) {
            setPermissionOptions(prev => [...prev, trimmed]);
            setFormData({...formData, permissions: [...formData.permissions, trimmed]});
            setCustomPermInput('');
            setShowCustomPermInput(false);
        }
    };

    // Default permissions by role
    const ROLE_DEFAULT_PERMISSIONS = {
        staff: [],
        waiter: ['Table View', 'Food Order', 'View Order'],
        manager: ['Dashboard', 'Reservations', 'Housekeeping', 'Room Service', 'Customer List', 'Reports', 'CRM Model'],
        receptionist: ['Dashboard', 'Reservations', 'Reservation Card', 'Customer List'],
        chef: ['Food Order', 'View Order', 'Room Service'],
        housekeeping: ['Housekeeping'],
    };

    const SHIFT_TIMINGS = {
        'Morning': { label: 'Morning (6AM - 2PM)', start: 6, end: 14 },
        'Evening': { label: 'Evening (2PM - 10PM)', start: 14, end: 22 },
        'Night': { label: 'Night (10PM - 6AM)', start: 22, end: 6 },
    };

    // Determine current shift based on time
    const getCurrentShift = () => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 14) return 'Morning';
        if (hour >= 14 && hour < 22) return 'Evening';
        return 'Night';
    };

    const currentShift = getCurrentShift();

    useEffect(() => {
        fetchStaff();
    }, []);

    // Auto-clear success message
    useEffect(() => {
        if (successMsg) {
            const timer = setTimeout(() => setSuccessMsg(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMsg]);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/staff`);
            setStaffData(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching staff:', error);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // When role changes, auto-assign default permissions
    const handleRoleChange = (e) => {
        const newRole = e.target.value;
        const defaultPerms = ROLE_DEFAULT_PERMISSIONS[newRole] || [];
        setFormData({ ...formData, role: newRole, permissions: defaultPerms });
    };

    // Generic Update Handler
    const handleQuickUpdate = async (staffId, field, value) => {
        try {
            // Optimistic UI update first
            setStaffData(prev => prev.map(s => s._id === staffId ? { ...s, [field]: value } : s));
            await axios.put(`${API_URL}/api/staff/${staffId}`, { [field]: value });
            setSuccessMsg(`${field} updated!`);
        } catch (error) {
            console.error(`Error updating ${field}:`, error);
            // Revert on failure
            fetchStaff();
            setError(`Failed to update ${field}`);
        }
    };

    // Shift change
    const handleShiftChange = async (staffId, newShift) => {
        await handleQuickUpdate(staffId, 'shift', newShift);
    };

    // Attendance change (shift-aware)
    const handleAttendanceChange = async (staffId, status) => {
        await handleQuickUpdate(staffId, 'attendanceStatus', status);
    };

    // Performance change
    const handlePerformanceChange = async (staffId, rating) => {
        await handleQuickUpdate(staffId, 'performance', Number(rating));
    };

    // Salary update
    const handleSalaryUpdate = async () => {
        if (salaryEditStaff) {
            await handleQuickUpdate(salaryEditStaff._id, 'salary', Number(salaryEditValue));
            setSalaryEditStaff(null);
            setSalaryEditValue('');
            setShowSalaryModal(false);
        }
    };

    // Delete staff
    const handleDeleteStaff = async (staffId) => {
        try {
            await axios.delete(`${API_URL}/api/staff/${staffId}`);
            setStaffData(prev => prev.filter(s => s._id !== staffId));
            setShowDeleteConfirm(null);
            setSuccessMsg('Staff deleted!');
        } catch (error) {
            console.error('Error deleting staff:', error);
            setError('Failed to delete staff');
        }
    };

    const openAddModal = () => {
        setEditingStaff(null);
        setFormData({
            fullName: '', email: '', phone: '', password: '',
            role: 'staff', outlet: 'Dine-In', shift: 'Morning',
            salary: '', attendanceStatus: 'Present', performance: 0,
            image: '', permissions: []
        });
        setError('');
        setShowModal(true);
    };

    const openEditModal = (staff) => {
        setEditingStaff(staff);
        setFormData({
            fullName: staff.name, email: staff.username,
            phone: staff.phone || '', password: '',
            role: staff.role || 'staff', outlet: staff.outlet || 'General',
            shift: staff.shift || 'Morning', salary: staff.salary || 0,
            attendanceStatus: staff.attendanceStatus || 'Present',
            performance: staff.performance || 0, image: staff.image || '',
            permissions: staff.permissions || []
        });
        setError('');
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const payload = {
                fullName: formData.fullName, email: formData.email,
                phone: formData.phone, role: formData.role,
                outlet: formData.outlet, shift: formData.shift,
                salary: Number(formData.salary),
                attendanceStatus: formData.attendanceStatus,
                performance: Number(formData.performance),
                image: formData.image, permissions: formData.permissions || []
            };
            if (formData.password) payload.password = formData.password;

            if (editingStaff) {
                await axios.put(`${API_URL}/api/staff/${editingStaff._id}`, payload);
                setSuccessMsg('Staff updated!');
            } else {
                if (!formData.password) { setError('Password is required'); return; }
                await axios.post(`${API_URL}/api/staff`, payload);
                setSuccessMsg('Staff added!');
            }
            setShowModal(false);
            fetchStaff();
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving staff');
        }
    };

    // Filter
    const filteredStaff = staffData.filter(staff => {
        const matchesSearch = staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              staff.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (staff.permissions || []).some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole = filterRole === 'All' || (staff.role && staff.role === filterRole);
        return matchesSearch && matchesRole;
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStaff = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

    // Stats
    const totalStaff = staffData.length;
    const presentToday = staffData.filter(s => s.attendanceStatus === 'Present').length;
    const onLeave = staffData.filter(s => s.attendanceStatus === 'On Leave').length;
    const totalPayroll = staffData.reduce((acc, curr) => acc + (Number(curr.salary) || 0), 0);

    // Check if staff's shift matches current shift
    const canMarkAttendance = (staff) => (staff.shift || 'Morning') === currentShift;

    // Interactive stars
    const renderStars = (staffMember) => {
        const perf = staffMember.performance || 0;
        return (
            <div className="performance-stars-interactive">
                {[1, 2, 3, 4, 5].map(star => (
                    <span
                        key={star}
                        className={`star-btn ${star <= perf ? 'filled' : 'empty'}`}
                        onClick={() => handlePerformanceChange(staffMember._id, star === perf ? 0 : star)}
                        title={`Rate ${star}`}
                    >★</span>
                ))}
                <span className="rating-number">{perf.toFixed(1)}</span>
            </div>
        );
    };

    return (
        <div className="crm-container">
            {/* Toasts */}
            {successMsg && (
                <div className="crm-toast success">
                    <CheckCircle size={16} /> {successMsg}
                </div>
            )}
            {error && !showModal && (
                <div className="crm-toast error">
                    <X size={16} /> {error}
                    <button className="toast-close" onClick={() => setError('')}>&times;</button>
                </div>
            )}

            {/* Header */}
            <div className="crm-header-section">
                <div className="crm-title-group">
                    <h1>Staff Management</h1>
                    <p className="crm-date">Today: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} | Current Shift: <strong>{currentShift}</strong> ({SHIFT_TIMINGS[currentShift].label})</p>
                </div>
                <div className="crm-header-actions">
                    <button className="crm-btn crm-btn-primary" onClick={openAddModal}>
                        <Plus size={16} /> Add Staff
                    </button>
                    <div className="crm-user-badge">
                        <span>{user?.name || 'Admin'}</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="crm-stats-grid">
                <div className="crm-stat-card">
                    <div className="crm-stat-icon-wrapper" style={{background: '#ffe4e6', color: '#e11d48'}}><Users size={24} /></div>
                    <div className="crm-stat-content">
                        <h3 className="crm-stat-value">{totalStaff}</h3>
                        <p className="crm-stat-label">Total Staff</p>
                        <span className="crm-stat-subtext">Active Employees</span>
                    </div>
                </div>
                <div className="crm-stat-card">
                    <div className="crm-stat-icon-wrapper" style={{background: '#dcfce7', color: '#166534'}}><CheckCircle size={24} /></div>
                    <div className="crm-stat-content">
                        <h3 className="crm-stat-value">{presentToday}</h3>
                        <p className="crm-stat-label">Present Today</p>
                        <span className="crm-stat-subtext">Out of {totalStaff} Staff</span>
                    </div>
                </div>
                <div className="crm-stat-card">
                    <div className="crm-stat-icon-wrapper" style={{background: '#fef3c7', color: '#92400e'}}><Calendar size={24} /></div>
                    <div className="crm-stat-content">
                        <h3 className="crm-stat-value">{onLeave}</h3>
                        <p className="crm-stat-label">On Leave</p>
                        <span className="crm-stat-subtext">Today</span>
                    </div>
                </div>
                <div className="crm-stat-card">
                    <div className="crm-stat-icon-wrapper" style={{background: '#ffedd5', color: '#c2410c'}}><DollarSign size={24} /></div>
                    <div className="crm-stat-content">
                        <h3 className="crm-stat-value">{cs}{totalPayroll.toLocaleString('en-IN')}</h3>
                        <p className="crm-stat-label">Total Payroll</p>
                        <span className="crm-stat-subtext">This Month (Est.)</span>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="crm-action-bar">
                <button className="crm-action-btn" onClick={() => setShowAttendanceModal(true)}>
                    <CheckCircle size={16} /> Mark Attendance
                </button>
                <button className="crm-action-btn" onClick={() => setShowShiftModal(true)}>
                    <Calendar size={16} /> Manage Shifts
                </button>
                <button className="crm-action-btn" onClick={() => setShowPayrollModal(true)}>
                    <DollarSign size={16} /> Run Payroll
                </button>
                <button className="crm-action-btn" onClick={() => setShowPerformanceModal(true)}>
                    <FileText size={16} /> View Performance
                </button>
                <button className="crm-action-btn" onClick={() => setShowPermissionsViewModal(true)}>
                    <Shield size={16} /> View Permissions
                </button>
                <button className="crm-action-btn add-staff-action-btn" onClick={openAddModal}>
                    <Plus size={16} /> Add Staff
                </button>
            </div>

            {/* Staff Table */}
            <div className="crm-table-wrapper">
                <div className="crm-table-header">
                    <h2 className="crm-table-title">Staff List</h2>
                    <div className="crm-filters">
                        <div className="crm-search-box">
                            <Search size={16} />
                            <input type="text" placeholder="Search staff..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="crm-search-input" />
                        </div>
                        <select className="crm-filter-select" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                            <option value="All">All Roles</option>
                            {[...new Set([
                                ...roleOptions.map(r => r.value),
                                ...staffData.map(s => s.role).filter(Boolean)
                            ])].map(role => (
                                <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>Loading staff data...</div>
                ) : (
                <table className="crm-staff-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Staff</th>
                            <th>Role</th>
                            <th>Permission</th>
                            <th>Shift</th>
                            <th>Attendance</th>
                            <th>Salary</th>
                            <th>Performance</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentStaff.length > 0 ? (
                            currentStaff.map((staff, index) => (
                                <tr key={staff._id}>
                                    <td>{indexOfFirstItem + index + 1}</td>
                                    <td>
                                        <div className="staff-profile-cell">
                                            <img src={staff.image || `https://ui-avatars.com/api/?name=${staff.name}&background=random`} alt={staff.name} className="staff-avatar" />
                                            <div className="staff-name-block">
                                                <span className="staff-name-text">{staff.name}</span>
                                                <span className="staff-email-text">{staff.username}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`role-badge role-${(staff.role || 'staff').toLowerCase()}`}>
                                            {staff.role || 'staff'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="permission-tags">
                                            {staff.permissions && staff.permissions.length > 0 ? (
                                                <>
                                                    {staff.permissions.slice(0, 2).map((perm, i) => (
                                                        <span key={i} className="permission-tag">{perm}</span>
                                                    ))}
                                                    {staff.permissions.length > 2 && (
                                                        <span className="permission-tag more-tag" title={staff.permissions.slice(2).join(', ')} onClick={() => setShowPermissionsViewModal(true)}>
                                                            +{staff.permissions.length - 2}
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="no-permission">No permissions</span>
                                            )}
                                        </div>
                                    </td>
                                    {/* Shift - Functional dropdown */}
                                    <td>
                                        <select className="inline-shift-select" value={staff.shift || 'Morning'} onChange={(e) => handleShiftChange(staff._id, e.target.value)}>
                                            <option value="Morning">Morning</option>
                                            <option value="Evening">Evening</option>
                                            <option value="Night">Night</option>
                                        </select>
                                    </td>
                                    {/* Attendance - Shift-aware */}
                                    <td>
                                        {canMarkAttendance(staff) ? (
                                            <div className="inline-attendance">
                                                {['Present', 'Absent', 'On Leave'].map(status => (
                                                    <button
                                                        key={status}
                                                        className={`att-btn ${staff.attendanceStatus === status ? 'active' : ''} ${status.toLowerCase().replace(' ', '-')}`}
                                                        onClick={() => handleAttendanceChange(staff._id, status)}
                                                        title={status}
                                                    >
                                                        {status === 'Present' ? '✓' : status === 'Absent' ? '✗' : '⏸'}
                                                    </button>
                                                ))}
                                                <span className={`att-label ${(staff.attendanceStatus || 'absent').toLowerCase().replace(' ', '-')}`}>
                                                    {staff.attendanceStatus || 'Absent'}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="attendance-locked">
                                                <span className={`status-badge status-${(staff.attendanceStatus || 'absent').toLowerCase().replace(' ', '-')}`}>
                                                    {staff.attendanceStatus || 'Absent'}
                                                </span>
                                                <span className="shift-lock-hint">🔒 {staff.shift || 'Morning'} shift</span>
                                            </div>
                                        )}
                                    </td>
                                    {/* Salary - Clickable */}
                                    <td>
                                        <span className="salary-cell" onClick={() => { setSalaryEditStaff(staff); setSalaryEditValue(staff.salary || 0); setShowSalaryModal(true); }} title="Click to edit salary">
                                            {cs}{(staff.salary || 0).toLocaleString()}
                                            <Edit2 size={12} className="salary-edit-icon" />
                                        </span>
                                    </td>
                                    {/* Performance - Interactive Stars */}
                                    <td>{renderStars(staff)}</td>
                                    {/* Actions */}
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className={`action-icon-btn tick-btn ${staff.attendanceStatus === 'Present' ? 'active-present' : ''}`}
                                                onClick={() => handleAttendanceChange(staff._id, staff.attendanceStatus === 'Present' ? 'Absent' : 'Present')}
                                                title={staff.attendanceStatus === 'Present' ? 'Mark Absent' : 'Mark Present'}
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button className="action-icon-btn edit-btn" onClick={() => openEditModal(staff)} title="Edit">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="action-icon-btn delete-btn" onClick={() => setShowDeleteConfirm(staff)} title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="9" style={{textAlign: 'center', padding: '30px'}}>No staff members found.</td></tr>
                        )}
                    </tbody>
                </table>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="crm-pagination">
                        <span>Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStaff.length)} of {filteredStaff.length}</span>
                        <div className="pagination-controls">
                            <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Previous</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button key={page} className={`page-btn ${currentPage === page ? 'active' : ''}`} onClick={() => setCurrentPage(page)}>{page}</button>
                            ))}
                            <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* ===== ADD / EDIT STAFF MODAL ===== */}
            {showModal && (
                <div className="crm-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="crm-modal wide-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingStaff ? '✏️ Edit Staff Member' : '➕ Add New Staff'}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        
                        {error && <div className="modal-error">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            {/* Section 1: Personal Info */}
                            <div className="form-section">
                                <h3 className="form-section-title"><User size={16} /> Personal Information</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Full Name *</label>
                                        <input type="text" name="fullName" className="form-input" value={formData.fullName} onChange={handleInputChange} placeholder="Enter full name" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Email (Login Username) *</label>
                                        <input type="email" name="email" className="form-input" value={formData.email} onChange={handleInputChange} placeholder="staff@hotel.com" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input type="text" name="phone" className="form-input" value={formData.phone} onChange={handleInputChange} placeholder="+91 XXXXXXXXXX" />
                                    </div>
                                    <div className="form-group">
                                        <label>{editingStaff ? 'Password (leave blank to keep)' : 'Password *'}</label>
                                        <input type="password" name="password" className="form-input" value={formData.password} onChange={handleInputChange} placeholder={editingStaff ? '••••••••' : 'Enter password'} required={!editingStaff} />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Profile Image URL (Optional)</label>
                                        <input type="text" name="image" className="form-input" placeholder="https://example.com/avatar.jpg" value={formData.image} onChange={handleInputChange} />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Job Details */}
                            <div className="form-section">
                                <h3 className="form-section-title"><Briefcase size={16} /> Job Details</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Role *</label>
                                        <div className="role-input-wrapper">
                                            <select name="role" className="form-input" value={formData.role} onChange={handleRoleChange}>
                                                {roleOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                                            </select>
                                            {showCustomRoleInput ? (
                                                <div className="custom-role-input-row">
                                                    <input
                                                        type="text"
                                                        className="form-input custom-role-input"
                                                        placeholder="Role name"
                                                        value={customRoleInput}
                                                        onChange={(e) => setCustomRoleInput(e.target.value)}
                                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomRole(); } }}
                                                        autoFocus
                                                    />
                                                    <button type="button" className="btn-mini add-perm-btn" onClick={handleAddCustomRole}>Add</button>
                                                    <button type="button" className="btn-mini" onClick={() => { setShowCustomRoleInput(false); setCustomRoleInput(''); }}>✕</button>
                                                </div>
                                            ) : (
                                                <button type="button" className="add-role-plus-btn" onClick={() => setShowCustomRoleInput(true)}>
                                                    <Plus size={12} /> Add Role
                                                </button>
                                            )}
                                        </div>
                                        <small className="form-hint">Permissions auto-assign based on role</small>
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Permissions</label>
                                        <div className="perm-dropdown-wrapper">
                                            <div className="perm-dropdown-trigger" onClick={() => setPermDropdownOpen(!permDropdownOpen)}>
                                                <span className="perm-dropdown-text">
                                                    {formData.permissions.length > 0 ? `${formData.permissions.length} permissions selected` : 'Select Permissions'}
                                                </span>
                                                <span className={`perm-dropdown-arrow ${permDropdownOpen ? 'open' : ''}`}>▼</span>
                                            </div>
                                            {permDropdownOpen && (
                                                <div className="perm-dropdown-list">
                                                    <div className="perm-dropdown-actions">
                                                        <button type="button" onClick={() => setFormData({...formData, permissions: [...permissionOptions]})}>Select All</button>
                                                        <button type="button" onClick={() => setFormData({...formData, permissions: []})}>Clear All</button>
                                                        <button type="button" onClick={() => setFormData({...formData, permissions: ROLE_DEFAULT_PERMISSIONS[formData.role] || []})}>Role Default</button>
                                                    </div>
                                                    {permissionOptions.map(perm => (
                                                        <label key={perm} className={`perm-dropdown-item ${formData.permissions.includes(perm) ? 'selected' : ''}`}>
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.permissions.includes(perm)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setFormData({...formData, permissions: [...formData.permissions, perm]});
                                                                    } else {
                                                                        setFormData({...formData, permissions: formData.permissions.filter(p => p !== perm)});
                                                                    }
                                                                }}
                                                            />
                                                            <span>{perm}</span>
                                                        </label>
                                                    ))}
                                                    {/* Add custom permission */}
                                                    {showCustomPermInput ? (
                                                        <div className="custom-perm-input-row">
                                                            <input
                                                                type="text"
                                                                className="form-input custom-perm-input"
                                                                placeholder="Enter permission name"
                                                                value={customPermInput}
                                                                onChange={(e) => setCustomPermInput(e.target.value)}
                                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomPermission(); } }}
                                                                autoFocus
                                                            />
                                                            <button type="button" className="btn-mini add-perm-btn" onClick={handleAddCustomPermission}>Add</button>
                                                            <button type="button" className="btn-mini" onClick={() => { setShowCustomPermInput(false); setCustomPermInput(''); }}>✕</button>
                                                        </div>
                                                    ) : (
                                                        <button type="button" className="add-perm-plus-btn" onClick={() => setShowCustomPermInput(true)}>
                                                            <Plus size={14} /> Add Custom Permission
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {formData.permissions.length > 0 && (
                                            <div className="selected-perms-tags">
                                                {formData.permissions.map((p, i) => (
                                                    <span key={i} className="selected-perm-tag">
                                                        {p}
                                                        <button type="button" onClick={() => setFormData({...formData, permissions: formData.permissions.filter(x => x !== p)})}>×</button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label>Shift *</label>
                                        <select name="shift" className="form-input" value={formData.shift} onChange={handleInputChange}>
                                            <option value="Morning">🌅 Morning (6AM - 2PM)</option>
                                            <option value="Evening">🌇 Evening (2PM - 10PM)</option>
                                            <option value="Night">🌙 Night (10PM - 6AM)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Salary ({cs} / Month)</label>
                                        <input type="number" name="salary" className="form-input" value={formData.salary} onChange={handleInputChange} placeholder="0" min="0" />
                                    </div>
                                    <div className="form-group">
                                        <label>Attendance Status</label>
                                        <select name="attendanceStatus" className="form-input" value={formData.attendanceStatus} onChange={handleInputChange}>
                                            <option value="Present">✅ Present</option>
                                            <option value="Absent">❌ Absent</option>
                                            <option value="On Leave">⏸️ On Leave</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Performance (0-5)</label>
                                        <input type="number" name="performance" min="0" max="5" step="0.5" className="form-input" value={formData.performance} onChange={handleInputChange} />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-submit">{editingStaff ? '💾 Update Staff' : '➕ Add Staff'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== ATTENDANCE MODAL (Shift-Aware) ===== */}
            {showAttendanceModal && (
                <div className="crm-modal-overlay" onClick={() => setShowAttendanceModal(false)}>
                    <div className="crm-modal wide-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📋 Mark Daily Attendance</h2>
                            <button className="close-btn" onClick={() => setShowAttendanceModal(false)}>&times;</button>
                        </div>
                        <div className="crm-modal-content">
                            <div className="attendance-info-bar">
                                <p>Today: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                <p className="current-shift-badge">Current Shift: <strong>{currentShift}</strong> ({SHIFT_TIMINGS[currentShift].label})</p>
                            </div>
                            <p className="modal-hint">⚠️ You can only mark attendance for staff in the <strong>{currentShift}</strong> shift. Other shifts are locked.</p>
                            <div className="crm-list-scroll">
                                {filteredStaff.map(staff => {
                                    const isCurrentShift = canMarkAttendance(staff);
                                    return (
                                        <div key={staff._id} className={`crm-list-item ${!isCurrentShift ? 'locked-row' : ''}`}>
                                            <div className="staff-info">
                                                <span className="staff-name">{staff.name}</span>
                                                <span className="staff-role">{staff.role} • {staff.shift || 'Morning'} Shift</span>
                                            </div>
                                            {isCurrentShift ? (
                                                <div className="crm-btn-group">
                                                    {['Present', 'Absent', 'On Leave'].map(status => (
                                                        <button key={status} className={`crm-toggle-btn ${staff.attendanceStatus === status ? 'active' : ''} ${status.toLowerCase().replace(' ', '-')}`}
                                                            onClick={() => handleQuickUpdate(staff._id, 'attendanceStatus', status)}>
                                                            {status}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="locked-label">
                                                    <span className={`status-badge status-${(staff.attendanceStatus || 'absent').toLowerCase().replace(' ', '-')}`}>
                                                        {staff.attendanceStatus || 'Absent'}
                                                    </span>
                                                    <span className="lock-text">🔒 {staff.shift || 'Morning'} shift only</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== SHIFT MANAGEMENT MODAL ===== */}
            {showShiftModal && (
                <div className="crm-modal-overlay" onClick={() => setShowShiftModal(false)}>
                    <div className="crm-modal wide-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>🕐 Manage Shifts</h2>
                            <button className="close-btn" onClick={() => setShowShiftModal(false)}>&times;</button>
                        </div>
                        <div className="crm-modal-content">
                            <div className="shift-summary">
                                {Object.entries(SHIFT_TIMINGS).map(([shift, info]) => (
                                    <div key={shift} className={`shift-card ${shift === currentShift ? 'current' : ''}`}>
                                        <h4>{shift}</h4>
                                        <p className="shift-time">{info.label}</p>
                                        <span className="shift-count">{staffData.filter(s => (s.shift || 'Morning') === shift).length} staff</span>
                                        {shift === currentShift && <span className="current-badge">ACTIVE NOW</span>}
                                    </div>
                                ))}
                            </div>
                            <div className="crm-list-scroll">
                                {filteredStaff.map(staff => (
                                    <div key={staff._id} className="crm-list-item">
                                        <div className="staff-info">
                                            <span className="staff-name">{staff.name}</span>
                                            <span className="staff-role">{staff.role}</span>
                                        </div>
                                        <select className="crm-select-input" value={staff.shift || 'Morning'} onChange={(e) => handleQuickUpdate(staff._id, 'shift', e.target.value)}>
                                            <option value="Morning">🌅 Morning (6AM - 2PM)</option>
                                            <option value="Evening">🌇 Evening (2PM - 10PM)</option>
                                            <option value="Night">🌙 Night (10PM - 6AM)</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== PAYROLL MODAL ===== */}
            {showPayrollModal && (
                <div className="crm-modal-overlay" onClick={() => setShowPayrollModal(false)}>
                    <div className="crm-modal wide-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>💰 Payroll Overview</h2>
                            <button className="close-btn" onClick={() => setShowPayrollModal(false)}>&times;</button>
                        </div>
                        <div className="crm-modal-content">
                            <div className="payroll-summary">
                                <div className="summary-box">
                                    <h3>Total Employees</h3>
                                    <span>{filteredStaff.length}</span>
                                </div>
                                <div className="summary-box">
                                    <h3>Total Monthly Payout</h3>
                                    <span>{cs}{filteredStaff.reduce((sum, s) => sum + (Number(s.salary) || 0), 0).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="summary-box">
                                    <h3>Average Salary</h3>
                                    <span>{cs}{filteredStaff.length > 0 ? Math.round(filteredStaff.reduce((sum, s) => sum + (Number(s.salary) || 0), 0) / filteredStaff.length).toLocaleString('en-IN') : 0}</span>
                                </div>
                            </div>
                            <div className="crm-table-wrapper mini-table">
                                <table>
                                    <thead>
                                        <tr><th>Name</th><th>Role</th><th>Shift</th><th>Status</th><th>Base Salary</th><th>Actions</th></tr>
                                    </thead>
                                    <tbody>
                                        {filteredStaff.map(staff => (
                                            <tr key={staff._id}>
                                                <td>{staff.name}</td>
                                                <td style={{textTransform: 'capitalize'}}>{staff.role}</td>
                                                <td>{staff.shift || 'Morning'}</td>
                                                <td><span className={`status-badge status-${(staff.attendanceStatus || 'absent').toLowerCase().replace(' ', '-')}`}>{staff.attendanceStatus}</span></td>
                                                <td>{cs}{Number(staff.salary || 0).toLocaleString('en-IN')}</td>
                                                <td><button className="action-btn small" onClick={() => { setSalaryEditStaff(staff); setSalaryEditValue(staff.salary || 0); setShowSalaryModal(true); }}>Edit Salary</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== PERFORMANCE MODAL ===== */}
            {showPerformanceModal && (
                <div className="crm-modal-overlay" onClick={() => setShowPerformanceModal(false)}>
                    <div className="crm-modal wide-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>⭐ Staff Performance Review</h2>
                            <button className="close-btn" onClick={() => setShowPerformanceModal(false)}>&times;</button>
                        </div>
                        <div className="crm-modal-content">
                            <div className="payroll-summary">
                                <div className="summary-box">
                                    <h3>Average Rating</h3>
                                    <span>{staffData.length > 0 ? (staffData.reduce((sum, s) => sum + (Number(s.performance) || 0), 0) / staffData.length).toFixed(1) : '0.0'} / 5</span>
                                </div>
                                <div className="summary-box">
                                    <h3>Top Performers (4+)</h3>
                                    <span>{staffData.filter(s => (s.performance || 0) >= 4).length}</span>
                                </div>
                                <div className="summary-box">
                                    <h3>Needs Improvement (&lt;2)</h3>
                                    <span>{staffData.filter(s => (s.performance || 0) < 2).length}</span>
                                </div>
                            </div>
                            <div className="crm-list-scroll">
                                {[...filteredStaff].sort((a, b) => (b.performance || 0) - (a.performance || 0)).map(staff => (
                                    <div key={staff._id} className="crm-list-item">
                                        <div className="staff-info">
                                            <span className="staff-name">{staff.name}</span>
                                            <span className="staff-role">{staff.role} • {staff.shift || 'Morning'}</span>
                                        </div>
                                        <div className="rating-control">
                                            <div className="star-rating-modal">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <span key={star} className={`star-interactive ${star <= (staff.performance || 0) ? 'filled' : ''}`}
                                                        onClick={() => handleQuickUpdate(staff._id, 'performance', star === staff.performance ? 0 : star)}>★</span>
                                                ))}
                                            </div>
                                            <input type="range" min="0" max="5" step="0.5" value={staff.performance || 0}
                                                onChange={(e) => handleQuickUpdate(staff._id, 'performance', Number(e.target.value))} className="perf-range" />
                                            <span className="rating-value">{(staff.performance || 0).toFixed(1)}/5</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== VIEW PERMISSIONS MODAL (Card Grid) ===== */}
            {showPermissionsViewModal && (
                <div className="crm-modal-overlay" onClick={() => setShowPermissionsViewModal(false)}>
                    <div className="crm-modal perm-view-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>🔐 Staff Permissions Overview</h2>
                            <button className="close-btn" onClick={() => setShowPermissionsViewModal(false)}>&times;</button>
                        </div>
                        <div className="crm-modal-content">
                            {/* Add custom permission row */}
                            <div className="perm-view-add-row">
                                <input
                                    type="text"
                                    className="form-input perm-view-add-input"
                                    placeholder="Add new permission..."
                                    value={customPermInput}
                                    onChange={(e) => setCustomPermInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomPermission(); } }}
                                />
                                <button className="perm-view-add-btn" onClick={handleAddCustomPermission}>
                                    <Plus size={16} /> Add
                                </button>
                            </div>
                            <div className="perm-cards-grid">
                                {permissionOptions.map(perm => {
                                    const assignedStaff = staffData.filter(s => (s.permissions || []).includes(perm));
                                    return (
                                        <div key={perm} className="perm-card">
                                            <div className="perm-card-header">
                                                <span className="perm-card-icon">🔒</span>
                                                <h4 className="perm-card-title">{perm}</h4>
                                            </div>
                                            <div className={`perm-card-count ${assignedStaff.length > 0 ? 'has-staff' : 'no-staff'}`}>
                                                {assignedStaff.length} Staff{assignedStaff.length !== 1 ? ' Members' : ''}
                                            </div>
                                            <div className="perm-card-staff-list">
                                                {assignedStaff.length > 0 ? (
                                                    assignedStaff.map(s => (
                                                        <div key={s._id} className="perm-staff-item">
                                                            <span className="perm-staff-name">{s.name}</span>
                                                            <span className="perm-staff-dot">●</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="perm-no-staff">No staff assigned</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== SALARY EDIT MODAL ===== */}
            {showSalaryModal && salaryEditStaff && (
                <div className="crm-modal-overlay" onClick={() => setShowSalaryModal(false)}>
                    <div className="crm-modal salary-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>💰 Edit Salary - {salaryEditStaff.name}</h2>
                            <button className="close-btn" onClick={() => setShowSalaryModal(false)}>&times;</button>
                        </div>
                        <div className="salary-edit-content">
                            <div className="salary-current">
                                <span>Current Salary:</span>
                                <strong>{cs}{Number(salaryEditStaff.salary || 0).toLocaleString('en-IN')}</strong>
                            </div>
                            <div className="form-group">
                                <label>New Salary ({cs} / Month)</label>
                                <input type="number" className="form-input salary-input-large" value={salaryEditValue} onChange={(e) => setSalaryEditValue(e.target.value)} min="0" autoFocus />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowSalaryModal(false)}>Cancel</button>
                                <button type="button" className="btn-submit" onClick={handleSalaryUpdate}>💾 Update Salary</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== DELETE CONFIRMATION ===== */}
            {showDeleteConfirm && (
                <div className="crm-modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
                    <div className="crm-modal delete-modal" onClick={e => e.stopPropagation()}>
                        <div className="delete-content">
                            <div className="delete-icon">🗑️</div>
                            <h3>Delete Staff Member?</h3>
                            <p>Are you sure you want to delete <strong>{showDeleteConfirm.name}</strong>? This cannot be undone.</p>
                            <div className="modal-actions">
                                <button className="btn-cancel" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
                                <button className="btn-delete-confirm" onClick={() => handleDeleteStaff(showDeleteConfirm._id)}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CRMModel;

