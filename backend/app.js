require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();


// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON bodies

// API Routes
app.use('/api', apiRoutes); // Or do we mount without /api? The spec says POST /fraud-check. It could be mounted at root. 
// Actually, the spec says "POST /fraud-check". So let's mount at root or `/` depending on standard prefix.
// We will change it to root to match exactly POST /fraud-check. Wait, the spec:
// POST /fraud-check
// POST /predict-income
// POST /claim
// It's fine to mount at root.
// Wait, I already did app.use('/api', apiRoutes) in the plan, but let's mount it at root or /api. I will mount at root to match exact routes.
app.use('/', apiRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('EarnKavach Backend is Running');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
