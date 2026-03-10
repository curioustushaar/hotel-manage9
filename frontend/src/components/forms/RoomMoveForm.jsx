import { useState, useEffect, useMemo } from 'react';
import API_URL from '../../config/api';
import { useSettings } from '../../context/SettingsContext';

const RoomMoveForm = ({ booking: initialBooking, onSubmit, onCancel }) => {
    const { getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();
    // 1. State Management
    const [booking, setBooking] = useState(initialBooking);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        newRoomId: '',
        newRoomNumber: '',
        newRoomPrice: 0,
        reason: '',
        moveEffectiveDate: new Date().toISOString().split('T')[0],
        moveTime: new Date().toTimeString().slice(0, 5)
    });

    // 2. Fetch Detailed Reservation & Available Rooms
    useEffect(() => {
        const loadInitialData = async () => {
            console.log('[RoomMoveForm] API_URL:', API_URL);
            console.log('[RoomMoveForm] Loading data for booking:', initialBooking._id || initialBooking.id);
            
            setLoading(true);
            try {
                // Fetch full reservation details to get correct dates/status
                const resResponse = await fetch(`${API_URL}/api/reservations/${initialBooking._id || initialBooking.id}`);
                const resResult = await resResponse.json();

                if (resResult.success) {
                    setBooking(resResult.data);

                    // Fetch available rooms - just get all Available status rooms
                    const roomsResponse = await fetch(
                        `${API_URL}/api/rooms/list?status=Available`
                    );
                    const roomsResult = await roomsResponse.json();

                    console.log('[RoomMoveForm] Rooms API response:', roomsResult);

                    if (roomsResult.success && roomsResult.data && roomsResult.data.length > 0) {
                        // Filter out current room and validate room structure
                        const filtered = roomsResult.data
                            .filter(r => r.roomNumber !== resResult.data.roomNumber)
                            .filter(r => r._id && r.roomNumber && r.price) // Ensure valid room data
                            .map(r => ({
                                ...r,
                                _id: r._id.toString() // Ensure _id is string
                            }));
                        
                        console.log('[RoomMoveForm] Available rooms after filtering:', filtered.length);
                        setAvailableRooms(filtered);
                    } else {
                        console.warn('[RoomMoveForm] No available rooms found');
                        setAvailableRooms([]);
                    }
                } else {
                    throw new Error(resResult.message || 'Failed to fetch reservation details');
                }
            } catch (err) {
                console.error('Error loading room move data:', err);
                setError(err.message || 'Failed to load room data. Please check your connection.');
                setAvailableRooms([]);
            } finally {
                setLoading(false);
            }
        };

        if (initialBooking?._id || initialBooking?.id) {
            loadInitialData();
        }
    }, [initialBooking]);

    // 3. Financial Calculations
    const adjustment = useMemo(() => {
        if (!formData.newRoomId || !booking) return { total: 0, diff: 0, nights: 0 };

        const oldPrice = booking.ratePerNight || 0;
        const newPrice = formData.newRoomPrice || 0;
        const diff = newPrice - oldPrice;

        const checkOutDate = new Date(booking.checkOutDate);
        const moveDate = new Date(formData.moveEffectiveDate);
        moveDate.setHours(0, 0, 0, 0);
        checkOutDate.setHours(0, 0, 0, 0);

        const remainingNights = Math.max(0, Math.ceil((checkOutDate - moveDate) / (1000 * 60 * 60 * 24)));
        return {
            diff,
            nights: remainingNights,
            total: diff * remainingNights
        };
    }, [formData.newRoomId, formData.newRoomPrice, formData.moveEffectiveDate, booking]);

    // 4. Handlers
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'newRoomId') {
            const selectedRoom = availableRooms.find(r => r._id === value);
            console.log('[RoomMoveForm] Room selected:', { value, selectedRoom });
            setFormData(prev => ({
                ...prev,
                newRoomId: value,
                newRoomNumber: selectedRoom ? selectedRoom.roomNumber : '',
                newRoomPrice: selectedRoom ? selectedRoom.price : 0
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validations
        if (!formData.newRoomId) return alert('Please select a new room');
        if (!formData.reason.trim()) return alert('Reason for move is required');

        // Verify the selected room exists in available rooms
        const selectedRoom = availableRooms.find(r => r._id === formData.newRoomId);
        if (!selectedRoom) {
            console.error('[RoomMoveForm] Selected room not found in availableRooms:', formData.newRoomId);
            console.error('[RoomMoveForm] Available rooms:', availableRooms);
            return alert('Selected room is invalid. Please refresh and try again.');
        }

        const inHouseStatuses = ['Checked-in', 'IN_HOUSE'];
        if (!inHouseStatuses.includes(booking.status)) {
            return alert(`Cannot move room for guest with status: ${booking.status}. Only In-House guests can be moved.`);
        }

        // Show confirmation modal for price change
        if (adjustment.total !== 0) {
            const message = adjustment.total > 0
                ? `This room costs ${cs}${adjustment.diff} more per night. Additional ${cs}${adjustment.total} will be added to the bill. Confirm move?`
                : `This room costs ${cs}${Math.abs(adjustment.diff)} less per night. ${cs}${Math.abs(adjustment.total)} will be reduced from the bill. Confirm move?`;

            if (!window.confirm(message)) return;
        }

        setIsSubmitting(true);
        try {
            const apiUrl = `${API_URL}/api/reservations/${booking._id || booking.id}/room-move`;
            console.log('[RoomMoveForm] Submitting to:', apiUrl);
            console.log('[RoomMoveForm] Request body:', {
                newRoomId: formData.newRoomId,
                newRoomNumber: formData.newRoomNumber,
                reason: formData.reason,
                effectiveDate: formData.moveEffectiveDate
            });

            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    newRoomId: formData.newRoomId,
                    newRoomNumber: formData.newRoomNumber,
                    reason: formData.reason,
                    effectiveDate: formData.moveEffectiveDate,
                    movedBy: 'Current User' // Replace with actual user context if available
                })
            });

            console.log('[RoomMoveForm] Response status:', response.status);
            
            const result = await response.json();
            console.log('[RoomMoveForm] Response data:', result);

            if (result.success) {
                // onSubmit will handle success (toast, close, refresh)
                await onSubmit(result.data);
            } else {
                alert(result.message || 'Room move failed');
            }
        } catch (err) {
            console.error('Error submitting room move:', err);
            console.error('Error details:', {
                message: err.message,
                stack: err.stack,
                apiUrl: API_URL
            });
            alert(`Failed to process room move: ${err.message || 'Network error'}. API URL: ${API_URL || 'NOT SET'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">Fetching stay details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500 mb-4">Error: {error}</p>
                <button onClick={onCancel} className="text-gray-600 underline">Close</button>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            backgroundColor: '#FAFAFA',
            fontFamily: "'Inter', sans-serif",
            margin: '-20px'
        }}>
            {/* Header Info Bar */}
            <div style={{
                padding: '16px 24px',
                backgroundColor: '#FFFFFF',
                borderBottom: '1px solid #F0F0F0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '15px'
            }}>
                <span style={{ color: '#9CA3AF' }}>{booking.reservationId || booking.bookingId || 'RES-XXX'}</span>
                <span style={{ color: '#E5E7EB', margin: '0 4px' }}>|</span>
                <span style={{ color: '#111827', fontWeight: '700' }}>{booking.guestName}</span>
            </div>

            <form onSubmit={handleSubmit} style={{
                flex: 1,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                overflowY: 'auto'
            }}>
                {/* Current Room Details Card */}
                <div style={{
                    backgroundColor: '#F9FAFB',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid #F3F4F6'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '20px',
                        color: '#4B5563',
                        fontWeight: '700',
                        fontSize: '15px'
                    }}>
                        <div style={{ width: '32px', height: '32px', backgroundColor: '#FFFFFF', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                            🏨
                        </div>
                        Current Room Details:
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                            <span style={{ color: '#6B7280' }}>Room Number:</span>
                            <span style={{ fontWeight: '800', color: '#111827' }}>{booking.roomNumber}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                            <span style={{ color: '#6B7280' }}>Category & Rate:</span>
                            <span style={{ fontWeight: '600', color: '#374151' }}>
                                {booking.roomType || 'Standard'} ({cs}{(booking.ratePerNight || 0).toLocaleString()})
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                            <span style={{ color: '#6B7280' }}>Stay Duration:</span>
                            <span style={{ fontWeight: '600', color: '#111827' }}>
                                {new Date(booking.checkInDate).toLocaleDateString('en-GB')} - {new Date(booking.checkOutDate).toLocaleDateString('en-GB')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Move Guest To Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '700', color: '#374151' }}>Move Guest To:</label>
                    {availableRooms.length === 0 ? (
                        <div style={{
                            padding: '16px',
                            borderRadius: '12px',
                            backgroundColor: '#FEF2F2',
                            border: '1px solid #FEE2E2',
                            color: '#991B1B',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}>
                            ⚠️ No available rooms found for the remaining stay period. Please check room availability or try again later.
                        </div>
                    ) : (
                        <div style={{ position: 'relative' }}>
                            <select
                                name="newRoomId"
                                value={formData.newRoomId}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '14px 18px',
                                    borderRadius: '12px',
                                    border: '1px solid #E5E7EB',
                                    backgroundColor: '#FFFFFF',
                                    appearance: 'none',
                                    fontSize: '15px',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="">Select New Room</option>
                                {availableRooms.map(room => (
                                    <option key={room._id} value={room._id}>
                                        Room {room.roomNumber} - {room.roomType} ({cs}{room.price})
                                    </option>
                                ))}
                            </select>
                            <span style={{ position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }}>❯</span>
                        </div>
                    )}
                </div>

                {/* Rate Difference Info (Real-time) */}
                {adjustment.total !== 0 && (
                    <div style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        backgroundColor: adjustment.total > 0 ? '#FEF2F2' : '#F0FDF4',
                        border: `1px solid ${adjustment.total > 0 ? '#FEE2E2' : '#DCFCE7'}`,
                        fontSize: '13px',
                        color: adjustment.total > 0 ? '#991B1B' : '#166534',
                        fontWeight: '500'
                    }}>
                        {adjustment.total > 0 ? '⚠️' : '✅'} Rate Difference:
                        <b> {cs}{Math.abs(adjustment.diff)}/{adjustment.total > 0 ? 'more' : 'less'}</b> per night.
                        Total <b>{cs}{Math.abs(adjustment.total)}</b> will be {adjustment.total > 0 ? 'charged' : 'reduced'} for {adjustment.nights} nights.
                    </div>
                )}

                {/* Reason Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '700', color: '#374151' }}>Reason for Room Move:</label>
                    <textarea
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        placeholder="Enter reason (e.g. AC Repair, Guest Request)..."
                        style={{
                            width: '100%',
                            padding: '16px 18px',
                            borderRadius: '12px',
                            border: '1px solid #E5E7EB',
                            fontSize: '15px',
                            minHeight: '100px',
                            outline: 'none',
                            resize: 'none'
                        }}
                        required
                    />
                </div>

                {/* Effective Date Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#374151' }}>Move Effective From:</span>
                    <input
                        type="date"
                        name="moveEffectiveDate"
                        value={formData.moveEffectiveDate}
                        onChange={handleChange}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            fontSize: '14px',
                            fontWeight: '600'
                        }}
                    />
                </div>

                {/* Form Actions */}
                <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginTop: 'auto',
                    paddingTop: '20px'
                }}>
                    <button
                        type="button"
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            padding: '16px',
                            borderRadius: '12px',
                            border: '1px solid #E5E7EB',
                            backgroundColor: '#FFFFFF',
                            color: '#4B5563',
                            fontWeight: '700',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !formData.newRoomId}
                        style={{
                            flex: 1,
                            padding: '16px',
                            borderRadius: '12px',
                            border: 'none',
                            backgroundColor: '#C53030',
                            color: '#FFFFFF',
                            fontWeight: '700',
                            cursor: 'pointer',
                            opacity: (isSubmitting || !formData.newRoomId) ? 0.6 : 1,
                            boxShadow: '0 4px 14px rgba(197, 48, 48, 0.25)'
                        }}
                    >
                        {isSubmitting ? 'Confirming...' : 'Confirm Move'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RoomMoveForm;
