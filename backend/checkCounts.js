const mongoose = require('mongoose');
require('dotenv').config();

async function checkCounts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bareena-atithi');
        const db = mongoose.connection.db;
        const result = {};
        const collections = await db.listCollections().toArray();
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            result[col.name] = count;
        }
        process.stdout.write(JSON.stringify(result, null, 2));
        process.exit(0);
    } catch (error) {
        process.stderr.write(error.message);
        process.exit(1);
    }
}

checkCounts();
