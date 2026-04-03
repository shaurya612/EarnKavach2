const WorkerProfile = require('../models/WorkerProfile');
const gigPlatformService = require('../services/gigPlatformService');

const workerActivityMiddleware = async (req, res, next) => {
    try {
        const userId = req.user._id;
        
        let profile = await WorkerProfile.findOne({ user: userId });
        
        if (!profile) {
            // First time sync from Zomato/Swiggy API mock
            const extData = gigPlatformService.fetchWorkerProfileFromPlatform(req.user.platform, userId);
            profile = await WorkerProfile.create({
                user: userId,
                apiId: extData.apiId,
                platform: extData.platform,
                name: req.user.name,
                contact: extData.contact,
                activeStatus: extData.activeStatus,
                location: extData.location,
                deliveryHistory: extData.deliveryHistory,
                claimEligibilityStatus: false // Will be updated by bg sync
            });
        } else {
            // Fetch latest from API and update status
            const extData = gigPlatformService.fetchWorkerProfileFromPlatform(req.user.platform, userId);
            profile.activeStatus = extData.activeStatus;
            profile.location = extData.location;
            if(extData.deliveryHistory && extData.deliveryHistory.length > 0) {
                profile.deliveryHistory = extData.deliveryHistory;
            }
            await profile.save();
        }

        req.claimContext = {
            profile: profile,
            isActive: profile.activeStatus,
            weatherEligible: profile.claimEligibilityStatus
        };

        next();
    } catch (err) {
        console.error("Worker Activity Middleware Error:", err);
        req.claimContext = { profile: null, isActive: false, error: err.message };
        next();
    }
};

module.exports = workerActivityMiddleware;
