import { useState, useMemo } from 'react';
import { useSettings } from '../../context/SettingsContext';
import '../AddPayment.css'; 

const AddPaymentForm = ({ booking, onSubmit, onCancel }) => {
    const { settings, getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();

    const availableModes = useMemo(() => {
        const modes = [];
        const pm = settings?.paymentModes || {};
        if (pm.cash !== false) modes.push({ id: 'Cash', icon: '💵', label: 'Cash' });
        if (pm.card) modes.push({ id: 'Card', icon: '💳', label: 'Card' });
        if (pm.upi) modes.push({ id: 'UPI', icon: '📱', label: 'UPI' });
        if (pm.bankTransfer) modes.push({ id: 'Bank Transfer', icon: '🏦', label: 'Bank' });
        if (pm.cheque) modes.push({ id: 'Cheque', icon: '📝', label: 'Cheque' });
        
        if (modes.length === 0) {
            return [
                { id: 'Cash', icon: '💵', label: 'Cash' },
                { id: 'Card', icon: '💳', label: 'Card' },
                { id: 'UPI', icon: '📱', label: 'UPI' },
                { id: 'Bank Transfer', icon: '🏦', label: 'Bank' }
            ];
        }
        return modes;
    }, [settings?.paymentModes]);

    const [formData, setFormData] = useState({
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: availableModes[0]?.id || 'Cash',
        amount: '',
        referenceId: '',
        comment: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        const amt = parseFloat(formData.amount);
        if (!formData.amount || isNaN(amt) || amt <= 0) newErrors.amount = 'Amount is required';
        if (['Card', 'UPI', 'Bank Transfer', 'Cheque', 'Bank'].includes(formData.paymentMethod) && !formData.referenceId?.trim()) {
            newErrors.referenceId = 'Ref ID is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            await onSubmit({
                ...formData,
                date: formData.paymentDate, 
                amount: Math.abs(parseFloat(formData.amount))
            });
        } catch (error) {
            console.error('Submit error:', error);
            setIsSubmitting(false);
        }
    };

    const balance = booking?.remainingAmount || ((booking?.totalAmount || 0) - (booking?.advancePaid || 0));

    return (
        <div className="add-payment-form-premium" style={{ width: '100%', overflowX: 'hidden' }}>
            <div className="add-payment-body">
                {/* Reservation Summary Card */}
                <div className="payment-summary-card">
                    <div className="summary-header">
                        <span className="ref-tag">RESERVATION DETAILS</span>
                        <span className="ref-number">{booking?.bookingId || 'RES-1002'}</span>
                    </div>
                    <div className="summary-details">
                        <div className="detail-col">
                            <label>GUEST NAME</label>
                            <p className="truncate-text">{booking?.guestName || 'Pending...'}</p>
                        </div>
                        <div className="detail-col-group">
                            <div className="detail-sub-col">
                                <label>TOTAL</label>
                                <p>{cs}{(booking?.totalAmount || 0).toLocaleString('en-IN')}</p>
                            </div>
                            <div className="detail-sub-col text-right">
                                <label>BALANCE</label>
                                <p className="balance-text-bold">{cs}{(balance || 0).toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Balance Preview - Pink Box */}
                <div className="new-balance-preview animate-in">
                    <div className="preview-label">Balance after this payment</div>
                    <div className={`preview-amount ${ (balance - (parseFloat(formData.amount) || 0)) <= 0 ? 'fully-paid' : ''}`}>
                        {cs}{Math.max(0, balance - (parseFloat(formData.amount) || 0)).toLocaleString('en-IN')}
                    </div>
                </div>

                {/* Date Input */}
                <div className="payment-field-group">
                    <label className="field-label-premium">PAYMENT DATE</label>
                    <div className="input-with-icon">
                        <span className="field-icon">📅</span>
                        <input
                            type="date"
                            value={formData.paymentDate}
                            onChange={(e) => handleChange('paymentDate', e.target.value)}
                            className={errors.paymentDate ? 'error' : ''}
                        />
                    </div>
                </div>

                {/* Payment Method Grid */}
                <div className="payment-field-group">
                    <label className="field-label-premium">SELECT METHOD</label>
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
                    <label className="field-label-premium">AMOUNT TO PAY <span className="req-star">*</span></label>
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
                                onClick={() => handleChange('amount', String(balance))}
                            >
                                PAY FULL
                            </button>
                        )}
                    </div>
                    {errors.amount && <span className="err-hint">{errors.amount}</span>}
                </div>

                {/* Reference ID */}
                {['Card', 'UPI', 'Bank Transfer', 'Cheque', 'Bank'].includes(formData.paymentMethod) && (
                    <div className="payment-field-group animate-in">
                        <label className="field-label-premium">REF / TRANSACTION ID <span className="req-star">*</span></label>
                        <input
                            type="text"
                            value={formData.referenceId}
                            onChange={(e) => handleChange('referenceId', e.target.value)}
                            placeholder="Enter reference number"
                            className={errors.referenceId ? 'error' : ''}
                        />
                        {errors.referenceId && <span className="err-hint">{errors.referenceId}</span>}
                    </div>
                )}

                {/* Comment */}
                <div className="payment-field-group">
                    <label className="field-label-premium">NOTES (OPTIONAL)</label>
                    <textarea
                        className="premium-textarea"
                        value={formData.comment}
                        onChange={(e) => handleChange('comment', e.target.value)}
                        placeholder="Add essential notes about this payment..."
                        rows="2"
                    />
                </div>
            </div>

            {/* Premium Footer */}
            <div className="payment-modal-footer">
                <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>
                    CANCEL
                </button>
                <button 
                    type="submit" 
                    className="btn-primary" 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <div className="spinner-small"></div>
                    ) : (
                        <>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"></path></svg>
                            CONFIRM PAYMENT
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default AddPaymentForm;
