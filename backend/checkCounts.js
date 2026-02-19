const mongoose = require('mongoose');
require('dotenv').config();

async function checkCounts() {
    try {
        if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI");
        await mongoose.connect(process.env.MONGODB_URI);
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
