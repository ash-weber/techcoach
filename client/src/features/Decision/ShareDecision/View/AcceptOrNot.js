import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import DoneIcon from '@mui/icons-material/Done';
import { ToastContainer, toast } from 'react-toastify';

import {
  shareDecisionInInnerCircle,
  getSharedMembers,
  mailToInnerCircleDecisionShare,
} from '../../../../api/InnerCircle/Network_Call';
import withAuth from '../../../../utils/withAuth';
import { notifyTeamsChannel } from '../../../../utils/teamsWebhook';
import '../../../../assets/styles/pages/Decision.css';

const AcceptOrNot = ({ innerCircleDetails, decision, id }) => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [sharedMembers, setSharedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const groupId = innerCircleDetails?.group?.id;

  const getSharedMembersList = async () => {
    if (!groupId) return setLoading(false);
    try {
      const response = await getSharedMembers({ groupId, decisionId: id });
      setSharedMembers(response);
    } catch (error) {
      console.error('Error in fetching the shared members:', error);
      toast('An error occurred while fetching the shared member decision');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSharedMembersList();
  }, [groupId, id]);

  const handleMemberClick = (memberId) => {
    setSelectedMember((prev) => (prev === memberId ? null : memberId));
  };

  const handleSubmit = async () => {
    const memberId = selectedMember; 
    if (!memberId) return;

    try {
      const response = await shareDecisionInInnerCircle({
        decisionId: id,
        groupId,
        memberId,
      });

      if (response.status !== 200) {
        toast('Failed to share decision.');
        return;
      }

      toast('Decision shared successfully!');
      setSelectedMember(null);
      await getSharedMembersList();

      const selectedMemberDetails = innerCircleDetails.members.find(
        (m) => m.user_id === memberId
      );
      if (!selectedMemberDetails) return;

      const memberEmail = selectedMemberDetails.email;
      const decisionSummary = {
        decisionName: decision.decision_name,
        userStatement: decision.user_statement,
        reasons: decision.decision_reason?.join(', ') ?? '',
        dueDate: decision.decision_due_date,
        takenDate: decision.decision_taken_date,
      };

      await mailToInnerCircleDecisionShare(memberEmail, decisionSummary);
      await notifyTeamsChannel('SHARED', decision, memberEmail);
    } catch (error) {
      console.error('Error sharing decision:', error);
      toast('An error occurred while sharing the decision.');
    }
  };

  if (loading) {
    return (
      <div className="share-picker__loading">
        <CircularProgress />
      </div>
    );
  }

  const members = innerCircleDetails?.members || [];

  return (
    <div className="share-picker">
      <section>
        <h4 className="share-picker__section-title">Inner Circle Details</h4>

        {members.length === 0 ? (
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
            No members in this inner circle.
          </p>
        ) : (
          <div className="member-list">
            {members.map((member) => {
              const sharedMember = sharedMembers.find(
                (s) => s.groupMember === member.user_id
              );
              const isClickable = member.status === 'Accepted' && !sharedMember;
              const isSelected = selectedMember === member.user_id;

              const itemClass = [
                'member-item',
                isClickable && 'member-item--clickable',
                isSelected && 'member-item--selected',
                sharedMember && 'member-item--shared',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <div
                  key={member.user_id}
                  className={itemClass}
                  onClick={() => isClickable && handleMemberClick(member.user_id)}
                >
                  <span className="member-item__avatar">
                    {member.displayname?.charAt(0) || '?'}
                  </span>

                  <div className="member-item__info">
                    <div className="member-item__name">
                      {member.displayname}
                    </div>
                    <div className="member-item__email">{member.email}</div>
                  </div>

                  {isSelected && (
                    <span className="member-item__icon">
                      <CheckIcon fontSize="inherit" />
                    </span>
                  )}
                  {sharedMember && (
                    <span className="member-item__icon member-item__icon--done">
                      <DoneIcon fontSize="inherit" />
                    </span>
                  )}

                  <span
                    className={
                      'member-item__status ' +
                      (member.status === 'Accepted'
                        ? 'member-item__status--accepted'
                        : 'member-item__status--pending')
                    }
                  >
                    {member.status === 'Accepted' ? 'Accepted' : 'Not Accepted'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h4 className="share-picker__section-title">Decision Details</h4>
        <div className="share-picker__decision">
          <div className="share-picker__decision-row">
            <b>Name:</b> {decision.decision_name}
          </div>
          <div className="share-picker__decision-row">
            <b>Details:</b> {decision.user_statement}
          </div>
          <div className="share-picker__decision-row">
            <b>Reasons:</b> {decision.decision_reason?.join(', ') || '—'}
          </div>
          <div className="share-picker__decision-row">
            <b>Due Date:</b> {decision.decision_due_date}
          </div>
          <div className="share-picker__decision-row">
            <b>Taken Date:</b> {decision.decision_taken_date || '—'}
          </div>
        </div>
      </section>

      {selectedMember && (
        <div className="share-picker__actions">
          <button
            className="decision-btn decision-btn--primary"
            onClick={handleSubmit}
          >
            Share Decision
          </button>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default withAuth(AcceptOrNot);