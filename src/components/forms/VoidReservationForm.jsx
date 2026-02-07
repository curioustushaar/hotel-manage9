import { useState } from 'react';
import './FormStyles.css';

const VoidReservationForm = ({ booking, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        reason: '',
        adminPassword: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.reason.trim()) {
            alert('Void reason is required');
            return;
        }

        if (!formData.adminPassword.trim()) {
            alert('Admin password is required to void reservation');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            alert(error.message || 'Failed to void reservation. Check admin password.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="action-form" onSubmit={handleSubmit}>

            <div className="form-group">
                <label className="form-label required">Void Reason</label>
                <textarea
                    name="reason"
                    className="form-textarea"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Provide detailed reason for voiding this reservation"
                    rows="2"
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label required">Admin Password</label>
                <input
                    type="password"
                    name="adminPassword"
                    className="form-input"
                    value={formData.adminPassword}
                    onChange={handleChange}
                    placeholder="Enter admin password to confirm"
                    required
                />
            </div>

            <div className="warning-text">
                ⚠️ By voiding this reservation, you acknowledge:
                <ul>
                    <li>This action is irreversible</li>
                    <li>All transactions will be locked</li>
                    <li>Room will be marked as available</li>
                    <li>Audit trail will be maintained</li>
                </ul>
            </div>

            <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </button>
                <button type="submit" className="btn-danger" disabled={isSubmitting}>
                    {isSubmitting ? 'Voiding...' : '🗑️ VOID Reservation'}
                </button>
            </div>
        </form>
    );
};

export default VoidReservationForm;
