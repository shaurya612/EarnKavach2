require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const syncService = require('./services/syncService');
const { startScheduledClaimPayouts } = require('./services/scheduledClaimPayoutService');
const { ensureSingleAdmin } = require('./services/adminBootstrapService');

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON bodies

// API Routes
app.use('/', apiRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('EarnKavach Backend is Running');
});

// Start Server
const startServer = async () => {
  await connectDB();
  await ensureSingleAdmin();
  syncService.startBackgroundSync();
  startScheduledClaimPayouts();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
