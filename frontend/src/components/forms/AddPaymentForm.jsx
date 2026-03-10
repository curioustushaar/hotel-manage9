import { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';

const AddPaymentForm = ({ booking, onSubmit, onCancel }) => {
    const { getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();
    const [formData, setFormData] = useState({
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        amount: '',
        referenceId: '',
        comment: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        // ... (Keep logic)
        e.preventDefault();
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            alert('Please enter a valid payment amount');
            return;
        }
        if (['Card', 'UPI', 'Bank Transfer'].includes(formData.paymentMethod) && !formData.referenceId.trim()) {
            alert('Reference ID is required for Card/UPI/Bank Transfer payments');
            return;
        }
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 h-full flex flex-col">
            <div className="flex-1 space-y-5 overflow-y-auto">
                {/* Reservation Number */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reservation No :
                    </label>
                    <div className="text-lg font-bold text-gray-900">
                        {booking.bookingId || 'RES-51'}
                    </div>
                </div>

                {/* Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        name="paymentDate"
                        value={formData.paymentDate}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                        required
                    />
                </div>

                {/* Method */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Method <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white"
                        required
                    >
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                        <option value="UPI">UPI</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                </div>

                {/* Amount */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount ({cs}) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">{cs}</span>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            min="1"
                            step="0.01"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                            placeholder="0.00"
                            required
                        />
                    </div>
                </div>

                {/* Reference ID (Conditional) */}
                {['Card', 'UPI', 'Bank Transfer'].includes(formData.paymentMethod) && (
                    <div className="animate-fade-in">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reference ID <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="referenceId"
                            value={formData.referenceId}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                            placeholder="Transaction ID / Ref No"
                            required
                        />
                    </div>
                )}

                {/* Comment */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Comment
                    </label>
                    <textarea
                        name="comment"
                        value={formData.comment}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                        placeholder="Add a note (optional)"
                        rows="3"
                    />
                </div>
            </div>

            {/* Footer Action */}
            <div className="mt-auto pt-6 border-t border-gray-100">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full px-6 py-3 rounded-lg font-semibold text-white shadow-lg transition-all transform active:scale-95 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                        }`}
                >
                    {isSubmitting ? 'Processing...' : 'Add Payment'}
                </button>
            </div>
        </form>
    );
};

export default AddPaymentForm;
