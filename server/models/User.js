const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const badgeSchema = new mongoose.Schema({
  name: String,
  description: String,
  icon: String,
  earnedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['student', 'organizer', 'admin'], default: 'student' },
  department: { type: String, default: '' },
  year: { type: Number, min: 1, max: 5 },
  avatar: { type: String, default: '' },
  points: { type: Number, default: 0 },
  badges: [badgeSchema],
  readAnnouncements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Announcement' }],
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
