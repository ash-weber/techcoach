import axios from "axios";

const getUserListForDecisionCircle = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/fetchUserList`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.tasks;
    } catch (error) {
        console.log(error);
        return error.message;
    }
};

const decisionCircleCreation = async (group_id, members) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/group/decisionCircleCreation`,
            { group_id, members },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating Decision Group with Members:', error.response?.data || error.message);

        return error.message;
    }
};

const getUserDecisionCircles = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/group/getUserDecisionCircles`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating Decision Group with Members:', error.response?.data || error.message);
        return error.message;
    }
};

const getdecisionCirclesByUser = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/group/getdecisionCirclesByUser`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating Decision Group with Members:', error.response?.data || error.message);
        return error.message;
    }
};

const getdecisionCirclesByUserAndMember = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/group/getdecisionCirclesByUserAndMember`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating Decision Group with Members:', error.response?.data || error.message);
        return error.message;
    }
};

const getUsersForGroup = async (groupId) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/getUsersForGroup/${groupId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching users for group:', error);
        throw error
    }
}

const removeUsersFromGroup = async (groupId, userId) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.delete(`${process.env.REACT_APP_API_URL}/group/removeUsersFromGroup/${groupId}/${userId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching users for Group:', error);
        throw error
    }
}

const sendDecisionCircleInvitation = async (email) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/group/sendDecisionCircleInvitation`,
            { email },
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
};

// const decisionshareDecisionCircle = async(group_id,decision_id) =>{
//     const token = localStorage.getItem('token');
//  try{
//     const response = await axios.post(`${process.env.REACT_APP_API_URL}/group/decisionshareDecisionCircle`,
//         {group_id,decision_id},
//        {
//         headers : {
//             Authorization : `Bearer ${token}`,
//          }
//        }
//     );
//    return response.data;
//   } catch (error) {
//     console.error('Error Fetching Decision Share:',error);
//     throw error
//   }
// }

const getdecisionSharedDecisionCircle = async (groupId) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/getdecisionSharedDecisionCircle/${groupId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: { group_id: groupId },
            }
        )
        return response.data.results;
    } catch (error) {
        console.error('Error Fetching Decision Get Circles:', error);
        throw error
    }
}

const getMemberSharedDecisions = async (groupId) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/getMemberSharedDecisions/${groupId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: { group_id: groupId },
            }
        )
        return response.data.results;
    } catch (error) {
        console.error('Error Fetching Decision Get Circles:', error);
        throw error
    }
}

const mailToDecisionCirclePostComment = async (decisionId, groupId, comment, email) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/group/decisionCirclePostComment`, {
            decisionId,
            groupId,
            comment,
            email
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.message;
    } catch (error) {
        console.error('Error fetching added comments', error);
        throw error;
    }
}


const mailToDecisionCircleReplyComment = async (decision, parentCommentId,reply,groupId) => {
    const token = localStorage.getItem('token');

    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/group/decisionCircleReplyComment`, {
            decision,
            parentCommentId,
            reply,
            groupId
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data.message;
    } catch (error) {
        console.error('Error sending reply:', error.response ? error.response.data : error.message);
        throw error;
    }
}


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
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/sharedbyme`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            }
        )
        return response.data.results;
    } catch (error) {
        console.error('Error Fetching Decision Get Circles:', error);
        throw error
    }
}


const getdecisionSharedDecisionCirclebyuser = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/sharedwithme`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            }
        )
        return response.data.results;
    } catch (error) {
        console.error('Error Fetching Decision Get Circles:', error);
        throw error
    }
}


// group Name Networkk_calls  //
const postdecisionGroup = async (group_name, type_of_group = 'decision_circle') => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/group/decisionGroup`,
            {
                group_name,
                type_of_group
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating decision group:', error);
        throw error;
    }
};

const getAlldecisionGroup = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/group/decisiongroup`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching decision groups:', error);
        throw error;
    }
};

const getDecisionGroup = async (id) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/group/decisiongroup/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error(`Error fetching decision group with ID ${id}:`, error);
        throw error;
    }
};

const putDecisionGroup = async (id, group_name, type_of_group = 'decision_circle') => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.put(
            `${process.env.REACT_APP_API_URL}/group/decisiongroup/${id}`,
            {
                group_name,
                type_of_group
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error(`Error updating decision group with ID ${id}:`, error);
        throw error;
    }
};

const deleteDecisionGroup = async (id) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.delete(
            `${process.env.REACT_APP_API_URL}/group/decisiongroup/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error(`Error deleting decision group with ID ${id}:`, error);
        throw error;
    }
};


const postComment = async (groupId, comment, decisionId) => {
    const token = localStorage.getItem('token');

    try {
        const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/group/comment`,
            {
                groupId,
                commentText: comment, // 🔥 must use `commentText`, not `comment`
                decisionId,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data;
    } catch (error) {
        if (error.response) {
            console.error("Error posting comment:", error.response.data);
            throw error.response.data;
        } else {
            console.error("Error:", error.message);
            throw new Error('An error occurred while posting the comment');
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
    const token = localStorage.getItem('token');

    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/group/comment`,
            {
                groupId,
                commentText,
                decisionId,
            }, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        }
        );

        return response.data;
    } catch (error) {
        if (error.response) {
            console.error("Error posting comment:", error.response.data);
            throw error.response.data; 
        } else if (error.request) {
            console.error("No response received:", error.request);
            throw new Error('No response received from the server');
        } else {
            console.error("Error", error.message);
            throw new Error('An error occurred while posting the comment');
        }
    }
};

const getComments = async (groupId, decisionId) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/comments/${groupId}/${decisionId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.comments;
    } catch (error) {
        console.error('Error fetching comments:', error);
        throw new Error('Failed to fetch comments');
    }
}


const getWithComments = async (decisionId,groupId) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/comment/${groupId}/${decisionId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.comments;
    } catch (error) {
        console.error('Error fetching comments:', error);
        throw new Error('Failed to fetch comments');
    }
}


const getDecisionComments = async (decisionId) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/comments/${decisionId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.comments;
    } catch (error) {
        console.error('Error fetching comments:', error);
        throw new Error('Failed to fetch comments');
    }
}

const updateComment = async (commentId, updatedComment) => {
    const token = localStorage.getItem('token');

    try {
        const response = await axios.put(`${process.env.REACT_APP_API_URL}/group/comments/${commentId}`, updatedComment, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error updating comment:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error("Error updating comment");
    }
};

const editComments = async (commentId, comment) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.put(`${process.env.REACT_APP_API_URL}/group/comment/${commentId}`,
             comment ,
            {
             headers: {
                Authorization: `Bearer ${token}`,
             },
           });

        return response.data;
    } catch (error) {
        console.error('Error updating comment:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error("Error updating comment");
    }
};

const replyToComment = async (data) => {
    const token = localStorage.getItem('token');

    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/group/comments/reply`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error posting comment:", error.response.data);
        throw error.response.data;
    }
};

const deleteComment = async (commentId) => {
    const token = localStorage.getItem('token');

    try {
        const response = await axios.delete(`${process.env.REACT_APP_API_URL}/group/comments/${commentId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error posting comment:", error.response.data);
        throw error.response.data;
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
    // decisionshareDecisionCircle,
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
};