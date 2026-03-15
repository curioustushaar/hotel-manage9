import React, { useState } from 'react';
import './ReservationModal.css';
import API_URL_CONFIG from '../config/api';
import { useSettings } from '../context/SettingsContext';

const ReservationModal = ({ table, onClose, onReserve }) => {
    const { getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();
    const [formData, setFormData] = useState({
        guestName: '',
        guestPhone: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '20:00',
        endTime: '21:00',
        guests: 4,
        note: '',
        source: 'Phone',
        advancePayment: 0
    });
    const [errors, setErrors] = useState({});
    const [searching, setSearching] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' });
    };

    const handleSearchGuest = async () => {
        if (!formData.guestPhone || formData.guestPhone.length < 10) {
            setErrors({ ...errors, guestPhone: 'Enter valid 10 digit number to search' });
            return;
        }

        try {
            setSearching(true);
            const response = await fetch(`${API_URL_CONFIG}/api/guests/search?query=${formData.guestPhone}`);
            const data = await response.json();

            if (data.success && data.data.length > 0) {
                // Find exact match if possible, otherwise take first
                const guest = data.data.find(g => g.mobile === formData.guestPhone) || data.data[0];
                setFormData(prev => ({
                    ...prev,
                    guestName: guest.fullName || guest.firstName + ' ' + (guest.lastName || '')
                }));
                setErrors({ ...errors, guestPhone: '', guestName: '' });
                alert(`Guest Found: ${guest.fullName || guest.firstName}`);
            } else {
                alert('Guest not found. Please enter name manually.');
            }
        } catch (error) {
            console.error('Search error:', error);
            alert('Error searching guest');
        } finally {
            setSearching(false);
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.guestName) newErrors.guestName = 'Name is required';
        if (!formData.guestPhone || formData.guestPhone.length !== 10) newErrors.guestPhone = 'Must be 10 digits';
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.startTime) newErrors.startTime = 'Start time required';
        if (!formData.endTime) newErrors.endTime = 'End time required';
        if (!formData.guests || formData.guests < 1) newErrors.guests = 'Min 1 guest';
        if (formData.guests > table.seats) newErrors.guests = `Max ${table.seats} guests`;

        // Time Logic
        const start = new Date(`${formData.date}T${formData.startTime}`);
        const end = new Date(`${formData.date}T${formData.endTime}`);
        const now = new Date();

        if (end <= start) newErrors.endTime = 'End time must be after start';
        if (end - start < 15 * 60000) newErrors.endTime = 'Min duration 15 mins';
        if (start < now) newErrors.startTime = 'Cannot reserve in past';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            onReserve(formData);
        }
    };

    return (
        <div className="reservation-modal-overlay">
            <div className="reservation-modal-content">
                <div className="modal-header">
                    <h3>Reserve Table - {table.name}</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="form-group">
                    <label>GUEST MOBILE NUMBER</label>
                    <div className="input-with-icon">
                        <input
                            type="text"
                            name="guestPhone"
                            value={formData.guestPhone}
                            onChange={handleInputChange}
                            placeholder="Enter 10 digit number"
                            maxLength="10"
                        />
                        <span
                            className="search-icon"
                            onClick={handleSearchGuest}
                            title="Search Guest"
                            style={{ cursor: 'pointer', opacity: searching ? 0.5 : 1 }}
                        >
                            {searching ? '...' : '🔍'}

                        </span>
                    </div>
                    {errors.guestPhone && <span className="error-text">{errors.guestPhone}</span>}
                </div>

                <div className="form-group">
                    <label>GUEST NAME</label>
                    <input
                        type="text"
                        name="guestName"
                        value={formData.guestName}
                        onChange={handleInputChange}
                        placeholder="Enter Guest Name"
                    />
                    {errors.guestName && <span className="error-text">{errors.guestName}</span>}
                </div>

                <div className="row-group">
                    <div className="form-group half">
                        <label>DATE</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            min={new Date().toISOString().split('T')[0]}
                        />
                        {errors.date && <span className="error-text">{errors.date}</span>}
                    </div>

                    <div className="form-group half">
                        <label>TIME (SESSION)</label>
                        <div className="time-range">
                            <input
                                type="time"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleInputChange}
                            />
                            <span>-</span>
                            <input
                                type="time"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleInputChange}
                            />
                        </div>
                        {errors.startTime && <span className="error-text">{errors.startTime}</span>}
                        {errors.endTime && <span className="error-text">{errors.endTime}</span>}
                    </div>
                </div>

                <div className="row-group">
                    <div className="form-group half">
                        <label>GUESTS COUNT</label>
                        <input
                            type="number"
                            name="guests"
                            value={formData.guests}
                            onChange={(e) => {
                                let val = e.target.value;
                                setFormData({ ...formData, guests: val !== '' ? Number(val) : '' });
                                setErrors({ ...errors, [e.target.name]: '' });
                            }}
                            onKeyDown={(e) => {
                                if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            min="1"
                            max={table.seats}
                        />
                        {errors.guests && <span className="error-text">{errors.guests}</span>}
                    </div>
                    <div className="form-group half">
                        <label>RESERVATION SOURCE</label>
                        <select
                            name="source"
                            value={formData.source}
                            onChange={handleInputChange}
                            className="form-select"
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        >
                            <option value="Phone">Phone Number</option>
                            <option value="Walk-In">Walk In</option>
                            <option value="Online">Online</option>
                        </select>
                    </div>
                </div>

                <div className="row-group">
                    <div className="form-group full" style={{ width: '100%' }}>
                        <label>SPECIAL NOTE</label>
                        <input
                            type="text"
                            name="note"
                            value={formData.note}
                            onChange={handleInputChange}
                            placeholder="e.g. Birthday"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>ADVANCE PAYMENT</label>
                    <div className="input-with-currency">
                        <span className="currency-symbol">{cs}</span>
                        <input
                            type="number"
                            name="advancePayment"
                            value={formData.advancePayment}
                            onChange={(e) => {
                                let val = e.target.value;
                                setFormData({ ...formData, advancePayment: val !== '' ? Number(val) : '' });
                                setErrors({ ...errors, [e.target.name]: '' });
                            }}
                            onKeyDown={(e) => {
                                if (['-', '+', 'e', 'E'].includes(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            placeholder="0.00"
                            style={{ paddingLeft: '25px', border: '2px solid #E31E24' }}
                        />
                    </div>
                    <p className="hint-text">* Enter the advance amount collected from the guest.</p>
                </div>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-reserve" onClick={handleSubmit}>Reserve Table</button>
                </div>
            </div>
        </div>
    );
};


export default ReservationModal;
