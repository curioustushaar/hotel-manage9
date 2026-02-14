const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const menuRoutes = require('./routes/menuRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const roomRoutes = require('./routes/roomRoutes');
const qrCodeRoutes = require('./routes/qrCodeRoutes');
const guestRoutes = require('./routes/guestRoutes');
const cashierRoutes = require('./routes/cashierRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const roomFacilityRoutes = require('./routes/roomFacilityRoutes');
const bedTypeRoutes = require('./routes/bedTypeRoutes');
const floorRoutes = require('./routes/floorRoutes');

// Initialize express app
const app = express();

// CORS configuration - Allow production and development origins
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://localhost:5178',
    'http://localhost:5179',
    'http://localhost:5180',
    'http://localhost:3000',
    process.env.FRONTEND_URL || 'http://localhost:5173'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check if origin is allowed or if it's a vercel.app domain in production
        if (allowedOrigins.indexOf(origin) !== -1 ||
            (process.env.NODE_ENV === 'production' && origin?.includes('.vercel.app'))) {
            return callback(null, true);
        }

        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// MongoDB Connection with caching for serverless
let cachedDb = null;

const connectDB = async () => {
    if (cachedDb) {
        console.log('✅ Using cached database connection');
        return cachedDb;
    }

    try {
        console.log('🔄 Connecting to MongoDB...');
        console.log('📍 URI:', process.env.MONGODB_URI ? 'Found in .env' : 'Using default localhost');

        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bareena-atithi');

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        console.log("Connected to DB:", conn.connection.name);
        cachedDb = conn;
        return conn;
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        console.error('💡 Check your MONGODB_URI in .env file');
        throw error;
    }
};

// Connect to database
connectDB().catch(err => {
    console.error('Failed to connect to MongoDB:', err);
});

// Routes
app.use('/api/menu', menuRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/qr', qrCodeRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/cashier', cashierRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/facilities', roomFacilityRoutes);
app.use('/api/bed-types', bedTypeRoutes);
app.use('/api/floors', floorRoutes);
const roomFacilityTypeRoutes = require('./routes/roomFacilityTypeRoutes');
app.use('/api/facility-types', roomFacilityTypeRoutes);
const mealTypeRoutes = require('./routes/mealTypeRoutes');
app.use('/api/meal-types', mealTypeRoutes);
const reservationTypeRoutes = require('./routes/reservationTypeRoutes');
app.use('/api/reservation-types', reservationTypeRoutes);

const extraChargeRoutes = require('./routes/extraChargeRoutes');
app.use('/api/extra-charges', extraChargeRoutes);

const complimentaryServiceRoutes = require('./routes/complimentaryServiceRoutes');
app.use('/api/complimentary-services', complimentaryServiceRoutes);

const customerIdentityRoutes = require('./routes/customerIdentityRoutes');
app.use('/api/customer-identities', customerIdentityRoutes);

const bookingSourceRoutes = require('./routes/bookingSourceRoutes');
app.use('/api/booking-sources', bookingSourceRoutes);

const businessSourceRoutes = require('./routes/businessSourceRoutes');
app.use('/api/business-sources', businessSourceRoutes);

const maintenanceBlockRoutes = require('./routes/maintenanceBlockRoutes');
app.use('/api/maintenance-blocks', maintenanceBlockRoutes);

const guestMealRoutes = require('./routes/guestMealRoutes');
app.use('/api/guest-meal', guestMealRoutes);



// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Bareena Atithi API - Food Menu Management',
        version: '1.0.0'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Server configuration
const PORT = process.env.PORT || 5001;

// Only listen if not in serverless environment (Vercel)
// Function to start server with port fallback
// Function to start server with port fallback
const startServer = (port) => {
    const numericPort = parseInt(port, 10);
    const server = app.listen(numericPort, () => {
        console.log(`Server running on port ${numericPort}`);
        console.log(`API available at http://localhost:${numericPort}`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            const nextPort = numericPort + 1;
            console.error(`ERROR: Port ${numericPort} is already in use.`);
            console.log(`⚠️  Trying next available port: ${nextPort}...`);
            startServer(nextPort);
        } else {
            console.error('Server error:', err);
        }
    });
};

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    startServer(PORT);
}

// Export for Vercel serverless
module.exports = app;
