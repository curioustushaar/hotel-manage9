import React, { useState, useMemo } from 'react';
import './AddPayment.css';
import { useSettings } from '../context/SettingsContext';

const AddPayment = ({ onClose, onAdd, reservation }) => {
    const { settings, getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();

    // Build payment modes from settings or defaults
    const availableModes = useMemo(() => {
        const modes = [];
        const pm = settings?.paymentModes || {};
        if (pm.cash !== false) modes.push({ id: 'Cash', icon: '💵', label: 'Cash' });
        if (pm.card) modes.push({ id: 'Card', icon: '💳', label: 'Card' });
        if (pm.upi) modes.push({ id: 'UPI', icon: '📲', label: 'UPI' });
        if (pm.bankTransfer) modes.push({ id: 'Bank Transfer', icon: '🏦', label: 'Bank' });
        
        if (modes.length === 0) {
            return [
                { id: 'Cash', icon: '💵', label: 'Cash' },
                { id: 'Card', icon: '💳', label: 'Card' },
                { id: 'UPI', icon: '📲', label: 'UPI' },
                { id: 'Bank Transfer', icon: '🏦', label: 'Bank' }
            ];
        }
        return modes;
    }, [settings?.paymentModes]);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        paymentMethod: availableModes[0]?.id || 'Cash',
        amount: '',
        referenceId: '',
        comment: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.paymentMethod) newErrors.paymentMethod = 'Method is required';
        if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Enter valid amount';
        
        if (['Card', 'UPI', 'Bank Transfer'].includes(formData.paymentMethod) && !formData.referenceId) {
            newErrors.referenceId = 'Ref ID is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setIsSubmitting(true);

        try {
            const paymentData = {
                ...formData,
                amount: parseFloat(formData.amount),
                paymentType: formData.paymentMethod, // mapping for parent
                timestamp: new Date().toISOString()
            };

            if (onAdd) {
                await onAdd(paymentData);
            }
        } catch (error) {
            console.error('Error adding payment:', error);
            setIsSubmitting(false);
        }
    };

    const balance = reservation ? (reservation.remainingAmount || (reservation.totalAmount - (reservation.paidAmount || reservation.advancePaid || 0))) : 0;

    return (
        <div className="add-payment-overlay" onClick={onClose}>
            <div className="add-payment-modal" onClick={(e) => e.stopPropagation()}>
                {/* Modern Header */}
                <div className="premium-payment-header">
                    <div className="header-icon-wrap">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                    </div>
                    <div className="header-text">
                        <h3>Add Payment</h3>
                        <span>Process new transaction</span>
                    </div>
                    <button className="premium-close-btn" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="add-payment-body">
                    {/* Reservation Summary Card */}
                    {reservation && (
                        <div className="payment-summary-card">
                            <div className="summary-header">
                                <span className="ref-tag">RESERVATION DETAILS</span>
                                <span className="ref-number">{reservation.bookingId || reservation._id?.toString().slice(-6).toUpperCase() || 'RES-1002'}</span>
                            </div>
                            <div className="summary-details">
                                <div className="detail-col">
                                    <label>Guest Name</label>
                                    <p className="truncate-text">{reservation.guestName || 'Walk-in Guest'}</p>
                                </div>
                                <div className="detail-col-group">
                                    <div className="detail-sub-col">
                                        <label>Total</label>
                                        <p>{cs}{(reservation.totalAmount || 0).toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="detail-sub-col text-right">
                                        <label>Balance</label>
                                        <p className="balance-text-bold">{cs}{(balance || 0).toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* New Balance Preview (Dynamic) */}
                    <div className="new-balance-preview animate-in">
                        <div className="preview-label">Balance after this payment</div>
                        <div className={`preview-amount ${ (balance - (parseFloat(formData.amount) || 0)) <= 0 ? 'fully-paid' : ''}`}>
                            {cs}{Math.max(0, balance - (parseFloat(formData.amount) || 0)).toLocaleString('en-IN')}
                        </div>
                    </div>

                    {/* Date Input */}
                    <div className="payment-field-group">
                        <label className="field-label-premium">Payment Date</label>
                        <div className="input-with-icon">
                            <span className="field-icon">📅</span>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleChange('date', e.target.value)}
                                className={errors.date ? 'error' : ''}
                            />
                        </div>
                    </div>

                    {/* Payment Method Grid */}
                    <div className="payment-field-group">
                        <label className="field-label-premium">Select Method</label>
                        <div className="payment-method-grid">
                            {availableModes.map(mode => (
                                <button
                                    key={mode.id}
                                    type="button"
                                    className={`method-btn-premium ${formData.paymentMethod === mode.id ? 'active' : ''}`}
                                    onClick={() => handleChange('paymentMethod', mode.id)}
                                >
                                    <div className="method-selection-indicator">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                    <span className="method-icon">{mode.icon}</span>
                                    <span className="method-label">{mode.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div className="payment-field-group">
                        <label className="field-label-premium">Amount <span className="req-star">*</span></label>
                        <div className="amount-input-container">
                            <span className="currency-indicator">{cs}</span>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => handleChange('amount', e.target.value)}
                                placeholder="0.00"
                                className={`amount-input-field ${errors.amount ? 'error' : ''}`}
                            />
                            {balance > 0 && (
                                <button 
                                    type="button"
                                    className="pay-full-action-btn"
                                    onClick={() => handleChange('amount', balance.toString())}
                                >
                                    PAY FULL
                                </button>
                            )}
                        </div>
                        {errors.amount && <span className="err-hint">{errors.amount}</span>}
                    </div>

                    {/* Reference ID - Conditional */}
                    {['Card', 'UPI', 'Bank Transfer'].includes(formData.paymentMethod) && (
                        <div className="payment-field-group animate-in">
                            <label>Ref / Transaction ID <span className="req-star">*</span></label>
                            <input
                                type="text"
                                value={formData.referenceId}
                                onChange={(e) => handleChange('referenceId', e.target.value)}
                                placeholder="TID12345678"
                                className={errors.referenceId ? 'error' : ''}
                            />
                            {errors.referenceId && <span className="err-hint">{errors.referenceId}</span>}
                        </div>
                    )}

                    {/* Comment */}
                    <div className="payment-field-group">
                        <label className="field-label-premium">Comment / Notes</label>
                        <textarea
                            className="premium-textarea"
                            value={formData.comment}
                            onChange={(e) => handleChange('comment', e.target.value)}
                            placeholder="Add essential notes about this payment..."
                            rows="2"
                        />
                    </div>
                </div>

                {/* Modern Footer Actions */}
                <div className="payment-modal-footer">
                    <button className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </button>
                    <button 
                        className="btn-primary" 
                        onClick={handleSubmit} 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <div className="spinner-small"></div>
                        ) : (
                            <>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"></path></svg>
                                Confirm Payment
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddPayment;
