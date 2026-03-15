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
    const [showModal, setShowModal] = useState(false);
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
        setShowModal(false);
    };

    const handleEditMapping = (mapping) => {
        setShowModal(true);
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
        setShowModal(true);
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
            <div className="dining-header">
                <div className="header-content">
                    <h1 className="page-title">Tax Mapping</h1>
                    <p className="subtitle">Map taxes to services for accurate billing and invoicing</p>
                </div>
                <button
                    className="add-table-btn"
                    onClick={handleCreateMapping}
                >
                    + CREATE TAX MAPPING
                </button>
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
                            {/* Centered Premium Modal */}
                {showModal && (
                    <div className="add-payment-overlay">
                        <div className="add-payment-modal add-mapping-premium">
                            <div className="premium-payment-header">
                                <div className="header-icon-wrap">
                                    <span style={{ fontSize: '20px' }}>🔗</span>
                                </div>
                                <div className="header-text">
                                    <h3>{isEditMode ? 'Edit Tax Mapping' : 'Create Tax Mapping'}</h3>
                                    <span>TAX SETTINGS</span>
                                </div>
                                <button className="premium-close-btn" onClick={() => setShowModal(false)}>✕</button>
                            </div>

                            <div className="add-payment-body scrollable-modal-body">
                                <div className="tax-mapping-form-section">
                                    {/* Service Type */}
                                    <div className="payment-field-group">
                                        <label className="field-label-premium">SERVICE TYPE <span className="required">*</span></label>
                                        {!isAddingService ? (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <select
                                                    className={`premium-input ${formErrors.serviceType ? 'error' : ''}`}
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
                                                    className="btn-primary"
                                                    onClick={() => setIsAddingService(true)}
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
                                                    placeholder="Enter new service type..."
                                                    value={newService}
                                                    onChange={(e) => setNewService(e.target.value)}
                                                    autoFocus
                                                    style={{ flex: 1 }}
                                                />
                                                <button
                                                    className="btn-primary"
                                                    onClick={handleAddService}
                                                    style={{ width: '45px', minWidth: '45px', padding: '0' }}
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    className="btn-secondary"
                                                    onClick={() => { setIsAddingService(false); setNewService(''); }}
                                                    style={{ width: '45px', minWidth: '45px', padding: '0' }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        )}
                                        {formErrors.serviceType && <span className="error-message">{formErrors.serviceType}</span>}
                                    </div>

                                    {/* Applicable Taxes */}
                                    <div className="payment-field-group">
                                        <label className="field-label-premium">APPLICABLE TAXES <span className="required">*</span></label>
                                        {taxes.length > 0 ? (
                                            <div className="checkbox-grid-group-premium">
                                                {taxes.map(tax => (
                                                    <label key={tax.id} className={`checkbox-item-premium ${formData.taxIds.includes(tax.id) ? 'checked' : ''}`}>
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.taxIds.includes(tax.id)}
                                                            onChange={() => handleTaxCheckboxChange(tax.id)}
                                                        />
                                                        <span className="checkbox-label">{tax.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="no-taxes-message">
                                                <p>No active taxes available. Please create taxes first.</p>
                                            </div>
                                        )}
                                        {formErrors.taxIds && <span className="error-message">{formErrors.taxIds}</span>}
                                    </div>

                                    {/* Toggles Row */}
                                    <div className="premium-form-row">
                                        <div className="payment-field-group flex-1">
                                            <label className="toggle-label-premium">
                                                <span>Default Mapping</span>
                                                <div className="toggle-switch-p">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.isDefault}
                                                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
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
                                                placeholder="Add notes about this tax mapping..."
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
                                    onClick={handleSaveMapping}
                                >
                                    {isEditMode ? 'UPDATE MAPPING' : 'SAVE MAPPING'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}                </div>
            </div>
        </div>
    );
};

export default TaxMapping;
