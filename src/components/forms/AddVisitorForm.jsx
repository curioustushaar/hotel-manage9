import { useState } from 'react';
import './FormStyles.css';

const AddVisitorForm = ({ booking, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        visitorName: '',
        mobileNumber: '',
        idProofType: 'Aadhaar',
        idProofNumber: '',
        visitPurpose: '',
        inTime: new Date().toISOString().slice(0, 16),
        outTime: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showVisitors, setShowVisitors] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.visitorName.trim()) {
            alert('Visitor name is required');
            return;
        }

        if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
            alert('Please enter a valid 10-digit mobile number');
            return;
        }

        if (!formData.idProofNumber.trim()) {
            alert('ID proof number is required');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            // Reset form after successful submission
            setFormData({
                visitorName: '',
                mobileNumber: '',
                idProofType: 'Aadhaar',
                idProofNumber: '',
                visitPurpose: '',
                inTime: new Date().toISOString().slice(0, 16),
                outTime: ''
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="action-form">
            <div className="visitors-toggle">
                <button 
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowVisitors(!showVisitors)}
                >
                    {showVisitors ? 'Hide' : 'Show'} Previous Visitors ({booking.visitors?.length || 0})
                </button>
            </div>

            {showVisitors && booking.visitors && booking.visitors.length > 0 && (
                <div className="visitors-list">
                    {booking.visitors.map((visitor, index) => (
                        <div key={index} className="visitor-card">
                            <p><strong>{visitor.visitorName}</strong></p>
                            <p>📱 {visitor.mobileNumber}</p>
                            <p>🆔 {visitor.idProofType}: {visitor.idProofNumber}</p>
                            <p>📝 {visitor.visitPurpose || 'No purpose specified'}</p>
                            <p className="visitor-time">
                                ⏰ In: {new Date(visitor.inTime).toLocaleString('en-IN')}
                                {visitor.outTime && ` | Out: ${new Date(visitor.outTime).toLocaleString('en-IN')}`}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <h3 className="form-section-title">Add New Visitor</h3>

                <div className="form-group">
                    <label className="form-label required">Visitor Name</label>
                    <input
                        type="text"
                        name="visitorName"
                        className="form-input"
                        value={formData.visitorName}
                        onChange={handleChange}
                        placeholder="Enter visitor's full name"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label required">Mobile Number</label>
                    <input
                        type="tel"
                        name="mobileNumber"
                        className="form-input"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        placeholder="10-digit mobile number"
                        pattern="[6-9][0-9]{9}"
                        maxLength="10"
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
                            <option value="Other">Other</option>
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
                            placeholder="ID proof number"
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Visit Purpose</label>
                    <input
                        type="text"
                        name="visitPurpose"
                        className="form-input"
                        value={formData.visitPurpose}
                        onChange={handleChange}
                        placeholder="e.g., Family visit, Business meeting"
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label required">In Time</label>
                        <input
                            type="datetime-local"
                            name="inTime"
                            className="form-input"
                            value={formData.inTime}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Out Time (Optional)</label>
                        <input
                            type="datetime-local"
                            name="outTime"
                            className="form-input"
                            value={formData.outTime}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>
                        Close
                    </button>
                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Adding...' : '👤 Add Visitor'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddVisitorForm;
