import axios from "axios";

import { getAuthHeaders } from "../api";

const getAdminUserList = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/admin`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return error.message;
  }
};

const deleteAdminAccount = async (id) => {
  try {
    const response = await axios.delete(
      `${process.env.REACT_APP_API_URL}/api/admin/account/${id}`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return error.message;
  }
};

const getUserType = async (token) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/admin/type`,
      getAuthHeaders(),
    );
    return response;
  } catch (error) {
    console.log(error);
    return error.message;
  }
};
const getAdminUserDetails = async (id) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/admin/${id}`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return error.message;
  }
};

const getAdminDecisionCount = async (id) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/admin/decision/count/${id}`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return error.message;
  }
};

const getAdminLastLogin = async (id) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/admin/login/last/${id}`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return error.message;
  }
};

export {
  getAdminUserList,
  deleteAdminAccount,
  getUserType,
  getAdminUserDetails,
  getAdminDecisionCount,
  getAdminLastLogin,
};
