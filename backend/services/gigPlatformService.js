const getMockGigData = (platform, userId) => {
  const isSwiggy = platform === 'Swiggy';
  const multiplier = isSwiggy ? 1.05 : 0.95; // Just to make Swiggy and Zomato look slightly different natively.

  const today = new Date();
  const earningData = [];
  const weeklyData = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 18; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dayName = `Mar ${d.getDate()}`; // Simplistic
    
    // Some randomized stable value
    const baseVal = 700 + Math.floor(Math.random() * 200);
    earningData.push({
      day: dayName,
      predicted: Math.floor(baseVal * multiplier),
      actual: Math.floor(baseVal * multiplier * (Math.random() * 0.4 + 0.7))
    });
  }

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    weeklyData.push({
      day: days[d.getDay()],
      income: Math.floor((700 + Math.floor(Math.random() * 200)) * multiplier)
    });
  }

  const alerts = isSwiggy ? [
    { type: 'Heavy Rain', zone: 'North Zone', severity: 'high', time: '2 min ago', action: 'Surge pricing active +₹20/order' },
    { type: 'High Volume', zone: 'Central Grid', severity: 'medium', time: '1 hr ago', action: 'Suggest zone shift' }
  ] : [
    { type: 'Extreme Heat', zone: 'South District', severity: 'low', time: '3 hrs ago', action: 'Take early break' },
    { type: 'Traffic Block', zone: 'Market Area', severity: 'high', time: '10 min ago', action: 'Avoid routing' }
  ];

  return { earningData, weeklyData, alerts };
};

module.exports = {
  getMockGigData
};
