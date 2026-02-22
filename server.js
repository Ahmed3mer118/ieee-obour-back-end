import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import routes
import userRoutes from './routes/users.js';
import eventRoutes from './routes/events.js';
import bookingRoutes from './routes/bookings.js';
import dashboardRoutes from './routes/dashboard.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/users', userRoutes);
app.use('/events', eventRoutes);
app.use('/bookings', bookingRoutes);
app.use('/dashboard', dashboardRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running'
    });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

