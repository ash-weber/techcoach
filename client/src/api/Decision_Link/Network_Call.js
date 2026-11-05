import axios from "axios";
import { getAuthHeaders } from "../api";

const postSkillLink = async (decision_id, skill_ids, skill_names) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/link`,
      { decision_id, skill_ids, skill_names },
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error linking skills to decision", error);
    throw error;
  }
};

const postProfileLink = async (decision_id, v_ids) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/links`,
      { decision_id, v_ids },
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error linking profile to decision", error);
    throw error;
  }
};

const getAllSkillLink = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/link`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching all skill links", error);
    throw error;
  }
};

const getAllProfileLink = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/links`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching all profile links", error);
    throw error;
  }
};

const deleteSkillLink = async (id) => {
  try {
    const response = await axios.delete(
      `${process.env.REACT_APP_API_URL}/api/link/${id}`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting skill link", error);
    throw error;
  }
};

const deleteProfileLink = async (id) => {
  try {
    const response = await axios.delete(
      `${process.env.REACT_APP_API_URL}/api/links/${id}`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting profile link", error);
    throw error;
  }
};

const postAdvancedProfileLink = async ( decision_id, v_ids ) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/link/advancedLink`,
      { decision_id, v_ids },
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error linking advanced profile to decision", error);
    throw error;
  }
};

const getAllAdvancedProfileLink = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/link/advancedLink`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching advanced profile links", error);
    throw error;
  }
};

const deleteAdvancedProfileLink = async (id) => {
  try {
    const response = await axios.delete(
      `${process.env.REACT_APP_API_URL}/link/advancedLink/${id}`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting advanced profile link", error);
    throw error;
  }
};

export {
  postProfileLink,
  postSkillLink,
  deleteProfileLink,
  deleteSkillLink,
  getAllProfileLink,
  getAllSkillLink,
  postAdvancedProfileLink,
  getAllAdvancedProfileLink,
  deleteAdvancedProfileLink,
};
