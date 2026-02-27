const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all staff for a hotel
// @route   GET /api/staff
// @access  Private (Admin)
const getStaff = async (req, res) => {
    try {
        const query = { role: { $ne: 'super_admin' } };

        // If not super_admin, filter by hotelId
        if (req.user.role !== 'super_admin') {
            if (!req.user.hotelId) {
                return res.status(403).json({ message: 'No hotel assigned to your account' });
            }
            query.hotelId = req.user.hotelId;
        }

        const staff = await User.find(query);
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add new staff member
// @route   POST /api/staff
// @access  Private (Admin)
const addStaff = async (req, res) => {
    try {
        const { fullName, phone, email, password, permissions, outlet, shift, salary, attendanceStatus, performance, image } = req.body;

        const userExists = await User.findOne({ username: email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const role = req.body.role || 'staff';

        const userData = {
            name: fullName,
            username: email,
            password,
            phone,
            role: role,
            permissions: permissions || [],
            // New Staff Management Fields
            outlet: outlet || 'General',
            shift: shift || 'Morning',
            salary: salary || 0,
            attendanceStatus: attendanceStatus || 'Present',
            performance: performance || 0,
            image: image || ''
        };

        // Assign hotelId (either from admin's hotel or from request if super_admin)
        if (req.user.role === 'super_admin') {
            userData.hotelId = req.body.hotelId;
        } else {
            userData.hotelId = req.user.hotelId;
        }

        if (!userData.hotelId) {
            return res.status(400).json({ message: 'Hotel assignment is required' });
        }

        const staff = await User.create(userData);
        res.status(201).json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update staff member
// @route   PUT /api/staff/:id
// @access  Private (Admin)
const updateStaff = async (req, res) => {
    try {
        console.log(`[Staff] Update request for ID: ${req.params.id} by User: ${req.user.username}`);
        const staff = await User.findById(req.params.id);

        if (!staff) {
            console.warn(`[Staff] Update failed: Staff not found for ID ${req.params.id}`);
            return res.status(404).json({ message: 'Staff member not found in database' });
        }

        // Check if admin is authorized to manage this staff
        if (req.user.role !== 'super_admin') {
            if (!req.user.hotelId) {
                console.error(`[Staff] Admin ${req.user.username} has no hotelId`);
                return res.status(403).json({ message: 'Authorization error: Admin has no hotel assigned' });
            }

            if (!staff.hotelId) {
                console.warn(`[Staff] Repairing missing hotelId for staff ${staff.username}`);
                // Repair and continue
            } else if (staff.hotelId.toString() !== req.user.hotelId.toString()) {
                console.warn(`[Staff] Unauthorized access attempt by ${req.user.username} on ${staff.username}`);
                return res.status(401).json({ message: 'Not authorized to manage this staff member (Hotel mismatch)' });
            }
        }

        // Quick single-field updates (shift, attendance, performance, salary) - use findByIdAndUpdate to avoid full validation
        const quickFields = ['shift', 'attendanceStatus', 'performance', 'salary'];
        const bodyKeys = Object.keys(req.body);
        const isQuickUpdate = bodyKeys.length === 1 && quickFields.includes(bodyKeys[0]);

        if (isQuickUpdate) {
            const field = bodyKeys[0];
            const value = req.body[field];
            console.log(`[Staff] Quick update: ${field} = ${value} for ${staff.username}`);
            
            // Also repair hotelId if missing
            const updateObj = { [field]: value };
            if (!staff.hotelId && req.user.hotelId) {
                updateObj.hotelId = req.user.hotelId;
            }
            
            const updatedStaff = await User.findByIdAndUpdate(
                req.params.id,
                { $set: updateObj },
                { new: true, runValidators: false }
            );
            console.log(`[Staff] Quick update successful: ${field} for ${updatedStaff.username}`);
            return res.json(updatedStaff);
        }

        // Full update (from Edit Staff form)
        // Check if new email is already taken by another user
        if (req.body.email && req.body.email !== staff.username) {
            const emailExists = await User.findOne({ username: req.body.email, _id: { $ne: staff._id } });
            if (emailExists) {
                return res.status(400).json({ message: 'The email address is already in use by another staff member' });
            }
            staff.username = req.body.email;
        }

        // Ensure staff member has a hotelId assigned
        if (!staff.hotelId && req.user.hotelId) {
            staff.hotelId = req.user.hotelId;
        }

        if (req.body.fullName) staff.name = req.body.fullName;
        if (req.body.phone) staff.phone = req.body.phone;
        if (req.body.role) staff.role = req.body.role;
        if (req.body.permissions !== undefined) staff.permissions = req.body.permissions;
        if (req.body.outlet) staff.outlet = req.body.outlet;
        if (req.body.shift) staff.shift = req.body.shift;
        if (req.body.salary !== undefined) staff.salary = req.body.salary;
        if (req.body.attendanceStatus) staff.attendanceStatus = req.body.attendanceStatus;
        if (req.body.performance !== undefined) staff.performance = req.body.performance;
        if (req.body.image) staff.image = req.body.image;

        if (req.body.password) {
            staff.password = req.body.password;
        }

        const updatedStaff = await staff.save();
        console.log(`[Staff] Successfully updated staff: ${updatedStaff.username}`);
        res.json(updatedStaff);
    } catch (error) {
        console.error('[Staff] Update error:', error);
        res.status(500).json({ message: error.message || 'Error updating staff' });
    }
};


// @desc    Delete staff member
// @route   DELETE /api/staff/:id
// @access  Private (Admin)
const deleteStaff = async (req, res) => {
    try {
        const staff = await User.findById(req.params.id);

        if (!staff) {
            return res.status(404).json({ message: 'Staff member not found' });
        }

        if (req.user.role !== 'super_admin') {
            if (!staff.hotelId || !req.user.hotelId || staff.hotelId.toString() !== req.user.hotelId.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Staff member removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle staff active status
// @route   PUT /api/staff/toggle/:id
// @access  Private (Admin)
const toggleStaffStatus = async (req, res) => {
    try {
        const staff = await User.findById(req.params.id);

        if (!staff) {
            return res.status(404).json({ message: 'Staff member not found' });
        }

        if (req.user.role !== 'super_admin') {
            if (!staff.hotelId || !req.user.hotelId || staff.hotelId.toString() !== req.user.hotelId.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }
        }

        staff.isActive = !staff.isActive;
        await staff.save();
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStaff,
    addStaff,
    updateStaff,
    deleteStaff,
    toggleStaffStatus
};
