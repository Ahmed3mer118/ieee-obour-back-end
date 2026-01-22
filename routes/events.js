import express from 'express';
import { body, validationResult } from 'express-validator';
import Event from '../models/Event.js';
import EventBooking from '../models/EventBooking.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all events (Public - for frontend display)
router.get('/', async (req, res) => {
    try {
        const { type } = req.query; // 'upcoming' or 'past'
        
        let query = {};
        if (type === 'upcoming') {
            query = { isUpcoming: true, isActive: true };
        } else if (type === 'past') {
            query = { isUpcoming: false, isActive: true };
        } else {
            query = { isActive: true };
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
});

// Get single event (Public)
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .select('-createdBy');

        if (!event) {
            return res.status(404).json({
                success: false,
                msg: 'Event not found'
            });
        }

        res.json({
            success: true,
            data: event
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error fetching event',
            error: error.message
        });
    }
});

// Create event (Dashboard - Admin/Editor only)
router.post('/',
    authenticate,
    authorize('admin', 'editor'),
    [
        body('title').notEmpty().withMessage('Title is required'),
        body('mainTitle').notEmpty().withMessage('Main title is required'),
        body('description').notEmpty().withMessage('Description is required'),
        body('date').notEmpty().withMessage('Date is required'),
        body('eventDate').isISO8601().withMessage('Valid event date is required')
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

            const eventData = {
                ...req.body,
                createdBy: req.user._id
            };

            const event = await Event.create(eventData);

            res.status(201).json({
                success: true,
                msg: 'Event created successfully',
                data: event
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                msg: 'Error creating event',
                error: error.message
            });
        }
    }
);

// Update event (Dashboard - Admin/Editor only)
router.patch('/:id',
    authenticate,
    authorize('admin', 'editor'),
    async (req, res) => {
        try {
            const event = await Event.findById(req.params.id);

            if (!event) {
                return res.status(404).json({
                    success: false,
                    msg: 'Event not found'
                });
            }

            // Update event
            Object.assign(event, req.body);
            await event.save();

            res.json({
                success: true,
                msg: 'Event updated successfully',
                data: event
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                msg: 'Error updating event',
                error: error.message
            });
        }
    }
);

// Delete event (Dashboard - Admin only)
router.delete('/:id',
    authenticate,
    authorize('admin'),
    async (req, res) => {
        try {
            const event = await Event.findById(req.params.id);

            if (!event) {
                return res.status(404).json({
                    success: false,
                    msg: 'Event not found'
                });
            }

            // Soft delete - set isActive to false
            event.isActive = false;
            await event.save();

            res.json({
                success: true,
                msg: 'Event deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                msg: 'Error deleting event',
                error: error.message
            });
        }
    }
);

// Get event bookings (Dashboard - Admin/Editor only)
router.get('/:id/bookings',
    authenticate,
    authorize('admin', 'editor'),
    async (req, res) => {
        try {
            const bookings = await EventBooking.find({ eventId: req.params.id })
                .populate('eventId', 'title mainTitle')
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

export default router;

