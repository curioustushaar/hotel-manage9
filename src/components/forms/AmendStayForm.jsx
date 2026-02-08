import { useState, useEffect } from 'react';
import './FormStyles.css';

const AmendStayForm = ({ booking, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        newCheckInDate: booking.checkInDate ? new Date(booking.checkInDate).toISOString().split('T')[0] : '',
        newCheckOutDate: booking.checkOutDate ? new Date(booking.checkOutDate).toISOString().split('T')[0] : '',
        numberOfNights: booking.numberOfNights || 0,
        reason: '',
        rateChange: false,
        newRate: booking.pricePerNight || 0
    });

    const [summary, setSummary] = useState({
        oldTotal: booking.totalAmount,
        newTotal: booking.totalAmount,
        difference: 0
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calculate nights and totals
    useEffect(() => {
        if (formData.newCheckInDate && formData.newCheckOutDate) {
            const checkIn = new Date(formData.newCheckInDate);
            const checkOut = new Date(formData.newCheckOutDate);
            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            
            if (nights > 0) {
                const rate = formData.rateChange ? parseFloat(formData.newRate) : booking.pricePerNight;
                const newTotal = rate * nights;
                
                setFormData(prev => ({ ...prev, numberOfNights: nights }));
                setSummary({
                    oldTotal: booking.totalAmount,
                    newTotal: newTotal,
                    difference: newTotal - booking.totalAmount
                });
            }
        }
    }, [formData.newCheckInDate, formData.newCheckOutDate, formData.rateChange, formData.newRate, booking.pricePerNight, booking.totalAmount]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.reason.trim()) {
            alert('Reason for amendment is required');
            return;
        }

        if (formData.numberOfNights <= 0) {
            alert('Invalid dates selected');
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
                    name="newCheckInDate"
                    className="form-input"
                    value={formData.newCheckInDate}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label required">Departure Date</label>
                <input
                    type="date"
                    name="newCheckOutDate"
                    className="form-input"
                    value={formData.newCheckOutDate}
                    onChange={handleChange}
                    min={formData.newCheckInDate}
                    required
                />
            </div>

            <div className="form-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        name="rateChange"
                        checked={formData.rateChange}
                        onChange={handleChange}
                    />
                    <span>Change Rate?</span>
                </label>
            </div>

            {formData.rateChange && (
                <div className="form-group">
                    <label className="form-label required">New Rate (₹/night)</label>
                    <input
                        type="number"
                        name="newRate"
                        className="form-input"
                        value={formData.newRate}
                        onChange={handleChange}
                        min="1"
                        required
                    />
                </div>
            )}

            <div className="form-group">
                <label className="form-label required">Reason</label>
                <textarea
                    name="reason"
                    className="form-textarea"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Why is the stay being amended?"
                    rows="2"
                    required
                />
            </div>

            <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Updating...' : '📅 Amend Stay'}
                </button>
            </div>
        </form>
    );
};

export default AmendStayForm;
