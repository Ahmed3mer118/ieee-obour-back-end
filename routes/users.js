import express from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import {
    signup,
    verifyOtp,
    resendOtp,
    login,
    getCurrentUser,
    getEvents
} from '../controllers/authController.js';

const router = express.Router();

// Validation rules
const signupValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const verifyOtpValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').notEmpty().withMessage('OTP is required')
];

const resendOtpValidation = [
    body('email').isEmail().withMessage('Valid email is required')
];

const loginValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
];

// Public routes
router.post('/signup', signupValidation, signup);
router.post('/verify', verifyOtpValidation, verifyOtp);
router.post('/resend-otp', resendOtpValidation, resendOtp);
router.post('/login', loginValidation, login);
router.get('/events', getEvents);

// Protected routes
router.post('/currentUser', authenticate, getCurrentUser);

export default router;