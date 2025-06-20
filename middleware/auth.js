// middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config(); // To access JWT_SECRET

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = function(req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token'); // Common header for JWT

    // Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        if (!JWT_SECRET || JWT_SECRET === 'aVerySecureSecretStringPleaseChangeThisBeforeDeployment') {
            console.error("JWT_SECRET is not defined or is set to a default placeholder. Cannot verify token.");
            return res.status(500).json({ msg: 'Server configuration error (JWT Secret missing or insecure)' });
        }
        const decoded = jwt.verify(token, JWT_SECRET);

        // Add user from payload to request object
        req.user = decoded.user; // The payload was { user: { id: user.id } }
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ msg: 'Token is not valid' });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: 'Token has expired' });
        }
        console.error('JWT verification error:', err.message);
        res.status(500).json({ msg: 'Server error during token verification' });
    }
};
