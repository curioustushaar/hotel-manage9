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

