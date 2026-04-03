const PaymentTransaction = require('../models/PaymentTransaction');
const User = require('../models/User');
const { createOrder: createRazorpayOrder, verifySignature, keyId } = require('../services/razorpayService');
const { sendPremiumReceiptEmail } = require('../services/emailService');

// Legacy route used in simulator flow (Demo checkout)
const createOrder = async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Amount is required' });

    const order = await createRazorpayOrder({
      amountINR: Math.max(1, Math.round(amount)),
      receipt: `demo_${Date.now().toString(36)}`,
      notes: { flow: 'legacy_order' }
    });

    return res.status(200).json({ ...order, key: keyId });
  } catch (error) {
    console.error('Razorpay createOrder (demo):', error.response?.data || error.error || error.message);
    const msg =
      error.response?.data?.error?.description ||
      error.error?.description ||
      error.message ||
      'Could not create Razorpay order. Check keys and amount.';
    return res.status(502).json({ message: msg });
  }
};

const WEEKLY_PREMIUM_INR = 49;

// Create premium order for user to pay premium (fixed ₹49/week — ignore client amount)
const createPremiumOrder = async (req, res) => {
  try {
    const amount = WEEKLY_PREMIUM_INR;

    const order = await createRazorpayOrder({
      amountINR: amount,
      receipt: `prm_${req.user._id.toString().slice(-8)}_${Date.now().toString(36)}`,
      notes: { flow: 'premium_payment', userId: req.user._id.toString() }
    });

    await PaymentTransaction.create({
      user: req.user._id,
      type: 'premium',
      amountINR: amount,
      status: 'created',
      razorpayOrderId: order.id,
      notes: 'Premium order initiated'
    });

    return res.status(200).json({
      order,
      key: keyId,
      amountINR: amount
    });
  } catch (error) {
    console.error('Razorpay createPremiumOrder:', error.response?.data || error.error || error.message);
    const msg =
      error.response?.data?.error?.description ||
      error.error?.description ||
      error.message ||
      'Could not create premium order. Check Razorpay keys in .env.';
    return res.status(502).json({ message: msg });
  }
};

// Verify premium payment signature and mark as paid
const verifyPremiumPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing Razorpay verification fields' });
    }

    const valid = verifySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature
    });

    if (!valid) {
      await PaymentTransaction.findOneAndUpdate(
        { user: req.user._id, razorpayOrderId: razorpay_order_id },
        { status: 'failed', razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, notes: 'Invalid signature' }
      );
      return res.status(400).json({ message: 'Payment signature verification failed' });
    }

    const updated = await PaymentTransaction.findOneAndUpdate(
      { user: req.user._id, razorpayOrderId: razorpay_order_id },
      { status: 'paid', razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, notes: 'Premium paid successfully' },
      { new: true }
    );

    if (!updated) {
      return res.status(400).json({
        message: 'No premium order found for this payment. Create a new checkout from the dashboard.'
      });
    }

    let emailSent = false;
    try {
      const u = await User.findById(req.user._id).select('email name');
      if (u?.email) {
        emailSent = await sendPremiumReceiptEmail({
          to: u.email,
          name: u.name,
          amountINR: updated.amountINR,
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id
        });
      }
    } catch (e) {
      console.error('Premium receipt email:', e.message);
    }

    return res.status(200).json({ success: true, payment: updated, emailSent });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMyPayments = async (req, res) => {
  try {
    const payments = await PaymentTransaction.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(payments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  createPremiumOrder,
  verifyPremiumPayment,
  getMyPayments
};
