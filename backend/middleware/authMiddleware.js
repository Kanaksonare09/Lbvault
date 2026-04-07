const jwt = require('jsonwebtoken');

const authMiddleware = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return async (req, res, next) => {
        const token = req.header('Authorization');
        
        if (!token || !token.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Access Denied. No token provided.' });
        }

        try {
            const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'fallback_secret');
            req.user = decoded;
            
            // ROLE + STATUS VERIFICATION
            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({ message: 'Forbidden. Insufficient permissions.' });
            }

            // Real-time Status Verification for sensitive roles (Doctor/Pathology)
            // JWT might be valid but admin could have revoked access
            if (req.user.role === 'doctor' || req.user.role === 'pathology') {
                const User = require('../models/User');
                const user = await User.findById(req.user.id).select('status');
                if (!user || user.status !== 'APPROVED') {
                    return res.status(403).json({ message: 'Account not approved or suspended.' });
                }
            }

            next();
        } catch (error) {
            return res.status(401).json({ message: 'Invalid token.' });
        }
    };
};

module.exports = authMiddleware;
