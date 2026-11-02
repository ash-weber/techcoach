import axios from "axios";
import { getAuthHeaders } from "../api";

    
const getUserList = async () => {
    try {
        const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/user/profile`,
            getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.log(error);
        return error.message;
    }
};

const postGeneralProfile = async ({ attitude, strength, weakness, opportunity, threat }) => {
    try {
        const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/api/user/data`,
            { attitude, strength, weakness, opportunity, threat },
            getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.log(error);
        return error.message;
    }
};

const getMasterProfiles = async () => {
    try {
        const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/user/data/master-profiles`,
            getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.log(error);
        return error.message;
    }
};

const getProfile = async () => {
    try {
        const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/user/data`,
            getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.log(error);
        return error.message;
    }
};

const putProfile = async ({ attitude, strength, weakness, opportunity, threat }) => {
    try {
        const response = await axios.put(
            `${process.env.REACT_APP_API_URL}/api/user/data`,
            { attitude, strength, weakness, opportunity, threat },
            getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.log(error);
        return error.message;
    }
};

const deleteProfile = async () => {
    try {
        const response = await axios.delete(
            `${process.env.REACT_APP_API_URL}/api/user/data`,
            getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.log(error);
        return error.message;
    }
};

export {
    getUserList,
    postGeneralProfile,
    getMasterProfiles,
    getProfile,
    putProfile,
    deleteProfile,
};