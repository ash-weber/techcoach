import axios from "axios";
import { getAuthHeaders } from "../api";

const postSkillLink = async ({ decision_id, skill_ids, skill_names }) => {
  const token = localStorage.getItem("token");
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

const postProfileLink = async ({ decision_id, v_ids }) => {
  const token = localStorage.getItem("token");
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
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/link`,
      getAuthHeaders(),
    );
    return response.data.skills;
  } catch (error) {
    console.error("Error fetching all skill links", error);
    throw error;
  }
};

const getAllProfileLink = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/links`,
      getAuthHeaders(),
    );
    return response.data.profiles;
  } catch (error) {
    console.error("Error fetching all profile links", error);
    throw error;
  }
};

const deleteSkillLink = async (id) => {
  const token = localStorage.getItem("token");
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
  const token = localStorage.getItem("token");
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
  
export {
  postProfileLink,
  postSkillLink,
  deleteProfileLink,
  deleteSkillLink,
  getAllProfileLink,
  getAllSkillLink,
};
