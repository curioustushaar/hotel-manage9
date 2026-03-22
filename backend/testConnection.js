const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('🔍 Testing MongoDB Connection...');
console.log('📍 MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('📍 URI (first 30 chars):', process.env.MONGODB_URI?.substring(0, 30) + '...');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB Connected Successfully!');
        console.log('📊 Database:', mongoose.connection.name);
        console.log('🌐 Host:', mongoose.connection.host);
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ MongoDB Connection Failed!');
        console.error('Error:', error.message);
        process.exit(1);
    });
