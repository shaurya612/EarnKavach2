const axios = require('axios');

/**
 * Calls the Income Prediction API
 * @param {Array<number>} data Array of income-related features: [historical earnings, time, demand]
 * @returns {Promise<{expected_income: number}>}
 */
const predictIncome = async (data) => {
  try {
    // Assumption requested by user: 'assume /predict if needed' though base given is https://earnkavach-ml-api.onrender.com/
    let url = process.env.INCOME_API_URL || 'https://earnkavach-ml-api.onrender.com/';
    if (!url.endsWith('/predict') && !url.endsWith('predict')) {
        url = url.endsWith('/') ? url + 'predict' : url + '/predict';
    }

    // Input: { "data": [income-related features] }
    const response = await axios.post(url, { data });
    
    // Output: { "expected_income": number }
    return response.data;
  } catch (error) {
    console.error('Error calling Income Prediction API:', error.message);
    throw new Error('Failed to process income prediction. Please try again later.');
  }
};

module.exports = {
  predictIncome
};
