const Table = require('../models/Table');

// Fetch all tables
exports.getAllTables = async (req, res) => {
    try {
        const tables = await Table.find().sort({ tableNumber: 1 });
        
        // Log unique types
        const uniqueTypes = [...new Set(tables.map(t => t.type || 'General'))];
        console.log('📊 Fetching tables - Total:', tables.length, '| Types:', uniqueTypes);
        
        res.status(200).json({ success: true, count: tables.length, data: tables });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Create a new table
exports.createTable = async (req, res) => {
    try {
        const { tableName, type, capacity, tableNumber, status } = req.body;

        // Validate required fields
        if (!tableName || !tableName.trim()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Table name is required' 
            });
        }

        const tableType = type || 'General';

        // Check if table name already exists in the same type
        const existingTable = await Table.findOne({ 
            tableName: new RegExp(`^${tableName.trim()}$`, 'i'),
            type: tableType
        });

        if (existingTable) {
            return res.status(400).json({ 
                success: false, 
                message: `Table "${tableName}" already exists in "${tableType}" type. Same table names are allowed in different types.` 
            });
        }

        // Create table
        const newTable = await Table.create({
            tableName: tableName.trim(),
            type: tableType,
            capacity: capacity || 4,
            tableNumber: tableNumber || Date.now(),
            status: status || 'Available'
        });

        console.log('✅ Table created:', {
            tableName: newTable.tableName,
            type: newTable.type,
            capacity: newTable.capacity
        });

        res.status(201).json({ success: true, data: newTable });
    } catch (error) {
        console.error('Create table error:', error);
        
        // Handle MongoDB duplicate key error (E11000)
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0];
            if (field === 'tableName' || error.keyPattern?.tableName) {
                const tableName = error.keyValue?.tableName;
                const type = error.keyValue?.type || 'General';
                return res.status(400).json({ 
                    success: false, 
                    message: `Table "${tableName}" already exists in "${type}" type.` 
                });
            }
            return res.status(400).json({ 
                success: false, 
                message: 'A table with this information already exists.' 
            });
        }
        
        res.status(400).json({ 
            success: false, 
            message: 'Error creating table', 
            error: error.message 
        });
    }
};

// Add Reservation to Table
exports.addReservation = async (req, res) => {
    try {
        const { tableId } = req.params;
        const { guestName, guestPhone, date, startTime, endTime, guests, note } = req.body;

        // Validation
        if (!guestPhone || guestPhone.length !== 10) {
            return res.status(400).json({ success: false, message: 'Phone number must be 10 digits' });
        }
        if (endTime <= startTime) {
            return res.status(400).json({ success: false, message: 'End time must be after start time' });
        }

        const table = await Table.findById(tableId);
        if (!table) return res.status(404).json({ success: false, message: 'Table not found' });

        if (guests > table.capacity) {
            return res.status(400).json({ success: false, message: `Guests exceed table capacity of ${table.capacity}` });
        }

        // Time Conflict Check
        // Overlap: (StartA <= EndB) and (EndA >= StartB)
        // New Reservation: StartN, EndN
        // Existing: StartE, EndE
        // Conflict if: NewStart < ExistingEnd AND NewEnd > ExistingStart

        const hasConflict = table.reservations.some(res => {
            if (res.date !== date) return false;
            return (startTime < res.endTime && endTime > res.startTime);
        });

        if (hasConflict) {
            return res.status(409).json({ success: false, message: 'Table already reserved for this time slot' });
        }

        // Add Reservation
        const newReservation = {
            id: new Date().getTime().toString(), // Simple unique ID
            name: guestName,
            phone: guestPhone,
            date,
            startTime,
            endTime,
            guests,
            note,
            status: 'Upcoming'
        };

        table.reservations.push(newReservation);

        // Sort reservations by date and time
        table.reservations.sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.startTime.localeCompare(b.startTime);
        });

        await table.save();

        res.status(200).json({ success: true, message: 'Table reserved successfully', data: table });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Cancel Reservation
exports.cancelReservation = async (req, res) => {
    try {
        const { tableId, reservationId } = req.params;
        const table = await Table.findById(tableId);

        if (!table) return res.status(404).json({ success: false, message: 'Table not found' });

        table.reservations = table.reservations.filter(res => res.id !== reservationId);
        await table.save();

        res.status(200).json({ success: true, message: 'Reservation cancelled', data: table });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Update table status
exports.updateTableStatus = async (req, res) => {
    try {
        const { tableId } = req.params;
        const { status } = req.body;

        const table = await Table.findByIdAndUpdate(tableId, { status }, { new: true });

        if (!table) return res.status(404).json({ success: false, message: 'Table not found' });

        res.status(200).json({ success: true, data: table });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
