const Razorpay = require('razorpay');
const crypto = require('crypto');

const resolveKeyId = () => (process.env.RAZORPAY_KEY_ID || 'rzp_test_PlaceholderKeyId1234').trim();
const keySecret = () => (process.env.RAZORPAY_KEY_SECRET || 'PlaceholderSecret567890abcdef').trim();

const razorpayInstance = new Razorpay({
  key_id: resolveKeyId(),
  key_secret: keySecret()
});

/** Razorpay receipt: max 40 chars, allowed [a-zA-Z0-9_-] */
const sanitizeReceipt = (receipt) => {
  const fallback = `r_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  if (!receipt || typeof receipt !== 'string') return fallback.slice(0, 40);
  const cleaned = receipt.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
  const base = cleaned.length ? cleaned : fallback;
  return base.slice(0, 40);
};

const createOrder = async ({ amountINR, receipt, notes = {} }) => {
  const paise = Math.round(Number(amountINR) * 100);
  if (!paise || paise < 100) {
    throw new Error('Amount must be at least ₹1 (100 paise)');
  }
  const order = await razorpayInstance.orders.create({
    amount: paise,
    currency: 'INR',
    receipt: sanitizeReceipt(receipt),
    notes
  });
  return order;
};

const verifySignature = ({ orderId, paymentId, signature }) => {
  if (!orderId || !paymentId || !signature) return false;
  const expected = crypto
    .createHmac('sha256', keySecret())
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return expected === String(signature).trim();
};

module.exports = {
  createOrder,
  verifySignature,
  get keyId() {
    return resolveKeyId();
  }
};
