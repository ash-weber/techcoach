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

    if (!subscriptionId) {
      return res.status(400).json({ error: 'Missing subscriptionId' });
    }

    const details = await getSubscriptionDetails(subscriptionId);

    if (!['ACTIVE', 'APPROVAL_PENDING'].includes(details.status)) {
      return res.status(400).json({
        error: 'Subscription not valid',
        status: details.status
      });
    }

    conn = await getConnection();

    await conn.query(
      `INSERT INTO user_subscription 
       (user_id, paypal_subscription_id, status)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
       paypal_subscription_id = VALUES(paypal_subscription_id),
       status = VALUES(status)`,
      [req.user.id, subscriptionId, details.status]
    );

    res.json({ success: true });

  } catch (error) {

    console.error(error.response?.data || error);

    res.status(500).json({
      error: 'Subscription confirmation failed',
      details: error.response?.data || error.message
    });

  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
