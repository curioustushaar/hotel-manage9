import { useState } from 'react';
import './FormStyles.css';

const NoShowForm = ({ booking, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        reason: '',
        charges: 0,
        refundAmount: 0
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.reason.trim()) {
            alert('Reason for no-show is required');
            return;
        }

        const charges = parseFloat(formData.charges) || 0;
        const refund = parseFloat(formData.refundAmount) || 0;
        const advancePaid = booking.advancePaid || 0;

        if (refund > advancePaid) {
            alert(`Refund amount cannot exceed advance paid (₹${advancePaid})`);
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
                <label className="form-label required">No-Show Reason</label>
                <textarea
                    name="reason"
                    className="form-textarea"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Why is this marked as no-show?"
                    rows="2"
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label">No-Show Charges (₹)</label>
                <input
                    type="number"
                    name="charges"
                    className="form-input"
                    value={formData.charges}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="Optional penalty charges"
                />
            </div>

            <div className="form-group">
                <label className="form-label">Refund Amount (₹)</label>
                <input
                    type="number"
                    name="refundAmount"
                    className="form-input"
                    value={formData.refundAmount}
                    onChange={handleChange}
                    min="0"
                    max={booking.advancePaid || 0}
                    step="0.01"
                    placeholder={`Max: ₹${booking.advancePaid || 0}`}
                />
            </div>

            <div className="info-display">
                <p><strong>Net Amount:</strong> ₹{((booking.advancePaid || 0) - (parseFloat(formData.refundAmount) || 0) + (parseFloat(formData.charges) || 0))}</p>
            </div>

            <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </button>
                <button type="submit" className="btn-warning" disabled={isSubmitting}>
                    {isSubmitting ? 'Processing...' : '❌ Mark No-Show'}
                </button>
            </div>
        </form>
    );
};

export default NoShowForm;
