const riskService = require('./riskService');
const wrsService = require('./wrsService');

const BASE_WEEKLY_PREMIUM = 30; // ₹30 base weekly premium

/**
 * Calculates dynamic weekly premium and coverage based on user risk and reliability.
 * @returns {Promise<{ weeklyPremium: number, coveragePercent: number, planName: string }>}
 */
const getDynamicPolicyConfig = async () => {
    try {
        const riskResult = await riskService.getRiskScore();
        let riskFactor = riskResult.risk_score || 1.1;

        const wrsResult = await wrsService.getWRS();
        let wrsScore = wrsResult.wrs_score || 85;

        // Prevent division by zero
        if (wrsScore <= 0) wrsScore = 1;

        // Formula: Weekly Premium = Base Rate × Risk Factor / (WRS / 100)
        let premium = (BASE_WEEKLY_PREMIUM * riskFactor) / (wrsScore / 100);
        premium = Math.round(premium);

        // Determine coverage percent. Higher WRS -> better coverage
        let coverage = 80; // default 80%
        let planName = 'Standard Shield';

        if (wrsScore >= 80) {
            coverage = 90;
            planName = 'Premium Shield';
        } else if (wrsScore < 60) {
            coverage = 70;
            planName = 'Basic Shield';
        }

        return {
            weeklyPremium: premium,
            coveragePercent: coverage,
            planName
        };

    } catch (e) {
        console.error("Policy Calculation Error:", e);
        return {
            weeklyPremium: 49,
            coveragePercent: 80,
            planName: 'Standard Shield'
        };
    }
};

module.exports = {
    getDynamicPolicyConfig
};
