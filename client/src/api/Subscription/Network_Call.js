import axios from "axios";

import { getAuthHeaders } from "../api";

const createSubscription = async () => {
  
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/subscription/create`,
      {},
      getAuthHeaders(),
    );
    // returns { approvalUrl } — redirect the browser here
    return response.data;
  } catch (error) {
    console.error("Error creating PayPal subscription", error);
    throw error;
  }
};

const confirmSubscription = async (subscriptionId) => {
  
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/subscription/confirm`,
      { subscriptionId },
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error confirming subscription", error);
    throw error;
  }
};

const getSubscriptionStatus = async () => {
  
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/subscription/status`,
      getAuthHeaders(),
    );
    // returns { isSubscribed, status, lastPaymentTime, nextBillingTime }
    return response.data;
  } catch (error) {
    console.error("Error fetching subscription status", error);
    throw error;
  }
};

const createOneTimeOrder = async (orderPayload) => {
  
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/subscription/orders/create`,
      orderPayload,
      getAuthHeaders(),
    );
    // returns { id } — the PayPal order id
    return response.data;
  } catch (error) {
    console.error("Error creating one-time PayPal order", error);
    throw error;
  }
};

const captureOneTimeOrder = async (orderId) => {
  
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/subscription/orders/${orderId}/capture`,
      {},
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error capturing one-time PayPal order", error);
    throw error;
  }
};

const getPayPalClientToken = async () => {
  
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/subscription/client-token`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching PayPal client token", error);
    throw error;
  }
};

export {
  createSubscription,
  confirmSubscription,
  getSubscriptionStatus,
  createOneTimeOrder,
  captureOneTimeOrder,
  getPayPalClientToken,
};
