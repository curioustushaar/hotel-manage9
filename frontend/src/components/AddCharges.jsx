import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import './AddCharges.css';
import Toast from './Toast';

// Maps a charge type value to its discount category used in discount rules
const CHARGE_CATEGORY_MAP = {
    laundry: 'LAUNDRY',
    dry_cleaning: 'LAUNDRY',
    spa_wellness: 'SPA',
    gym_access: 'SPA',
    pool_access: 'SPA',
    bar: 'FOOD',
};

const DEFAULT_CHARGE_OPTIONS = [
    { value: 'laundry', label: 'Laundry' },
    { value: 'dry_cleaning', label: 'Dry Cleaning' },
    { value: 'spa_wellness', label: 'Spa and Wellness' },
    { value: 'gym_access', label: 'Gym Access' },
    { value: 'pool_access', label: 'Pool Access' },
    { value: 'bar', label: 'Bar' },
    { value: 'special_requests', label: 'Special Requests' },
    { value: 'damage_security', label: 'Damage or Security Deposit' },
    { value: 'lost_key', label: 'Lost Key or Card Replacement' },
    { value: 'smoking_fees', label: 'Smoking Fees' },
    { value: 'extra_towels', label: 'Extra Towels or Toiletries' },
    { value: 'security_parking', label: 'Security Parking' },
    { value: 'valet_parking', label: 'Valet Parking' },
];

const AddCharges = ({ onClose, onAdd, reservation }) => {
    const { getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        folio: reservation ? `${reservation.roomNumber} - ${reservation.guestName}` : 'B5 - Shahrukh Ahmed',
        chargeType: '',
        currency: 'INR',
        amount: '',
        quantity: '1',
        description: '',
        comment: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // Discount states
    const [discountType, setDiscountType] = useState('PERCENTAGE');
    const [discountValue, setDiscountValue] = useState('');
    const [discountSource, setDiscountSource] = useState('');

    // Custom charge type states
    const [chargeOptions, setChargeOptions] = useState(() => {
        try {
            const custom = JSON.parse(localStorage.getItem('customChargeTypes') || '[]');
            return [...DEFAULT_CHARGE_OPTIONS, ...custom];
        } catch { return [...DEFAULT_CHARGE_OPTIONS]; }
    });
    const [showAddCustom, setShowAddCustom] = useState(false);
    const [newCustomLabel, setNewCustomLabel] = useState('');

    // Auto-fill discount when chargeType changes
    useEffect(() => {
        const category = CHARGE_CATEGORY_MAP[formData.chargeType];
        if (!category) {
            setDiscountValue('');
            setDiscountSource('');
            setDiscountType('PERCENTAGE');
            return;
        }
        try {
            const discounts = JSON.parse(localStorage.getItem('discounts') || '[]');
            const match = discounts.find(
                d => d.status === 'ACTIVE' && d.autoApply &&
                Array.isArray(d.appliesTo) && d.appliesTo.includes(category)
            );
            if (match) {
                setDiscountType(match.type === 'FLAT' ? 'FLAT' : 'PERCENTAGE');
                setDiscountValue(String(match.value));
                setDiscountSource(match.name);
            } else {
                setDiscountValue('');
                setDiscountSource('');
                setDiscountType('PERCENTAGE');
            }
        } catch { /* ignore parse errors */ }
    }, [formData.chargeType]);

    // Computed amounts
    const totalAmount = (parseFloat(formData.amount) || 0) * (parseInt(formData.quantity) || 1);
    const discAmt = discountValue
        ? discountType === 'PERCENTAGE'
            ? Math.round(totalAmount * (parseFloat(discountValue) || 0) / 100)
            : parseFloat(discountValue) || 0
        : 0;
    const netAmount = Math.max(0, totalAmount - discAmt);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleAddCustomChargeType = () => {
        const trimmed = newCustomLabel.trim();
        if (!trimmed) return;
        const value = trimmed.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        if (chargeOptions.some(o => o.value === value)) {
            alert('A charge type with this name already exists.');
            return;
        }
        const newOpt = { value, label: trimmed, isCustom: true };
        const updated = [...chargeOptions, newOpt];
        setChargeOptions(updated);
        const custom = updated.filter(o => o.isCustom);
        localStorage.setItem('customChargeTypes', JSON.stringify(custom));
        setNewCustomLabel('');
        setShowAddCustom(false);
        handleChange('chargeType', value);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.chargeType) newErrors.chargeType = 'Charge type is required';
        if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Please enter a valid amount';
        if (!formData.quantity || parseInt(formData.quantity) <= 0) newErrors.quantity = 'Please enter a valid quantity';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setIsSubmitting(true);
        try {
            const chargeData = {
                id: Date.now(),
                date: formData.date,
                folio: formData.folio,
                chargeType: formData.chargeType,
                currency: formData.currency,
                amount: parseFloat(formData.amount),
                quantity: parseInt(formData.quantity),
                totalAmount,
                discountType: discountValue ? discountType : null,
                discountValue: discountValue ? parseFloat(discountValue) : 0,
                discountAmount: discAmt,
                netAmount,
                description: formData.description,
                comment: formData.comment,
                timestamp: new Date().toISOString(),
                createdBy: 'current_user'
            };

            if (onAdd) await onAdd(chargeData);

            const existingCharges = JSON.parse(localStorage.getItem('charges') || '[]');
            existingCharges.push(chargeData);
            localStorage.setItem('charges', JSON.stringify(existingCharges));
        } catch (error) {
            console.error('Error submitting charge:', error);
            alert('Failed to add charge. Please try again.');
            setIsSubmitting(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
    };

    return (
        <div className="add-charges-overlay" onClick={onClose}>
            <div className="add-charges-modal" onClick={(e) => e.stopPropagation()}>
                <div className="add-charges-header">
                    <h2>Add Charges</h2>
                    <button className="add-charges-close" onClick={onClose}>×</button>
                </div>

                <div className="add-charges-body">
                    {/* Date */}
                    <div className="add-charges-field">
                        <label>Date <span className="required">*</span></label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => handleChange('date', e.target.value)}
                            onKeyPress={handleKeyPress}
                            className={errors.date ? 'error' : ''}
                        />
                        {errors.date && <span className="error-message">{errors.date}</span>}
                    </div>

                    {/* Folio */}
                    <div className="add-charges-field">
                        <label>Folio</label>
                        <select value={formData.folio} onChange={(e) => handleChange('folio', e.target.value)}>
                            <option>{formData.folio}</option>
                        </select>
                    </div>

                    {/* Charges Select */}
                    <div className="add-charges-field">
                        <label>Charges <span className="required">*</span></label>
                        <select
                            value={formData.chargeType}
                            onChange={(e) => {
                                if (e.target.value === '__add_custom__') {
                                    setShowAddCustom(true);
                                } else {
                                    handleChange('chargeType', e.target.value);
                                }
                            }}
                            className={errors.chargeType ? 'error' : ''}
                        >
                            <option value="">Select Charges</option>
                            {chargeOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}{option.isCustom ? ' (Custom)' : ''}
                                </option>
                            ))}
                            <option value="__add_custom__">＋ Add Custom Charge Type</option>
                        </select>
                        {errors.chargeType && <span className="error-message">{errors.chargeType}</span>}
                    </div>

                    {/* Custom Charge Type form */}
                    {showAddCustom && (
                        <div className="add-charges-field" style={{ background: '#f0f9ff', padding: '10px', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                            <label>New Charge Type Name</label>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                <input
                                    type="text"
                                    value={newCustomLabel}
                                    onChange={(e) => setNewCustomLabel(e.target.value)}
                                    placeholder="e.g. Minibar, Transport..."
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddCustomChargeType()}
                                    style={{ flex: 1 }}
                                />
                                <button type="button" onClick={handleAddCustomChargeType}
                                    style={{ background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', padding: '0 12px', cursor: 'pointer', fontWeight: 600 }}>
                                    Add
                                </button>
                                <button type="button" onClick={() => { setShowAddCustom(false); setNewCustomLabel(''); }}
                                    style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '4px', padding: '0 10px', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Amount */}
                    <div className="add-charges-field">
                        <label>Amount <span className="required">*</span></label>
                        <div className="amount-input-group">
                            <select className="currency-select" value={formData.currency} onChange={(e) => handleChange('currency', e.target.value)}>
                                <option>INR</option>
                                <option>USD</option>
                                <option>EUR</option>
                                <option>GBP</option>
                            </select>
                            <input
                                type="number"
                                className={`amount-input ${errors.amount ? 'error' : ''}`}
                                value={formData.amount}
                                onChange={(e) => handleChange('amount', e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter amount"
                                min="0"
                                step="0.01"
                            />
                        </div>
                        {errors.amount && <span className="error-message">{errors.amount}</span>}
                    </div>

                    {/* Quantity */}
                    <div className="add-charges-field">
                        <label>Quantity <span className="required">*</span></label>
                        <input
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => handleChange('quantity', e.target.value)}
                            onKeyPress={handleKeyPress}
                            className={errors.quantity ? 'error' : ''}
                            min="1"
                            placeholder="Enter quantity"
                        />
                        {errors.quantity && <span className="error-message">{errors.quantity}</span>}
                    </div>

                    {/* ── Discount Section ── */}
                    <div className="add-charges-field" style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '12px', marginTop: '4px' }}>
                        <label style={{ fontWeight: 600, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            Discount
                            {discountSource && (
                                <span style={{ fontWeight: 400, fontSize: '11px', color: '#16a34a' }}>
                                    ✓ Auto-filled: {discountSource}
                                </span>
                            )}
                        </label>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px', alignItems: 'center' }}>
                            {/* Toggle % / flat */}
                            <div style={{ display: 'flex', border: '1px solid #d1d5db', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                                <button type="button" onClick={() => setDiscountType('PERCENTAGE')}
                                    style={{ padding: '6px 12px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                                        background: discountType === 'PERCENTAGE' ? '#dc2626' : '#f9fafb',
                                        color: discountType === 'PERCENTAGE' ? '#fff' : '#374151' }}>%</button>
                                <button type="button" onClick={() => setDiscountType('FLAT')}
                                    style={{ padding: '6px 12px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                                        background: discountType === 'FLAT' ? '#dc2626' : '#f9fafb',
                                        color: discountType === 'FLAT' ? '#fff' : '#374151' }}>{cs}</button>
                            </div>
                            <input
                                type="number"
                                value={discountValue}
                                onChange={(e) => {
                                    setDiscountValue(e.target.value);
                                    if (e.target.value) setDiscountSource(prev => prev && !prev.endsWith('(Edited)') ? `${prev} (Edited)` : (prev || 'Manual'));
                                    else setDiscountSource('');
                                }}
                                placeholder={discountType === 'PERCENTAGE' ? '0 %' : `0 ${cs}`}
                                min="0"
                                max={discountType === 'PERCENTAGE' ? '100' : undefined}
                                style={{ flex: 1, padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
                            />
                            {discountValue && (
                                <button type="button" onClick={() => { setDiscountValue(''); setDiscountSource(''); }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '18px', lineHeight: 1 }}>×</button>
                            )}
                        </div>
                        {/* Net amount preview */}
                        {totalAmount > 0 && (
                            <div style={{ marginTop: '8px', fontSize: '12px', color: '#475569', display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '6px 8px', borderRadius: '4px' }}>
                                <span>Gross: {cs}{totalAmount.toFixed(2)}</span>
                                {discAmt > 0 && <span style={{ color: '#dc2626' }}>Discount: −{cs}{discAmt.toFixed(2)}</span>}
                                <span style={{ fontWeight: 700, color: '#15803d' }}>Net: {cs}{netAmount.toFixed(2)}</span>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="add-charges-field">
                        <label>Description</label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Enter description"
                        />
                    </div>

                    {/* Comment */}
                    <div className="add-charges-field">
                        <label>Comment</label>
                        <textarea
                            placeholder="Leave a comment here"
                            value={formData.comment}
                            onChange={(e) => handleChange('comment', e.target.value)}
                            rows="3"
                        ></textarea>
                    </div>
                </div>

                <div className="add-charges-footer">
                    <button className="add-charges-cancel-btn" onClick={onClose} disabled={isSubmitting}>Cancel</button>
                    <button className="add-charges-submit-btn" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Adding...' : 'Add Charge'}
                    </button>
                </div>
            </div>

            {showToast && (
                <Toast message="Successful!" onClose={() => setShowToast(false)} type="success" />
            )}
        </div>
    );
};

export default AddCharges;
