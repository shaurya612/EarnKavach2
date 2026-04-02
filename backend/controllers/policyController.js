const policyService = require('../services/policyService');

// @desc    Get dynamic policy for the logged in user
// @route   GET /api/policy/my-policy
// @access  Private
const getMyPolicy = async (req, res) => {
    try {
        const policyConfig = await policyService.getDynamicPolicyConfig();
        
        // In a real DB, we would save this to a User/Policy Collection
        // Since we are mocking the AI endpoints, we just return the calculation real-time.
        res.status(200).json({
            user: {
                id: req.user._id,
                name: req.user.name,
                platform: req.user.platform,
            },
            policy: {
                weeklyPricingModel: 'weekly-dynamic',
                weeklyPremiumINR: policyConfig.weeklyPremium,
                coveragePercent: policyConfig.coveragePercent,
                planName: policyConfig.planName,
                maxDailyPayout: 960,
                claimsRemainingMontly: 4
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMyPolicy
};
