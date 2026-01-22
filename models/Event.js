import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true
    },
    mainTitle: {
        type: String,
        required: [true, 'Event main title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Event description is required']
    },
    date: {
        type: String,
        required: [true, 'Event date is required']
    },
    locationEvent: {
        type: String,
        default: 'Online'
    },
    image: {
        type: String,
        default: ''
    },
    link: {
        type: String,
        default: ''
    },
    eventDate: {
        type: Date,
        required: [true, 'Event date is required']
    },
    isUpcoming: {
        type: Boolean,
        default: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    maxParticipants: {
        type: Number,
        default: null
    },
    registrationFee: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const Event = mongoose.model('Event', eventSchema);

export default Event;

