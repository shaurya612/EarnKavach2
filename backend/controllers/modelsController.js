const fraudService = require('../services/fraudService');
const incomeService = require('../services/incomeService');
const riskService = require('../services/riskService');
const wrsService = require('../services/wrsService');

/**
 * Handle POST /fraud-check
 */
const checkFraud = async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || !Array.isArray(data) || data.length !== 6) {
      return res.status(400).json({ error: 'Valid data array with 6 features is required' });
    }

    const result = await fraudService.checkFraud(data);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Handle POST /predict-income
 */
const predictIncome = async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Valid data array is required' });
    }

    const result = await incomeService.predictIncome(data);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Handle POST /risk-score
 */
const getRiskScore = async (req, res) => {
  try {
    const result = await riskService.getRiskScore();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Handle POST /wrs
 */
const getWRS = async (req, res) => {
  try {
    const result = await wrsService.getWRS();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  checkFraud,
  predictIncome,
  getRiskScore,
  getWRS
};
