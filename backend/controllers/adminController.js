const Claim = require('../models/Claim');
const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');
const { getModelHealthSnapshot } = require('../services/modelHealthService');
const riskService = require('../services/riskService');
const axios = require('axios');

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

    const assumedWeeklyPremium = 49;
    const totalPremiumsEarned = totalUsers * assumedWeeklyPremium;
    const lossRatio = totalPremiumsEarned > 0 ? (totalPaidOut / totalPremiumsEarned) : 0;

    res.json({
      totalUsers,
      totalClaims: claims.length,
      totalPaidOut,
      totalPremiumsEarned,
      lossRatio,
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

// @desc    Get predictive analytics for next 7 days using Weather + Risk ML
// @route   GET /api/admin/predictive-analytics
// @access  Private/Admin
const getPredictiveAnalytics = async (req, res) => {
  try {
    // Default coords (e.g. Bangalore or standard test location)
    // We fetch future 7-day weather from open-meteo
    const lat = 12.9716;
    const lon = 77.5946;
    const weatherReq = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,precipitation_sum&timezone=auto`);
    
    // Calculate expected disruption based on 7-day aggregate prediction
    let totalRainfall = 0;
    const dailyData = weatherReq.data.daily;
    if (dailyData && dailyData.precipitation_sum) {
      totalRainfall = dailyData.precipitation_sum.reduce((a, b) => a + Number(b), 0);
    }
    
    const extremeWeatherEvent = totalRainfall > 50 ? 'High' : (totalRainfall > 20 ? 'Medium' : 'Low');
    
    // Feed it to the existing Risk model
    // [rain, aqi, disruptions]
    const riskInput = [totalRainfall, 150, extremeWeatherEvent === 'High' ? 20 : (extremeWeatherEvent === 'Medium' ? 10 : 2)];
    const riskResult = await riskService.getRiskScore(riskInput);
    
    const baseExpectedClaims = 10;
    const predictedClaimsVolume = Math.round(baseExpectedClaims * (riskResult.risk_score || 1.0));
    
    res.json({
      expectedRainfall_7d: totalRainfall,
      extremeWeatherEvent,
      averagePredictedRiskScore: riskResult.risk_score || 1.0,
      predictedClaimsVolume
    });
  } catch (error) {
    console.error('Error in predictive analytics:', error);
    res.status(500).json({ message: 'Failed to generate predictive analytics' });
  }
};

module.exports = {
  getAllClaims,
  getSystemStats,
  getWorkers,
  getModelHealth,
  getPayoutSchedule,
  getPredictiveAnalytics
};
