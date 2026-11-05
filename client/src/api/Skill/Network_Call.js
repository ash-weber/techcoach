import axios from "axios";

import { getAuthHeaders } from "../api";

const postSkill = async ({ skill_name, rating, comments }) => {
  
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/skill`,
      { skill_name, rating, comments },
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error inserting skill data", error);
    throw error;
  }
};

const getMasterSkills = async () => {
  
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/skill/master-skills`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching master skills", error);
    throw error;
  }
};

const getAllSkill = async () => {
  
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/skill/get`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching all skills", error);
    throw error;
  }
};

const getSkill = async (id) => {
  
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/skill/${id}`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching skill by id", error);
    throw error;
  }
};

const putSkill = async (id, { skill_name, rating, comments }) => {
  
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/skill/${id}`,
      { skill_name, rating, comments },
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error updating skill", error);
    throw error;
  }
};

const deleteSkill = async (id) => {
  
  try {
    const response = await axios.delete(
      `${process.env.REACT_APP_API_URL}/skill/${id}`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting skill", error);
    throw error;
  }
};

const deleteAllSkill = async () => {
  
  try {
    const response = await axios.delete(
      `${process.env.REACT_APP_API_URL}/skill`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting all skills", error);
    throw error;
  }
};

export {
  postSkill,
  getMasterSkills,
  getAllSkill,
  getSkill,
  putSkill,
  deleteSkill,
  deleteAllSkill,
};
