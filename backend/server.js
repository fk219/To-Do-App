// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // To load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // To parse JSON request bodies

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI || mongoURI === 'your_mongodb_connection_string_here') {
    console.error("Error: MONGODB_URI is not defined or not set correctly in .env file.");
    console.log("Please set your MongoDB connection string in the .env file.");
    console.log("Backend will not be able to connect to the database.");
    // To prevent the app from crashing immediately if DB is not set during setup,
    // we won't process.exit(1) here but the DB dependent features won't work.
    // For a real deployment, you'd want to exit or have a fallback.
} else {
    mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB Connected Successfully!'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        // process.exit(1); // Optionally exit if DB connection fails in production
    });
}

// Basic Route
app.get('/', (req, res) => {
    res.send('AI Powered Todo App Backend is Running!');
});

// TODO: API routes will be added here later (e.g., app.use('/api/todos', todoRoutes);)
const authRoutes = require('./routes/auth'); // Import the auth routes

// API Routes
const todoRoutes = require('./routes/api'); // Import the todo routes
app.use('/api/todos', todoRoutes);
app.use('/api/auth', authRoutes);  // Add auth routes
const aiRoutes = require('./routes/ai'); // Import the AI routes
app.use('/api/ai', aiRoutes);  // Add AI routes

// Centralized Error Handling Middleware - should be last
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    if (!mongoURI || mongoURI === 'your_mongodb_connection_string_here') {
        console.warn("Warning: MONGODB_URI is not set. Database features will be unavailable.");
    }
});
