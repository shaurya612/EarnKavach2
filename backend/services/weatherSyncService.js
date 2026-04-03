const DECISION_THRESHOLDS = require('../constants/decisionThresholds');

const WEATHER_CONDITIONS = ['Clear', 'Cloudy', 'Rain', 'Heavy Rain', 'Storm'];

const normalizeSeverity = (rainfall, condition) => {
  const conditionBoost =
    condition === 'Storm' ? 30 :
    condition === 'Heavy Rain' ? 20 :
    condition === 'Rain' ? 10 : 0;

  return Math.min(100, Math.max(0, Math.round(rainfall + conditionBoost)));
};

const fetchWeatherByLocation = async (location = {}) => {
  // Mocked weather sync. Can be replaced with external weather API without changing callers.
  const lat = Number(location.lat || 0);
  const lng = Number(location.lng || 0);

  const locationFactor = Math.abs((lat * 10 + lng * 10) % 20);
  const rainfall = Math.min(100, Math.round(Math.random() * 80 + locationFactor));
  const weather_condition = WEATHER_CONDITIONS[Math.floor(Math.random() * WEATHER_CONDITIONS.length)];
  const severity_score = normalizeSeverity(rainfall, weather_condition);

  return {
    rainfall,
    weather_condition,
    severity_score,
    high_risk: rainfall > DECISION_THRESHOLDS.RAIN_THRESHOLD
  };
};

module.exports = {
  fetchWeatherByLocation
};
