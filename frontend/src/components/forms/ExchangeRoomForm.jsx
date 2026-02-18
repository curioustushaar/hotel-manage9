import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Calendar, ChevronRight, X, LayoutGrid, CheckCircle2 } from 'lucide-react';
import API_URL from '../../config/api';

const ExchangeRoomForm = ({ booking: initialBooking, onSubmit, onCancel }) => {
    const [reservation, setReservation] = useState(null);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        targetCategory: '',
        newRoomId: '',
        reason: '',
        effectiveDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const fetchReservation = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/reservations/${initialBooking._id || initialBooking.id}`);
                const data = res.data.data;
                setReservation(data);

                const roomsResp = await axios.get(`${API_URL}/api/rooms/available?from=${data.checkInDate}&to=${data.checkOutDate}`);
                setAvailableRooms(roomsResp.data.data || []);
            } catch (err) {
                console.error('Error fetching data:', err);
                alert('Failed to load reservation details');
            } finally {
                setLoading(false);
            }
        };

        if (initialBooking?._id || initialBooking?.id) {
            fetchReservation();
        }
    }, [initialBooking]);

    const categories = useMemo(() => {
        const uniqueCats = [...new Set(availableRooms.map(r => r.roomType))];
        return uniqueCats.sort();
    }, [availableRooms]);

    const adjustment = useMemo(() => {
        if (!formData.newRoomId || !reservation) return { total: 0, diff: 0, nights: 0, oldTotal: reservation?.grandTotal || 0 };

        const oldPrice = reservation.ratePerNight || 0;
        const selectedRoom = availableRooms.find(r => r._id === formData.newRoomId);
        const newPrice = selectedRoom ? selectedRoom.price : 0;
        const diff = newPrice - oldPrice;

        const checkOutDate = new Date(reservation.checkOutDate);
        const effectiveDate = new Date(formData.effectiveDate);
        effectiveDate.setHours(0, 0, 0, 0);
        checkOutDate.setHours(0, 0, 0, 0);

        const remainingNights = Math.max(0, Math.ceil((checkOutDate - effectiveDate) / (1000 * 60 * 60 * 24)));
        return {
            diff,
            nights: remainingNights,
            total: diff * remainingNights,
            newPrice,
            oldTotal: reservation.grandTotal || 0, // Fallback if grandTotal is missing
            remainingNights // Exposed directly for UI if needed separately
        };
    }, [formData.newRoomId, formData.effectiveDate, reservation, availableRooms]);

    const remainingNightsCurrent = useMemo(() => {
        if (!reservation) return 0;
        const checkOutDate = new Date(reservation.checkOutDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        checkOutDate.setHours(0, 0, 0, 0);
        return Math.max(0, Math.ceil((checkOutDate - today) / (1000 * 60 * 60 * 24)));
    }, [reservation]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'targetCategory') {
            setFormData(prev => ({ ...prev, [name]: value, newRoomId: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const confirmExchange = async (e) => {
        e.preventDefault();
        if (!formData.newRoomId) return;

        const effective = new Date(formData.effectiveDate);
        const checkOut = new Date(reservation.checkOutDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (effective < today) return alert('Effective date cannot be in the past');
        if (effective > checkOut) return alert('Effective date cannot be after checkout');

        const selectedRoom = availableRooms.find(r => r._id === formData.newRoomId);
        if (selectedRoom && selectedRoom.roomNumber === reservation.roomNumber) {
            return alert('Cannot exchange to the same room');
        }

        setIsSubmitting(true);
        try {
            const response = await axios.put(`${API_URL}/api/reservations/${reservation._id}/exchange-room`, {
                newRoomId: formData.newRoomId,
                newRoomNumber: selectedRoom.roomNumber, // Send number for safety
                reason: formData.reason,
                effectiveDate: formData.effectiveDate
            });

            if (response.data.success) {
                await onSubmit(response.data.data);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Error processing exchange');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-400">Loading details...</div>;
    if (!reservation) return <div className="p-10 text-center text-red-500">Stay record not found</div>;

    const filteredRooms = formData.targetCategory
        ? availableRooms.filter(r => r.roomType === formData.targetCategory)
        : [];

    const selectedRoomDetails = availableRooms.find(r => r._id === formData.newRoomId);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            backgroundColor: '#ffffff',
            fontFamily: "'Outfit', 'Inter', sans-serif",
            margin: '-20px'
        }}>
            {/* REF & GUEST Row */}
            <div style={{
                padding: '12px 24px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                color: '#64748b',
                fontWeight: '500'
            }}>
                <span style={{ color: '#94a3b8' }}>{reservation.reservationId || 'REF-XXXX'}</span>
                <span style={{ color: '#e2e8f0' }}>|</span>
                <span style={{ color: '#1e293b', fontWeight: '700' }}>{reservation.guestName}</span>
            </div>

            <form onSubmit={confirmExchange} style={{
                flex: 1,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                overflowY: 'auto'
            }}>
                {/* Current Room Details Card */}
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    border: '1px solid #f1f5f9',
                    overflow: 'hidden',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}>
                    <div style={{
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        backgroundColor: '#f8fafc',
                        borderBottom: '1px solid #e2e8f0',
                        color: '#64748b',
                        fontWeight: '600',
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        <LayoutGrid size={16} />
                        Current Room Details:
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {/* Room Number & Category Row */}
                        <div style={{
                            display: 'flex',
                            padding: '16px',
                            borderBottom: '1px solid #f1f5f9',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', gap: '6px', fontSize: '15px', color: '#475569', fontWeight: '500' }}>
                                Room <span style={{ fontWeight: '700', color: '#0f172a' }}>{reservation.roomNumber || '---'}</span>
                            </div>
                            <div style={{ fontSize: '15px', fontWeight: '600', color: '#334155' }}>
                                {reservation.roomType || 'Standard'}
                            </div>
                        </div>

                        {/* Rate Row */}
                        <div style={{
                            display: 'flex',
                            padding: '16px',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: '#fff'
                        }}>
                            <div style={{ fontSize: '15px', color: '#475569', fontWeight: '500' }}>Rate per Night</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '15px' }}>
                                    ₹{reservation.ratePerNight?.toLocaleString() || '0'}
                                </span>
                                <ChevronRight size={16} color="#cbd5e1" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Exchange To Card */}
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    border: '1px solid #f1f5f9',
                    overflow: 'hidden',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}>
                    {/* Category Selector Row */}
                    <div style={{
                        position: 'relative',
                        display: 'flex',
                        padding: '16px',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid #f1f5f9'
                    }}>
                        <label style={{ fontSize: '15px', fontWeight: '700', color: '#475569' }}>Exchange To:</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '15px', fontWeight: '600', color: formData.targetCategory ? '#0f172a' : '#94a3b8' }}>
                                {formData.targetCategory || 'Select Category'}
                            </span>
                            <ChevronRight size={16} color="#cbd5e1" />
                        </div>
                        <select
                            name="targetCategory"
                            value={formData.targetCategory}
                            onChange={handleChange}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                opacity: 0,
                                cursor: 'pointer'
                            }}
                        >
                            <option value="">Select Category</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    {/* Room Selector Row */}
                    <div style={{
                        position: 'relative',
                        display: 'flex',
                        padding: '16px',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: formData.targetCategory ? '#fff' : '#f8fafc'
                    }}>
                        <label style={{ fontSize: '15px', fontWeight: '500', color: '#475569' }}>
                            Room <span style={{ fontWeight: '700', color: '#0f172a' }}>{formData.newRoomId ? selectedRoomDetails?.roomNumber : ''}</span>
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '15px', fontWeight: '600', color: formData.newRoomId ? '#0f172a' : '#94a3b8' }}>
                                {formData.newRoomId ? selectedRoomDetails?.roomType : 'Select Room'}
                            </span>
                            <ChevronRight size={16} color="#cbd5e1" />
                        </div>
                        <select
                            name="newRoomId"
                            value={formData.newRoomId}
                            onChange={handleChange}
                            disabled={!formData.targetCategory}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                opacity: 0,
                                cursor: formData.targetCategory ? 'pointer' : 'not-allowed'
                            }}
                        >
                            <option value="">Select Room</option>
                            {filteredRooms.map(room => (
                                <option key={room._id} value={room._id}>Room {room.roomNumber}</option>
                            ))}
                        </select>
                    </div>

                    {/* New Rate Row */}
                    <div style={{
                        display: 'flex',
                        padding: '16px',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <label style={{ fontSize: '15px', fontWeight: '500', color: '#64748b' }}>New Rate Per Night</label>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                            ₹{adjustment.newPrice?.toLocaleString() || '0'}
                        </div>
                    </div>
                </div>

                {/* Info Block - Corrected Text Requirement */}
                {adjustment.total !== 0 && (
                    <div style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        backgroundColor: adjustment.total > 0 ? '#fff7ed' : '#f0fdf4',
                        border: `1px solid ${adjustment.total > 0 ? '#ffedd5' : '#dcfce7'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        <CheckCircle2 size={24} color={adjustment.total > 0 ? '#f97316' : '#22c55e'} fill="#fff" />
                        <div style={{ fontSize: '13px', color: adjustment.total > 0 ? '#9a3412' : '#14532d', fontWeight: '600', lineHeight: '1.5' }}>
                            <span style={{ display: 'block' }}>
                                ₹{Math.abs(adjustment.diff).toLocaleString()} {adjustment.diff > 0 ? 'more' : 'less'} per night.
                            </span>
                            Total ₹{Math.abs(adjustment.total).toLocaleString()} will be {adjustment.total > 0 ? 'added' : 'reduced'} for {adjustment.nights} nights.
                        </div>
                    </div>
                )}

                {/* Reason */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>Reason for Exchange:</label>
                    <input
                        type="text"
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        placeholder="Enter reason for exchange..."
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#f8fafc',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                    />
                </div>

                {/* Effective Date */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>Effective Date:</span>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#f8fafc',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <input
                            type="date"
                            name="effectiveDate"
                            value={formData.effectiveDate}
                            onChange={handleChange}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                outline: 'none',
                                fontSize: '14px',
                                fontWeight: '700',
                                color: '#1e293b',
                                fontFamily: 'inherit'
                            }}
                        />
                        <Calendar size={18} color="#94a3b8" />
                    </div>
                </div>

                {/* Calculation Row */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '10px',
                    padding: '10px 0'
                }}>
                    <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: '700' }}>
                        ₹{adjustment.oldTotal.toLocaleString()} {adjustment.total >= 0 ? '+' : '-'} ₹{Math.abs(adjustment.total).toLocaleString()}
                        <span style={{
                            fontSize: '11px',
                            color: adjustment.total > 0 ? '#ea580c' : '#166534',
                            fontWeight: '600',
                            marginLeft: '6px',
                            verticalAlign: 'middle'
                        }}>
                            {adjustment.total > 0 ? '▲ (Upgrade)' : (adjustment.total < 0 ? '▼ (Downgrade)' : '')}
                        </span>
                        <span style={{ margin: '0 8px', color: '#94a3b8' }}>=</span>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: adjustment.total > 0 ? '#c2410c' : '#15803d' }}>
                        ₹{(adjustment.oldTotal + adjustment.total).toLocaleString()}
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '16px', marginTop: 'auto' }}>
                    <button
                        type="button"
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            padding: '14px',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#f8fafc',
                            color: '#64748b',
                            fontWeight: '700',
                            cursor: 'pointer',
                            fontSize: '15px'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !formData.newRoomId}
                        style={{
                            flex: 1,
                            padding: '14px',
                            borderRadius: '12px',
                            border: 'none',
                            backgroundColor: '#dc2626',
                            color: '#ffffff',
                            fontWeight: '700',
                            cursor: 'pointer',
                            fontSize: '15px',
                            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)',
                            opacity: (isSubmitting || !formData.newRoomId) ? 0.6 : 1
                        }}
                    >
                        {isSubmitting ? 'Processing...' : 'Confirm Exchange'}
                    </button>
                </div>
            </form>

            {/* Footer Summary Bar */}
            <div style={{
                padding: '10px 24px',
                backgroundColor: '#f8fafc',
                borderTop: '1px solid #f1f5f9',
                textAlign: 'right',
                fontSize: '13px',
                fontWeight: '700',
                color: '#475569'
            }}>
                ₹{adjustment.oldTotal.toLocaleString()} {adjustment.total >= 0 ? '+' : '-'} <span style={{ color: '#059669', margin: '0 4px' }}>
                    ₹{Math.abs(adjustment.total).toLocaleString()} ({adjustment.total > 0 ? 'Upgrade' : 'Downgrade'})
                </span>
                = ₹{(adjustment.oldTotal + adjustment.total).toLocaleString()}
            </div>
        </div>
    );
};

export default ExchangeRoomForm;
