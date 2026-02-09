import React, { useState, useEffect, useRef } from 'react';
import './TaxConfiguration.css';

const TaxConfiguration = () => {
    const [taxes, setTaxes] = useState([]);
    const [selectedTax, setSelectedTax] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'PERCENTAGE',
        value: '',
        appliesTo: 'BILL',
        isCompound: false,
        status: 'ACTIVE',
        description: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);

    const applyToOptions = [
        { value: 'ROOM', label: 'Room Charges' },
        { value: 'FOOD', label: 'Food & Beverage' },
        { value: 'LAUNDRY', label: 'Laundry' },
        { value: 'SPA', label: 'Spa / Services' },
        { value: 'BILL', label: 'Entire Bill' }
    ];

    // Load taxes from localStorage on mount
    useEffect(() => {
        const storedTaxes = localStorage.getItem('taxes');
        if (storedTaxes) {
            setTaxes(JSON.parse(storedTaxes));
        } else {
            // Sample initial data
            const sampleTaxes = [
                {
                    id: 1,
                    name: 'GST',
                    type: 'PERCENTAGE',
                    value: 18,
                    appliesTo: 'BILL',
                    isCompound: false,
                    status: 'ACTIVE',
                    description: 'Goods and Services Tax - 18%'
                },
                {
                    id: 2,
                    name: 'Service Charge',
                    type: 'PERCENTAGE',
                    value: 10,
                    appliesTo: 'FOOD',
                    isCompound: false,
                    status: 'ACTIVE',
                    description: 'Service charge on food and beverage'
                },
                {
                    id: 3,
                    name: 'Luxury Tax',
                    type: 'PERCENTAGE',
                    value: 5,
                    appliesTo: 'ROOM',
                    isCompound: true,
                    status: 'INACTIVE',
                    description: 'Luxury tax on premium room bookings'
                }
            ];
            setTaxes(sampleTaxes);
            localStorage.setItem('taxes', JSON.stringify(sampleTaxes));
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
        localStorage.setItem('taxes', JSON.stringify(data));
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.name.trim()) {
            errors.name = 'Tax name is required';
        }

        if (!formData.value || formData.value <= 0) {
            errors.value = 'Please enter a valid tax value';
        }

        if (formData.type === 'PERCENTAGE' && formData.value > 100) {
            errors.value = 'Percentage cannot exceed 100%';
        }


        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveTax = () => {
        if (!validateForm()) {
            return;
        }

        let updatedTaxes;

        if (isEditMode && selectedTax) {
            // Update existing tax
            updatedTaxes = taxes.map(tax =>
                tax.id === selectedTax.id
                    ? { ...formData, id: tax.id, value: parseFloat(formData.value) }
                    : tax
            );
        } else {
            // Add new tax
            const newTax = {
                ...formData,
                id: Date.now(),
                value: parseFloat(formData.value)
            };
            updatedTaxes = [...taxes, newTax];
        }

        setTaxes(updatedTaxes);
        saveToLocalStorage(updatedTaxes);
        handleResetForm();
    };

    const handleEditTax = (tax) => {
        setSelectedTax(tax);
        setIsEditMode(true);
        setFormData({
            name: tax.name,
            type: tax.type,
            value: tax.value,
            appliesTo: tax.appliesTo,
            isCompound: tax.isCompound,
            status: tax.status,
            description: tax.description
        });
        setFormErrors({});
    };

    const handleToggleStatus = (id) => {
        const updatedTaxes = taxes.map(tax =>
            tax.id === id
                ? { ...tax, status: tax.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
                : tax
        );
        setTaxes(updatedTaxes);
        saveToLocalStorage(updatedTaxes);
    };

    const handleRemoveTax = (id) => {
        const updatedTaxes = taxes.filter(tax => tax.id !== id);
        setTaxes(updatedTaxes);
        saveToLocalStorage(updatedTaxes);
        setOpenMenuId(null);

        // If the deleted tax was selected, reset form
        if (selectedTax && selectedTax.id === id) {
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
            appliesTo: 'BILL',
            isCompound: false,
            status: 'ACTIVE',
            description: ''
        });
        setSelectedTax(null);
        setIsEditMode(false);
        setFormErrors({});
    };

    const getApplyToLabel = (value) => {
        const option = applyToOptions.find(opt => opt.value === value);
        return option ? option.label : value;
    };

    return (
        <div className="tax-configuration-page">
            <div className="tax-page-header">
                <h1>Tax Configuration</h1>
                <p>Configure and manage tax rules for your hotel services</p>
            </div>

            <div className="tax-main-layout">
                {/* LEFT SECTION - Tax List */}
                <div className="tax-left-section">
                    <div className="tax-list-header">
                        <h2>Tax Rules</h2>
                        <span className="tax-count">{taxes.length} {taxes.length === 1 ? 'Tax' : 'Taxes'}</span>
                    </div>

                    <div className="tax-table-container">
                        <table className="tax-table">
                            <thead>
                                <tr>
                                    <th>Tax Name</th>
                                    <th>Type</th>
                                    <th>Value</th>
                                    <th>Applies To</th>
                                    <th>Compound</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {taxes.length > 0 ? (
                                    taxes.map(tax => (
                                        <tr
                                            key={tax.id}
                                            className={selectedTax?.id === tax.id ? 'selected-row' : ''}
                                        >
                                            <td>
                                                <div className="tax-name-cell">
                                                    <span className="tax-name">{tax.name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`type-badge ${tax.type.toLowerCase()}`}>
                                                    {tax.type === 'PERCENTAGE' ? 'Percentage' : 'Flat Amount'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="tax-value">
                                                    {tax.type === 'PERCENTAGE'
                                                        ? `${tax.value}%`
                                                        : `₹${tax.value}`}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="applies-to-badge">
                                                    {getApplyToLabel(tax.appliesTo)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`compound-badge ${tax.isCompound ? 'yes' : 'no'}`}>
                                                    {tax.isCompound ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className={`status-toggle ${tax.status.toLowerCase()}`}
                                                    onClick={() => handleToggleStatus(tax.id)}
                                                >
                                                    <span className="status-indicator"></span>
                                                    {tax.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="actions-cell">
                                                <div className="action-menu-wrapper" ref={openMenuId === tax.id ? menuRef : null}>
                                                    <button
                                                        className="btn-menu"
                                                        onClick={() => toggleMenu(tax.id)}
                                                    >
                                                        ⋮
                                                    </button>
                                                    {openMenuId === tax.id && (
                                                        <div className="action-menu-dropdown">
                                                            <button
                                                                className="menu-item"
                                                                onClick={() => {
                                                                    handleEditTax(tax);
                                                                    setOpenMenuId(null);
                                                                }}
                                                            >
                                                                ✏️ Edit
                                                            </button>
                                                            <button
                                                                className="menu-item remove"
                                                                onClick={() => handleRemoveTax(tax.id)}
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
                                        <td colSpan="7" className="no-data">
                                            <div className="no-data-content">
                                                <span className="no-data-icon">🧾</span>
                                                <p>No taxes configured yet</p>
                                                <p className="no-data-hint">Create your first tax using the form on the right</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RIGHT SECTION - Create/Edit Form */}
                <div className="tax-right-section">
                    <div className="tax-form-header">
                        <h2>{isEditMode ? '✏️ Edit Tax' : '➕ Create Tax'}</h2>
                    </div>

                    <div className="tax-form">
                        {/* Tax Name */}
                        <div className="form-group">
                            <label>Tax Name <span className="required">*</span></label>
                            <input
                                type="text"
                                placeholder="e.g., GST, Service Tax"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={formErrors.name ? 'error' : ''}
                            />
                            {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                        </div>

                        {/* Tax Type */}
                        <div className="form-group">
                            <label>Tax Type <span className="required">*</span></label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value, value: '' })}
                            >
                                <option value="PERCENTAGE">Percentage (%)</option>
                                <option value="FLAT">Flat Amount (₹)</option>
                            </select>
                        </div>

                        {/* Tax Value */}
                        <div className="form-group">
                            <label>
                                Tax Value <span className="required">*</span>
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
                                    step="0.01"
                                    className={formErrors.value ? 'error' : ''}
                                />
                                {formData.type === 'PERCENTAGE' && <span className="input-suffix">%</span>}
                            </div>
                            {formErrors.value && <span className="error-message">{formErrors.value}</span>}
                        </div>

                        {/* Applies To */}
                        <div className="form-group">
                            <label>Applies To <span className="required">*</span></label>
                            <select
                                value={formData.appliesTo}
                                onChange={(e) => setFormData({ ...formData, appliesTo: e.target.value })}
                            >
                                {applyToOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Compound Tax */}
                        <div className="form-group">
                            <label className="toggle-label">
                                <span>Compound Tax</span>
                                <div className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={formData.isCompound}
                                        onChange={(e) => setFormData({ ...formData, isCompound: e.target.checked })}
                                    />
                                    <span className="toggle-slider"></span>
                                </div>
                            </label>
                            <p className="form-hint">Apply tax on top of other taxes (compound tax calculation)</p>
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
                                {formData.status === 'ACTIVE' ? 'Tax is active and will be applied' : 'Tax is inactive'}
                            </p>
                        </div>

                        {/* Description */}
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                placeholder="Add description or notes about this tax..."
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
                                onClick={handleSaveTax}
                            >
                                {isEditMode ? 'Update Tax' : 'Save Tax'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaxConfiguration;
