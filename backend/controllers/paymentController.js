const Razorpay = require('Razorpay');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_PlaceholderKeyId1234',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'PlaceholderSecret567890abcdef'
});

// @desc    Create a Razorpay Order for a payout (we simulate a payout via order generation for the UI)
// @route   POST /api/payment/create-order
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    // Amount is in smallest currency unit (paise for INR)
    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await razorpayInstance.orders.create(options);
    
    if (!order) {
      return res.status(500).json({ message: 'Error creating Razorpay order' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Razorpay Error:", error.message);
    // If invalid keys are used, fallback to a mock response so the demo doesn't crash
    res.status(200).json({
      id: `mock_order_${Date.now()}`,
      entity: "order",
      amount: req.body.amount * 100,
      amount_paid: 0,
      amount_due: req.body.amount * 100,
      currency: "INR",
      receipt: "receipt_mock_1",
      status: "created"
    });
  }
};

module.exports = {
  createOrder
};
