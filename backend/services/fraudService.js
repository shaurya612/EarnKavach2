const axios = require('axios');

/**
 * Calls the Fraud Detection API
 * @param {Array<number>} data Array of exactly 6 features: [movement_distance, avg_speed, active_time, orders_completed, claims_count, location_variance]
 * @returns {Promise<{prediction: string, score: number}>}
 */
const checkFraud = async (data) => {
  try {
    const url = process.env.FRAUD_API_URL || 'https://earnkavach-fraud-api.onrender.com/predict';
    
    // As per user spec, Input: { "data": [6 features] }
    const response = await axios.post(url, { data });
    
    // As per user spec, Output: { "prediction": "fraud" | "normal", "score": number }
    return response.data;
  } catch (error) {
    console.error('Error calling Fraud Detection API:', error.message);
    throw new Error('Failed to process fraud check. Please try again later.');
  }
};

module.exports = {
  checkFraud
};
