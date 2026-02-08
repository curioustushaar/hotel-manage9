#!/usr/bin/env node

/**
 * Guest Meal Service - Database Initialization Script
 * 
 * This script initializes the tables for the Guest Meal Service feature.
 * Run this once to set up 12 default tables in MongoDB.
 * 
 * Usage: node backend/scripts/initializeTables.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import the Table model
const Table = require('../models/tableModel');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bareena-atithi', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✓ MongoDB Connected');
        return true;
    } catch (error) {
        console.error('✗ MongoDB Connection Error:', error.message);
        return false;
    }
};

const initializeTables = async () => {
    try {
        // Check if tables already exist
        const existingTables = await Table.countDocuments();
        
        if (existingTables > 0) {
            console.log(`ℹ ${existingTables} tables already exist in the database.`);
            console.log('ℹ Skipping initialization.');
            return;
        }

        // Create 12 default tables
        const tablesData = Array.from({ length: 12 }, (_, i) => ({
            tableNumber: i + 1,
            status: 'Available',
            capacity: 4
        }));

        const tables = await Table.insertMany(tablesData);
        console.log(`✓ Successfully created ${tables.length} tables`);
        
        // Display created tables
        console.log('\n📋 Created Tables:');
        tables.forEach(table => {
            console.log(`   - Table ${table.tableNumber}: ${table.status} (Capacity: ${table.capacity})`);
        });

    } catch (error) {
        console.error('✗ Error initializing tables:', error.message);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log('\n✓ Database connection closed');
    }
};

// Main execution
const main = async () => {
    console.log('🍽️  Guest Meal Service - Table Initialization\n');
    
    const connected = await connectDB();
    if (!connected) {
        process.exit(1);
    }

    await initializeTables();
    process.exit(0);
};

// Run the script
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
