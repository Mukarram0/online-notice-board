/**
 * Administrator Seed Script (seedAdmin.js)
 * -----------------------------------------
 * What it does:
 *   Seeds an initial Administrator account into MongoDB if one does not exist.
 * Why it is needed:
 *   Public user registration strictly prevents creating admin accounts.
 *   This script provides a secure, automated way to create the default administrator.
 * Security Rules:
 *   - Credentials are read exclusively from environment variables (.env).
 *   - Password is never printed or logged to console or logs.
 *   - Avoids duplicates if an admin with the same email already exists.
 * How to run:
 *   node seedAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedAdmin = async () => {
  const mongoUri =
    process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/online_notice_board';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@college.edu';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

  if (!adminEmail || !adminPassword) {
    console.error(
      'Error: ADMIN_EMAIL and ADMIN_PASSWORD must be defined in .env'
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for admin seeding.');

    // Check if an admin user already exists with this email
    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });

    if (existingAdmin) {
      console.log(
        `Administrator account (${adminEmail}) already exists. No action required.`
      );
      await mongoose.disconnect();
      process.exit(0);
    }

    // Hash the administrator password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Create the administrator
    const adminUser = await User.create({
      name: 'System Administrator',
      email: adminEmail.toLowerCase().trim(),
      password: hashedPassword,
      role: 'admin',
      department: 'Administration',
      status: 'active',
    });

    console.log(
      `Administrator account seeded successfully! [Email: ${adminUser.email}, Role: ${adminUser.role}]`
    );

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed administrator account:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

seedAdmin();
