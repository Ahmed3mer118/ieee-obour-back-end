import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

const createAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = process.argv[2] || 'admin@ieee.com';
        const adminPassword = process.argv[3] || 'admin123';
        const adminName = process.argv[4] || 'Admin User';

        // Check if admin exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('Admin user already exists!');
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create({
            name: adminName,
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            isVerified: true
        });

        console.log('Admin user created successfully!');
        console.log(`Email: ${admin.email}`);
        console.log(`Password: ${adminPassword}`);
        console.log('Please change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();

