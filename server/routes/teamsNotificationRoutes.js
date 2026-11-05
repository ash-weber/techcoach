const express = require('express');
const router = express.Router();
const { sendDecisionCardToUser, sendCommentNotificationToMembers  } = require('../Services/teamsGraphService');


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

router.post('/notify-comment', async (req, res) => {
  try {
    const {
      recipientEmails,    
      commenterEmail,     
      circleType,         
      circleName,
      decisionName,
      decisionId,
      commentText,
      isReply = false,
      actionUrl,          
    } = req.body;

    if (!Array.isArray(recipientEmails) || recipientEmails.length === 0) {
      return res.status(400).json({ error: 'recipientEmails is required' });
    }

    const payload = {
      action: isReply ? 'REPLY' : 'COMMENT',
      actionColor: 'Accent',
      decisionName: decisionName || 'Untitled Decision',
      details: commentText || '',
      updatedBy: commenterEmail || 'Circle Member',
      dueDate: 'N/A',
      takenDate: 'N/A',
      tags: circleName ? `${circleType?.replace('_', ' ')} · ${circleName}` : (circleType || 'N/A'),
      reasons: 'N/A',
      decisionId: decisionId ? String(decisionId) : 'N/A',
      actionUrl,
    };

    console.log("payload", payload)

    const result = await sendCommentNotificationToMembers(
      recipientEmails,
      payload,
      commenterEmail,
    );

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Teams comment notify error:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Failed to notify members',
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;