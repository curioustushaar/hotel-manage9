const User = require('../models/User');
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

        // Find user in database
        const user = await User.findOne({ username });

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

        console.log(`[Auth] Login successful: ${username} (${user.role})`);

        res.json({
            _id: user._id,
            username: user.username,
            role: user.role,
            name: user.name,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('[Auth] Login error:', error.message);
        res.status(500).json({ message: 'Server error during login' });
    }
};

module.exports = { registerUser, loginUser };
