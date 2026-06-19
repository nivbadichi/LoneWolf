const mongoose = require('mongoose');

// Opens the single MongoDB connection shared by every model in the app.
// Call once from server.js on startup, before the server starts listening.
async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
}

module.exports = connectDB;
