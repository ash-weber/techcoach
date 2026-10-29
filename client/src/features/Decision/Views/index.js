import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import withAuth from '../../../utils/withAuth';
import {
  checkInnerCircleExists,
  getInnerCircleDetails,
  getSharedComments,
  postReplyComment,
  deleteCommentAdded,
  EditCommentAdded,
  innerCirclePostReplyComment,
} from '../../../api/InnerCircle/Network_Call';
import {
  getDecisionComments,
  updateComment,
} from '../../../api/DecisionCircle/Network_Call';

import ShareModal from '../ShareDecision/View/ShareModel';
import DecisionInfoCard from './DecisionInfoCard';
import CommentsList from './CommentsList';
import '../../../assets/styles/pages/Decision.css';

const DecisionView = () => {
  const { id } = useParams();

  const [decision, setDecision] = useState({});
  const [innerGroup, setInnerGroup] = useState();
  const [showModal, setShowModal] = useState(false);
  const [innerCircleDetails, setInnerCircleDetails] = useState(null);
  const [sharedComments, setSharedComments] = useState([]);
  const [decisionComments, setDecisionComments] = useState([]);
  const [replies, setReplies] = useState({});

  const [editTarget, setEditTarget] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    (async () => setInnerGroup(await checkInnerCircleExists()))();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setInnerCircleDetails(await getInnerCircleDetails());
      } catch (e) {
        console.error('Failed to fetch inner circle details', e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/getInfo_Referred/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const list = res.data?.decisionData;
        if (!list?.length) return;
        const d = list[0];
        const fmt = (s) =>
          s ? new Date(s).toISOString().split('T')[0] : '';
        setDecision({
          decision_name: d.decision_name,
          decision_due_date: fmt(d.decision_due_date),
          decision_taken_date: fmt(d.decision_taken_date),
          user_statement: d.user_statement,
          tagsArray: d.tags.map((t) => ({
            id: t.id,
            tag_name: t.tag_name,
            tag_type: t.tag_type,
          })),
          decision_reason: d.decision_reason.map((r) => r.decision_reason_text),
        });
      } catch (e) {
        console.error('Error fetching decision data:', e.message);
      }
    })();
  }, [id]);

  const loadSharedComments = async () => {
    try {
      const c = await getSharedComments(id);
      setSharedComments(c.comments);
      setReplies((prev) => {
        const next = { ...prev };
        c.comments.forEach((cm) => {
          if (!(cm.id in next)) next[cm.id] = '';
        });
        return next;
      });
    } catch (e) {
      console.error('Failed to fetch shared comments', e);
    }
  };

  const loadDecisionComments = async () => {
    try {
      const c = await getDecisionComments(id);
      setDecisionComments(c || []);
    } catch (e) {
      console.error('Failed to fetch decision comments', e);
    }
  };

  useEffect(() => {
    loadSharedComments();
    loadDecisionComments();
  }, [id]);

  const handleReplyChange = (commentId) => (e) =>
    setReplies((prev) => ({ ...prev, [commentId]: e.target.value }));

  const handleReplySubmit = async (commentId, groupId) => {
    try {
      await postReplyComment(commentId, replies[commentId], groupId, id);
      setReplies((prev) => ({ ...prev, [commentId]: '' }));
      await loadSharedComments();
    } catch (e) {
      console.error('Error submitting reply:', e);
    }
  };

  const handleReplySendEmail = async (commentId, groupId) => {
    try {
      await innerCirclePostReplyComment({
        commentId,
        replyText: replies[commentId],
        groupId,
        id,
      });
      setReplies((prev) => ({ ...prev, [commentId]: '' }));
      await loadSharedComments();
    } catch (e) {
      console.error('Error submitting reply & email:', e);
    }
  };

  const openEdit = (kind) => (comment) => {
    setEditTarget({ comment, kind });
    setEditContent(comment.comment);
  };

  const closeEdit = () => {
    setEditTarget(null);
    setEditContent('');
  };

  const saveEdit = async () => {
    if (!editTarget) return;
    const { comment, kind } = editTarget;
    try {
      if (kind === 'reply') {
        await EditCommentAdded(comment.id, editContent);
        await loadSharedComments();
      } else {
        await updateComment(comment.id, { comment: editContent });
        await loadDecisionComments();
      }
      toast.success('Updated successfully');
      closeEdit();
    } catch (e) {
      console.error('Edit failed:', e);
      toast.error('Failed to update comment');
    }
  };

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const memberComments = sharedComments.filter(
    (c) => c.type_of_member === 'member'
  );
  const authorComments = sharedComments.filter(
    (c) => c.type_of_member === 'author'
  );
  const visibleDecisionComments = [...decisionComments].sort((a, b) =>
    a.type_of_member === 'member' ? -1 : 1
  );

  return (
    <div className={'view-page' + (editTarget ? ' view-page--blurred' : '')}>
      <DecisionInfoCard decision={decision} />

      <div
        className="share-cta"
        onClick={innerGroup ? handleShow : handleShow}
        role="button"
        tabIndex={0}
      >
        {innerGroup
          ? 'Share The Above Decision in Inner Circle'
          : 'Create Inner Circle to share this Decision'}
      </div>

      <CommentsList
        title="Shared Comments"
        comments={memberComments.length ? memberComments : sharedComments}
        replies={replies}
        onReplyChange={handleReplyChange}
        onReply={handleReplySubmit}
        onReplyEmail={handleReplySendEmail}
        onEditReply={openEdit('reply')}
        showAuthorReplies
      />

      <CommentsList
        title="Comments"
        comments={visibleDecisionComments}
        onEditComment={openEdit('comment')}
      />

      {editTarget && (
        <div className="modal-overlay" onClick={closeEdit}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Comment</h3>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
            <div className="modal-card__actions">
              <button className="decision-btn" onClick={closeEdit}>
                Cancel
              </button>
              <button
                className="decision-btn decision-btn--primary"
                onClick={saveEdit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <ShareModal
        showModal={showModal}
        handleClose={handleClose}
        innerGroup={innerGroup}
        innerCircleDetails={innerCircleDetails}
        decision={decision}
        id={id}
      />
      <ToastContainer />
    </div>
  );
};

export default withAuth(DecisionView);