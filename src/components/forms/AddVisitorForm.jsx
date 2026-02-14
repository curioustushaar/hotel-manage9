import { useState } from 'react';
import './FormStyles.css';

const AddVisitorForm = ({ booking, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        visitorName: '',
        mobileNumber: '',
        idProofType: 'Aadhaar (ID)',
        idProofNumber: '',
        visitPurpose: '',
        inTime: new Date().toISOString().slice(0, 16),
        outTime: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

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

        if (!formData.mobileNumber.trim()) {
            alert('Mobile number is required');
            return;
        }

        if (!formData.idProofNumber.trim()) {
            alert('ID proof number is required');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            // Reset form or close is handled by parent
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="action-form" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

            <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

                <div className="form-group">
                    <label className="form-label" style={{ fontWeight: '600', color: '#374151' }}>Visitor Name:</label>
                    <input
                        type="text"
                        name="visitorName"
                        className="form-input"
                        value={formData.visitorName}
                        onChange={handleChange}
                        placeholder="Enter visitor's name"
                        style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', padding: '12px', borderRadius: '8px' }}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label" style={{ fontWeight: '600', color: '#374151' }}>Mobile Number</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: '#f3f4f6',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '0 12px',
                            fontWeight: '600',
                            color: '#1f2937'
                        }}>
                            +91 <span style={{ fontSize: '10px', marginLeft: '4px' }}>▼</span>
                        </div>
                        <input
                            type="tel"
                            name="mobileNumber"
                            className="form-input"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            placeholder="Enter mobile number"
                            style={{ flex: 1, backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', padding: '12px', borderRadius: '8px' }}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label" style={{ fontWeight: '600', color: '#374151' }}>ID Type:</label>
                    <div style={{ position: 'relative' }}>
                        <select
                            name="idProofType"
                            className="form-select"
                            value={formData.idProofType}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                appearance: 'none',
                                backgroundColor: '#f9fafb',
                                border: '1px solid #e5e7eb',
                                padding: '12px',
                                borderRadius: '8px',
                                color: '#1f2937'
                            }}
                            required
                        >
                            <option value="Aadhaar (ID)">Aadhaar (ID)</option>
                            <option value="Passport">Passport</option>
                            <option value="Driving License">Driving License</option>
                            <option value="PAN Card">PAN Card</option>
                            <option value="Other">Other</option>
                        </select>
                        <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}>›</span>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label" style={{ fontWeight: '600', color: '#374151' }}>ID Number:</label>
                    <input
                        type="text"
                        name="idProofNumber"
                        className="form-input"
                        value={formData.idProofNumber}
                        onChange={handleChange}
                        placeholder="Enter ID number"
                        style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', padding: '12px', borderRadius: '8px' }}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label" style={{ fontWeight: '600', color: '#374151' }}>Purpose of Visit:</label>
                    <input
                        type="text"
                        name="visitPurpose"
                        className="form-input"
                        value={formData.visitPurpose}
                        onChange={handleChange}
                        placeholder="Enter purpose of visit"
                        style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', padding: '12px', borderRadius: '8px' }}
                    />
                </div>

                <div className="form-row" style={{ gap: '16px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label" style={{ fontWeight: '600', color: '#374151' }}>In Time:</label>
                        <input
                            type="datetime-local"
                            name="inTime"
                            className="form-input"
                            value={formData.inTime}
                            onChange={handleChange}
                            style={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
                            required
                        />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label" style={{ fontWeight: '600', color: '#374151' }}>Out Time:</label>
                        <input
                            type="datetime-local"
                            name="outTime"
                            className="form-input"
                            value={formData.outTime}
                            onChange={handleChange}
                            style={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
                        />
                    </div>
                </div>

                <div style={{ padding: '12px 0', fontSize: '13px', color: '#6b7280', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f3f4f6', marginTop: 'auto' }}>
                    <span>Reservation ID: {booking._id?.substring(0, 8)}...</span>
                    <span>Room Number: <strong>{booking.roomNumber || 'N/A'}</strong></span>
                </div>

                <div className="form-actions" style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                    <button
                        type="button"
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            backgroundColor: '#fff',
                            color: '#374151',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#dc2626',
                            color: '#fff',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        {isSubmitting ? 'Saving...' : 'Save Visitor'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddVisitorForm;
