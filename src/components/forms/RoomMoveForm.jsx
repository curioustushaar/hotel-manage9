import { useState, useEffect } from 'react';
import API_URL from '../../config/api';

const RoomMoveForm = ({ booking, onSubmit, onCancel }) => {
    const [availableRooms, setAvailableRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        newRoomNumber: '',
        reason: '',
        moveDate: new Date().toISOString().split('T')[0],
        moveTime: new Date().toTimeString().slice(0, 5)
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchAvailableRooms();
    }, []);

    const fetchAvailableRooms = async () => {
        try {
            // Simulated fake delay if API is fast, for UX (optional, but good for "Loading..." visibility)
            // await new Promise(r => setTimeout(r, 500)); 
            const response = await fetch(`${API_URL}/api/bookings/available-rooms`);
            const data = await response.json();
            if (data.success) {
                setAvailableRooms(data.data);
            }
        } catch (error) {
            console.error('Error fetching available rooms:', error);
            // Fallback for demo if API fails
            setAvailableRooms([
                { _id: '101', roomNumber: '101', roomType: 'Deluxe', price: 2500 },
                { _id: '102', roomNumber: '102', roomType: 'Suite', price: 4500 },
                { _id: '103', roomNumber: '103', roomType: 'Standard', price: 1500 }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.newRoomNumber) {
            alert('Please select a room');
            return;
        }

        if (!formData.reason.trim()) {
            alert('Reason for room move is required');
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
                <div className="pb-2 border-b border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reservation No :
                    </label>
                    <div className="text-lg font-bold text-gray-900">
                        {booking.bookingId || 'RES-51'}
                    </div>
                </div>

                {/* Available Rooms */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select New Room <span className="text-red-500">*</span>
                    </label>
                    {loading ? (
                        <div className="p-4 bg-gray-50 text-gray-500 text-center rounded-lg border border-dashed border-gray-300">
                            Looking for empty rooms...
                        </div>
                    ) : availableRooms.length === 0 ? (
                        <div className="p-4 bg-red-50 text-red-600 text-center rounded-lg border border-red-200">
                            No rooms available for move.
                        </div>
                    ) : (
                        <select
                            name="newRoomNumber"
                            value={formData.newRoomNumber}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white"
                            required
                        >
                            <option value="">-- Choose a Room --</option>
                            {availableRooms.map(room => (
                                <option key={room._id} value={room.roomNumber}>
                                    Room {room.roomNumber} - {room.roomType} (₹{room.price}/night)
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Move Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="moveDate"
                            value={formData.moveDate}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Move Time <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="time"
                            name="moveTime"
                            value={formData.moveTime}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                            required
                        />
                    </div>
                </div>

                {/* Reason */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for Move <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        placeholder="Why is the guest being moved? (e.g. AC issue, upgrade)"
                        rows="3"
                        required
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-6 border-t border-gray-100">
                <button
                    type="submit"
                    disabled={isSubmitting || availableRooms.length === 0}
                    className={`w-full px-6 py-3 rounded-lg font-semibold text-white shadow-lg transition-all transform active:scale-95 ${isSubmitting || availableRooms.length === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                        }`}
                >
                    {isSubmitting ? 'Moving...' : '🚪 Move Room'}
                </button>
            </div>
        </form>
    );
};

export default RoomMoveForm;
