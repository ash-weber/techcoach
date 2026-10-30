import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { IoClose } from 'react-icons/io5';

import { getdecisionCirclesByUserAndMember } from '../../../../api/DecisionCircle/Network_Call';
import { notifyTeamsChannel } from '../../../../utils/teamsWebhook';
import DecisionInfoCard from '../../Views/DecisionInfoCard';
import '../../../../assets/styles/pages/Decision.css';

const DecisionCircleShare = () => {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [decision, setDecision] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  const handleCloseCircle = () => navigate(-1);

  useEffect(() => {
    if (!id) return;
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
          decision_name: d.decision_name,
          decision_due_date: fmt(d.decision_due_date),
          decision_taken_date: fmt(d.decision_taken_date),
          user_statement: d.user_statement,
          tagsArray: (d.tags || []).map((t) => ({
            id: t.id,
            tag_name: t.tag_name,
            tag_type: t.tag_type,
          })),
          decision_reason: (d.decision_reason || []).map(
            (r) => r.decision_reason_text
          ),
        });
      } catch (e) {
        console.error('Error fetching decision data:', e.message);
      }
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getdecisionCirclesByUserAndMember();
        const uniqueGroups = (data.groups || []).reduce((acc, cur) => {
          if (!acc.some((g) => g.group_name === cur.group_name)) acc.push(cur);
          return acc;
        }, []);
        setGroups(uniqueGroups);
      } catch (e) {
        toast.error('Failed to fetch groups');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleShareDecision = async (group_id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/group/decisionshareDecisionCircle`,
        { group_id, decision_id: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Decision shared successfully!');

      const currentGroup = groups.find((g) => g.group_id === group_id);
      const emails =
        currentGroup?.members
          ?.map((m) => m.member_email)
          .filter(Boolean) || [];

      if (emails.length) {
        const results = await Promise.allSettled(
          emails.map((email) => notifyTeamsChannel('SHARED', decision, email))
        );
        results.forEach((r, i) => {
          if (r.status === 'rejected') {
            console.warn(`Failed to notify ${emails[i]}:`, r.reason);
          }
        });
      }
    } catch (e) {
      console.error('Error sharing decision:', e);
      toast.error('Error sharing decision');
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = groups.filter(
    (g) =>
      g.group_name &&
      g.group_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="share-group">
      <div className="share-group__header">
        <h4>Share Decision</h4>
        <button
          className="share-group__close"
          onClick={handleCloseCircle}
          aria-label="Close"
        >
          <IoClose />
        </button>
      </div>

      <h5 className="share-group__title">Decision Circle Group Details</h5>

      <div className="share-group__field">
        <label htmlFor="group-select">Select a Group</label>
        <select
          id="group-select"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          <option value="" disabled>
            Select a group
          </option>
          {filteredGroups.map((g) => (
            <option key={g.group_id} value={g.group_id}>
              {g.group_name}
            </option>
          ))}
        </select>
      </div>

      <div className="share-group__field">
        <input
          type="text"
          placeholder="Search circle name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {selectedGroup && (
        <>
          <h6 className="share-group__title">Select Decision Circle</h6>
          <div className="group-items">
            {groups
              .filter((g) => g.group_id === Number(selectedGroup))
              .map((g) => (
                <label key={g.group_id} className="group-item">
                  <input
                    type="checkbox"
                    onChange={() => handleShareDecision(g.group_id)}
                  />
                  <h5>{g.group_name}</h5>
                </label>
              ))}
          </div>
        </>
      )}

      {loading && (
        <p className="share-group__empty">Loading…</p>
      )}

      <h5 className="share-group__title">Decision Details</h5>
      <DecisionInfoCard decision={decision} />

      <ToastContainer />
    </div>
  );
};

export default DecisionCircleShare;