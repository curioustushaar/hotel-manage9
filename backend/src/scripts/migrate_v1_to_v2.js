const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Guest = require('../models/Guest');
const Order = require('../models/Order');

// Connect to DB and run this script
// node src/scripts/migrate_v1_to_v2.js

async function migrate() {
    console.log('Starting Migration...');

    // 1. Migrate Bookings (Guest Name -> Guest Ref)
    const bookings = await Booking.find({ guest: { $exists: false } });
    console.log(`Found ${bookings.length} bookings to migrate.`);

    for (const booking of bookings) {
        if (booking.guestName && booking.mobileNumber) {
            // Find or Create Guest
            let guest = await Guest.findOne({ mobile: booking.mobileNumber });
            if (!guest) {
                guest = await Guest.create({
                    fullName: booking.guestName,
                    mobile: booking.mobileNumber,
                    email: booking.email || undefined
                });
                console.log(`Created Guest: ${guest.fullName}`);
            }

            // Link Guest
            booking.guest = guest._id;

            // Normalize Status if needed (Handled by Pre-save hook, but good to set explicitly)
            if (booking.status === 'RESERVED') booking.status = 'Confirmed';
            if (booking.status === 'IN_HOUSE') booking.status = 'CheckedIn';

            await booking.save({ validateBeforeSave: false }); // Skip validation for now
        }
    }

    // 2. Migrate Orders (GuestMealOrder -> Order)
    // Note: Since collection name matches (if 'guestmealorders' -> 'orders'?), we assumed standard 'orders' collection.
    // If usage was 'GuestMealOrder', simple rename in code handles it, but verify collection name in Compass if needed.

    console.log('Migration Complete.');
    process.exit();
}

// Boilerplate connection (Adjust URI)
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is missing in .env");
    process.exit(1);
}
mongoose.connect(process.env.MONGODB_URI)
    .then(migrate)
    .catch(err => console.error(err));
