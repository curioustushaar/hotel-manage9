import React, { useState, useEffect } from 'react';
import './Settings.css';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('view-staff');
    const [searchTerm, setSearchTerm] = useState('');
    const [staffData, setStaffData] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [managingPermissions, setManagingPermissions] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        permissions: []
    });

    const [availablePermissions, setAvailablePermissions] = useState([
        'Dashboard',
        'Rooms',
        'Bookings',
        'Food Menu',
        'Customers',
        'Settings',
        'Cashier Report',
        'Food Payment Report'
    ]);
    const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
    const [isAddingPermission, setIsAddingPermission] = useState(false);
    const [newPermission, setNewPermission] = useState('');

    const handleAddPermission = () => {
        if (!newPermission.trim()) return;
        const permission = newPermission.trim();
        if (!availablePermissions.includes(permission)) {
            setAvailablePermissions([...availablePermissions, permission]);
            setFormData(prev => ({
                ...prev,
                permissions: [...prev.permissions, permission]
            }));
        } else {
            if (!formData.permissions.includes(permission)) {
                setFormData(prev => ({
                    ...prev,
                    permissions: [...prev.permissions, permission]
                }));
            }
        }
        setIsAddingPermission(false);
        setNewPermission('');
    };

    // Load staff from localStorage
    useEffect(() => {
        const storedStaff = localStorage.getItem('staffMembers');
        if (storedStaff) {
            setStaffData(JSON.parse(storedStaff));
        } else {
            // Sample data
            const sampleStaff = [
                {
                    id: 1,
                    fullName: 'Amal',
                    phone: '8092702248',
                    email: 'amal@bireena.com',
                    active: true,
                    permissions: ['Bookings', 'FoodMenu', 'Add Bookings', 'FoodPaymentReport']
                },
                {
                    id: 2,
                    fullName: 'Ayush Kumar',
                    phone: '9771041624',
                    email: 'ayush@bireena.com',
                    active: true,
                    permissions: []
                },
                {
                    id: 3,
                    fullName: 'ABC',
                    phone: '9304942225',
                    email: 'abc@bireena.com',
                    active: false,
                    permissions: []
                }
            ];
            setStaffData(sampleStaff);
            localStorage.setItem('staffMembers', JSON.stringify(sampleStaff));
        }
    }, []);

    const saveToLocalStorage = (data) => {
        localStorage.setItem('staffMembers', JSON.stringify(data));
    };

    const handleAddStaff = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert('Password and Confirm Password do not match!');
            return;
        }
        const newStaff = {
            id: Date.now(),
            fullName: formData.fullName,
            phone: formData.phone,
            email: formData.email,
            active: true,
            permissions: formData.permissions
        };
        const updatedStaff = [...staffData, newStaff];
        setStaffData(updatedStaff);
        saveToLocalStorage(updatedStaff);
        setShowAddModal(false);
        resetForm();
    };

    const handleEditStaff = (staff) => {
        setEditingStaff(staff);
        setFormData({
            fullName: staff.fullName,
            phone: staff.phone,
            email: staff.email,
            password: '',
            confirmPassword: '',
            permissions: staff.permissions
        });
        setShowEditModal(true);
    };

    const handleUpdateStaff = (e) => {
        e.preventDefault();
        if (formData.password && formData.password !== formData.confirmPassword) {
            alert('Password and Confirm Password do not match!');
            return;
        }
        const updatedStaff = staffData.map(staff =>
            staff.id === editingStaff.id
                ? {
                    ...staff,
                    fullName: formData.fullName,
                    phone: formData.phone,
                    email: formData.email,
                    permissions: formData.permissions
                }
                : staff
        );
        setStaffData(updatedStaff);
        saveToLocalStorage(updatedStaff);
        setShowEditModal(false);
        setEditingStaff(null);
        resetForm();
    };

    const handleDeleteStaff = (id) => {
        const updatedStaff = staffData.filter(staff => staff.id !== id);
        setStaffData(updatedStaff);
        saveToLocalStorage(updatedStaff);
    };

    const handleToggleActive = (id) => {
        const updatedStaff = staffData.map(staff =>
            staff.id === id ? { ...staff, active: !staff.active } : staff
        );
        setStaffData(updatedStaff);
        saveToLocalStorage(updatedStaff);
    };

    const handleManagePermissions = (staff) => {
        setManagingPermissions(staff);
    };

    const handleTogglePermissionForStaff = (permission) => {
        if (!managingPermissions) return;

        const currentPermissions = managingPermissions.permissions || [];
        const updatedPermissions = currentPermissions.includes(permission)
            ? currentPermissions.filter(p => p !== permission)
            : [...currentPermissions, permission];

        const updatedStaff = {
            ...managingPermissions,
            permissions: updatedPermissions
        };

        setManagingPermissions(updatedStaff);
    };

    const handleSavePermissions = () => {
        if (!managingPermissions) return;

        const updatedStaffData = staffData.map(staff =>
            staff.id === managingPermissions.id ? managingPermissions : staff
        );

        setStaffData(updatedStaffData);
        saveToLocalStorage(updatedStaffData);
        setManagingPermissions(null);
    };

    const handlePermissionToggle = (permission) => {
        if (formData.permissions.includes(permission)) {
            setFormData({
                ...formData,
                permissions: formData.permissions.filter(p => p !== permission)
            });
        } else {
            setFormData({
                ...formData,
                permissions: [...formData.permissions, permission]
            });
        }
    };

    const resetForm = () => {
        setFormData({
            fullName: '',
            phone: '',
            email: '',
            password: '',
            confirmPassword: '',
            permissions: []
        });
        setIsPermissionsOpen(false);
        setIsAddingPermission(false);
        setNewPermission('');
    };

    const filteredStaff = staffData.filter(staff =>
        staff.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.phone.includes(searchTerm)
    );

    return (
        <div className="settings-page">
            <div className="settings-header">
                <h1>👨‍💼 Add Staff</h1>
            </div>

            {/* Tabs */}
            <div className="settings-tabs">
                <button
                    className={`settings-tab ${activeTab === 'view-staff' ? 'active' : ''}`}
                    onClick={() => setActiveTab('view-staff')}
                >
                    View Staff
                </button>
                <button
                    className={`settings-tab ${activeTab === 'permissions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('permissions')}
                >
                    Permissions
                </button>
            </div>

            {/* View Staff Section */}
            {activeTab === 'view-staff' && !managingPermissions && (
                <>
                    <div className="settings-toolbar">
                        <div className="search-box">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Search by name or phone number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="settings-search-input"
                            />
                        </div>
                        <button
                            className="add-staff-btn"
                            onClick={() => { setShowAddModal(true); }}
                        >
                            <span className="btn-icon">+</span>
                            <span>Add New Staff</span>
                        </button>
                    </div>
                    <div className="settings-table-container">
                        <table className="settings-table">
                            <thead>
                                <tr>
                                    <th>FULL NAME</th>
                                    <th>PHONE</th>
                                    <th>ACTIVE</th>
                                    <th>PERMISSIONS</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStaff.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="no-data">
                                            No staff members found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStaff.map((staff) => (
                                        <tr key={staff.id}>
                                            <td>
                                                <div className="staff-info">
                                                    <span className="staff-name">{staff.fullName}</span>
                                                    <span className="staff-email">{staff.email}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="phone-number">{staff.phone}</span>
                                            </td>
                                            <td>
                                                <span className={`active-badge ${staff.active ? 'yes' : 'no'}`}>
                                                    <span className="badge-dot">{staff.active ? '●' : '●'}</span>
                                                    {staff.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="permissions-cell">
                                                {staff.permissions.length > 0 ? (
                                                    <div className="permissions-tags">
                                                        {staff.permissions.slice(0, 2).map((perm, idx) => (
                                                            <span key={idx} className="permission-tag">{perm}</span>
                                                        ))}
                                                        {staff.permissions.length > 2 && (
                                                            <span className="permission-tag-more">+{staff.permissions.length - 2}</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="no-permissions">No permissions</span>
                                                )}
                                            </td>
                                            <td className="actions-cell">
                                                <button
                                                    className="action-btn edit-btn"
                                                    onClick={() => handleEditStaff(staff)}
                                                    title="Edit Staff"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="action-btn permission-btn"
                                                    onClick={() => handleManagePermissions(staff)}
                                                    title="Edit Permissions"
                                                >
                                                    🔐
                                                </button>
                                                <button
                                                    className="action-btn delete-btn"
                                                    onClick={() => handleDeleteStaff(staff.id)}
                                                    title="Delete Staff"
                                                >
                                                    🗑️
                                                </button>
                                                <button
                                                    className="action-btn toggle-btn"
                                                    onClick={() => handleToggleActive(staff.id)}
                                                    title={staff.active ? 'Deactivate Staff' : 'Activate Staff'}
                                                >
                                                    {staff.active ? '✓' : '✗'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Manage Permissions View */}
            {managingPermissions && activeTab === 'view-staff' && (
                <div className="manage-permissions-container">
                    <div className="manage-permissions-header">
                        <div className="staff-details">
                            <h2>Manage Permissions</h2>
                            <p className="staff-meta">Staff: <strong>{managingPermissions.fullName}</strong> | Phone: <strong>{managingPermissions.phone}</strong></p>
                        </div>
                        <button
                            className="back-to-list-btn"
                            onClick={() => setManagingPermissions(null)}
                        >
                            ← Back to List
                        </button>
                    </div>

                    <div className="permissions-management-grid">
                        {availablePermissions.map((permission, index) => {
                            const isChecked = managingPermissions.permissions?.includes(permission) || false;
                            return (
                                <div key={index} className="permission-checkbox-card">
                                    <label className="permission-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => handleTogglePermissionForStaff(permission)}
                                            className="permission-checkbox-input"
                                        />
                                        <div className="permission-checkbox-content">
                                            <span className="permission-checkbox-icon">🔐</span>
                                            <span className="permission-checkbox-text">{permission}</span>
                                        </div>
                                    </label>
                                </div>
                            );
                        })}
                    </div>

                    <div className="permissions-actions">
                        <button
                            className="btn-cancel"
                            onClick={() => setManagingPermissions(null)}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn-submit"
                            onClick={handleSavePermissions}
                        >
                            Save Permissions
                        </button>
                    </div>
                </div>
            )}

            {/* Permissions View */}
            {activeTab === 'permissions' && (
                <div className="permissions-info-section">
                    <h2>Available Permissions</h2>
                    <div className="permissions-grid">
                        {availablePermissions.map((permission, index) => {
                            const staffWithPermission = staffData.filter(staff =>
                                staff.permissions.includes(permission)
                            );
                            return (
                                <div key={index} className="permission-card">
                                    <div className="permission-header">
                                        <span className="permission-icon">🔐</span>
                                        <span className="permission-name">{permission}</span>
                                    </div>
                                    <div className="permission-staff-count">
                                        <span className="staff-count-badge">
                                            {staffWithPermission.length} {staffWithPermission.length === 1 ? 'Staff' : 'Staff Members'}
                                        </span>
                                    </div>
                                    {staffWithPermission.length > 0 ? (
                                        <div className="permission-staff-list">
                                            {staffWithPermission.map(staff => (
                                                <div key={staff.id} className="staff-chip">
                                                    <span className="staff-chip-name">{staff.fullName}</span>
                                                    <span className={`staff-chip-status ${staff.active ? 'active' : 'inactive'}`}>
                                                        {staff.active ? '●' : '○'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="no-staff-assigned">
                                            <span>No staff assigned</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Add/Edit Staff Modal */}
            {(showAddModal || showEditModal) && (
                <div className="modal-overlay" onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{showEditModal ? '✏️ Edit Staff Member' : '➕ Add New Staff'}</h2>
                            <button
                                className="modal-close"
                                onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={showEditModal ? handleUpdateStaff : handleAddStaff}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Phone Number *</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Password {!showEditModal && '*'}</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required={!showEditModal}
                                        placeholder={showEditModal ? 'Leave blank to keep current' : ''}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Confirm Password {!showEditModal && '*'}</label>
                                    <input
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        required={!showEditModal}
                                        placeholder={showEditModal ? 'Leave blank to keep current' : ''}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Permissions</label>
                                    <div className="permissions-dropdown-container" style={{ position: 'relative' }}>
                                        <div
                                            className="permissions-dropdown-trigger"
                                            onClick={() => setIsPermissionsOpen(!isPermissionsOpen)}
                                            style={{
                                                padding: '10px',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                background: '#fff'
                                            }}
                                        >
                                            <span className="selected-count">
                                                {formData.permissions.length > 0
                                                    ? `${formData.permissions.length} Permissions Selected`
                                                    : 'Select Permissions'}
                                            </span>
                                            <span className={`dropdown-arrow`}>{isPermissionsOpen ? '▲' : '▼'}</span>
                                        </div>

                                        {isPermissionsOpen && (
                                            <div className="permissions-dropdown-content" style={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: 0,
                                                right: 0,
                                                background: '#fff',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                marginTop: '5px',
                                                zIndex: 1000,
                                                padding: '10px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}>
                                                <div className="permissions-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                    {availablePermissions.map(permission => (
                                                        <div
                                                            key={permission}
                                                            className={`permission-item ${formData.permissions.includes(permission) ? 'selected' : ''}`}
                                                            onClick={() => handlePermissionToggle(permission)}
                                                            style={{
                                                                background: formData.permissions.includes(permission) ? '#dcfce7' : 'transparent',
                                                                color: formData.permissions.includes(permission) ? '#166534' : 'inherit',
                                                                cursor: 'pointer',
                                                                padding: '8px',
                                                                margin: '4px 0',
                                                                borderRadius: '4px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                border: formData.permissions.includes(permission) ? '1px solid #bbf7d0' : '1px solid transparent'
                                                            }}
                                                        >
                                                            <span>{permission}</span>
                                                            {formData.permissions.includes(permission) && <span>✓</span>}
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Add New Permission Section */}
                                                {!isAddingPermission ? (
                                                    <button
                                                        type="button"
                                                        className="add-permission-btn"
                                                        onClick={(e) => { e.stopPropagation(); setIsAddingPermission(true); }}
                                                        style={{ width: '100%', padding: '8px', marginTop: '8px', border: '1px dashed #ccc', background: 'transparent', cursor: 'pointer', borderRadius: '4px' }}
                                                    >
                                                        + Add New Permission
                                                    </button>
                                                ) : (
                                                    <div className="add-permission-input" style={{ display: 'flex', gap: '5px', marginTop: '8px' }}>
                                                        <input
                                                            type="text"
                                                            value={newPermission}
                                                            onChange={(e) => setNewPermission(e.target.value)}
                                                            placeholder="New Permission..."
                                                            autoFocus
                                                            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); handleAddPermission(); }}
                                                            style={{ background: '#22c55e', color: 'white', border: 'none', padding: '0 12px', borderRadius: '4px', cursor: 'pointer' }}
                                                        >
                                                            ✓
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); setIsAddingPermission(false); setNewPermission(''); }}
                                                            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0 12px', borderRadius: '4px', cursor: 'pointer' }}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit">
                                    {showEditModal ? 'Update Staff' : 'Add Staff'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
