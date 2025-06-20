// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Path to User model
require('dotenv').config(); // To access JWT_SECRET

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET === 'your_jwt_secret_here' || JWT_SECRET === 'aVerySecureSecretStringPleaseChange') {
    console.error("FATAL ERROR: JWT_SECRET is not defined or is set to a default placeholder in .env file.");
    console.log("Please set a strong, unique JWT_SECRET in your .env file for security.");
    // In a real app, you might want to prevent the app from starting or running in a degraded mode.
    // For this exercise, we'll log an error. Operations requiring JWT will fail if it's not properly set.
}

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }
    if (password.length < 6) {
         return res.status(400).json({ msg: 'Password must be at least 6 characters long' });
    }

    try {
        let user = await User.findOne({ username: username.toLowerCase() });
        if (user) {
            return res.status(400).json({ msg: 'Username already exists' });
        }

        user = new User({
            username: username.toLowerCase(), // Store username in lowercase for consistency
            password,
        });

        await user.save(); // Password will be hashed by the pre-save hook in User.js

        // Create and return a JWT
        const payload = {
            user: {
                id: user.id, // Mongoose uses 'id' as a virtual getter for '_id'
            },
        };

        if (!JWT_SECRET || JWT_SECRET === 'your_jwt_secret_here' || JWT_SECRET === 'aVerySecureSecretStringPleaseChange') {
            console.error("JWT_SECRET not found or is insecure, cannot sign token for new user.");
            return res.status(500).send('Server Error: Could not process registration (JWT Secret missing or insecure).');
        }

            jwt.sign(
                payload,
                JWT_SECRET,
                { expiresIn: '5h' }, // Token expiration (e.g., 5 hours)
                (err, token) => {
                    if (err) { // Handle error during token signing specifically
                        console.error('JWT sign error during registration:', err);
                        return res.status(500).json({ msg: 'Failed to sign token' });
                    }
                    res.status(201).json({
                        token,
                        user: { id: user.id, username: user.username } // Return some user info
                    });
                }
            );
        } catch (err) {
            // Pass other errors to the centralized error handler
            next(err);
        }
    });

// @route   POST /api/auth/login
// @desc    Authenticate user and get token (login)
// @access  Public
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    try {
        // Find user by username (ensure it's queried in lowercase as stored)
        // Explicitly select the password field as it's not selected by default
        const user = await User.findOne({ username: username.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials (user not found)' });
        }

        // Compare submitted password with stored hashed password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials (password mismatch)' });
        }

        // User authenticated, create and return JWT
        const payload = {
            user: {
                id: user.id,
            },
        };

        if (!JWT_SECRET || JWT_SECRET === 'your_jwt_secret_here' || JWT_SECRET === 'aVerySecureSecretStringPleaseChange') {
            console.error("JWT_SECRET not found or is insecure, cannot sign token for login.");
            return res.status(500).send('Server Error: Could not process login (JWT Secret missing or insecure).');
        }

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                    if (err) { // Handle error during token signing specifically
                        console.error('JWT sign error during login:', err);
                        return res.status(500).json({ msg: 'Failed to sign token' });
                    }
                    res.json({
                    token,
                    user: { id: user.id, username: user.username }
                    });
            }
        );
    } catch (err) {
            // Pass other errors to the centralized error handler
            next(err);
    }
});

module.exports = router;
