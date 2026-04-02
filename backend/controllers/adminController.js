const Claim = require('../models/Claim');
const User = require('../models/User');

// @desc    Get all claims system-wide
// @route   GET /api/admin/claims
// @access  Private/Admin
const getAllClaims = async (req, res) => {
  try {
    const claims = await Claim.find().sort({ createdAt: -1 });
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get system-wide stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const claims = await Claim.find();
    
    let totalPaidOut = 0;
    let fraudBlockedCount = 0;
    let activeProcessingCount = 0;

    claims.forEach(c => {
      if (c.status === 'paid') totalPaidOut += c.payoutINR;
      if (c.status === 'blocked') fraudBlockedCount++;
      if (c.status === 'processing') activeProcessingCount++;
    });

    res.json({
      totalUsers,
      totalClaims: claims.length,
      totalPaidOut,
      fraudBlockedCount,
      activeProcessingCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllClaims,
  getSystemStats
};
