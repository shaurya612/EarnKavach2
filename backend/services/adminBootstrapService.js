const User = require('../models/User');

const ADMIN_EMAIL = 'sudhansukumar709@gmail.com';
const ADMIN_PASSWORD = 'password123';

const ensureSingleAdmin = async () => {
  // Enforce single-admin policy: everyone else is a worker.
  await User.updateMany({ email: { $ne: ADMIN_EMAIL } }, { $set: { role: 'worker' } });

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (!existing) {
    await User.create({
      name: 'Sudhansu Admin',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      platform: 'Other',
      role: 'admin'
    });
    return;
  }

  existing.role = 'admin';
  existing.password = ADMIN_PASSWORD;
  await existing.save();
};

module.exports = {
  ensureSingleAdmin,
  ADMIN_EMAIL
};
