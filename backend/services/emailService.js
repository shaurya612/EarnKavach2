const nodemailer = require('nodemailer');

const smtpConfigured = () =>
  Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      String(process.env.SMTP_USER).trim() &&
      String(process.env.SMTP_PASS).trim()
  );

let transporter;

const getTransporter = () => {
  if (!smtpConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: String(process.env.SMTP_HOST).trim(),
      port: Number(process.env.SMTP_PORT) || 587,
      secure: String(process.env.SMTP_SECURE || '') === 'true',
      auth: {
        user: String(process.env.SMTP_USER).trim(),
        pass: String(process.env.SMTP_PASS).trim()
      }
    });
  }
  return transporter;
};

/**
 * Sends premium payment receipt. Configure SMTP_* in .env to enable.
 * @returns {Promise<boolean>}
 */
const sendPremiumReceiptEmail = async ({ to, name, amountINR, paymentId, orderId }) => {
  const tx = getTransporter();
  const from = (process.env.SMTP_FROM || process.env.SMTP_USER || '').trim();
  if (!tx || !from || !to) {
    if (!smtpConfigured()) {
      console.info('[email] SMTP not configured (set SMTP_HOST, SMTP_USER, SMTP_PASS); skipping receipt email.');
    }
    return false;
  }

  const subject = 'EarnKavach — Premium payment successful';
  const text = [
    `Hi ${name || 'there'},`,
    '',
    `Your premium payment of ₹${amountINR} was received successfully.`,
    '',
    `Payment ID: ${paymentId}`,
    `Order ID: ${orderId}`,
    '',
    'Thank you for choosing EarnKavach.',
    '',
    '— EarnKavach'
  ].join('\n');

  const html = `
    <p>Hi <strong>${escapeHtml(name || 'there')}</strong>,</p>
    <p>Your premium payment of <strong>₹${escapeHtml(String(amountINR))}</strong> was received successfully.</p>
    <p>Payment ID: <code>${escapeHtml(paymentId)}</code><br/>
    Order ID: <code>${escapeHtml(orderId)}</code></p>
    <p>Thank you for choosing EarnKavach.</p>
  `;

  try {
    await tx.sendMail({
      from: `"EarnKavach" <${from}>`,
      to,
      subject,
      text,
      html
    });
    return true;
  } catch (err) {
    console.error('[email] send failed:', err.message);
    return false;
  }
};

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = {
  sendPremiumReceiptEmail,
  smtpConfigured
};
