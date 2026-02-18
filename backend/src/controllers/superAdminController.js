const User = require('../models/User');

const createAdmin = async (req, res) => {
    try {
        const { name, email, password, phone, hotelName, gstNumber, subscriptionStart, subscriptionEnd } = req.body;

        const userExists = await User.findOne({ username: email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            username: email,
            password,
            role: 'admin',
            phone,
            hotelName,
            gstNumber,
            subscriptionStart,
            subscriptionEnd,
            isActive: true
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                username: user.username,
                role: user.role,
                phone: user.phone,
                hotelName: user.hotelName,
                isActive: user.isActive
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllAdmins = async (req, res) => {
    try {
        // Find all admins
        const admins = await User.find({ role: 'admin' }).select('-password');
        res.json(admins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const toggleAdminStatus = async (req, res) => {
    try {
        const admin = await User.findById(req.params.id);

        if (admin && admin.role === 'admin') {
            admin.isActive = !admin.isActive;
            const updatedAdmin = await admin.save();
            res.json({
                message: `Admin account ${admin.isActive ? 'enabled' : 'disabled'}`,
                isActive: updatedAdmin.isActive
            });
        } else {
            res.status(404).json({ message: 'Admin not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateSubscription = async (req, res) => {
    try {
        const { subscriptionStart, subscriptionEnd } = req.body;
        const admin = await User.findById(req.params.id);

        if (admin && admin.role === 'admin') {
            admin.subscriptionStart = subscriptionStart;
            admin.subscriptionEnd = subscriptionEnd;
            await admin.save();
            res.json({ message: 'Subscription updated', subscriptionStart, subscriptionEnd });
        } else {
            res.status(404).json({ message: 'Admin not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createAdmin,
    getAllAdmins,
    toggleAdminStatus,
    updateSubscription
};
