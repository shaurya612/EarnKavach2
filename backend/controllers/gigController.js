const gigPlatformService = require('../services/gigPlatformService');

const getRealtimeStats = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const data = gigPlatformService.getMockGigData(user.platform, user._id);
    
    // Also attach a mock WRS score that looks varying based on the platform
    const mockWRS = user.platform === 'Swiggy' ? 92 : 87;

    res.json({
      ...data,
      wrsScore: mockWRS
    });
  } catch (error) {
    console.error("Error fetching realtime stats:", error.message);
    res.status(500).json({ message: "Server error fetching gig stats" });
  }
};

module.exports = {
  getRealtimeStats
};
