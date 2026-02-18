/**
 * Availability Service
 * Central service for all room availability and status computation logic.
 * Used by roomController and bookingController.
 */

const Booking = require('../models/bookingModel');

/**
 * Check if two date ranges overlap.
 * A room is unavailable if: newCheckIn < existingCheckOut AND newCheckOut > existingCheckIn
 * @param {Date} newCheckIn
 * @param {Date} newCheckOut
 * @param {Date} existingCheckIn
 * @param {Date} existingCheckOut
 * @returns {boolean}
 */
const datesOverlap = (newCheckIn, newCheckOut, existingCheckIn, existingCheckOut) => {
    return newCheckIn < existingCheckOut && newCheckOut > existingCheckIn;
};

/**
 * Compute the dynamic status of a single room for a given calendar date.
 * Priority: Under Maintenance > Occupied > Reserved > Available
 *
 * @param {Object} room - Room document from DB
 * @param {Date} targetDate - The date to check status for (defaults to today)
 * @returns {string} - 'Available' | 'Reserved' | 'Occupied' | 'Under Maintenance'
 */
const computeRoomStatus = async (room, targetDate = new Date()) => {
    // Manual override always wins
    if (room.status === 'Under Maintenance') {
        return 'Under Maintenance';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkDate = new Date(targetDate);
    checkDate.setHours(0, 0, 0, 0);

    // Find any active booking that covers the target date
    const activeBooking = await Booking.findOne({
        $or: [
            { roomNumber: room.roomNumber },
            { 'rooms.roomNumber': room.roomNumber }
        ],
        checkInDate: { $lte: checkDate },
        checkOutDate: { $gt: checkDate },
        status: { $in: ['Upcoming', 'Checked-in'] }
    });

    if (!activeBooking) {
        return 'Available';
    }

    // If today is within the stay → Occupied
    const checkIn = new Date(activeBooking.checkInDate);
    const checkOut = new Date(activeBooking.checkOutDate);
    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);

    if (today >= checkIn && today < checkOut) {
        return 'Occupied';
    }

    // Future reservation
    return 'Reserved';
};

/**
 * Compute dynamic status for a list of rooms for a given date.
 * Returns rooms with a computed `computedStatus` field added.
 *
 * @param {Array} rooms - Array of room documents
 * @param {Date} targetDate
 * @returns {Array} - rooms with computedStatus attached
 */
const computeStatusForRooms = async (rooms, targetDate = new Date()) => {
    const results = await Promise.all(
        rooms.map(async (room) => {
            const roomObj = room.toObject ? room.toObject() : { ...room };
            roomObj.computedStatus = await computeRoomStatus(room, targetDate);
            return roomObj;
        })
    );
    return results;
};

/**
 * Check if a specific room has any overlapping booking for a date range.
 * Used by addBooking to prevent double booking.
 *
 * @param {string} roomNumber
 * @param {Date} checkInDate
 * @param {Date} checkOutDate
 * @param {string|null} excludeBookingId - Booking ID to exclude (for updates)
 * @returns {Object|null} - Conflicting booking or null
 */
const findOverlappingBooking = async (roomNumber, checkInDate, checkOutDate, excludeBookingId = null) => {
    const query = {
        $or: [
            { roomNumber: roomNumber },
            { 'rooms.roomNumber': roomNumber }
        ],
        checkInDate: { $lt: new Date(checkOutDate) },
        checkOutDate: { $gt: new Date(checkInDate) },
        status: { $in: ['Upcoming', 'Checked-in'] }
    };

    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }

    return await Booking.findOne(query);
};

/**
 * Compute the booking status that should be shown on the frontend
 * based on today's date vs check-in/check-out dates.
 * This enables auto status transition without a cron job.
 *
 * @param {Object} booking - Booking document
 * @returns {string} - Effective status
 */
const computeBookingStatus = (booking) => {
    if (!booking) return 'Upcoming';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkIn = new Date(booking.checkInDate);
    checkIn.setHours(0, 0, 0, 0);

    const checkOut = new Date(booking.checkOutDate);
    checkOut.setHours(0, 0, 0, 0);

    // Already finalized statuses
    if (['Checked-out', 'Cancelled', 'No-Show', 'Voided'].includes(booking.status)) {
        return booking.status;
    }

    // Auto-transition: today is past checkout → Checked-out
    if (today >= checkOut) {
        return 'Checked-out';
    }

    // Auto-transition: today is within stay → Checked-in (Occupied)
    if (today >= checkIn && today < checkOut) {
        return booking.status === 'Checked-in' ? 'Checked-in' : 'Upcoming';
    }

    return booking.status;
};

module.exports = {
    datesOverlap,
    computeRoomStatus,
    computeStatusForRooms,
    findOverlappingBooking,
    computeBookingStatus
};
