# IEEE Backend API

Backend API for IEEE Obour Institute website built with Node.js, Express, and MongoDB.

## Features

- ✅ User Authentication (Signup, Login, OTP Verification)
- ✅ Event Management (CRUD operations)
- ✅ Event Booking System with payment tracking
- ✅ Dashboard for Admin/Editor to manage events
- ✅ Role-based access control (Admin, Editor, User)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
FRONTEND_URL=http://localhost:5173
```

3. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication (`/users`)
- `POST /users/signup` - Register new user
- `POST /users/login` - Login user
- `POST /users/verify` - Verify OTP
- `POST /users/resend-otp` - Resend OTP
- `POST /users/currentUser` - Get current user (Auth required)
- `GET /users/events` - Get all events

### Events (`/events`)
- `GET /events` - Get all events (Public)
- `GET /events?type=upcoming` - Get upcoming events
- `GET /events?type=past` - Get past events
- `GET /events/:id` - Get single event (Public)
- `POST /events` - Create event (Admin/Editor only)
- `PATCH /events/:id` - Update event (Admin/Editor only)
- `DELETE /events/:id` - Delete event (Admin only)
- `GET /events/:id/bookings` - Get event bookings (Admin/Editor only)

### Bookings (`/bookings`)
- `POST /bookings` - Book an event (Public)
- `GET /bookings` - Get all bookings (Admin/Editor only)
- `GET /bookings/:id` - Get single booking (Admin/Editor only)
- `PATCH /bookings/:id/payment` - Update payment status (Admin/Editor only)
- `DELETE /bookings/:id` - Delete booking (Admin only)

### Dashboard (`/dashboard`)
- `GET /dashboard/events` - Get all events (Admin/Editor only)
- `POST /dashboard/createEvent` - Create event (Admin/Editor only)
- `PATCH /dashboard/updateEvent/:id` - Update event (Admin/Editor only)
- `DELETE /dashboard/deleteEvent/:id` - Delete event (Admin only)
- `GET /dashboard/bookings` - Get all bookings (Admin/Editor only)
- `GET /dashboard/bookings/:eventId` - Get bookings for event (Admin/Editor only)
- `PATCH /dashboard/bookings/:id/payment` - Update payment status (Admin/Editor only)
- `DELETE /dashboard/bookings/:id` - Delete booking (Admin only)

## Event Booking Schema

When booking an event, the following fields are required:
- `eventId` - Event ID
- `name` - Full name
- `phone` - Phone number
- `email` - Email address
- `nationalId` - National ID
- `academicYear` - Academic year
- `academicDivision` - Academic division

Optional fields:
- `paymentMethod` - Payment method
- `paymentReference` - Payment reference number
- `notes` - Additional notes

## Event Schema

- `title` - Event title
- `mainTitle` - Main event title
- `description` - Event description
- `date` - Event date (display format)
- `eventDate` - Event date (ISO format for sorting)
- `locationEvent` - Event location
- `image` - Event image URL
- `link` - Event link
- `isUpcoming` - Boolean (true for upcoming events)
- `isActive` - Boolean (false for deleted events)
- `maxParticipants` - Maximum number of participants (optional)
- `registrationFee` - Registration fee (default: 0)

## Authentication

Most dashboard routes require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Roles

- **Admin**: Full access to all features
- **Editor**: Can create and edit events, view bookings
- **User**: Can view events and book events

## Database Models

- **User**: User accounts with authentication
- **Event**: Event information
- **EventBooking**: Event registrations with payment tracking

## Notes

- The backend is ready to connect to MongoDB. Just add your MongoDB connection string to the `.env` file.
- All routes include proper validation and error handling.
- The booking system prevents duplicate registrations for the same event.
- Events can be marked as upcoming or past for better organization.

