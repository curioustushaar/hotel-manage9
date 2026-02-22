import React, { useState, useEffect } from 'react';
import './CompanySettings.css';
import API_URL from '../../config/api';

const CompanySettings = () => {
    const [activeTab, setActiveTab] = useState('General');
    const [hotelData, setHotelData] = useState({
        hotelName: 'Bireena Atithi',
        gstNumber: '22AAAAA0000A125',
        logoUrl: null,
        address: '123, MG Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pin: '400050',
        currency: 'INR (₹)',
        taxType: 'GST',
        cgst: '2.5',
        sgst: '2.5',
        serviceCharge: '10',
        invoicePrefix: 'INV-2026-',
        thankYouMessage: 'Thank you for visiting our hotel!',
        enableRoomPosting: true,
        posEnabled: true,
        displayLogoOnBill: true,
        printKOTHeader: true,
        autoIncrementInvoice: true,
        timezone: '(GMT+05:30) Kolkata',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12 Hour',
        // Billing Setup fields
        billingInvoicePrefix: 'ATITHI',
        startingInvoiceNumber: '1001',
        panNumber: 'ABCPA1234A',
        autoGenerateInvoice: true,
        billPrintFormat: 'Hotel Invoice',
        roomGst: '12',
        foodGst: '5',
        roomServiceCharge: '5',
        inclusiveTax: true,
        paymentModes: {
            cash: true,
            upi: true,
            card: true,
            bankTransfer: true,
            wallet: true,
            creditAllowed: true
        },
        billingRules: {
            autoPost: true,
            mandatorySettlement: true,
            partialPayment: true,
            splitBill: true,
            mergeTable: true,
            addToRoom: true
        },
        discountRules: {
            maxDiscount: '25',
            managerApproval: true,
            couponEnabled: true
        }
    });

    // Rooms Management State
    const [rooms, setRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Users Management State
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState('');

    const fetchRooms = async () => {
        try {
            setLoadingRooms(true);
            const response = await fetch(`${API_URL}/api/rooms/list`);
            const data = await response.json();
            if (data.success) {
                setRooms(data.data);
            }
        } catch (err) {
            console.error('Error fetching rooms:', err);
        } finally {
            setLoadingRooms(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoadingUsers(true);
            const response = await fetch(`${API_URL}/api/staff`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleDeleteRoom = async (id) => {
        if (window.confirm('Are you sure you want to delete this room?')) {
            try {
                const response = await fetch(`${API_URL}/api/rooms/delete/${id}`, {
                    method: 'DELETE'
                });
                const data = await response.json();
                if (data.success) {
                    fetchRooms();
                } else {
                    alert('Failed to delete room');
                }
            } catch (error) {
                alert('Error deleting room');
            }
        }
    };

    const handleToggleUserStatus = async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/staff/toggle/${id}`, {
                method: 'PUT'
            });
            const data = await response.json();
            if (data._id) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Error toggling user status:', error);
        }
    };

    useEffect(() => {
        if (activeTab === 'Rooms') {
            fetchRooms();
        } else if (activeTab === 'Users') {
            fetchUsers();
        }
    }, [activeTab]);

    // Stats calculations
    const activeUsersCount = users.filter(u => u.isActive).length;
    const disabledUsersCount = users.filter(u => !u.isActive).length;
    const rolesCount = [...new Set(users.map(u => u.role))].length;

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setHotelData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setHotelData(prev => ({ ...prev, logoUrl: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        alert('Changes saved successfully!');
    };

    return (
        <div className="company-settings-container">
            <div className="company-settings-header">
                <div className="header-title">
                    <span className="lock-icon">🔒</span>
                    <h1>Company Settings</h1>
                    <span className="breadcrumb">Dashboard / Company</span>
                </div>
            </div>

            <div className="settings-tabs">
                {[
                    { name: 'General', icon: '⚙️' },
                    { name: 'Rooms', icon: '🏨' },
                    { name: 'Users', icon: '👥' },
                    { name: 'Billing Setup', icon: '🛠️' }
                ].map(tab => (
                    <button
                        key={tab.name}
                        className={`tab-btn ${activeTab === tab.name ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.name)}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        {tab.name}
                    </button>
                ))}
            </div>

            <div className={`settings-content ${activeTab === 'General' ? 'settings-grid' : ''}`}>
                {activeTab === 'Rooms' && (
                    <div className="room-management-section">
                        <div className="section-header-row">
                            <h2>Room Management</h2>
                        </div>

                        <div className="management-toolbar">
                            <div className="sub-tabs">
                                <button className="sub-tab-btn"><span className="btn-icon">🏨</span> Room Categories</button>
                                <button className="sub-tab-btn">Room Types</button>
                                <button className="sub-tab-btn active">Rooms List</button>
                            </div>
                        </div>

                        <div className="search-bar-container">
                            <div className="search-input-wrapper">
                                <span className="search-icon">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search Room Number / Name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="rooms-table-card">
                            <table className="rooms-management-table">
                                <thead>
                                    <tr>
                                        <th>Room Number</th>
                                        <th>Category / Type</th>
                                        <th>Tariff <span className="sort-icon">↕</span></th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingRooms ? (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Loading rooms...</td></tr>
                                    ) : rooms.length === 0 ? (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>No rooms found.</td></tr>
                                    ) : (
                                        rooms.filter(r =>
                                            r.roomNumber.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            r.roomType.toLowerCase().includes(searchQuery.toLowerCase())
                                        ).map((room, idx) => (
                                            <tr key={room._id || idx}>
                                                <td className="room-no-cell">
                                                    <span className="bold-no">{room.roomNumber}</span>
                                                </td>
                                                <td className="cat-cell">
                                                    {room.roomType === 'Deluxe Room' ? '🏨' : '🛏️'} {room.roomType}
                                                </td>
                                                <td className="tariff-cell">
                                                    ₹ {room.price} <span className="per-night">/ Night</span>
                                                </td>
                                                <td className="status-cell">
                                                    <span className={`status-pill available`}>
                                                        <span className="check">✓</span> AVAILABLE
                                                    </span>
                                                </td>
                                                <td className="actions-cell">
                                                    <button className="edit-action" onClick={() => alert('Edit functionality to be implemented or navigated to Room Setup')}>Edit</button>
                                                    <button className="delete-action" onClick={() => handleDeleteRoom(room._id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'Users' && (
                    <div className="users-management-section">
                        <div className="section-header-row">
                            <h2>Users</h2>
                        </div>

                        <div className="stats-row">
                            <div className="stat-card stat-card-total">
                                <div className="stat-info">
                                    <span className="stat-label">TOTAL USERS</span>
                                    <span className="stat-value">{users.length}</span>
                                </div>
                                <div className="stat-icon-bg">👥</div>
                            </div>
                            <div className="stat-card stat-card-active">
                                <div className="stat-info">
                                    <span className="stat-label">ACTIVE USERS</span>
                                    <span className="stat-value">{activeUsersCount}</span>
                                </div>
                                <div className="stat-icon-bg">👤</div>
                            </div>
                            <div className="stat-card stat-card-disabled">
                                <div className="stat-info">
                                    <span className="stat-label">DISABLED USERS</span>
                                    <span className="stat-value">{disabledUsersCount}</span>
                                </div>
                                <div className="stat-icon-bg">🔒</div>
                            </div>
                            <div className="stat-card stat-card-roles">
                                <div className="stat-info">
                                    <span className="stat-label">ROLES</span>
                                    <span className="stat-value">{rolesCount || 0}</span>
                                </div>
                                <div className="stat-icon-bg">🏰</div>
                            </div>
                        </div>

                        <div className="management-toolbar">
                            <div className="search-input-wrapper wide">
                                <span className="search-icon">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search Name / Username / Phone / Email..."
                                    value={userSearchQuery}
                                    onChange={(e) => setUserSearchQuery(e.target.value)}
                                />
                            </div>
                            <button className="add-room-btn" onClick={() => alert('Add Staff functionality is in the Add Staff page')}>+ Add User</button>
                        </div>

                        <div className="rooms-table-card">
                            <table className="rooms-management-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Role</th>
                                        <th>Mobile</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingUsers ? (
                                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Loading users...</td></tr>
                                    ) : users.length === 0 ? (
                                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No users found.</td></tr>
                                    ) : (
                                        users.filter(u =>
                                            u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                                            u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                                            (u.phone && u.phone.includes(userSearchQuery))
                                        ).map((user, idx) => (
                                            <tr key={user._id || idx}>
                                                <td>
                                                    <div className="user-name-info">
                                                        <span className="user-full-name">{user.name}</span>
                                                    </div>
                                                </td>
                                                <td className="role-cell">
                                                    <span className="role-icon-sm">{user.role === 'admin' ? '👤' : (user.role === 'staff' ? '👨‍🍳' : '🖥️')}</span>
                                                    {user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Staff'}
                                                </td>
                                                <td>{user.phone || 'N/A'}</td>
                                                <td className="email-cell">{user.username}</td>
                                                <td>
                                                    <span className={`status-pill ${user.isActive ? 'available' : 'disabled-pill'}`}>
                                                        <span className="check">✓</span> {user.isActive ? 'ACTIVE' : 'DISABLED'}
                                                    </span>
                                                </td>
                                                <td className="actions-cell">
                                                    <button className="edit-action" onClick={() => alert('Edit functionality to be handled in Add Staff section')}>Edit</button>
                                                    <button className="delete-action" onClick={() => handleToggleUserStatus(user._id)}>
                                                        {user.isActive ? 'Disable' : 'Enable'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'Billing Setup' && (
                    <div className="billing-setup-section">
                        <div className="section-header-row">
                            <h2>Billing Setup</h2>
                        </div>

                        <div className="billing-setup-grid">
                            {/* Row 1 */}
                            <div className="settings-card">
                                <h3 className="card-header-icon"><span className="red-icon">📄</span> Invoice Settings</h3>
                                <div className="billing-field-row">
                                    <label>Invoice Prefix</label>
                                    <input
                                        type="text"
                                        name="billingInvoicePrefix"
                                        value={hotelData.billingInvoicePrefix}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="billing-field-row">
                                    <label>Starting Invoice Number</label>
                                    <input
                                        type="text"
                                        name="startingInvoiceNumber"
                                        value={hotelData.startingInvoiceNumber}
                                        onChange={handleInputChange}
                                        className="short-input"
                                    />
                                </div>
                                <div className="billing-field-row">
                                    <label>GST Number</label>
                                    <input
                                        type="text"
                                        name="gstNumber"
                                        value={hotelData.gstNumber}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="billing-field-row">
                                    <label>PAN Number</label>
                                    <input
                                        type="text"
                                        name="panNumber"
                                        value={hotelData.panNumber}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="billing-field-row special">
                                    <label>Auto Generate Invoice</label>
                                    <div
                                        className={`toggle-switch ${hotelData.autoGenerateInvoice ? 'active' : ''}`}
                                        onClick={() => setHotelData(prev => ({ ...prev, autoGenerateInvoice: !prev.autoGenerateInvoice }))}
                                    >
                                        {hotelData.autoGenerateInvoice ? 'Yes' : 'No'} <div className="switch-knob"></div>
                                    </div>
                                </div>
                                <div className="billing-field-row">
                                    <label>Bill Print Format</label>
                                    <select
                                        name="billPrintFormat"
                                        value={hotelData.billPrintFormat}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Hotel Invoice">Hotel Invoice</option>
                                        <option value="Standard Receipt">Standard Receipt</option>
                                    </select>
                                </div>
                            </div>

                            <div className="settings-card">
                                <h3 className="card-header-icon"><span className="red-icon">💰</span> Tax Configuration</h3>
                                <div className="billing-field-row">
                                    <label>Room GST %</label>
                                    <div className="input-with-symbol-right">
                                        <input
                                            type="text"
                                            name="roomGst"
                                            value={hotelData.roomGst}
                                            onChange={handleInputChange}
                                        />
                                        <span className="symbol-box">%</span>
                                    </div>
                                </div>
                                <div className="billing-field-row">
                                    <label>Food GST %</label>
                                    <div className="input-with-symbol-right">
                                        <input
                                            type="text"
                                            name="foodGst"
                                            value={hotelData.foodGst}
                                            onChange={handleInputChange}
                                        />
                                        <span className="symbol-box">%</span>
                                    </div>
                                </div>
                                <div className="billing-field-row">
                                    <label>Service Charge %</label>
                                    <div className="input-with-symbol-right">
                                        <input
                                            type="text"
                                            name="roomServiceCharge"
                                            value={hotelData.roomServiceCharge}
                                            onChange={handleInputChange}
                                        />
                                        <span className="symbol-box">%</span>
                                    </div>
                                </div>
                                <div className="billing-field-row special">
                                    <label>Inclusive Tax</label>
                                    <div
                                        className={`toggle-switch ${hotelData.inclusiveTax ? 'active' : ''}`}
                                        onClick={() => setHotelData(prev => ({ ...prev, inclusiveTax: !prev.inclusiveTax }))}
                                    >
                                        {hotelData.inclusiveTax ? 'Yes' : 'No'} <div className="switch-knob"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="settings-card">
                                <h3 className="card-header-icon"><span className="red-icon">💳</span> Payment Modes</h3>
                                {[
                                    { label: 'Cash', icon: '💵', key: 'cash' },
                                    { label: 'UPI', icon: '📱', key: 'upi' },
                                    { label: 'Card', icon: '💳', key: 'card' },
                                    { label: 'Bank Transfer', icon: '🏦', key: 'bankTransfer' },
                                    { label: 'Wallet', icon: '📁', key: 'wallet' },
                                    { label: 'Credit Allowed', icon: '🏪', key: 'creditAllowed' }
                                ].map((mode, i) => (
                                    <div key={i} className="billing-field-row special">
                                        <div className="label-with-icon">
                                            <span className="mode-icon">{mode.icon}</span>
                                            <label>{mode.label}</label>
                                        </div>
                                        <div
                                            className={`toggle-switch ${hotelData.paymentModes[mode.key] ? 'active' : ''}`}
                                            onClick={() => setHotelData(prev => ({
                                                ...prev,
                                                paymentModes: { ...prev.paymentModes, [mode.key]: !prev.paymentModes[mode.key] }
                                            }))}
                                        >
                                            {hotelData.paymentModes[mode.key] ? 'Yes' : 'No'} <div className="switch-knob"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Row 2 */}
                            <div className="settings-card">
                                <h3 className="card-header-icon"><span className="red-icon">🛏️</span> Room Billing Rules</h3>
                                {[
                                    { label: 'Auto Post to Room Folio', key: 'autoPost' },
                                    { label: 'Checkout Mandatory Settlement', key: 'mandatorySettlement' },
                                    { label: 'Partial Payment Allowed', key: 'partialPayment' }
                                ].map((rule, i) => (
                                    <div key={i} className="billing-field-row special">
                                        <div className="label-with-check">
                                            <input
                                                type="checkbox"
                                                checked={hotelData.billingRules[rule.key]}
                                                onChange={() => setHotelData(prev => ({
                                                    ...prev,
                                                    billingRules: { ...prev.billingRules, [rule.key]: !prev.billingRules[rule.key] }
                                                }))}
                                            />
                                            <label>{rule.label}</label>
                                        </div>
                                        <div className={`status-badge-${hotelData.billingRules[rule.key] ? 'green' : 'red'}`}>
                                            {hotelData.billingRules[rule.key] ? 'Yes' : 'No'}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="settings-card">
                                <h3 className="card-header-icon"><span className="red-icon">🍴</span> Restaurant Billing Rules</h3>
                                {[
                                    { label: 'Split Bill Enabled', key: 'splitBill' },
                                    { label: 'Merge Table Billing', key: 'mergeTable' },
                                    { label: 'Add to Room Enabled', key: 'addToRoom' }
                                ].map((rule, i) => (
                                    <div key={i} className="billing-field-row special">
                                        <div className="label-with-check">
                                            <input
                                                type="checkbox"
                                                checked={hotelData.billingRules[rule.key]}
                                                onChange={() => setHotelData(prev => ({
                                                    ...prev,
                                                    billingRules: { ...prev.billingRules, [rule.key]: !prev.billingRules[rule.key] }
                                                }))}
                                            />
                                            <label>{rule.label}</label>
                                        </div>
                                        <div className={`status-badge-${hotelData.billingRules[rule.key] ? 'green' : 'red'}`}>
                                            {hotelData.billingRules[rule.key] ? 'Yes' : 'No'}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="settings-card">
                                <h3 className="card-header-icon"><span className="red-icon">🏷️</span> Discount & Approval</h3>
                                <div className="billing-field-row">
                                    <label>Max Discount %</label>
                                    <div className="input-with-symbol-right">
                                        <input
                                            type="text"
                                            name="maxDiscount"
                                            value={hotelData.discountRules.maxDiscount}
                                            onChange={(e) => setHotelData(prev => ({
                                                ...prev,
                                                discountRules: { ...prev.discountRules, maxDiscount: e.target.value }
                                            }))}
                                        />
                                        <span className="symbol-box">%</span>
                                    </div>
                                </div>
                                <div className="billing-field-row special">
                                    <label>Manager Approval Required</label>
                                    <div
                                        className={`toggle-switch ${hotelData.discountRules.managerApproval ? 'active' : ''}`}
                                        onClick={() => setHotelData(prev => ({
                                            ...prev,
                                            discountRules: { ...prev.discountRules, managerApproval: !prev.discountRules.managerApproval }
                                        }))}
                                    >
                                        {hotelData.discountRules.managerApproval ? 'Yes' : 'No'} <div className="switch-knob"></div>
                                    </div>
                                </div>
                                <div className="billing-field-row special">
                                    <label>Coupon Enabled</label>
                                    <div
                                        className={`toggle-switch ${hotelData.discountRules.couponEnabled ? 'active' : ''}`}
                                        onClick={() => setHotelData(prev => ({
                                            ...prev,
                                            discountRules: { ...prev.discountRules, couponEnabled: !prev.discountRules.couponEnabled }
                                        }))}
                                    >
                                        {hotelData.discountRules.couponEnabled ? 'Yes' : 'No'} <div className="switch-knob"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="settings-card no-bg-actions">
                                <div className="billing-actions-footer">
                                    <button className="save-billing-btn" onClick={handleSave}>Save Billing Settings <span className="arrow-btn">›</span></button>
                                    <button className="reset-billing-btn" onClick={() => alert('Settings reset to default')}>Reset Default</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'General' && (
                    <>
                        <div className="main-form-column">
                            <div className="settings-card">
                                <h3>Hotel Information</h3>
                                <div className="form-grid">
                                    <div className="form-group full-width">
                                        <label>Hotel Name</label>
                                        <input
                                            type="text"
                                            name="hotelName"
                                            value={hotelData.hotelName}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>GST Number</label>
                                        <input
                                            type="text"
                                            name="gstNumber"
                                            value={hotelData.gstNumber}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Logo</label>
                                        <div className="logo-upload-section">
                                            <div className="logo-preview-box">
                                                {hotelData.logoUrl ? (
                                                    <img src={hotelData.logoUrl} alt="Hotel Logo" className="logo-preview-img" />
                                                ) : (
                                                    <div className="hotel-logo-brand">
                                                        <div className="logo-icon-red">🏰</div>
                                                        <div className="logo-text-red">BIREENA ATITHI</div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="logo-actions">
                                                <input
                                                    type="file"
                                                    id="logo-upload"
                                                    onChange={handleLogoChange}
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                />
                                                <button className="browse-btn" onClick={() => document.getElementById('logo-upload').click()}>
                                                    Browse File
                                                </button>
                                                <span className="upload-hint">Upload your hotel's logo (recommended 200x60px)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="settings-card">
                                <h3>Address & Contact</h3>
                                <div className="form-grid address-grid">
                                    <div className="form-group full-width">
                                        <label>Address Line 1</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={hotelData.address}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>City</label>
                                        <select name="city" value={hotelData.city} onChange={handleInputChange}>
                                            <option value="Mumbai">Mumbai</option>
                                            <option value="Delhi">Delhi</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>State</label>
                                        <select name="state" value={hotelData.state} onChange={handleInputChange}>
                                            <option value="Maharashtra">Maharashtra</option>
                                            <option value="Karnataka">Karnataka</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>PIN</label>
                                        <input
                                            type="text"
                                            name="pin"
                                            value={hotelData.pin}
                                            onChange={handleInputChange}
                                            placeholder="6-digit PIN"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="billing-rows">
                                <div className="settings-card compact-card">
                                    <h3>Regional & Display</h3>
                                    <div className="compact-row">
                                        <label>Default Currency</label>
                                        <select name="currency" value={hotelData.currency} onChange={handleInputChange}>
                                            <option value="INR (₹)">INR (₹)</option>
                                            <option value="USD ($)">USD ($)</option>
                                            <option value="EUR (€)">EUR (€)</option>
                                        </select>
                                    </div>
                                    <div className="compact-row">
                                        <label>Tax Type</label>
                                        <select name="taxType" value={hotelData.taxType} onChange={handleInputChange}>
                                            <option value="GST">GST</option>
                                            <option value="VAT">VAT</option>
                                        </select>
                                    </div>
                                    <div className="compact-row">
                                        <label>Time Format</label>
                                        <select name="timeFormat" value={hotelData.timeFormat} onChange={handleInputChange}>
                                            <option value="12 Hour">12 Hour</option>
                                            <option value="24 Hour">24 Hour</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="settings-card detailed-billing">
                                    <h3>Tax Details</h3>
                                    <div className="tax-inputs">
                                        <div className="tax-field">
                                            <label>CGST (%)</label>
                                            <div className="input-with-symbol">
                                                <span className="percent">%</span>
                                                <input
                                                    type="text"
                                                    name="cgst"
                                                    value={hotelData.cgst}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="tax-field">
                                            <label>SGST (%)</label>
                                            <div className="input-with-symbol">
                                                <span className="percent">%</span>
                                                <input
                                                    type="text"
                                                    name="sgst"
                                                    value={hotelData.sgst}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ marginTop: '15px' }}>
                                        <label style={{ display: 'flex', justifyContent: 'space-between' }}>Service Charge % <span>{hotelData.serviceCharge}%</span></label>
                                        <div className="input-with-symbol">
                                            <span className="percent">%</span>
                                            <input
                                                type="text"
                                                name="serviceCharge"
                                                value={hotelData.serviceCharge}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bottom-cards-row">
                                <div className="settings-card">
                                    <div className="prefix-header">
                                        <h3>Invoice Prefix</h3>
                                        <input
                                            type="text"
                                            name="invoicePrefix"
                                            value={hotelData.invoicePrefix}
                                            onChange={handleInputChange}
                                            className="invoice-prefix-input"
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginTop: '15px' }}>
                                        <label>Thank You Message</label>
                                        <textarea
                                            name="thankYouMessage"
                                            value={hotelData.thankYouMessage}
                                            onChange={handleInputChange}
                                            placeholder="Enter message to show on bills..."
                                        />
                                    </div>
                                    <div className="toggle-group-inline">
                                        <div className="toggle-item">
                                            <label className="checkbox-container">
                                                <input
                                                    type="checkbox"
                                                    name="enableRoomPosting"
                                                    checked={hotelData.enableRoomPosting}
                                                    onChange={handleInputChange}
                                                />
                                                <span className="checkmark"></span>
                                                Enable Room Posting
                                            </label>
                                            <span className={`toggle-status ${hotelData.enableRoomPosting ? 'yes' : 'no'}`}>
                                                {hotelData.enableRoomPosting ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                        <div className="toggle-item">
                                            <label className="checkbox-container">
                                                <input
                                                    type="checkbox"
                                                    name="posEnabled"
                                                    checked={hotelData.posEnabled}
                                                    onChange={handleInputChange}
                                                />
                                                <span className="checkmark"></span>
                                                POS Enabled
                                            </label>
                                            <span className={`toggle-status ${hotelData.posEnabled ? 'yes' : 'no'}`}>
                                                {hotelData.posEnabled ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sidebar-config-column">
                            <div className="logo-preview-card">
                                <div className="hotel-logo-brand large">
                                    {hotelData.logoUrl ? (
                                        <img src={hotelData.logoUrl} alt="Hotel Logo" className="logo-preview-img-large" />
                                    ) : (
                                        <>
                                            <div className="logo-icon-red">🏰</div>
                                            <div className="logo-text-red">BIREENA ATITHI</div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="config-toggles">
                                <div className="config-row">
                                    <label className="checkbox-container">
                                        <input
                                            type="checkbox"
                                            name="enableRoomPosting"
                                            checked={hotelData.enableRoomPosting}
                                            onChange={handleInputChange}
                                        />
                                        <span className="checkmark"></span>
                                        Enable Room Posting
                                    </label>
                                    <span className={`toggle-pill ${hotelData.enableRoomPosting ? 'yes' : 'no'}`}>
                                        {hotelData.enableRoomPosting ? 'Yes' : 'No'}
                                    </span>
                                </div>
                                <div className="config-row">
                                    <label className="checkbox-container">
                                        <input
                                            type="checkbox"
                                            name="posEnabled"
                                            checked={hotelData.posEnabled}
                                            onChange={handleInputChange}
                                        />
                                        <span className="checkmark"></span>
                                        POS Enabled
                                    </label>
                                    <span className={`toggle-pill ${hotelData.posEnabled ? 'yes' : 'no'}`}>
                                        {hotelData.posEnabled ? 'Yes' : 'No'}
                                    </span>
                                </div>
                            </div>

                            <div className="regional-settings">
                                <h3>Regional Settings</h3>
                                <div className="form-group">
                                    <div className="timezone-wrapper">
                                        <span className="globe-icon">🌐</span>
                                        <select name="timezone" value={hotelData.timezone} onChange={handleInputChange}>
                                            <option value="(GMT+05:30) Kolkata">(GMT+05:30) Kolkata</option>
                                            <option value="(GMT+00:00) London">(GMT+00:00) London</option>
                                            <option value="(GMT-05:00) New York">(GMT-05:00) New York</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="settings-line">
                                    <label>Date Format</label>
                                    <select name="dateFormat" value={hotelData.dateFormat} onChange={handleInputChange}>
                                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    </select>
                                </div>
                                <div className="settings-line">
                                    <label>Time Format</label>
                                    <select name="timeFormat" value={hotelData.timeFormat} onChange={handleInputChange}>
                                        <option value="12 Hour">12 Hour</option>
                                        <option value="24 Hour">24 Hour</option>
                                    </select>
                                </div>
                            </div>

                            <div className="config-options">
                                <h3>Configuration Options</h3>
                                {[
                                    { label: 'Display Hotel Logo on Bill', key: 'displayLogoOnBill' },
                                    { label: 'Print KOT Header on KOT', key: 'printKOTHeader' },
                                    { label: 'Auto Increment Invoice Number', key: 'autoIncrementInvoice' }
                                ].map(opt => (
                                    <div key={opt.key} className="config-option-row">
                                        <label className="checkbox-container">
                                            <input
                                                type="checkbox"
                                                checked={hotelData[opt.key]}
                                                onChange={() => setHotelData({ ...hotelData, [opt.key]: !hotelData[opt.key] })}
                                            />
                                            <span className="checkmark"></span>
                                            {opt.label}
                                        </label>
                                    </div>
                                ))}
                            </div>

                            <button className="save-changes-btn" onClick={handleSave}>
                                Save Changes
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CompanySettings;
