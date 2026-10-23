import axios from "axios";
import { toast } from "react-toastify";

const getUserListForInnerCircle = async () => {
    //console.log("get user list");
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/fetchUserList`, {
            headers: {
              Authorization: `Bearer ${token}`
            }});
        //console.log("response from frontend", response);
        return response.data.tasks;
    } catch (error) {
        console.log(error);
        return error.message;
    }
};

const innerCircleCreation = async (groupData) => {
    const token = localStorage.getItem('token');
    try {
        //console.log("group data", groupData);
        const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/group/innerCircleCreation`,
            groupData,  
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        //console.log("response from inner circle creation", response);
        return response;
    } catch (error) {
        console.log(error);
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
        //console.log("response from check inner circle", response);
        return response.data.exists;
    } catch (error) {
        console.log(error);
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

        //console.log("response from inner circle fetch", response.data );
        return response.data;
    }catch(error){
        console.log(error);
        return error.message;
    }
}

const removeMemberFromInner = async (userId, group_id) => {
    const token = localStorage.getItem('token');
    //console.log("user id for removal", userId, group_id);
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
        //console.log("response from remove", response.data);
        return response.data;
    } catch (error) {
        console.log(error);
        return error.message;
    }
};

const getAddMemberNameListFetch=  async(existingMemberIds) =>{
    const token = localStorage.getItem('token');
    console.log("member list", existingMemberIds);
    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/group/getAddMemberNameList`, 
        { existingMemberIds }, 
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
        //console.log("response from remove", response.data);
        return response.data;
    } catch (error) {
        console.log(error);
        return error.message;
    }
}

const addMemberToInnerCircle = async(userId, groupId) =>{
    const token = localStorage.getItem('token');
    //console.log("request bodddddddddy", userId, groupId);
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
        //console.log("response from remove", response.data);
        return response.data;
    } catch (error) {
        console.log(error);
        return error.message;
    }
}

const shareDecisionInInnerCircle = async (payload) => {
    const token = localStorage.getItem('token');
    console.log("shshshhshshshhsjjkkkkk", payload)
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/group/shareDecisionInInnerCircle`, payload, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response;
};

const getSharedMembers = async (payload) => {
    const token = localStorage.getItem('token');
    console.log("shshshhshshshhsjjkkkkk", payload)
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

    //console.log("response for shared decision", response);
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

    console.log("response for comments", response);
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
        console.log("response for comments", response);
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
        console.log("response for comments", response);
        return response.data; 
    } catch (error) {
        console.error("Error fetching shared comments", error);
        throw error;
    }
}

const postReplyComment = async (commentId, reply,groupId, decisionId) => {
    console.log("comment Id", commentId, reply, groupId, decisionId);
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
        console.log("response for reply", response);
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
        console.log("response for edit comments", response);
        return response.data; 
    } catch (error) {
        console.error("Error fetching editted comments", error);
        throw error;
    }
}

const mailToInnerCircleDecisionShare = async (memberEmail, decisionSummary) =>{
    const token = localStorage.getItem('token');
    console.log("jjsjsjss",decisionSummary );
    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/group/innerCircleDecisionShare`,
        {memberEmail, decisionSummary},  
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log("response for edit comments", response);
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
        console.log("response for edit comments", response);
        return response.data; 
    } catch (error) {
        console.error("Error fetching editted comments", error);
        throw error;
    }
}


const innerCirclePostReplyComment = async (commentId, reply, groupId, decisionId) =>{
    console.log('asedrf',commentId, reply, groupId, decisionId);
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
        console.log("response for inner circle post reply", response.data);
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
        console.log("response for Inner Circle Invitation", response);
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
        console.log("response for Inner Circle Invitation", response);
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
        console.log("response for get shared decision details", response);
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