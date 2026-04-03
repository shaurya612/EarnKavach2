const DECISION_THRESHOLDS = require('../constants/decisionThresholds');

const hoursSince = (date) => {
  if (!date) return Number.POSITIVE_INFINITY;
  return (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60);
};

const getRecentEarnings = (history = [], lookbackHours = 2) => {
  const cutoff = Date.now() - lookbackHours * 60 * 60 * 1000;
  return history
    .filter(d => new Date(d.timestamp).getTime() >= cutoff)
    .reduce((sum, d) => sum + Number(d.amount || 0), 0);
};

const calculateOrderDropRatio = (history = []) => {
  if (history.length < 6) return 0;
  const sorted = [...history].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const midpoint = Math.floor(sorted.length / 2);
  const previous = sorted.slice(0, midpoint).length;
  const recent = sorted.slice(midpoint).length;
  if (previous === 0) return 0;
  return Math.max(0, (previous - recent) / previous);
};

const detectSuspiciousBehavior = ({ workerProfile, claims = [] }) => {
  const history = workerProfile?.deliveryHistory || [];
  const inactivityHours = hoursSince(history[history.length - 1]?.timestamp);
  const orderDropRatio = calculateOrderDropRatio(history);
  const recentClaims = claims.filter(c => {
    const ageHours = hoursSince(c.createdAt);
    return ageHours <= 24;
  }).length;

  const abnormalSpeedOrLocation =
    Number(workerProfile?.location?.lat || 0) === 0 ||
    Number(workerProfile?.location?.lng || 0) === 0;

  const suspicious_flag =
    orderDropRatio > DECISION_THRESHOLDS.ORDER_DROP_THRESHOLD ||
    inactivityHours > DECISION_THRESHOLDS.INACTIVITY_THRESHOLD_HOURS ||
    recentClaims >= 3 ||
    abnormalSpeedOrLocation;

  return {
    suspicious_flag,
    signals: {
      order_drop_ratio: Number(orderDropRatio.toFixed(2)),
      inactivity_hours: Number(inactivityHours.toFixed(2)),
      repeated_claims_24h: recentClaims,
      abnormal_speed_or_location: abnormalSpeedOrLocation,
      recent_earnings: getRecentEarnings(history, DECISION_THRESHOLDS.INACTIVITY_THRESHOLD_HOURS)
    }
  };
};

module.exports = {
  detectSuspiciousBehavior,
  calculateOrderDropRatio
};
