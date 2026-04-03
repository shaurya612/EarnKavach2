const mongoose = require('mongoose');

const workerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  apiId: { type: String, required: true },
  platform: { type: String, enum: ['Zomato', 'Swiggy', 'Other'], required: true },
  name: { type: String, required: true },
  contact: { type: String, required: true },
  activeStatus: { type: Boolean, default: false },
  location: { 
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  },
  deliveryHistory: [{
    timestamp: { type: Date },
    status: { type: String },
    amount: { type: Number }
  }],
  claimEligibilityStatus: { type: Boolean, default: false },
  lastSyncTime: { type: Date, default: Date.now }
}, { timestamps: true });

const WorkerProfile = mongoose.model('WorkerProfile', workerProfileSchema);
module.exports = WorkerProfile;
