const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const { awardPoints, checkAndAwardBadges } = require('../utils/gamification');
const { sendEmail, registrationConfirmEmail } = require('../utils/email');

// POST /api/registrations/:eventId/register
router.post('/:eventId/register', protect, authorize('student'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.status === 'cancelled') return res.status(400).json({ message: 'Event is cancelled' });

    const existing = await Registration.findOne({ event: event._id, student: req.user._id });
    if (existing) return res.status(400).json({ message: 'Already registered for this event' });

    const isWaitlisted = event.totalRegistrations >= event.capacity;
    let waitlistPosition = null;

    if (isWaitlisted) {
      const waitlistCount = await Registration.countDocuments({ event: event._id, status: 'waitlisted' });
      waitlistPosition = waitlistCount + 1;
    }

    const qrCode = uuidv4();
    const qrCodeImage = await QRCode.toDataURL(
      JSON.stringify({ registrationId: qrCode, eventId: event._id, studentId: req.user._id })
    );

    const registration = await Registration.create({
      event: event._id,
      student: req.user._id,
      qrCode,
      qrCodeImage,
      status: isWaitlisted ? 'waitlisted' : 'registered',
      waitlistPosition,
    });

    if (!isWaitlisted) {
      await Event.findByIdAndUpdate(event._id, { $inc: { totalRegistrations: 1 } });
      await awardPoints(req.user._id, 'register');
    }

    // Send confirmation email (mocked in dev)
    await sendEmail({
      to: req.user.email,
      subject: `Registration Confirmed: ${event.title}`,
      html: registrationConfirmEmail(req.user.name, event.title, event.date, qrCodeImage),
    });

    res.status(201).json({ registration, isWaitlisted, waitlistPosition });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/registrations/:eventId/cancel
router.delete('/:eventId/cancel', protect, async (req, res) => {
  try {
    const reg = await Registration.findOneAndDelete({
      event: req.params.eventId,
      student: req.user._id,
    });
    if (!reg) return res.status(404).json({ message: 'Registration not found' });

    if (reg.status === 'registered') {
      await Event.findByIdAndUpdate(req.params.eventId, { $inc: { totalRegistrations: -1 } });
      await awardPoints(req.user._id, 'cancelPenalty');

      // Promote first waitlisted
      const next = await Registration.findOneAndUpdate(
        { event: req.params.eventId, status: 'waitlisted' },
        { status: 'registered', waitlistPosition: null },
        { sort: { waitlistPosition: 1 }, new: true }
      );
      if (next) {
        await Event.findByIdAndUpdate(req.params.eventId, { $inc: { totalRegistrations: 1 } });
        await awardPoints(next.student, 'register');
      }
    }
    res.json({ message: 'Registration cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/registrations/my - student's registrations
router.get('/my', protect, async (req, res) => {
  try {
    const regs = await Registration.find({ student: req.user._id })
      .populate('event')
      .sort('-createdAt');
    res.json(regs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/registrations/:eventId/attendees - organizer/admin
router.get('/:eventId/attendees', protect, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const regs = await Registration.find({ event: req.params.eventId })
      .populate('student', 'name email department year')
      .sort('-createdAt');
    res.json(regs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/registrations/checkin - QR check-in
router.post('/checkin', protect, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { qrCode } = req.body;
    const reg = await Registration.findOne({ qrCode }).populate('student', 'name email').populate('event', 'title');
    if (!reg) return res.status(404).json({ message: 'QR code not found' });
    if (reg.status === 'attended') return res.status(400).json({ message: 'Already checked in', student: reg.student });

    reg.status = 'attended';
    reg.checkedInAt = new Date();
    await reg.save();

    await Event.findByIdAndUpdate(reg.event._id, { $inc: { attendanceCount: 1 } });
    await awardPoints(reg.student._id, 'attend');

    // Check badges
    const attended = await Registration.countDocuments({ student: reg.student._id, status: 'attended' });
    const total = await Registration.countDocuments({ student: reg.student._id });
    await checkAndAwardBadges(reg.student._id, { attended, totalRegistrations: total });

    res.json({ message: 'Check-in successful', student: reg.student, event: reg.event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
