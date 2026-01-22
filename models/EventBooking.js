import mongoose from 'mongoose';

const eventBookingSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: [true, 'Event ID is required']
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    nationalId: {
        type: String,
        required: [true, 'National ID is required'],
        trim: true,
        unique: false // Allow same person to register for different events
    },
    academicYear: {
        type: String,
        required: [true, 'Academic year is required'],
        trim: true
    },
    academicDivision: {
        type: String,
        required: [true, 'Academic division is required'],
        trim: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'cancelled'],
        default: 'pending'
    },
    paymentAmount: {
        type: Number,
        default: 0
    },
    paymentMethod: {
        type: String,
        default: ''
    },
    paymentReference: {
        type: String,
        default: ''
    },
    paymentDate: {
        type: Date,
        default: null
    },
    isConfirmed: {
        type: Boolean,
        default: false
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate registrations for same event
eventBookingSchema.index({ eventId: 1, nationalId: 1 }, { unique: true });

const EventBooking = mongoose.model('EventBooking', eventBookingSchema);

export default EventBooking;

