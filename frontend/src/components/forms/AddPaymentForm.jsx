import { useState, useMemo } from 'react';
import { useSettings } from '../../context/SettingsContext';

const AddPaymentForm = ({ booking, onSubmit, onCancel }) => {
    const { settings, getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();

    // Build payment modes from Company Settings
    const availableModes = useMemo(() => {
        const modes = [];
        const pm = settings.paymentModes || {};
        if (pm.cash !== false) modes.push('Cash');
        if (pm.card) modes.push('Card');
        if (pm.upi) modes.push('UPI');
        if (pm.bankTransfer) modes.push('Bank Transfer');
        if (pm.cheque) modes.push('Cheque');
        if (modes.length === 0) modes.push('Cash', 'Card', 'UPI', 'Bank Transfer');
        return modes;
    }, [settings.paymentModes]);

    const [formData, setFormData] = useState({
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: availableModes[0] || 'Cash',
        amount: '',
        referenceId: '',
        comment: ''
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
        const amt = parseFloat(formData.amount);
        if (!formData.amount || isNaN(amt) || amt <= 0) newErrors.amount = 'Enter a valid positive amount';
        if (['Card', 'UPI', 'Bank Transfer', 'Cheque'].includes(formData.paymentMethod) && !formData.referenceId.trim()) {
            newErrors.referenceId = 'Reference ID required for this payment method';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            await onSubmit({
                ...formData,
                amount: Math.abs(parseFloat(formData.amount))
            });
        } catch { /* handled by parent */ } finally {
            setIsSubmitting(false);
        }
    };

    const balance = booking.remainingAmount || ((booking.totalAmount || 0) - (booking.advancePaid || 0));

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Booking Info Banner */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <p className="text-[11px] text-gray-400 uppercase tracking-wide">Reservation</p>
                            <p className="text-base font-bold text-gray-900">{booking.bookingId || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] text-gray-400">Balance Due</p>
                            <p className="text-base font-bold text-red-600">{cs}{(balance || 0).toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[12px] border-t border-gray-200 pt-2">
                        <div><span className="text-gray-400">Guest</span><p className="font-semibold truncate">{booking.guestName || 'N/A'}</p></div>
                        <div><span className="text-gray-400">Total</span><p className="font-semibold">{cs}{(booking.totalAmount || 0).toLocaleString('en-IN')}</p></div>
                        <div><span className="text-gray-400">Paid</span><p className="font-semibold text-green-600">{cs}{(booking.advancePaid || 0).toLocaleString('en-IN')}</p></div>
                    </div>
                </div>

                {/* Payment Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date <span className="text-red-500">*</span></label>
                    <input type="date" name="paymentDate" value={formData.paymentDate} onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none" />
                </div>

                {/* Payment Method — from Company Settings */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 gap-2">
                        {availableModes.map(mode => (
                            <button key={mode} type="button" onClick={() => { setFormData(prev => ({ ...prev, paymentMethod: mode })); setErrors(prev => ({ ...prev, referenceId: '' })); }}
                                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${formData.paymentMethod === mode
                                    ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-white text-gray-700 border-gray-300 hover:border-red-300'}`}>
                                {mode === 'Cash' ? '💵' : mode === 'Card' ? '💳' : mode === 'UPI' ? '📱' : mode === 'Bank Transfer' ? '🏦' : '📝'} {mode}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Amount */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount ({cs}) <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-400 text-sm">{cs}</span>
                        <input type="number" name="amount" value={formData.amount} onChange={handleChange} min="1" step="0.01"
                            placeholder="0.00"
                            className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none ${errors.amount ? 'border-red-400' : 'border-gray-300'}`} />
                    </div>
                    {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                    {balance > 0 && <button type="button" onClick={() => setFormData(prev => ({ ...prev, amount: String(balance) }))}
                        className="text-xs text-red-600 mt-1 hover:underline">Pay full balance: {cs}{balance.toLocaleString('en-IN')}</button>}
                </div>

                {/* Reference ID — conditional */}
                {['Card', 'UPI', 'Bank Transfer', 'Cheque'].includes(formData.paymentMethod) && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reference / Transaction ID <span className="text-red-500">*</span></label>
                        <input type="text" name="referenceId" value={formData.referenceId} onChange={handleChange}
                            placeholder="Transaction ID / Ref No"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none ${errors.referenceId ? 'border-red-400' : 'border-gray-300'}`} />
                        {errors.referenceId && <p className="text-red-500 text-xs mt-1">{errors.referenceId}</p>}
                    </div>
                )}

                {/* Comment */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                    <textarea name="comment" value={formData.comment} onChange={handleChange}
                        placeholder="Add a note (optional)" rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none" />
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
                    {isSubmitting ? 'Processing...' : '💳 Add Payment'}
                </button>
            </div>
        </form>
    );
};

export default AddPaymentForm;
