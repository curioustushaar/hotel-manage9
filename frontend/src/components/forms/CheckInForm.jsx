import { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import './FormStyles.css';

const CheckInForm = ({ booking, onSubmit, onCancel }) => {
    const { getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();

    const [formData, setFormData] = useState({
        actualCheckInDate: new Date().toISOString().split('T')[0],
        actualCheckInTime: new Date().toTimeString().slice(0, 5),
        idProofType: booking.idProofType || 'Aadhaar',
        idProofNumber: booking.idProofNumber || '',
        numberOfAdults: booking.numberOfAdults || booking.numberOfGuests || 1,
        numberOfChildren: booking.numberOfChildren || booking.childrenCount || 0,
        vehicleNumber: '',
        securityDeposit: 0,
        checkInRemarks: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.actualCheckInDate) newErrors.actualCheckInDate = 'Date is required';
        if (!formData.actualCheckInTime) newErrors.actualCheckInTime = 'Time is required';
        if (!formData.idProofNumber.trim()) newErrors.idProofNumber = 'ID number is required';
        if (parseInt(formData.numberOfAdults) < 1) newErrors.numberOfAdults = 'At least 1 adult required';
        if (parseFloat(formData.securityDeposit) < 0) newErrors.securityDeposit = 'Cannot be negative';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await onSubmit({
                arrivalDate: formData.actualCheckInDate,
                checkInTime: formData.actualCheckInTime,
                idProofType: formData.idProofType,
                idNumber: formData.idProofNumber,
                adults: parseInt(formData.numberOfAdults, 10),
                children: parseInt(formData.numberOfChildren, 10),
                vehicleNumber: formData.vehicleNumber,
                securityDeposit: Math.abs(parseFloat(formData.securityDeposit) || 0),
                remarks: formData.checkInRemarks
            });
        } catch (error) {
            // handled by BookingActionsManager
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="flex flex-col h-full" onSubmit={handleSubmit} noValidate>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Guest Banner */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-[11px] text-gray-400 uppercase tracking-wide">Guest</p>
                            <p className="text-base font-bold text-gray-900">{booking.guestName || 'Guest'}</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700">
                            {booking.status || 'Reserved'}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[12px] border-t border-gray-200 pt-2">
                        <div><span className="text-gray-400">Room</span><p className="font-semibold">{booking.roomNumber || 'TBA'} ({booking.roomType || 'Std'})</p></div>
                        <div><span className="text-gray-400">Reservation</span><p className="font-semibold">{booking.bookingId || 'N/A'}</p></div>
                    </div>
                </div>

                {/* Check-In Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Date <span className="text-red-500">*</span></label>
                        <input type="date" name="actualCheckInDate" value={formData.actualCheckInDate} onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-red-500 ${errors.actualCheckInDate ? 'border-red-400' : 'border-gray-300'}`} />
                        {errors.actualCheckInDate && <p className="text-red-500 text-xs mt-1">{errors.actualCheckInDate}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Check-In Time <span className="text-red-500">*</span></label>
                        <input type="time" name="actualCheckInTime" value={formData.actualCheckInTime} onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-red-500 ${errors.actualCheckInTime ? 'border-red-400' : 'border-gray-300'}`} />
                        {errors.actualCheckInTime && <p className="text-red-500 text-xs mt-1">{errors.actualCheckInTime}</p>}
                    </div>
                </div>

                {/* ID Proof */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">🪪 Identity Verification</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ID Type <span className="text-red-500">*</span></label>
                            <select name="idProofType" value={formData.idProofType} onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white focus:ring-2 focus:ring-red-500">
                                <option value="Aadhaar">Aadhaar Card</option>
                                <option value="Passport">Passport</option>
                                <option value="Driving License">Driving License</option>
                                <option value="PAN Card">PAN Card</option>
                                <option value="Voter ID">Voter ID</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ID Number <span className="text-red-500">*</span></label>
                            <input type="text" name="idProofNumber" value={formData.idProofNumber} onChange={handleChange}
                                placeholder="Enter ID number"
                                className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-red-500 ${errors.idProofNumber ? 'border-red-400' : 'border-gray-300'}`} />
                            {errors.idProofNumber && <p className="text-red-500 text-xs mt-1">{errors.idProofNumber}</p>}
                        </div>
                    </div>
                </div>

                {/* Occupancy */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Adults <span className="text-red-500">*</span></label>
                        <input type="number" name="numberOfAdults" value={formData.numberOfAdults} onChange={handleChange}
                            min="1" max="20"
                            className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-red-500 ${errors.numberOfAdults ? 'border-red-400' : 'border-gray-300'}`} />
                        {errors.numberOfAdults && <p className="text-red-500 text-xs mt-1">{errors.numberOfAdults}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
                        <input type="number" name="numberOfChildren" value={formData.numberOfChildren} onChange={handleChange}
                            min="0" max="20"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                </div>

                {/* Vehicle & Deposit */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                        <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange}
                            placeholder="e.g. DL01AB1234"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit ({cs})</label>
                        <input type="number" name="securityDeposit" value={formData.securityDeposit} onChange={handleChange}
                            min="0" step="0.01"
                            className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-red-500 ${errors.securityDeposit ? 'border-red-400' : 'border-gray-300'}`} />
                        {errors.securityDeposit && <p className="text-red-500 text-xs mt-1">{errors.securityDeposit}</p>}
                    </div>
                </div>

                {/* Remarks */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                    <textarea name="checkInRemarks" value={formData.checkInRemarks} onChange={handleChange}
                        placeholder="Any special notes (optional)" rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 resize-none" />
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 flex gap-3">
                <button type="button" onClick={onCancel} disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-white transition-all"
                    style={{ background: isSubmitting ? '#9ca3af' : 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
                    {isSubmitting ? 'Checking In...' : '✓ Check-In'}
                </button>
            </div>
        </form>
    );
};

export default CheckInForm;
