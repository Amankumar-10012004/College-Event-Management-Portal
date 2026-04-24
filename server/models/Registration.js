const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  qrCode: { type: String, unique: true, sparse: true },
  qrCodeImage: String,
  status: {
    type: String,
    enum: ['registered', 'waitlisted', 'cancelled', 'attended'],
    default: 'registered'
  },
  waitlistPosition: Number,
  checkedInAt: Date,
}, { timestamps: true });

registrationSchema.index({ event: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
