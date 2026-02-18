const mongoose = require('mongoose');
require('dotenv').config();

async function verifyRoomData() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('Error: MONGODB_URI not found in .env');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;

        const rooms = await db.collection('rooms').find({}).toArray();

        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║           ROOM PRICE VERIFICATION REPORT                  ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        // Group by room type
        const grouped = {};
        rooms.forEach(room => {
            const type = room.roomType || 'Unknown';
            if (!grouped[type]) grouped[type] = [];
            grouped[type].push(room);
        });

        Object.keys(grouped).forEach(type => {
            console.log(`\n📍 ${type}:`);
            console.log('─'.repeat(60));

            grouped[type].forEach(room => {
                const price = room.price || 0;
                const status = room.status || 'Unknown';
                console.log(`   Room ${room.roomNumber.padEnd(6)} | ₹${price.toString().padStart(6)} | ${status}`);
            });

            const avgPrice = grouped[type].reduce((sum, r) => sum + (r.price || 0), 0) / grouped[type].length;
            console.log(`   Average: ₹${Math.round(avgPrice)}`);
        });

        console.log('\n' + '═'.repeat(60));
        console.log(`Total Rooms: ${rooms.length}`);
        console.log('═'.repeat(60) + '\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

verifyRoomData();
