const User = require('../models/User');
const Hotel = require('../models/Hotel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    try {
        const { username, password, role, name } = req.body;

        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ username, password, role, name });

        res.status(201).json({
            _id: user._id,
            username: user.username,
            role: user.role,
            name: user.name,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('[Auth] Register error:', error.message);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        console.log(`[Auth] Login attempt: ${username}`);

        // Find user in database and include hotel information
        const user = await User.findOne({ username }).populate('hotelId');

        if (!user) {
            console.log(`[Auth] User not found: ${username}`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Account is disabled. Please contact support.' });
        }

        // Compare password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log(`[Auth] Password mismatch for: ${username}`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check subscription for admin and staff (not for super_admin)
        if (user.role !== 'super_admin') {
            if (!user.hotelId) {
                console.log(`[Auth] No hotel assigned to user: ${username}`);
                return res.status(403).json({ message: 'No hotel assigned to your account. Please contact support.' });
            }

            // Fetch hotel details
            const hotel = await Hotel.findById(user.hotelId);
            
            if (!hotel) {
                console.log(`[Auth] Hotel not found for user: ${username}`);
                return res.status(403).json({ message: 'Hotel not found. Please contact support.' });
            }

            // Check if hotel is active
            if (!hotel.isActive) {
                console.log(`[Auth] Hotel suspended for user: ${username}`);
                return res.status(403).json({ message: 'Your hotel account has been suspended. Please contact support.' });
            }

            // Check if subscription is active
            if (!hotel.subscription.isActive) {
                console.log(`[Auth] Subscription inactive for user: ${username}`);
                return res.status(403).json({ message: 'Your subscription is inactive. Please contact support.' });
            }

            // Check if subscription has expired
            if (hotel.isSubscriptionExpired()) {
                console.log(`[Auth] Subscription expired for user: ${username}`);
                return res.status(403).json({ message: 'Your subscription has expired. Please renew to continue.' });
            }

            console.log(`[Auth] Login successful: ${username} (${user.role})`);

            return res.json({
                _id: user._id,
                username: user.username,
                role: user.role,
                name: user.name,
                hotelId: hotel._id,
                hotelName: hotel.name,
                token: generateToken(user._id),
            });
        }

        // For super_admin
        console.log(`[Auth] Login successful: ${username} (${user.role})`);

        res.json({
            _id: user._id,
            username: user.username,
            role: user.role,
            name: user.name,
            hotelId: user.hotelId?._id,
            hotelName: user.hotelId?.name,
            permissions: user.permissions || [],
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('[Auth] Login error:', error.message);
        res.status(500).json({ message: 'Server error during login' });
    }
};

module.exports = { registerUser, loginUser };
