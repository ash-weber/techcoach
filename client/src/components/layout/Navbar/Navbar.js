import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import tech from "../../../assets/images/logo.png";
import { getInnerCircleAcceptNotification } from "../../../features/Group/Network_Call";
import "../../../assets/styles/components/Navbar.css";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notAcceptedMembersCount, setNotAcceptedMembersCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setIsLoggedIn(true);
      fetchUserType(token);
    } else {
      setIsLoggedIn(false);
      setIsAdmin(false);
    }
  }, [location.pathname, location.search]);

  const fetchUserType = async (token) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/type`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setIsAdmin(response.data.isAdmin || false);
    } catch (error) {
      console.error("Error fetching User type:", error);
      if (error.response && error.response.status === 401) {
        toast.error("Session timed out. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        setIsLoggedIn(false);
        navigate("/");
      }
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getInnerCircleAcceptNotification();
        if (response && response.notAcceptedMembers && response.groupDetails) {
          const count = response.notAcceptedMembers.filter(
            (member) =>
              response.groupDetails[member.group_id] &&
              response.groupDetails[member.group_id].userDetails !== null,
          ).length;
          setNotAcceptedMembersCount(count);
        }
      } catch (err) {
        console.error("Failed to load inner circle notifications", err);
      }
    };

    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <header className="app-header">
      <nav className="app-navbar">
        <Link to={isLoggedIn ? "/dashboard" : "/"} className="brand-container">
          <img src={tech} alt="Decision Coach Logo" className="brand-logo" />
          <span className="brand-title">Decision Coach</span>
        </Link>

        <button
          className="nav-toggle-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={mobileMenuOpen}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            {mobileMenuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <div className={`nav-menu-collapse ${mobileMenuOpen ? "open" : ""}`}>
          <ul className="nav-links-list">
            {isLoggedIn ? (
              <>
                {isAdmin && (
                  <li>
                    <NavLink
                      to="/admin"
                      className={({ isActive }) =>
                        `nav-item-link admin-link ${isActive ? "active" : ""}`
                      }
                    >
                      Admin
                    </NavLink>
                  </li>
                )}
                <li>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `nav-item-link ${isActive ? "active" : ""}`
                    }
                  >
                    Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/readd"
                    className={({ isActive }) =>
                      `nav-item-link ${isActive ? "active" : ""}`
                    }
                  >
                    Decision
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/getdecisioncircle"
                    className={({ isActive }) =>
                      `nav-item-link ${isActive ? "active" : ""}`
                    }
                  >
                    Decision Circle
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/innerCircleDisplay"
                    className={({ isActive }) =>
                      `nav-item-link ${isActive ? "active" : ""}`
                    }
                  >
                    Inner Circle
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/notification"
                    className={({ isActive }) =>
                      `nav-item-link ${isActive ? "active" : ""}`
                    }
                  >
                    Notifications
                    {notAcceptedMembersCount > 0 && (
                      <span className="notification-badge">
                        {notAcceptedMembersCount}
                      </span>
                    )}
                  </NavLink>
                </li>
                <li>
                  <a
                    href="http://decisioncoach.techcoach4u.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-item-link"
                  >
                    Guide
                  </a>
                </li>
                <li>
                  <a
                    href="https://decision-coach-insights.onrender.com/login"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-item-link"
                  >
                    Insights
                  </a>
                </li>

                <li className="profile-dropdown" ref={dropdownRef}>
                  <button
                    className={`nav-item-link dropdown-toggle-btn ${profileDropdownOpen ? "active" : ""}`}
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    aria-haspopup="true"
                    aria-expanded={profileDropdownOpen}
                    style={{ marginTop: 0 }}
                  >
                    <span>Profile</span>
                    <svg
                      className={`chevron-icon ${profileDropdownOpen ? "rotated" : ""}`}
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  <ul
                    className={`profile-dropdown-menu ${profileDropdownOpen ? "show" : ""}`}
                  >
                    <li>
                      <Link to="/profile" className="dropdown-link">
                        Account Profile
                      </Link>
                    </li>
                    <li>
                      <Link to="/advancedProfile" className="dropdown-link">
                        Advanced Profile
                      </Link>
                    </li>
                    <li>
                      <Link to="/skillget" className="dropdown-link">
                        Soft Skills
                      </Link>
                    </li>
                    <li className="dropdown-divider"></li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="dropdown-link logout-btn"
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `nav-item-link ${isActive ? "active" : ""}`
                  }
                >
                  Home
                </NavLink>
              </li>
            )}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
