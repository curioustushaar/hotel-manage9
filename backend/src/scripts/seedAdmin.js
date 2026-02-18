const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load environment variables
// Load environment variables from ROOT .env
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not defined in .env');
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('MongoDB Connection Error:', error.message);
        process.exit(1);
    }
};

const seedAdmin = async () => {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
        console.error('Error: ADMIN_EMAIL and ADMIN_PASSWORD must be set in backend/.env');
        process.exit(1);
    }

    try {
        // Check if admin exists
        const existingAdmin = await User.findOne({ username: adminEmail });

        if (existingAdmin) {
            console.log('Admin user already exists. Updating password...');
            existingAdmin.password = adminPassword;
            existingAdmin.role = 'admin'; // ensure role is admin
            await existingAdmin.save();
            console.log('Admin password updated successfully.');
        } else {
            console.log('Creating admin user...');
            const newAdmin = new User({
                username: adminEmail,
                password: adminPassword,
                name: 'System Admin',
                role: 'admin'
            });

            await newAdmin.save();
            console.log('Admin user created successfully.');
        }

        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin user:', error);
        process.exit(1);
    }
};

seedAdmin();
