import express from 'express';
import { body, validationResult } from 'express-validator';
import EventBooking from '../models/EventBooking.js';
import Event from '../models/Event.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Book an event (Public)
router.post('/',
    [
        body('eventId').notEmpty().withMessage('Event ID is required'),
        body('name').notEmpty().withMessage('Name is required'),
        body('phone').notEmpty().withMessage('Phone number is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('nationalId').notEmpty().withMessage('National ID is required'),
        body('academicYear').notEmpty().withMessage('Academic year is required'),
        body('academicDivision').notEmpty().withMessage('Academic division is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    msg: errors.array()[0].msg
                });
            }

            // Check if event exists and is active
            const event = await Event.findById(req.body.eventId);
            if (!event || !event.isActive) {
                return res.status(404).json({
                    success: false,
                    msg: 'Event not found or not available'
                });
            }

            // Check if event is upcoming
            if (!event.isUpcoming) {
                return res.status(400).json({
                    success: false,
                    msg: 'Registration is closed for this event'
                });
            }

            // Check if max participants reached
            if (event.maxParticipants) {
                const bookingCount = await EventBooking.countDocuments({
                    eventId: event._id,
                    paymentStatus: { $in: ['pending', 'paid'] }
                });
                
                if (bookingCount >= event.maxParticipants) {
                    return res.status(400).json({
                        success: false,
                        msg: 'Event is full'
                    });
                }
            }

            // Check for duplicate booking
            const existingBooking = await EventBooking.findOne({
                eventId: req.body.eventId,
                nationalId: req.body.nationalId
            });

            if (existingBooking) {
                return res.status(400).json({
                    success: false,
                    msg: 'You have already registered for this event'
                });
            }

            // Create booking
            const bookingData = {
                ...req.body,
                paymentAmount: event.registrationFee || 0,
                paymentStatus: event.registrationFee > 0 ? 'pending' : 'paid'
            };

            const booking = await EventBooking.create(bookingData);

            res.status(201).json({
                success: true,
                msg: 'Event booking successful',
                data: booking
            });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({
                    success: false,
                    msg: 'You have already registered for this event'
                });
            }
            res.status(500).json({
                success: false,
                msg: 'Error creating booking',
                error: error.message
            });
        }
    }
);

// Get all bookings (Dashboard - Admin/Editor only)
router.get('/',
    authenticate,
    authorize('admin', 'editor'),
    async (req, res) => {
        try {
            const { eventId, paymentStatus } = req.query;
            
            let query = {};
            if (eventId) query.eventId = eventId;
            if (paymentStatus) query.paymentStatus = paymentStatus;

            const bookings = await EventBooking.find(query)
                .populate('eventId', 'title mainTitle date')
                .sort({ createdAt: -1 });

            res.json({
                success: true,
                data: bookings
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                msg: 'Error fetching bookings',
                error: error.message
            });
        }
    }
);

// Get single booking (Dashboard - Admin/Editor only)
router.get('/:id',
    authenticate,
    authorize('admin', 'editor'),
    async (req, res) => {
        try {
            const booking = await EventBooking.findById(req.params.id)
                .populate('eventId');

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    msg: 'Booking not found'
                });
            }

            res.json({
                success: true,
                data: booking
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                msg: 'Error fetching booking',
                error: error.message
            });
        }
    }
);

// Update booking payment status (Dashboard - Admin/Editor only)
router.patch('/:id/payment',
    authenticate,
    authorize('admin', 'editor'),
    [
        body('paymentStatus').isIn(['pending', 'paid', 'cancelled']).withMessage('Invalid payment status'),
        body('paymentMethod').optional().notEmpty(),
        body('paymentReference').optional().notEmpty()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    msg: errors.array()[0].msg
                });
            }

            const booking = await EventBooking.findById(req.params.id);

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    msg: 'Booking not found'
                });
            }

            booking.paymentStatus = req.body.paymentStatus;
            if (req.body.paymentMethod) booking.paymentMethod = req.body.paymentMethod;
            if (req.body.paymentReference) booking.paymentReference = req.body.paymentReference;
            if (req.body.paymentStatus === 'paid') {
                booking.paymentDate = new Date();
                booking.isConfirmed = true;
            }

            await booking.save();

            res.json({
                success: true,
                msg: 'Booking payment status updated',
                data: booking
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                msg: 'Error updating booking',
                error: error.message
            });
        }
    }
);

// Delete booking (Dashboard - Admin only)
router.delete('/:id',
    authenticate,
    authorize('admin'),
    async (req, res) => {
        try {
            const booking = await EventBooking.findById(req.params.id);

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    msg: 'Booking not found'
                });
            }

            await booking.deleteOne();

            res.json({
                success: true,
                msg: 'Booking deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                msg: 'Error deleting booking',
                error: error.message
            });
        }
    }
);

export default router;

