const Claim = require('../models/Claim');
const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');
const { getModelHealthSnapshot } = require('../services/modelHealthService');

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

// @desc    Get real-time worker telemetry for admin dashboard
// @route   GET /api/admin/workers
// @access  Private/Admin
const getWorkers = async (req, res) => {
  try {
    const workers = await WorkerProfile.find().populate('user', 'name email');

    const formatted = workers.map(w => ({
      id: w._id,
      apiId: w.apiId,
      platform: w.platform,
      name: w.user?.name || w.name,
      email: w.user?.email,
      contact: w.contact,
      activeStatus: w.activeStatus,
      location: w.location,
      claimEligibilityStatus: w.claimEligibilityStatus,
      lastSyncTime: w.lastSyncTime
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get realtime health status of all ML model APIs
// @route   GET /admin/model-health
// @access  Private/Admin
const getModelHealth = async (req, res) => {
  try {
    const snapshot = await getModelHealthSnapshot();
    res.json(snapshot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Claim auto-payout schedule (no worker dashboard action)
// @route   GET /admin/payout-schedule
// @access  Private/Admin
const getPayoutSchedule = (req, res) => {
  const raw = process.env.CLAIM_PAYOUT_SLOTS || '6,12,18,22';
  const dailySlotHours = raw
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((h) => Number.isFinite(h) && h >= 0 && h <= 23);
  res.json({
    everyHours: 3,
    dailySlotHours: dailySlotHours.length ? dailySlotHours : [6, 12, 18, 22],
    timezoneNote: 'Daily slots use the server local clock.',
    behavior:
      'Eligible claims (processing, approved with payout, queued payouts) are settled automatically on this schedule.'
  });
};

module.exports = {
  getAllClaims,
  getSystemStats,
  getWorkers,
  getModelHealth,
  getPayoutSchedule
};
