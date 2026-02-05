import StatusBadge from './StatusBadge';

const BookingRow = ({ booking, onEdit, onDelete }) => {
    return (
        <tr key={booking._id || booking.id}>
            {/* CELL 1: Booking ID - text-left */}
            <td className="text-left booking-id">
                {booking.bookingId}
            </td>

            {/* CELL 2: Guest Name - text-left */}
            <td className="text-left guest-name">
                {booking.guestName}
            </td>

            {/* CELL 3: Room No - text-center */}
            <td className="text-center room-no">
                {booking.roomNumber || "—"}
            </td>

            {/* CELL 4: Room Type - text-left */}
            <td className="text-left room-type-cell">
                {booking.roomType || "—"}
            </td>

            {/* CELL 5: Check-in Date - text-center */}
            <td className="text-center check-in-date">
                {booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString('en-IN') : '—'}
            </td>

            {/* CELL 6: Status Badge - text-center */}
            <td className="text-center status-cell">
                <StatusBadge status={booking.status} />
            </td>

            {/* CELL 7: Actions - text-center */}
            <td className="text-center actions">
                <button
                    className="action-btn view-btn"
                    onClick={() => onEdit(booking)}
                    title="View/Edit"
                >
                    👁️
                </button>
                {booking.status === 'Upcoming' && (
                    <button
                        className="action-btn checkin-btn"
                        title="Check-in"
                    >
                        ✓
                    </button>
                )}
                <button
                    className="action-btn delete-btn"
                    onClick={() => onDelete(booking._id || booking.id)}
                    title="Delete"
                >
                    ✕
                </button>
            </td>
        </tr>
    );
};

export default BookingRow;
