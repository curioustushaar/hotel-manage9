import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../../context/SettingsContext';
import './TaxMapping.css';

const TaxMapping = () => {
    const { getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();
    const [taxMappings, setTaxMappings] = useState([]);
    const [taxes, setTaxes] = useState([]);
    const [selectedMapping, setSelectedMapping] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({
        serviceType: 'ROOM',
        taxIds: [],
        isDefault: false,
        status: 'ACTIVE',
        description: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [openMenuId, setOpenMenuId] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const menuRef = useRef(null);

    const [serviceOptions, setServiceOptions] = useState([
        { value: 'ROOM', label: 'Room Charges' },
        { value: 'FOOD', label: 'Food & Beverage' },
        { value: 'LAUNDRY', label: 'Laundry' },
        { value: 'SPA', label: 'Spa / Services' },
        { value: 'BILL', label: 'Entire Bill' }
    ]);

    const [isAddingService, setIsAddingService] = useState(false);
    const [newService, setNewService] = useState('');

    // Load tax mappings from localStorage on mount
    useEffect(() => {
        const storedMappings = localStorage.getItem('taxMappings');
        if (storedMappings) {
            setTaxMappings(JSON.parse(storedMappings));
        } else {
            // Sample initial data
            const sampleMappings = [
                {
                    id: 1,
                    serviceType: 'ROOM',
                    taxIds: [1, 2],
                    isDefault: true,
                    status: 'ACTIVE',
                    description: 'Default tax mapping for room charges'
                },
                {
                    id: 2,
                    serviceType: 'FOOD',
                    taxIds: [1],
                    isDefault: true,
                    status: 'ACTIVE',
                    description: 'GST applicable on food & beverage'
                },
                {
                    id: 3,
                    serviceType: 'LAUNDRY',
                    taxIds: [1],
                    isDefault: false,
                    status: 'INACTIVE',
                    description: 'Tax applicable on laundry services'
                }
            ];
            setTaxMappings(sampleMappings);
            localStorage.setItem('taxMappings', JSON.stringify(sampleMappings));
        }
    }, []);

    // Load taxes from Tax Configuration
    useEffect(() => {
        const storedTaxes = localStorage.getItem('taxes');
        if (storedTaxes) {
            const allTaxes = JSON.parse(storedTaxes);
            // Filter only ACTIVE taxes
            const activeTaxes = allTaxes.filter(tax => tax.status === 'ACTIVE');
            setTaxes(activeTaxes);
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
        localStorage.setItem('taxMappings', JSON.stringify(data));
    };

    const handleAddService = () => {
        if (!newService.trim()) return;
        const val = newService.trim().toUpperCase().replace(/\s+/g, '_');

        // Check if exists
        if (serviceOptions.some(opt => opt.value === val)) {
            setFormData({ ...formData, serviceType: val });
            setIsAddingService(false);
            setNewService('');
            return;
        }

        const newOption = { value: val, label: newService.trim() };
        setServiceOptions([...serviceOptions, newOption]);
        setFormData({ ...formData, serviceType: val });
        setIsAddingService(false);
        setNewService('');
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.serviceType) {
            errors.serviceType = 'Service type is required';
        }

        // Check for duplicate service type (unless editing)
        if (!isEditMode || (isEditMode && selectedMapping.serviceType !== formData.serviceType)) {
            const duplicate = taxMappings.find(mapping =>
                mapping.serviceType === formData.serviceType
            );
            if (duplicate) {
                errors.serviceType = 'Mapping for this service type already exists';
            }
        }

        if (formData.taxIds.length === 0) {
            errors.taxIds = 'Please select at least one tax';
        }

        // Check if trying to set as default when another default exists
        if (formData.isDefault) {
            const existingDefault = taxMappings.find(mapping =>
                mapping.serviceType === formData.serviceType &&
                mapping.isDefault &&
                (!isEditMode || mapping.id !== selectedMapping?.id)
            );
            if (existingDefault) {
                errors.isDefault = 'A default mapping already exists for this service type';
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveMapping = () => {
        if (!validateForm()) {
            return;
        }

        let updatedMappings;

        if (isEditMode && selectedMapping) {
            // Update existing mapping
            updatedMappings = taxMappings.map(mapping =>
                mapping.id === selectedMapping.id
                    ? { ...formData, id: mapping.id }
                    : mapping
            );
        } else {
            // Add new mapping
            const newMapping = {
                ...formData,
                id: Date.now()
            };
            updatedMappings = [...taxMappings, newMapping];
        }

        setTaxMappings(updatedMappings);
        saveToLocalStorage(updatedMappings);
        handleResetForm();
        setIsSidebarOpen(false);
    };

    const handleEditMapping = (mapping) => {
        setIsSidebarOpen(true);
        setSelectedMapping(mapping);
        setIsEditMode(true);
        setFormData({
            serviceType: mapping.serviceType,
            taxIds: [...mapping.taxIds],
            isDefault: mapping.isDefault,
            status: mapping.status,
            description: mapping.description
        });
        setFormErrors({});
    };

    const handleCreateMapping = () => {
        handleResetForm();
        setIsSidebarOpen(true);
    };

    const handleToggleStatus = (id) => {
        const updatedMappings = taxMappings.map(mapping =>
            mapping.id === id
                ? { ...mapping, status: mapping.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
                : mapping
        );
        setTaxMappings(updatedMappings);
        saveToLocalStorage(updatedMappings);
    };

    const handleRemoveMapping = (id) => {
        const updatedMappings = taxMappings.filter(mapping => mapping.id !== id);
        setTaxMappings(updatedMappings);
        saveToLocalStorage(updatedMappings);
        setOpenMenuId(null);

        // If the deleted mapping was selected, reset form
        if (selectedMapping && selectedMapping.id === id) {
            handleResetForm();
        }
    };

    const toggleMenu = (id) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const handleResetForm = () => {
        setFormData({
            serviceType: 'ROOM',
            taxIds: [],
            isDefault: false,
            status: 'ACTIVE',
            description: ''
        });
        setSelectedMapping(null);
        setIsEditMode(false);
        setFormErrors({});
        setIsAddingService(false);
        setNewService('');
    };

    const handleTaxCheckboxChange = (taxId) => {
        setFormData(prev => ({
            ...prev,
            taxIds: prev.taxIds.includes(taxId)
                ? prev.taxIds.filter(id => id !== taxId)
                : [...prev.taxIds, taxId]
        }));
    };

    const getServiceTypeLabel = (value) => {
        return serviceOptions.find(opt => opt.value === value)?.label || value;
    };

    const getTaxName = (taxId) => {
        const tax = taxes.find(t => t.id === taxId);
        return tax ? tax.name : `Tax #${taxId}`;
    };

    const getAppliedTaxesString = (taxIds) => {
        if (taxIds.length === 0) return 'No taxes';
        return taxIds.map(id => getTaxName(id)).join(', ');
    };

    return (
        <div className="tax-mapping-page">
            <div className="tax-mapping-page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>Tax Mapping</h1>
                        <p>Map taxes to services for accurate billing and invoicing</p>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={handleCreateMapping}
                        style={{ maxWidth: '200px' }}
                    >
                        + Create Tax Mapping
                    </button>
                </div>
            </div>

            <div className="tax-mapping-content">
                {/* Full Width - Tax Mapping List */}
                <div className="tax-mapping-list-section">
                    <div className="section-header">
                        <h2>Tax Mappings</h2>
                        <span className="count-badge">{taxMappings.length} mappings</span>
                    </div>

                    <div className="table-container">
                        <table className="tax-mapping-table">
                            <thead>
                                <tr>
                                    <th>Service Type</th>
                                    <th>Applied Taxes</th>
                                    <th>Default Mapping</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {taxMappings.length > 0 ? (
                                    taxMappings.map(mapping => (
                                        <tr
                                            key={mapping.id}
                                            className={selectedMapping?.id === mapping.id ? 'selected-row' : ''}
                                        >
                                            <td>
                                                <div className="service-type-cell">
                                                    <span className="service-type-name">
                                                        {getServiceTypeLabel(mapping.serviceType)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="applied-taxes-cell">
                                                    <span className="taxes-list">
                                                        {getAppliedTaxesString(mapping.taxIds)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`default-badge ${mapping.isDefault ? 'yes' : 'no'}`}>
                                                    {mapping.isDefault ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className={`status-toggle ${mapping.status.toLowerCase()}`}
                                                    onClick={() => handleToggleStatus(mapping.id)}
                                                >
                                                    <span className="status-indicator"></span>
                                                    {mapping.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="actions-cell">
                                                <div className="action-menu-wrapper" ref={openMenuId === mapping.id ? menuRef : null}>
                                                    <button
                                                        className="btn-menu"
                                                        onClick={() => toggleMenu(mapping.id)}
                                                    >
                                                        ⋮
                                                    </button>
                                                    {openMenuId === mapping.id && (
                                                        <div className="action-menu-dropdown">
                                                            <button
                                                                className="menu-item"
                                                                onClick={() => {
                                                                    handleEditMapping(mapping);
                                                                    setOpenMenuId(null);
                                                                }}
                                                            >
                                                                ✏️ Edit
                                                            </button>
                                                            <button
                                                                className="menu-item remove"
                                                                onClick={() => handleRemoveMapping(mapping.id)}
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
                                        <td colSpan="5" className="no-data">
                                            <div className="no-data-content">
                                                <span className="no-data-icon">📋</span>
                                                <p className="no-data-text">No tax mappings found</p>
                                                <p className="no-data-subtext">Create your first tax mapping using the button above</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* SIDEBAR OVERLAY */}
                {isSidebarOpen && (
                    <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} style={{ opacity: 1 }}></div>
                )}

                {/* SIDEBAR FORM */}
                <div className={`mapping-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                    <div className="sidebar-header">
                        <h2>
                            <span style={{ color: '#ef4444', marginRight: '8px', fontSize: '24px' }}>+</span>
                            {isEditMode ? 'Edit Tax Mapping' : 'Create Tax Mapping'}
                        </h2>
                        <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>×</button>
                    </div>

                    <div className="sidebar-content">
                        <div className="tax-mapping-form-section">
                            <p className="form-subtitle">Manage how taxes apply to each service</p>

                            <div className="form-container">
                                {/* Service Type */}
                                <div className="form-group">
                                    <label className="form-label">
                                        Service Type <span className="required">*</span>
                                    </label>

                                    {!isAddingService ? (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <select
                                                className={`form-select ${formErrors.serviceType ? 'error' : ''}`}
                                                value={formData.serviceType}
                                                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                                                style={{ flex: 1 }}
                                            >
                                                {serviceOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                className="btn-secondary"
                                                onClick={() => setIsAddingService(true)}
                                                title="Add New Service Type"
                                                style={{ width: '42px', padding: '0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                +
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Enter new service type..."
                                                value={newService}
                                                onChange={(e) => setNewService(e.target.value)}
                                                autoFocus
                                                style={{ flex: 1 }}
                                            />
                                            <button
                                                className="btn-primary"
                                                onClick={handleAddService}
                                                style={{ width: '42px', padding: '0' }}
                                            >
                                                ✓
                                            </button>
                                            <button
                                                className="btn-secondary"
                                                onClick={() => { setIsAddingService(false); setNewService(''); }}
                                                style={{ width: '42px', padding: '0' }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}

                                    {formErrors.serviceType && (
                                        <span className="error-message">{formErrors.serviceType}</span>
                                    )}
                                </div>

                                {/* Applicable Taxes */}
                                <div className="form-group">
                                    <label className="form-label">
                                        Applicable Taxes <span className="required">*</span>
                                    </label>
                                    {taxes.length > 0 ? (
                                        <div className="tax-checkbox-card-group">
                                            {taxes.map(tax => (
                                                <label key={tax.id} className={`tax-checkbox-card ${formData.taxIds.includes(tax.id) ? 'checked' : ''}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.taxIds.includes(tax.id)}
                                                        onChange={() => handleTaxCheckboxChange(tax.id)}
                                                    />
                                                    <div className="tax-checkbox-card-content">
                                                        <span className="tax-checkbox-card-icon">📋</span>
                                                        <div className="tax-checkbox-card-text">
                                                            <span className="tax-checkbox-card-label">{tax.name}</span>
                                                            <span className="tax-checkbox-card-desc">
                                                                {tax.type === 'PERCENTAGE' ? `${tax.value}% government tax` : `${cs}${tax.value} additional service fee`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="no-taxes-message">
                                            <p>No active taxes available. Please create taxes in Tax Configuration first.</p>
                                        </div>
                                    )}
                                    {formErrors.taxIds && (
                                        <span className="error-message">{formErrors.taxIds}</span>
                                    )}
                                </div>

                                {/* Default Mapping Toggle */}
                                <div className="form-group">
                                    <label className="form-label">Default Mapping</label>
                                    <div className="toggle-wrapper">
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={formData.isDefault}
                                                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                        <span className="toggle-label">
                                            {formData.isDefault ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    {formErrors.isDefault && (
                                        <span className="error-message">{formErrors.isDefault}</span>
                                    )}
                                    <p className="field-hint">Only one default mapping allowed per service type</p>
                                </div>

                                {/* Status Toggle */}
                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <div className="toggle-wrapper">
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={formData.status === 'ACTIVE'}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    status: e.target.checked ? 'ACTIVE' : 'INACTIVE'
                                                })}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                        <span className="toggle-label">
                                            {formData.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="form-group">
                                    <label className="form-label">Description (Optional)</label>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="Add notes about this tax mapping..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                    />
                                </div>

                                {/* Form Actions */}
                                <div className="form-actions">
                                    <button
                                        className="btn-primary"
                                        onClick={handleSaveMapping}
                                    >
                                        {isEditMode ? 'Update Mapping' : 'Save Mapping'}
                                    </button>
                                    <button
                                        className="btn-secondary"
                                        onClick={handleResetForm}
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaxMapping;
