const Claim = require('../models/Claim');
const PaymentTransaction = require('../models/PaymentTransaction');

const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

/** Hours (0–23, server local time) to run payout settlement — default 4 times per day */
const dailySlotHours = () => {
  const raw = process.env.CLAIM_PAYOUT_SLOTS || '6,12,18,22';
  const slots = raw
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((h) => Number.isFinite(h) && h >= 0 && h <= 23);
  return slots.length ? slots : [6, 12, 18, 22];
};

let lastDailySlotKey = '';

/**
 * Settles claim payouts so workers never need a dashboard button.
 * - Every 3 hours (interval)
 * - At fixed clock hours (default 06:00, 12:00, 18:00, 22:00 local server time)
 * Marks DB state paid/processed; production would use Razorpay Payouts / bank APIs.
 */
const runPayoutCycle = async (reason = 'interval') => {
  const started = Date.now();
  let claimsUpdated = 0;
  let txsUpdated = 0;

  try {
    const processing = await Claim.find({
      status: 'processing',
      payoutINR: { $gt: 0 }
    });

    for (const c of processing) {
      c.status = 'paid';
      if (c.payoutStatus === 'queued' || !c.payoutStatus) {
        c.payoutStatus = 'processed';
      }
      c.processingTime = `${c.processingTime || 'Pending'} · Auto-settled (${reason})`;
      await c.save();
      claimsUpdated += 1;
    }

    const approvedDue = await Claim.find({
      status: 'approved',
      payoutINR: { $gt: 0 }
    });

    for (const c of approvedDue) {
      c.status = 'paid';
      c.payoutStatus = 'processed';
      c.processingTime = `${c.processingTime || 'Approved'} · Auto-settled (${reason})`;
      await c.save();
      claimsUpdated += 1;
    }

    const queuedClaims = await Claim.find({
      payoutStatus: 'queued',
      status: { $nin: ['blocked', 'rejected'] },
      payoutINR: { $gt: 0 }
    });

    for (const c of queuedClaims) {
      if (c.status !== 'paid') {
        c.status = 'paid';
      }
      c.payoutStatus = 'processed';
      c.processingTime = `${c.processingTime || 'Queued'} · Auto-settled (${reason})`;
      await c.save();
      claimsUpdated += 1;
    }

    const openPayoutTx = await PaymentTransaction.find({
      type: 'claim_payout',
      status: 'created'
    });

    for (const tx of openPayoutTx) {
      tx.status = 'paid';
      tx.razorpayPaymentId = tx.razorpayPaymentId || `auto_${started}_${tx._id}`;
      tx.notes = `${tx.notes || ''} · Auto-disbursed (${reason})`.trim();
      await tx.save();
      txsUpdated += 1;
    }

    console.log(
      `[ScheduledPayout] ${reason} — ${Date.now() - started}ms — claims: ${claimsUpdated}, payout txs: ${txsUpdated}`
    );
  } catch (err) {
    console.error('[ScheduledPayout] cycle error:', err.message);
  }
};

const startScheduledClaimPayouts = () => {
  const slots = dailySlotHours();

  setTimeout(() => {
    runPayoutCycle('startup');
  }, 15_000);

  setInterval(() => {
    runPayoutCycle('every_3h');
  }, THREE_HOURS_MS);

  setInterval(() => {
    const now = new Date();
    if (now.getMinutes() !== 0) return;
    const h = now.getHours();
    if (!slots.includes(h)) return;
    const key = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${h}`;
    if (key === lastDailySlotKey) return;
    lastDailySlotKey = key;
    runPayoutCycle(`daily_slot_${h}h`);
  }, MINUTE_MS);

  console.log(
    `[ScheduledPayout] Active: first run ~15s after boot, then every 3h, plus daily at ${slots.map((h) => `${h}:00`).join(', ')} (server local time). Set CLAIM_PAYOUT_SLOTS in .env to change hours (comma-separated 0–23).`
  );
};

module.exports = {
  startScheduledClaimPayouts,
  runPayoutCycle
};
