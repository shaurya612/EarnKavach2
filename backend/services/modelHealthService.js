const axios = require('axios');

const checkFraudApi = async () => {
  const url = process.env.FRAUD_API_URL || 'https://earnkavach-fraud-api.onrender.com/predict';
  const payload = { data: [6000, 30, 300, 12, 1, 0.5] };
  const response = await axios.post(url, payload, { timeout: 45000 });
  return {
    status: 'up',
    endpoint: url,
    sample: {
      prediction: response.data?.prediction,
      score: response.data?.score
    }
  };
};

const checkIncomeApi = async () => {
  const base = process.env.INCOME_API_URL || 'https://earnkavach-ml-api.onrender.com/';
  const normalized = base.endsWith('/') ? base.slice(0, -1) : base;
  const urls = normalized.endsWith('/predict-income') ? [normalized] : [`${normalized}/predict-income`, normalized, `${normalized}/predict`];
  const payload = {
    day_of_week: 2,
    hour_of_day: 14,
    avg_last_7_days: 1000,
    rainfall: 10,
    aqi: 120,
    temperature: 30,
    zone_demand_score: 0.8,
    is_weekend: 0,
    working_hours: 8
  };

  let lastError;
  for (const url of urls) {
    try {
      const response = await axios.post(url, payload, { timeout: 45000 });
      return {
        status: 'up',
        endpoint: url,
        sample: {
          expected_income: response.data?.expected_income ?? response.data?.predicted_income
        }
      };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
};

const checkWrsApi = async () => {
  const base = process.env.WRS_API_URL || 'https://earnkavach-wrs-sanya.onrender.com/';
  const normalized = base.endsWith('/') ? base.slice(0, -1) : base;
  const urls = normalized.endsWith('/predict') ? [normalized] : [`${normalized}/predict`, normalized];
  const payload = {
    active_days: 7,
    total_days: 7,
    accepted_orders: 60,
    total_orders: 60,
    movement_detected: 1,
    valid_claims: 0,
    total_claims: 0,
    rating: 5
  };
  let lastError;
  for (const url of urls) {
    try {
      const response = await axios.post(url, payload, { timeout: 45000 });
      return {
        status: 'up',
        endpoint: url,
        sample: {
          wrs_score: response.data?.wrs_score ?? response.data?.wrs
        }
      };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
};

const checkRiskApi = async () => {
  const base = process.env.RISK_API_URL || 'https://earnkavach-riskscore.onrender.com/';
  const normalized = base.endsWith('/') ? base.slice(0, -1) : base;
  const urls = normalized.endsWith('/predict-risk') ? [normalized] : [`${normalized}/predict-risk`, `${normalized}/predict`, normalized];
  const payload = {
    rain: 95,
    aqi: 300,
    traffic: 1,
    zone_risk: 0.9,
    disruptions: 9
  };
  let lastError;
  for (const url of urls) {
    try {
      const response = await axios.post(url, payload, { timeout: 45000 });
      return {
        status: 'up',
        endpoint: url,
        sample: {
          risk_score: response.data?.risk_score
        }
      };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
};

const toDown = (name, error) => ({
  status: 'down',
  model: name,
  error: error?.response?.data || error?.message || 'unknown error'
});

const getModelHealthSnapshot = async () => {
  const [fraud, income, wrs, risk] = await Promise.allSettled([
    checkFraudApi(),
    checkIncomeApi(),
    checkWrsApi(),
    checkRiskApi()
  ]);

  return {
    checkedAt: new Date().toISOString(),
    fraud: fraud.status === 'fulfilled' ? fraud.value : toDown('fraud', fraud.reason),
    income: income.status === 'fulfilled' ? income.value : toDown('income', income.reason),
    wrs: wrs.status === 'fulfilled' ? wrs.value : toDown('wrs', wrs.reason),
    risk: risk.status === 'fulfilled' ? risk.value : toDown('risk', risk.reason)
  };
};

module.exports = {
  getModelHealthSnapshot
};
