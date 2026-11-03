import axios from "axios";
import { getAuthHeaders } from "../api";


const createDecision = async (decisionData) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/details`,
      decisionData,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error creating decision", error);
    throw error;
  }
};

const getAllDecisionDetails = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/details`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching all decision details", error);
    throw error;
  }
};  

const getDecisionById = async (id) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/details/${id}`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching decision by id", error);
    throw error;
  }
};

const getReferredDecisionById = async (id) => {
  try {  
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/getInfo_Referred/${id}`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching referred decision by id", error);
    throw error;
  }
};

const updateDecision = async (id, decisionData) => {
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/api/details/${id}`,
      decisionData,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error updating decision", error);
    throw error;
  }
};

const deleteDecision = async (id) => {
  try {
    const response = await axios.delete(
      `${process.env.REACT_APP_API_URL}/api/details/${id}`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting decision", error);
    throw error;
  }
};

const getUserDecisions = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user decisions", error);
    throw error;
  }
};

const getMonthlyDecisionCount = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/decisions/monthly-count`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching monthly decision count", error);
    throw error;
  }
};

export {
  createDecision,
  getAllDecisionDetails,
  getDecisionById,
  getReferredDecisionById,
  updateDecision,
  deleteDecision,
  getUserDecisions,
  getMonthlyDecisionCount,
};
