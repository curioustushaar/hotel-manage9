import { useState, useEffect } from 'react';
import API_URL from '../../config/api';
import './FormStyles.css';

const ExchangeRoomForm = ({ booking, onSubmit, onCancel }) => {
    const [occupiedBookings, setOccupiedBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        targetBookingId: '',
        reason: '',
        confirmed: false
    });

    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchOccupiedBookings();
    }, [booking._id]);

    const fetchOccupiedBookings = async () => {
        try {
            const response = await fetch(`${API_URL}/api/bookings/occupied-bookings?excludeId=${booking._id}`);
            const data = await response.json();
            if (data.success) {
                setOccupiedBookings(data.data);
            }
        } catch (error) {
            console.error('Error fetching occupied bookings:', error);
            alert('Failed to load occupied bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === 'targetBookingId') {
            const selected = occupiedBookings.find(b => b._id === value);
            setSelectedBooking(selected);
        }
        
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.targetBookingId) {
            alert('Please select a booking to exchange with');
            return;
        }

        if (!formData.reason.trim()) {
            alert('Reason for exchange is required');
            return;
        }

        if (!formData.confirmed) {
            alert('Please confirm the room exchange');
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
                <label className="form-label required">Exchange With</label>
                {loading ? (
                    <div className="loading-text">Loading occupied rooms...</div>
                ) : occupiedBookings.length === 0 ? (
                    <div className="error-text">No other occupied rooms available</div>
                ) : (
                    <select
                        name="targetBookingId"
                        className="form-select"
                        value={formData.targetBookingId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">-- Select Booking to Exchange --</option>
                        {occupiedBookings.map(b => (
                            <option key={b._id} value={b._id}>
                                Room {b.roomNumber} - {b.guestName} ({b.roomType})
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <div className="form-group">
                <label className="form-label required">Reason for Exchange</label>
                <textarea
                    name="reason"
                    className="form-textarea"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Why are these rooms being exchanged?"
                    rows="2"
                    required
                />
            </div>

            <div className="form-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        name="confirmed"
                        checked={formData.confirmed}
                        onChange={handleChange}
                        required
                    />
                    <span className="checkbox-text-important">
                        I confirm this room exchange. Both reservations will be updated.
                    </span>
                </label>
            </div>

            <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting || occupiedBookings.length === 0}>
                    {isSubmitting ? 'Exchanging...' : '🔄 Exchange Rooms'}
                </button>
            </div>
        </form>
    );
};

export default ExchangeRoomForm;
