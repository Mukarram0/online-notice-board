/**
 * Database Connection Configuration (config/db.js)
 * ------------------------------------------------
 * What it does:
 *   Establishes a connection to the MongoDB database using Mongoose.
 * Why it is needed:
 *   MongoDB stores our application data (Users and Notices). Without this connection,
 *   our Express server cannot query or persist records.
 * How it connects:
 *   Reads the MONGO_URI from environment variables (.env) and connects asynchronously.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/online_notice_board';
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Exit process with failure code if database connection fails
    process.exit(1);
  }
};

module.exports = connectDB;
