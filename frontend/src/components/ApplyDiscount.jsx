import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import './ApplyDiscount.css';

const ApplyDiscount = ({ onClose, onApply, reservation }) => {
    const { getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        roomWiseDiscount: true,
        folioWiseDiscount: false,
        discountType: 'percentage',
        discountValue: '',
        folio: reservation ? `${reservation.roomNumber} - ${reservation.guestName}` : '',
        comment: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.discountValue) {
            alert('Please enter discount value');
            return;
        }
        if (formData.discountType === 'percentage' && (formData.discountValue < 0 || formData.discountValue > 100)) {
            alert('Percentage must be between 0 and 100');
            return;
        }
        setIsSubmitting(true);
        onApply(formData);
        setTimeout(() => onClose(), 500);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const balance = reservation ? (reservation.remainingAmount || (reservation.totalAmount - (reservation.paidAmount || reservation.advancePaid || 0))) : 0;

    return (
        <div className="add-payment-overlay" onClick={onClose}>
            <div className="add-payment-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="premium-payment-header">
                    <div className="header-icon-wrap">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"></path></svg>
                    </div>
                    <div className="header-text">
                        <h3>Apply Discount</h3>
                        <span>Modify charges for this folio</span>
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
                                        <label>Amount Due</label>
                                        <p className="balance-text-bold">{cs}{balance.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="payment-field-group">
                        <label className="field-label-premium">Date</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="discount-scope-panel">
                        <label className="premium-checkbox-card">
                            <input
                                type="checkbox"
                                name="roomWiseDiscount"
                                checked={formData.roomWiseDiscount}
                                onChange={handleChange}
                            />
                            <div className="checkbox-custom-content">
                                <span className="custom-check-box"></span>
                                <span className="card-label-text">Room Wise</span>
                            </div>
                        </label>
                        <label className="premium-checkbox-card">
                            <input
                                type="checkbox"
                                name="folioWiseDiscount"
                                checked={formData.folioWiseDiscount}
                                onChange={handleChange}
                            />
                            <div className="checkbox-custom-content">
                                <span className="custom-check-box"></span>
                                <span className="card-label-text">Folio Wise</span>
                            </div>
                        </label>
                    </div>

                    <div className="payment-field-group">
                        <label className="field-label-premium">Discount Type</label>
                        <div className="modern-select-wrapper">
                            <select
                                name="discountType"
                                value={formData.discountType}
                                onChange={handleChange}
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
                        <label className="field-label-premium">Discount Value</label>
                        <div className="amount-input-container">
                            <span className="currency-indicator">{formData.discountType === 'percentage' ? '%' : cs}</span>
                            <input
                                type="number"
                                name="discountValue"
                                className="amount-input-field"
                                value={formData.discountValue}
                                onChange={handleChange}
                                placeholder={formData.discountType === 'percentage' ? '0' : '0.00'}
                                required
                            />
                        </div>
                        <p className="field-info-text">Max allowed discount: 25%</p>
                    </div>

                    <div className="payment-field-group">
                        <label className="field-label-premium">Reference Folio</label>
                        <input
                            type="text"
                            name="folio"
                            value={formData.folio}
                            onChange={handleChange}
                            placeholder="Type folio identifier..."
                        />
                    </div>

                    <div className="payment-field-group">
                        <label className="field-label-premium">Notes / Reason</label>
                        <textarea
                            name="comment"
                            value={formData.comment}
                            onChange={handleChange}
                            className="premium-textarea"
                            placeholder="Reason for this discount..."
                            rows="3"
                        ></textarea>
                    </div>
                </div>

                <div className="payment-modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <div className="spinner-small" /> : 'Apply Discount'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApplyDiscount;
