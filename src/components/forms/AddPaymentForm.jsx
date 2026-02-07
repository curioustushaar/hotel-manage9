import { useState } from 'react';
import './FormStyles.css';

const AddPaymentForm = ({ booking, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        amount: '',
        referenceId: '',
        comment: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            alert('Please enter a valid payment amount');
            return;
        }

        if (['Card', 'UPI', 'Bank Transfer'].includes(formData.paymentMethod) && !formData.referenceId.trim()) {
            alert('Reference ID is required for Card/UPI/Bank Transfer payments');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="action-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label required">Payment Date</label>
                <input
                    type="date"
                    name="paymentDate"
                    className="form-input"
                    value={formData.paymentDate}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label required">Payment Method</label>
                <select
                    name="paymentMethod"
                    className="form-select"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    required
                >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                </select>
            </div>

            <div className="form-group">
                <label className="form-label required">Amount (₹)</label>
                <input
                    type="number"
                    name="amount"
                    className="form-input"
                    value={formData.amount}
                    onChange={handleChange}
                    min="1"
                    step="0.01"
                    placeholder="Enter payment amount"
                    required
                />
            </div>

            {['Card', 'UPI', 'Bank Transfer'].includes(formData.paymentMethod) && (
                <div className="form-group">
                    <label className="form-label required">Reference ID</label>
                    <input
                        type="text"
                        name="referenceId"
                        className="form-input"
                        value={formData.referenceId}
                        onChange={handleChange}
                        placeholder="Transaction/Reference number"
                        required
                    />
                </div>
            )}

            <div className="form-group">
                <label className="form-label">Comment</label>
                <textarea
                    name="comment"
                    className="form-textarea"
                    value={formData.comment}
                    onChange={handleChange}
                    placeholder="Any notes (optional)"
                    rows="2"
                />
            </div>

            <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Processing...' : '💳 Add Payment'}
                </button>
            </div>
        </form>
    );
};

export default AddPaymentForm;
