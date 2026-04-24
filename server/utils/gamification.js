const User = require('../models/User');

const BADGE_RULES = [
  {
    name: 'Tech Enthusiast',
    description: 'Attended 3 tech events',
    icon: '💻',
    check: (stats) => stats.techAttended >= 3,
  },
  {
    name: 'Social Butterfly',
    description: 'Registered for 5 events',
    icon: '🦋',
    check: (stats) => stats.totalRegistrations >= 5,
  },
  {
    name: 'Punctual Pro',
    description: 'Checked in on time 3 times',
    icon: '⏰',
    check: (stats) => stats.attended >= 3,
  },
  {
    name: 'Culture Vulture',
    description: 'Attended 3 cultural events',
    icon: '🎭',
    check: (stats) => stats.culturalAttended >= 3,
  },
  {
    name: 'Sports Star',
    description: 'Attended 3 sports events',
    icon: '🏆',
    check: (stats) => stats.sportsAttended >= 3,
  },
];

const POINTS = {
  register: 10,
  attend: 25,
  feedback: 5,
  cancelPenalty: -5,
};

const awardPoints = async (userId, action) => {
  const pts = POINTS[action] || 0;
  if (pts === 0) return;
  await User.findByIdAndUpdate(userId, { $inc: { points: pts } });
};

const checkAndAwardBadges = async (userId, stats) => {
  const user = await User.findById(userId);
  if (!user) return;

  const existingBadgeNames = user.badges.map((b) => b.name);
  const newBadges = BADGE_RULES.filter(
    (rule) => !existingBadgeNames.includes(rule.name) && rule.check(stats)
  ).map((rule) => ({ name: rule.name, description: rule.description, icon: rule.icon }));

  if (newBadges.length > 0) {
    user.badges.push(...newBadges);
    await user.save();
  }
  return newBadges;
};

module.exports = { awardPoints, checkAndAwardBadges, POINTS };
