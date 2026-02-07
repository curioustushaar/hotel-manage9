import React, { useState } from 'react';
import './ApplyDiscountSidebar.css';
import Toast from './Toast';

const ApplyDiscountSidebar = ({ onClose, onApply, reservation }) => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        roomWiseDiscount: true,
        tableWiseDiscount: false,
        discountPercent: '',
        folio: reservation ? `${reservation.roomNumber} - ${reservation.guestName}` : 'B5 - Shahrukh Ahmed',
        comment: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const handleSubmit = async () => {
        if (!formData.discountPercent) {
            alert('Please enter discount percentage');
            return;
        }

        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            onApply(formData);
            
            // Show success toast notification
            setShowToast(true);
            
            // Close after a short delay to show the toast
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (error) {
            console.error('Error applying discount:', error);
            alert('Failed to apply discount. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="apply-discount-overlay" onClick={onClose}>
            <div className="apply-discount-modal" onClick={(e) => e.stopPropagation()}>
                <div className="apply-discount-header">
                    <h2>Apply Discount</h2>
                    <button className="apply-discount-close" onClick={onClose}>×</button>
                </div>

                <div className="apply-discount-body">
                    {/* Date Field */}
                    <div className="apply-discount-field">
                        <label>Date <span className="required">*</span></label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => handleChange('date', e.target.value)}
                        />
                    </div>

                    {/* Discount Type Checkboxes */}
                    <div className="apply-discount-field">
                        <div className="discount-checkbox-group">
                            <label className="discount-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.roomWiseDiscount}
                                    onChange={(e) => handleChange('roomWiseDiscount', e.target.checked)}
                                />
                                <span className="checkbox-text">ROOM WISE DISCOUNT</span>
                            </label>
                            <label className="discount-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.tableWiseDiscount}
                                    onChange={(e) => handleChange('tableWiseDiscount', e.target.checked)}
                                />
                                <span className="checkbox-text">TABLE WISE DISCOUNT</span>
                            </label>
                        </div>
                    </div>

                    {/* Discount Field */}
                    <div className="apply-discount-field">
                        <label>Discount <span className="required">*</span></label>
                        <input
                            type="number"
                            value={formData.discountPercent}
                            onChange={(e) => handleChange('discountPercent', e.target.value)}
                            placeholder="Enter discount percentage"
                            min="0"
                            max="100"
                        />
                    </div>

                    {/* Folio Field */}
                    <div className="apply-discount-field">
                        <label>Folio</label>
                        <input
                            type="text"
                            value={formData.folio}
                            onChange={(e) => handleChange('folio', e.target.value)}
                            placeholder="Enter folio name"
                        />
                    </div>

                    {/* Plus Value Button */}
                    <div className="apply-discount-field">
                        <button type="button" className="discount-plus-value-btn">
                            <span className="plus-icon">+</span> Plus Value
                        </button>
                    </div>

                    {/* Comment Field */}
                    <div className="apply-discount-field">
                        <label>Comment</label>
                        <textarea
                            value={formData.comment}
                            onChange={(e) => handleChange('comment', e.target.value)}
                            placeholder="Write a comment here"
                            rows="3"
                        ></textarea>
                    </div>
                </div>

                <div className="apply-discount-footer">
                    <button 
                        className="apply-discount-cancel-btn" 
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button 
                        className="apply-discount-submit-btn" 
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Adding...' : 'Add'}
                    </button>
                </div>
            </div>
            
            {/* Success Toast */}
            {showToast && (
                <Toast 
                    message="Successful!"
                    onClose={() => setShowToast(false)}
                    type="success"
                />
            )}
        </div>
    );
};

export default ApplyDiscountSidebar;
