const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

// GET /api/announcements
router.get('/', protect, async (req, res) => {
  try {
    const query = { $or: [{ targetRole: 'all' }, { targetRole: req.user.role }] };
    const announcements = await Announcement.find(query)
      .populate('postedBy', 'name role')
      .sort('-createdAt')
      .limit(20);
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/announcements
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { title, body, targetRole, priority, event } = req.body;
    const announcement = await Announcement.create({
      title, body, targetRole, priority, event: event || null,
      postedBy: req.user._id,
    });
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/announcements/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
