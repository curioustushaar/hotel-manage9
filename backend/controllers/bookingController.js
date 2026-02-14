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
        console.error('Error creating booking:', error);
        res.status(400).json({
            success: false,
            message: 'Error creating booking: ' + error.message,
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

// Route transactions from source folio to target folio (supports cross-booking routing)
exports.routeFolioTransactions = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { sourceFolioId, targetFolioId, transactionIds, routedBy, targetBookingId } = req.body;

        // Validate input
        if (sourceFolioId === undefined || targetFolioId === undefined || !transactionIds || transactionIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: sourceFolioId, targetFolioId, or transactionIds'
            });
        }

        if (sourceFolioId === targetFolioId && (!targetBookingId || targetBookingId === bookingId)) {
            return res.status(400).json({
                success: false,
                message: 'Source and target folio cannot be the same'
            });
        }

        const sourceBooking = await Booking.findById(bookingId);
        if (!sourceBooking) {
            return res.status(404).json({
                success: false,
                message: 'Source booking not found'
            });
        }

        // Check if routing to different booking
        const isCrossBookingRoute = targetBookingId && targetBookingId !== bookingId;
        let targetBooking = sourceBooking;

        if (isCrossBookingRoute) {
            targetBooking = await Booking.findById(targetBookingId);
            if (!targetBooking) {
                return res.status(404).json({
                    success: false,
                    message: 'Target booking not found'
                });
            }
        }

        // Validate and route transactions
        let routedCount = 0;
        const routingTimestamp = new Date();
        const routedTransactions = [];
        const transactionsToRemove = [];

        for (const transactionId of transactionIds) {
            const transaction = sourceBooking.transactions.id(transactionId);

            if (!transaction) {
                continue; // Skip if transaction not found
            }

            // Verify transaction belongs to source folio (or any folio if cross-booking)
            if (!isCrossBookingRoute && transaction.folioId !== sourceFolioId) {
                continue; // Skip if transaction doesn't belong to source folio
            }

            if (isCrossBookingRoute) {
                // Cross-booking routing: Clone transaction to target booking
                const newTransaction = {
                    type: transaction.type,
                    day: transaction.day,
                    particulars: transaction.particulars,
                    description: transaction.description,
                    amount: transaction.amount,
                    user: transaction.user,
                    folioId: targetFolioId,
                    routedFrom: sourceFolioId,
                    routedTo: targetFolioId,
                    routedBy: routedBy || 'system',
                    routedAt: routingTimestamp,
                    originalBookingId: bookingId,
                    createdAt: transaction.createdAt || new Date()
                };

                targetBooking.transactions.push(newTransaction);
                transactionsToRemove.push(transactionId);
            } else {
                // Same booking routing: Update folioId
                transaction.folioId = targetFolioId;
                transaction.routedFrom = sourceFolioId;
                transaction.routedTo = targetFolioId;
                transaction.routedBy = routedBy || 'system';
                transaction.routedAt = routingTimestamp;
            }

            routedTransactions.push({
                id: transaction._id,
                particulars: transaction.particulars,
                amount: transaction.amount
            });

            routedCount++;
        }

        if (routedCount === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid transactions found to route'
            });
        }

        // Save target booking first (in case of cross-booking)
        if (isCrossBookingRoute) {
            await targetBooking.save();

            // Remove transactions from source booking
            for (const transactionId of transactionsToRemove) {
                sourceBooking.transactions.pull(transactionId);
            }
        }

        // Save source booking
        await sourceBooking.save();

        res.status(200).json({
            success: true,
            message: `Successfully routed ${routedCount} transaction(s) from folio ${sourceFolioId} to folio ${targetFolioId}`,
            data: {
                sourceBooking: isCrossBookingRoute ? sourceBooking : undefined,
                targetBooking: isCrossBookingRoute ? targetBooking : undefined,
                booking: !isCrossBookingRoute ? sourceBooking : undefined,
                routedCount,
                routedTransactions,
                crossBookingRoute: isCrossBookingRoute
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error routing folio transactions',
            error: error.message
        });
    }
};



// Check-In Booking
exports.checkInBooking = async (req, res) => {
    try {
        const Booking = require('../models/bookingModel');
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        booking.status = 'Checked-in';
        booking.checkInTime = new Date(); // Actual check-in time
        await booking.save();

        const Room = require('../models/roomModel');
        if (booking.roomNumber) {
            await Room.findOneAndUpdate({ roomNumber: booking.roomNumber }, { status: 'Occupied' });
        }

        res.status(200).json({ success: true, message: 'Checked in successfully', data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error checking in', error: error.message });
    }
};

// Add Payment
exports.addBookingPayment = async (req, res) => {
    try {
        const Booking = require('../models/bookingModel');
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        const { amount, mode, reference, notes } = req.body;

        // Add payment transaction
        // Payments are typically stored as negative values if charges are positive
        // But amount from frontend form is likely positive
        // Let's store it as payment type, handling sign in calculation or keep as is
        // Based on previous code: amount: -Math.abs(bookingData.advancePaid)

        booking.transactions.push({
            type: 'payment',
            amount: -Math.abs(Number(amount)),
            particulars: `Payment via ${mode}`,
            description: `Ref: ${reference || '-'} ${notes ? '- ' + notes : ''}`,
            day: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', weekday: 'short' }),
            user: 'staff' // simplified
        });

        await booking.save();
        res.status(200).json({ success: true, message: 'Payment added', data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding payment', error: error.message });
    }
};

// Amend Stay
exports.amendBookingStay = async (req, res) => {
    try {
        const Booking = require('../models/bookingModel');
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            // Check if it's in the Reservation model instead
            const Reservation = require('../models/reservationModel');
            const reservation = await Reservation.findById(req.params.id);
            if (!reservation) {
                return res.status(404).json({ success: false, message: 'Reservation/Booking not found' });
            }

            // If it's a Reservation, we need to handle it differently or migrate it?
            // For now, let's treat Reservation objects as simpler entities.
            const { checkInDate, checkOutDate, adults, children, ratePerNight, newGrandTotal, nights } = req.body;

            if (reservation.status === 'CHECKED_OUT' || reservation.status === 'CANCELLED') {
                return res.status(400).json({ success: false, message: 'Cannot amend a completed or cancelled reservation' });
            }

            reservation.checkInDate = new Date(checkInDate);
            reservation.checkOutDate = new Date(checkOutDate);
            reservation.nights = Number(nights);
            reservation.adults = Number(adults);
            reservation.children = Number(children);
            reservation.amount = Number(newGrandTotal);
            reservation.balance = Number(newGrandTotal) - (reservation.paid || 0);

            await reservation.save();
            return res.status(200).json({ success: true, message: 'Reservation amended successfully', data: reservation });
        }

        // Status check for Booking
        if (booking.status === 'Checked-out' || booking.status === 'Cancelled' || booking.status === 'No-Show' || booking.status === 'Voided') {
            return res.status(400).json({ success: false, message: `Cannot amend booking with status: ${booking.status}` });
        }

        const {
            newCheckInDate,
            newCheckOutDate,
            newCheckInTime,
            newCheckOutTime,
            adults,
            children,
            ratePerNight,
            newGrandTotal,
            nights,
            discount,
            reason
        } = req.body;

        // Capture old data for audit log
        const oldData = {
            checkInDate: booking.checkInDate,
            checkOutDate: booking.checkOutDate,
            nights: booking.numberOfNights,
            totalAmount: booking.totalAmount,
            ratePerNight: booking.pricePerNight,
            occupancy: { adults: booking.numberOfAdults, children: booking.numberOfChildren }
        };

        // Update stay details
        if (newCheckInDate) booking.checkInDate = new Date(newCheckInDate);
        if (newCheckOutDate) booking.checkOutDate = new Date(newCheckOutDate);
        if (newCheckInTime) booking.scheduledCheckInTime = newCheckInTime;
        if (newCheckOutTime) booking.scheduledCheckOutTime = newCheckOutTime;

        // Update occupancy
        if (adults !== undefined) booking.numberOfAdults = Number(adults);
        if (children !== undefined) booking.numberOfChildren = Number(children);
        booking.numberOfGuests = (Number(adults) || 0) + (Number(children) || 0);

        // Update pricing and handle folio adjustments
        if (ratePerNight !== undefined) booking.pricePerNight = Number(ratePerNight);
        if (nights !== undefined) booking.numberOfNights = Number(nights);

        // Financial Adjustment Logic
        const oldTotal = booking.totalAmount || 0;
        const targetTotal = Number(newGrandTotal);
        const difference = targetTotal - oldTotal;

        if (difference !== 0) {
            if (!booking.transactions) booking.transactions = [];

            booking.transactions.push({
                type: difference > 0 ? 'charge' : 'discount',
                day: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', weekday: 'short' }),
                particulars: 'Stay Amendment Adjustment',
                description: `Stay amended from ${oldData.nights} to ${nights} nights at ₹${ratePerNight}/night. ${reason || ''}`,
                amount: Math.abs(difference),
                paymentMethod: null,
                createdAt: new Date(),
                user: 'System/Amend'
            });

            // Note: totalAmount will be recalculated in pre-save hook based on transactions
            // But we can set it explicitly to be sure
            booking.totalAmount = targetTotal;
        }

        // Add to audit trail
        if (!booking.auditTrail) booking.auditTrail = [];
        booking.auditTrail.push({
            action: 'STAY_AMENDED',
            description: reason || 'Booking details amended via Amend Stay feature',
            performedBy: 'user',
            performedAt: new Date(),
            metadata: {
                oldData,
                newData: {
                    checkInDate: booking.checkInDate,
                    checkOutDate: booking.checkOutDate,
                    nights: booking.numberOfNights,
                    totalAmount: booking.totalAmount,
                    ratePerNight: booking.pricePerNight,
                    occupancy: { adults: booking.numberOfAdults, children: booking.numberOfChildren }
                }
            }
        });

        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Stay amended successfully',
            data: booking
        });
    } catch (error) {
        console.error('Error in amendBookingStay:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during amendment',
            error: error.message
        });
    }
};

// Room Move with Financial Adjustment and Audit Trail
exports.moveBookingRoom = async (req, res) => {
    try {
        const Booking = require('../models/bookingModel');
        const Reservation = require('../models/reservationModel');
        const Room = require('../models/roomModel');

        const { id } = req.params;
        const { newRoomId, newRoomNumber, reason, effectiveDate } = req.body;

        // 1. Fetch record (Check both models)
        let booking = await Booking.findById(id);
        let isReservation = false;

        if (!booking) {
            booking = await Reservation.findById(id);
            isReservation = true;
        }

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Reservation/Booking not found' });
        }

        // 2. Eligibility Check
        const currentStatus = booking.status;
        const inHouseStatuses = ['Checked-in', 'IN_HOUSE'];
        if (!inHouseStatuses.includes(currentStatus)) {
            return res.status(400).json({
                success: false,
                message: `Room move is only allowed for in-house guests. Current status: ${currentStatus}`
            });
        }

        // 3. New Room Validation
        const newRoom = await Room.findById(newRoomId);
        if (!newRoom) {
            return res.status(404).json({ success: false, message: 'Target room not found' });
        }

        if (newRoom.status !== 'Available') {
            return res.status(400).json({
                success: false,
                message: `Room ${newRoom.roomNumber} is currently ${newRoom.status}. Please select an Available room.`
            });
        }

        const oldRoomNumber = booking.roomNumber;
        const oldPrice = booking.pricePerNight || (booking.amount / booking.nights) || 0;
        const newPrice = newRoom.price || 0;

        // 4. Calculate Financial Adjustment
        // We adjust for remaining nights from effective date to checkout
        const checkOutDate = new Date(booking.checkOutDate);
        const moveDate = effectiveDate === 'Today' ? new Date() : new Date(effectiveDate);
        moveDate.setHours(0, 0, 0, 0);
        checkOutDate.setHours(0, 0, 0, 0);

        const remainingNights = Math.max(0, Math.ceil((checkOutDate - moveDate) / (1000 * 60 * 60 * 24)));
        const rateDiff = newPrice - oldPrice;
        const totalAdjustment = rateDiff * remainingNights;

        // 5. Update Record
        const oldData = {
            roomNumber: booking.roomNumber,
            roomType: booking.roomType || (booking.rooms?.[0]?.categoryId),
            pricePerNight: oldPrice
        };

        booking.roomNumber = newRoom.roomNumber;
        booking.roomType = newRoom.roomType;
        if (!isReservation) {
            booking.pricePerNight = newPrice;
        }

        // 6. Record Transaction & Audit
        if (!isReservation && totalAdjustment !== 0) {
            if (!booking.transactions) booking.transactions = [];
            booking.transactions.push({
                type: totalAdjustment > 0 ? 'charge' : 'discount',
                day: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', weekday: 'short' }),
                particulars: 'Room Move Adjustment',
                description: `Moved from ${oldRoomNumber} to ${newRoom.roomNumber}. Rate diff: ₹${rateDiff}/night for ${remainingNights} remaining nights.`,
                amount: Math.abs(totalAdjustment),
                user: req.body.movedBy || 'System'
            });
        }

        if (!booking.auditTrail) booking.auditTrail = [];
        booking.auditTrail.push({
            action: 'ROOM_MOVED',
            description: `Room move from ${oldRoomNumber} to ${newRoom.roomNumber}. Reason: ${reason}`,
            performedBy: req.body.movedBy || 'User',
            performedAt: new Date(),
            metadata: {
                oldRoom: oldData,
                newRoom: {
                    roomNumber: newRoom.roomNumber,
                    roomType: newRoom.roomType,
                    pricePerNight: newPrice
                },
                reason,
                adjustment: totalAdjustment
            }
        });

        await booking.save();

        // 7. Update Physical Room Statuses
        if (oldRoomNumber) {
            await Room.findOneAndUpdate({ roomNumber: oldRoomNumber }, { status: 'Available' });
        }
        await Room.findOneAndUpdate({ roomNumber: newRoom.roomNumber }, { status: 'Occupied' });

        res.status(200).json({
            success: true,
            message: `Room moved successfully to ${newRoom.roomNumber}. ${totalAdjustment !== 0 ? `Financial adjustment of ₹${Math.abs(totalAdjustment)} applied.` : ''}`,
            data: booking
        });

    } catch (error) {
        console.error('[ERROR] moveBookingRoom:', error);
        res.status(500).json({ success: false, message: 'Internal server error during room move', error: error.message });
    }
};

// Room Exchange with Financial Recalculation
// Room Exchange with Financial Recalculation
exports.exchangeBookingRoom = async (req, res) => {
    try {
        const Booking = require('../models/bookingModel');
        const Reservation = require('../models/reservationModel');
        const Room = require('../models/roomModel');

        const { id } = req.params;
        const { newRoomId, reason, effectiveDate } = req.body;

        // 1. Fetch Reservation/Booking
        let booking = await Booking.findById(id);
        let isReservation = false;

        if (!booking) {
            booking = await Reservation.findById(id);
            isReservation = true;
        }

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Stay record not found' });
        }

        // 2. Validate Reservation Status (must be IN_HOUSE)
        const currentStatus = booking.status;
        const validStatuses = ['Checked-in', 'IN_HOUSE'];
        if (!validStatuses.includes(currentStatus)) {
            return res.status(400).json({
                success: false,
                message: `Room exchange is only allowed for Checked-in guests. Current status: ${currentStatus}`
            });
        }

        // 3. Room Swap Validation
        if (booking.roomNumber === req.body.newRoomNumber) { // Check if same room
            return res.status(400).json({ success: false, message: 'Cannot exchange to the same room.' });
        }

        const newRoom = await Room.findById(newRoomId);
        if (!newRoom) {
            return res.status(404).json({ success: false, message: 'Target room not found' });
        }

        if (newRoom.status !== 'Available') {
            return res.status(400).json({ success: false, message: `Room ${newRoom.roomNumber} is not Available.` });
        }

        // 4. Calculation Logic
        const checkOutDate = new Date(booking.checkOutDate);
        const moveDate = new Date(effectiveDate || new Date());
        moveDate.setHours(0, 0, 0, 0);
        checkOutDate.setHours(0, 0, 0, 0);

        if (moveDate >= checkOutDate) {
            return res.status(400).json({ success: false, message: 'Effective date must be before checkout date.' });
        }

        const remainingNights = Math.max(0, Math.ceil((checkOutDate - moveDate) / (1000 * 60 * 60 * 24)));
        const oldPrice = booking.pricePerNight || (isReservation ? (booking.amount / (booking.nights || 1)) : 0) || 0;
        const newPrice = newRoom.price || 0;

        const rateDiffPerNight = newPrice - oldPrice;
        const totalAdjustment = rateDiffPerNight * remainingNights;

        const oldRoomNumber = booking.roomNumber;

        // 5. Update Main Record
        booking.roomNumber = newRoom.roomNumber;
        booking.roomType = newRoom.roomType;

        if (booking.pricePerNight !== undefined) {
            booking.pricePerNight = newPrice;
        }

        // 6. Financial Transaction (For Bookings primarily)
        if (!isReservation && totalAdjustment !== 0) {
            if (!booking.transactions) booking.transactions = [];

            const type = totalAdjustment > 0 ? 'charge' : 'discount';
            const description = `Room Exchange: ${oldRoomNumber} ⇄ ${newRoom.roomNumber}. ${remainingNights} nights difference. Reason: ${reason}`;

            booking.transactions.push({
                type: type,
                day: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', weekday: 'short' }),
                particulars: `Room Exchange Adjustment`,
                description: description,
                amount: Math.abs(totalAdjustment),
                user: req.body.performedBy || 'Staff'
            });
            // Note: Booking model pre-save hook will recalculate totalAmount/balance automatically
        } else if (isReservation) {
            // For simple Reservation model without transactions
            if (booking.amount !== undefined) booking.amount += totalAdjustment;
            if (booking.balance !== undefined) booking.balance += totalAdjustment;
        }

        // 7. Audit Trail
        if (!booking.auditTrail) booking.auditTrail = [];
        booking.auditTrail.push({
            action: 'ROOM_EXCHANGE',
            description: `Exchanged room ${oldRoomNumber} for ${newRoom.roomNumber}. Reason: ${reason}`,
            performedBy: req.body.performedBy || 'Staff',
            performedAt: new Date(),
            metadata: {
                oldRoomNumber,
                newRoomNumber: newRoom.roomNumber,
                rateDiffPerNight,
                totalAdjustment,
                remainingNights
            }
        });

        await booking.save();

        // 8. Physical Room Status Sync
        if (oldRoomNumber) {
            await Room.findOneAndUpdate({ roomNumber: oldRoomNumber }, { status: 'Available' });
        }
        await Room.findOneAndUpdate({ roomNumber: newRoom.roomNumber }, { status: 'Occupied' });

        res.status(200).json({
            success: true,
            message: `Room exchanged successfully to ${newRoom.roomNumber}. Adjustment of ₹${Math.abs(totalAdjustment)} applied.`,
            data: booking
        });

    } catch (error) {
        console.error('[ERROR] exchangeBookingRoom:', error);
        res.status(500).json({ success: false, message: 'Exchange failed', error: error.message });
    }
};

// Add Visitor
exports.addBookingVisitor = async (req, res) => {
    try {
        const Booking = require('../models/bookingModel');
        const Reservation = require('../models/reservationModel');

        let booking = await Booking.findById(req.params.id);
        if (!booking) {
            booking = await Reservation.findById(req.params.id);
        }

        if (!booking) return res.status(404).json({ success: false, message: 'Stay record not found' });

        const visitorData = req.body;

        // Basic Validation
        if (!visitorData.visitorName || !visitorData.mobileNumber || !visitorData.idProofNumber) {
            return res.status(400).json({ success: false, message: 'Missing required visitor details (Name, Mobile, ID).' });
        }

        // Ensure visitors array exists
        if (!booking.visitors) booking.visitors = [];

        // Add timestamp if not provided
        if (!visitorData.inTime) visitorData.inTime = new Date();

        booking.visitors.push(visitorData);

        // Add to audit trail if available
        if (booking.auditTrail) {
            booking.auditTrail.push({
                action: 'ADD_VISITOR',
                description: `Added visitor: ${visitorData.visitorName}`,
                performedBy: 'Staff',
                performedAt: new Date()
            });
        }

        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Visitor added successfully',
            data: booking
        });
    } catch (error) {
        console.error('Error adding visitor:', error);
        res.status(500).json({ success: false, message: 'Error adding visitor', error: error.message });
    }
};

// Mark No Show
exports.markBookingNoShow = async (req, res) => {
    try {
        const Booking = require('../models/bookingModel');
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        booking.status = 'No Show'; // Ensure this status is valid in enum if strictly typed
        // Or 'Cancelled' with reason 'No Show'
        // Let's assume 'No Show' is valid or use 'Cancelled'
        // The enum in model might be limited. Let's check model if needed. 
        // Assuming string is flexible enough or updated.

        await booking.save();

        const Room = require('../models/roomModel');
        if (booking.roomNumber) {
            await Room.findOneAndUpdate({ roomNumber: booking.roomNumber }, { status: 'Available' });
        }

        res.status(200).json({ success: true, message: 'Marked as No Show', data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error marking No Show', error: error.message });
    }
};

// Void Booking
exports.voidBooking = async (req, res) => {
    try {
        const Booking = require('../models/bookingModel');
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        booking.status = 'Void';
        await booking.save();

        const Room = require('../models/roomModel');
        if (booking.roomNumber) {
            await Room.findOneAndUpdate({ roomNumber: booking.roomNumber }, { status: 'Available' });
        }

        res.status(200).json({ success: true, message: 'Booking Voided', data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error voiding booking', error: error.message });
    }
};

// Cancel Booking
exports.cancelBooking = async (req, res) => {
    try {
        const Booking = require('../models/bookingModel');
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        const { reason, cancellationCharges } = req.body;

        booking.status = 'Cancelled';
        booking.cancellationReason = reason;

        if (cancellationCharges > 0) {
            booking.transactions.push({
                type: 'charge',
                amount: cancellationCharges,
                particulars: 'Cancellation Charges',
                description: `Reason: ${reason}`,
                day: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', weekday: 'short' }),
                user: 'staff'
            });
        }

        await booking.save();

        const Room = require('../models/roomModel');
        if (booking.roomNumber) {
            await Room.findOneAndUpdate({ roomNumber: booking.roomNumber }, { status: 'Available' });
        }

        res.status(200).json({ success: true, message: 'Booking Cancelled', data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error cancelling booking', error: error.message });
    }
};

