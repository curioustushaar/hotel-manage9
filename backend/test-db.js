const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const test = async () => {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI || 'mongodb://localhost:27017/bareena-atithi');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bareena-atithi');
        console.log('Connected!');
        const Room = mongoose.model('Room', new mongoose.Schema({ roomNumber: String }));
        const rooms = await Room.find();
        console.log('Rooms found:', rooms.length);
        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
};

test();
