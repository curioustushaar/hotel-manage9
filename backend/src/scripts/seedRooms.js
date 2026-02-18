const mongoose = require('mongoose');
const Room = require('../models/Room');
const Floor = require('../models/Floor');
const BedType = require('../models/BedType');
const RoomFacilityType = require('../models/RoomFacilityType');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const seedRooms = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for Seeding');

        // Check if rooms exist
        const roomCount = await Room.countDocuments();
        if (roomCount > 0) {
            console.log('Rooms already exist. Skipping seed.');
            process.exit(0);
        }

        // Create Default Floors if they don't exist
        const floors = ['Ground Floor', '1st Floor', '2nd Floor'];
        for (const f of floors) {
            await Floor.findOneAndUpdate({ name: f }, { name: f }, { upsert: true });
        }

        // Create Default Bed Types
        const bedTypes = ['Single', 'Double', 'King', 'Queen'];
        for (const b of bedTypes) {
            await BedType.findOneAndUpdate({ name: b }, { name: b }, { upsert: true });
        }

        // Create Default Room Types
        const roomTypes = ['Deluxe Room', 'Super Deluxe Room', 'Suite'];
        for (const r of roomTypes) {
            await RoomFacilityType.findOneAndUpdate({ name: r }, { name: r }, { upsert: true });
        }

        const rooms = [
            { roomNumber: '101', roomType: 'Deluxe Room', floor: 'Ground Floor', capacity: 2, price: 2500, bedType: 'Double', status: 'Available' },
            { roomNumber: '102', roomType: 'Deluxe Room', floor: 'Ground Floor', capacity: 2, price: 2500, bedType: 'Double', status: 'Available' },
            { roomNumber: '201', roomType: 'Super Deluxe Room', floor: '1st Floor', capacity: 3, price: 3500, bedType: 'Double', status: 'Available' },
            { roomNumber: '202', roomType: 'Super Deluxe Room', floor: '1st Floor', capacity: 3, price: 3500, bedType: 'Double', status: 'Available' },
            { roomNumber: '301', roomType: 'Suite', floor: '2nd Floor', capacity: 4, price: 5500, bedType: 'King', status: 'Available' },
        ];

        await Room.insertMany(rooms);
        console.log('✅ Default Rooms Seeded Successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding rooms:', error);
        process.exit(1);
    }
};

seedRooms();
