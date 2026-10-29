const express = require('express');
const router = express.Router();
const { sendDecisionCardToUser } = require('../services/teamsGraphService');


router.post('/notify', async (req, res) => {
  try {
    const { recipientEmail, ...cardPayload } = req.body;

    if (!recipientEmail) {
      return res.status(400).json({ error: 'recipientEmail is required' });
    }

    await sendDecisionCardToUser(recipientEmail, cardPayload);

    return res.status(200).json({ success: true, message: 'Teams message delivered' });
  } catch (error) {
    console.error('Teams delivery error:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Failed to deliver Teams notification',
      details: error.response?.data || error.message
    });
  }
});

module.exports = router;