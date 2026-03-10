import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import './ApplyDiscount.css';

const ApplyDiscount = ({ onClose, onApply, reservation }) => {
    const { getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        roomWiseDiscount: true,
        folioWiseDiscount: false,
        discountType: 'percentage',
        discountValue: '',
        folio: '',
        comment: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.discountValue) {
            alert('Please enter discount value');
            return;
        }
        if (formData.discountType === 'percentage' && (formData.discountValue < 0 || formData.discountValue > 100)) {
            alert('Percentage must be between 0 and 100');
            return;
        }
        onApply(formData);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="apply-discount-overlay" onClick={onClose}>
            <div className="apply-discount-modal" onClick={(e) => e.stopPropagation()}>
                <div className="apply-discount-header">
                    <h2>Apply Discount</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="apply-discount-form">
                    {/* Date Field */}
                    <div className="form-group">
                        <label>Date</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />
                    </div>

                    {/* Discount Type Checkboxes */}
                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="roomWiseDiscount"
                                checked={formData.roomWiseDiscount}
                                onChange={handleChange}
                            />
                            <span>Room Wise Discount</span>
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="folioWiseDiscount"
                                checked={formData.folioWiseDiscount}
                                onChange={handleChange}
                            />
                            <span>Folio Wise Discount</span>
                        </label>
                    </div>

                    {/* Discount Type */}
                    <div className="form-group">
                        <label>Discount Type</label>
                        <select
                            name="discountType"
                            value={formData.discountType}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="percentage">Percentage (%)</option>
                            <option value="amount">Amount ({cs})</option>
                        </select>
                    </div>

                    {/* Discount Value Input */}
                    <div className="form-group">
                        <label>Discount {formData.discountType === 'percentage' ? 'Percentage' : 'Amount'}</label>
                        <input
                            type="number"
                            name="discountValue"
                            value={formData.discountValue}
                            onChange={handleChange}
                            className="form-input"
                            placeholder={formData.discountType === 'percentage' ? 'Enter discount percentage' : 'Enter discount amount'}
                            min="0"
                            max={formData.discountType === 'percentage' ? '100' : undefined}
                            step={formData.discountType === 'amount' ? '0.01' : '1'}
                            required
                        />
                    </div>

                    {/* Folio Field */}
                    <div className="form-group">
                        <label>Folio</label>
                        <input
                            type="text"
                            name="folio"
                            value={formData.folio}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter folio name"
                        />
                    </div>

                    {/* Plus Value Icon */}
                    <div className="form-group">
                        <button type="button" className="plus-value-btn">
                            <span className="plus-icon">+</span> Plus Value
                        </button>
                    </div>

                    {/* Comment Field */}
                    <div className="form-group">
                        <label>Comment</label>
                        <textarea
                            name="comment"
                            value={formData.comment}
                            onChange={handleChange}
                            className="form-textarea"
                            placeholder="Write a comment here"
                            rows="4"
                        ></textarea>
                    </div>

                    {/* Add Button */}
                    <div className="form-actions">
                        <button type="submit" className="btn-add-discount">
                            Add
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplyDiscount;
