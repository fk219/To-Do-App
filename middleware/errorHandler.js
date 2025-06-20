// middleware/errorHandler.js
function errorHandler(err, req, res, next) {
    console.error("ERROR LOG:", new Date().toISOString());
    console.error("Route:", req.path);
    console.error("Error:", err.message);
    if (err.stack) {
        console.error("Stack Preview:", err.stack.split('\n')[0] + (err.stack.split('\n').length > 1 ? '...' : ''));
    }

    let statusCode = err.statusCode || 500; // Default to 500 Internal Server Error
    let message = err.message || 'An unexpected error occurred on the server.';

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        // Collect all validation error messages
        const messages = Object.values(err.errors).map(val => val.message);
        message = `Validation Failed: ${messages.join(', ')}`;
    }

    // Mongoose duplicate key error (e.g. unique username)
    if (err.code === 11000) { // MongoDB duplicate key error code
        statusCode = 400;
        // Extract field name from error message if possible
        const fieldMatch = err.message.match(/index: (.+?)_1/);
        const field = fieldMatch ? fieldMatch[1] : 'Field';
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    }

    // Mongoose CastError (e.g. invalid ObjectId format for ID fields)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 400;
        message = `Invalid ID format for resource path: ${err.path}. Value: "${err.value}"`;
    }

    // Specific check for JWT errors if not handled before reaching here
    // (though auth middleware tries to handle them)
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = err.message; // Use the message from jwt library
    }


    // Avoid sending stack trace or overly detailed errors to client in production
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
        message = 'Internal Server Error. Please try again later.';
    }

    // If headers have already been sent, delegate to the default Express error handler.
    if (res.headersSent) {
        return next(err);
    }

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        // Optionally, include stack in development:
        // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
}

module.exports = errorHandler;
