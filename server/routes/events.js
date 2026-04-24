const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

// Multer setup for poster uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/posters');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `poster-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/events - list with search/filter
router.get('/', async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 12, sort = '-date' } = req.query;
    const query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (status) query.status = status;
    else query.status = { $ne: 'cancelled' };

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('organizer', 'name email department')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ events, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/events/upcoming
router.get('/upcoming', async (req, res) => {
  try {
    const events = await Event.find({
      date: { $gte: new Date() },
      status: 'upcoming',
    }).populate('organizer', 'name').sort('date').limit(6);
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email department');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/events - create
router.post('/', protect, authorize('organizer', 'admin'), upload.single('poster'), async (req, res) => {
  try {
    const { title, description, date, endDate, venue, category, capacity, registrationDeadline, tags, isPaid, price } = req.body;
    const poster = req.file ? `/uploads/posters/${req.file.filename}` : '';

    const event = await Event.create({
      title, description, date, endDate, venue, category, capacity,
      registrationDeadline, tags: tags ? tags.split(',').map(t => t.trim()) : [],
      isPaid: isPaid === 'true', price: isPaid === 'true' ? price : 0,
      organizer: req.user._id, poster,
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/events/:id - edit
router.put('/:id', protect, authorize('organizer', 'admin'), upload.single('poster'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    const updates = { ...req.body };
    if (req.file) updates.poster = `/uploads/posters/${req.file.filename}`;
    if (updates.tags && typeof updates.tags === 'string')
      updates.tags = updates.tags.split(',').map(t => t.trim());

    const updated = await Event.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/events/:id
router.delete('/:id', protect, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/events/organizer/my - organizer's events
router.get('/organizer/my', protect, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).sort('-createdAt');
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
