const axios = require('axios');

/**
 * Calls the Income Prediction API
 * @param {Array<number>} data Array of income-related features: [historical earnings, time, demand]
 * @returns {Promise<{expected_income: number}>}
 */
const predictIncome = async (data) => {
  const baseUrl = process.env.INCOME_API_URL || 'https://earnkavach-ml-api.onrender.com/';
  const normalized = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const endpointCandidates = normalized.endsWith('/predict') || normalized.endsWith('/predict-income')
    ? [normalized]
    : [normalized, `${normalized}/predict`, `${normalized}/predict-income`];

  const payloadCandidates = [];

  if (Array.isArray(data)) {
    payloadCandidates.push({ data });
    payloadCandidates.push({
      day_of_week: 2,
      hour_of_day: 14,
      avg_last_7_days: Number(data[0] || 1000),
      rainfall: Number(data[1] || 10),
      aqi: 120,
      temperature: 30,
      zone_demand_score: Number(data[2] || 0.8),
      is_weekend: 0,
      working_hours: 8
    });
  } else {
    payloadCandidates.push(data);
    payloadCandidates.push({ data });
  }

  let lastError = null;
  for (const url of endpointCandidates) {
    for (const payload of payloadCandidates) {
      try {
        const response = await axios.post(url, payload, { timeout: 20000 });
        const predicted = response.data?.expected_income ?? response.data?.predicted_income;
        if (predicted !== undefined && predicted !== null) {
          return { expected_income: Number(predicted) };
        }
      } catch (error) {
        lastError = error;
      }
    }
  }

  console.error('Error calling Income Prediction API:', lastError?.message || 'Unknown error');
  throw new Error('Failed to process income prediction. Please try again later.');
};

module.exports = {
  predictIncome
};
