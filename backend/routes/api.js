const express = require('express');
const apiRouter = express.Router();

const modelsController = require('../controllers/modelsController');
const claimController = require('../controllers/claimController');
const authController = require('../controllers/authController');
const paymentController = require('../controllers/paymentController');
const adminController = require('../controllers/adminController');
const dashboardController = require('../controllers/dashboardController');
const workerActivityMiddleware = require('../middleware/workerActivityMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');

// Auth Routes
apiRouter.post('/auth/register', authController.registerUser);
apiRouter.post('/auth/login', authController.loginUser);
apiRouter.get('/auth/me', protect, authController.getMe);

// Policy Routes
const policyController = require('../controllers/policyController');
apiRouter.get('/policy/my-policy', protect, policyController.getMyPolicy);

// Gig Platform Mock Analytics
const gigController = require('../controllers/gigController');
apiRouter.get('/gig/realtime-stats', protect, gigController.getRealtimeStats);
apiRouter.get('/dashboard', protect, dashboardController.getDashboard);

// Independent model endpoints
apiRouter.post('/fraud-check', modelsController.checkFraud);
apiRouter.post('/predict-income', modelsController.predictIncome);
apiRouter.post('/risk-score', modelsController.getRiskScore);
apiRouter.post('/wrs', modelsController.getWRS);

// Main claim endpoints (Protected)
// Attach workerActivityMiddleware to enrich claim context with real-time gig data
apiRouter.post('/claim', protect, workerActivityMiddleware, claimController.processClaim);
apiRouter.get('/claims', protect, claimController.getUserClaims);

// Payment routing
apiRouter.post('/payment/create-order', protect, paymentController.createOrder);
apiRouter.post('/payment/create-premium-order', protect, paymentController.createPremiumOrder);
apiRouter.post('/payment/verify-premium', protect, paymentController.verifyPremiumPayment);
apiRouter.get('/payment/my-payments', protect, paymentController.getMyPayments);

// Admin Routes
apiRouter.get('/admin/claims', protect, admin, adminController.getAllClaims);
apiRouter.get('/admin/stats', protect, admin, adminController.getSystemStats);
apiRouter.get('/admin/workers', protect, admin, adminController.getWorkers);
apiRouter.get('/admin/model-health', protect, admin, adminController.getModelHealth);
apiRouter.get('/admin/payout-schedule', protect, admin, adminController.getPayoutSchedule);
apiRouter.get('/admin/predictive-analytics', protect, admin, adminController.getPredictiveAnalytics);

module.exports = apiRouter;
