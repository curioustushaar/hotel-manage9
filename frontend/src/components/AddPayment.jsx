import React, { useState, useMemo, useEffect } from 'react';
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
    const [selectedGuestId, setSelectedGuestId] = useState('primary');

    const handleChange = (field, value) => {
        let finalValue = value;
        if (field === 'amount' && value !== '') {
            const absoluteValue = value.replace(/-/g, '');
            const numVal = parseFloat(absoluteValue);
            finalValue = absoluteValue;

            if (numVal > selectedFolioBalance) {
                finalValue = selectedFolioBalance.toString();
            }
        }

        setFormData(prev => ({ ...prev, [field]: finalValue }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.paymentMethod) newErrors.paymentMethod = 'Method is required';
        
        const amountValue = parseFloat(formData.amount);
        if (!formData.amount || amountValue <= 0) {
            newErrors.amount = 'Enter valid amount';
        } else if (amountValue > selectedFolioBalance) {
            newErrors.amount = `Amount cannot exceed selected folio balance (${cs}${selectedFolioBalance.toLocaleString('en-IN')})`;
        }
        
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
                folioId: selectedFolioId,
                selectedGuestName: selectedGuest?.name || reservation?.guestName || 'Guest',
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

    const balance = reservation ? (
        reservation.balanceDue !== undefined ? reservation.balanceDue :
        (reservation.remainingAmount || (reservation.totalAmount - (reservation.paidAmount || reservation.advancePaid || 0)))
    ) : 0;

    const folioGuests = useMemo(() => {
        const primaryGuest = {
            id: 'primary',
            folioId: 0,
            name: reservation?.guestName || 'Guest'
        };

        const additional = (Array.isArray(reservation?.additionalGuests) ? reservation.additionalGuests : [])
            .map((guest, index) => {
                if (typeof guest === 'string') {
                    return { id: `guest-${index}`, folioId: index + 1, name: guest };
                }

                const guestName = guest?.guestName || guest?.name || guest?.fullName || guest?.firstName;
                if (!guestName) return null;

                return {
                    id: guest?._id || guest?.id || `guest-${index}`,
                    folioId: index + 1,
                    name: guestName
                };
            })
            .filter(Boolean);

        return [primaryGuest, ...additional];
    }, [reservation?.guestName, reservation?.additionalGuests]);

    const folioBalances = useMemo(() => {
        const txns = Array.isArray(reservation?.transactions) ? reservation.transactions : [];
        const overall = Math.max(0, Number(balance) || 0);
        const balanceMap = {};

        let otherFoliosTotal = 0;
        folioGuests.forEach((guest) => {
            if (guest.folioId === 0) return;

            const charges = txns
                .filter((t) => Number(t.folioId || 0) === guest.folioId && t.type?.toLowerCase() === 'charge')
                .reduce((sum, t) => sum + (Math.abs(Number(t.amount)) || 0), 0);

            const paid = txns
                .filter((t) => Number(t.folioId || 0) === guest.folioId && t.type?.toLowerCase() === 'payment')
                .reduce((sum, t) => sum + (Math.abs(Number(t.amount)) || 0), 0);

            const folioBal = Math.max(0, charges - paid);
            balanceMap[guest.folioId] = folioBal;
            otherFoliosTotal += folioBal;
        });

        balanceMap[0] = Math.max(0, overall - otherFoliosTotal);
        return balanceMap;
    }, [reservation?.transactions, folioGuests, balance]);

    const selectedGuest = folioGuests.find((guest) => guest.id === selectedGuestId) || folioGuests[0];
    const selectedFolioId = selectedGuest?.folioId ?? 0;
    const selectedFolioBalance = Math.max(0, folioBalances[selectedFolioId] ?? 0);

    useEffect(() => {
        if (!folioGuests.some((guest) => guest.id === selectedGuestId)) {
            setSelectedGuestId(folioGuests[0]?.id || 'primary');
        }
    }, [folioGuests, selectedGuestId]);

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
                                <span className="ref-tag">SELECT FOLIO / GUEST</span>
                                <span className="ref-number">{reservation.bookingId || reservation._id?.toString().slice(-6).toUpperCase() || 'RES-1002'}</span>
                            </div>
                            <div className="folio-guest-list" role="radiogroup" aria-label="Folio guests">
                                {folioGuests.map((guest) => {
                                    const isSelected = selectedGuestId === guest.id;
                                    return (
                                        <button
                                            key={guest.id}
                                            type="button"
                                            className={`folio-guest-item ${isSelected ? 'active' : ''}`}
                                            onClick={() => setSelectedGuestId(guest.id)}
                                            role="radio"
                                            aria-checked={isSelected}
                                        >
                                            <span className="folio-radio-dot" aria-hidden="true"></span>
                                            <span className="folio-guest-meta">
                                                <span className="folio-guest-name">{guest.name}</span>
                                                <span className="folio-guest-balance">
                                                    Folio Balance: {cs}{(folioBalances[guest.folioId] || 0).toLocaleString('en-IN')}
                                                </span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* New Balance Preview (Dynamic) */}
                    <div className="new-balance-preview animate-in">
                        <div className="preview-label">Balance after this payment</div>
                        <div className={`preview-amount ${ (selectedFolioBalance - (parseFloat(formData.amount) || 0)) <= 0 ? 'fully-paid' : ''}`}>
                            {cs}{Math.max(0, selectedFolioBalance - (parseFloat(formData.amount) || 0)).toLocaleString('en-IN')}
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
                                onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                                min="0"
                                placeholder="0.00"
                                className={`amount-input-field ${errors.amount ? 'error' : ''}`}
                            />
                            {selectedFolioBalance > 0 && (
                                <button
                                    type="button"
                                    className="pay-full-action-btn"
                                    onClick={() => handleChange('amount', selectedFolioBalance.toString())}
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
