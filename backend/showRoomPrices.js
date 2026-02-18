const mongoose = require('mongoose');
require('dotenv').config();

async function showRoomPrices() {
    try {
        if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI");
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;

        const rooms = await db.collection('rooms').find({}).toArray();

        console.log('\n=== ROOM PRICES ===\n');
        rooms.forEach(room => {
            console.log(`Room ${room.roomNumber} (${room.roomType}): ₹${room.price || 'NOT SET'} per night`);
        });
        console.log(`\nTotal Rooms: ${rooms.length}\n`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

showRoomPrices();
