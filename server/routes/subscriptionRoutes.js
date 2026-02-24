const express = require('express');
const router = express.Router();
const { createSubscription, getSubscriptionDetails } = require('../Services/paypalService');
const getConnection = require('../Models/database');

const ensureAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

router.post('/create', ensureAuth, async (req, res) => {
  try {
    const subscription = await createSubscription(process.env.PAYPAL_PLAN_ID);

    const approvalLink = subscription.links.find(
      link => link.rel === 'approve'
    );

    if (!approvalLink) {
      return res.status(500).json({ error: 'Approval link not found' });
    }

    res.json({
      approvalUrl: approvalLink.href
    });

  } catch (err) {
    console.error('PayPal subscription error:', err.response?.data || err);
    res.status(500).json({ error: 'PayPal subscription failed' });
  }
});

router.post('/confirm', ensureAuth, async (req, res) => {

  let conn;

  try {

    const { subscriptionId } = req.body;

    const details = await getSubscriptionDetails(subscriptionId);

    if (!['ACTIVE', 'APPROVAL_PENDING'].includes(details.status)) {

      return res.status(400).json({
        error: 'Subscription not valid',
        status: details.status
      });

    }

    // ✅ Convert ISO date → MySQL DATETIME
    const convertPaypalDate = (paypalDate) => {

      if (!paypalDate) return null;

      return new Date(paypalDate)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');
    };

    const nextBillingTime = convertPaypalDate(
      details.billing_info?.next_billing_time
    );

    const lastPaymentTime = convertPaypalDate(
      details.billing_info?.last_payment?.time
    );

    conn = await getConnection();

    await conn.query(

      `INSERT INTO techcoach_lite.user_subscription
      (user_id, paypal_subscription_id, status, next_billing_time, last_payment_time)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      paypal_subscription_id = VALUES(paypal_subscription_id),
      status = VALUES(status),
      next_billing_time = VALUES(next_billing_time),
      last_payment_time = VALUES(last_payment_time)`,

      [
        req.user.id,
        subscriptionId,
        details.status,
        nextBillingTime,
        lastPaymentTime
      ]

    );

    res.json({ success: true });

  }
  catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Subscription confirmation failed',
      details: error.message
    });

  }
  finally {

    if (conn) conn.release();

  }

});

router.get('/status', ensureAuth, async (req, res) => {

  let conn;

  try {

    conn = await getConnection();

    const rows = await conn.query(
      `SELECT 
         status,
         paypal_subscription_id,
         last_payment_time,
         next_billing_time,
         updated_at
       FROM techcoach_lite.user_subscription
       WHERE user_id = ?
       ORDER BY updated_at DESC
       LIMIT 1`,
      [req.user.id]
    );

    if (!rows.length) {

      return res.json({
        isSubscribed: false,
        status: "INACTIVE"
      });

    }

    const sub = rows[0];

    const isSubscribed =
      sub.status === "ACTIVE" &&
      sub.next_billing_time &&
      new Date(sub.next_billing_time) > new Date();

    res.json({
      isSubscribed,
      status: sub.status,
      lastPaymentTime: sub.last_payment_time,
      nextBillingTime: sub.next_billing_time
    });

  }
  catch (err) {

    res.status(500).json({ error: err.message });

  }
  finally {

    if (conn) conn.release();

  }

});

module.exports = router;
