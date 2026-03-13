const mongoose = require('mongoose');
const Booking = require('./src/models/Booking');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel-mgmt');
    const b = await Booking.find({}, 'status roomNumber');
    const counts = {};
    b.forEach(x => { counts[x.status] = (counts[x.status] || 0) + 1; });
    console.log(counts);
    process.exit();
}
check();
