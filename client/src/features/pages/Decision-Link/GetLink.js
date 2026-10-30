import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { TiDelete } from "react-icons/ti";
import { toast, ToastContainer } from 'react-toastify';
import withAuth from '../../../utils/withAuth';
import BubbleChart from '../../Decision/Table/BubbleChart';
import '../../../assets/styles/pages/Profile.css'; 

const GetLink = () => {
  const [profiles, setProfiles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [filteredData, setFilteredData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleBubbleClick = (data) => {
    setFilteredData(data.metadata);
  };

  const fetchProfiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/links`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfiles(response.data.profiles);
    } catch (err) {
      console.error('Error fetching profiles:', err);
    }
  };

  const fetchSkills = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/link`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSkills(response.data.skills);
    } catch (err) {
      console.error('Error fetching skills:', err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchProfiles(), fetchSkills()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  const filterProfiles = () => {
    if (!filteredData) return profiles;
    return profiles.filter(
      (profile) =>
        profile.header_name === filteredData.header_name &&
        profile.header_value === filteredData.header_value
    );
  };

  const filterSkills = () => {
    if (!filteredData) return skills;
    return skills.filter((skill) => skill.skill_name === filteredData.skill_name);
  };

  const handleDeleteSwot = async (decision_id) => {
    if (window.confirm('Are you sure that you want to delete this decision-link?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/links/${decision_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Decision-SWOT-link deleted successfully');
        fetchProfiles();
        setFilteredData(null);
      } catch (error) {
        console.error('Error deleting decision-link:', error);
        toast.error('An error occurred while deleting the decision-link');
      }
    }
  };

  const handleDeleteSkill = async (decision_id) => {
    if (window.confirm('Are you sure that you want to delete this decision-link?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/link/${decision_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Decision-Skill-link deleted successfully');
        fetchSkills();
        setFilteredData(null);
      } catch (error) {
        console.error('Error deleting decision-link:', error);
        toast.error('An error occurred while deleting the decision-link');
      }
    }
  };

  const getSwotClass = (headerName) => {
    switch (headerName) {
      case 'Strength': return 'strength';
      case 'Weakness': return 'weakness';
      case 'Opportunity': return 'opportunity';
      case 'Threat': return 'threat';
      default: return 'attitude';
    }
  };

  if (loading) {
    return (
      <div className="card1">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card1">
      <BubbleChart onBubbleClick={handleBubbleClick} />

      <div className="swot-container">
        <div className="swot-header">
          <div>
            <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>
              Profiles
            </h3>
            <p className="swot-desc" style={{ marginTop: 'var(--space-sm)' }}>
              Your decision links grouped by SWOT profile categories.
            </p>
          </div>
          <Link to="/decision" className="swot-link">
            + Add Decisions
          </Link>
        </div>

        {filterProfiles().length === 0 ? (
          <div className="no-profile-data">No profile links found.</div>
        ) : (
          <div className="swot-grid">
            {filterProfiles().map((profile, index) => (
              <div
                key={index}
                className={`swot-card ${getSwotClass(profile.header_name)}`}
              >
                <h4>{profile.header_name}</h4>
                <div className="profile-line">
                  <strong>SWOT value:</strong> {profile.header_value}
                </div>
                <div className="profile-line" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>
                    <strong>Decision:</strong> {profile.decision_name}
                  </span>
                  <TiDelete
                    className="fs-4"
                    style={{ cursor: 'pointer', color: 'var(--danger)', flexShrink: 0 }}
                    onClick={() => handleDeleteSwot(profile.decision_id)}
                    title="Delete link"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="swot-container">
        <div className="swot-header">
          <div>
            <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>
              Soft Skills
            </h3>
            <p className="swot-desc" style={{ marginTop: 'var(--space-sm)' }}>
              Your decision links associated with soft skills.
            </p>
          </div>
        </div>

        {filterSkills().length === 0 ? (
          <div className="no-profile-data">No soft skill links found.</div>
        ) : (
          <div className="swot-grid">
            {filterSkills().map((skill, index) => (
              <div key={index} className="swot-card attitude">
                <h4>{skill.skill_name}</h4>
                <div
                  className="profile-line"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span>
                    <strong>Decision:</strong> {skill.decision_name}
                  </span>
                  <TiDelete
                    className="fs-4"
                    style={{ cursor: 'pointer', color: 'var(--danger)', flexShrink: 0 }}
                    onClick={() => handleDeleteSkill(skill.decision_id)}
                    title="Delete link"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="profile-actions-container">
        <div className="action-buttons">
          <Link to="/decision" className="action-btn download-btn" style={{ textDecoration: 'none' }}>
            ← Go back &amp; Add Decisions
          </Link>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default withAuth(GetLink);