const axios = require('axios');

/**
 * Fetches the Risk Score model prediction (Mock or API)
 * @returns {Promise<{risk_score: number}>}
 */
const getRiskScore = async (data = {}) => {
  try {
    if (process.env.RISK_API_URL && !process.env.RISK_API_URL.includes("placeholder")) {
      const response = await axios.post(process.env.RISK_API_URL, { data });
      return { risk_score: response.data.risk_score || 1.1 };
    }
  } catch (error) {
    console.error("Risk API Error:", error.message);
  }
  return { risk_score: 1.1 };
};

module.exports = {
  getRiskScore
};
