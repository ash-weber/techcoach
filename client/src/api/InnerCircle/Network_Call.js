import axios from "axios";
import { toast } from "react-toastify";
import { getAuthHeaders } from "../api";
   
const getUserListForInnerCircle = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/group/fetchUserList`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    return error.message;
  }
};

const innerCircleCreation = async (groupData) => {
  
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
  
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/group/checkInnerCircleExists`,
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    return error.message;
  }
};

const getInnerCircleDetails = async () => {
  
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
  
  const response = await axios.post(
    `${process.env.REACT_APP_API_URL}/group/shareDecisionInInnerCircle`,
    payload,
    getAuthHeaders(),
  );
  return response;
};

const getSharedMembers = async (payload) => {
  
  const response = await axios.post(
    `${process.env.REACT_APP_API_URL}/group/getSharedMembers`,
    payload,
    getAuthHeaders(),
  );
  return response.data;
};

const getInnerCircleAcceptNotification = async () => {
  
  const response = await axios.get(
    `${process.env.REACT_APP_API_URL}/group/getInnerCircleAcceptNotification`,
    getAuthHeaders(),
  );

  return response.data;
};

const acceptOrRejectInnerCircle = async (groupId, status) => {
  
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
  
  const response = await axios.get(
    `${process.env.REACT_APP_API_URL}/group/getSharedDecisions`,
    getAuthHeaders(),
  );

  return response.data;
};

const postCommentForDecision = async (
  decisionId,
  groupMemberID,
  commentText,
  groupId,
  biasTagIds
) => {
  
  const response = await axios.put(
    `${process.env.REACT_APP_API_URL}/group/postCommentForDecision`,
    {
      headers: getAuthHeaders(),
      data: {
        decisionId,
        groupMemberID,
        commentText,
        groupId,
        biasTagIds
      },
    },
  );

  return response;
};

const getSharedComments = async (decisionId) => {
  
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

const postReplyComment = async (commentId, reply, groupId, decisionId , biasTagIds = [],) => {
  
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/group/postReplyComment`,
      { commentId, reply, groupId, decisionId, biasTagIds },
      getAuthHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching reply", error);
    throw error;
  }
};

const EditCommentAdded = async (commentId, editedContent, biasTags) => {
  
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/group/editCommentsAdded`,
      {
        headers: getAuthHeaders(),
        data: {
          commentId,
          editedContent,
           biasTags: biasTags.map((tag) => tag.id),
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
   biasTagIds = [],
) => {
  
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/group/innerCirclePostReply`,
      { commentId, reply, groupId, decisionId , biasTagIds},
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
