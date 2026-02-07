import { useState } from 'react';
import './FormStyles.css';

const CheckInForm = ({ booking, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        actualCheckInDate: new Date().toISOString().split('T')[0],
        actualCheckInTime: new Date().toTimeString().slice(0, 5),
        idProofType: booking.idProofType || 'Aadhaar',
        idProofNumber: booking.idProofNumber || '',
        numberOfAdults: booking.numberOfGuests || 1,
        numberOfChildren: 0,
        vehicleNumber: '',
        securityDeposit: 0,
        checkInRemarks: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.idProofNumber.trim()) {
            alert('ID Proof Number is required');
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
                <label className="form-label required">Arrival Date</label>
                <input
                    type="date"
                    name="actualCheckInDate"
                    className="form-input"
                    value={formData.actualCheckInDate}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label required">Check-In Time</label>
                <input
                    type="time"
                    name="actualCheckInTime"
                    className="form-input"
                    value={formData.actualCheckInTime}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label required">ID Proof Type</label>
                    <select
                        name="idProofType"
                        className="form-select"
                        value={formData.idProofType}
                        onChange={handleChange}
                        required
                    >
                        <option value="Aadhaar">Aadhaar</option>
                        <option value="Passport">Passport</option>
                        <option value="Driving License">Driving License</option>
                        <option value="PAN Card">PAN Card</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label required">ID Number</label>
                    <input
                        type="text"
                        name="idProofNumber"
                        className="form-input"
                        value={formData.idProofNumber}
                        onChange={handleChange}
                        placeholder="Enter ID number"
                        required
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label required">Adults</label>
                    <input
                        type="number"
                        name="numberOfAdults"
                        className="form-input"
                        value={formData.numberOfAdults}
                        onChange={handleChange}
                        min="1"
                        max="10"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Children</label>
                    <input
                        type="number"
                        name="numberOfChildren"
                        className="form-input"
                        value={formData.numberOfChildren}
                        onChange={handleChange}
                        min="0"
                        max="10"
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Vehicle Number</label>
                <input
                    type="text"
                    name="vehicleNumber"
                    className="form-input"
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    placeholder="e.g., DL01AB1234 (optional)"
                />
            </div>

            <div className="form-group">
                <label className="form-label">Security Deposit (₹)</label>
                <input
                    type="number"
                    name="securityDeposit"
                    className="form-input"
                    value={formData.securityDeposit}
                    onChange={handleChange}
                    min="0"
                    placeholder="Optional"
                />
            </div>

            <div className="form-group">
                <label className="form-label">Remarks</label>
                <textarea
                    name="checkInRemarks"
                    className="form-textarea"
                    value={formData.checkInRemarks}
                    onChange={handleChange}
                    placeholder="Any special notes (optional)"
                    rows="2"
                />
            </div>

            <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Checking In...' : '✓ Check-In'}
                </button>
            </div>
        </form>
    );
};

export default CheckInForm;
