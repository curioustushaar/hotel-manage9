const mongoose = require('mongoose');
const MenuItem = require('./models/menuModel');
const sampleMenuItems = require('./sampleData');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bareena-atithi';

async function importData() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        console.log('\nImporting sample menu items...');

        // Clear existing data (optional)
        const deleteCount = await MenuItem.countDocuments();
        if (deleteCount > 0) {
            console.log(`Found ${deleteCount} existing items`);
            const readline = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout
            });

            const answer = await new Promise(resolve => {
                readline.question('Do you want to clear existing data? (y/n): ', resolve);
            });
            readline.close();

            if (answer.toLowerCase() === 'y') {
                await MenuItem.deleteMany({});
                console.log('✅ Existing data cleared');
            }
        }

        // Insert sample data
        const result = await MenuItem.insertMany(sampleMenuItems);
        console.log(`✅ Successfully imported ${result.length} menu items`);

        console.log('\n📊 Sample Items:');
        result.slice(0, 5).forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.itemName} - ₹${item.price} (${item.category})`);
        });
        if (result.length > 5) {
            console.log(`  ... and ${result.length - 5} more items`);
        }

        console.log('\n✨ Data import completed successfully!');
        console.log('You can now view these items at: http://localhost:5173/admin/food-menu');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error importing data:', error.message);
        process.exit(1);
    }
}

// Run the import
importData();
