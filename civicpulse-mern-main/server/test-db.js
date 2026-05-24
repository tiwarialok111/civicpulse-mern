require('dotenv').config();
const connectDB = require('./src/config/db');

async function testConnection() {
  try {
    await connectDB();
    console.log("Database connection test was successful!");
    process.exit(0);
  } catch (error) {
    console.error("Database connection test failed:", error);
    process.exit(1);
  }
}

testConnection();
