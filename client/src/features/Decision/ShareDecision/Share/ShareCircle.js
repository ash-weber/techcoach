import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';

import {
  getInnerCircleDetails,
  checkInnerCircleExists,
} from '../../../../api/InnerCircle/Network_Call';

import ShareModal from '../../ShareDecision/View/ShareModel';
import DecisionInfoCard from '../../Views/DecisionInfoCard';
import '../../../../assets/styles/pages/Decision.css';

const DecisionCircleView = () => {
  const { id } = useParams();

  const [decision, setDecision] = useState({});
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [innerCircleDetails, setInnerCircleDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [innerGroup, setInnerGroup] = useState();

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/getInfo_Referred/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const d = res.data?.decisionData?.[0];
        if (!d) return;
        const fmt = (s) => (s ? new Date(s).toISOString().split('T')[0] : '');
        setDecision({
          decision_id: d.decision_id,
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

  const handleShowShareOptions = () => setShowShareOptions(true);
  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const goToDecisionCircle = () => {
    if (decision.decision_id) {
      window.location.href = `/decision/decision-circle/share/${decision.decision_id}`;
    }
  };

  return (
    <div className="view-page">
      <DecisionInfoCard decision={decision} />

      <div
        className="share-cta share-cta--trigger"
        role="button"
        tabIndex={0}
        onClick={handleShowShareOptions}
      >
        Share Above Decision
      </div>

      {showShareOptions && (
        <div className="share-options">
          <button
            className="share-options__btn"
            onClick={innerGroup ? handleShow : handleShow}
          >
            {innerGroup
              ? 'Inner Circle'
              : 'Create Inner Circle to share this Decision'}
          </button>

          {decision.decision_id && (
            <button
              className="share-options__btn"
              onClick={goToDecisionCircle}
            >
              Decision Circle
            </button>
          )}
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

export default DecisionCircleView;