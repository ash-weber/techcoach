const axios = require("axios");

const PAYPAL_BASE = process.env.PAYPAL_BASE;
const CLIENT_URL = process.env.CLIENT_URL;

const getAccessToken = async () => {
  const res = await axios.post(
    `${PAYPAL_BASE}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      auth: {
        username: process.env.PAYPAL_CLIENT_ID,
        password: process.env.PAYPAL_SECRET,
      },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    },
  );
  return res.data.access_token;
};

const createSubscription = async (planId) => {
  const token = await getAccessToken();

  const res = await axios.post(
    `${PAYPAL_BASE}/v1/billing/subscriptions`,
    {
      plan_id: planId,
      application_context: {
        brand_name: "Decision Coach",
        user_action: "SUBSCRIBE_NOW",
        return_url: `${CLIENT_URL}/paypal/success`,
        cancel_url: `${CLIENT_URL}/paypal/cancel`,
      },
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  return res.data;
};

const getSubscriptionDetails = async (subscriptionId) => {
  const token = await getAccessToken();

  const res = await axios.get(
    `${PAYPAL_BASE}/v1/billing/subscriptions/${subscriptionId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return res.data;
};
const createOneTimeOrder = async (orderPayload) => {
  const token = await getAccessToken();

  const res = await axios.post(
    `${PAYPAL_BASE}/v2/checkout/orders`,
    orderPayload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
  return res.data;
};

const captureOneTimeOrder = async (orderId) => {
  const token = await getAccessToken();
  const res = await axios.post(
    `${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
  return res.data;
};

const getClientToken = async () => {
  const token = await getAccessToken();
  const res = await axios.post(
    `${PAYPAL_BASE}/v1/identity/generate-token`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Accept-Language": "en_US",
        "Content-Type": "application/json",
      },
    },
  );
  return res.data.client_token;
};

module.exports = {
  createSubscription,
  getSubscriptionDetails,
  createOneTimeOrder,
  captureOneTimeOrder,
  getClientToken,
};
