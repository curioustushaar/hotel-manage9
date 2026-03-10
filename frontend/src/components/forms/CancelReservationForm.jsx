import { useState } from 'react';
import './FormStyles.css';
import { useSettings } from '../../context/SettingsContext';

const CancelReservationForm = ({ booking, onSubmit, onCancel }) => {
    const { getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();
    const [formData, setFormData] = useState({
        reason: '',
        cancellationCharges: 0,
        refundAmount: booking.advancePaid || 0,
        refundMode: 'Cash'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.reason.trim()) {
            alert('Cancellation reason is required');
            return;
        }

        const refund = parseFloat(formData.refundAmount) || 0;
        const charges = parseFloat(formData.cancellationCharges) || 0;
        const advancePaid = booking.advancePaid || 0;

        if (refund > advancePaid) {
            alert(`Refund amount cannot exceed advance paid (${cs}${advancePaid})`);
            return;
        }

        if (refund < 0) {
            alert('Refund amount cannot be negative');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    const netAmount = (booking.advancePaid || 0) - (parseFloat(formData.refundAmount) || 0) + (parseFloat(formData.cancellationCharges) || 0);

    return (
        <form className="action-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label required">Cancellation Reason</label>
                <textarea
                    name="reason"
                    className="form-textarea"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Why is this reservation being cancelled?"
                    rows="2"
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label">Cancellation Charges ({cs})</label>
                <input
                    type="number"
                    name="cancellationCharges"
                    className="form-input"
                    value={formData.cancellationCharges}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="Optional cancellation fee"
                />
            </div>

            <div className="form-group">
                <label className="form-label">Refund Amount ({cs})</label>
                <input
                    type="number"
                    name="refundAmount"
                    className="form-input"
                    value={formData.refundAmount}
                    onChange={handleChange}
                    min="0"
                    max={booking.advancePaid || 0}
                    step="0.01"
                    placeholder={`Max: ${cs}${booking.advancePaid || 0}`}
                />
            </div>

            <div className="form-group">
                <label className="form-label required">Refund Mode</label>
                <select
                    name="refundMode"
                    className="form-select"
                    value={formData.refundMode}
                    onChange={handleChange}
                    required
                >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                </select>
            </div>

            <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>
                    Go Back
                </button>
                <button type="submit" className="btn-danger" disabled={isSubmitting}>
                    {isSubmitting ? 'Cancelling...' : '⚠️ Cancel Reservation'}
                </button>
            </div>
        </form>
    );
};

export default CancelReservationForm;
