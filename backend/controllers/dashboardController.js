const { runAutomatedDecision } = require('../services/autoDecisionService');

// @desc    View-only automated decision dashboard
// @route   GET /dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    const result = await runAutomatedDecision(req.user);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Dashboard automation error:', error.message);
    return res.status(500).json({ message: 'Failed to compute automated dashboard' });
  }
};

module.exports = {
  getDashboard
};
