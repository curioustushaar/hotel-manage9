const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const seedUser = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI not found in .env');
        console.log('Connecting to MongoDB at:', uri);
        await mongoose.connect(uri);
        console.log('MongoDB Connected');

        // Check if user already exists
        const userExists = await User.findOne({ username: 'admin@bareena.com' });

        if (userExists) {
            console.log('Admin user already exists');
            process.exit();
        }

        // Create admin user
        const user = await User.create({
            username: 'admin@bareena.com',
            password: 'password123',
            role: 'admin',
            name: 'Admin User'
        });

        console.log('Admin user created successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding user:', error);
        process.exit(1);
    }
};

seedUser();
