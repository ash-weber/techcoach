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

import { useEffect, useState } from "react";
import {
  getTeamsWebhookByGroupName,
  sendTeamsDecisionCard,
} from "../api/DecisionCircle/Network_Call";

//Teams incoming webhook

export const notifyTeamsChannel = async (
  action,
  decision = {},
  targetEmail = null,
  commentText = null,
  group_name = null,
) => {

  let TEAMS_CHANNEL_WEBHOOK_URL = "";

  try {
    if (!group_name) {
      console.error("Group name is required for Teams notification");
      return;
    }

    const response = await getTeamsWebhookByGroupName(group_name);

    TEAMS_CHANNEL_WEBHOOK_URL = response?.teams_webhook_url;

    if (!TEAMS_CHANNEL_WEBHOOK_URL) {
      console.error("No Teams webhook URL configured for:", group_name);
      return;
    }
  } catch (error) {
    console.error("Failed to retrieve Teams webhook:", error);
    return;
  }

  const authUser = JSON.parse(localStorage.getItem("auth_user") || "{}");
  const recipientEmail =
    targetEmail || authUser.email || "swetha@ibacustechlabs.in";
  const recipientName = authUser.name || "Member";
  const senderName = authUser.name || authUser.email || "A team member";

  const actionConfig = {
    CREATED: { color: "Good", emoji: "🆕", verb: "created" },
    UPDATED: { color: "Accent", emoji: "✏️", verb: "updated" },
    DELETED: { color: "Attention", emoji: "🗑️", verb: "deleted" },
    SHARED: { color: "Accent", emoji: "🔗", verb: "shared" },
    COMMENTED: { color: "Warning", emoji: "💬", verb: "commented on" },
  }[action] || { color: "Default", emoji: "📌", verb: action?.toLowerCase() };

  const facts = [
    { title: "Action:", value: action },
    { title: "Due Date:", value: decision.decision_due_date || "N/A" },
    { title: "Status:", value: decision.decision_taken_date || "Pending" },
    { title: "By:", value: senderName },
  ];

  const commentBlock =
    (action === "COMMENTED" || commentText) && commentText
      ? [
          {
            type: "TextBlock",
            text: "💬 Comment",
            weight: "Bolder",
            spacing: "Medium",
            separator: true,
          },
          {
            type: "TextBlock",
            text: commentText,
            wrap: true,
            color: "Default",
          },
        ]
      : [];

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
              text: `${actionConfig.emoji} Decision ${action}: ${decision.decision_name || "Untitled"}`,
              weight: "Bolder",
              size: "Medium",
              color: actionConfig.color,
              wrap: true,
            },
            {
              type: "TextBlock",
              text: `Attention <at>${recipientName}</at>: Decision "${decision.decision_name || "Untitled"}" was ${actionConfig.verb} by ${senderName}.`,
              wrap: true,
            },
            {
              type: "FactSet",
              facts,
            },
            ...commentBlock,
          ],
        },
      },
    ],
  };

  try {
    const res = await fetch(TEAMS_CHANNEL_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error("Teams webhook error:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Teams notification error:", err);
  }
};

// Graph API
/* 
export const notifyTeamsChannel = async (action, decision = {}, targetEmail = null, commentText = null) => {
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
    COMMENTED: "Accent",
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
    
    const response = await sendTeamsDecisionCard(payload);

    if (!response.ok) {
      const err = await response.text();
      console.error("Teams notification error:", response.status, err);
    }
  } catch (err) {
    console.error("Teams notification error:", err);
  }
}; */
