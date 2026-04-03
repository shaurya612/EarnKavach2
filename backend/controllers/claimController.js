const fraudService = require('../services/fraudService');
const incomeService = require('../services/incomeService');
const riskService = require('../services/riskService');
const wrsService = require('../services/wrsService');
const triggerEngine = require('../services/triggerEngine');
const Claim = require('../models/Claim');

/**
 * Handle POST /claim - Main automated claim decisioning
 * Protected Route -> req.user is available
 */
const processClaim = async (req, res) => {
  try {
    const { fraud_data, income_data, actual_income, coverage, scenario, platform } = req.body;

    // Enriched worker context (from workerActivityMiddleware)
    const claimContext = req.claimContext || {};

    // Validate inputs
    if (!fraud_data || !income_data || actual_income === undefined || coverage === undefined) {
      return res.status(400).json({ 
        error: "Missing required fields: fraud_data, income_data, actual_income, coverage" 
      });
    }

    // 1. Call Fraud Detection API
    const fraudResult = await fraudService.checkFraud(fraud_data);
    let fraudScore = fraudResult.score || 0;
    
    if (fraudResult.prediction === "fraud") {
      const claim = await Claim.create({
        user: req.user._id,
        scenario: scenario || 'Unknown Scenario',
        platform: platform || req.user.platform,
        fraudScore: fraudScore,
        expectedIncome: 0,
        actualIncome: actual_income,
        tier: 'Fraud',
        status: 'rejected',
        payoutINR: 0,
        processingTime: 'Rejected',
        fraudNotes: ['Fraud detected by AI Model']
      });

      return res.status(200).json({
        status: "rejected",
        reason: "Fraud detected",
        claim_id: claim._id
      });
    }

    // 2. Else: Call Income Prediction API
    const incomeResult = await incomeService.predictIncome(income_data);
    const expected_income = incomeResult.expected_income;

    // 3. Evaluate Parametric Triggers
    // If background sync has already evaluated weather/traffic for this worker, prefer that signal.
    let triggerFailed = false;
    let triggerFailureReason = null;

    if (claimContext && typeof claimContext.weatherEligible === 'boolean') {
      triggerFailed = !claimContext.weatherEligible;
      if (triggerFailed) {
        triggerFailureReason = 'Background sync: Worker not in eligible weather/traffic zone';
      }
    } else {
      const triggerVerification = await triggerEngine.validateTriggers(scenario || 'unknown');
      triggerFailed = !triggerVerification.isValid;
      triggerFailureReason = triggerVerification.failureReason || 'Weather/Traffic Verification Failed';
    }

    if (triggerFailed) {
      const claim = await Claim.create({
        user: req.user._id,
        scenario: scenario || 'Unknown Scenario',
        platform: platform || req.user.platform,
        fraudScore: fraudScore,
        expectedIncome: expected_income,
        actualIncome: actual_income,
        tier: 'Rejected',
        status: 'rejected',
        payoutINR: 0,
        processingTime: 'Rejected',
        fraudNotes: [triggerFailureReason],
        workerContext: claimContext
      });

      return res.status(200).json({
        status: "rejected",
        reason: triggerFailureReason,
        claim_id: claim._id
      });
    }

    // 4. Get Risk Score (Mock) and WRS Score (Mock)
    const riskResult = await riskService.getRiskScore();
    const risk_score = riskResult.risk_score;

    const wrsResult = await wrsService.getWRS();
    const wrs_score = wrsResult.wrs_score;

    // Determine Tier based on wrs or mock risk
    let tier = 'Trusted';
    if (wrs_score < 0.6) tier = 'Suspicious';
    if (wrs_score < 0.4) tier = 'Fraud';

    // 5. Calculate payout
    let payout = (expected_income - actual_income) * coverage;
    payout = Math.max(0, payout);
    
    // Status Logic
    let status = payout > 0 ? 'paid' : 'approved'; // if 0 payout, just approved with no funds.
    if (tier === 'Suspicious') status = 'processing';
    
    const claim = await Claim.create({
        user: req.user._id,
        scenario: scenario || 'Rainfall · Orders drop · Worker active',
        platform: platform || req.user.platform,
        fraudScore: fraudScore,
        expectedIncome: expected_income,
        actualIncome: actual_income,
        tier: tier,
        status: status,
        payoutINR: payout,
        processingTime: tier === 'Trusted' ? '1 min' : '15 min (verification)',
        fraudNotes: [],
        workerContext: claimContext
    });

    // 6. Return Final Decision
    return res.status(200).json({
      status: claim.status,
      expected_income,
      actual_income,
      payout,
      risk_score,
      wrs_score,
      claim_id: claim._id
    });

  } catch (error) {
    console.error("Error processing claim:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Handle GET /claims - Fetch user's claims
 * Protected Route -> req.user is available
 */
const getUserClaims = async (req, res) => {
    try {
        const claims = await Claim.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(claims);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
  processClaim,
  getUserClaims
};
