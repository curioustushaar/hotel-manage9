/**
 * One-time script to drop the problematic orderId_1 unique index
 * from the orders collection that causes "Failed to save KOT" errors.
 * Run with: node src/scripts/fixOrderIndex.js
 */

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../../.env') });

async function fixIndex() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');

        const db = mongoose.connection.db;
        const collection = db.collection('orders');

        // List all indexes
        const indexes = await collection.indexes();
        console.log('Current indexes:', JSON.stringify(indexes, null, 2));

        // Drop the problematic orderId_1 index if it exists
        const hasOrderIdIndex = indexes.some(idx => idx.name === 'orderId_1');
        if (hasOrderIdIndex) {
            await collection.dropIndex('orderId_1');
            console.log('✅ Successfully dropped orderId_1 index!');
        } else {
            console.log('ℹ️  orderId_1 index not found - checking for other null-unique indexes...');

            // Drop any unique index that could cause null conflicts
            for (const idx of indexes) {
                if (idx.unique && idx.name !== '_id_') {
                    console.log(`Found unique index: ${idx.name}`, idx.key);
                    // Only drop if it's not a necessary index
                    if (idx.name.includes('orderId') || idx.name.includes('orderNumber')) {
                        await collection.dropIndex(idx.name);
                        console.log(`✅ Dropped index: ${idx.name}`);
                    }
                }
            }
        }

        // List indexes after fix
        const indexesAfter = await collection.indexes();
        console.log('Indexes after fix:', indexesAfter.map(i => i.name));

        await mongoose.disconnect();
        console.log('Done! You can now save Room Service orders.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

fixIndex();
