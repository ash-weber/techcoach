import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import withAuth from "../../../utils/withAuth";
import {
  getUserListForInnerCircle,
  innerCircleCreation,
} from "../../../api/InnerCircle/Network_Call";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  MdOutlineGroups,
  MdOutlinePersonAdd,
  MdOutlinePersonRemove,
  MdOutlineSearch,
  MdOutlineCheckCircle,
  MdOutlineArrowBack,
  MdOutlinePeople,
  MdOutlineClose,
} from "react-icons/md";
import { CircularProgress } from "@mui/material";
import "../../../assets/styles/pages/Decision.css";

const MIN_LOCAL_PART_CHARS = 3;
const MIN_LOCAL_PART_RATIO = 0.6;

const InnerGroup = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [availableDomains, setAvailableDomains] = useState([]);

  const queryParams = new URLSearchParams(location.search);
  const type_of_group = queryParams.get("type_of_group");

  /* ---------------- Fetch users ---------------- */
  useEffect(() => {
    const fetchNames = async () => {
      try {
        const data = await getUserListForInnerCircle();
        const list = Array.isArray(data) ? data : [];

        setUsers(list);

        const domains = [
          ...new Set(
            list
              .map((u) => u.email?.split("@")[1]?.toLowerCase())
              .filter(Boolean),
          ),
        ].sort();

        setAvailableDomains(domains);
      } catch (error) {
        console.error("Error fetching user list:", error);
        toast.error("Failed to load users");
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
        : [...prev, user],
    );
  };

  const handleSearchInputChange = (e) => {
    const raw = e.target.value;
    const lower = raw.toLowerCase();

    if (lower.includes("@")) {
      const domainPart = lower.split("@")[1]?.trim();

      if (domainPart && availableDomains.includes(domainPart)) {
        setSelectedDomain(domainPart);
      }
    }

    setSearchQuery(lower);
  };

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    // Don't display all users initially
    if (!q) return [];

    const [typedLocal, typedDomain] = q.split("@");
    const domainFilter = typedDomain || selectedDomain;

    return users.filter((u) => {
      if (!u.email) return false;

      const email = u.email.toLowerCase();
      const [localPart, emailDomain] = email.split("@");

      if (domainFilter && emailDomain !== domainFilter) {
        return false;
      }

      const required = Math.max(
        MIN_LOCAL_PART_CHARS,
        Math.ceil(localPart.length * MIN_LOCAL_PART_RATIO),
      );

      const typed = typedLocal || "";

      return typed.length >= required && localPart.startsWith(typed);
    });
  }, [searchQuery, selectedDomain, users]);

  /* ---------------- Submit ---------------- */
  const handleSubmit = async () => {
    if (selectedUsers.length === 0) {
      return toast.error("No users selected.");
    }

    setSubmitting(true);
    try {
      const groupData = {
        type_of_group,
        members: selectedUsers.map((user) => ({ user_id: user.user_id })),
      };

      const response = await innerCircleCreation(groupData);
      if (response?.status === 200) {
        toast.success("Inner circle created successfully!");
        navigate("/inner-circle");
      }
    } catch (error) {
      console.error("Error creating inner circle:", error);
      toast.error("Failed to create inner circle");
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
        style={{ background: "transparent", border: "none", cursor: "pointer" }}
      >
        <MdOutlineArrowBack /> Back
      </button>

      {/* ---------- Header ---------- */}
      <header className="dc-group-header">
        <div className="dc-group-header__main">
          <div className="dc-group-header__avatar">
            <MdOutlineGroups />
          </div>
          <div>
            <h1 className="dc-group-header__title">Create Inner Circle</h1>
            <p className="dc-group-header__subtitle">
              <MdOutlinePeople /> Pick the people you trust most
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
            <span className="dc-section__count">{filteredUsers.length}</span>
          </h2>

          <div className="form-group">
            <label htmlFor="domain-select">Filter by domain</label>

            <select
              id="domain-select"
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="dc-form"
              style={{ width: "100%", padding: "10px" }}
            >
              <option value="">All domains</option>

              {availableDomains.map((domain) => (
                <option key={domain} value={domain}>
                  @{domain}
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
                  ? `Type at least 60% of the email name to see matches${
                      selectedDomain ? ` in @${selectedDomain}` : ""
                    }.`
                  : "Start typing an email address to find members."}
              </p>
            </div>
          ) : (
            <ul className="dc-user-list">
              {filteredUsers.map((user) => {
                const selected = isSelected(user.user_id);
                return (
                  <li
                    key={user.user_id}
                    className={`dc-user-row ${selected ? "dc-user-row--selected" : ""}`}
                    onClick={() => toggleUser(user)}
                  >
                    <div className="dc-member-chip__avatar">
                      {user.displayname?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="dc-user-row__info">
                      <span className="dc-user-row__name">
                        {user.displayname}
                      </span>
                      <span className="dc-user-row__email">{user.email}</span>
                    </div>
                    <button
                      type="button"
                      className={`dc-user-row__btn ${
                        selected ? "dc-user-row__btn--selected" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleUser(user);
                      }}
                      aria-label={selected ? "Remove member" : "Add member"}
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
                    {user.displayname?.charAt(0)?.toUpperCase() || "U"}
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
                      {user.displayname?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="dc-user-row__info">
                      <span className="dc-user-row__name">
                        {user.displayname}
                      </span>
                      <span className="dc-user-row__email">{user.email}</span>
                    </div>
                    <button
                      type="button"
                      className="dc-selected-item__remove"
                      onClick={() => toggleUser(user)}
                      title={`Remove ${user.displayname}`}
                    >
                      <MdOutlineClose />
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
                    <CircularProgress size={16} style={{ color: "#fff" }} />
                  ) : (
                    <>
                      <MdOutlineCheckCircle /> Create Inner Circle
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

export default withAuth(InnerGroup);
