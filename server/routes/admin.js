const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Feedback = require('../models/Feedback');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

// GET /api/admin/users
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', protect, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'organizer', 'admin'].includes(role))
      return res.status(400).json({ message: 'Invalid role' });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/analytics
router.get('/analytics', protect, authorize('admin'), async (req, res) => {
  try {
    const [totalUsers, totalEvents, totalRegistrations] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Registration.countDocuments({ status: { $ne: 'cancelled' } }),
    ]);

    // Registrations per event (top 10)
    const regPerEvent = await Registration.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: '$event', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'events', localField: '_id', foreignField: '_id', as: 'event' } },
      { $unwind: '$event' },
      { $project: { name: '$event.title', count: 1 } },
    ]);

    // Category breakdown
    const categoryStats = await Event.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, registrations: { $sum: '$totalRegistrations' } } },
    ]);

    // Monthly registrations
    const monthlyRegs = await Registration.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } },
    ]);

    // User role breakdown
    const roleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    // Avg rating per event
    const avgRatings = await Feedback.aggregate([
      { $group: { _id: '$event', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      { $sort: { avg: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'events', localField: '_id', foreignField: '_id', as: 'event' } },
      { $unwind: '$event' },
      { $project: { name: '$event.title', avg: 1, count: 1 } },
    ]);

    const attendanceRate = totalRegistrations > 0
      ? ((await Registration.countDocuments({ status: 'attended' })) / totalRegistrations * 100).toFixed(1)
      : 0;

    res.json({
      totals: { users: totalUsers, events: totalEvents, registrations: totalRegistrations, attendanceRate },
      regPerEvent,
      categoryStats,
      monthlyRegs,
      roleStats,
      avgRatings,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
