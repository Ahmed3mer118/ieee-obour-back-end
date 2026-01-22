import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
    try {
        // Check multiple ways the token might be sent
        let token = null;
        
        // Method 1: Authorization header (Bearer token) - Most common
        const authHeader = req.headers.authorization;
        if (authHeader) {
            if (authHeader.startsWith('Bearer ')) {
                const extractedToken = authHeader.split(' ')[1];
                // Check if token is not undefined or null as string
                if (extractedToken && extractedToken !== 'undefined' && extractedToken !== 'null') {
                    token = extractedToken;
                }
            } else {
                // If no Bearer prefix, assume the whole header is the token
                if (authHeader !== 'undefined' && authHeader !== 'null') {
                    token = authHeader;
                }
            }
        }
        
        // Method 2: Check x-auth-token header (alternative)
        if (!token && req.headers['x-auth-token']) {
            token = req.headers['x-auth-token'];
        }
        
        // Debug logging (only in development)
        if (process.env.NODE_ENV === 'development') {
            console.log('Auth Debug:', {
                hasAuthHeader: !!authHeader,
                authHeaderPreview: authHeader ? (authHeader.length > 30 ? authHeader.substring(0, 30) + '...' : authHeader) : 'none',
                hasToken: !!token,
                tokenLength: token ? token.length : 0,
                allHeaders: Object.keys(req.headers).filter(h => h.toLowerCase().includes('auth'))
            });
        }
        
        if (!token || token === 'undefined' || token === 'null') {
            return res.status(401).json({ 
                success: false,
                msg: 'No token provided, authorization denied' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({ 
                success: false,
                msg: 'User not found' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Auth Error:', {
                name: error.name,
                message: error.message,
                hasToken: !!req.headers.authorization
            });
        }
        
        let errorMsg = 'Token verification failed';
        if (error.name === 'JsonWebTokenError') {
            errorMsg = 'Token is not valid';
        } else if (error.name === 'TokenExpiredError') {
            errorMsg = 'Token has expired';
        }
        
        res.status(401).json({ 
            success: false,
            msg: errorMsg
        });
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                msg: 'Access denied. Insufficient permissions.' 
            });
        }
        next();
    };
};

