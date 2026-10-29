import axios from "axios";
import { toast } from "react-toastify";

const getUserListForInnerCircle = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/fetchUserList`, {
            headers: {
              Authorization: `Bearer ${token}`
            }});
        return response.data.tasks;
    } catch (error) {
        return error.message;
    }
};

const innerCircleCreation = async (groupData) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/group/innerCircleCreation`,
            groupData,  
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response;
    } catch (error) {
        return error.message;
    }
}

const checkInnerCircleExists = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/checkInnerCircleExists`, {
            headers: {
              Authorization: `Bearer ${token}`
            }});
        return response.data.exists;
    } catch (error) {
        return error.message;
    }
}

const getInnerCircleDetails = async() =>{
    const token = localStorage.getItem('token');
    try{
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/getInnerCircleDetails`,{
            headers: {
                Authorization: `Bearer ${token}`
        }});

        return response.data;
    }catch(error){
        return error.message;
    }
}

const removeMemberFromInner = async (userId, group_id) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.delete(`${process.env.REACT_APP_API_URL}/group/removeMemberFromInner`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: {
                userId,
                group_id
            }
        });
        return response.data;
    } catch (error) {
        return error.message;
    }
};

const getAddMemberNameListFetch=  async(existingMemberIds) =>{
    const token = localStorage.getItem('token');
    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/group/getAddMemberNameList`, 
        { existingMemberIds }, 
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
        return response.data;
    } catch (error) {
        return error.message;
    }
}

const addMemberToInnerCircle = async(userId, groupId) =>{
    const token = localStorage.getItem('token');
    try {
        const response = await axios.put(`${process.env.REACT_APP_API_URL}/group/addMemberInInnerCircle`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: {
                userId,
                groupId
            }
        }
    );
        return response.data;
    } catch (error) {
        return error.message;
    }
}

const shareDecisionInInnerCircle = async (payload) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/group/shareDecisionInInnerCircle`, payload, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response;
};

const getSharedMembers = async (payload) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/group/getSharedMembers`, payload, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data.result;
};

const getInnerCircleAcceptNotification = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/getInnerCircleAcceptNotification`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};

const acceptOrRejectInnerCircle = async (groupId, status) =>{
    const token = localStorage.getItem('token');
    const response = await axios.put(`${process.env.REACT_APP_API_URL}/group/acceptOrRejectInnerCircle`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        data: {
            groupId,
            status
        }
    });
    return response.data;
}

const getSharedDecisions = async () =>{
    const token = localStorage.getItem('token');
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/getSharedDecisions`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data.results;
}

const postCommentForDecision = async (decisionId, groupMemberID, commentText, groupId) =>{
    const token = localStorage.getItem('token');
    const response = await axios.put(`${process.env.REACT_APP_API_URL}/group/postCommentForDecision`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        data: {
            decisionId, 
            groupMemberID, 
            commentText,
            groupId
        }
    });

    return response;
}

const getSharedComments = async (decisionId) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/group/getSharedComments`, {
            decisionId: decisionId
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data; 
    } catch (error) {
        console.error("Error fetching shared comments", error);
        throw error;
    }
};

const deleteCommentAdded = async (commentId) =>{
    const token = localStorage.getItem('token');
    try {
        const response = await axios.delete(`${process.env.REACT_APP_API_URL}/group/removeCommentsAdded`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            data:{
                commentId
            }
        });
        return response.data; 
    } catch (error) {
        console.error("Error fetching shared comments", error);
        throw error;
    }
}

const postReplyComment = async (commentId, reply,groupId, decisionId) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/group/postReplyComment`,
            { commentId,reply,groupId, decisionId }, 
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data; 
    } catch (error) {
        console.error("Error fetching reply", error);
        throw error;
    }
}

const EditCommentAdded = async (commentId, editedContent) =>{
    const token = localStorage.getItem('token');
    try {
        const response = await axios.put(`${process.env.REACT_APP_API_URL}/group/editCommentsAdded`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            data:{
                commentId,
                editedContent
            }
        });
        return response.data; 
    } catch (error) {
        console.error("Error fetching editted comments", error);
        throw error;
    }
}

const mailToInnerCircleDecisionShare = async (memberEmail, decisionSummary) =>{
    const token = localStorage.getItem('token');
    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/group/innerCircleDecisionShare`,
        {memberEmail, decisionSummary},  
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data; 
    } catch (error) {
        console.error("Error fetching editted comments", error);
        throw error;
    }
}


const innerCirclePostComment = async (decision, groupMemberID,commentText, email) =>{
    const token = localStorage.getItem('token');
    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/group/innerCirclePostComment`,
        {decision, groupMemberID,commentText, email},  
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data; 
    } catch (error) {
        console.error("Error fetching editted comments", error);
        throw error;
    }
}


const innerCirclePostReplyComment = async (commentId, reply, groupId, decisionId) =>{
    const token = localStorage.getItem('token');
    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/group/innerCirclePostReply`,
        {commentId, reply, groupId, decisionId},  
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if(response.status === 200){
            toast.success("Reply Post successfully");
        }
        return response.data; 
    } catch (error) {
        console.error("Error fetching inner circle reply comment", error);
        throw error;
    }
}


const innerCircleInvitation = async (invitationData) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/group/innerCircleInvitation`,
            invitationData,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        return response.data;
    } catch (error) {
        console.error("Error Inviting the person to the Decision App", error);
        throw error;
    }
}

const innerCircleAddInvitation = async (email) =>{
    const token = localStorage.getItem('token');
    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/group/innerCircleAddInvitation`,
        {email},
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data; 
    } catch (error) {
        console.error("Error Inviting the person to the Decision App", error);
        throw error;
    }
}

const getSharedDecisionDetails = async () =>{
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/getSharedDecisionDetails`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data; 
    } catch (error) {
        console.error("Error in getting shared decision details", error);
        throw error;
    }
}


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
    innerCircleAddInvitation
 };