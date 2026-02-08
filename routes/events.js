import express from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventBookings
} from '../controllers/eventController.js';

const router = express.Router();

// Validation rules for event creation/update
const eventValidation = [
    body('title').notEmpty().withMessage('Title is required'),
    body('mainTitle').notEmpty().withMessage('Main title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('eventDate').isISO8601().withMessage('Valid event date is required')
];

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Protected routes (Dashboard)
router.post('/', authenticate, authorize('admin', 'editor'), eventValidation, createEvent);
router.patch('/:id', authenticate, authorize('admin', 'editor'), updateEvent);
router.delete('/:id', authenticate, authorize('admin'), deleteEvent);
router.get('/:id/bookings', authenticate, authorize('admin', 'editor'), getEventBookings);

export default router;