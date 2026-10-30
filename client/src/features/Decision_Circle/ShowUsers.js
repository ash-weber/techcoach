import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  removeUsersFromGroup,
  getdecisionSharedDecisionCircle,
  getComments,
  replyToComment,
  mailToDecisionCircleReplyComment,
  updateComment,
  deleteComment,
} from '../../api/DecisionCircle/Network_Call';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import {
  IoPersonAdd,
  
} from 'react-icons/io5';
import { AiFillEdit } from 'react-icons/ai';
import {
  MdOutlineDeleteForever,
  MdOutlineGroups,
  MdOutlineAdminPanelSettings,
  MdOutlineForum,
  MdOutlineEvent,
  MdOutlineCalendarToday,
  MdOutlineInfo,
  MdOutlineLocalOffer,
  MdOutlinePerson,
  MdOutlineReply,
  MdOutlineMail,
  MdOutlineSend,
  MdOutlineArrowBack,
} from 'react-icons/md';
import { Modal, Box, CircularProgress } from '@mui/material';
import { formatDistanceToNow, parseISO } from 'date-fns';
import '../../assets/styles/pages/Decision.css';
import '../../assets/styles/pages/DecisionCircle.css';

const ShowUsers = () => {
  const [groups, setGroups] = useState(null);
  const [user, setUser] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [members, setMembers] = useState([]);
  const [comments, setComments] = useState({});
  const [replyComment, setReplyComment] = useState({});
  const [editComment, setEditComment] = useState(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [replyLoading, setReplyLoading] = useState({});
  const { groupId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const groupName = params.get('group_name');

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
      fetchDecisions();
      fetchGroupExtra();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  /* ------------ Data Fetching ------------ */
  const fetchGroupDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/group/getUsersForGroup/${groupId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.error) {
        toast.error(response.data.error);
      } else {
        setGroups(response.data.group);
        setMembers(response.data.members || []);
      }
    } catch (err) {
      toast.error('An error occurred while fetching the details');
      console.error(err);
    }
  };

  const fetchGroupExtra = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/group/getGroupDetails/${groupId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchDecisions = async () => {
  try {
    const data = await getdecisionSharedDecisionCircle(groupId);

    // Guard: API may return null / undefined / non-array
    const list = Array.isArray(data) ? data : [];
    setDecisions(list);

    list.forEach((decision) => fetchComments(groupId, decision.decision_id));
  } catch (error) {
    console.error('Error fetching decisions:', error);
    setDecisions([]); // still array so .length / .map won't crash
  }
};

  const fetchComments = async (groupId, decisionId) => {
  try {
    const response = await getComments(groupId, decisionId);
    setComments((prev) => ({
      ...prev,
      [decisionId]: Array.isArray(response) ? response : [],
    }));
  } catch (error) {
    console.error('Error fetching comments:', error);
    setComments((prev) => ({ ...prev, [decisionId]: [] }));
  }
};

  /* ------------ Member Actions ------------ */
  const handleRemoveUser = async (userId, e) => {
    e.preventDefault();
    try {
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
      await removeUsersFromGroup(groupId, userId);
      fetchGroupDetails();
      toast.success('User removed successfully');
    } catch (error) {
      toast.error('Error removing user from group');
    }
  };

  const handleAddPersonClick = () => {
    if (groups && groups.length > 0 && groups[0].group_name && groups[0].id) {
      navigate(`/decision-circle/add/member/${groups[0].group_name}?id=${groups[0].id}`);
    } else {
      toast.error('Group details are not available.');
    }
  };

  /* ------------ Reply Actions ------------ */
  const handleReplyInputChange = (decisionId, parentCommentId, value) => {
    setReplyComment((prev) => ({
      ...prev,
      [decisionId]: { ...prev[decisionId], [parentCommentId]: value },
    }));
  };

  const handleReplyComment = async (decisionId, parentCommentId) => {
    const commentText = replyComment[decisionId]?.[parentCommentId]?.trim();
    if (!commentText) return toast.error('Comment cannot be empty');

    const key = `${decisionId}_${parentCommentId}`;
    setReplyLoading((prev) => ({ ...prev, [key]: true }));
    try {
      await replyToComment({ groupId, commentText, decisionId, parentCommentId });
      setReplyComment((prev) => ({
        ...prev,
        [decisionId]: { ...prev[decisionId], [parentCommentId]: '' },
      }));
      toast.success('Reply comment successfully posted');
      fetchComments(groupId, decisionId);
    } catch (error) {
      toast.error('Error posting reply comment');
      console.error(error);
    } finally {
      setReplyLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleMailToReplyComment = async (decisionId, parentCommentId) => {
    const comment = replyComment[decisionId]?.[parentCommentId]?.trim();
    if (!comment) return toast.error('Comment cannot be empty');

    const key = `${decisionId}_${parentCommentId}_email`;
    setReplyLoading((prev) => ({ ...prev, [key]: true }));
    try {
      await replyToComment({ groupId, parentCommentId, commentText: comment, decisionId });
      const decisionDetails = decisions.find((d) => d.decision_id === decisionId);
      if (!decisionDetails) throw new Error('Decision details not found');
      await mailToDecisionCircleReplyComment(decisionDetails, parentCommentId, true, groupId);
      toast.success('Comment posted and email sent successfully');
      fetchComments(groupId, decisionId);
    } catch (error) {
      toast.error('Error sending email');
      console.error(error);
    } finally {
      setReplyLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  /* ------------ Comment Actions ------------ */
  const handleDeleteComment = async (commentId, decisionId) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => ({
        ...prev,
        [decisionId]: prev[decisionId].filter((c) => c.id !== commentId),
      }));
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error.response?.data);
      toast.error('Error deleting comment');
    }
  };

  const handleEditClick = (comment) => {
    setEditComment(comment.id);
    setEditContent(comment.comment);
    setEditModalOpen(true);
  };

  const handleSaveEditComment = async () => {
    if (!editContent.trim()) return toast.error('Comment cannot be empty');

    setComments((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((decisionId) => {
        updated[decisionId] = updated[decisionId].map((c) =>
          c.id === editComment ? { ...c, comment: editContent } : c
        );
      });
      return updated;
    });

    setEditModalOpen(false);
    setEditComment(null);
    setEditContent('');

    try {
      await updateComment(editComment, { comment: editContent });
      toast.success('Comment updated successfully');
    } catch (error) {
      fetchComments();
      console.error('Failed to update comment:', error);
      toast.error('Failed to update comment');
    }
  };

  /* ------------ Render ------------ */
  return (
    <div className="dc-page">
      {/* Back */}
      <button
        className="dc-back-link"
        onClick={() => navigate(-1)}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        <MdOutlineArrowBack /> Back
      </button>

      {/* ---------- Group Header ---------- */}
      {groups && (
        <header className="dc-group-header">
          <div className="dc-group-header__main">
            <div className="dc-group-header__avatar">
              {(groupName || groups.group_name)?.charAt(0)?.toUpperCase() || 'G'}
            </div>
            <div>
              <h1 className="dc-group-header__title">
                {groupName || groups.group_name}
              </h1>
              <p className="dc-group-header__subtitle">
                <MdOutlineGroups /> {members.length} member{members.length !== 1 && 's'}
              </p>
            </div>
          </div>

          <div className="dc-header-actions">
            <button
              className="decision-btn decision-btn--primary"
              onClick={handleAddPersonClick}
            >
              <IoPersonAdd /> Add Member
            </button>
          </div>
        </header>
      )}

      {/* ---------- Admin ---------- */}
      {user?.created_by && (
        <div className="dc-admin-card dc-admin-card--block">
          <MdOutlineAdminPanelSettings className="dc-admin-card__icon" />
          <div>
            <span className="dc-admin-card__label">Admin</span>
            <p className="dc-admin-card__name">
              {user.created_by}
              <span className="dc-admin-card__email"> · {user.creator_email}</span>
            </p>
          </div>
        </div>
      )}

      {/* ---------- Members ---------- */}
      {groups && (
        <section className="dc-section">
          <h2 className="dc-section__title">
            <MdOutlineGroups className="dc-section__icon" />
            Members
            <span className="dc-section__count">{members.length}</span>
          </h2>

          {Array.isArray(members) && members.length > 0 ? (
            <div className="dc-members">
              {members.map((member) => (
                <div key={member.user_id} className="dc-member-chip dc-member-chip--removable">
                  <div className="dc-member-chip__avatar">
                    {member.displayname?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="dc-member-chip__info">
                    <span className="dc-member-chip__name">{member.displayname}</span>
                    <span className="dc-member-chip__email">{member.email}</span>
                  </div>
                  <button
                    className="dc-member-chip__remove"
                    onClick={(e) => handleRemoveUser(member.user_id, e)}
                    title={`Remove ${member.displayname}`}
                    aria-label={`Remove ${member.displayname}`}
                  >-
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="comments-empty">No members found in this group.</p>
          )}
        </section>
      )}

      {/* ---------- Decisions ---------- */}
      <section className="dc-section">
        <h2 className="dc-section__title">
          <MdOutlineInfo className="dc-section__icon" />
          Shared by Decisions
          <span className="dc-section__count">{decisions.length}</span>
        </h2>

        {Array.isArray(decisions) && decisions.length > 0 ? (
          <div className="dc-decision-list">
            {decisions.map((decision) => (
              <article key={decision.decision_id} className="dc-decision-card">
                <header className="dc-decision-card__head">
                  <h3 className="dc-decision-card__title">{decision.decision_name}</h3>
                  <span className="decision-tag">
                    <MdOutlinePerson /> Shared by {decision.shared_by}
                  </span>
                </header>

                <div className="dc-decision-card__meta">
                  {decision.decision_due_date && (
                    <span className="dc-meta-pill dc-meta-pill--warning">
                      <MdOutlineEvent /> Due{' '}
                      {new Date(decision.decision_due_date).toISOString().split('T')[0]}
                    </span>
                  )}
                  {decision.decision_taken_date && (
                    <span className="dc-meta-pill dc-meta-pill--success">
                      <MdOutlineCalendarToday /> Taken{' '}
                      {new Date(decision.decision_taken_date).toISOString().split('T')[0]}
                    </span>
                  )}
                </div>

                {decision.user_statement && (
                  <div className="dc-decision-card__block">
                    <span className="dc-block-label">
                      <MdOutlineInfo /> Decision Details
                    </span>
                    <p>{decision.user_statement}</p>
                  </div>
                )}

                {decision.reasons?.length > 0 && (
                  <div className="dc-decision-card__block">
                    <span className="dc-block-label">Reasons</span>
                    <ul className="dc-reasons">
                      {decision.reasons.map((reason, i) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {decision.tags?.length > 0 && (
                  <div className="dc-decision-card__tags">
                    {decision.tags.map((tag) => (
                      <span key={tag.tag_name} className="decision-tag">
                        <MdOutlineLocalOffer /> {tag.tag_name}
                      </span>
                    ))}
                  </div>
                )}

                {/* ---------- Comments ---------- */}
                <div className="dc-comments">
                  <h4 className="dc-comments__title">
                    <MdOutlineForum className="dc-comments__icon" />
                    Comments
                    <span className="dc-section__count">
                      {comments[decision.decision_id]?.length || 0}
                    </span>
                  </h4>

                  {comments[decision.decision_id]?.length > 0 ? (
                    <div className="dc-comments__list">
                      {comments[decision.decision_id].map((comment) => {
                        const isReply = Boolean(comment.parentCommentId);
                        const isAuthor = comment.type_of_member === 'author';
                        const key = `${decision.decision_id}_${comment.id}`;

                        return (
                          <div
                            key={comment.id}
                            className={`comment ${isAuthor ? 'comment--author' : ''} ${
                              isReply ? 'comment--reply' : ''
                            }`}
                          >
                            <div className="comment__header">
                              <p className="comment__text">{comment.comment}</p>
                              {isAuthor && (
                                <div className="dc-comment-actions">
                                  <button
                                    className="comment__edit-btn"
                                    onClick={() => handleEditClick(comment)}
                                    title="Edit"
                                  >
                                    <AiFillEdit />
                                  </button>
                                  <button
                                    className="comment__edit-btn dc-btn-danger"
                                    onClick={() =>
                                      handleDeleteComment(comment.id, decision.decision_id)
                                    }
                                    title="Delete"
                                  >
                                    <MdOutlineDeleteForever />
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className="comment__meta">
                              <div className="comment__avatar">
                                {comment.displayname?.[0]?.toUpperCase()}
                              </div>
                              <div className="comment__meta-text">
                                <b>{comment.displayname}</b>
                                <span className="comment__meta-sep"> · </span>
                                {comment.email}
                                <span className="comment__meta-sep"> · </span>
                                {comment.created_at === comment.updated_at ? (
                                  formatDistanceToNow(parseISO(comment.created_at), {
                                    addSuffix: true,
                                  })
                                ) : (
                                  <em>
                                    Edited{' '}
                                    {formatDistanceToNow(parseISO(comment.updated_at), {
                                      addSuffix: true,
                                    })}
                                  </em>
                                )}
                              </div>
                            </div>

                            {/* Reply composer */}
                            <div className="dc-reply-box">
                              <input
                                className="dc-reply-box__input"
                                type="text"
                                placeholder="Reply to this comment…"
                                value={
                                  replyComment[decision.decision_id]?.[comment.id] || ''
                                }
                                onChange={(e) =>
                                  handleReplyInputChange(
                                    decision.decision_id,
                                    comment.id,
                                    e.target.value
                                  )
                                }
                              />
                              <div className="dc-reply-box__actions">
                                <button
                                  className="decision-btn decision-btn--primary"
                                  onClick={() =>
                                    handleReplyComment(decision.decision_id, comment.id)
                                  }
                                  disabled={replyLoading[key]}
                                >
                                  {replyLoading[key] ? (
                                    <CircularProgress size={14} style={{ color: '#fff' }} />
                                  ) : (
                                    <>
                                      <MdOutlineReply /> Reply
                                    </>
                                  )}
                                </button>
                                <button
                                  className="decision-btn decision-btn--success"
                                  onClick={() =>
                                    handleMailToReplyComment(decision.decision_id, comment.id)
                                  }
                                  disabled={replyLoading[`${key}_email`]}
                                >
                                  {replyLoading[`${key}_email`] ? (
                                    <CircularProgress size={14} style={{ color: '#fff' }} />
                                  ) : (
                                    <>
                                      <MdOutlineMail /> Reply & Email
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="comments-empty">No comments yet.</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="dc-empty">
            <MdOutlineInfo className="dc-empty__icon" />
            <p>No decisions available.</p>
          </div>
        )}
      </section>

      {/* ---------- Edit Modal ---------- */}
      <Modal open={isEditModalOpen} onClose={() => setEditModalOpen(false)}>
        <Box
          className="modal-card"
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <h3>Edit Comment</h3>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={4}
          />
          <div className="modal-card__actions">
            <button className="decision-btn" onClick={() => setEditModalOpen(false)}>
              Cancel
            </button>
            <button
              className="decision-btn decision-btn--primary"
              onClick={handleSaveEditComment}
            >
              Save
            </button>
          </div>
        </Box>
      </Modal>

      <ToastContainer position="top-right" theme="colored" />
    </div>
  );
};

export default ShowUsers;