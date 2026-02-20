require('dotenv').config();
const mongoose = require('mongoose');
const Table = require('../src/models/Table');

async function fixIndexes() {
    try {
        // Connect to MongoDB
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bareena-hotel';
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Get current indexes
        const indexes = await Table.collection.getIndexes();
        console.log('\n📋 Current indexes:', Object.keys(indexes));

        // Drop the old unique index on tableNumber if it exists
        try {
            await Table.collection.dropIndex('tableNumber_1');
            console.log('✅ Dropped old tableNumber_1 unique index');
        } catch (error) {
            if (error.code === 27) {
                console.log('ℹ️  tableNumber_1 index does not exist (already removed)');
            } else {
                console.log('⚠️  Error dropping tableNumber index:', error.message);
            }
        }

        // Sync indexes (this will create the new compound index)
        await Table.syncIndexes();
        console.log('✅ Synced indexes - compound index (tableName + type) created');

        // Verify new indexes
        const newIndexes = await Table.collection.getIndexes();
        console.log('\n📋 Updated indexes:', Object.keys(newIndexes));

        console.log('\n✨ Migration completed successfully!');
        console.log('📌 Now same table names can exist in different types.');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

fixIndexes();
