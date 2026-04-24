const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetRole: {
    type: String,
    enum: ['all', 'student', 'organizer'],
    default: 'all'
  },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
