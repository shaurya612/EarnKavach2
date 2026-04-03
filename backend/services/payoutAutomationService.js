const PaymentTransaction = require('../models/PaymentTransaction');
const { createOrder } = require('./razorpayService');

const queueClaimPayout = async ({ userId, claimId, amountINR }) => {
  if (!amountINR || amountINR <= 0) return null;

  let orderId = null;
  let status = 'created';
  let notes = 'Auto claim payout queued';

  try {
    const order = await createOrder({
      amountINR,
      receipt: `cp_${Date.now().toString(36)}_${String(claimId).slice(-6)}`,
      notes: { flow: 'claim_payout', claimId: String(claimId), userId: String(userId) }
    });
    orderId = order.id;
  } catch (error) {
    console.error('[queueClaimPayout] Razorpay order failed:', error.message);
    orderId = `pending_${Date.now()}`;
    notes = 'Order creation failed; scheduled job will retry settlement';
    status = 'created';
  }

  return PaymentTransaction.create({
    user: userId,
    type: 'claim_payout',
    amountINR,
    status,
    razorpayOrderId: orderId,
    notes,
    meta: { claimId: String(claimId) }
  });
};

module.exports = {
  queueClaimPayout
};
