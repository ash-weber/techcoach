const axios = require('axios');

const TENANT_ID = process.env.MICROSOFT_TENANT_ID;
const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;
const SYSTEM_USER = process.env.TEAMS_SYSTEM_EMAIL; 
const SYSTEM_PASSWORD = process.env.TEAMS_SYSTEM_PASSWORD;

async function getDelegatedToken() {
  const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'password',
    username: SYSTEM_USER,
    password: SYSTEM_PASSWORD
  });

  const res = await axios.post(tokenUrl, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return res.data.access_token;
}

async function sendDecisionCardToUser(targetEmailOrPayload, cardPayload = {}) {
  let targetEmail;
  let payload;

  if (typeof targetEmailOrPayload === 'object' && targetEmailOrPayload !== null) {
    targetEmail = targetEmailOrPayload.recipientEmail;
    payload = targetEmailOrPayload;
  } else {
    targetEmail = targetEmailOrPayload;
    payload = cardPayload;
  }

  if (!targetEmail || typeof targetEmail !== 'string') {
    throw new Error(`Invalid targetEmail: received ${JSON.stringify(targetEmail)}`);
  }

  const token = await getDelegatedToken();
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const userRes = await axios.get(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(targetEmail.trim())}`,
    { headers }
  );
  const targetUserId = userRes.data.id;


  const meRes = await axios.get('https://graph.microsoft.com/v1.0/me', { headers });
  const myUserId = meRes.data.id;

  const chatRes = await axios.post('https://graph.microsoft.com/v1.0/chats', {
    chatType: 'oneOnOne',
    members: [
      {
        '@odata.type': '#microsoft.graph.aadUserConversationMember',
        roles: ['owner'],
        'user@odata.bind': `https://graph.microsoft.com/v1.0/users('${myUserId}')`
      },
      {
        '@odata.type': '#microsoft.graph.aadUserConversationMember',
        roles: ['owner'],
        'user@odata.bind': `https://graph.microsoft.com/v1.0/users('${targetUserId}')`
      }
    ]
  }, { headers });

  const chatId = chatRes.data.id;

  const adaptiveCardStructure = {
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    type: 'AdaptiveCard',
    version: '1.4',
    body: [
      {
        type: 'Container',
        style: 'emphasis',
        items: [
          {
            type: 'ColumnSet',
            columns: [
              {
                type: 'Column',
                width: 'stretch',
                items: [
                  {
                    type: 'TextBlock',
                    text: 'DECISION COACH',
                    size: 'Small',
                    weight: 'Bolder',
                    color: 'Accent'
                  },
                  {
                    type: 'TextBlock',
                    text: payload.decisionName || 'Untitled Decision',
                    size: 'Large',
                    weight: 'Bolder',
                    wrap: true
                  }
                ]
              },
              {
                type: 'Column',
                width: 'auto',
                items: [
                  {
                    type: 'TextBlock',
                    text: payload.action || 'NOTIFICATION',
                    color: payload.actionColor || 'Default',
                    weight: 'Bolder',
                    size: 'Medium',
                    horizontalAlignment: 'Right'
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        type: 'Container',
        items: [
          {
            type: 'TextBlock',
            text: payload.details || 'No description provided.',
            wrap: true,
            isSubtle: true,
            spacing: 'Medium'
          },
          {
            type: 'FactSet',
            spacing: 'Medium',
            facts: [
              {
                title: 'Action By:',
                value: payload.updatedBy || 'Decision Coach User'
              },
              {
                title: 'Due Date:',
                value: payload.dueDate || 'N/A'
              },
              {
                title: 'Status / Taken:',
                value: payload.takenDate || 'Pending'
              },
              {
                title: 'Tags:',
                value: payload.tags || 'None'
              },
              {
                title: 'Key Reason:',
                value: payload.reasons || 'None'
              }
            ]
          }
        ]
      }
    ]
  };

  await axios.post(
    `https://graph.microsoft.com/v1.0/chats/${chatId}/messages`,
    {
      body: {
        contentType: 'html',
        content: '<attachment id="decisionCard"></attachment>'
      },
      attachments: [
        {
          id: 'decisionCard',
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: JSON.stringify(adaptiveCardStructure) 
        }
      ]
    },
    { headers }
  );
}

module.exports = { sendDecisionCardToUser };