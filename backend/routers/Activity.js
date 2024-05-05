// routes/activity.js

const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');

// Log activity
router.post('/log', async (req, res) => {
  const { userEmail, activityType, deviceInfo } = req.body;
  try {
    const activity = new Activity({
      userEmail,
      activityType,
      deviceInfo
    });
    await activity.save();
    res.status(201).json({ message: 'Activity logged successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user activities for a specific userEmail
router.get('/:userEmail', async (req, res) => {
    const userEmail = req.params.userEmail;
    try {
      const activities = await Activity.find({ userEmail }).sort('-timestamp');
      res.json(activities);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  // Get all activities
router.get('/', async (req, res) => {
    try {
      const activities = await Activity.find().sort('-timestamp');
      res.json(activities);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  
module.exports = router;
