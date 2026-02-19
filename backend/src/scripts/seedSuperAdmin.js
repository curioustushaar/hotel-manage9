const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

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

const seedSuperAdmin = async () => {
    await connectDB();

    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;

    if (!email || !password) {
        console.error('Error: SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in .env');
        process.exit(1);
    }

    try {
        // Check if super admin exists
        const existingSuperAdmin = await User.findOne({ username: email });

        if (existingSuperAdmin) {
            console.log('Super Admin user already exists. Updating password...');
            existingSuperAdmin.password = password;
            existingSuperAdmin.role = 'super_admin'; // ensure role is super_admin
            await existingSuperAdmin.save();
            console.log('Super Admin password updated successfully.');
        } else {
            console.log('Creating Super Admin user...');
            const newSuperAdmin = new User({
                username: email,
                password: password,
                name: 'Super Admin',
                role: 'super_admin'
            });

            await newSuperAdmin.save();
            console.log('Super Admin user created successfully.');
        }

        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding Super Admin user:', error);
        process.exit(1);
    }
};

seedSuperAdmin();
