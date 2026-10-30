import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import withAuth from '../../utils/withAuth';
import {
  getUserListForDecisionCircle,
  sendDecisionCircleInvitation,
} from '../../api/DecisionCircle/Network_Call';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  MdOutlineGroups,
  MdOutlinePersonAdd,
  MdOutlinePersonRemove,
  MdOutlineSearch,
  MdOutlinePublic,
  MdOutlineCheckCircle,
  MdOutlineArrowBack,
  MdOutlinePeople,
} from 'react-icons/md';
import { CircularProgress } from '@mui/material';
import '../../assets/styles/pages/Decision.css';
import '../../assets/styles/pages/DecisionCircle.css';

const MIN_LOCAL_PART_CHARS = 3;
const MIN_LOCAL_PART_RATIO = 0.6;

const DecisionGroup = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [availableDomains, setAvailableDomains] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  /* ---------------- Fetch users ---------------- */
  useEffect(() => {
    const fetchNames = async () => {
      try {
        const data = await getUserListForDecisionCircle();
        const list = Array.isArray(data) ? data : [];
        setUsers(list);

        const domains = [
          ...new Set(
            list
              .map((u) => u.email?.split('@')[1]?.toLowerCase())
              .filter(Boolean)
          ),
        ].sort();
        setAvailableDomains(domains);
      } catch (error) {
        console.error('Error fetching user list:', error);
        toast.error('Failed to load users');
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchNames();
  }, []);

  /* ---------------- Selection ---------------- */
  const isSelected = (userId) =>
    selectedUsers.some((u) => u.user_id === userId);

  const toggleUser = (user) => {
    setSelectedUsers((prev) =>
      prev.some((u) => u.user_id === user.user_id)
        ? prev.filter((u) => u.user_id !== user.user_id)
        : [...prev, user]
    );
  };

  /* ---------------- Filtering ---------------- */
  const handleSearchInputChange = (e) => {
    const raw = e.target.value;
    const lower = raw.toLowerCase();

    if (lower.includes('@')) {
      const domainPart = lower.split('@')[1]?.trim();
      if (domainPart && availableDomains.includes(domainPart)) {
        setSelectedDomain(domainPart);
      }
    }
    setSearchQuery(lower);
  };

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const [typedLocal, typedDomain] = q.split('@');
    const domainFilter = typedDomain || selectedDomain;

    return users.filter((u) => {
      if (!u.email) return false;
      const email = u.email.toLowerCase();
      const [localPart, emailDomain] = email.split('@');

      if (domainFilter && emailDomain !== domainFilter) return false;

      const required = Math.max(
        MIN_LOCAL_PART_CHARS,
        Math.ceil(localPart.length * MIN_LOCAL_PART_RATIO)
      );
      const typed = typedLocal || '';
      return typed.length >= required && localPart.startsWith(typed);
    });
  }, [searchQuery, selectedDomain, users]);

  /* ---------------- Submit ---------------- */
  const handleSubmit = async () => {
    if (!id) return toast.error('Group ID is not specified.');
    if (selectedUsers.length === 0) return toast.error('No users selected.');

    const members = selectedUsers.map((u) => u.user_id);
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('user_id');

      if (!userId) {
        setSubmitting(false);
        return toast.error('User ID is not available.');
      }

      await axios.post(
        `${process.env.REACT_APP_API_URL}/group/decisionCircleCreation`,
        {
          created_by: userId,
          type_of_group: 'decision_circle',
          group_name: id,
          members,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Decision circle created successfully!');

      for (const user of selectedUsers) {
        try {
          await sendDecisionCircleInvitation(user.email);
          toast.success(`Invitation sent to ${user.email} successfully`);
        } catch (err) {
          toast.error(`Failed to invite ${user.email}`);
          console.error(err);
        }
      }

      navigate('/decision-circle');
    } catch (error) {
      toast.error('Error creating decision circle');
      console.error(
        'Error creating decision circle:',
        error.response ? error.response.data : error.message
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- Render ---------------- */
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

      {/* ---------- Header ---------- */}
      <header className="dc-group-header">
        <div className="dc-group-header__main">
          <div className="dc-group-header__avatar">
            {id?.charAt(0)?.toUpperCase() || 'G'}
          </div>
          <div>
            <h1 className="dc-group-header__title">{id || 'New Decision Circle'}</h1>
            <p className="dc-group-header__subtitle">
              <MdOutlineGroups /> Select members to invite
            </p>
          </div>
        </div>
        {selectedUsers.length > 0 && (
          <span className="decision-tag dc-tag-success">
            <MdOutlineCheckCircle /> {selectedUsers.length} selected
          </span>
        )}
      </header>

      {/* ---------- Two-column layout ---------- */}
      <div className="dc-two-col">
        {/* ------- Left: Available users ------- */}
        <section className="dc-section dc-panel">
          <h2 className="dc-section__title">
            <MdOutlinePeople className="dc-section__icon" />
            Available Members
            {filteredUsers.length > 0 && (
              <span className="dc-section__count">{filteredUsers.length}</span>
            )}
          </h2>

          {/* Domain picker */}
          <div className="form-group">
            <label htmlFor="domain-select">
              <MdOutlinePublic style={{ verticalAlign: 'middle' }} /> Filter by domain
            </label>
            <select
              id="domain-select"
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="dc-form .form-group input"
              style={{
                width: '100%',
                padding: '0.65rem 0.875rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--surface-border)',
                background: 'var(--surface-card)',
                color: 'var(--text-main)',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--font-size-base)',
                boxSizing: 'border-box',
              }}
            >
              <option value="">All domains</option>
              {availableDomains.map((d) => (
                <option key={d} value={d}>
                  @{d}
                </option>
              ))}
            </select>
          </div>

          {/* Search box */}
          <div className="dc-search">
            <MdOutlineSearch className="dc-search__icon" />
            <input
              className="dc-search__input"
              type="text"
              placeholder="Search by email…"
              value={searchQuery}
              onChange={handleSearchInputChange}
            />
          </div>

          {/* User list */}
          {loadingUsers ? (
            <div className="dc-loading">
              <CircularProgress size={28} />
              <p>Loading users…</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="dc-empty">
              <MdOutlineSearch className="dc-empty__icon" />
              <p>
                {searchQuery.trim()
                  ? `Type at least 60% of the name to see matches${
                      selectedDomain ? ` in @${selectedDomain}` : ''
                    }.`
                  : 'Start typing to find members.'}
              </p>
            </div>
          ) : (
            <ul className="dc-user-list">
              {filteredUsers.map((user) => {
                const selected = isSelected(user.user_id);
                return (
                  <li
                    key={user.user_id}
                    className={`dc-user-row ${selected ? 'dc-user-row--selected' : ''}`}
                    onClick={() => toggleUser(user)}
                  >
                    <div className="dc-member-chip__avatar">
                      {user.displayname?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="dc-user-row__info">
                      <span className="dc-user-row__name">{user.displayname}</span>
                      <span className="dc-user-row__email">{user.email}</span>
                    </div>
                    <button
                      type="button"
                      className={`dc-user-row__btn ${
                        selected ? 'dc-user-row__btn--selected' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleUser(user);
                      }}
                      aria-label={selected ? 'Remove member' : 'Add member'}
                    >
                      {selected ? (
                        <MdOutlinePersonRemove />
                      ) : (
                        <MdOutlinePersonAdd />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* ------- Right: Selected users ------- */}
        <aside className="dc-section dc-panel">
          <h2 className="dc-section__title">
            <MdOutlineGroups className="dc-section__icon" />
            Selected
            <span className="dc-section__count">{selectedUsers.length}</span>
          </h2>

          {selectedUsers.length === 0 ? (
            <div className="dc-empty">
              <MdOutlineGroups className="dc-empty__icon" />
              <p>No members selected yet.</p>
            </div>
          ) : (
            <>
              {/* Avatar stack */}
              <div className="dc-avatar-stack">
                {selectedUsers.slice(0, 5).map((user, index) => (
                  <div
                    key={user.user_id}
                    className="dc-avatar-stack__item"
                    style={{ zIndex: selectedUsers.length - index }}
                    title={user.displayname}
                  >
                    {user.displayname?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                ))}
                {selectedUsers.length > 5 && (
                  <div className="dc-avatar-stack__more">
                    +{selectedUsers.length - 5}
                  </div>
                )}
              </div>

              {/* Selected list */}
              <ul className="dc-selected-list">
                {selectedUsers.map((user) => (
                  <li key={user.user_id} className="dc-selected-item">
                    <div className="dc-member-chip__avatar">
                      {user.displayname?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="dc-user-row__info">
                      <span className="dc-user-row__name">{user.displayname}</span>
                      <span className="dc-user-row__email">{user.email}</span>
                    </div>
                    <button
                      type="button"
                      className="dc-selected-item__remove"
                      onClick={() => toggleUser(user)}
                      title={`Remove ${user.displayname}`}
                    >
                      <MdOutlinePersonRemove />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="dc-panel__footer">
                <button
                  type="button"
                  className="decision-btn decision-btn--primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <CircularProgress size={16} style={{ color: '#fff' }} />
                  ) : (
                    <>
                      <MdOutlineCheckCircle /> Create & Invite
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </aside>
      </div>

      <ToastContainer position="top-right" theme="colored" />
    </div>
  );
};

export default withAuth(DecisionGroup);