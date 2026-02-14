import React, { useState, useEffect } from 'react';
import API_URL from '../config/api';
import './NewFolio.css';

const NewFolio = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        phone: '',
        customer: '',
        rooms: '102',
        registrationNo: ''
    });

    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch guests from bookings
    useEffect(() => {
        fetchGuests();
    }, []);

    const fetchGuests = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/bookings/list`);
            const data = await response.json();

            if (data.success && data.data) {
                // Extract unique guests
                const uniqueGuests = [];
                const guestMap = new Map();

                data.data.forEach(booking => {
                    const key = `${booking.guestName}-${booking.mobileNumber}`;
                    if (!guestMap.has(key)) {
                        guestMap.set(key, {
                            id: booking._id,
                            name: booking.guestName,
                            phone: booking.mobileNumber,
                            roomNumber: booking.roomNumber
                        });
                        uniqueGuests.push(guestMap.get(key));
                    }
                });

                setGuests(uniqueGuests);
            }
        } catch (error) {
            console.error('Error fetching guests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="new-folio-overlay" onClick={onClose}>
            <div className="new-folio-modal" onClick={(e) => e.stopPropagation()}>
                <div className="new-folio-header">
                    <h2>New Folio</h2>
                    <button className="new-folio-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="new-folio-form">
                    <div className="form-group">
                        <label>Sharer:</label>
                        <select
                            value={formData.customer}
                            onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                            disabled={loading}
                        >
                            <option value="">
                                {loading ? 'Loading guests...' : 'Select a customer'}
                            </option>
                            {guests.map((guest) => (
                                <option key={guest.id} value={guest.id}>
                                    {guest.name} - {guest.phone}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Rooms</label>
                        <input
                            type="text"
                            value={formData.rooms}
                            onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                            placeholder="102"
                        />
                    </div>

                    <div className="form-group">
                        <label>Registration No:</label>
                        <input
                            type="text"
                            value={formData.registrationNo}
                            onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
                            placeholder="Registration No"
                        />
                    </div>

                    <div className="new-folio-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-save">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewFolio;

