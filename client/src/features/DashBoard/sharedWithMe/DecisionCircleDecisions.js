import React, { useEffect, useState } from "react";
import {
  Button,
  Typography,
  Card,
  CardContent,
  Modal,
  TextField,
  Box,
  Avatar,
  Grid,
  Popover,
  ToggleButton,
  ButtonGroup,
  IconButton,
  CircularProgress,
  Chip,
  Autocomplete,
} from "@mui/material";
import {
  getdecisionSharedDecisionCirclebyuser,
  postShareWithComment,
  editComments,
  getWithComments,
  getUsersForGroup,
  getGroupDetails,
  getBiasTags,
} from "../../../api/DecisionCircle/Network_Call";
import { ToastContainer, toast } from "react-toastify";
import { AiFillEdit } from "react-icons/ai";
import { formatDistanceToNow, parseISO } from "date-fns";
import withAuth from "../../../utils/withAuth";
import axios from "axios";
import { getUserList } from "../../../api/User/Network_call";
import { notifyTeamsChannel } from "../../../utils/teamsWebhook";

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
  const [editContent, setEditContent] = useState("");
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [biasTags, setBiasTags] = useState([]);
  const [selectedBiasTags, setSelectedBiasTags] = useState({});
  const [editBiasTags, setEditBiasTags] = useState([]);

  const fetchSharedDecisionCircles = async () => {
    try {
      setIsLoading(true);
      const response = await getdecisionSharedDecisionCirclebyuser();
      setSharedDecisionCircles(response.results || []);
      setComments({});
    } catch (error) {
      console.error("Error fetching shared decisions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSharedDecisionCircles();
  }, []);

  useEffect(() => {
    const fetchBiasTags = async () => {
      try {
        const response = await getBiasTags();
        setBiasTags(response.biasTags || []);
      } catch (error) {
        console.error("Failed to load bias tags:", error);
        toast.error("Could not load bias tags");
      }
    };

    fetchBiasTags();
  }, []);

  const handlePopoverClose = () => {
    setIsPopoverOpen(false);
  };

  useEffect(() => {
    const fetchCurrentUserEmail = async () => {
      try {
        const response = await getUserList();

        if (response.status === 200 && response.tasks.length > 0) {
          const email = response.tasks[0].email;
          setCurrentUserEmail(email);
        } else {
          console.error("User details not found");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchCurrentUserEmail();
  }, []);

  const notifyDecisionCircleMembers = async (item, commentText) => {
    const authUser = JSON.parse(localStorage.getItem("auth_user") || "{}");
    const groupId = item.id;

    if (!groupId) return;

    try {
      const [membersRes, groupRes] = await Promise.all([
        getUsersForGroup(groupId),
        getGroupDetails(groupId),
      ]);

      const memberEmails = (membersRes.members || [])
        .map((m) => m.email)
        .filter(Boolean);
      const adminEmail = groupRes?.creator_email || null;

      const recipientEmails = [
        ...new Set(
          [...memberEmails, adminEmail]
            .filter(Boolean)
            .map((e) => e.trim().toLowerCase()),
        ),
      ];

      if (!recipientEmails.length) return;

      await notifyTeamsChannel(
        "COMMENTED",
        item,
        recipientEmails,
        commentText,
        item.group_name,
      );
    } catch (error) {
      console.error("Teams notification failed:", error);
    }
  };

  const handlePostComment = async (decisionId, id) => {
    const comment = newComment[decisionId]?.trim();
    if (!comment) {
      return toast.error("Comment cannot be empty");
    }
    if (!id) {
      return toast.error("Group ID is missing");
    }
    setButtonLoading((prevState) => ({ ...prevState, [decisionId]: true }));
    try {
      const selectedTags = selectedBiasTags[decisionId] || [];

      const dataToSend = await postShareWithComment(
        id,
        comment,
        decisionId,
        selectedTags.map((tag) => tag.id),
      );
      const item = sharedDecisionCircles.find(
        (d) => d.decision_id === decisionId,
      );
      if (item) notifyDecisionCircleMembers(item, comment);

      setComments((prevState) => ({ ...prevState, [decisionId]: "" }));
      setSelectedBiasTags((prev) => ({
        ...prev,
        [decisionId]: [],
      }));
      toast.success("Comment posted successfully");
      fetchComments(id, decisionId);
    } catch (error) {
      toast.error("Error posting comment");
      console.error("Error posting comment:", error);
    } finally {
      setButtonLoading((prevState) => ({ ...prevState, [decisionId]: false }));
    }
  };

  const filteredDecisions = sharedDecisionCircles.filter(
    (item) =>
      item.shared_by_email !== currentUserEmail &&
      (!showPending || !item.decision_taken_date) &&
      (selectedUser ? item.shared_by_email === selectedUser.email : true),
  );

  const handleInputChange = (decisionId, newText) => {
    setComments((prevState) => ({
      ...prevState,
      [decisionId]: newText,
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
        sharedDecisionCircles.map(async (item) => {
          const response = await getWithComments(item.decision_id, item.id);
          return response;
        }),
      );

      const updatedComments = commentsData.reduce((acc, response, index) => {
        const decisionId = sharedDecisionCircles[index].decision_id;
        acc[decisionId] = response.comments || [];
        return acc;
      }, {});
      setComments(updatedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
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
    setEditContent(comment.comment || "");

    setEditBiasTags(
      Array.isArray(comment.biasTags)
        ? comment.biasTags.map((tag) => ({
            id: tag.id,
            tag_name: tag.tag_name,
            tag_type: tag.tag_type,
          }))
        : [],
    );

    setEditModalOpen(true);
  };

  const handleSaveEditComment = async () => {
    if (!editComment) {
      toast.error("Comment ID is missing.");
      return;
    }
    setIsSaving(true);
    try {
      const updatedComment = {
        comment: editContent,
        biasTagIds: editBiasTags.map((tag) => tag.id),
      };

      await editComments(editComment, updatedComment);
      toast.success("Comment Updated successfully");
      fetchComments();
      setEditModalOpen(false);
      setEditComment(null);
      setEditContent("");
    } catch (error) {
      console.error("Failed to update comment:", error);
      toast.error("Failed to update comment");
    } finally {
      setIsSaving(false);
    }
  };

  const getDecisionStatus = (decision) => {
    const takenDate = decision?.decision_taken_date;
    const dueDate = decision?.decision_due_date;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (takenDate && dueDate) {
      const taken = new Date(takenDate);
      const due = new Date(dueDate);

      taken.setHours(0, 0, 0, 0);
      due.setHours(0, 0, 0, 0);

      if (taken >= due) {
        return "Closed";
      }

      if (due < today) {
        return "Overdue";
      }

      return "Pending";
    }

    if (takenDate && !dueDate) {
      return "Closed";
    }

    if (!takenDate && dueDate) {
      return "Pending";
    }

    return "Pending";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Closed":
        return {
          backgroundColor: "#E8F5E9",
          color: "#2E7D32",
        };

      case "Overdue":
        return {
          backgroundColor: "#FFEBEE",
          color: "#C62828",
        };

      default:
        return {
          backgroundColor: "#FFF3E0",
          color: "#E65100",
        };
    }
  };

  const getCardBackgroundColor = (status) => {
    switch (status) {
      case "Overdue":
        return "#FFFFFF";

      case "Pending":
        return "#FFF3E0";

      case "Closed":
        return "#E8F5E9";

      default:
        return "#FFFFFF";
    }
  };

  const DisplayBiasTags = ({ tags = [] }) => {
    if (!Array.isArray(tags) || tags.length === 0) return null;

    return (
      <Box className="sharedDecision-bias-list">
        {tags.map((tag) => (
          <Chip
            key={tag.id}
            label={tag.tag_name}
            size="small"
            className="sharedDecision-bias-chip"
          />
        ))}
      </Box>
    );
  };

  return (
    <Box className="sharedDecision-page">
      <h2 className="sharedDecision-heading"> Decision Circle Decisions</h2>
      <p className="sharedDecision-subheading">
        Review decisions, share your thoughts, and collaborate with your circle.
      </p>
      {isLoading ? (
        <Box className="sharedDecision-loading">
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
                className="sharedDecision-toolbar"
                sx={{
                  marginBottom: "1rem",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.5rem",
                  margin: "1rem",
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <ToggleButton
                  value={true}
                  selected={showPending}
                  onClick={() => setShowPending(true)}
                >
                  Show Pending Decisions
                </ToggleButton>

                <ToggleButton
                  value={false}
                  selected={!showPending}
                  onClick={() => setShowPending(false)}
                >
                  Show All Decisions
                </ToggleButton>
              </ButtonGroup>
              {filteredDecisions.length === 0 ? (
                <Box className="sharedDecision-empty">
                  <Typography variant="h6">No shared decisions</Typography>
                </Box>
              ) : (
                filteredDecisions.map((item, index) => (
                  <Card
                    key={item.decision_id}
                    variant="outlined"
                    className="sharedDecision-card"
                    sx={{
                      backgroundColor: getCardBackgroundColor(
                        getDecisionStatus(item),
                      ),
                      transition: "background-color 0.2s ease",
                      "&:hover": {
                        boxShadow: "0px 4px 12px rgba(0,0,0,0.12)",
                      },
                    }}
                  >
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
                      <Box sx={{ mt: 2, mb: 1 }}>
                        <Chip
                          label={getDecisionStatus(item)}
                          size="small"
                          sx={{
                            ...getStatusColor(getDecisionStatus(item)),
                            fontWeight: 700,
                            borderRadius: "6px",
                          }}
                        />
                      </Box>
                      <Typography variant="body1" mt={2}>
                        Reasons:
                      </Typography>

                      {item.reasons && item.reasons.length > 0 ? (
                        <Box component="ul" className="sharedDecision-reasons">
                          {item.reasons.map((reason, reasonIndex) => (
                            <li
                              key={reasonIndex}
                              className="sharedDecision-reason"
                            >
                              {reason}
                            </li>
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2">
                          No reasons provided
                        </Typography>
                      )}

                      <Typography variant="body1" component="div">
                        <Typography
                          component="span"
                          variant="body1"
                          fontWeight="bold"
                        >
                          Due Date:{" "}
                        </Typography>
                        <span>
                          {item.decision_due_date
                            ? new Date(
                                item.decision_due_date,
                              ).toLocaleDateString()
                            : "N/A"}
                        </span>

                        <br />

                        {item.decision_taken_date && (
                          <>
                            {" "}
                            <Typography
                              component="span"
                              variant="body1"
                              fontWeight="bold"
                            >
                              Taken Date:{" "}
                            </Typography>
                            <span>
                              {new Date(
                                item.decision_taken_date,
                              ).toLocaleDateString()}
                            </span>
                          </>
                        )}

                        <br />

                        <Typography
                          component="span"
                          variant="body1"
                          fontWeight="bold"
                        >
                          User Statement:{" "}
                        </Typography>
                        <Typography
                          component="span"
                          variant="body1"
                          color="textSecondary"
                        >
                          {item.user_statement}
                        </Typography>
                      </Typography>
                    </CardContent>
                    <CardContent>
                      <Typography variant="h6">Comments:</Typography>
                      {Array.isArray(comments[item.decision_id]) &&
                        comments[item.decision_id].map(
                          (comment, commentIndex) => (
                            <Box
                              className="sharedDecision-comment"
                              key={comment.commentId || commentIndex}
                              mt={2}
                              mb={2}
                            >
                              <Grid container spacing={2} alignItems="center">
                                <Grid item>
                                  <Avatar>
                                    {comment.displayname?.[0] || "?"}
                                  </Avatar>
                                </Grid>

                                <Grid item xs>
                                  <Typography
                                    variant="body1"
                                    className="sharedDecision-comment-text"
                                  >
                                    {comment.comment}
                                  </Typography>

                                  <Typography
                                    variant="caption"
                                    className="sharedDecision-comment-meta"
                                  >
                                    {comment.displayname || "Unknown User"} |{" "}
                                    {comment.email || "No Email"} |{" "}
                                    {comment.created_at ===
                                    comment.updated_at ? (
                                      <span>
                                        {formatDistanceToNow(
                                          parseISO(comment.created_at),
                                          {
                                            addSuffix: true,
                                          },
                                        )}
                                      </span>
                                    ) : (
                                      <span>
                                        Edited{" "}
                                        {formatDistanceToNow(
                                          parseISO(comment.updated_at),
                                          {
                                            addSuffix: true,
                                          },
                                        )}
                                      </span>
                                    )}
                                  </Typography>
                                </Grid>

                                {comment.type_of_member === "author" && (
                                  <Grid item>
                                    <IconButton
                                      onClick={() => handleEditClick(comment)}
                                      aria-label="Edit comment"
                                    >
                                      <AiFillEdit />
                                    </IconButton>
                                  </Grid>
                                )}
                              </Grid>
                              <DisplayBiasTags tags={comment.biasTags} />
                            </Box>
                          ),
                        )}

                      <Box mt={2}>
                        <input
                          type="text"
                          className="sharedDecision-comment-input"
                          placeholder="Add a comment..."
                          value={newComment[item.decision_id] || ""}
                          onChange={(e) =>
                            handleCommentChange(
                              item.decision_id,
                              e.target.value,
                            )
                          }
                        />

                        <Autocomplete
                          multiple
                          size="small"
                          options={biasTags}
                          value={selectedBiasTags[item.decision_id] || []}
                          getOptionLabel={(option) => option.tag_name || ""}
                          isOptionEqualToValue={(option, value) =>
                            String(option.id) === String(value.id)
                          }
                          onChange={(event, newValue) =>
                            setSelectedBiasTags((prev) => ({
                              ...prev,
                              [item.decision_id]: newValue,
                            }))
                          }
                          renderOption={(props, option) => (
                            <li {...props} key={option.id}>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {option.tag_name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {option.tag_type}
                                </Typography>
                              </Box>
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Add bias tags..."
                              variant="outlined"
                            />
                          )}
                          sx={{ mt: 1.5 }}
                        />

                        <Box className="sharedDecision-actions">
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() =>
                              handlePostComment(item.decision_id, item.id)
                            }
                            disabled={buttonLoading[item.decision_id]}
                          >
                            {buttonLoading[item.decision_id] ? (
                              <CircularProgress size={24} />
                            ) : (
                              "Save"
                            )}
                          </Button>
                        </Box>
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
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      />
      <Modal open={isEditModalOpen} onClose={() => setEditModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" mb={2}>
            Edit Comment
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
          <Autocomplete
            multiple
            size="small"
            options={biasTags}
            value={editBiasTags}
            getOptionLabel={(option) => option.tag_name || ""}
            isOptionEqualToValue={(option, value) =>
              String(option.id) === String(value.id)
            }
            onChange={(event, newValue) => setEditBiasTags(newValue)}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {option.tag_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.tag_type}
                  </Typography>
                </Box>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Edit bias tags..."
                variant="outlined"
              />
            )}
            sx={{ mt: 1.5 }}
          />
          <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveEditComment}
              disabled={!editContent.trim() || isSaving}
            >
              {isSaving ? <CircularProgress size={24} /> : "Save"}
            </Button>
            <Button variant="outlined" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
      <ToastContainer />
    </Box>
  );
};

export default withAuth(SharedDecisionCircle);
