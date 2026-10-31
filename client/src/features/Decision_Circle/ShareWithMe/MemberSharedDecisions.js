import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import {
  getMemberSharedDecisions,
  mailToDecisionCirclePostComment,
  postComment,
  getComments,
  deleteComment,
  updateComment,
} from '../../../api/DecisionCircle/Network_Call';
import { Modal, Box, CircularProgress } from '@mui/material';
import {
  MdOutlineDeleteForever,
  MdOutlineEdit,
  MdOutlineMail,
  MdOutlineSend,
  MdOutlineGroups,
  MdOutlineAdminPanelSettings,
  MdOutlineForum,
  MdOutlineEvent,
  MdOutlineCalendarToday,
  MdOutlineInfo,
  MdOutlineLocalOffer,
  MdOutlinePerson,
} from 'react-icons/md';
import { AiFillEdit } from 'react-icons/ai';
import { formatDistanceToNow, parseISO } from 'date-fns';
import axios from 'axios';
import '../../../assets/styles/pages/Decision.css';
import '../../../assets/styles/pages/DecisionCircle.css';

const MemberSharedDecisions = () => {
  const [groups, setGroups] = useState(null);
  const [user, setUser] = useState();
  const [decisions, setDecisions] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [buttonLoading, setButtonLoading] = useState({});
  const [editComment, setEditComment] = useState(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editContent, setEditContent] = useState('');
  const { groupId } = useParams();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const groupName = params.get('group_name');

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
      fetchSharedDecisions();
      fetchGroupExtra();
    }
  }, [groupId]);

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
        setMembers(response.data.members);
      }
    } catch (err) {
      toast.error('An error occurred while fetching the group details.');
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

  const fetchSharedDecisions = async () => {
    try {
      const data = await getMemberSharedDecisions(groupId);
      setDecisions(data || []);
      data.forEach((decision) => fetchComments(groupId, decision.decision_id));
    } catch (error) {
      setError('Failed to fetch shared decisions.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (groupId, decisionId) => {
    try {
      const response = await getComments(groupId, decisionId);
      setComments((prev) => ({ ...prev, [decisionId]: response || [] }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handlePostComment = async (decisionId) => {
    const comment = newComments[decisionId]?.trim();
    if (!comment) return toast.error('Comment cannot be empty');
    if (!groupId) return toast.error('Group ID is missing from the URL');

    setButtonLoading((prev) => ({ ...prev, [decisionId]: true }));
    try {
      await postComment(groupId, comment, decisionId);
      setNewComments((prev) => ({ ...prev, [decisionId]: '' }));
      toast.success('Comment posted successfully');
      fetchComments(groupId, decisionId);
    } catch (error) {
      toast.error('Error posting comment');
      console.error(error);
    } finally {
      setButtonLoading((prev) => ({ ...prev, [decisionId]: false }));
    }
  };

  const handleMailToPostComment = async (decisionId, email) => {
    const comment = newComments[decisionId]?.trim();
    if (!comment) return toast.error('Comment cannot be empty');
    setButtonLoading((prev) => ({ ...prev, [decisionId + '_email']: true }));
    try {
      await postComment(groupId, comment, decisionId);
      const decision = decisions.find((d) => d.decision_id === decisionId);
      if (!decision) throw new Error(`Decision with ID ${decisionId} not found`);
      await mailToDecisionCirclePostComment(decision, groupId, comment, email);
      toast.success('Comment posted and email sent successfully');
      fetchComments(groupId, decisionId);
    } catch (error) {
      toast.error('Error sending email');
      console.error(error);
    } finally {
      setButtonLoading((prev) => ({ ...prev, [decisionId + '_email']: false }));
    }
  };

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

  const handleCommentChange = (decisionId, value) => {
    setNewComments((prev) => ({ ...prev, [decisionId]: value }));
  };

  const handleEditClick = (comment) => {
    setEditComment(comment.id);
    setEditContent(comment.comment);
    setEditModalOpen(true);
  };

  const handleSaveEditComment = async () => {
    if (!editContent.trim()) return toast.error('Comment cannot be empty');
    const previousComments = { ...comments };
    setComments((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((decisionId) => {
        updated[decisionId] = updated[decisionId].map((c) =>
          c.id === editComment
            ? { ...c, comment: editContent, updated_at: new Date().toISOString() }
            : c
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
      setComments(previousComments);
      console.error('Failed to update comment:', error);
      toast.error('Failed to update comment');
    }
  };

  if (loading) {
    return (
      <div className="dc-page">
        <div className="dc-loading">
          <CircularProgress size={32} />
          <p>Loading decision circle…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dc-page">
        <div className="decision-banner decision-banner--warning">{error}</div>
      </div>
    );
  }

  return (
    <div className="dc-page">
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

          {user?.created_by && (
            <div className="dc-admin-card">
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
        </header>
      )}

      {groups && (
        <section className="dc-section">
          <h2 className="dc-section__title">
            <MdOutlineGroups className="dc-section__icon" />
            Members
            <span className="dc-section__count">{members.length}</span>
          </h2>
          {members.length > 0 ? (
            <div className="dc-members">
              {members.map((member) => (
                <div key={member.user_id} className="dc-member-chip">
                  <div className="dc-member-chip__avatar">
                    {member.displayname?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="dc-member-chip__info">
                    <span className="dc-member-chip__name">{member.displayname}</span>
                    <span className="dc-member-chip__email">{member.email}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="comments-empty">No members found in this group.</p>
          )}
        </section>
      )}

      <section className="dc-section">
        <h2 className="dc-section__title">
          <MdOutlineInfo className="dc-section__icon" />
          Shared Decisions
          <span className="dc-section__count">{decisions.length}</span>
        </h2>

        {decisions.length === 0 ? (
          <div className="dc-empty">
            <MdOutlineInfo className="dc-empty__icon" />
            <p>No shared decisions available for this group.</p>
          </div>
        ) : (
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
                      {new Date(decision.decision_due_date).toLocaleDateString()}
                    </span>
                  )}
                  {decision.decision_taken_date && (
                    <span className="dc-meta-pill dc-meta-pill--success">
                      <MdOutlineCalendarToday /> Taken{' '}
                      {new Date(decision.decision_taken_date).toLocaleDateString()}
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
                    <p>{decision.reasons.join(', ')}</p>
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
                        const isAuthor = comment.type_of_member === 'author';
                        return (
                          <div
                            key={comment.id}
                            className={`comment ${isAuthor ? 'comment--author' : ''}`}
                          >
                            <div className="comment__header">
                              <p className="comment__text">{comment.comment}</p>
                              {isAuthor && (
                                <div className="dc-comment-actions">
                                  <button
                                    className="comment__edit-btn"
                                    onClick={() => handleEditClick(comment)}
                                    title="Edit comment"
                                  >
                                    <AiFillEdit />
                                  </button>
                                  <button
                                    className="comment__edit-btn dc-btn-danger"
                                    onClick={() =>
                                      handleDeleteComment(comment.id, decision.decision_id)
                                    }
                                    title="Delete comment"
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
                                <span className="comment__meta-sep"> | </span>
                                {comment.email}
                                <span className="comment__meta-sep"> | </span>
                                {comment.created_at === comment.updated_at ? (
                                  formatDistanceToNow(parseISO(comment.created_at), {
                                    addSuffix: true,
                                  })
                                ) : (
                                  <>
                                    Edited{' '}
                                    {formatDistanceToNow(parseISO(comment.updated_at), {
                                      addSuffix: true,
                                    })}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="comments-empty">No comments yet.</p>
                  )}

                  <div className="dc-comment-box">
                    <input
                      className="dc-comment-box__input"
                      value={newComments[decision.decision_id] || ''}
                      onChange={(e) =>
                        handleCommentChange(decision.decision_id, e.target.value)
                      }
                      placeholder="Add your comment…"
                    />
                    <div className="dc-comment-box__actions">
                      <button
                        className="decision-btn decision-btn--primary"
                        onClick={() => handlePostComment(decision.decision_id)}
                        disabled={buttonLoading[decision.decision_id]}
                      >
                        {buttonLoading[decision.decision_id] ? (
                          <CircularProgress size={16} style={{ color: '#fff' }} />
                        ) : (
                          <>
                            <MdOutlineSend /> Post Comment
                          </>
                        )}
                      </button>
                      <button
                        className="decision-btn decision-btn--success"
                        onClick={() => handleMailToPostComment(decision.decision_id)}
                        disabled={buttonLoading[decision.decision_id + '_email']}
                      >
                        {buttonLoading[decision.decision_id + '_email'] ? (
                          <CircularProgress size={16} style={{ color: '#fff' }} />
                        ) : (
                          <>
                            <MdOutlineMail /> Post & Email
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ---------- Edit Modal ---------- */}
      <Modal open={isEditModalOpen} onClose={() => setEditModalOpen(false)}>
        <Box className="modal-card" sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
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

export default MemberSharedDecisions;