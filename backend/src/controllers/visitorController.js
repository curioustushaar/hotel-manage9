const Visitor = require('../models/Visitor');
const Reservation = require('../models/Booking');
const Booking = require('../models/Booking'); // Support both models
const Room = require('../models/Room');

// Helper to find reservation or booking
const findStayRecord = async (id) => {
    let record = await Reservation.findById(id).populate('roomId'); // Assuming Reservation has roomId populated or field
    let type = 'Reservation';

    if (!record) {
        record = await Booking.findById(id); // Booking usually has embedded room details or simple fields
        type = 'Booking';
    }
    return { record, type };
};

// POST /api/visitors
exports.createVisitor = async (req, res) => {
    console.log("createVisitor controller executed", req.body);
    try {
        const { reservationId, name, mobile, idType, idNumber, purpose, chargeAmount } = req.body;

        if (!reservationId || !name || !mobile) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // 1. Validate Reservation
        const { record, type } = await findStayRecord(reservationId);

        if (!record) {
            return res.status(404).json({ success: false, message: 'Reservation not found' });
        }

        const status = record.status;
        if (status !== 'IN_HOUSE' && status !== 'Checked-in') { // Booking uses 'Checked-in'
            return res.status(400).json({ success: false, message: `Cannot add visitor. guest status is ${status}` });
        }

        // 2. Check Active Visitors Count & Duplicates
        const activeVisitors = await Visitor.find({
            reservationId: record._id,
            status: 'ACTIVE'
        });

        if (activeVisitors.length >= 5) {
            return res.status(400).json({ success: false, message: 'Maximum 5 active visitors allowed per room.' });
        }

        const existingVisitor = activeVisitors.find(v => v.mobile === mobile);
        if (existingVisitor) {
            return res.status(400).json({ success: false, message: 'Visitor with this mobile number is already active.' });
        }

        // 3. Resolve Room ID
        // Booking model often stores roomNumber, we need ObjectId for Visitor model
        let roomId = record.roomId;
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
            roomId: roomId,
            guestId: record.guestId || null, // Optional
            name,
            mobile,
            idType,
            idNumber,
            purpose,
            chargeAmount: Number(chargeAmount) || 0,
            status: 'ACTIVE',
            inTime: new Date()
        });

        await newVisitor.save();

        // 5. Update Reservation (Push Visitor ID)
        if (!record.visitors) record.visitors = [];
        record.visitors.push(newVisitor._id);

        // 6. Handle Charges & Folio
        if (newVisitor.chargeAmount > 0) {
            const amount = newVisitor.chargeAmount;

            // Add Transaction / Folio Entry
            if (type === 'Booking') {
                // Booking model uses 'transactions' array
                record.transactions.push({
                    type: 'charge',
                    day: new Date().toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
                    particulars: `Visitor Charge - ${name}`,
                    description: `Charge for visitor entry. ID: ${idNumber || 'N/A'}`,
                    amount: amount,
                    user: req.user?.name || 'Staff', // Assuming auth middleware
                    createdAt: new Date()
                });

                // Recalculate totals handled by pre-save hook in Booking model usually, 
                // but let's confirm explicit update if needed or rely on hook.
                // Based on previous bookingModel view, pre-save hook recalculates totalAmount.
            } else {
                // Reservation model (simpler)
                record.amount = (record.amount || 0) + amount;
                record.balance = (record.balance || 0) + amount;
            }
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
            .populate('roomId', 'roomNumber roomType');

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

        // Update Reservation
        const { record, type } = await findStayRecord(visitor.reservationId);

        if (record) {
            // Increase Check-in Pax
            if (type === 'Booking') {
                record.numberOfAdults = (record.numberOfAdults || 0) + 1;

                // Add Conversion Charge if any
                if (chargeAmount > 0) {
                    record.transactions.push({
                        type: 'charge',
                        day: new Date().toLocaleDateString('en-GB'),
                        particulars: `Guest Conversion Charge`,
                        description: `Converted visitor ${visitor.name} to guest`,
                        amount: Number(chargeAmount),
                        user: 'Staff',
                        createdAt: new Date()
                    });
                }
            } else {
                // Reservation Model
                record.adults = (record.adults || 0) + 1;
                if (chargeAmount > 0) {
                    record.amount = (record.amount || 0) + Number(chargeAmount);
                    record.balance = (record.balance || 0) + Number(chargeAmount);
                }
            }
            await record.save();
        }

        res.status(200).json({ success: true, message: 'Visitor converted to guest successfully' });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
