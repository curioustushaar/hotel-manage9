import { useState, useEffect } from 'react';
import API_URL from '../../config/api';
import './FormStyles.css';

const RoomMoveForm = ({ booking, onSubmit, onCancel }) => {
    const [availableRooms, setAvailableRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        newRoomNumber: '',
        reason: '',
        moveDate: new Date().toISOString().split('T')[0],
        moveTime: new Date().toTimeString().slice(0, 5)
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchAvailableRooms();
    }, []);

    const fetchAvailableRooms = async () => {
        try {
            const response = await fetch(`${API_URL}/api/bookings/available-rooms`);
            const data = await response.json();
            if (data.success) {
                setAvailableRooms(data.data);
            }
        } catch (error) {
            console.error('Error fetching available rooms:', error);
            alert('Failed to load available rooms');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.newRoomNumber) {
            alert('Please select a room');
            return;
        }

        if (!formData.reason.trim()) {
            alert('Reason for room move is required');
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
                <label className="form-label required">New Room</label>
                {loading ? (
                    <div className="loading-text">Loading available rooms...</div>
                ) : availableRooms.length === 0 ? (
                    <div className="error-text">No rooms available</div>
                ) : (
                    <select
                        name="newRoomNumber"
                        className="form-select"
                        value={formData.newRoomNumber}
                        onChange={handleChange}
                        required
                    >
                        <option value="">-- Select New Room --</option>
                        {availableRooms.map(room => (
                            <option key={room._id} value={room.roomNumber}>
                                Room {room.roomNumber} - {room.roomType} (₹{room.price}/night)
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label required">Move Date</label>
                    <input
                        type="date"
                        name="moveDate"
                        className="form-input"
                        value={formData.moveDate}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label required">Move Time</label>
                    <input
                        type="time"
                        name="moveTime"
                        className="form-input"
                        value={formData.moveTime}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label required">Reason for Move</label>
                <textarea
                    name="reason"
                    className="form-textarea"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Why is the guest being moved?"
                    rows="2"
                    required
                />
            </div>

            <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting || availableRooms.length === 0}>
                    {isSubmitting ? 'Moving...' : '🚪 Move Room'}
                </button>
            </div>
        </form>
    );
};

export default RoomMoveForm;
