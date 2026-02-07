import React, { useState } from 'react';
import './ApplyDiscount.css';

const ApplyDiscount = ({ onClose, onApply, reservation }) => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        roomWiseDiscount: true,
        tableWiseDiscount: false,
        discountPercent: '',
        folio: '',
        comment: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.discountPercent) {
            alert('Please select discount percentage');
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
                                name="tableWiseDiscount"
                                checked={formData.tableWiseDiscount}
                                onChange={handleChange}
                            />
                            <span>Table Wise Discount</span>
                        </label>
                    </div>

                    {/* Discount Dropdown */}
                    <div className="form-group">
                        <label>Discount</label>
                        <select
                            name="discountPercent"
                            value={formData.discountPercent}
                            onChange={handleChange}
                            className="form-select"
                            required
                        >
                            <option value="">Select Discount</option>
                            <option value="5">5%</option>
                            <option value="10">10%</option>
                            <option value="15">15%</option>
                            <option value="20">20%</option>
                            <option value="25">25%</option>
                            <option value="30">30%</option>
                            <option value="50">50%</option>
                        </select>
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
