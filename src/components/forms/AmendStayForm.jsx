import { useState, useEffect } from 'react';

const AmendStayForm = ({ booking, onSubmit, onCancel }) => {
    // Helper to format date for input
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toISOString().split('T')[0];
    };

    const [formData, setFormData] = useState({
        newCheckInDate: formatDate(booking.checkInDate),
        newCheckOutDate: formatDate(booking.checkOutDate),
        numberOfNights: booking.numberOfNights || 0,
        reason: '',
        rateChange: false,
        newRate: booking.pricePerNight || 0
    });

    const [summary, setSummary] = useState({
        oldTotal: booking.totalAmount || 0,
        newTotal: booking.totalAmount || 0,
        difference: 0
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const checkIn = new Date(formData.newCheckInDate);
        const checkOut = new Date(formData.newCheckOutDate);

        if (checkIn && checkOut && !isNaN(checkIn) && !isNaN(checkOut)) {
            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

            if (nights > 0) {
                const rate = formData.rateChange ? parseFloat(formData.newRate) : (booking.pricePerNight || 0);
                const newTotal = rate * nights;
                const oldTotal = booking.totalAmount || 0;

                setSummary({
                    oldTotal,
                    newTotal,
                    difference: newTotal - oldTotal,
                    nights
                });
            }
        }
    }, [formData.newCheckInDate, formData.newCheckOutDate, formData.rateChange, formData.newRate, booking.pricePerNight, booking.totalAmount]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.reason.trim()) {
            alert('Reason for amendment is required');
            return;
        }

        if (summary.nights <= 0) {
            alert('Invalid date range selected');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({ ...formData, ...summary });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 h-full flex flex-col">
            <div className="flex-1 space-y-5 overflow-y-auto">
                {/* Reservation Number */}
                <div className="pb-2 border-b border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reservation No :
                    </label>
                    <div className="text-lg font-bold text-gray-900">
                        {booking.bookingId || 'RES-51'}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Arrival */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Arrival Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="newCheckInDate"
                            value={formData.newCheckInDate}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                            required
                        />
                    </div>

                    {/* Departure */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Departure Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="newCheckOutDate"
                            value={formData.newCheckOutDate}
                            onChange={handleChange}
                            min={formData.newCheckInDate}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                            required
                        />
                    </div>
                </div>

                {/* Rate Change Toggle */}
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="rateChange"
                        name="rateChange"
                        checked={formData.rateChange}
                        onChange={handleChange}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label htmlFor="rateChange" className="text-sm font-medium text-gray-700">
                        Change Nightly Rate?
                    </label>
                </div>

                {/* New Rate */}
                {formData.rateChange && (
                    <div className="animate-fade-in">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Rate (₹/night) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="newRate"
                            value={formData.newRate}
                            onChange={handleChange}
                            min="1"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                            required
                        />
                    </div>
                )}

                {/* Summary Card */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-2">Cost Summary</h4>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Old Total:</span>
                        <span className="font-medium">₹{summary.oldTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">New Total ({summary.nights || 0} nights):</span>
                        <span className="font-medium">₹{summary.newTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                        <span className="font-bold text-gray-700">Difference:</span>
                        <span className={`font-bold ${summary.difference > 0 ? 'text-green-600' : (summary.difference < 0 ? 'text-red-600' : 'text-gray-600')}`}>
                            {summary.difference > 0 ? '+' : ''}₹{summary.difference.toLocaleString('en-IN')}
                        </span>
                    </div>
                </div>

                {/* Reason */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for Amendment <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        placeholder="Why is the stay being amended?"
                        rows="3"
                        required
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-6 border-t border-gray-100">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full px-6 py-3 rounded-lg font-semibold text-white shadow-lg transition-all transform active:scale-95 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                        }`}
                >
                    {isSubmitting ? 'Updating...' : '📅 Amend Stay'}
                </button>
            </div>
        </form>
    );
};

export default AmendStayForm;
