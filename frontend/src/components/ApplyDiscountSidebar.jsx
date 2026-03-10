import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import './ApplyDiscountSidebar.css';

const ApplyDiscountSidebar = ({ onClose, onApply, reservation }) => {
    const { getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        roomWiseDiscount: true,
        folioWiseDiscount: false,
        discountType: 'percentage',
        discountValue: '',
        folio: reservation ? `${reservation.roomNumber} - ${reservation.guestName}` : 'B5 - Shahrukh Ahmed',
        comment: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!formData.discountValue) {
            alert(`Please enter discount ${formData.discountType === 'percentage' ? 'percentage' : 'amount'}`);
            return;
        }

        if (formData.discountType === 'percentage' && (formData.discountValue < 0 || formData.discountValue > 100)) {
            alert('Discount percentage must be between 0 and 100');
            return;
        }

        if (formData.discountType === 'amount' && formData.discountValue < 0) {
            alert('Discount amount must be greater than 0');
            return;
        }

        setIsSubmitting(true);
        try {
            // Call the parent handler and wait for it to complete
            await onApply(formData);
            // Parent will handle closing the sidebar and showing toast
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

    return (
        <div className="apply-discount-overlay" onClick={onClose}>
            <div className="apply-discount-modal" onClick={(e) => e.stopPropagation()}>
                <div className="apply-discount-header">
                    <h2>Apply Discount</h2>
                    <button className="apply-discount-close" onClick={onClose}>×</button>
                </div>

                <div className="apply-discount-body">
                    {/* Date Field */}
                    <div className="apply-discount-field">
                        <label>Date <span className="required">*</span></label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => handleChange('date', e.target.value)}
                        />
                    </div>

                    <div className="apply-discount-field">
                        <div className="discount-checkbox-group">
                            <label className="discount-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.roomWiseDiscount}
                                    onChange={(e) => handleChange('roomWiseDiscount', e.target.checked)}
                                />
                                <span className="checkbox-text">ROOM WISE DISCOUNT</span>
                            </label>
                            <label className="discount-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.folioWiseDiscount}
                                    onChange={(e) => handleChange('folioWiseDiscount', e.target.checked)}
                                />
                                <span className="checkbox-text">FOLIO WISE DISCOUNT</span>
                            </label>
                        </div>
                    </div>

                    {/* Discount Type Selection */}
                    <div className="apply-discount-field">
                        <label>Discount Type <span className="required">*</span></label>
                        <select
                            value={formData.discountType}
                            onChange={(e) => handleChange('discountType', e.target.value)}
                            className="apply-discount-dropdown"
                        >
                            <option value="percentage">Percentage (%)</option>
                            <option value="amount">Amount ({cs})</option>
                        </select>
                    </div>

                    {/* Discount Value Field */}
                    <div className="apply-discount-field">
                        <label>Discount <span className="required">*</span></label>
                        <input
                            type="number"
                            value={formData.discountValue}
                            onChange={(e) => handleChange('discountValue', e.target.value)}
                            placeholder={formData.discountType === 'percentage' ? 'Enter discount percentage' : 'Enter discount amount'}
                            min="0"
                            max={formData.discountType === 'percentage' ? '100' : undefined}
                        />
                    </div>

                    {/* Folio Field */}
                    <div className="apply-discount-field">
                        <label>Folio</label>
                        <input
                            type="text"
                            value={formData.folio}
                            onChange={(e) => handleChange('folio', e.target.value)}
                            placeholder="Enter folio name"
                        />
                    </div>

                    {/* Plus Value Button */}
                    <div className="apply-discount-field">
                        <button type="button" className="discount-plus-value-btn">
                            <span className="plus-icon">+</span> Plus Value
                        </button>
                    </div>

                    {/* Comment Field */}
                    <div className="apply-discount-field">
                        <label>Comment</label>
                        <textarea
                            value={formData.comment}
                            onChange={(e) => handleChange('comment', e.target.value)}
                            placeholder="Write a comment here"
                            rows="3"
                        ></textarea>
                    </div>
                </div>

                <div className="apply-discount-footer">
                    <button
                        className="apply-discount-cancel-btn"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        className="apply-discount-submit-btn"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Adding...' : 'Add'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApplyDiscountSidebar;
