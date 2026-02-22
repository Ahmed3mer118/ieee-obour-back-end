import express from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import {
    getAllEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getAllBookings,
    getEventBookings,
    updateBookingPayment,
    deleteBooking
} from '../controllers/dashboardController.js';

const router = express.Router();

// Apply authentication middleware to all dashboard routes
router.use(authenticate);

// Event validation rules
const eventValidation = [
    body('title').notEmpty().withMessage('Title is required'),
    body('mainTitle').notEmpty().withMessage('Main title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('eventDate').isISO8601().withMessage('Valid event date is required')
];

// Payment validation rules
const paymentValidation = [
    body('paymentStatus').isIn(['pending', 'paid', 'cancelled']).withMessage('Invalid payment status')
];

// Event routes
router.get('/events', authorize('admin', 'editor'), getAllEvents);
router.post('/createEvent', authorize('admin', 'editor'), eventValidation, createEvent);
router.patch('/updateEvent/:id', authorize('admin', 'editor'), updateEvent);
router.delete('/deleteEvent/:id', authorize('admin'), deleteEvent);

// Booking routes
router.get('/bookings', authorize('admin', 'editor'), getAllBookings);
router.get('/bookings/:eventId', authorize('admin', 'editor'), getEventBookings);
router.patch('/bookings/:id/payment', authorize('admin', 'editor'), paymentValidation, updateBookingPayment);
router.delete('/bookings/:id', authorize('admin'), deleteBooking);

export default router;