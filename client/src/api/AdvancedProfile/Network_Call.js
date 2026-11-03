import axios from "axios";

import { getAuthHeaders } from "../api";

const getUserList = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/advanced`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user list", error);
    throw error;
  }
};

const postAdvancedProfile = async ({
  goals,
  values,
  resolutions,
  constraints,
  other_factors,
}) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/data/advanced`,
      { goals, values, resolutions, constraints, other_factors },
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error inserting advanced profile data", error);
    throw error;
  }
};

const getMasterProfiles = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/data/master`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching master profiles", error);
    throw error;
  }
};

const getAdvancedProfile = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/data/advanced`,
      getAuthHeaders(),
    );
    // returns: { user_id, generated_at, header_count, goals: [{id, value}], values: [...], ... }
    return response.data;
  } catch (error) {
    console.error("Error fetching advanced profile", error);
    throw error;
  }
};

const putAdvancedProfile = async ({
  goals,
  values,
  resolutions,
  constraints,
  other_factors,
}) => {
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/api/data/advanced`,
      { goals, values, resolutions, constraints, other_factors },
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error updating advanced profile data", error);
    throw error;
  }
};

export {
  getUserList,
  postAdvancedProfile,
  getMasterProfiles,
  getAdvancedProfile,
  putAdvancedProfile,
};
