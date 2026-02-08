import { body, validationResult } from 'express-validator';
import EventBooking from '../models/EventBooking.js';
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

// Book an event (Public)
export const createBooking = async (req, res) => {
    try {
        const validationError = handleValidationErrors(req, res);
        if (validationError) return validationError;

        const event = await Event.findById(req.body.eventId);
        if (!event || !event.isActive) {
            return res.status(404).json({
                success: false,
                msg: 'Event not found or not available'
            });
        }

        if (!event.isUpcoming) {
            return res.status(400).json({
                success: false,
                msg: 'Registration is closed for this event'
            });
        }

        if (event.maxParticipants) {
            const bookingCount = await EventBooking.countDocuments({
                eventId: event._id
            });

            if (bookingCount >= event.maxParticipants) {
                return res.status(400).json({
                    success: false,
                    msg: 'Event is full'
                });
            }
        }

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

        const booking = await EventBooking.create(req.body);

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
};

// Get all bookings (Dashboard - Admin/Editor only)
export const getAllBookings = async (req, res) => {
    try {
        const { eventId } = req.query;

        let query = {};
        if (eventId) query.eventId = eventId;

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
};

// Get single booking (Dashboard - Admin/Editor only)
export const getBookingById = async (req, res) => {
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
};

// Update booking notes (Dashboard - Admin/Editor only)
export const updateBookingNotes = async (req, res) => {
    try {
        const validationError = handleValidationErrors(req, res);
        if (validationError) return validationError;

        const booking = await EventBooking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                msg: 'Booking not found'
            });
        }

        // تحديث notes فقط
        if (req.body.notes !== undefined) {
            booking.notes = req.body.notes;
        }

        await booking.save();

        res.json({
            success: true,
            msg: 'Booking notes updated',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error updating booking',
            error: error.message
        });
    }
};

// Delete booking (Dashboard - Admin only)
export const deleteBooking = async (req, res) => {
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
};