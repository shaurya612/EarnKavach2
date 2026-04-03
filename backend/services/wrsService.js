const axios = require('axios');

/**
 * Fetches the Worker Reliability Score (WRS) (Mock or API)
 * @returns {Promise<{wrs_score: number}>}
 */
const DEFAULT_WRS_BASE = 'https://earnkavach-wrs-sanya.onrender.com/';

const getWRS = async (data = [0.9, 0.8, 0.2, 4.5]) => {
  try {
    const rawUrl = process.env.WRS_API_URL && !String(process.env.WRS_API_URL).includes('placeholder')
      ? process.env.WRS_API_URL
      : DEFAULT_WRS_BASE;
    if (rawUrl) {
      const baseUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
      const endpointCandidates = baseUrl.endsWith('/predict')
        ? [baseUrl]
        : [`${baseUrl}/predict`, baseUrl];

      const payloadCandidates = [];
      if (Array.isArray(data)) {
        payloadCandidates.push({
          active_days: 7,
          total_days: 7,
          accepted_orders: 60,
          total_orders: 60,
          movement_detected: 1,
          valid_claims: 0,
          total_claims: 0,
          rating: 5.0
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
            const wrsVal = response.data?.wrs_score ?? response.data?.wrs;
            if (wrsVal !== undefined && wrsVal !== null) {
              return { wrs_score: Number(wrsVal) };
            }
          } catch (innerError) {
            // Try alternate endpoint/payload before fallback.
          }
        }
      }
    }
  } catch (error) {
    console.error('WRS API Error:', error.message);
  }
  return { wrs_score: 0.85 };
};

module.exports = {
  getWRS
};
