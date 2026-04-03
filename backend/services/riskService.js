const axios = require('axios');

/**
 * Fetches the Risk Score model prediction (Mock or API)
 * @returns {Promise<{risk_score: number}>}
 */
const getRiskScore = async (data = [80, 200, 70]) => {
  try {
    if (process.env.RISK_API_URL && !process.env.RISK_API_URL.includes('placeholder')) {
      const baseUrl = process.env.RISK_API_URL.endsWith('/')
        ? process.env.RISK_API_URL.slice(0, -1)
        : process.env.RISK_API_URL;
      const endpointCandidates = baseUrl.endsWith('/predict-risk') || baseUrl.endsWith('/predict')
        ? [baseUrl]
        : [`${baseUrl}/predict-risk`, `${baseUrl}/predict`, baseUrl];

      const payloadCandidates = [];
      if (Array.isArray(data)) {
        payloadCandidates.push({
          rain: Number(data[0] || 80),
          aqi: Number(data[1] || 200),
          traffic: 1.0,
          zone_risk: 0.9,
          disruptions: Number(data[2] || 9)
        });
        payloadCandidates.push({ data });
      } else {
        payloadCandidates.push(data);
        payloadCandidates.push({ data });
      }

      for (const url of endpointCandidates) {
        for (const payload of payloadCandidates) {
          try {
            const response = await axios.post(url, payload, { timeout: 20000 });
            return { risk_score: Number(response.data.risk_score || 1.1) };
          } catch (innerError) {
            // Try alternate endpoint/payload before fallback.
          }
        }
      }
    }
  } catch (error) {
    console.error('Risk API Error:', error.message);
  }
  return { risk_score: 1.1 };
};

module.exports = {
  getRiskScore
};
