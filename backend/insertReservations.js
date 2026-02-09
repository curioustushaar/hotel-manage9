const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Reservation = require('./models/reservationModel');

dotenv.config();

const dummyReservations = [
    {
        guestName: 'Amit Patel',
        status: 'IN_HOUSE',
        referenceId: 'GBB7715a',
        checkInDate: new Date('2026-02-08'),
        checkOutDate: new Date('2026-02-09'),
        nights: 1,
        rooms: 1,
        amount: 3000,
        paid: 720,
        balance: 2280,
        phone: '7054321098',
        email: 'amit@email.com'
    },
    {
        guestName: 'Priya Singh',
        status: 'RESERVED',
        referenceId: 'GBB74a82',
        checkInDate: new Date('2026-02-07'),
        checkOutDate: new Date('2026-02-19'),
        nights: 12,
        rooms: 1,
        amount: 36012,
        paid: 1012,
        balance: 35000,
        phone: '8765432102',
        email: 'priya@email.com'
    },
    {
        guestName: 'Rajesh Kumar',
        status: 'RESERVED',
        referenceId: 'GBB74a5b',
        checkInDate: new Date('2026-02-07'),
        checkOutDate: new Date('2026-02-10'),
        nights: 3,
        rooms: 1,
        amount: 10080,
        paid: 0,
        balance: 10080,
        phone: '9876543210',
        email: 'rajesh@email.com'
    }
];

const insertDummyData = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected');

        // Clear existing reservations
        await Reservation.deleteMany({});
        console.log('Cleared existing reservations');

        // Insert dummy data
        const result = await Reservation.insertMany(dummyReservations);
        console.log(`Successfully inserted ${result.length} reservations`);
        console.log('Dummy data:', JSON.stringify(result, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

insertDummyData();
