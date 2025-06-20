// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

const UserSchema = new mongoose.Schema({
    username: { // Using username, can be changed to email easily
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, underscore, dot, or hyphen']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6, // Enforce a minimum password length
        select: false, // Do not return password by default when querying a user
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Middleware to hash password before saving a new user
UserSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10); // Generate a salt
        this.password = await bcrypt.hash(this.password, salt); // Hash the password
        next();
    } catch (error) {
        next(error); // Pass errors to the next middleware
    }
});

// Method to compare candidate password with the hashed password in the database
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
