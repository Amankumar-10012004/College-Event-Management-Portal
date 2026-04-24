const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  endDate: Date,
  venue: { type: String, required: true },
  poster: { type: String, default: '' },
  category: {
    type: String,
    enum: ['tech', 'cultural', 'sports', 'academic', 'workshop', 'other'],
    required: true
  },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  capacity: { type: Number, required: true, min: 1 },
  registrationDeadline: Date,
  isPaid: { type: Boolean, default: false },
  price: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  tags: [String],
  totalRegistrations: { type: Number, default: 0 },
  attendanceCount: { type: Number, default: 0 },
}, { timestamps: true });

eventSchema.virtual('availableSpots').get(function () {
  return Math.max(0, this.capacity - this.totalRegistrations);
});

eventSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
