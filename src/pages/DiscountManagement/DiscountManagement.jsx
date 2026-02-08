import React, { useState, useEffect, useRef } from 'react';
import './DiscountManagement.css';

const DiscountManagement = () => {
    const [discounts, setDiscounts] = useState([]);
    const [selectedDiscount, setSelectedDiscount] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'PERCENTAGE',
        value: '',
        appliesTo: [],
        autoApply: false,
        status: 'ACTIVE',
        description: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);

    const applyToOptions = [
        { id: 'ROOM', label: 'Room Charges' },
        { id: 'FOOD', label: 'Food & Beverage' },
        { id: 'LAUNDRY', label: 'Laundry' },
        { id: 'SPA', label: 'Spa / Services' },
        { id: 'BILL', label: 'Entire Bill' }
    ];

    // Load discounts from localStorage on mount
    useEffect(() => {
        const storedDiscounts = localStorage.getItem('discounts');
        if (storedDiscounts) {
            setDiscounts(JSON.parse(storedDiscounts));
        } else {
            // Sample initial data
            const sampleDiscounts = [
                {
                    id: 1,
                    name: 'Early Bird Special',
                    type: 'PERCENTAGE',
                    value: 15,
                    appliesTo: ['ROOM'],
                    autoApply: false,
                    status: 'ACTIVE',
                    description: '15% discount for bookings made 30 days in advance'
                },
                {
                    id: 2,
                    name: 'Weekend Food Offer',
                    type: 'FLAT',
                    value: 500,
                    appliesTo: ['FOOD'],
                    autoApply: true,
                    status: 'ACTIVE',
                    description: 'Flat ₹500 off on food orders during weekend'
                },
                {
                    id: 3,
                    name: 'Spa Package Discount',
                    type: 'PERCENTAGE',
                    value: 20,
                    appliesTo: ['SPA'],
                    autoApply: false,
                    status: 'INACTIVE',
                    description: '20% off on spa services package'
                }
            ];
            setDiscounts(sampleDiscounts);
            localStorage.setItem('discounts', JSON.stringify(sampleDiscounts));
        }
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuId(null);
            }
        };

        if (openMenuId !== null) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openMenuId]);

    const saveToLocalStorage = (data) => {
        localStorage.setItem('discounts', JSON.stringify(data));
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.name.trim()) {
            errors.name = 'Discount name is required';
        }
        
        if (!formData.value || formData.value <= 0) {
            errors.value = 'Please enter a valid discount value';
        }
        
        if (formData.type === 'PERCENTAGE' && formData.value > 100) {
            errors.value = 'Percentage cannot exceed 100%';
        }
        
        if (formData.appliesTo.length === 0) {
            errors.appliesTo = 'Please select at least one category';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveDiscount = () => {
        if (!validateForm()) {
            return;
        }

        let updatedDiscounts;
        
        if (isEditMode && selectedDiscount) {
            // Update existing discount
            updatedDiscounts = discounts.map(discount =>
                discount.id === selectedDiscount.id
                    ? { ...formData, id: discount.id }
                    : discount
            );
        } else {
            // Add new discount
            const newDiscount = {
                ...formData,
                id: Date.now()
            };
            updatedDiscounts = [...discounts, newDiscount];
        }

        setDiscounts(updatedDiscounts);
        saveToLocalStorage(updatedDiscounts);
        handleResetForm();
    };

    const handleEditDiscount = (discount) => {
        setSelectedDiscount(discount);
        setIsEditMode(true);
        setFormData({
            name: discount.name,
            type: discount.type,
            value: discount.value,
            appliesTo: [...discount.appliesTo],
            autoApply: discount.autoApply,
            status: discount.status,
            description: discount.description
        });
        setFormErrors({});
    };

    const handleToggleStatus = (id) => {
        const updatedDiscounts = discounts.map(discount =>
            discount.id === id
                ? { ...discount, status: discount.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
                : discount
        );
        setDiscounts(updatedDiscounts);
        saveToLocalStorage(updatedDiscounts);
    };

    const handleRemoveDiscount = (id) => {
        const updatedDiscounts = discounts.filter(discount => discount.id !== id);
        setDiscounts(updatedDiscounts);
        saveToLocalStorage(updatedDiscounts);
        setOpenMenuId(null);
        
        // If the deleted discount was selected, reset form
        if (selectedDiscount && selectedDiscount.id === id) {
            handleResetForm();
        }
    };

    const toggleMenu = (id) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const handleResetForm = () => {
        setFormData({
            name: '',
            type: 'PERCENTAGE',
            value: '',
            appliesTo: [],
            autoApply: false,
            status: 'ACTIVE',
            description: ''
        });
        setSelectedDiscount(null);
        setIsEditMode(false);
        setFormErrors({});
    };

    const handleCheckboxChange = (optionId) => {
        setFormData(prev => ({
            ...prev,
            appliesTo: prev.appliesTo.includes(optionId)
                ? prev.appliesTo.filter(id => id !== optionId)
                : [...prev.appliesTo, optionId]
        }));
    };

    return (
        <div className="discount-management-page">
            <div className="discount-page-header">
                <h1>Discount Management</h1>
                <p>Manage discount rules and offers for your hotel</p>
            </div>

            <div className="discount-main-layout">
                {/* LEFT SECTION - Discount List */}
                <div className="discount-left-section">
                    <div className="discount-list-header">
                        <h2>Discount Rules</h2>
                        <span className="discount-count">{discounts.length} {discounts.length === 1 ? 'Discount' : 'Discounts'}</span>
                    </div>

                    <div className="discount-table-container">
                        <table className="discount-table">
                            <thead>
                                <tr>
                                    <th>Discount Name</th>
                                    <th>Type</th>
                                    <th>Value</th>
                                    <th>Applies To</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {discounts.length > 0 ? (
                                    discounts.map(discount => (
                                        <tr 
                                            key={discount.id}
                                            className={selectedDiscount?.id === discount.id ? 'selected-row' : ''}
                                        >
                                            <td>
                                                <div className="discount-name-cell">
                                                    <span className="discount-name">{discount.name}</span>
                                                    {discount.autoApply && (
                                                        <span className="auto-apply-badge">Auto</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`type-badge ${discount.type.toLowerCase()}`}>
                                                    {discount.type === 'PERCENTAGE' ? 'Percentage' : 'Flat Amount'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="discount-value">
                                                    {discount.type === 'PERCENTAGE' 
                                                        ? `${discount.value}%` 
                                                        : `₹${discount.value}`}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="applies-to-tags">
                                                    {discount.appliesTo.map((category, idx) => (
                                                        <span key={idx} className="category-tag">
                                                            {applyToOptions.find(opt => opt.id === category)?.label}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>
                                                <button
                                                    className={`status-toggle ${discount.status.toLowerCase()}`}
                                                    onClick={() => handleToggleStatus(discount.id)}
                                                >
                                                    <span className="status-indicator"></span>
                                                    {discount.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="actions-cell">
                                                <div className="action-menu-wrapper" ref={openMenuId === discount.id ? menuRef : null}>
                                                    <button
                                                        className="btn-menu"
                                                        onClick={() => toggleMenu(discount.id)}
                                                    >
                                                        ⋮
                                                    </button>
                                                    {openMenuId === discount.id && (
                                                        <div className="action-menu-dropdown">
                                                            <button
                                                                className="menu-item"
                                                                onClick={() => {
                                                                    handleEditDiscount(discount);
                                                                    setOpenMenuId(null);
                                                                }}
                                                            >
                                                                ✏️ Edit
                                                            </button>
                                                            <button
                                                                className="menu-item remove"
                                                                onClick={() => handleRemoveDiscount(discount.id)}
                                                            >
                                                                🗑️ Remove
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="no-data">
                                            <div className="no-data-content">
                                                <span className="no-data-icon">📋</span>
                                                <p>No discounts created yet</p>
                                                <p className="no-data-hint">Create your first discount using the form on the right</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RIGHT SECTION - Create/Edit Form */}
                <div className="discount-right-section">
                    <div className="discount-form-header">
                        <h2>{isEditMode ? '✏️ Edit Discount' : '➕ Create Discount'}</h2>
                    </div>

                    <div className="discount-form">
                        {/* Discount Name */}
                        <div className="form-group">
                            <label>Discount Name <span className="required">*</span></label>
                            <input
                                type="text"
                                placeholder="e.g., Early Bird Special"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={formErrors.name ? 'error' : ''}
                            />
                            {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                        </div>

                        {/* Discount Type */}
                        <div className="form-group">
                            <label>Discount Type <span className="required">*</span></label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value, value: '' })}
                            >
                                <option value="PERCENTAGE">Percentage (%)</option>
                                <option value="FLAT">Flat Amount (₹)</option>
                            </select>
                        </div>

                        {/* Discount Value */}
                        <div className="form-group">
                            <label>
                                Discount Value <span className="required">*</span>
                                {formData.type === 'PERCENTAGE' && <span className="label-hint">(0-100%)</span>}
                            </label>
                            <div className="input-with-prefix">
                                {formData.type === 'FLAT' && <span className="input-prefix">₹</span>}
                                <input
                                    type="number"
                                    placeholder={formData.type === 'PERCENTAGE' ? 'Enter percentage' : 'Enter amount'}
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                    min="0"
                                    max={formData.type === 'PERCENTAGE' ? '100' : undefined}
                                    className={formErrors.value ? 'error' : ''}
                                />
                                {formData.type === 'PERCENTAGE' && <span className="input-suffix">%</span>}
                            </div>
                            {formErrors.value && <span className="error-message">{formErrors.value}</span>}
                        </div>

                        {/* Applies To */}
                        <div className="form-group">
                            <label>Applies To <span className="required">*</span></label>
                            <div className="checkbox-group">
                                {applyToOptions.map(option => (
                                    <label key={option.id} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.appliesTo.includes(option.id)}
                                            onChange={() => handleCheckboxChange(option.id)}
                                        />
                                        <span>{option.label}</span>
                                    </label>
                                ))}
                            </div>
                            {formErrors.appliesTo && <span className="error-message">{formErrors.appliesTo}</span>}
                        </div>

                        {/* Auto Apply */}
                        <div className="form-group">
                            <label className="toggle-label">
                                <span>Auto Apply</span>
                                <div className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={formData.autoApply}
                                        onChange={(e) => setFormData({ ...formData, autoApply: e.target.checked })}
                                    />
                                    <span className="toggle-slider"></span>
                                </div>
                            </label>
                            <p className="form-hint">Automatically apply this discount when conditions are met</p>
                        </div>

                        {/* Status */}
                        <div className="form-group">
                            <label className="toggle-label">
                                <span>Status</span>
                                <div className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={formData.status === 'ACTIVE'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'ACTIVE' : 'INACTIVE' })}
                                    />
                                    <span className="toggle-slider"></span>
                                </div>
                            </label>
                            <p className="form-hint">
                                {formData.status === 'ACTIVE' ? 'Discount is active and can be applied' : 'Discount is inactive'}
                            </p>
                        </div>

                        {/* Description */}
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                placeholder="Add description or terms and conditions..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows="3"
                            />
                        </div>

                        {/* Form Actions */}
                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn-reset"
                                onClick={handleResetForm}
                            >
                                Reset
                            </button>
                            <button
                                type="button"
                                className="btn-save"
                                onClick={handleSaveDiscount}
                            >
                                {isEditMode ? 'Update Discount' : 'Save Discount'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiscountManagement;
