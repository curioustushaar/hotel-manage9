import React, { useState } from 'react';
import BaseDrawer from './BaseDrawer';

const CheckInDrawer = ({ isOpen, onClose, reservation }) => {
    const [formData, setFormData] = useState({
        arrivalDate: new Date().toISOString().split('T')[0],
        checkInTime: new Date().toTimeString().slice(0, 5),
        idProofType: 'Aadhaar',
        idNumber: '',
        adults: 1,
        children: 0,
        vehicleNumber: '',
        securityDeposit: '',
        remarks: ''
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
        if (!formData.idNumber) newErrors.idNumber = 'ID Number is required';
        if (formData.adults < 1) newErrors.adults = 'At least 1 adult required';
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
            // API call to check-in
            console.log('Check-in data:', formData);
            // Update reservation status to CHECKED_IN
            // Update room status to OCCUPIED
            // Add audit trail entry
            onClose();
        } catch (error) {
            console.error('Check-in error:', error);
        }
    };

    return (
        <BaseDrawer isOpen={isOpen} onClose={onClose} title="Check-In Guest" size="sm">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Arrival Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Arrival Date
                        </label>
                        <input
                            type="date"
                            value={formData.arrivalDate}
                            onChange={(e) => handleChange('arrivalDate', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Check-In Time
                        </label>
                        <input
                            type="time"
                            value={formData.checkInTime}
                            onChange={(e) => handleChange('checkInTime', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* ID Proof */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ID Proof Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.idProofType}
                            onChange={(e) => handleChange('idProofType', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="Aadhaar">Aadhaar Card</option>
                            <option value="Passport">Passport</option>
                            <option value="Driving License">Driving License</option>
                            <option value="PAN Card">PAN Card</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ID Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.idNumber}
                            onChange={(e) => handleChange('idNumber', e.target.value)}
                            placeholder="Enter ID number"
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.idNumber ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.idNumber && (
                            <p className="text-red-500 text-sm mt-1">{errors.idNumber}</p>
                        )}
                    </div>
                </div>

                {/* Number of Guests */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Adults <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={formData.adults}
                            onChange={(e) => handleChange('adults', parseInt(e.target.value))}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Children
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={formData.children}
                            onChange={(e) => handleChange('children', parseInt(e.target.value))}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Vehicle Number */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Number (Optional)
                    </label>
                    <input
                        type="text"
                        value={formData.vehicleNumber}
                        onChange={(e) => handleChange('vehicleNumber', e.target.value.toUpperCase())}
                        placeholder="e.g., DL01AB1234"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent uppercase"
                    />
                </div>

                {/* Security Deposit */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Security Deposit (Optional)
                    </label>
                    <input
                        type="number"
                        value={formData.securityDeposit}
                        onChange={(e) => handleChange('securityDeposit', e.target.value)}
                        placeholder="₹ 0"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>

                {/* Remarks */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Remarks (Optional)
                    </label>
                    <textarea
                        value={formData.remarks}
                        onChange={(e) => handleChange('remarks', e.target.value)}
                        rows="3"
                        placeholder="Any special notes..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    />
                </div>

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
                        className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg"
                    >
                        Check-In
                    </button>
                </div>
            </form>
        </BaseDrawer>
    );
};

export default CheckInDrawer;
