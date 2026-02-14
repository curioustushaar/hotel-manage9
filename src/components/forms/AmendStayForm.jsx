import { useState, useEffect } from 'react';


const AmendStayForm = ({ booking, onSubmit, onCancel }) => {
    // Helper to format date for input (YYYY-MM-DD)
    const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toISOString().split('T')[0];
    };

    // Helper to format date for display (DD MMM YYYY)
    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const [formData, setFormData] = useState({
        newCheckInDate: formatDateForInput(booking.checkInDate),
        newCheckInTime: booking.checkInTime || '14:00',
        newCheckOutDate: formatDateForInput(booking.checkOutDate),
        newCheckOutTime: booking.checkOutTime || '11:00',
        flexibleCheckout: false,
        adults: booking.numberOfGuests || 1,
        children: 0,
        ratePerNight: booking.pricePerNight || 0
    });

    const [summary, setSummary] = useState({
        nights: booking.numberOfNights || 0,
        oldTotal: booking.totalAmount || 0,
        newTotal: booking.totalAmount || 0,
        tax: 0,
        grandTotal: booking.totalAmount || 0,
        difference: 0
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calculate totals when inputs change
    useEffect(() => {
        const checkIn = new Date(`${formData.newCheckInDate}T${formData.newCheckInTime}`);
        const checkOut = new Date(`${formData.newCheckOutDate}T${formData.newCheckOutTime}`);

        if (checkIn && checkOut && !isNaN(checkIn) && !isNaN(checkOut)) {
            // Calculate nights (minimum 1)
            let diffDays = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            if (diffDays < 1) diffDays = 1;

            const roomRate = parseFloat(formData.ratePerNight) || 0;
            const newTotalBase = roomRate * diffDays;

            // Simple tax calculation (e.g. 12% standard) - adjust as per business logic
            // For now assuming the rate includes tax or tax is added on top. 
            // Let's assume tax is 12% on top for calculation display
            const taxAmount = Math.round(newTotalBase * 0.12);
            const newGrandTotal = newTotalBase + taxAmount;

            const oldGrandTotal = booking.totalAmount || 0;

            setSummary({
                nights: diffDays,
                oldTotal: oldGrandTotal, // This might be compared to newGrandTotal
                newTotal: newTotalBase, // Base amount
                tax: taxAmount,
                grandTotal: newGrandTotal,
                difference: newGrandTotal - oldGrandTotal
            });
        }
    }, [formData.newCheckInDate, formData.newCheckInTime, formData.newCheckOutDate, formData.newCheckOutTime, formData.ratePerNight, booking.totalAmount]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCounter = (field, change) => {
        setFormData(prev => ({
            ...prev,
            [field]: Math.max(0, prev[field] + change)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Include summary data for backend processing
            await onSubmit({
                ...formData,
                ...summary,
                reason: "User Amendment" // Or add a reason field if strictly required
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Header Information */}
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Amend Stay</h2>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span className="font-medium mr-2">{booking.bookingId || 'RES-001'}</span>
                        <span className="mx-2">|</span>
                        <span className="font-bold text-gray-800">{booking.guestName}</span>
                    </div>
                </div>

                {/* Current Stay Details Box */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center mb-3">
                        <span className="text-gray-500 mr-2">📅</span>
                        <h3 className="text-sm font-semibold text-gray-700">Current Stay Details</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                        <div className="text-gray-600">Check-in:</div>
                        <div className="font-medium text-gray-900">
                            {formatDateDisplay(booking.checkInDate)} <span className="text-gray-500 ml-1">{booking.checkInTime}</span>
                        </div>

                        <div className="text-gray-600">Check-out:</div>
                        <div className="font-medium text-gray-900">
                            {formatDateDisplay(booking.checkOutDate)} <span className="text-gray-500 ml-1">{booking.checkOutTime}</span>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center text-sm">
                        <span className="text-gray-600">Nights:</span>
                        <span className="font-bold text-gray-900">{booking.numberOfNights}</span>
                    </div>
                </div>

                {/* New Dates Selection */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">New Check-in Date</label>
                        <input
                            type="date"
                            name="newCheckInDate"
                            value={formData.newCheckInDate}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm font-medium"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">New Check-out Time</label>
                        <div className="flex">
                            <input
                                type="time"
                                name="newCheckOutTime"
                                value={formData.newCheckOutTime}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Date Display & Flexible Checkout */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white border border-gray-200 rounded flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-800">{formatDateDisplay(formData.newCheckInDate)}</span>
                        <span className="text-xs text-gray-500">{formData.newCheckInTime} &gt;</span>
                    </div>
                    <div className="p-3 bg-white border border-gray-200 rounded flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-800">{formatDateDisplay(formData.newCheckOutDate)}</span>
                        <span className="text-xs text-gray-500">{formData.newCheckOutTime} &gt;</span>
                    </div>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="flexibleCheckout"
                        name="flexibleCheckout"
                        checked={formData.flexibleCheckout}
                        onChange={handleChange}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="flexibleCheckout" className="ml-2 block text-sm text-gray-700">
                        Flexible Checkout
                    </label>
                </div>

                {/* Occupancy Counters */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Adults:</label>
                        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                            <button type="button" onClick={() => handleCounter('adults', -1)} className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border-r border-gray-300 text-gray-600 font-bold">-</button>
                            <div className="flex-1 text-center font-bold text-gray-800">{formData.adults}</div>
                            <button type="button" onClick={() => handleCounter('adults', 1)} className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border-l border-gray-300 text-gray-600 font-bold">+</button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Children:</label>
                        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                            <button type="button" onClick={() => handleCounter('children', -1)} className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border-r border-gray-300 text-gray-600 font-bold">-</button>
                            <div className="flex-1 text-center font-bold text-gray-800">{formData.children}</div>
                            <button type="button" onClick={() => handleCounter('children', 1)} className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border-l border-gray-300 text-gray-600 font-bold">+</button>
                        </div>
                    </div>
                </div>

                {/* Rate Per Night */}
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Rate per Night</label>
                    <div className="flex items-center border border-gray-300 rounded px-3 py-2 bg-gray-50">
                        <span className="text-gray-500 font-medium">₹</span>
                        <input
                            type="number"
                            name="ratePerNight"
                            value={formData.ratePerNight}
                            onChange={handleChange}
                            className="w-full bg-transparent border-none focus:ring-0 text-right font-bold text-gray-900 outline-none"
                        />
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mt-4">
                    <div className="grid grid-cols-2 gap-y-2 text-sm mb-3 border-b border-gray-200 pb-3">
                        <div className="text-gray-600">Old Total:</div>
                        <div className="text-right font-medium text-gray-500">
                            {summary.oldTotal ? `₹${summary.oldTotal.toLocaleString('en-IN')}` : '-'}
                        </div>

                        <div className="text-gray-600">New Total:</div>
                        <div className="text-right font-bold text-gray-800">
                            ₹{summary.grandTotal.toLocaleString('en-IN')}
                        </div>

                        <div className="text-gray-600">Difference:</div>
                        <div className={`text-right font-bold ${summary.difference > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                            {summary.difference > 0 ? '+' : ''}₹{summary.difference.toLocaleString('en-IN')}
                        </div>

                        <div className="text-gray-600">Updated Tax:</div>
                        <div className="text-right font-bold text-gray-800">
                            ₹{summary.tax.toLocaleString('en-IN')}
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-sm pt-1">
                        <span className="font-bold text-gray-800">Updated Grand Total:</span>
                        <span className="font-extrabold text-lg text-gray-900">₹{summary.grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                </div>

            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-200 flex space-x-3 bg-white">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};

export default AmendStayForm;
