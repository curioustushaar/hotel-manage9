import { useState, useEffect } from 'react';
import API_URL from '../../config/api';

const AmendStayForm = ({ booking, onSubmit, onCancel }) => {
    // Helper to format date for input (YYYY-MM-DD)
    const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        try {
            return new Date(dateStr).toISOString().split('T')[0];
        } catch (e) {
            return '';
        }
    };

    // Helper to format date for display (DD MMM YYYY)
    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const [formData, setFormData] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch fresh data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Assuming API_URL is defined elsewhere or passed as a prop/context
                // For demonstration, let's use a placeholder API_URL
                const response = await fetch(`${API_URL}/api/reservations/${booking._id || booking.id}`);
                const result = await response.json();
                if (result.success) {
                    const data = result.data;
                    setFormData({
                        newCheckInDate: formatDateForInput(data.checkInDate),
                        newCheckInTime: data.checkInTime || '14:00',
                        newCheckOutDate: formatDateForInput(data.checkOutDate),
                        newCheckOutTime: data.checkOutTime || '11:00',
                        flexibleCheckout: !!data.flexibleCheckout,
                        adults: data.adults || 1,
                        children: data.children || 0,
                        ratePerNight: data.ratePerNight || 0,
                        discount: data.discount || 0,
                        taxPercentage: data.taxPercentage || 12,
                        id: data._id
                    });

                    setSummary({
                        nights: data.nights || 0,
                        oldTotal: data.grandTotal || data.amount || 0,
                        newTotal: data.grandTotal || data.amount || 0,
                        tax: 0,
                        grandTotal: data.grandTotal || data.amount || 0,
                        difference: 0
                    });
                } else {
                    console.error("Failed to fetch booking data:", result.message);
                    // Optionally set an error state to display to the user
                }
            } catch (err) {
                console.error("Fetch error:", err);
                // Optionally set an error state to display to the user
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [booking._id, booking.id]);

    // Calculate totals when inputs change
    useEffect(() => {
        if (!formData) return; // Don't calculate until formData is loaded

        const checkIn = new Date(`${formData.newCheckInDate}T${formData.newCheckInTime}`);
        const checkOut = new Date(`${formData.newCheckOutDate}T${formData.newCheckOutTime}`);

        if (checkIn && checkOut && !isNaN(checkIn) && !isNaN(checkOut)) {
            // Calculate nights
            let diffDays = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            if (diffDays < 0) diffDays = 0; // Ensure nights is not negative

            const roomRate = parseFloat(formData.ratePerNight) || 0;
            const discountAmount = parseFloat(formData.discount) || 0;
            const taxPerc = parseFloat(formData.taxPercentage) || 0;

            const roomTotal = roomRate * diffDays;
            const taxAmount = Math.round((roomTotal * taxPerc) / 100);
            const newGrandTotal = roomTotal + taxAmount - discountAmount;

            const oldGrandTotal = booking.totalAmount || 0; // Use original booking total for comparison

            setSummary({
                nights: diffDays,
                oldTotal: oldGrandTotal,
                newTotal: roomTotal,
                tax: taxAmount,
                grandTotal: newGrandTotal,
                difference: newGrandTotal - oldGrandTotal
            });
        }
    }, [formData, booking.totalAmount]);

    if (loading || !formData || !summary) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #E11D48', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <span style={{ fontWeight: '600', color: '#64748B' }}>Fetching stay details...</span>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const validate = () => {
        const newErrors = {};
        if (!formData) return false; // Cannot validate if formData is not loaded

        const checkIn = new Date(formData.newCheckInDate);
        const checkOut = new Date(formData.newCheckOutDate);

        if (checkOut <= checkIn) {
            newErrors.checkOutDate = 'Check-out date must be after check-in date';
        }
        if (formData.adults < 1) {
            newErrors.adults = 'At least 1 adult is required';
        }
        if (summary.nights < 1) {
            newErrors.nights = 'Stay must be at least 1 night';
        }
        if (formData.ratePerNight <= 0) {
            newErrors.ratePerNight = 'Rate per night must be greater than 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
        }));

        // Clear error when field changes
        if (errors[name]) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const handleCounter = (field, change) => {
        setFormData(prev => ({
            ...prev,
            [field]: Math.max(field === 'adults' ? 1 : 0, (prev[field] || 0) + change)
        }));
    };

    const handleSaveClick = (e) => {
        e.preventDefault();
        if (validate()) {
            setShowSummaryModal(true);
        }
    };

    const handleFinalConfirm = async () => {
        setIsSubmitting(true);
        try {
            await onSubmit({
                ...formData,
                newGrandTotal: summary.grandTotal,
                nights: summary.nights,
                reason: "Stay Amendment"
            });
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
            setShowSummaryModal(false);
        }
    };

    const labelStyle = { fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '6px', display: 'block' };
    const boxStyle = { backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 14px', transition: 'all 0.2s ease' };
    const errorStyle = { color: '#EF4444', fontSize: '11px', marginTop: '4px', fontWeight: '600' };

    return (
        <>
            <form
                onSubmit={handleSaveClick}
                className="flex flex-col h-full overflow-hidden"
                style={{ backgroundColor: '#F8FAFC', color: '#1E293B' }}
            >
                <div className="flex-1 overflow-y-auto p-6" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Guest Banner */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                        <div>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', display: 'block' }}>GUEST NAME</span>
                            <span style={{ fontSize: '15px', fontWeight: '800', color: '#1E293B' }}>{booking.guestName}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', display: 'block' }}>REFERENCE</span>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748B' }}>{booking.bookingId || booking.referenceNumber || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Date Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={labelStyle}>New Check-in</label>
                            <input
                                type="date"
                                name="newCheckInDate"
                                value={formData.newCheckInDate}
                                onChange={handleChange}
                                style={{ ...boxStyle, width: '100%', fontWeight: '700' }}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>New Check-out</label>
                            <input
                                type="date"
                                name="newCheckOutDate"
                                value={formData.newCheckOutDate}
                                onChange={handleChange}
                                style={{ ...boxStyle, width: '100%', fontWeight: '700', borderColor: errors.checkOutDate ? '#EF4444' : '#E2E8F0' }}
                            />
                            {errors.checkOutDate && <div style={errorStyle}>{errors.checkOutDate}</div>}
                        </div>
                    </div>

                    {/* Occupancy Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={labelStyle}>Adults</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ ...boxStyle, flex: 1, display: 'flex', justifyContent: 'center', fontWeight: '800' }}>{formData.adults}</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <button type="button" onClick={() => handleCounter('adults', 1)} style={{ ...boxStyle, padding: '4px 8px', lineHeight: 1 }}>+</button>
                                    <button type="button" onClick={() => handleCounter('adults', -1)} style={{ ...boxStyle, padding: '4px 8px', lineHeight: 1 }}>-</button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Children</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ ...boxStyle, flex: 1, display: 'flex', justifyContent: 'center', fontWeight: '800' }}>{formData.children}</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <button type="button" onClick={() => handleCounter('children', 1)} style={{ ...boxStyle, padding: '4px 8px', lineHeight: 1 }}>+</button>
                                    <button type="button" onClick={() => handleCounter('children', -1)} style={{ ...boxStyle, padding: '4px 8px', lineHeight: 1 }}>-</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={labelStyle}>Rate per Night (₹)</label>
                            <input
                                type="number"
                                name="ratePerNight"
                                value={formData.ratePerNight}
                                onChange={handleChange}
                                style={{ ...boxStyle, width: '100%', fontWeight: '800', borderColor: errors.ratePerNight ? '#EF4444' : '#E2E8F0' }}
                            />
                            {errors.ratePerNight && <div style={errorStyle}>{errors.ratePerNight}</div>}
                        </div>
                        <div>
                            <label style={labelStyle}>Discount (₹)</label>
                            <input
                                type="number"
                                name="discount"
                                value={formData.discount}
                                onChange={handleChange}
                                style={{ ...boxStyle, width: '100%', fontWeight: '800' }}
                            />
                        </div>
                    </div>

                    {/* Checkbox */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px' }}>
                        <input
                            type="checkbox"
                            id="flexibleCheckout"
                            name="flexibleCheckout"
                            checked={formData.flexibleCheckout}
                            onChange={handleChange}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <label htmlFor="flexibleCheckout" style={{ fontSize: '13px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}>Flexible Checkout Enabled</label>
                    </div>

                    {/* Summary Card */}
                    <div style={{ backgroundColor: '#1E293B', color: '#FFFFFF', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', opacity: 0.7 }}>
                            <span>Nights: {summary.nights}</span>
                            <span>Tax ({formData.taxPercentage}%): ₹{summary.tax.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                                <span style={{ fontSize: '11px', fontWeight: '800', opacity: 0.6, display: 'block' }}>OLD GRAND TOTAL</span>
                                <span style={{ fontSize: '16px', fontWeight: '700', textDecoration: 'line-through', opacity: 0.6 }}>₹{summary.oldTotal.toLocaleString()}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '11px', fontWeight: '800', color: '#FDA4AF', display: 'block' }}>NEW GRAND TOTAL</span>
                                <span style={{ fontSize: '24px', fontWeight: '900', color: '#FFFFFF' }}>₹{summary.grandTotal.toLocaleString()}</span>
                            </div>
                        </div>
                        <div style={{ paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '12px', fontWeight: '700' }}>Balance Difference:</span>
                            <span style={{ fontSize: '14px', fontWeight: '900', color: summary.difference >= 0 ? '#4ADE80' : '#F87171' }}>
                                {summary.difference >= 0 ? '+' : ''}{summary.difference.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div style={{ padding: '20px 24px', backgroundColor: '#FFFFFF', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '12px' }}>
                    <button type="button" onClick={onCancel} style={{ flex: 1, padding: '14px', backgroundColor: '#F1F5F9', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', color: '#64748B' }}>Cancel</button>
                    <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '14px', backgroundColor: '#E11D48', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', color: '#FFFFFF', boxShadow: '0 4px 12px rgba(225, 29, 72, 0.2)' }}>
                        Save Changes
                    </button>
                </div>
            </form>

            {/* Change Summary Modal Overlay */}
            {showSummaryModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', width: '100%', maxWidth: '400px', padding: '32px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: '#1E293B' }}>Confirm Changes</h3>
                        <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px' }}>Please review the stay amendment before saving.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9' }}>
                                <span style={{ fontSize: '13px', fontWeight: '700', color: '#94A3B8' }}>Stay Duration</span>
                                <span style={{ fontSize: '13px', fontWeight: '800' }}>{booking.numberOfNights} → {summary.nights} Nights</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9' }}>
                                <span style={{ fontSize: '13px', fontWeight: '700', color: '#94A3B8' }}>Grand Total</span>
                                <span style={{ fontSize: '13px', fontWeight: '800' }}>₹{summary.oldTotal.toLocaleString()} → ₹{summary.grandTotal.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '14px', fontWeight: '800', color: '#1E293B' }}>Net Difference</span>
                                <span style={{ fontSize: '18px', fontWeight: '900', color: summary.difference >= 0 ? '#10B981' : '#EF4444' }}>
                                    {summary.difference >= 0 ? '+' : ''}₹{Math.abs(summary.difference).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setShowSummaryModal(false)} style={{ flex: 1, padding: '14px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '14px', fontWeight: '700', color: '#64748B' }}>Go Back</button>
                            <button onClick={handleFinalConfirm} disabled={isSubmitting} style={{ flex: 1, padding: '14px', backgroundColor: '#1E293B', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', color: '#FFFFFF' }}>
                                {isSubmitting ? 'Saving...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AmendStayForm;


