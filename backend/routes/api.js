const express = require('express');
const apiRouter = express.Router();

const modelsController = require('../controllers/modelsController');
const claimController = require('../controllers/claimController');
const authController = require('../controllers/authController');
const paymentController = require('../controllers/paymentController');
const adminController = require('../controllers/adminController');
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

// Independent model endpoints
apiRouter.post('/fraud-check', modelsController.checkFraud);
apiRouter.post('/predict-income', modelsController.predictIncome);
apiRouter.post('/risk-score', modelsController.getRiskScore);
apiRouter.post('/wrs', modelsController.getWRS);

// Main claim endpoints (Protected)
apiRouter.post('/claim', protect, claimController.processClaim);
apiRouter.get('/claims', protect, claimController.getUserClaims);

// Payment routing
apiRouter.post('/payment/create-order', protect, paymentController.createOrder);

// Admin Routes
apiRouter.get('/admin/claims', protect, admin, adminController.getAllClaims);
apiRouter.get('/admin/stats', protect, admin, adminController.getSystemStats);

module.exports = apiRouter;
