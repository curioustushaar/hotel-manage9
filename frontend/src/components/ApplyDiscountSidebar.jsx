import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import './ApplyDiscountSidebar.css';

const ApplyDiscountSidebar = ({ onClose, onApply, reservation }) => {
    const { settings, getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        roomWiseDiscount: true,
        folioWiseDiscount: false,
        discountType: 'percentage',
        discountValue: '',
        folio: reservation ? `${reservation.roomNumber} - ${reservation.guestName}` : 'Guest',
        comment: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [autoFilledSource, setAutoFilledSource] = useState('');

    // Auto-fill discount from active rules on open
    useEffect(() => {
        try {
            const discounts = JSON.parse(localStorage.getItem('discounts') || '[]');
            const match = discounts.find(
                d => d.status === 'ACTIVE' && d.autoApply &&
                Array.isArray(d.appliesTo) &&
                (d.appliesTo.includes('ROOM') || d.appliesTo.includes('BILL'))
            );
            if (match) {
                setFormData(prev => ({
                    ...prev,
                    discountType: match.type === 'FLAT' ? 'amount' : 'percentage',
                    discountValue: String(match.value)
                }));
                setAutoFilledSource(match.name);
            }
        } catch { /* ignore parse errors */ }
    }, []);

    const handleSubmit = async () => {
        if (!formData.discountValue) {
            alert(`Please enter discount ${formData.discountType === 'percentage' ? 'percentage' : 'amount'}`);
            return;
        }

        if (formData.discountType === 'percentage' && (parseFloat(formData.discountValue) < 0 || parseFloat(formData.discountValue) > 100)) {
            alert('Discount percentage must be between 0 and 100');
            return;
        }

        if (formData.discountType === 'amount' && parseFloat(formData.discountValue) < 0) {
            alert('Discount amount must be greater than 0');
            return;
        }

        // Enforce company max discount
        const maxDiscount = parseFloat(settings.discountRules?.maxDiscount) || 0;
        const maxDiscountType = settings.discountRules?.maxDiscountType || 'PERCENTAGE';
        if (maxDiscount > 0 && parseFloat(formData.discountValue) > 0) {
            if (formData.discountType === 'percentage' && maxDiscountType === 'PERCENTAGE') {
                if (parseFloat(formData.discountValue) > maxDiscount) {
                    alert(`Discount cannot exceed company max limit of ${maxDiscount}%`);
                    return;
                }
            } else if (formData.discountType === 'amount' && maxDiscountType === 'FLAT') {
                if (parseFloat(formData.discountValue) > maxDiscount) {
                    alert(`Discount cannot exceed company max limit of ${cs}${maxDiscount}`);
                    return;
                }
            }
        }

        setIsSubmitting(true);
        try {
            await onApply(formData);
            setTimeout(() => onClose(), 500);
        } catch (error) {
            console.error('Error applying discount:', error);
            alert('Failed to apply discount. Please try again.');
            setIsSubmitting(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const balance = reservation ? (reservation.remainingAmount || (reservation.totalAmount - (reservation.paidAmount || reservation.advancePaid || 0))) : 0;

    return (
        <div className="add-payment-overlay" onClick={onClose}>
            <div className="add-payment-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="premium-payment-header">
                    <div className="header-icon-wrap">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 15h2m0 0l-1-1m1 1l-1 1m-4 1h8a2 2 0 002-2V9a2 2 0 00-2-2h-3l-4-4H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    <div className="header-text">
                        <h3>Apply Discount</h3>
                        <span>Adjust folio total amount</span>
                    </div>
                    <button className="premium-close-btn" onClick={onClose}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="add-payment-body">
                    {/* Reservation Card */}
                    {reservation && (
                        <div className="payment-summary-card">
                            <div className="summary-header">
                                <span className="ref-tag">RESERVATION</span>
                                <span className="ref-number">{reservation.bookingId || 'BKG-552'}</span>
                            </div>
                            <div className="summary-details">
                                <div className="detail-col">
                                    <label>Guest</label>
                                    <p className="truncate-text">{reservation.guestName || 'Valued Guest'}</p>
                                </div>
                                <div className="detail-col-group">
                                    <div className="detail-sub-col">
                                        <label>Room</label>
                                        <p>{reservation.roomNumber || '101'}</p>
                                    </div>
                                    <div className="detail-sub-col text-right">
                                        <label>Net Due</label>
                                        <p className="balance-text-bold">{cs}{balance.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="payment-field-group">
                        <label className="field-label-premium">Processing Date</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => handleChange('date', e.target.value)}
                        />
                    </div>

                    <div className="discount-scope-panel">
                        <label className="premium-checkbox-card">
                            <input
                                type="checkbox"
                                checked={formData.roomWiseDiscount}
                                onChange={(e) => handleChange('roomWiseDiscount', e.target.checked)}
                            />
                            <div className="checkbox-custom-content">
                                <span className="custom-check-box"></span>
                                <span className="card-label-text">Room Wise</span>
                            </div>
                        </label>
                        <label className="premium-checkbox-card">
                            <input
                                type="checkbox"
                                checked={formData.folioWiseDiscount}
                                onChange={(e) => handleChange('folioWiseDiscount', e.target.checked)}
                            />
                            <div className="checkbox-custom-content">
                                <span className="custom-check-box"></span>
                                <span className="card-label-text">Folio Wise</span>
                            </div>
                        </label>
                    </div>

                    <div className="payment-field-group">
                        <label className="field-label-premium">Discount Format</label>
                        <div className="modern-select-wrapper">
                            <select
                                value={formData.discountType}
                                onChange={(e) => handleChange('discountType', e.target.value)}
                                className="premium-dropdown-select"
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="amount">Fixed Amount ({cs})</option>
                            </select>
                            <div className="select-arrow">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>
                        </div>
                    </div>

                    <div className="payment-field-group">
                        <label className="field-label-premium" style={{display:'flex', justifyContent:'space-between'}}>
                            Amount / Value
                            {autoFilledSource && <span style={{fontSize:'10px', color:'#16a34a'}}>Auto: {autoFilledSource}</span>}
                        </label>
                        <div className="amount-input-container">
                            <span className="currency-indicator">{formData.discountType === 'percentage' ? '%' : cs}</span>
                            <input
                                type="number"
                                className="amount-input-field"
                                value={formData.discountValue}
                                onChange={(e) => {
                                    handleChange('discountValue', e.target.value);
                                    if (autoFilledSource && !autoFilledSource.endsWith('(Edited)')) {
                                        setAutoFilledSource(prev => `${prev} (Edited)`);
                                    }
                                }}
                                placeholder="0"
                            />
                        </div>
                        {settings.discountRules?.maxDiscount > 0 && (
                             <p className="field-info-text">Max limit: {settings.discountRules.maxDiscount}{settings.discountRules?.maxDiscountType === 'FLAT' ? ` ${cs}` : '%'}</p>
                        )}
                    </div>

                    <div className="payment-field-group">
                        <label className="field-label-premium">Target Reference</label>
                        <input
                            type="text"
                            value={formData.folio}
                            onChange={(e) => handleChange('folio', e.target.value)}
                            placeholder="Folio or bill number..."
                        />
                    </div>

                    <div className="payment-field-group">
                        <label className="field-label-premium">Approval Note</label>
                        <textarea
                            value={formData.comment}
                            onChange={(e) => handleChange('comment', e.target.value)}
                            className="premium-textarea"
                            placeholder="Reason for adjustment..."
                            rows="2"
                        ></textarea>
                    </div>
                </div>

                <div className="payment-modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <div className="spinner-small" /> : 'Confirm Adjustment'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApplyDiscountSidebar;
