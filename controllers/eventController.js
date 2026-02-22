import { body, validationResult } from 'express-validator';
import Event from '../models/Event.js';
import EventBooking from '../models/EventBooking.js';

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

// Get all events (Public - for frontend display)
export const getAllEvents = async (req, res) => {
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
};

// Get single event (Public)
export const getEventById = async (req, res) => {
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
};

// Create event (Dashboard - Admin/Editor only)
export const createEvent = async (req, res) => {
    try {
        const validationError = handleValidationErrors(req, res);
        if (validationError) return validationError;

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
};

// Update event (Dashboard - Admin/Editor only)
export const updateEvent = async (req, res) => {
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
};

// Delete event (Dashboard - Admin only)
export const deleteEvent = async (req, res) => {
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
};

// Get event bookings (Dashboard - Admin/Editor only)
export const getEventBookings = async (req, res) => {
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
};