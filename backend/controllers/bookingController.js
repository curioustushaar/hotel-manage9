const Booking = require('../models/bookingModel');

// Get all bookings
exports.getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: bookings,
            count: bookings.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
            error: error.message
        });
    }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching booking',
            error: error.message
        });
    }
};

// Create a new booking
exports.addBooking = async (req, res) => {
    try {
        const bookingData = req.body;

        // Validate required fields
        if (!bookingData.guestName || !bookingData.mobileNumber || !bookingData.roomNumber || 
            !bookingData.checkInDate || !bookingData.checkOutDate) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Check for duplicate room booking
        const existingBooking = await Booking.findOne({
            roomNumber: bookingData.roomNumber,
            $or: [
                {
                    checkInDate: { $lt: new Date(bookingData.checkOutDate) },
                    checkOutDate: { $gt: new Date(bookingData.checkInDate) }
                }
            ],
            status: { $in: ['Upcoming', 'Checked-in'] }
        });

        if (existingBooking) {
            return res.status(409).json({
                success: false,
                message: 'Room is already booked for the selected dates'
            });
        }

        const booking = new Booking(bookingData);
        
        console.log('Creating booking with data:', bookingData);
        
        // Add initial room charge transaction
        const checkInDate = new Date(bookingData.checkInDate);
        const initialTransaction = {
            type: 'charge',
            day: checkInDate.toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                weekday: 'short'
            }),
            particulars: 'Room Tariff',
            description: `Room Charges - ${bookingData.totalAmount} for ${checkInDate.toLocaleDateString('en-GB')} Room No: ${bookingData.roomNumber}`,
            amount: bookingData.totalAmount || 0,
            user: 'system'
        };
        
        console.log('Initial transaction:', initialTransaction);
        booking.transactions.push(initialTransaction);
        
        // Add advance payment transaction if advance is paid
        if (bookingData.advancePaid && bookingData.advancePaid > 0) {
            const advancePaymentTransaction = {
                type: 'payment',
                day: new Date().toLocaleDateString('en-GB', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric',
                    weekday: 'short'
                }),
                particulars: 'Advance Payment',
                description: 'Advance payment received at booking',
                amount: -Math.abs(bookingData.advancePaid),
                user: 'system'
            };
            console.log('Advance payment transaction:', advancePaymentTransaction);
            booking.transactions.push(advancePaymentTransaction);
        }
        
        console.log('Booking before save - transactions:', booking.transactions);
        await booking.save();
        console.log('Booking saved - transactions:', booking.transactions);

        // Update room status based on booking status
        const Room = require('../models/roomModel');
        const room = await Room.findOne({ roomNumber: bookingData.roomNumber });
        
        if (room) {
            // Set room status based on booking status
            if (bookingData.status === 'Checked-in') {
                room.status = 'Occupied';
            } else if (bookingData.status === 'Upcoming') {
                room.status = 'Booked';
            }
            await room.save();
        }

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: booking
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating booking',
            error: error.message
        });
    }
};

// Update booking
exports.updateBooking = async (req, res) => {
    try {
        let booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        const oldStatus = booking.status;
        const oldRoomNumber = booking.roomNumber;

        // Update only provided fields
        Object.assign(booking, req.body);
        await booking.save();

        // Update room status if booking status changed
        const Room = require('../models/roomModel');
        
        // If room number changed, update old room to Available
        if (req.body.roomNumber && req.body.roomNumber !== oldRoomNumber) {
            const oldRoom = await Room.findOne({ roomNumber: oldRoomNumber });
            if (oldRoom) {
                oldRoom.status = 'Available';
                await oldRoom.save();
            }
        }
        
        // Update current room status based on booking status
        const currentRoomNumber = req.body.roomNumber || oldRoomNumber;
        const room = await Room.findOne({ roomNumber: currentRoomNumber });
        
        if (room) {
            if (booking.status === 'Checked-in') {
                room.status = 'Occupied';
            } else if (booking.status === 'Upcoming') {
                room.status = 'Booked';
            } else if (booking.status === 'Checked-out' || booking.status === 'Cancelled') {
                room.status = 'Available';
            }
            await room.save();
        }

        res.status(200).json({
            success: true,
            message: 'Booking updated successfully',
            data: booking
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating booking',
            error: error.message
        });
    }
};

// Delete booking
exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        const roomNumber = booking.roomNumber;
        await Booking.findByIdAndDelete(req.params.id);

        // Update room status to Available when booking is deleted
        const Room = require('../models/roomModel');
        const room = await Room.findOne({ roomNumber: roomNumber });
        
        if (room) {
            room.status = 'Available';
            await room.save();
        }

        res.status(200).json({
            success: true,
            message: 'Booking deleted successfully',
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting booking',
            error: error.message
        });
    }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Upcoming', 'Checked-in', 'Checked-out', 'Cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status, updatedAt: Date.now() },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Booking status updated successfully',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating booking status',
            error: error.message
        });
    }
};

// Get bookings by room number
exports.getBookingsByRoom = async (req, res) => {
    try {
        const { roomNumber } = req.params;
        const bookings = await Booking.find({ roomNumber }).sort({ checkInDate: -1 });

        res.status(200).json({
            success: true,
            data: bookings,
            count: bookings.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
            error: error.message
        });
    }
};

// Get bookings by date range
exports.getBookingsByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'startDate and endDate are required'
            });
        }

        const bookings = await Booking.find({
            checkInDate: { $gte: new Date(startDate) },
            checkOutDate: { $lte: new Date(endDate) }
        }).sort({ checkInDate: -1 });

        res.status(200).json({
            success: true,
            data: bookings,
            count: bookings.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
            error: error.message
        });
    }
};

// Add transaction (charge or payment) to a booking
exports.addTransaction = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const transactionData = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        booking.transactions.push(transactionData);
        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Transaction added successfully',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding transaction',
            error: error.message
        });
    }
};

// Update transaction
exports.updateTransaction = async (req, res) => {
    try {
        const { bookingId, transactionId } = req.params;
        const updatedData = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        const transaction = booking.transactions.id(transactionId);
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        Object.assign(transaction, updatedData);
        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Transaction updated successfully',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating transaction',
            error: error.message
        });
    }
};

// Delete transaction (void)
exports.deleteTransaction = async (req, res) => {
    try {
        const { bookingId, transactionId } = req.params;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        booking.transactions.pull(transactionId);
        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Transaction deleted successfully',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting transaction',
            error: error.message
        });
    }
};

// ========== MORE OPTIONS ACTIONS ==========

// 1. CHECK-IN ACTION
exports.checkInBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const checkInData = req.body;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Validate booking can be checked in
        if (booking.status === 'Cancelled' || booking.status === 'Voided') {
            return res.status(400).json({
                success: false,
                message: 'Cannot check-in a cancelled or voided reservation'
            });
        }

        if (booking.status === 'Checked-in') {
            return res.status(400).json({
                success: false,
                message: 'Booking is already checked in'
            });
        }

        // Update booking with check-in details
        booking.status = 'Checked-in';
        booking.actualCheckInDate = checkInData.actualCheckInDate || new Date();
        booking.actualCheckInTime = checkInData.actualCheckInTime || new Date().toLocaleTimeString('en-IN');
        booking.idProofType = checkInData.idProofType || booking.idProofType;
        booking.idProofNumber = checkInData.idProofNumber || booking.idProofNumber;
        booking.numberOfAdults = checkInData.numberOfAdults || 1;
        booking.numberOfChildren = checkInData.numberOfChildren || 0;
        booking.vehicleNumber = checkInData.vehicleNumber;
        booking.securityDeposit = checkInData.securityDeposit || 0;
        booking.checkInRemarks = checkInData.checkInRemarks;

        // Add security deposit as transaction if applicable
        if (checkInData.securityDeposit && checkInData.securityDeposit > 0) {
            booking.transactions.push({
                type: 'charge',
                day: new Date().toLocaleDateString('en-GB'),
                particulars: 'Security Deposit',
                description: 'Security deposit collected at check-in',
                amount: checkInData.securityDeposit,
                user: 'system'
            });
        }

        // Add audit trail entry
        booking.auditTrail.push({
            action: 'CHECK_IN',
            description: `Guest checked in. Adults: ${checkInData.numberOfAdults || 1}, Children: ${checkInData.numberOfChildren || 0}`,
            performedBy: 'system',
            metadata: checkInData
        });

        await booking.save();

        // Update room status to Occupied
        const Room = require('../models/roomModel');
        const room = await Room.findOne({ roomNumber: booking.roomNumber });
        if (room) {
            room.status = 'Occupied';
            await room.save();
        }

        res.status(200).json({
            success: true,
            message: 'Booking checked in successfully',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking in booking',
            error: error.message
        });
    }
};

// 2. ADD PAYMENT ACTION
exports.addPaymentToBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const paymentData = req.body;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Validate payment data
        if (!paymentData.amount || paymentData.amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment amount'
            });
        }

        if (!paymentData.paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Payment method is required'
            });
        }

        // For non-cash payments, reference ID is mandatory
        if (['Card', 'UPI', 'Bank Transfer'].includes(paymentData.paymentMethod) && !paymentData.referenceId) {
            return res.status(400).json({
                success: false,
                message: 'Reference ID is required for card/UPI/bank transfers'
            });
        }

        // Add payment transaction
        const paymentTransaction = {
            type: 'payment',
            day: paymentData.paymentDate || new Date().toLocaleDateString('en-GB'),
            particulars: `Payment - ${paymentData.paymentMethod}`,
            description: paymentData.comment || `Payment received via ${paymentData.paymentMethod}`,
            amount: -Math.abs(paymentData.amount),
            paymentMethod: paymentData.paymentMethod,
            referenceId: paymentData.referenceId,
            user: 'system'
        };

        booking.transactions.push(paymentTransaction);

        // Update advance paid
        booking.advancePaid = (booking.advancePaid || 0) + Math.abs(paymentData.amount);

        // Add audit trail entry
        booking.auditTrail.push({
            action: 'PAYMENT_ADDED',
            description: `Payment of ₹${paymentData.amount} added via ${paymentData.paymentMethod}`,
            performedBy: 'system',
            metadata: paymentData
        });

        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Payment added successfully',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding payment',
            error: error.message
        });
    }
};

// 3. AMEND STAY ACTION
exports.amendStay = async (req, res) => {
    try {
        const { id } = req.params;
        const amendData = req.body;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (!amendData.newCheckInDate || !amendData.newCheckOutDate) {
            return res.status(400).json({
                success: false,
                message: 'New check-in and check-out dates are required'
            });
        }

        // Save old values for audit trail
        const oldCheckIn = booking.checkInDate;
        const oldCheckOut = booking.checkOutDate;
        const oldNights = booking.numberOfNights;
        const oldTotal = booking.totalAmount;

        // Calculate new nights
        const newCheckIn = new Date(amendData.newCheckInDate);
        const newCheckOut = new Date(amendData.newCheckOutDate);
        const newNights = Math.ceil((newCheckOut - newCheckIn) / (1000 * 60 * 60 * 24));

        // Update booking dates
        booking.checkInDate = newCheckIn;
        booking.checkOutDate = newCheckOut;
        booking.numberOfNights = newNights;

        // Recalculate charges
        const newRate = amendData.newRate || booking.pricePerNight;
        booking.pricePerNight = newRate;
        const newTotal = newRate * newNights;
        booking.totalAmount = newTotal;

        // Add adjustment transaction if amount changed
        const amountDifference = newTotal - oldTotal;
        if (amountDifference !== 0) {
            booking.transactions.push({
                type: 'charge',
                day: new Date().toLocaleDateString('en-GB'),
                particulars: 'Stay Amendment Adjustment',
                description: `Adjusted charges from ₹${oldTotal} to ₹${newTotal}. Reason: ${amendData.reason}`,
                amount: amountDifference,
                user: 'system'
            });
        }

        // Add audit trail entry
        booking.auditTrail.push({
            action: 'AMEND_STAY',
            description: `Stay amended from ${oldCheckIn.toLocaleDateString()} - ${oldCheckOut.toLocaleDateString()} (${oldNights} nights) to ${newCheckIn.toLocaleDateString()} - ${newCheckOut.toLocaleDateString()} (${newNights} nights). Reason: ${amendData.reason}`,
            performedBy: 'system',
            metadata: {
                old: { checkInDate: oldCheckIn, checkOutDate: oldCheckOut, nights: oldNights, total: oldTotal },
                new: { checkInDate: newCheckIn, checkOutDate: newCheckOut, nights: newNights, total: newTotal },
                reason: amendData.reason
            }
        });

        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Stay amended successfully',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error amending stay',
            error: error.message
        });
    }
};

// 4. ROOM MOVE ACTION
exports.moveRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { newRoomNumber, reason, moveDate } = req.body;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (!newRoomNumber || !reason) {
            return res.status(400).json({
                success: false,
                message: 'New room number and reason are required'
            });
        }

        const Room = require('../models/roomModel');
        
        // Check if new room is available
        const newRoom = await Room.findOne({ roomNumber: newRoomNumber });
        if (!newRoom) {
            return res.status(404).json({
                success: false,
                message: 'New room not found'
            });
        }

        if (newRoom.status !== 'Available') {
            return res.status(400).json({
                success: false,
                message: 'New room is not available'
            });
        }

        // Save old room number
        const oldRoomNumber = booking.roomNumber;
        const oldRoom = await Room.findOne({ roomNumber: oldRoomNumber });

        // Update booking room
        booking.roomNumber = newRoomNumber;
        booking.roomType = newRoom.roomType;
        booking.pricePerNight = newRoom.price;
        
        // Recalculate total if rate changed
        booking.totalAmount = newRoom.price * booking.numberOfNights;

        // Add audit trail entry
        booking.auditTrail.push({
            action: 'ROOM_MOVE',
            description: `Room moved from ${oldRoomNumber} to ${newRoomNumber}. Reason: ${reason}`,
            performedBy: 'system',
            metadata: { oldRoom: oldRoomNumber, newRoom: newRoomNumber, reason, moveDate: moveDate || new Date() }
        });

        await booking.save();

        // Update room statuses
        if (oldRoom) {
            oldRoom.status = 'Available';
            await oldRoom.save();
        }
        
        newRoom.status = 'Occupied';
        await newRoom.save();

        res.status(200).json({
            success: true,
            message: 'Room moved successfully',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error moving room',
            error: error.message
        });
    }
};

// 5. EXCHANGE ROOM ACTION
exports.exchangeRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { targetBookingId, reason } = req.body;

        if (!targetBookingId || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Target booking ID and reason are required'
            });
        }

        const booking1 = await Booking.findById(id);
        const booking2 = await Booking.findById(targetBookingId);

        if (!booking1 || !booking2) {
            return res.status(404).json({
                success: false,
                message: 'One or both bookings not found'
            });
        }

        // Swap room numbers
        const room1Num = booking1.roomNumber;
        const room2Num = booking2.roomNumber;

        booking1.roomNumber = room2Num;
        booking2.roomNumber = room1Num;

        // Add audit trail to both bookings
        const auditEntry1 = {
            action: 'ROOM_EXCHANGE',
            description: `Room exchanged from ${room1Num} to ${room2Num} with booking ${booking2._id}. Reason: ${reason}`,
            performedBy: 'system',
            metadata: { originalRoom: room1Num, newRoom: room2Num, targetBooking: targetBookingId, reason }
        };

        const auditEntry2 = {
            action: 'ROOM_EXCHANGE',
            description: `Room exchanged from ${room2Num} to ${room1Num} with booking ${booking1._id}. Reason: ${reason}`,
            performedBy: 'system',
            metadata: { originalRoom: room2Num, newRoom: room1Num, targetBooking: id, reason }
        };

        booking1.auditTrail.push(auditEntry1);
        booking2.auditTrail.push(auditEntry2);

        await booking1.save();
        await booking2.save();

        res.status(200).json({
            success: true,
            message: 'Rooms exchanged successfully',
            data: { booking1, booking2 }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error exchanging rooms',
            error: error.message
        });
    }
};

// 6. ADD VISITOR ACTION
exports.addVisitor = async (req, res) => {
    try {
        const { id } = req.params;
        const visitorData = req.body;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Validate visitor data
        if (!visitorData.visitorName || !visitorData.mobileNumber || !visitorData.idProofType || !visitorData.idProofNumber) {
            return res.status(400).json({
                success: false,
                message: 'Visitor name, mobile, ID proof type and number are required'
            });
        }

        // Add visitor
        booking.visitors.push({
            visitorName: visitorData.visitorName,
            mobileNumber: visitorData.mobileNumber,
            idProofType: visitorData.idProofType,
            idProofNumber: visitorData.idProofNumber,
            visitPurpose: visitorData.visitPurpose,
            inTime: visitorData.inTime || new Date(),
            outTime: visitorData.outTime
        });

        // Add audit trail entry
        booking.auditTrail.push({
            action: 'VISITOR_ADDED',
            description: `Visitor ${visitorData.visitorName} added. Purpose: ${visitorData.visitPurpose || 'Not specified'}`,
            performedBy: 'system',
            metadata: visitorData
        });

        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Visitor added successfully',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding visitor',
            error: error.message
        });
    }
};

// 7. NO-SHOW ACTION
exports.markNoShow = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, charges, refundAmount } = req.body;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.status === 'Checked-in') {
            return res.status(400).json({
                success: false,
                message: 'Cannot mark as no-show after check-in'
            });
        }

        // Update status
        booking.status = 'No-Show';
        
        // Add no-show details
        booking.noShowDetails = {
            noShowAt: new Date(),
            noShowReason: reason,
            noShowCharges: charges || 0
        };

        // Add no-show charges if applicable
        if (charges && charges > 0) {
            booking.transactions.push({
                type: 'charge',
                day: new Date().toLocaleDateString('en-GB'),
                particulars: 'No-Show Charges',
                description: `No-show charges applied. Reason: ${reason}`,
                amount: charges,
                user: 'system'
            });
        }

        // Add refund transaction if applicable
        if (refundAmount && refundAmount > 0) {
            booking.transactions.push({
                type: 'payment',
                day: new Date().toLocaleDateString('en-GB'),
                particulars: 'No-Show Refund',
                description: `Refund issued for no-show`,
                amount: -Math.abs(refundAmount),
                user: 'system'
            });
        }

        // Add audit trail entry
        booking.auditTrail.push({
            action: 'NO_SHOW',
            description: `Marked as no-show. Reason: ${reason}. Charges: ₹${charges || 0}`,
            performedBy: 'system',
            metadata: { reason, charges, refundAmount }
        });

        await booking.save();

        // Update room status to Available
        const Room = require('../models/roomModel');
        const room = await Room.findOne({ roomNumber: booking.roomNumber });
        if (room) {
            room.status = 'Available';
            await room.save();
        }

        res.status(200).json({
            success: true,
            message: 'Booking marked as no-show',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error marking booking as no-show',
            error: error.message
        });
    }
};

// 8. VOID RESERVATION ACTION
exports.voidReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, adminPassword } = req.body;

        // Admin password check (simple implementation - enhance with proper auth)
        if (adminPassword !== 'admin123') {
            return res.status(403).json({
                success: false,
                message: 'Admin authorization failed'
            });
        }

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Void reason is required'
            });
        }

        // Update status
        booking.status = 'Voided';
        
        // Add void details
        booking.voidDetails = {
            voidedAt: new Date(),
            voidReason: reason,
            voidedBy: 'admin'
        };

        // Add audit trail entry
        booking.auditTrail.push({
            action: 'VOID',
            description: `Reservation voided. Reason: ${reason}`,
            performedBy: 'admin',
            metadata: { reason }
        });

        await booking.save();

        // Update room status to Available
        const Room = require('../models/roomModel');
        const room = await Room.findOne({ roomNumber: booking.roomNumber });
        if (room) {
            room.status = 'Available';
            await room.save();
        }

        res.status(200).json({
            success: true,
            message: 'Reservation voided successfully',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error voiding reservation',
            error: error.message
        });
    }
};

// 9. CANCEL RESERVATION ACTION
exports.cancelReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, cancellationCharges, refundAmount, refundMode } = req.body;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Cancellation reason is required'
            });
        }

        if (booking.status === 'Checked-in') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel after check-in. Use check-out instead.'
            });
        }

        // Update status
        booking.status = 'Cancelled';
        
        // Add cancellation details
        booking.cancellationDetails = {
            cancelledAt: new Date(),
            cancellationReason: reason,
            cancellationCharges: cancellationCharges || 0,
            refundAmount: refundAmount || 0,
            refundMode: refundMode
        };

        // Add cancellation charges if applicable
        if (cancellationCharges && cancellationCharges > 0) {
            booking.transactions.push({
                type: 'charge',
                day: new Date().toLocaleDateString('en-GB'),
                particulars: 'Cancellation Charges',
                description: `Cancellation charges applied. Reason: ${reason}`,
                amount: cancellationCharges,
                user: 'system'
            });
        }

        // Add refund transaction if applicable
        if (refundAmount && refundAmount > 0) {
            booking.transactions.push({
                type: 'payment',
                day: new Date().toLocaleDateString('en-GB'),
                particulars: `Cancellation Refund - ${refundMode}`,
                description: `Refund issued via ${refundMode}`,
                amount: -Math.abs(refundAmount),
                paymentMethod: refundMode,
                user: 'system'
            });
        }

        // Add audit trail entry
        booking.auditTrail.push({
            action: 'CANCEL',
            description: `Reservation cancelled. Reason: ${reason}. Charges: ₹${cancellationCharges || 0}, Refund: ₹${refundAmount || 0}`,
            performedBy: 'system',
            metadata: { reason, cancellationCharges, refundAmount, refundMode }
        });

        await booking.save();

        // Update room status to Available
        const Room = require('../models/roomModel');
        const room = await Room.findOne({ roomNumber: booking.roomNumber });
        if (room) {
            room.status = 'Available';
            await room.save();
        }

        res.status(200).json({
            success: true,
            message: 'Reservation cancelled successfully',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error cancelling reservation',
            error: error.message
        });
    }
};

// Get available rooms (for Room Move action)
exports.getAvailableRooms = async (req, res) => {
    try {
        const Room = require('../models/roomModel');
        const rooms = await Room.find({ status: 'Available' }).sort({ roomNumber: 1 });

        res.status(200).json({
            success: true,
            data: rooms,
            count: rooms.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching available rooms',
            error: error.message
        });
    }
};

// Get occupied bookings (for Room Exchange action)
exports.getOccupiedBookings = async (req, res) => {
    try {
        const { excludeId } = req.query;
        const query = { status: 'Checked-in' };
        
        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        const bookings = await Booking.find(query)
            .select('_id guestName roomNumber roomType')
            .sort({ roomNumber: 1 });

        res.status(200).json({
            success: true,
            data: bookings,
            count: bookings.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching occupied bookings',
            error: error.message
        });
    }
};
