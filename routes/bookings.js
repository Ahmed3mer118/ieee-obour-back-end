import express from 'express';
import { body } from 'express-validator';
import {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBookingNotes,
    deleteBooking
} from '../controllers/eventBookingController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validation rules for booking creation
const bookingValidation = [
    body('eventId').notEmpty().withMessage('Event ID is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('nationalId').notEmpty().withMessage('National ID is required'),
    body('academicYear').notEmpty().withMessage('Academic year is required'),
    body('academicDivision').notEmpty().withMessage('Academic division is required')
];

// Validation rules for notes update
const notesValidation = [
    body('notes').optional().isString().withMessage('Notes must be a string')
];

// Routes
router.post('/', bookingValidation, createBooking);

router.get('/', authenticate, authorize('admin', 'editor'), getAllBookings);

router.get('/:id', authenticate, authorize('admin', 'editor'), getBookingById);

// تم تغيير الاسم من payment/status إلى notes
router.patch('/:id/notes', authenticate, authorize('admin', 'editor'), notesValidation, updateBookingNotes);

router.delete('/:id', authenticate, authorize('admin'), deleteBooking);

export default router;