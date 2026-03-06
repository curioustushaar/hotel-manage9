import React, { useState } from 'react';
import './AddCharges.css';
import Toast from './Toast';

const AddCharges = ({ onClose, onAdd, reservation }) => {
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

    const chargeOptions = [
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
        { value: 'valet_parking', label: 'Valet Parking' }
    ];

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.date) {
            newErrors.date = 'Date is required';
        }

        if (!formData.chargeType) {
            newErrors.chargeType = 'Charge type is required';
        }

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Please enter a valid amount';
        }

        if (!formData.quantity || parseInt(formData.quantity) <= 0) {
            newErrors.quantity = 'Please enter a valid quantity';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

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
                totalAmount: parseFloat(formData.amount) * parseInt(formData.quantity),
                description: formData.description,
                comment: formData.comment,
                timestamp: new Date().toISOString(),
                createdBy: 'current_user'
            };

            console.log('Charge submitted:', chargeData);

            // Call the onAdd callback to update parent state
            if (onAdd) {
                await onAdd(chargeData);
            }

            const existingCharges = JSON.parse(localStorage.getItem('charges') || '[]');
            existingCharges.push(chargeData);
            localStorage.setItem('charges', JSON.stringify(existingCharges));

            // Parent will handle closing and showing toast
        } catch (error) {
            console.error('Error submitting charge:', error);
            alert('Failed to add charge. Please try again.');
            setIsSubmitting(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="add-charges-overlay" onClick={onClose}>
            <div className="add-charges-modal" onClick={(e) => e.stopPropagation()}>
                <div className="add-charges-header">
                    <h2>Add Charges</h2>
                    <button className="add-charges-close" onClick={onClose}>×</button>
                </div>

                <div className="add-charges-body">
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

                    <div className="add-charges-field">
                        <label>Folio</label>
                        <select
                            value={formData.folio}
                            onChange={(e) => handleChange('folio', e.target.value)}
                        >
                            <option>{formData.folio}</option>
                        </select>
                    </div>

                    <div className="add-charges-field">
                        <label>Charges <span className="required">*</span></label>
                        <select
                            value={formData.chargeType}
                            onChange={(e) => handleChange('chargeType', e.target.value)}
                            className={errors.chargeType ? 'error' : ''}
                        >
                            <option value="">Select Charges</option>
                            {chargeOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {errors.chargeType && <span className="error-message">{errors.chargeType}</span>}
                    </div>

                    <div className="add-charges-field">
                        <label>Amount <span className="required">*</span></label>
                        <div className="amount-input-group">
                            <select
                                className="currency-select"
                                value={formData.currency}
                                onChange={(e) => handleChange('currency', e.target.value)}
                            >
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

                    <div className="add-charges-field">
                        <label>Description</label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Enter description"
                        />
                    </div>

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
                    <button
                        className="add-charges-cancel-btn"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        className="add-charges-submit-btn"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Adding...' : 'Add Charge'}
                    </button>
                </div>
            </div>

            {/* Success Toast */}
            {showToast && (
                <Toast
                    message="Successful!"
                    onClose={() => setShowToast(false)}
                    type="success"
                />
            )}
        </div>
    );
};

export default AddCharges;
