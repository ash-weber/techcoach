/* 

Power Automate

const TEAMS_WEBHOOK_URL = process.env.REACT_APP_TEAMS_WEBHOOK_URL;

export const notifyTeamsChannel = async (action, decision = {}, targetEmail = null) => {
  const authUser = JSON.parse(localStorage.getItem("auth_user") || "{}");

  const senderEmail = authUser.email || "";
  const senderName = authUser.name || "";

  const rawTags = decision.tags || decision.tagsArray;
  let formattedTags = "None";
  if (typeof rawTags === "string") {
    formattedTags = rawTags;
  } else if (Array.isArray(rawTags)) {
    formattedTags =
      rawTags
        .map((t) => t.tag_name || t)
        .filter(Boolean)
        .join(", ") || "None";
  }

  let formattedReasons = "None";
  if (Array.isArray(decision.decision_reason) && decision.decision_reason.length > 0) {
    formattedReasons = decision.decision_reason
      .map((r) => r.decision_reason_text || r)
      .filter(Boolean)
      .join(", ");
  }

  const badgeColors = {
    CREATED: "Good",
    UPDATED: "Accent",
    DELETED: "Attention",
    SHARED: "Accent", 
  };

  const payload = {
    recipientEmail: targetEmail || senderEmail || "swetha@ibacustechlabs.in",
    action: action,
    actionColor: badgeColors[action] || "Default",
    decisionName: decision.decision_name || "Untitled Decision",
    details: decision.user_statement || "No description provided.",
    dueDate: decision.decision_due_date
      ? new Date(decision.decision_due_date).toLocaleDateString("en-GB")
      : "N/A",
    takenDate: decision.decision_taken_date
      ? new Date(decision.decision_taken_date).toLocaleDateString("en-GB")
      : "Pending",
    tags: formattedTags,
    reasons: formattedReasons,
    updatedBy: senderName || senderEmail || "Decision Coach User",
    decisionId: decision.decision_id ? String(decision.decision_id) : "N/A",
  };

  try {
    const response = await fetch(TEAMS_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Teams webhook error:", response.status, err);
    }
  } catch (err) {
    console.error("Teams notification error:", err);
  }
}; */


//Teams incoming webhook

const TEAMS_CHANNEL_WEBHOOK_URL = process.env.REACT_APP_FREE_TEAMS_WEBHOOK_URL;

export const notifyTeamsChannel = async (action, decision = {}, targetEmail = null) => {
  const authUser = JSON.parse(localStorage.getItem("auth_user") || "{}");
  const recipientEmail = targetEmail || authUser.email || "swetha@ibacustechlabs.in";
  const recipientName = authUser.name || "Member";

  const payload = {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.4",
          body: [
            {
              type: "TextBlock",
              text: `Decision Alert: ${action}`,
              weight: "Bolder",
              size: "Medium",
              color: action === "DELETED" ? "Attention" : "Accent"
            },
            {
              type: "TextBlock",
              text: `Attention <at>${recipientName}</at>: Decision "${decision.decision_name}" was ${action}.`,
              wrap: true
            },
            {
              type: "FactSet",
              facts: [
                { title: "Due Date:", value: decision.decision_due_date || "N/A" },
                { title: "Status:", value: decision.decision_taken_date || "Pending" }
              ]
            }
          ],
          msteams: {
            entities: [
              {
                type: "mention",
                text: `<at>${recipientName}</at>`,
                mentioned: {
                  id: recipientEmail,
                  name: recipientName
                }
              }
            ]
          }
        }
      }
    ]
  };

  await fetch(TEAMS_CHANNEL_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
};



/* 

Graph API

export const notifyTeamsChannel = async (action, decision = {}, targetEmail = null) => {
  const authUser = JSON.parse(localStorage.getItem("auth_user") || "{}");

  const senderEmail = authUser.email || "";
  const senderName = authUser.name || "";

  const rawTags = decision.tags || decision.tagsArray;
  let formattedTags = "None";
  if (typeof rawTags === "string") {
    formattedTags = rawTags;
  } else if (Array.isArray(rawTags)) {
    formattedTags =
      rawTags
        .map((t) => t.tag_name || t)
        .filter(Boolean)
        .join(", ") || "None";
  }

  let formattedReasons = "None";
  if (Array.isArray(decision.decision_reason) && decision.decision_reason.length > 0) {
    formattedReasons = decision.decision_reason
      .map((r) => (typeof r === "string" ? r : r.decision_reason_text || ""))
      .filter(Boolean)
      .join(", ");
  }

  const badgeColors = {
    CREATED: "Good",
    UPDATED: "Accent",
    DELETED: "Attention",
    SHARED: "Accent",
  };

  const payload = {
    recipientEmail: targetEmail || senderEmail || "swetha@ibacustechlabs.in",
    action: action,
    actionColor: badgeColors[action] || "Default",
    decisionName: decision.decision_name || "Untitled Decision",
    details: decision.user_statement || "No description provided.",
    dueDate: decision.decision_due_date
      ? new Date(decision.decision_due_date).toLocaleDateString("en-GB")
      : "N/A",
    takenDate: decision.decision_taken_date
      ? new Date(decision.decision_taken_date).toLocaleDateString("en-GB")
      : "Pending",
    tags: formattedTags,
    reasons: formattedReasons,
    updatedBy: senderName || senderEmail || "Decision Coach User",
    decisionId: decision.decision_id ? String(decision.decision_id) : "N/A",
  };

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/teams/notify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Teams notification error:", response.status, err);
    }
  } catch (err) {
    console.error("Teams notification error:", err);
  }
}; */