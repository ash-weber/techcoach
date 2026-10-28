import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Button, Avatar, IconButton, Popover, TextField,Modal } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { checkInnerCircleExists, getInnerCircleDetails, getSharedComments, postReplyComment, deleteCommentAdded, EditCommentAdded,innerCirclePostReplyComment } from '../../Group/Network_Call';
import { getDecisionComments,updateComment } from '../../Decision_Circle/Networkk_Call';
import { useNavigate } from 'react-router-dom';
import { AiFillEdit } from "react-icons/ai";

import ShareModal from '../../Group/ShareModel';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import withAuth from '../../../utils/withAuth';

const View = () => {
    const [decision, setDecision] = useState({});
    const { id } = useParams();
    const [innerGroup, setInnerGroup] = useState();
    const [showModal, setShowModal] = useState(false);
    const [innerCircleDetails, setInnerCircleDetails] = useState(null);
    const [sharedComments, setSharedComments] = useState([]);
    const [comments, setComments] = useState([]);
    const [replies, setReplies] = useState({});
    const navigate = useNavigate();


    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedCommentContent, setEditedCommentContent] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [editComment,setEditComment] = useState(null);
    const [isEditModalOpen, setEditModalOpen] = useState(false);  // Controls modal visibility
    const [editContent, setEditContent] = useState('');

    useEffect(() => {
        const innerGroupCheck = async () => {
            const innerGroup = await checkInnerCircleExists();
            setInnerGroup(innerGroup);
        };
        innerGroupCheck();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/getInfo_Referred/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const responseData = response.data;
                if (responseData && responseData.decisionData && responseData.decisionData.length > 0) {
                    const { decision_name, decision_due_date, decision_taken_date, user_statement, tags, decision_reason } = responseData.decisionData[0];
                    const formattedDecisionDueDate = decision_due_date ? new Date(decision_due_date).toISOString().split('T')[0] : '';
                    const formattedDecisionTakenDate = decision_taken_date ? new Date(decision_taken_date).toISOString().split('T')[0] : '';
                    setDecision({
                        decision_name,
                        decision_due_date: formattedDecisionDueDate,
                        decision_taken_date: formattedDecisionTakenDate,
                        user_statement,
                        tagsArray: tags.map(tag => ({
                            id: tag.id,
                            tag_name: tag.tag_name,
                            tag_type: tag.tag_type
                        })),
                        decision_reason: decision_reason.map(reasonObj => reasonObj.decision_reason_text),
                    });
                } else {
                    console.error("Invalid response format:", responseData);
                }
            } catch (error) {
                console.error("Error fetching decision data:", error.message);
            }
        };

        fetchData();
    }, [id]);


    useEffect(() => {
        const fetchInnerCircleDetails = async () => {
            try {
                const details = await getInnerCircleDetails();
                setInnerCircleDetails(details);
            } catch (error) {
                console.error("Failed to fetch inner circle details", error);
            }
        };
        fetchInnerCircleDetails();
    }, []);

    const fetchSharedComments = async () => {
        try {
            const comments = await getSharedComments(id);
            setSharedComments(comments.comments);
            const initialReplies = comments.comments.reduce((acc, comment) => {
                acc[comment.id] = '';
                return acc;
            }, {});
            setReplies(initialReplies);
        } catch (error) {
            console.error("Failed to fetch shared comments", error);
        }
    };

    const fetchDecisionComments = async () => {
        try {
            const response = await getDecisionComments(id);
            setComments((prevComments) => ({
                ...prevComments,
                [id]: response || [],
            }));
        } catch (error) {
            console.error("Failed to fetch shared comments", error);
        }
    };

    useEffect(() => {
        fetchSharedComments();
        fetchDecisionComments();
    }, [id]);

    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    const handleShare = () => {
        setShowModal(true);
    };

    const handleReplyChange = (commentId) => (event) => {
        setReplies({
            ...replies,
            [commentId]: event.target.value
        });
    };

    const handleReplySubmit = async (commentId, groupId) => {
        try {
            const reply = await postReplyComment(commentId, replies[commentId], groupId, id);
            setReplies({
                ...replies,
                [commentId]: ''
            });
            const comments = await getSharedComments(id);
            setSharedComments(comments.comments);
        } catch (error) {
            console.error("Error submitting reply:", error);
        }
    };

    const handleReplySendEmail = async (commentId,groupId) => {
        const replyText = replies[commentId];
        try {
            // const reply = await postReplyComment(commentId, replyText, groupId, id);
            const replymail = await innerCirclePostReplyComment({
                commentId,
                replyText,
                groupId,
                id
            })
            setReplies(prevReplies => ({
                ...prevReplies,
                [commentId]: ''
            }));

            const comments = await getSharedComments(id);
            setSharedComments(comments.comments);
        } catch (error) {
            console.error("Error submitting reply:", error);
        }
    };

    const handleEdit = (commentId, initialContent) => {
        setEditingCommentId(commentId);
        setEditedCommentContent(initialContent);
        setIsPopoverOpen(true);
    };

    const handleSaveEdit = async (commentId, editedContent) => {
        try {
            await EditCommentAdded(commentId, editedContent);
            fetchSharedComments();
            toast('Reply edited successfully');
        } catch (error) {
            console.error('Error editing reply:', error);
            toast('An error occurred while editing the reply');
        }
        setEditingCommentId(null);
        setIsPopoverOpen(false);
    };

    const handlePopoverClose = () => {
        setEditingCommentId(null);
        setIsPopoverOpen(false);
    };

    const handleEditClick =(commentId) =>{
        setEditComment(commentId.id);
        setEditContent(commentId.comment);
        setEditModalOpen(true);
       }


       const handleSaveEditComment = async() =>{
        try {
            const updatedComment = {comment: editContent};
            await updateComment(editComment,updatedComment);
            toast.success('Comment Updated successfully');
            fetchDecisionComments();
            setEditModalOpen(false);
            setEditComment(null);
            setEditContent('')
        } catch (error) {
            console.error('Failed to update comment:',error);
            toast.error('Failed to update comment');
        } finally {
            setEditModalOpen(false);
        }
       }


    const handleDeleteReply = async (replyId) => {
        try {
            await deleteCommentAdded(replyId);
            fetchSharedComments();
            toast('Reply deleted successfully');
        } catch (error) {
            console.error('Error deleting reply:', error);
            toast('An error occurred while deleting the reply');
        }
    };


    const memberComments = sharedComments.filter(comment => comment.type_of_member === "member");
    const authorComments = sharedComments.filter(comment => comment.type_of_member === "author");

    return (
        <Box sx={{
            padding: "1rem", backgroundColor: "white", margin: "2rem", borderRadius: "0.5rem",
            ...(isPopoverOpen && { filter: 'blur(2px)' })
        }}>
            <Box sx={{ mb: 2 }}>
                <Typography variant="body1"><b>Decision Name:</b> {decision.decision_name}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
                <Typography variant="body1"><b>Decision Details:</b> {decision.user_statement}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
                <Typography variant="body1"><b>Decision Reasons:</b> {decision.decision_reason && decision.decision_reason.join(', ')}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
                <Typography variant="body1"><b>Decision Due Date:</b> {decision.decision_due_date}</Typography>
            </Box>

            {decision.decision_taken_date && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body1"><b>Decision Taken Date:</b> {decision.decision_taken_date}</Typography>
                </Box>
            )}

            <Box sx={{ mb: 2 }}>
                <Typography variant="body1">
                    <b>Selected Tags:</b> {decision.tagsArray && decision.tagsArray.map(tag => tag.tag_name).join(', ')}
                </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
                <Link to='/readd'>
                    <Button variant="contained">Go back</Button>
                </Link>
            </Box>
            <Box sx={{ mb: 2, p: 2, bgcolor: "#526D82", borderRadius: 2, display: "flex", justifyContent: "center" }}>
                {innerGroup ? (
                    <Typography variant="body1" sx={{ color: "white", cursor: "pointer" }} onClick={handleShare}>
                        Share The Above Decision in Inner Circle
                    </Typography>
                ) : (
                    <Typography variant="body1" sx={{ color: "white", cursor: "pointer" }} onClick={handleShow}>
                        Create Inner Circle to share this Decision
                    </Typography>
                )}
            </Box>
            <Box sx={{ mt: 4 }}>
                <Typography variant="h6">Comments</Typography>
                {memberComments.length > 0 ? (
                    memberComments.map(memberComment => (
                        <>
                            <Box key={memberComment.id} sx={{ p: 2, border: '1px solid #ccc', mb: 2, borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Avatar sx={{ bgcolor: "#526D82", color: "white", mr: 2 }}>{memberComment.displayname[0]}</Avatar>
                                    <Box>
                                        <Typography variant="body1">{memberComment.comment}</Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {memberComment.displayname} | {memberComment.email} |
                                            {memberComment.created_at === memberComment.updated_at
                                                ? <span> {formatDistanceToNow(parseISO(memberComment.created_at), { addSuffix: true })}</span>
                                                : <span> Edited at {formatDistanceToNow(parseISO(memberComment.updated_at), { addSuffix: true })}</span>}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Box>
                                {authorComments.map(authorComment => {
                                    if (authorComment.parentCommentId === memberComment.id) {
                                        return (
                                            <Box key={authorComment.id} sx={{ p: 2, border: '1px solid #ccc', mb: 2, borderRadius: 2, ml: 4, backgroundColor: "#edf6fc" }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <Avatar sx={{ bgcolor: "#526D82", color: "white", mr: 2 }}>{authorComment.displayname[0]}</Avatar>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="body1">{authorComment.comment}</Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {authorComment.displayname} | {authorComment.email} |
                                                            {authorComment.created_at === authorComment.updated_at
                                                                ? <span> {formatDistanceToNow(parseISO(authorComment.created_at), { addSuffix: true })}</span>
                                                                : <span> Edited at {formatDistanceToNow(parseISO(authorComment.updated_at), { addSuffix: true })}</span>}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                                                        <IconButton onClick={(e) => { handleEdit(authorComment.id, authorComment.comment); setAnchorEl(e.currentTarget); }}>
                                                            <EditIcon sx={{ color: "black" }} />
                                                        </IconButton>
                                                      
                                                    </Box>
                                                </Box>
                                            </Box>
                                        );
                                    }
                                    return null;
                                })}
                                {authorComments.some(authorComment => authorComment.parentCommentId === memberComment.id) ? null : (
                                    <Box sx={{ display: 'flex', mt: 2, mb: 2 }}>
                                        <input
                                            label="Write a reply..."
                                            variant="outlined"
                                            fullWidth
                                            value={replies[memberComment.id]}
                                            onChange={handleReplyChange(memberComment.id)}
                                            style={{
                                                height: "3rem",
                                                padding: "1rem",
                                                width: "85%",
                                                maxWidth: "85%",
                                                marginRight: "0.5rem"
                                            }}
                                        />
                                        <div style={{ display: 'flex', gap: '8px',height:'50px' }}>
                                        <Button variant="contained" onClick={() => handleReplySubmit(memberComment.id, memberComment.groupId)}>Reply</Button>
                                        <Button variant="contained" onClick={() => handleReplySendEmail(memberComment.id, memberComment.groupId,id)}>Reply & Email</Button>
                                        </div>
                                    </Box>
                                )}

                            </Box>
                        </>
                    ))
                ) : (
                    <Typography variant="body2">No comments shared yet.</Typography>
                )}
                <div>
                    {comments[id]?.length === 0 ? (
                        <p>No comments available.</p>
                    ) : (
                        <ul>
                            {comments[id]
                                ?.sort((a, b) => (a.type_of_member === 'member' ? -1 : 1))
                                .map(comment => (
                                    <div
                                        key={comment.id}
                                        className={`comment-box ${comment.parentCommentId ? 'reply-comment' : 'original-comment'}`}
                                        style={{
                                            width: '90%', 
                                            backgroundColor: comment.type_of_member === 'author' ? '#e8f5e9' : '#FFF',
                                            textAlign: 'left', 
                                            padding: '8px',
                                            borderRadius: '8px',
                                            marginBottom: '16px',
                                            position: 'relative',
                                            border: '1px solid #ccc',
                                            marginLeft: comment.type_of_member === 'member' ? '0' : 'auto', 
                                            marginRight: comment.type_of_member === 'author' ? '0' : 'auto', 
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '5px' }}>
                                            <Typography variant="body1" className="comment-text" style={{ fontWeight: 'bold', flex: 1 }}>
                                                {comment.comment}
                                            </Typography>
                                            {comment.type_of_member === 'author' && (
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <AiFillEdit style={{ marginRight: '8px', cursor: 'pointer',fontSize:'22px' }} 
                                                    onClick={() => handleEditClick(comment)} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="comment-content" style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                                            <Avatar sx={{ bgcolor: "#526D82", color: "white", marginRight: 2 }}>
                                                {comment.displayname[0]}
                                            </Avatar>
                                            <div>
                                                <Typography variant="caption">
                                                    {comment.displayname} | {comment.email} |
                                                    {comment.created_at === comment.updated_at ? (
                                                        <span>{formatDistanceToNow(parseISO(comment.created_at), { addSuffix: true })}</span>
                                                    ) : (
                                                        <span>Edited {formatDistanceToNow(parseISO(comment.updated_at), { addSuffix: true })}</span>
                                                    )}
                                                </Typography>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </ul>
                    )}
                </div>

                <Modal open={isEditModalOpen} onClose={() =>setEditModalOpen(false)}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
                <Typography variant="h6" mb={2}>Edit Comment</Typography>
                    <TextField fullWidth multiline rows={4} value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                    <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                        <Button variant="contained" color="primary" onClick={handleSaveEditComment}>Save</Button>
                        <Button variant="outlined" onClick={() => setEditModalOpen(false)}>Cancel</Button>
                    </Box>
                </Box>
                </Modal>

            </Box>



            <Popover
                open={isPopoverOpen}
                anchorEl={null}
                onClose={handlePopoverClose}
                anchorOrigin={{
                    vertical: 'center',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'center',
                    horizontal: 'center',
                }}
                PaperProps={{
                    sx: {
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        p: 2
                    }
                }}
            >
                <Box>
                    <Typography variant="h6" style={{ marginBottom: "1rem" }}><b>Edit Comment</b></Typography>
                    <TextField
                        multiline
                        fullWidth
                        value={editedCommentContent}
                        onChange={(e) => setEditedCommentContent(e.target.value)}
                    />
                    <Button onClick={() => handleSaveEdit(editingCommentId, editedCommentContent)}>
                        Save
                    </Button>
                </Box>
            </Popover>

            <ShareModal
                showModal={showModal}
                handleClose={handleClose}
                innerGroup={innerGroup}
                innerCircleDetails={innerCircleDetails}
                decision={decision}
                id={id}
            />
            <ToastContainer />
        </Box>
    );
};

export default withAuth(View);