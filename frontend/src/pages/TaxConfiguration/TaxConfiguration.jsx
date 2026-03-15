import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../../context/SettingsContext';
import './TaxConfiguration.css';

const TaxConfiguration = () => {
    const { getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();
    const [taxes, setTaxes] = useState([]);
    const [selectedTax, setSelectedTax] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'PERCENTAGE',
        value: '',
        appliesTo: 'ROOM',
        isCompound: false,
        status: 'ACTIVE',
        description: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [openMenuId, setOpenMenuId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const menuRef = useRef(null);

    const [applyToOptions, setApplyToOptions] = useState([
        { value: 'ROOM', label: 'Room Charges' },
        { value: 'FOOD', label: 'Food & Beverage' },
        { value: 'LAUNDRY', label: 'Laundry' },
        { value: 'SPA', label: 'Spa / Services' },
        { value: 'BILL', label: 'Entire Bill' }
    ]);
    const [isAddingApplyTo, setIsAddingApplyTo] = useState(false);
    const [newApplyTo, setNewApplyTo] = useState('');

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

    const handleAddApplyTo = () => {
        if (!newApplyTo.trim()) return;
        const val = newApplyTo.trim().toUpperCase().replace(/\s+/g, '_');

        if (applyToOptions.some(opt => opt.value === val)) {
            setFormData({ ...formData, appliesTo: val });
            setIsAddingApplyTo(false);
            setNewApplyTo('');
            return;
        }

        const newOption = { value: val, label: newApplyTo.trim() };
        setApplyToOptions([...applyToOptions, newOption]);
        setFormData({ ...formData, appliesTo: val });
        setIsAddingApplyTo(false);
        setNewApplyTo('');
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
        setShowModal(false);
    };

    const handleEditTax = (tax) => {
        setShowModal(true);
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

    const handleCreateTax = () => {
        handleResetForm();
        setShowModal(true);
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
            appliesTo: 'ROOM',
            isCompound: false,
            status: 'ACTIVE',
            description: ''
        });
        setSelectedTax(null);
        setIsEditMode(false);
        setFormErrors({});
        setIsAddingApplyTo(false);
        setNewApplyTo('');
    };

    const getApplyToLabel = (value) => {
        const option = applyToOptions.find(opt => opt.value === value);
        return option ? option.label : value;
    };

    return (
        <div className="tax-configuration-page">
            <div className="dining-header">
                <div className="header-content">
                    <h1 className="page-title">Tax Configuration</h1>
                    <p className="subtitle">Configure and manage tax rules for your hotel services</p>
                </div>
                <button
                    className="add-table-btn"
                    onClick={handleCreateTax}
                >
                    + CREATE TAX
                </button>
            </div>

            <div className="tax-main-layout">
                {/* FULL WIDTH - Tax List */}
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
                                                        : <>{cs}{tax.value}</>}
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
                                                <p className="no-data-hint">Create your first tax using the button above</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                            {/* Centered Premium Modal */}
                {showModal && (
                    <div className="add-payment-overlay">
                        <div className="add-payment-modal add-tax-premium">
                            <div className="premium-payment-header">
                                <div className="header-icon-wrap">
                                    <span style={{ fontSize: '20px' }}>🧾</span>
                                </div>
                                <div className="header-text">
                                    <h3>{isEditMode ? 'Edit Tax Rule' : 'Create Tax Rule'}</h3>
                                    <span>TAX CONFIGURATION</span>
                                </div>
                                <button className="premium-close-btn" onClick={() => setShowModal(false)}>✕</button>
                            </div>

                            <div className="add-payment-body scrollable-modal-body">
                                <div className="tax-form">
                                    {/* Tax Name */}
                                    <div className="payment-field-group">
                                        <label className="field-label-premium">TAX NAME <span className="required">*</span></label>
                                        <div className="premium-input-wrap">
                                            <input
                                                type="text"
                                                placeholder="e.g., GST, Service Tax"
                                                value={formData.name}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (/^[A-Za-z\s]*$/.test(value)) {
                                                        setFormData({ ...formData, name: value });
                                                    }
                                                }}
                                                className={`premium-input ${formErrors.name ? 'error' : ''}`}
                                                autoFocus
                                            />
                                        </div>
                                        {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                                    </div>

                                    {/* Type and Value Row */}
                                    <div className="premium-form-row">
                                        <div className="payment-field-group flex-1">
                                            <label className="field-label-premium">TAX TYPE <span className="required">*</span></label>
                                            <select
                                                className="premium-input"
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value, value: '' })}
                                            >
                                                <option value="PERCENTAGE">Percentage (%)</option>
                                                <option value="FLAT">Flat Amount ({cs})</option>
                                            </select>
                                        </div>

                                        <div className="payment-field-group flex-1">
                                            <label className="field-label-premium">
                                                TAX VALUE <span className="required">*</span>
                                            </label>
                                            <div className="premium-input-wrap">
                                                <input
                                                    type="number"
                                                    placeholder={formData.type === 'PERCENTAGE' ? '0.00' : '0.00'}
                                                    value={formData.value}
                                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                                    min="0"
                                                    max={formData.type === 'PERCENTAGE' ? '100' : undefined}
                                                    step="0.01"
                                                    className={`premium-input ${formErrors.value ? 'error' : ''}`}
                                                />
                                                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold' }}>
                                                    {formData.type === 'PERCENTAGE' ? '%' : cs}
                                                </span>
                                            </div>
                                            {formErrors.value && <span className="error-message">{formErrors.value}</span>}
                                        </div>
                                    </div>

                                    {/* Applies To */}
                                    <div className="payment-field-group">
                                        <label className="field-label-premium">APPLIES TO <span className="required">*</span></label>
                                        {!isAddingApplyTo ? (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <select
                                                    className="premium-input"
                                                    value={formData.appliesTo}
                                                    onChange={(e) => setFormData({ ...formData, appliesTo: e.target.value })}
                                                    style={{ flex: 1 }}
                                                >
                                                    {applyToOptions.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    className="btn-primary"
                                                    type="button"
                                                    onClick={() => setIsAddingApplyTo(true)}
                                                    style={{ width: '45px', minWidth: '45px', padding: '0' }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input
                                                    type="text"
                                                    className="premium-input"
                                                    placeholder="Enter new category..."
                                                    value={newApplyTo}
                                                    onChange={(e) => setNewApplyTo(e.target.value)}
                                                    autoFocus
                                                    style={{ flex: 1 }}
                                                />
                                                <button
                                                    className="btn-primary"
                                                    type="button"
                                                    onClick={handleAddApplyTo}
                                                    style={{ width: '45px', minWidth: '45px', padding: '0' }}
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-secondary"
                                                    onClick={() => { setIsAddingApplyTo(false); setNewApplyTo(''); }}
                                                    style={{ width: '45px', minWidth: '45px', padding: '0' }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Toggles Row */}
                                    <div className="premium-form-row">
                                        <div className="payment-field-group flex-1">
                                            <label className="toggle-label-premium">
                                                <span>Compound Tax</span>
                                                <div className="toggle-switch-p">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.isCompound}
                                                        onChange={(e) => setFormData({ ...formData, isCompound: e.target.checked })}
                                                    />
                                                    <span className="toggle-slider-p"></span>
                                                </div>
                                            </label>
                                        </div>

                                        <div className="payment-field-group flex-1">
                                            <label className="toggle-label-premium">
                                                <span>Status</span>
                                                <div className="toggle-switch-p">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.status === 'ACTIVE'}
                                                        onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'ACTIVE' : 'INACTIVE' })}
                                                    />
                                                    <span className="toggle-slider-p"></span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="payment-field-group">
                                        <label className="field-label-premium">DESCRIPTION</label>
                                        <div className="premium-input-wrap">
                                            <textarea
                                                className="premium-input premium-textarea"
                                                placeholder="Add notes about this tax rule..."
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows="2"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="payment-modal-footer">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    CANCEL
                                </button>
                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={handleSaveTax}
                                >
                                    {isEditMode ? 'UPDATE TAX' : 'SAVE TAX'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}             </div>
            </div>
        </div>
    );
};

export default TaxConfiguration;
