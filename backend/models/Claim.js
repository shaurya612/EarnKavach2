const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scenario: { type: String, required: true },
  platform: { type: String, required: true },
  fraudScore: { type: Number, required: true },
  expectedIncome: { type: Number, required: true },
  actualIncome: { type: Number, required: true },
  tier: { type: String, enum: ['Trusted', 'Suspicious', 'Fraud'], required: true },
  status: { type: String, enum: ['paid', 'processing', 'blocked', 'rejected', 'approved'], required: true },
  payoutINR: { type: Number, required: true },
  processingTime: { type: String },
  fraudNotes: [{ type: String }],
}, { timestamps: true });

const Claim = mongoose.model('Claim', claimSchema);
module.exports = Claim;
