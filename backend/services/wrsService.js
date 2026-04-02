const axios = require('axios');

/**
 * Fetches the Worker Reliability Score (WRS) (Mock or API)
 * @returns {Promise<{wrs_score: number}>}
 */
const getWRS = async (data = {}) => {
  try {
    if (process.env.WRS_API_URL && !process.env.WRS_API_URL.includes("placeholder")) {
      const response = await axios.post(process.env.WRS_API_URL, { data });
      return { wrs_score: response.data.wrs_score || 0.85 };
    }
  } catch (error) {
    console.error("WRS API Error:", error.message);
  }
  return { wrs_score: 0.85 };
};

module.exports = {
  getWRS
};
