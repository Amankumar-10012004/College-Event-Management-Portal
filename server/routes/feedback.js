const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const { awardPoints } = require('../utils/gamification');

// POST /api/feedback/:eventId
router.post('/:eventId', protect, authorize('student'), async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.date > new Date()) return res.status(400).json({ message: 'Cannot rate upcoming events' });

    const attended = await Registration.findOne({
      event: req.params.eventId,
      student: req.user._id,
      status: 'attended',
    });
    if (!attended) return res.status(400).json({ message: 'You must attend the event to leave feedback' });

    const existing = await Feedback.findOne({ event: req.params.eventId, student: req.user._id });
    if (existing) return res.status(400).json({ message: 'Already submitted feedback' });

    const feedback = await Feedback.create({ event: req.params.eventId, student: req.user._id, rating, comment });
    await awardPoints(req.user._id, 'feedback');
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/feedback/:eventId
router.get('/:eventId', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ event: req.params.eventId })
      .populate('student', 'name department')
      .sort('-createdAt');
    const avg = feedbacks.length
      ? feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length
      : 0;
    res.json({ feedbacks, avgRating: avg.toFixed(1), total: feedbacks.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
