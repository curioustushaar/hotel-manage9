const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const Table = require('../models/tableModel');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        const count = await Table.countDocuments();
        console.log(`Checking tables... Found ${count}`);

        if (count === 0) {
            console.log('Seeding default tables...');
            const tables = [
                { tableName: 'T1', capacity: 4, type: 'General', status: 'Available' },
                { tableName: 'T2', capacity: 4, type: 'General', status: 'Available' },
                { tableName: 'T3', capacity: 6, type: 'General', status: 'Available' },
                { tableName: 'T4', capacity: 2, type: 'General', status: 'Available' },
                { tableName: 'T5', capacity: 4, type: 'General', status: 'Available' },
                { tableName: 'T6', capacity: 4, type: 'General', status: 'Available' },
                { tableName: 'T7', capacity: 8, type: 'VIP', status: 'Available' },
                { tableName: 'T8', capacity: 2, type: 'General', status: 'Available' },
                { tableName: 'T9', capacity: 4, type: 'General', status: 'Available' },
                { tableName: 'T10', capacity: 4, type: 'Running', status: 'Available' }, // Simulate active
                { tableName: 'T11', capacity: 6, type: 'General', status: 'Available' },
                { tableName: 'T12', capacity: 2, type: 'General', status: 'Available' }
            ];
            await Table.insertMany(tables);
            console.log('Tables seeded successfully');
        } else {
            console.log('Tables already exist');
        }
        process.exit(0);
    })
    .catch(err => {
        console.error('Seed error:', err);
        process.exit(1);
    });
