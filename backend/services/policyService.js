const riskService = require('./riskService');
const wrsService = require('./wrsService');

/** Fixed weekly premium (product rule). Coverage still varies with WRS. */
const WEEKLY_PREMIUM_INR = 49;

/**
 * Calculates coverage from WRS; weekly premium is always ₹49/week.
 * @returns {Promise<{ weeklyPremium: number, coveragePercent: number, planName: string }>}
 */
const getDynamicPolicyConfig = async () => {
    try {
        const wrsResult = await wrsService.getWRS();
        let wrsScore = wrsResult.wrs_score || 85;
        if (wrsScore <= 0) wrsScore = 1;

        let coverage = 80;
        let planName = 'Standard Shield';

        if (wrsScore >= 80) {
            coverage = 90;
            planName = 'Premium Shield';
        } else if (wrsScore < 60) {
            coverage = 70;
            planName = 'Basic Shield';
        }

        return {
            weeklyPremium: WEEKLY_PREMIUM_INR,
            coveragePercent: coverage,
            planName
        };

    } catch (e) {
        console.error("Policy Calculation Error:", e);
        return {
            weeklyPremium: WEEKLY_PREMIUM_INR,
            coveragePercent: 80,
            planName: 'Standard Shield'
        };
    }
};

module.exports = {
    getDynamicPolicyConfig
};
