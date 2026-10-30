import React, { useEffect, useState } from 'react';
import {
  getAlldecisionGroup,
  deleteDecisionGroup,
  getUserDecisionCircles,
} from '../../../api/DecisionCircle/Network_Call';
import {
  MdEdit,
  MdDeleteForever,
  MdGroupAdd,
  MdGroupRemove,
  MdGroups,
  MdOutlineAddCircleOutline,
  MdOutlineSearchOff,
} from 'react-icons/md';
import { FaUsersViewfinder, FaUserShield } from 'react-icons/fa6';
import { HiOutlineUsers } from 'react-icons/hi2';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../../assets/styles/pages/DecisionCircle.css';

const GetGroup = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userCircles, setUserCircles] = useState([]);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const data = await getAlldecisionGroup();
      setGroups(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserCircles = async () => {
    try {
      const data = await getUserDecisionCircles();
      setUserCircles(data.decisionCircles || []);
    } catch (error) {
      setError('Failed to fetch user decision circles.');
      console.error('Error fetching user decision circles:', error);
    }
  };

  const handleDeleteGroup = async (id) => {
    if (window.confirm('Are you sure that you want to delete this decision-circle group')) {
      try {
        await deleteDecisionGroup(id);
        setGroups((prev) => prev.filter((g) => g.id !== id));
        toast.success('Group deleted successfully');
      } catch (error) {
        toast.error('Failed to delete group');
      }
    }
  };

  useEffect(() => {
    fetchGroups();
    loadUserCircles();
  }, []);

  return (
    <div className="getGroup">
      {/* ---------- Page Header ---------- */}
      <header className="page-header">
        <div className="page-header-text">
          <h1>Decision Circles</h1>
          <p>Manage the circles you've created and explore others you belong to.</p>
        </div>
        <Link to="/decision-circle/add" className="btn-primary">
          <MdOutlineAddCircleOutline className="btn-icon" />
          New Decision Circle
        </Link>
      </header>

      {/* ---------- My Circles ---------- */}
      <section className="circle-section">
        <div className="section-title">
          <MdGroups className="section-icon" />
          <h2>Created by Me</h2>
          {groups.length > 0 && <span className="count-badge">{groups.length}</span>}
        </div>

        {loading ? (
          <div className="skeleton-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="empty-state">
            <MdOutlineSearchOff className="empty-icon" />
            <h3>No decision circles yet</h3>
            <p>Create your first decision circle to get started.</p>
            <Link to="/decision-circle/add" className="btn-primary">
              <MdOutlineAddCircleOutline className="btn-icon" />
              Create Circle
            </Link>
          </div>
        ) : (
          <div className="card-grid">
            {groups.map((group) => (
              <article key={group.id} className="circle-card">
                <div className="card-top">
                  <div className="card-title-wrap">
                    <div className="avatar-badge">
                      {group.group_name?.charAt(0)?.toUpperCase() || 'G'}
                    </div>
                    <h3 className="card-title" title={group.group_name}>
                      {group.group_name}
                    </h3>
                  </div>
                  <div className="card-actions">
                    <button
                      type="button"
                      className="icon-btn icon-btn-edit"
                      title="Edit circle"
                      onClick={() => navigate(`/decision-circle/edit/${group.id}`)}
                    >
                      <MdEdit />
                    </button>
                    <button
                      type="button"
                      className="icon-btn icon-btn-delete"
                      title="Delete circle"
                      onClick={() => handleDeleteGroup(group.id)}
                    >
                      <MdDeleteForever />
                    </button>
                  </div>
                </div>

                <div className="card-divider" />

                <div className="card-footer">
                  <Link
                    to={`/decision-circle/view/${group.id}?group_name=${group.group_name}`}
                    className="icon-btn icon-btn-view"
                    title="View members"
                  >
                    <FaUsersViewfinder />
                  </Link>
                  <div className="footer-spacer" />
                  <Link
                    to={`/decision-circle/add/member/${group.group_name}?id=${group.id}`}
                    className="icon-btn icon-btn-add"
                    title="Add member"
                  >
                    <MdGroupAdd />
                  </Link>
                  <Link
                    to={`/decision-circle/view/${group.id}?group_name=${group.group_name}`}
                    className="icon-btn icon-btn-remove"
                    title="Remove member"
                  >
                    <MdGroupRemove />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ---------- Others' Circles ---------- */}
      <section className="circle-section">
        <div className="section-title">
          <HiOutlineUsers className="section-icon" />
          <h2>Shared With Me</h2>
          {userCircles.length > 0 && <span className="count-badge">{userCircles.length}</span>}
        </div>

        {userCircles.length === 0 ? (
          <div className="empty-state empty-state-sm">
            <MdOutlineSearchOff className="empty-icon" />
            <h3>No shared circles</h3>
            <p>Circles others share with you will appear here.</p>
          </div>
        ) : (
          <div className="list-grid">
            {userCircles.map((circle) => (
              <article key={circle.id} className="shared-card">
                <div className="shared-avatar">
                  {circle.group_name?.charAt(0)?.toUpperCase() || 'G'}
                </div>
                <div className="shared-body">
                  <h3 className="shared-title" title={circle.group_name}>
                    {circle.group_name}
                  </h3>
                  <p className="shared-admin">
                    <FaUserShield className="admin-icon" />
                    Admin · {circle.created_by}
                  </p>
                </div>
                <Link
                  to={`/decision-circle/shared-with-me/${circle.id}?group_name=${circle.group_name}`}
                  className="icon-btn icon-btn-view"
                  title="View members"
                >
                  <FaUsersViewfinder />
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <ToastContainer position="top-right" theme="colored" />
    </div>
  );
};

export default GetGroup;