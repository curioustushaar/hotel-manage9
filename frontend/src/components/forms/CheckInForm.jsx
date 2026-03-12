import { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import '../AddPayment.css'; // Reuse premium styles

const CheckInForm = ({ booking, onSubmit, onCancel }) => {
    const { getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();

    const [formData, setFormData] = useState({
        actualCheckInDate: new Date().toISOString().split('T')[0],
        actualCheckInTime: new Date().toTimeString().slice(0, 5),
        idProofType: booking.idProofType || 'Aadhaar',
        idProofNumber: booking.idProofNumber || '',
        numberOfAdults: booking.numberOfAdults || booking.numberOfGuests || 1,
        numberOfChildren: booking.numberOfChildren || booking.childrenCount || 0,
        vehicleNumber: '',
        securityDeposit: 0,
        checkInRemarks: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.actualCheckInDate) newErrors.actualCheckInDate = 'Date is required';
        if (!formData.actualCheckInTime) newErrors.actualCheckInTime = 'Time is required';
        if (!formData.idProofNumber.trim()) newErrors.idProofNumber = 'ID number is required';
        if (parseInt(formData.numberOfAdults) < 1) newErrors.numberOfAdults = 'At least 1 adult required';
        if (parseFloat(formData.securityDeposit) < 0) newErrors.securityDeposit = 'Cannot be negative';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await onSubmit({
                arrivalDate: formData.actualCheckInDate,
                checkInTime: formData.actualCheckInTime,
                idProofType: formData.idProofType,
                idNumber: formData.idProofNumber,
                adults: parseInt(formData.numberOfAdults, 10),
                children: parseInt(formData.numberOfChildren, 10),
                vehicleNumber: formData.vehicleNumber,
                securityDeposit: Math.abs(parseFloat(formData.securityDeposit) || 0),
                remarks: formData.checkInRemarks
            });
        } catch (error) {
            console.error('Check-in error:', error);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="add-payment-form-premium" style={{ height: '100%', width: '100%', boxSizing: 'border-box' }}>
            <div className="add-payment-body">
                {/* Guest & Reservation Summary Card */}
                <div className="payment-summary-card">
                    <div className="summary-header">
                        <span className="ref-tag">RESERVATION DETAILS</span>
                        <span className="ref-number">{booking.bookingId || 'N/A'}</span>
                    </div>
                    <div className="summary-main">
                        <div className="summary-column">
                            <div className="summary-item">
                                <label>GUEST NAME</label>
                                <span className="truncate-text">{booking.guestName || 'Valued Guest'}</span>
                            </div>
                            <div className="summary-item">
                                <label>ROOM</label>
                                <span>{booking.roomNumber || 'TBA'} ({booking.roomType || 'Std'})</span>
                            </div>
                        </div>
                        <div className="summary-column">
                            <div className="summary-item">
                                <label>RESERVATION ID</label>
                                <span style={{ color: '#64748b', fontSize: '11px' }}>{booking.bookingId || 'N/A'}</span>
                            </div>
                            <div className="summary-item">
                                <label>STATUS</label>
                                <span style={{ color: '#059669' }}>{booking.status || 'Reserved'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Arrival Info */}
                <div className="payment-method-grid">
                    <div className="payment-field-group">
                        <label className="field-label-premium">ARRIVAL DATE <span className="req-star">*</span></label>
                        <div className="input-with-icon">
                            <span className="field-icon">📅</span>
                            <input
                                type="date"
                                name="actualCheckInDate"
                                value={formData.actualCheckInDate}
                                onChange={handleChange}
                                className={errors.actualCheckInDate ? 'error' : ''}
                            />
                        </div>
                    </div>
                    <div className="payment-field-group">
                        <label className="field-label-premium">TIME <span className="req-star">*</span></label>
                        <div className="input-with-icon">
                            <span className="field-icon">🕒</span>
                            <input
                                type="time"
                                name="actualCheckInTime"
                                value={formData.actualCheckInTime}
                                onChange={handleChange}
                                className={errors.actualCheckInTime ? 'error' : ''}
                            />
                        </div>
                    </div>
                </div>

                <div className="payment-field-group" style={{ 
                    background: '#f8fafc', 
                    padding: '20px', 
                    borderRadius: '24px', 
                    border: '1px solid #e2e8f0',
                    marginTop: '4px',
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                    <label className="field-label-premium" style={{ color: '#1e40af', marginBottom: '12px', paddingLeft: '0' }}>
                        🪪 IDENTITY VERIFICATION
                    </label>
                    <div className="payment-method-grid">
                        <div className="payment-field-group">
                            <label className="field-label-premium">ID TYPE</label>
                            <select 
                                name="idProofType" 
                                value={formData.idProofType} 
                                onChange={handleChange}
                                className="premium-select"
                                style={{ height: '46px' }}
                            >
                                <option value="Aadhaar">Aadhaar Card</option>
                                <option value="Passport">Passport</option>
                                <option value="Driving License">Driving License</option>
                                <option value="PAN Card">PAN Card</option>
                                <option value="Voter ID">Voter ID</option>
                            </select>
                        </div>
                        <div className="payment-field-group">
                            <label className="field-label-premium">ID NUMBER</label>
                            <input
                                type="text"
                                name="idProofNumber"
                                value={formData.idProofNumber}
                                onChange={handleChange}
                                placeholder="Enter ID number"
                                className={errors.idProofNumber ? 'error' : ''}
                                style={{ height: '46px' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Occupancy */}
                <div className="payment-method-grid">
                    <div className="payment-field-group">
                        <label className="field-label-premium">ADULTS <span className="req-star">*</span></label>
                        <input
                            type="number"
                            name="numberOfAdults"
                            value={formData.numberOfAdults}
                            onChange={handleChange}
                            min="1"
                            className={errors.numberOfAdults ? 'error' : ''}
                        />
                    </div>
                    <div className="payment-field-group">
                        <label className="field-label-premium">CHILDREN</label>
                        <input
                            type="number"
                            name="numberOfChildren"
                            value={formData.numberOfChildren}
                            onChange={handleChange}
                            min="0"
                        />
                    </div>
                </div>

                {/* Vehicle & Deposit */}
                <div className="payment-method-grid">
                    <div className="payment-field-group">
                        <label className="field-label-premium">VEHICLE NUMBER</label>
                        <input
                            type="text"
                            name="vehicleNumber"
                            value={formData.vehicleNumber}
                            onChange={handleChange}
                            placeholder="e.g. DL01AB..."
                        />
                    </div>
                    <div className="payment-field-group">
                        <label className="field-label-premium">SECURITY DEPOSIT ({cs})</label>
                        <input
                            type="number"
                            name="securityDeposit"
                            value={formData.securityDeposit}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                        />
                    </div>
                </div>

                {/* Remarks */}
                <div className="payment-field-group">
                    <label className="field-label-premium">REMARKS</label>
                    <textarea
                        name="checkInRemarks"
                        className="premium-textarea"
                        value={formData.checkInRemarks}
                        onChange={handleChange}
                        placeholder="Any special notes for this check-in..."
                        rows="2"
                    />
                </div>
            </div>

            {/* Premium Footer */}
            <div className="payment-modal-footer">
                <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>
                    CANCEL
                </button>
                <button 
                    type="submit" 
                    className="btn-primary" 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <div className="spinner-small"></div>
                    ) : (
                        <>
                           <span>✓</span> CONFIRM CHECK-IN
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default CheckInForm;
