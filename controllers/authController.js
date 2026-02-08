import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Event from '../models/Event.js';

// Helper function for validation errors
const handleValidationErrors = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            msg: errors.array()[0].msg
        });
    }
    return null;
};

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// Signup
export const signup = async (req, res) => {
    try {
        const validationError = handleValidationErrors(req, res);
        if (validationError) return validationError;

        const { name, email, password } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                msg: 'User already exists'
            });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            otp,
            otpExpires
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            msg: 'User created successfully. Please verify your email.',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error creating user',
            error: error.message
        });
    }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
    try {
        const validationError = handleValidationErrors(req, res);
        if (validationError) return validationError;

        const { email, otp } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'User not found'
            });
        }

        if (user.otp !== otp) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid OTP'
            });
        }

        if (user.otpExpires < new Date()) {
            return res.status(400).json({
                success: false,
                msg: 'OTP has expired'
            });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        const token = generateToken(user._id);

        res.json({
            success: true,
            msg: 'Email verified successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            },
            token
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error verifying OTP',
            error: error.message
        });
    }
};

// Resend OTP
export const resendOtp = async (req, res) => {
    try {
        const validationError = handleValidationErrors(req, res);
        if (validationError) return validationError;

        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'User not found'
            });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        res.json({
            success: true,
            msg: 'OTP sent successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error resending OTP',
            error: error.message
        });
    }
};

// Login
export const login = async (req, res) => {
    try {
        const validationError = handleValidationErrors(req, res);
        if (validationError) return validationError;

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                msg: 'Invalid credentials'
            });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            msg: 'Login successful',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            },
            token
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error logging in',
            error: error.message
        });
    }
};

// Get current user
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        res.json({
            success: true,
            data: user,
            token: req.headers.authorization?.split(' ')[1]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error fetching user',
            error: error.message
        });
    }
};

// Get events (for users)
export const getEvents = async (req, res) => {
    try {
        const { type } = req.query;
        
        let query = { isActive: true };
        if (type === 'upcoming') {
            query.isUpcoming = true;
        } else if (type === 'past') {
            query.isUpcoming = false;
        }

        const events = await Event.find(query)
            .sort({ eventDate: -1 })
            .select('-createdBy');

        res.json({
            success: true,
            data: events
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error fetching events',
            error: error.message
        });
    }
};