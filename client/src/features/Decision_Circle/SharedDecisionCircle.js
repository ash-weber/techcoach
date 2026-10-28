import React, { useEffect, useState } from 'react';
import { Button, Typography, Card, CardContent, Modal, TextField, Box, Avatar, Grid, Popover, ToggleButton, ButtonGroup, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { getdecisionSharedDecisionCirclebyuser, postShareWithComment, editComments } from './Networkk_Call';
import { ToastContainer, toast } from 'react-toastify';
import { AiFillEdit } from "react-icons/ai";
import { Link } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';
import withAuth from '../../utils/withAuth';
import axios from 'axios';

const SharedDecisionCircle = () => {
    const [sharedDecisionCircles, setSharedDecisionCircles] = useState([]);
    const [comments, setComments] = useState({});
    const [newComment, setNewComment] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [showPending, setShowPending] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [buttonLoading, setButtonLoading] = useState({});
    const [editComment, setEditComment] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [currentUserEmail, setCurrentUserEmail] = useState('');
    const [isSaving, setIsSaving] = useState(false);


    const fetchSharedDecisionCircles = async () => {
        try {
            setIsLoading(true);
            const response = await getdecisionSharedDecisionCirclebyuser();
            setSharedDecisionCircles(response || []);
            setComments({});
        } catch (error) {
            console.error('Error fetching shared decisions:', error);
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        fetchSharedDecisionCircles();
    }, []);

    const handlePopoverClose = () => {
        setIsPopoverOpen(false);
    };

    useEffect(() => {
        const fetchCurrentUserEmail = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/profile`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (response.status === 200 && response.data.tasks.length > 0) {
                    const email = response.data.tasks[0].email; 
                    setCurrentUserEmail(email);
                } else {
                    console.error('User details not found');
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        fetchCurrentUserEmail();
    }, []);

    const handlePostComment = async (decisionId, id) => {
        const comment = newComment[decisionId]?.trim();
        if (!comment) {
            return toast.error('Comment cannot be empty');
        }
        if (!id) {
            return toast.error('Group ID is missing');
        }
        setButtonLoading((prevState) => ({ ...prevState, [decisionId]: true }));
        try {
            const dataToSend = await postShareWithComment(id, comment, decisionId);
            setComments((prevState) => ({ ...prevState, [decisionId]: '' }));
            toast.success('Comment posted successfully');
            fetchComments(id, decisionId);
        } catch (error) {
            toast.error('Error posting comment');
            console.error('Error posting comment:', error);
        } finally {
            setButtonLoading((prevState) => ({ ...prevState, [decisionId]: false }));
        }
    };

    const filteredDecisions = sharedDecisionCircles.filter(item =>
        item.shared_by_email !== currentUserEmail &&
        (!showPending || !item.decision_taken_date) &&
        (selectedUser ? item.shared_by_email === selectedUser.email : true)
    );

    const handleInputChange = (decisionId, newText) => {
        setComments(prevState => ({
            ...prevState,
            [decisionId]: newText
        }));
    };

    const handleCommentChange = (decisionId, value) => {
        setNewComment((prevNewComment) => ({
            ...prevNewComment,
            [decisionId]: value,
        }));
    };

    const fetchComments = async () => {
        try {
            const commentsData = await Promise.all(
                sharedDecisionCircles.map((item) =>
                    axios.get(`${process.env.REACT_APP_API_URL}/group/comment?groupId=${item.id}&decisionId=${item.decision_id}`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    })
                )
            );

            const updatedComments = commentsData.reduce((acc, response, index) => {
                const decisionId = sharedDecisionCircles[index].decision_id;
                acc[decisionId] = response.data.comments || [];
                return acc;
            }, {});
            setComments(updatedComments);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [sharedDecisionCircles]);


    useEffect(() => {
        sharedDecisionCircles.forEach((item) => {
            fetchComments(item.id, item.decision_id);
        });
    }, [sharedDecisionCircles]);

    const handleEditClick = (comment) => {
        setEditComment(comment.commentId);
        setEditContent(comment.comment || '');
        setEditModalOpen(true);
    }

    const handleSaveEditComment = async () => {
        if (!editComment) {
            toast.error("Comment ID is missing.");
            return;
        }
        setIsSaving(true);
        try {
            const updatedComment = { comment: editContent };
            await editComments(editComment, updatedComment);
            toast.success('Comment Updated successfully');
            fetchComments();
            setEditModalOpen(false);
            setEditComment(null);
            setEditContent('')
        } catch (error) {
            console.error('Failed to update comment:', error);
            toast.error('Failed to update comment');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div>
            <div className='ml-5'>
                <Link to='/shared-decisions'>
                    <button>Go Back</button>
                </Link>
            </div>
            <Box p={3}>
                <h2>Decision Circle Decisions:</h2>
                {isLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {sharedDecisionCircles.length === 0 ? (
                            <Typography variant="h5" align="center" mt={2} mb={2}>
                                No shared decisions
                            </Typography>
                        ) : (
                            <>
                                <ButtonGroup
                                    sx={{
                                        marginBottom: "1rem",
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        gap: "0.5rem",
                                        margin: "1rem",
                                        flexDirection: { xs: 'column', sm: 'row' }
                                    }}
                                >
                                    <ToggleButton
                                        value={true}
                                        selected={showPending}
                                        onClick={() => setShowPending(true)}
                                        sx={{
                                            color: showPending ? '#fff' : '#000',
                                            border: showPending ? "0.12rem solid #3F5362" : "0.1rem solid #3F5362",
                                            backgroundColor: showPending ? '#3F5362' : 'default',
                                            height: "3rem",
                                            '&:hover': {
                                                color: showPending ? '#fff' : '#000',
                                                backgroundColor: showPending ? '#465e70' : 'default'
                                            },
                                        }}
                                    >
                                        Show Pending Decisions
                                    </ToggleButton>
                                    <ToggleButton
                                        value={false}
                                        selected={!showPending}
                                        onClick={() => setShowPending(false)}
                                        sx={{
                                            color: !showPending ? '#fff' : '#000',
                                            border: !showPending ? "0.12rem solid #3F5362" : "0.1rem solid #3F5362",
                                            backgroundColor: !showPending ? '#3F5362' : 'default',
                                            height: "3rem",
                                            '&:hover': {
                                                color: !showPending ? '#fff' : '#000',
                                                backgroundColor: !showPending ? '#465e70' : 'default'
                                            },
                                        }}
                                    >
                                        Show All Decisions
                                    </ToggleButton>
                                </ButtonGroup>
                                {filteredDecisions.length === 0 ? (
                                    <Typography variant="h5" align="center" mt={2} mb={2}>
                                        {showPending ? 'No pending decisions' : 'No decisions found'}
                                    </Typography>
                                ) : (
                                    filteredDecisions.map((item, index) => (
                                        <Card key={index} variant="outlined" style={{ margin: "1rem" }}>
                                            <CardContent>
                                                <Grid container spacing={2} alignItems="center">
                                                    <Grid item>
                                                        <Avatar sx={{ bgcolor: "#526D82", color: "white" }}>
                                                            {item.shared_by[0]}
                                                        </Avatar>
                                                    </Grid>
                                                    <Grid item xs>
                                                        <Typography variant="h6">
                                                            Decision: {item.decision_name}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            Group Name : {item.group_name}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            Shared By: {item.shared_by} | {item.shared_by_email}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                                <Typography variant="body1" mt={2}>
                                                    Reasons:
                                                </Typography>
                                                {item.reasons && item.reasons.length > 0 ? (
                                                    item.reasons.map((reason, reasonIndex) => (
                                                        <Typography key={reasonIndex} variant="body1" style={{ marginLeft: '16px' }}>
                                                            - {reason}
                                                        </Typography>
                                                    ))
                                                ) : (
                                                    <Typography variant="body1" style={{ marginLeft: '16px' }}>
                                                        No reasons provided
                                                    </Typography>
                                                )}
                                                <Typography variant="body1">
                                                    Due Date: {item.decision_due_date ? new Date(item.decision_due_date).toLocaleDateString() : 'N/A'}
                                                </Typography>
                                                {item.decision_taken_date && (
                                                    <Typography variant="body1">
                                                        Taken Date: {new Date(item.decision_taken_date).toLocaleDateString()}
                                                    </Typography>
                                                )}
                                                <Typography variant="body1" color="textSecondary">
                                                    User Statement: {item.user_statement}
                                                </Typography>
                                            </CardContent>
                                            <CardContent>
                                                <List>
                                                    {Array.isArray(comments[item.decision_id]) &&
                                                        comments[item.decision_id].map((comment) => (
                                                            <ListItem
                                                                key={comment.commentId}
                                                                alignItems="flex-start"
                                                                style={{
                                                                    border: '1px solid #ccc',
                                                                    maxWidth: '70%',
                                                                    marginLeft: comment.type_of_member === 'member' ? '0' : 'auto', 
                                                                    marginRight: comment.type_of_member === 'author' ? '0' : 'auto',
                                                                    marginBottom: '16px',
                                                                    backgroundColor: comment.type_of_member === 'author' ? '#f0f8ff' : 'transparent', 
                                                                    padding: '8px',
                                                                }}
                                                            >
                                                                <ListItemText
                                                                    primary={comment.comment}
                                                                    secondary={
                                                                        <Box
                                                                            className="comment-content"
                                                                            style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}
                                                                        >
                                                                            <Avatar
                                                                                sx={{ bgcolor: "#526D82", color: "white", marginRight: 2 }}
                                                                            >
                                                                                {comment.displayname ? comment.displayname[0] : "?"}
                                                                            </Avatar>
                                                                            <div style={{ flex: 1 }}>
                                                                                <Typography variant="caption">
                                                                                    {comment.displayname || "Unknown User"} | {comment.email || "No Email"} | {" "}
                                                                                    {comment.created_at === comment.updated_at ? (
                                                                                        <span>
                                                                                            {formatDistanceToNow(parseISO(comment.created_at), { addSuffix: true })}
                                                                                        </span>
                                                                                    ) : (
                                                                                        <span>
                                                                                            Edited {formatDistanceToNow(parseISO(comment.updated_at), { addSuffix: true })}
                                                                                        </span>
                                                                                    )}
                                                                                </Typography>
                                                                            </div>
                                                                            {comment.type_of_member === 'author' && (
                                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                                                    <AiFillEdit
                                                                                        style={{ marginRight: '8px', cursor: 'pointer', fontSize: '22px' }}
                                                                                        onClick={() => handleEditClick(comment)}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </Box>
                                                                    }
                                                                />
                                                            </ListItem>
                                                        ))}
                                                </List>

                                                <Box mt={2}>
                                                    <input
                                                        type="text"
                                                        placeholder="Add a comment..."
                                                        style={{
                                                            height: "3rem",
                                                            padding: "1rem",
                                                            width: "100%",
                                                            marginRight: "0.5rem",
                                                        }}
                                                        value={newComment[item.decision_id] || ""}
                                                        onChange={(e) => handleCommentChange(item.decision_id, e.target.value)}
                                                    />
                                                    <Grid container spacing={2} justifyContent="flex-end">
                                                        <Grid item>
                                                            <Button
                                                                variant="contained"
                                                                color="primary"
                                                                style={{ marginTop: "1rem" }}
                                                                onClick={() => handlePostComment(item.decision_id, item.id)}
                                                                disabled={buttonLoading[item.decision_id]}
                                                            >
                                                                {buttonLoading[item.decision_id] ? (
                                                                    <CircularProgress size={24} />
                                                                ) : (
                                                                    "Save"
                                                                )}
                                                            </Button>
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </>
                        )}
                    </>
                )}
                <Popover
                    open={isPopoverOpen}
                    anchorEl={anchorEl}
                    onClose={handlePopoverClose}
                    anchorOrigin={{
                        vertical: 'top', horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top', horizontal: 'center',
                    }}
                />
                <Modal open={isEditModalOpen} onClose={() => setEditModalOpen(false)}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
                        <Typography variant="h6" mb={2}>Edit Comment</Typography>
                        <TextField fullWidth multiline rows={4} value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                        <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                            <Button variant="contained" color="primary" onClick={handleSaveEditComment} disabled={!editContent.trim() || isSaving}>
                                {isSaving ? <CircularProgress size={24} /> : "Save"}</Button>
                            <Button variant="outlined" onClick={() => setEditModalOpen(false)}>Cancel</Button>
                        </Box>
                    </Box>
                </Modal>
                <ToastContainer />
            </Box>
        </div>
    );
};

export default withAuth(SharedDecisionCircle);
