const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Booking = require('./models/bookingModel');

dotenv.config();

const migrateBookings = async () => {
    try {
        // Connect to MongoDB
        if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI");
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected');

        // Find all bookings without transactions
        const bookings = await Booking.find({
            $or: [
                { transactions: { $exists: false } },
                { transactions: { $size: 0 } }
            ]
        });

        console.log(`Found ${bookings.length} bookings without transactions`);

        for (const booking of bookings) {
            console.log(`\nMigrating booking: ${booking.guestName} (${booking._id})`);

            const transactions = [];

            // Add room charge transaction
            if (booking.totalAmount && booking.totalAmount > 0) {
                const checkInDate = new Date(booking.checkInDate);
                const roomChargeTransaction = {
                    type: 'charge',
                    day: checkInDate.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        weekday: 'short'
                    }),
                    particulars: 'Room Tariff',
                    description: `Room Charges - ₹${booking.totalAmount} for ${checkInDate.toLocaleDateString('en-GB')} Room No: ${booking.roomNumber}`,
                    amount: booking.totalAmount,
                    user: 'system',
                    createdAt: booking.createdAt || new Date()
                };
                transactions.push(roomChargeTransaction);
                console.log(`  ✓ Added room charge: ₹${booking.totalAmount}`);
            }

            // Add advance payment transaction
            if (booking.advancePaid && booking.advancePaid > 0) {
                const advancePaymentTransaction = {
                    type: 'payment',
                    day: new Date(booking.createdAt || new Date()).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        weekday: 'short'
                    }),
                    particulars: 'Advance Payment',
                    description: 'Advance payment received at booking',
                    amount: -Math.abs(booking.advancePaid),
                    user: 'system',
                    createdAt: booking.createdAt || new Date()
                };
                transactions.push(advancePaymentTransaction);
                console.log(`  ✓ Added advance payment: ₹${booking.advancePaid}`);
            }

            // Update booking with transactions
            if (transactions.length > 0) {
                booking.transactions = transactions;
                await booking.save();
                console.log(`  ✓ Migrated successfully! Total transactions: ${transactions.length}`);
            } else {
                console.log(`  ⚠ No transactions to add`);
            }
        }

        console.log(`\n✅ Migration complete! Updated ${bookings.length} bookings`);
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
};

migrateBookings();
