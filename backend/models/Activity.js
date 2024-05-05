// models/Activity.js

const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  activityType: { type: String, enum: ['login', 'logout'], required: true },
  deviceInfo: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
