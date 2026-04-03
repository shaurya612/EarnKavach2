const Claim = require('../models/Claim');
const WorkerProfile = require('../models/WorkerProfile');
const DECISION_THRESHOLDS = require('../constants/decisionThresholds');
const { fetchWeatherByLocation } = require('./weatherSyncService');
const { detectSuspiciousBehavior, calculateOrderDropRatio } = require('./suspiciousVerifyService');
const fraudService = require('./fraudService');
const incomeService = require('./incomeService');
const gigPlatformService = require('./gigPlatformService');
const { queueClaimPayout } = require('./payoutAutomationService');

const hoursSince = (date) => {
  if (!date) return Number.POSITIVE_INFINITY;
  return (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60);
};

const sumRecentAmounts = (history = [], lookbackHours = 6) => {
  const cutoff = Date.now() - lookbackHours * 60 * 60 * 1000;
  return history
    .filter(h => new Date(h.timestamp).getTime() >= cutoff)
    .reduce((acc, h) => acc + Number(h.amount || 0), 0);
};

const getFraudFeatures = (profile, userClaimsCount) => {
  const history = profile?.deliveryHistory || [];
  const last = history[history.length - 1];
  const movementDistance = Math.abs(Number(profile?.location?.lat || 0) * 2.5 + Number(profile?.location?.lng || 0) * 1.7);
  const avgSpeed = profile?.activeStatus ? 24 : 5;
  const activeTime = Number.isFinite(hoursSince(last?.timestamp)) ? Math.max(0.1, 8 - hoursSince(last?.timestamp)) : 0.1;
  const ordersCompleted = history.length;
  const claimsCount = userClaimsCount;
  const locationVariance = (!profile?.location?.lat || !profile?.location?.lng) ? 1 : 0.2;

  return [movementDistance, avgSpeed, activeTime, ordersCompleted, claimsCount, locationVariance];
};

const ensureWorkerProfile = async (user) => {
  let profile = await WorkerProfile.findOne({ user: user._id });
  const extData = gigPlatformService.fetchWorkerProfileFromPlatform(user.platform, user._id);

  if (!profile) {
    profile = await WorkerProfile.create({
      user: user._id,
      apiId: extData.apiId,
      platform: extData.platform,
      name: user.name,
      contact: extData.contact,
      activeStatus: extData.activeStatus,
      location: extData.location,
      deliveryHistory: extData.deliveryHistory,
      claimEligibilityStatus: false
    });
  } else {
    profile.activeStatus = extData.activeStatus;
    profile.location = extData.location;
    if (extData.deliveryHistory?.length) {
      profile.deliveryHistory = extData.deliveryHistory;
    }
    profile.lastSyncTime = new Date();
    await profile.save();
  }

  return profile;
};

const runAutomatedDecision = async (user) => {
  const profile = await ensureWorkerProfile(user);
  const claims = await Claim.find({ user: user._id }).sort({ createdAt: -1 }).limit(20);

  const weather = await fetchWeatherByLocation(profile.location);
  const suspicious = detectSuspiciousBehavior({ workerProfile: profile, claims });

  const fraudFeatures = getFraudFeatures(profile, claims.length);
  let fraudPrediction = { prediction: 'normal', score: 0 };
  try {
    fraudPrediction = await fraudService.checkFraud(fraudFeatures);
  } catch (error) {
    // Keep automation resilient in case external API is unavailable.
    fraudPrediction = { prediction: 'normal', score: 0 };
  }

  const recentIncome = sumRecentAmounts(profile.deliveryHistory, 6);
  let expectedIncome = recentIncome;
  try {
    const incomeFeatures = [Math.max(1, recentIncome), profile.deliveryHistory.length || 1, weather.severity_score || 1];
    const incomePrediction = await incomeService.predictIncome(incomeFeatures);
    expectedIncome = Number(incomePrediction.expected_income || recentIncome);
  } catch (error) {
    expectedIncome = Math.max(recentIncome, 500);
  }

  const incomeDropRatio = expectedIncome <= 0 ? 0 : Math.max(0, (expectedIncome - recentIncome) / expectedIncome);
  const orderDropRatio = calculateOrderDropRatio(profile.deliveryHistory);
  const lastDeliveryAt = profile.deliveryHistory?.[profile.deliveryHistory.length - 1]?.timestamp;
  const inactivityHours = hoursSince(lastDeliveryAt);
  const workerActiveNoEarnings = !!profile.activeStatus && recentIncome === 0 && inactivityHours >= DECISION_THRESHOLDS.INACTIVITY_THRESHOLD_HOURS;

  const autoTriggerReasons = [];
  if (weather.rainfall > DECISION_THRESHOLDS.RAIN_THRESHOLD) autoTriggerReasons.push('High rainfall');
  if (orderDropRatio > DECISION_THRESHOLDS.ORDER_DROP_THRESHOLD) autoTriggerReasons.push('Low orders');
  if (incomeDropRatio > DECISION_THRESHOLDS.INCOME_DROP_THRESHOLD) autoTriggerReasons.push('Income drop');
  if (workerActiveNoEarnings) autoTriggerReasons.push('Worker active but no earnings');

  const auto_claim_triggered = autoTriggerReasons.length > 0;
  const fraudBlocked = fraudPrediction.prediction === 'fraud';
  const payoutEstimate = Math.max(0, (expectedIncome - recentIncome) * DECISION_THRESHOLDS.DEFAULT_COVERAGE);

  const riskBase = Math.round((weather.severity_score * 0.5) + (incomeDropRatio * 100 * 0.3) + (orderDropRatio * 100 * 0.2));
  const risk_score = Math.min(100, riskBase + (suspicious.suspicious_flag ? 10 : 0) + (fraudBlocked ? 20 : 0));

  if (auto_claim_triggered && !fraudBlocked) {
    const lastAutoClaim = claims.find(c => (c.scenario || '').startsWith('AUTO:'));
    const canCreateClaim = !lastAutoClaim || hoursSince(lastAutoClaim.createdAt) >= 2;

    if (canCreateClaim) {
      const claim = await Claim.create({
        user: user._id,
        scenario: `AUTO: ${autoTriggerReasons.join(' + ')}`,
        platform: user.platform,
        fraudScore: Number(fraudPrediction.score || 0),
        expectedIncome: Math.round(expectedIncome),
        actualIncome: Math.round(recentIncome),
        tier: suspicious.suspicious_flag ? 'Suspicious' : 'Trusted',
        status: payoutEstimate > 0 ? 'paid' : 'approved',
        payoutINR: Math.round(payoutEstimate),
        payoutStatus: payoutEstimate > 0 ? 'queued' : 'not_applicable',
        processingTime: 'Auto-triggered',
        fraudNotes: []
      });

      if (payoutEstimate > 0) {
        const payoutTx = await queueClaimPayout({
          userId: user._id,
          claimId: claim._id,
          amountINR: Math.round(payoutEstimate)
        });
        claim.payoutOrderId = payoutTx?.razorpayOrderId;
        claim.payoutStatus = payoutTx ? 'queued' : 'failed';
        await claim.save();
      }
    }
  }

  if (fraudBlocked && auto_claim_triggered) {
    const lastFraudBlock = claims.find(c => c.status === 'blocked');
    const canCreateBlock = !lastFraudBlock || hoursSince(lastFraudBlock.createdAt) >= 2;

    if (canCreateBlock) {
      await Claim.create({
        user: user._id,
        scenario: `AUTO: Fraud Block (${autoTriggerReasons.join(' + ')})`,
        platform: user.platform,
        fraudScore: Number(fraudPrediction.score || 0),
        expectedIncome: Math.round(expectedIncome),
        actualIncome: Math.round(recentIncome),
        tier: 'Fraud',
        status: 'blocked',
        payoutINR: 0,
        processingTime: 'Blocked by fraud model',
        fraudNotes: ['Fraud model marked this auto-triggered event as fraudulent']
      });
    }
  }

  profile.claimEligibilityStatus = auto_claim_triggered && !fraudBlocked;
  profile.lastSyncTime = new Date();
  await profile.save();

  return {
    weather_status: weather,
    risk_score,
    fraud_status: fraudBlocked ? 'blocked' : 'clear',
    suspicious_flag: suspicious.suspicious_flag,
    auto_claim_triggered,
    payout_estimate: Math.round(payoutEstimate)
  };
};

module.exports = {
  runAutomatedDecision
};
