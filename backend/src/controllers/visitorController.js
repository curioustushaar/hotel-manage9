const Visitor = require('../models/Visitor');
const Reservation = require('../models/Booking');
const Booking = require('../models/Booking'); // Support both models
const Room = require('../models/Room');

// Helper to find reservation or booking
const findStayRecord = async (id) => {
    try {
        const record = await Booking.findById(id);
        if (!record) return { record: null, type: null };
        return { record, type: 'Booking' };
    } catch (err) {
        return { record: null, type: null };
    }
};

// POST /api/visitors
exports.createVisitor = async (req, res) => {
    try {
        const { reservationId, name, mobile, idType, idNumber, purpose, chargeAmount } = req.body;

        if (!reservationId || !name || !mobile) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // 1. Validate Reservation
        const { record } = await findStayRecord(reservationId);

        if (!record) {
            return res.status(404).json({ success: false, message: 'Reservation not found' });
        }

        const status = record.status?.toUpperCase();
        if (!['IN_HOUSE', 'CHECKEDIN', 'CHECKED-IN', 'CHECKED_IN'].includes(status)) {
            return res.status(400).json({ success: false, message: `Cannot add visitor. Guest status is ${record.status}` });
        }

        // 2. Check Active Visitors Count & Duplicates
        const activeVisitors = await Visitor.find({
            reservationId: record._id,
            status: 'ACTIVE'
        });

        if (activeVisitors.length >= 10) {
            return res.status(400).json({ success: false, message: 'Maximum active visitors allowed reached.' });
        }

        const existingVisitor = activeVisitors.find(v => v.mobile === mobile);
        if (existingVisitor) {
            return res.status(400).json({ success: false, message: 'Visitor with this mobile number is already active.' });
        }

        // 3. Resolve Room ID
        let roomId = record.room;
        if (!roomId && record.roomNumber) {
            const room = await Room.findOne({ roomNumber: record.roomNumber });
            if (room) roomId = room._id;
        }

        if (!roomId) {
            return res.status(400).json({ success: false, message: 'Room reference not found for this reservation.' });
        }

        // 4. Create Visitor
        const newVisitor = new Visitor({
            reservationId: record._id,
            room: roomId, // Storing the room ObjectId in the 'room' field
            guest: record.guest || null,
            name,
            mobile,
            idType,
            idNumber,
            purpose: purpose || 'Visitor',
            chargeAmount: Number(chargeAmount) || 0,
            status: 'ACTIVE',
            inTime: new Date()
        });

        await newVisitor.save();

        // 5. Update Reservation (Push Visitor ID)
        if (!record.visitors) record.visitors = [];
        record.visitors.push(newVisitor._id);

        // 6. Handle Charges
        if (newVisitor.chargeAmount > 0) {
            const amount = newVisitor.chargeAmount;

            if (!record.transactions) record.transactions = [];
            record.transactions.push({
                type: 'Charge',
                amount: amount,
                date: new Date(),
                notes: `Visitor Charge - ${name}`,
                recordedBy: req.user?._id
            });

            if (!record.billing) {
                record.billing = { roomRate: 0, totalAmount: 0, paidAmount: 0, balanceAmount: 0 };
            }
            record.billing.totalAmount = (record.billing.totalAmount || 0) + amount;
            record.billing.balanceAmount = (record.billing.balanceAmount || 0) + amount;
        }

        await record.save();

        res.status(201).json({
            success: true,
            message: 'Visitor added successfully',
            data: newVisitor
        });

    } catch (error) {
        console.error('Add Visitor Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/visitors/reservation/:reservationId
exports.getVisitorsByReservation = async (req, res) => {
    try {
        const { reservationId } = req.params;
        const visitors = await Visitor.find({ reservationId })
            .sort({ createdAt: -1 })
            .populate('room', 'roomNumber roomType');

        res.status(200).json({ success: true, count: visitors.length, data: visitors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/visitors/:id/exit
exports.exitVisitor = async (req, res) => {
    try {
        const { id } = req.params;
        const visitor = await Visitor.findById(id);

        if (!visitor) {
            return res.status(404).json({ success: false, message: 'Visitor not found' });
        }

        if (visitor.status === 'EXITED') {
            return res.status(400).json({ success: false, message: 'Visitor already exited' });
        }

        visitor.status = 'EXITED';
        visitor.outTime = new Date();
        await visitor.save();

        res.status(200).json({ success: true, message: 'Visitor marked as exited', data: visitor });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/visitors/:id/convert
exports.convertVisitor = async (req, res) => {
    try {
        const { id } = req.params;
        const { chargeAmount } = req.body; // Optional additional charge for conversion

        const visitor = await Visitor.findById(id);
        if (!visitor) return res.status(404).json({ success: false, message: 'Visitor not found' });
        if (visitor.isConvertedToGuest) return res.status(400).json({ success: false, message: 'Already converted' });

        visitor.isConvertedToGuest = true;
        visitor.status = 'EXITED'; // Technically they 'exit' visitor status and become guest
        visitor.outTime = new Date();
        await visitor.save();

        // Update Reservation/Booking
        const { record } = await findStayRecord(visitor.reservationId);

        if (record) {
            // Increase Check-in Pax
            // Booking model uses duration.adults or sometimes numberOfAdults
            if (record.duration) {
                record.duration.adults = (record.duration.adults || 0) + 1;
            } else {
                record.numberOfAdults = (record.numberOfAdults || 0) + 1;
            }

            // Add Conversion Charge if any
            if (chargeAmount > 0) {
                if (!record.transactions) record.transactions = [];
                record.transactions.push({
                    type: 'Charge',
                    amount: Number(chargeAmount),
                    method: 'Cash',
                    date: new Date(),
                    notes: `Visitor to Guest Conversion: ${visitor.name}`,
                    recordedBy: req.user?._id
                });

                if (!record.billing) {
                    record.billing = { roomRate: 0, totalAmount: 0, paidAmount: 0, balanceAmount: 0 };
                }
                record.billing.totalAmount = (record.billing.totalAmount || 0) + Number(chargeAmount);
                record.billing.balanceAmount = (record.billing.balanceAmount || 0) + Number(chargeAmount);
            }
            await record.save();
        }

        res.status(200).json({ success: true, message: 'Visitor converted to guest successfully' });

    } catch (error) {
        console.error('Convert Visitor Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
