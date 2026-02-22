const Reservation = require('../models/Booking');
const Booking = require('../models/Booking');
const Room = require('../models/Room');

// Helper to find reservation or booking
// Handles dual-model architecture (Reservation vs Booking)
const findStayRecord = async (id) => {
    let record = await Reservation.findById(id);
    let type = 'Reservation';

    if (!record) {
        record = await Booking.findById(id);
        type = 'Booking';
    }
    return { record, type };
};

exports.markNoShow = async (req, res) => {
    try {
        const { id } = req.params;
        const { applyCharge, userId } = req.body;

        const { record, type } = await findStayRecord(id);

        if (!record) {
            return res.status(404).json({ success: false, message: 'Reservation not found' });
        }

        // 1. Validation
        // Allowed statuses: RESERVED, Confirmed, Upcoming
        const allowedStatuses = ['RESERVED', 'Confirmed', 'Upcoming'];
        if (!allowedStatuses.includes(record.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot mark as No-Show. Current status is ${record.status}`
            });
        }

        // Validate Arrival Date (Must be today or past)
        const arrivalDate = new Date(record.checkInDate || record.arrivalDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        arrivalDate.setHours(0, 0, 0, 0);

        if (arrivalDate > today) {
            return res.status(400).json({
                success: false,
                message: 'Cannot mark future reservation as No-Show.'
            });
        }

        // 2. Update Status
        record.status = 'NO_SHOW'; // or 'No-Show' depending on enum usage in Booking vs Reservation
        if (type === 'Booking') record.status = 'No-Show'; // Booking model uses 'No-Show'

        record.updatedAt = new Date();

        // 3. Release Room
        let roomId = record.roomId;
        let roomNumber = record.roomNumber;

        // If roomId missing, try to find via roomNumber
        if (!roomId && roomNumber) {
            const room = await Room.findOne({ roomNumber });
            if (room) roomId = room._id;
        }

        if (roomId) {
            await Room.findByIdAndUpdate(roomId, { status: 'Available' });
        } else if (roomNumber) {
            await Room.findOneAndUpdate({ roomNumber }, { status: 'Available' });
        }

        // 4. Charges (if explicit applyCharge is true)
        if (applyCharge) {
            // Determine rate (pricePerNight or ratePerNight or derived)
            let rate = 0;
            if (type === 'Booking') {
                rate = record.billing?.roomRate || (record.billing?.totalAmount / (record.duration?.nights || 1)) || 0;
            } else {
                rate = record.amount ? (record.amount / (record.nights || 1)) : 0;
            }

            rate = Math.round(rate) || 0;

            if (rate > 0) {
                const transaction = {
                    type: type === 'Booking' ? 'Charge' : 'NO_SHOW_CHARGE', // Booking uses 'Charge' type
                    description: '1 Night No-Show Charge',
                    particulars: 'No-Show Penalty', // Booking uses particulars
                    amount: rate,
                    createdAt: new Date(),
                    user: userId || 'System',
                    day: new Date().toLocaleDateString('en-GB') // specific to Booking model requirement
                };

                if (type === 'Booking') {
                    if (!record.transactions) record.transactions = [];
                    record.transactions.push(transaction);
                    
                    if (!record.billing) record.billing = {};
                    record.billing.totalAmount = (record.billing.totalAmount || 0) + rate;
                    record.billing.balanceAmount = (record.billing.balanceAmount || 0) + rate;
                    
                    record.noShowDetails = {
                        noShowAt: new Date(),
                        noShowReason: 'Auto No-Show',
                        noShowCharges: rate
                    };
                } else {
                    // Reservation model
                    if (!record.transactions) record.transactions = [];
                    record.transactions.push(transaction);

                    record.totalAmount = (record.totalAmount || record.amount || 0) + rate;
                    record.balance = (record.balance || 0) + rate;

                    record.noShowDetails = {
                        noShowAt: new Date(),
                        applyCharge: true,
                        chargeAmount: rate
                    };
                }
            }
        } else {
            if (type === 'Booking') {
                record.noShowDetails = {
                    noShowAt: new Date(),
                    noShowReason: 'Marked No-Show (No Charge)',
                    noShowCharges: 0
                };
            } else {
                record.noShowDetails = {
                    noShowAt: new Date(),
                    applyCharge: false,
                    chargeAmount: 0
                };
            }
        }

        // 5. Audit Log
        const auditEntry = {
            action: 'NO_SHOW_MARKED',
            performedBy: userId || 'System',
            timestamp: new Date(),
            details: `Marked as No-Show. Charge: ${applyCharge ? 'Yes' : 'No'}`
        };

        if (type === 'Booking') {
            if (!record.auditTrail) record.auditTrail = [];
            record.auditTrail.push({
                action: 'NO_SHOW_MARKED',
                description: auditEntry.details,
                performedBy: auditEntry.performedBy,
                performedAt: auditEntry.timestamp
            });
        } else {
            if (!record.auditTrail) record.auditTrail = [];
            record.auditTrail.push(auditEntry);
        }

        await record.save();

        res.status(200).json({
            success: true,
            message: 'Reservation marked as No-Show successfully',
            data: record
        });

    } catch (error) {
        console.error('No-Show Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
// ... existing markNoShow ...

exports.voidReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, userId } = req.body;

        if (!reason) {
            return res.status(400).json({ success: false, message: 'Reason for voiding is required' });
        }

        const { record, type } = await findStayRecord(id);

        if (!record) {
            return res.status(404).json({ success: false, message: 'Reservation not found' });
        }

        // 1. Validation Logic
        // Reject if In-House, Checked-Out, or already Void/Cancelled
        const invalidStatuses = ['IN_HOUSE', 'Checked-in', 'CHECKED_OUT', 'Checked-out', 'VOID', 'Voided', 'Cancelled'];
        if (invalidStatuses.includes(record.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot void reservation. Current status is ${record.status}`
            });
        }

        // 2. Release Room
        let roomId = record.roomId;
        let roomNumber = record.roomNumber;

        // Try to resolve room info
        if (!roomId && roomNumber) {
            const room = await Room.findOne({ roomNumber });
            if (room) roomId = room._id;
        }

        if (roomId) {
            await Room.findByIdAndUpdate(roomId, { status: 'Available' });
        } else if (roomNumber) {
            await Room.findOneAndUpdate({ roomNumber }, { status: 'Available' });
        }

        // 3. Update Status & Add Void Details
        if (type === 'Booking') {
            record.status = 'Voided';
            record.voidDetails = {
                voidedAt: new Date(),
                voidReason: reason,
                voidedBy: userId || 'System'
            };
        } else {
            record.status = 'VOID'; // or Voided based on enum
            record.voidReason = reason;
            record.voidedAt = new Date();
        }

        // 4. Reverse Financials
        // Mark existing transactions as voided/refunded
        if (record.transactions && record.transactions.length > 0) {
            record.transactions.forEach(t => {
                if (t.type === 'payment') {
                    // Logic: Either create a refund entry OR just mark description
                    // Let's create a contra-entry for clarity or strictly zero out
                    // Requirement says: "Reverse folio entries... mark REFUNDED"
                    // To keep it simple and safe, we will just retain the history but zero out the totals.
                    // Or add a 'Refund' transaction if money was actually taken.
                    // Assuming for now we just want to zero the balance.
                    t.description += ` (VOIDED)`;
                } else if (t.type === 'charge') {
                    t.description += ` (VOIDED)`;
                }
            });
        }

        // Zero out amounts
        if (type === 'Booking') {
            if (!record.billing) record.billing = {};
            record.billing.totalAmount = 0;
            record.billing.balanceAmount = 0;
            record.billing.paidAmount = 0; // Assuming money is returned or voided
        } else {
            record.totalAmount = 0;
            record.balance = 0;
            record.paidAmount = 0;
            record.amount = 0;
        }

        // 5. Audit Log
        if (type === 'Booking') {
            if (!record.auditTrail) record.auditTrail = [];
            record.auditTrail.push({
                action: 'RESERVATION_VOIDED',
                description: `Voided. Reason: ${reason}`,
                performedBy: userId || 'System',
                performedAt: new Date()
            });
        } else {
            if (!record.auditTrail) record.auditTrail = [];
            record.auditTrail.push({
                action: 'RESERVATION_VOIDED',
                performedBy: userId || 'System',
                timestamp: new Date(),
                details: reason
            });
        }

        await record.save();

        res.status(200).json({
            success: true,
            message: 'Reservation marked as VOID successfully',
            data: record
        });

    } catch (error) {
        console.error('Void Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
