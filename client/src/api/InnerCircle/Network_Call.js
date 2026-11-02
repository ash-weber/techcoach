import axios from "axios";
import { toast } from "react-toastify";
import { getAuthHeaders } from "../api";
   
const getUserListForInnerCircle = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/group/fetchUserList`,
      getAuthHeaders(),
    );
    return response.data.tasks;
  } catch (error) {
    return error.message;
  }
};

const innerCircleCreation = async (groupData) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/group/innerCircleCreation`,
      groupData,
      getAuthHeaders(),
    );
    return response;
  } catch (error) {
    return error.message;
  }
};

const checkInnerCircleExists = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/group/checkInnerCircleExists`,
      getAuthHeaders(),
    );
    return response.data.exists;
  } catch (error) {
    return error.message;
  }
};

const getInnerCircleDetails = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/group/getInnerCircleDetails`,
      getAuthHeaders(),
    );

    return response.data;
  } catch (error) {
    return error.message;
  }
};

const removeMemberFromInner = async (userId, group_id) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.delete(
      `${process.env.REACT_APP_API_URL}/group/removeMemberFromInner`,
      {
        headers: getAuthHeaders(),
        data: {
          userId,
          group_id,
        },
      },
    );
    return response.data;
  } catch (error) {
    return error.message;
  }
};

const getAddMemberNameListFetch = async (existingMemberIds) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/group/getAddMemberNameList`,
      { existingMemberIds },
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    return error.message;
  }
};

const addMemberToInnerCircle = async (userId, groupId) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/group/addMemberInInnerCircle`,
      {
        header: getAuthHeaders(),
        data: {
          userId,
          groupId,
        },
      },
    );
    return response.data;
  } catch (error) {
    return error.message;
  }
};

const shareDecisionInInnerCircle = async (payload) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${process.env.REACT_APP_API_URL}/group/shareDecisionInInnerCircle`,
    payload,
    getAuthHeaders(),
  );
  return response;
};

const getSharedMembers = async (payload) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${process.env.REACT_APP_API_URL}/group/getSharedMembers`,
    payload,
    getAuthHeaders(),
  );
  return response.data.result;
};

const getInnerCircleAcceptNotification = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(
    `${process.env.REACT_APP_API_URL}/group/getInnerCircleAcceptNotification`,
    getAuthHeaders(),
  );

  return response.data;
};

const acceptOrRejectInnerCircle = async (groupId, status) => {
  const token = localStorage.getItem("token");
  const response = await axios.put(
    `${process.env.REACT_APP_API_URL}/group/acceptOrRejectInnerCircle`,
    {
      headers: getAuthHeaders(),
      data: {
        groupId,
        status,
      },
    },
  );
  return response.data;
};

const getSharedDecisions = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(
    `${process.env.REACT_APP_API_URL}/group/getSharedDecisions`,
    getAuthHeaders(),
  );

  return response.data.results;
};

const postCommentForDecision = async (
  decisionId,
  groupMemberID,
  commentText,
  groupId,
) => {
  const token = localStorage.getItem("token");
  const response = await axios.put(
    `${process.env.REACT_APP_API_URL}/group/postCommentForDecision`,
    {
      headers: getAuthHeaders(),
      data: {
        decisionId,
        groupMemberID,
        commentText,
        groupId,
      },
    },
  );

  return response;
};

const getSharedComments = async (decisionId) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/group/getSharedComments`,
      {
        decisionId: decisionId,
      },
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching shared comments", error);
    throw error;
  }
};

const deleteCommentAdded = async (commentId) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.delete(
      `${process.env.REACT_APP_API_URL}/group/removeCommentsAdded`,
      {
        headers: getAuthHeaders(),
        data: {
          commentId,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching shared comments", error);
    throw error;
  }
};

const postReplyComment = async (commentId, reply, groupId, decisionId) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/group/postReplyComment`,
      { commentId, reply, groupId, decisionId },
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching reply", error);
    throw error;
  }
};

const EditCommentAdded = async (commentId, editedContent) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/group/editCommentsAdded`,
      {
        headers: getAuthHeaders(),
        data: {
          commentId,
          editedContent,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching editted comments", error);
    throw error;
  }
};

const mailToInnerCircleDecisionShare = async (memberEmail, decisionSummary) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/group/innerCircleDecisionShare`,
      { memberEmail, decisionSummary },
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching editted comments", error);
    throw error;
  }
};

const innerCirclePostComment = async (
  decision,
  groupMemberID,
  commentText,
  email,
) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/group/innerCirclePostComment`,
      { decision, groupMemberID, commentText, email },
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching editted comments", error);
    throw error;
  }
};

const innerCirclePostReplyComment = async (
  commentId,
  reply,
  groupId,
  decisionId,
) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/group/innerCirclePostReply`,
      { commentId, reply, groupId, decisionId },
      getAuthHeaders(),
    );
    if (response.status === 200) {
      toast.success("Reply Post successfully");
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching inner circle reply comment", error);
    throw error;
  }
};

const innerCircleInvitation = async (invitationData) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/group/innerCircleInvitation`,
      invitationData,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error Inviting the person to the Decision App", error);
    throw error;
  }
};

const innerCircleAddInvitation = async (email) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/group/innerCircleAddInvitation`,
      { email },
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error Inviting the person to the Decision App", error);
    throw error;
  }
};

const getSharedDecisionDetails = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/group/getSharedDecisionDetails`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error in getting shared decision details", error);
    throw error;
  }
};

const getSharedWithDecisionsCount = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/group/getSharedDecisionsCount`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching shared with decisions count", error);
    throw error;
  }
};

const getSharedByDecisionsCount = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/group/getSharedByDecisionsCount`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching shared by decisions count", error);
    throw error;
  }
};

export {
  getUserListForInnerCircle,
  innerCircleCreation,
  checkInnerCircleExists,
  getInnerCircleDetails,
  removeMemberFromInner,
  getAddMemberNameListFetch,
  addMemberToInnerCircle,
  shareDecisionInInnerCircle,
  getSharedMembers,
  getInnerCircleAcceptNotification,
  acceptOrRejectInnerCircle,
  getSharedDecisions,
  postCommentForDecision,
  getSharedComments,
  deleteCommentAdded,
  postReplyComment,
  EditCommentAdded,
  mailToInnerCircleDecisionShare,
  innerCirclePostComment,
  innerCirclePostReplyComment,
  innerCircleInvitation,
  getSharedDecisionDetails,
  innerCircleAddInvitation,
  getSharedWithDecisionsCount,
  getSharedByDecisionsCount,
};
