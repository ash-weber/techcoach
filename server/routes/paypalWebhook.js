const express = require('express');
const router = express.Router();
const getConnection = require('../Models/database');

router.post('/paypal', async (req, res) => {
  const event = req.body;

  if (event.event_type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
    const subscriptionId = event.resource.id;
    const userId = event.resource.custom_id; // set during creation if needed

    const conn = await getConnection();
    await conn.query(`
      INSERT INTO user_subscription (user_id, paypal_subscription_id, status)
      VALUES (?, ?, 'ACTIVE')
      ON DUPLICATE KEY UPDATE status = 'ACTIVE'
    `, [userId, subscriptionId]);

    conn.release();
  }

  res.sendStatus(200);
});

module.exports = router;
