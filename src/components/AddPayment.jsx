import React, { useState } from 'react';
import './AddPayment.css';
import Toast from './Toast';

const AddPayment = ({ onClose, onAdd, reservation }) => {
    console.log('AddPayment component mounted');
    
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        folio: reservation ? `${reservation.roomNumber} - ${reservation.guestName}` : 'B5 - Shahrukh Ahmed',
        paymentType: '',
        currency: 'INR',
        amount: '',
        comment: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error for this field when user starts typing
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

        if (!formData.paymentType) {
            newErrors.paymentType = 'Payment type is required';
        }

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Please enter a valid amount';
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
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            // Here you would make an API call to save the payment
            const paymentData = {
                id: Date.now(),
                date: formData.date,
                folio: formData.folio,
                paymentType: formData.paymentType,
                currency: formData.currency,
                amount: parseFloat(formData.amount),
                comment: formData.comment,
                timestamp: new Date().toISOString(),
                createdBy: 'current_user' // Replace with actual user
            };

            console.log('Payment submitted:', paymentData);

            // Call the onAdd callback to update parent state
            if (onAdd) {
                onAdd(paymentData);
            }

            // Save to localStorage as backup
            const existingPayments = JSON.parse(localStorage.getItem('payments') || '[]');
            existingPayments.push(paymentData);
            localStorage.setItem('payments', JSON.stringify(existingPayments));

            // Show success toast notification
            setShowToast(true);
            
            // Close after a short delay to show the toast
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (error) {
            console.error('Error submitting payment:', error);
            alert('Failed to add payment. Please try again.');
        } finally {
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
        <div className="add-payment-overlay" onClick={onClose}>
            <div className="add-payment-modal" onClick={(e) => e.stopPropagation()}>
                <div className="add-payment-header">
                    <h2>Add Payment</h2>
                    <button className="add-payment-close" onClick={onClose}>×</button>
                </div>

                <div className="add-payment-body">
                    <div className="add-payment-field">
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

                    <div className="add-payment-field">
                        <label>Folio</label>
                        <select 
                            value={formData.folio} 
                            onChange={(e) => handleChange('folio', e.target.value)}
                        >
                            <option>{formData.folio}</option>
                            <option>Deluxe-102</option>
                            <option>B2 - Mr. Shahrukh Ahmed</option>
                        </select>
                    </div>

                    <div className="add-payment-field">
                        <label>Select Payment Type <span className="required">*</span></label>
                        <select 
                            value={formData.paymentType}
                            onChange={(e) => handleChange('paymentType', e.target.value)}
                            className={errors.paymentType ? 'error' : ''}
                        >
                            <option value="">Select Payment Type</option>
                            <option value="cash">Cash</option>
                            <option value="cheque">Cheque</option>
                            <option value="card">Card</option>
                            <option value="wallet">Wallet</option>
                            <option value="cod">COD</option>
                            <option value="phonepe">Phonepe</option>
                            <option value="upi">UPI</option>
                            <option value="cash_on_delivery">Cash on Delivery</option>
                            <option value="online_payment">Online Payment</option>
                            <option value="phonepe_machine">Phonepe Machine</option>
                        </select>
                        {errors.paymentType && <span className="error-message">{errors.paymentType}</span>}
                    </div>

                    <div className="add-payment-field">
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

                    <div className="add-payment-field">
                        <label>Comment</label>
                        <textarea 
                            placeholder="Leave a comment here"
                            value={formData.comment}
                            onChange={(e) => handleChange('comment', e.target.value)}
                            rows="4"
                        ></textarea>
                    </div>
                </div>

                <div className="add-payment-footer">
                    <button 
                        className="add-payment-cancel-btn" 
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button 
                        className="add-payment-submit-btn" 
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Adding...' : 'Add Payment'}
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

export default AddPayment;
