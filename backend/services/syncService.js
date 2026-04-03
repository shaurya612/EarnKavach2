const User = require('../models/User');
const { runAutomatedDecision } = require('./autoDecisionService');

const startBackgroundSync = () => {
    // Fully automated backend decisioning loop (no manual claim trigger needed).
    setInterval(async () => {
        try {
            const workerUsers = await User.find({ role: 'worker' }).select('-password');
            if (workerUsers.length === 0) {
                return;
            }

            for (const user of workerUsers) {
                await runAutomatedDecision(user);
            }

            console.log(`[SyncService] Automated decision cycle completed for ${workerUsers.length} worker(s).`);
        } catch (err) {
            console.error("Background sync error:", err);
        }
    }, 30000);
};

module.exports = { startBackgroundSync };
