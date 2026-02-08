import { body, validationResult } from 'express-validator';
import Event from '../models/Event.js';
import EventBooking from '../models/EventBooking.js';
import User from '../models/User.js';

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

// Get all events for dashboard
export const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

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

// Create event
export const createEvent = async (req, res) => {
    try {
        const validationError = handleValidationErrors(req, res);
        if (validationError) return validationError;

        const eventData = {
            ...req.body,
            createdBy: req.user._id
        };

        const event = await Event.create(eventData);

        const events = await Event.find()
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(201).json({
            success: true,
            msg: 'Event created successfully',
            data: events
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error creating event',
            error: error.message
        });
    }
};

// Update event
export const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                msg: 'Event not found'
            });
        }

        Object.assign(event, req.body);
        await event.save();

        const events = await Event.find()
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            msg: 'Event updated successfully',
            data: events
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error updating event',
            error: error.message
        });
    }
};

// Delete event (soft delete)
export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                msg: 'Event not found'
            });
        }

        event.isActive = false;
        await event.save();

        const events = await Event.find()
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            msg: 'Event deleted successfully',
            data: events
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error deleting event',
            error: error.message
        });
    }
};

// Get all bookings
export const getAllBookings = async (req, res) => {
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
};

// Get bookings for specific event
export const getEventBookings = async (req, res) => {
    try {
        const bookings = await EventBooking.find({ eventId: req.params.eventId })
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

// Update booking payment status
export const updateBookingPayment = async (req, res) => {
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
};

// Delete booking
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