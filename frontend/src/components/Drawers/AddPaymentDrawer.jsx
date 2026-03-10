import React, { useState } from 'react';
import BaseDrawer from './BaseDrawer';
import { useSettings } from '../../context/SettingsContext';

const AddPaymentDrawer = ({ isOpen, onClose, reservation }) => {
    const { getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();
    const [formData, setFormData] = useState({
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        amount: '',
        referenceId: '',
        comment: ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.amount || formData.amount <= 0) {
            newErrors.amount = 'Valid amount is required';
        }
        if (['Card', 'UPI', 'Bank'].includes(formData.paymentMethod) && !formData.referenceId) {
            newErrors.referenceId = 'Reference ID is required for this payment method';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            console.log('Payment data:', formData);
            // API call to add payment
            // Update paid amount
            // Recalculate balance
            // Generate receipt
            onClose();
        } catch (error) {
            console.error('Payment error:', error);
        }
    };

    return (
        <BaseDrawer isOpen={isOpen} onClose={onClose} title="Add Payment" size="sm">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Payment Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        value={formData.paymentDate}
                        onChange={(e) => handleChange('paymentDate', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>

                {/* Payment Method */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.paymentMethod}
                        onChange={(e) => handleChange('paymentMethod', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                        <option value="UPI">UPI</option>
                        <option value="Bank">Bank Transfer</option>
                    </select>
                </div>

                {/* Amount */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                            {cs}
                        </span>
                        <input
                            type="number"
                            value={formData.amount}
                            onChange={(e) => handleChange('amount', e.target.value)}
                            placeholder="0.00"
                            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.amount ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                    </div>
                    {errors.amount && (
                        <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                    )}
                </div>

                {/* Reference ID (conditional) */}
                {['Card', 'UPI', 'Bank'].includes(formData.paymentMethod) && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reference ID / Transaction ID <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.referenceId}
                            onChange={(e) => handleChange('referenceId', e.target.value)}
                            placeholder="Enter reference number"
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.referenceId ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.referenceId && (
                            <p className="text-red-500 text-sm mt-1">{errors.referenceId}</p>
                        )}
                    </div>
                )}

                {/* Comment */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comment (Optional)
                    </label>
                    <textarea
                        value={formData.comment}
                        onChange={(e) => handleChange('comment', e.target.value)}
                        rows="3"
                        placeholder="Add any notes..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    />
                </div>

                {/* Summary Box */}
                {reservation && (
                    <div className="bg-gradient-to-r from-red-50 to-white p-4 rounded-lg border border-red-200">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Total Amount:</span>
                            <span className="font-semibold">{cs} {reservation.totalAmount || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Already Paid:</span>
                            <span className="font-semibold text-green-600">{cs} {reservation.paidAmount || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">This Payment:</span>
                            <span className="font-semibold text-primary-600">{cs} {formData.amount || 0}</span>
                        </div>
                        <div className="border-t border-red-200 pt-2 mt-2">
                            <div className="flex justify-between text-base font-bold">
                                <span>Remaining Balance:</span>
                                <span className="text-red-600">
                                    {cs} {(reservation.totalAmount || 0) - (reservation.paidAmount || 0) - (parseFloat(formData.amount) || 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-3 bg-white border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg"
                    >
                        Add Payment
                    </button>
                </div>
            </form>
        </BaseDrawer>
    );
};

export default AddPaymentDrawer;
