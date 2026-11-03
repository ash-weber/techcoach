import axios from "axios";
import { getAuthHeaders } from "../api";

const getUserListForDecisionCircle = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/group/fetchUserList`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return error.message;
  }
};

const decisionCircleCreation = async (
  created_by,
  type_of_group = "decision_circle",
  group_id,
  members,
) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/group/decisionCircleCreation`,
      { created_by, type_of_group, group_id, members },
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error creating Decision Group with Members:",
      error.response?.data || error.message,
    );

    return error.message;
  }
};

const getUserDecisionCircles = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/group/getUserDecisionCircles`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error creating Decision Group with Members:",
      error.response?.data || error.message,
    );
    return error.message;
  }
};

const getdecisionCirclesByUser = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/group/getdecisionCirclesByUser`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error creating Decision Group with Members:",
      error.response?.data || error.message,
    );
    return error.message;
  }
};

const getdecisionCirclesByUserAndMember = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/group/getdecisionCirclesByUserAndMember`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error creating Decision Group with Members:",
      error.response?.data || error.message,
    );
    return error.message;
  }
};

const getUsersForGroup = async (groupId) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/group/getUsersForGroup/${groupId}`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching users for group:", error);
    throw error;
  }
};

const getGroupDetails = async (groupId) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/group/getGroupDetails/${groupId}`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching details for group:", error);
    throw error;
  }
};

const removeUsersFromGroup = async (groupId, userId) => {
  try {
    const response = await axios.delete(
      `${process.env.REACT_APP_API_URL}/group/removeUsersFromGroup/${groupId}/${userId}`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching users for Group:", error);
    throw error;
  }
};

const sendDecisionCircleInvitation = async (email) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/group/sendDecisionCircleInvitation`,
      { email },
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error Inviting the person to the Decision App", error);
    throw error;
  }
};

const decisionshareDecisionCircle = async (group_id, decision_id) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/group/decisionshareDecisionCircle`,
      { group_id, decision_id },
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error Fetching Decision Share:", error);
    throw error;
  }
};

const getdecisionSharedDecisionCircle = async (groupId) => {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/group/getdecisionSharedDecisionCircle/${groupId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error Fetching Decision Get Circles:", error);
    throw error;
  }
};

const getMemberSharedDecisions = async (groupId) => {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/group/getMemberSharedDecisions/${groupId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { group_id: groupId },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error Fetching Decision Get Circles:", error);
    throw error;
  }
};

const mailToDecisionCirclePostComment = async (
  decisionId,
  groupId,
  comment,
  email,
) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/group/decisionCirclePostComment`,
      {
        decisionId,
        groupId,
        comment,
        email,
      },
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching added comments", error);
    throw error;
  }
};

const mailToDecisionCircleReplyComment = async (
  decision,
  parentCommentId,
  reply,
  groupId,
) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/group/decisionCircleReplyComment`,
      {
        decision,
        parentCommentId,
        reply,
        groupId,
      },
      getAuthHeaders(),
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error sending reply:",
      error.response ? error.response.data : error.message,
    );
    throw error;
  }
};

// const getSharedDecisionCircleDetails = async () =>{
//     const token = localStorage.getItem('token');
//     const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/getSharedDecisionCircleDetails`, {
//         headers: {
//             Authorization: `Bearer ${token}`
//         }
//     });

//     return response.data;
// }

const getUserSharedDecisions = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/group/sharedbyme`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error Fetching Decision Get Circles:", error);
    throw error;
  }
};

const getdecisionSharedDecisionCirclebyuser = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/group/sharedwithme`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error Fetching Decision Get Circles:", error);
    throw error;
  }
};

const postdecisionGroup = async (
  group_name,
  type_of_group = "decision_circle",
) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/group/decisionGroup`,
      {
        group_name,
        type_of_group,
      },
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error creating decision group:", error);
    throw error;
  }
};

const getAlldecisionGroup = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/group/decisiongroup`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching decision groups:", error);
    throw error;
  }
};

const getDecisionGroup = async (id) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/group/decisiongroup/${id}`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching decision group with ID ${id}:`, error);
    throw error;
  }
};

const putDecisionGroup = async (
  id,
  group_name,
  type_of_group = "decision_circle",
) => {
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/group/decisiongroup/${id}`,
      {
        group_name,
        type_of_group,
      },
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating decision group with ID ${id}:`, error);
    throw error;
  }
};

const deleteDecisionGroup = async (id) => {
  try {
    const response = await axios.delete(
      `${process.env.REACT_APP_API_URL}/group/decisiongroup/${id}`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error(`Error deleting decision group with ID ${id}:`, error);
    throw error;
  }
};

const postComment = async (groupId, comment, decisionId) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/group/comment`,
      {
        groupId,
        commentText: comment,
        decisionId,
      },
      getAuthHeaders(),
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Error posting comment:", error.response.data);
      throw error.response.data;
    } else {
      console.error("Error:", error.message);
      throw new Error("An error occurred while posting the comment");
    }
  }
};

// const postComment = async (groupId, commentText, decisionId) => {
//     const token = localStorage.getItem('token');

//     try {
//         const response = await axios.post(`${process.env.REACT_APP_API_URL}/group/comments`,
//             {
//                 groupId,
//                 commentText,
//                 decisionId,
//             }, {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//                 'Content-Type': 'application/json'
//             }
//         }
//         );
//         return response.data;
//     } catch (error) {
//         if (error.response) {
//             console.error("Error posting comment:", error.response.data);
//             throw error.response.data; // Propagate error for further handling
//         } else if (error.request) {
//             console.error("No response received:", error.request);
//             throw new Error('No response received from the server');
//         } else {
//             console.error("Error", error.message);
//             throw new Error('An error occurred while posting the comment');
//         }
//     }
// };

const postShareWithComment = async (groupId, commentText, decisionId) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/group/comment`,
      {
        groupId,
        commentText,
        decisionId,
      },
      getAuthHeaders(),
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Error posting comment:", error.response.data);
      throw error.response.data;
    } else if (error.request) {
      console.error("No response received:", error.request);
      throw new Error("No response received from the server");
    } else {
      console.error("Error", error.message);
      throw new Error("An error occurred while posting the comment");
    }
  }
};

const getComments = async (groupId, decisionId) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/group/comments/${groupId}/${decisionId}`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw new Error("Failed to fetch comments");
  }
};

const getWithComments = async (decisionId, groupId) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/group/comment`,
      {
        ...getAuthHeaders(),
        params: {
          groupId,
          decisionId,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw new Error("Failed to fetch comments");
  }
};

const getDecisionComments = async (decisionId) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/group/comments/${decisionId}`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw new Error("Failed to fetch comments");
  }
};

const updateComment = async (commentId, updatedComment) => {
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/group/comments/${commentId}`,
      updatedComment,
      getAuthHeaders(),
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error updating comment:",
      error.response ? error.response.data : error.message,
    );
    throw error.response
      ? error.response.data
      : new Error("Error updating comment");
  }
};

const editComments = async (commentId, comment) => {
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/group/comment/${commentId}`,
      comment,
      getAuthHeaders(),
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error updating comment:",
      error.response ? error.response.data : error.message,
    );
    throw error.response
      ? error.response.data
      : new Error("Error updating comment");
  }
};

const replyToComment = async (data) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/group/comments/reply`,
      data,
      getAuthHeaders(),
    );

    return response.data;
  } catch (error) {
    console.error("Error posting comment:", error.response.data);
    throw error.response.data;
  }
};

const deleteComment = async (commentId) => {
  try {
    const response = await axios.delete(
      `${process.env.REACT_APP_API_URL}/group/comments/${commentId}`,
      getAuthHeaders(),
    );

    return response.data;
  } catch (error) {
    console.error("Error posting comment:", error.response.data);
    throw error.response.data;
  }
};

const sendTeamsDecisionCard = async (payload) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/teams/notify`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error sending Teams decision card", error);
    throw error;
  }
};

export {
  getUserListForDecisionCircle,
  decisionCircleCreation,
  getUserDecisionCircles,
  getdecisionCirclesByUser,
  getdecisionCirclesByUserAndMember,
  getUsersForGroup,
  removeUsersFromGroup,
  sendDecisionCircleInvitation,
  decisionshareDecisionCircle,
  getdecisionSharedDecisionCircle,
  getMemberSharedDecisions,
  mailToDecisionCirclePostComment,
  mailToDecisionCircleReplyComment,
  // getSharedDecisionCircleDetails,
  getUserSharedDecisions,
  getdecisionSharedDecisionCirclebyuser,

  // group namess
  postdecisionGroup,
  getAlldecisionGroup,
  getDecisionGroup,
  putDecisionGroup,
  deleteDecisionGroup,

  // Decision-Circle Networkk_Call
  postComment,
  getComments,
  getDecisionComments,
  updateComment,
  replyToComment,
  deleteComment,
  postShareWithComment,
  getWithComments,
  editComments,
  getGroupDetails,
  sendTeamsDecisionCard,
};
