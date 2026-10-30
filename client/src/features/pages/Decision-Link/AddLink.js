import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import withAuth from '../../../utils/withAuth';
import { IoIosInformationCircle } from "react-icons/io";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom';
import '../../../assets/styles/pages/Profile.css';

const CheckboxGroup = ({ title, items = [], prefix, onChange, selected = [] }) => {
  const [open, setOpen] = useState(true);
  if (!items || items.length === 0) return null;

  return (
    <div className="AdvancedTable form-section" style={{ borderBottom: '1px dashed var(--border-color)' }}>
      <div className="section-header" style={{ cursor: 'pointer' }} onClick={() => setOpen(!open)}>
        <h6 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          {title}
          <span style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-muted)',
            fontWeight: 500,
            textTransform: 'none',
            letterSpacing: 0,
          }}>
            ({items.length})
          </span>
        </h6>
        <span style={{ color: 'var(--primary)' }}>
          {open ? <FiChevronUp /> : <FiChevronDown />}
        </span>
      </div>

      {open && (
        <div className="form-section-body" style={{ marginTop: 'var(--space-md)' }}>
          {items.map((item) => {
            const id = `${prefix}-${item.id ?? item.header_id}`;
            const value = String(item.id ?? item.header_id);
            const isChecked = selected.includes(value);
            return (
              <label
                key={id}
                htmlFor={id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  padding: 'var(--space-xs) var(--space-sm)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  background: isChecked ? 'var(--primary-light)' : 'transparent',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-main)',
                  transition: 'var(--transition-fast)',
                }}
              >
                <input
                  type="checkbox"
                  id={id}
                  value={value}
                  checked={isChecked}
                  onChange={onChange}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <span>{item.value ?? item.header_name}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SectionCard = ({
  accent, 
  title,
  description,
  expanded,
  onToggle,
  selectedCount,
  onSave,
  saveLabel,
  children,
}) => (
  <div className={`swot-container`}>
    <div className="swot-header">
      <div>
        <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>
          {title}
        </h3>
        <p className="swot-desc" style={{ marginTop: 'var(--space-sm)' }}>
          {description}
        </p>
      </div>
      <button type="button" className="swot-link" onClick={onToggle} style={{ cursor: 'pointer', background: expanded ? 'var(--primary)' : undefined, color: expanded ? 'var(--text-inverse)' : undefined }}>
        {expanded ? 'Hide options' : 'Select items'}
      </button>
    </div>

    {expanded && (
      <div style={{ marginTop: 'var(--space-lg)' }}>{children}</div>
    )}

    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 'var(--space-md)',
        marginTop: 'var(--space-lg)',
        paddingTop: 'var(--space-lg)',
        borderTop: '1px solid var(--border-color)',
        flexWrap: 'wrap',
      }}
    >
      <span className="status-active" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
        {selectedCount} selected
      </span>
      <button
        type="button"
        className="save-AdvancedProfilebutton"
        disabled={selectedCount === 0}
        onClick={onSave}
      >
        {saveLabel}
      </button>
    </div>
  </div>
);

const AddLink = () => {
  const [profiles, setProfiles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [advancedProfiles, setAdvancedProfiles] = useState([]);
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedAdvancedProfiles, setSelectedAdvancedProfiles] = useState([]);
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [showSkillOptions, setShowSkillOptions] = useState(false);
  const [showAdvancedProfiles, setShowAdvancedProfiles] = useState(false);
  const [attitude, setAttitude] = useState([]);
  const [strength, setStrength] = useState([]);
  const [weakness, setWeakness] = useState([]);
  const [opportunity, setOpportunity] = useState([]);
  const [threat, setThreat] = useState([]);
  const [goals, setGoals] = useState([]);
  const [values, setValues] = useState([]);
  const [resolutions, setResolutions] = useState([]);
  const [constraints, setConstraints] = useState([]);
  const [otherfactors, setOtherfactors] = useState([]);
  const [loading, setLoading] = useState(true);

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const decision_name = params.get('name');

  const fetchProfiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/data`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfiles(Array.isArray(response.data.profiles) ? response.data.profiles : []);
      setAttitude(Array.isArray(response.data.attitude) ? response.data.attitude : []);
      setStrength(Array.isArray(response.data.strength) ? response.data.strength : []);
      setWeakness(Array.isArray(response.data.weakness) ? response.data.weakness : []);
      setOpportunity(Array.isArray(response.data.opportunity) ? response.data.opportunity : []);
      setThreat(Array.isArray(response.data.threat) ? response.data.threat : []);
    } catch (err) { console.log(err); }
  };

  const fetchAdvancedProfiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/data/advanced`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdvancedProfiles(Array.isArray(response.data.advancedProfiles) ? response.data.advancedProfiles : []);
      setGoals(Array.isArray(response.data.goals) ? response.data.goals : []);
      setValues(Array.isArray(response.data.values) ? response.data.values : []);
      setResolutions(Array.isArray(response.data.resolutions) ? response.data.resolutions : []);
      setConstraints(Array.isArray(response.data.constraints) ? response.data.constraints : []);
      setOtherfactors(Array.isArray(response.data.otherfactors) ? response.data.otherfactors : []);
    } catch (error) { console.log(error); }
  };

  const fetchSkills = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/skill/get`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSkills(response.data.skills || []);
    } catch (err) { console.log(err); }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchProfiles(), fetchAdvancedProfiles(), fetchSkills()]);
      setLoading(false);
    };
    loadAll();
  }, [id]);

  const toggle = (setter, value) =>
    setter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );

  const handleProfileChange = (e) => toggle(setSelectedProfiles, e.target.value);
  const handleAdvancedProfileChange = (e) => toggle(setSelectedAdvancedProfiles, e.target.value);
  const handleSkillChange = (e) => toggle(setSelectedSkills, e.target.value);

  const handleProfileSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/links`,
        { v_ids: selectedProfiles, decision_id: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('SWOT links saved');
      navigate('/profile/linked-decision');
    } catch (err) { toast.error('Error saving SWOT links'); }
  };

  const handleAdvancedProfileSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/link/advancedLink`,
        { v_ids: selectedAdvancedProfiles, decision_id: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Advanced profile links saved');
      navigate('/profile/linked-decision');
    } catch (err) { toast.error('Error saving advanced profile links'); }
  };

  const handleSkillSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/link`,
        { skill_ids: selectedSkills, decision_id: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Skill links saved');
      navigate('/profile/linked-decision');
    } catch (err) { toast.error('Error saving skill links'); }
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
    <div className="card1 addlink-page">
      <div className="profile-top-section" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="profile-basic-info">
          <h3 className="profile-name">
            {decision_name || 'Link Data'}
          </h3>
        </div>
        <div className="profile-action-container">
          <Link to="/profile/linked-decision" className="linked-decisions-btn">
            View linked decisions →
          </Link>
        </div>
      </div>

      <div
        style={{
          background: 'var(--primary-light)',
          borderLeft: '4px solid var(--primary)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-md) var(--space-lg)',
          display: 'flex',
          gap: 'var(--space-sm)',
          alignItems: 'flex-start',
          marginBottom: 'var(--space-xl)',
          color: 'var(--text-main)',
          fontSize: 'var(--font-size-base)',
        }}
      >
        <IoIosInformationCircle className="fs-4" style={{ color: 'var(--primary)', flexShrink: 0 }} />
        <span>
          Expand any card below to select the data you want to link to this decision.
          Your selection is saved per card.
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
        <SectionCard
          accent="blue"
          title="SWOT Profile"
          description="Link strengths, weaknesses, opportunities, threats, attitudes and profile headers."
          expanded={showProfileOptions}
          onToggle={() => setShowProfileOptions(!showProfileOptions)}
          selectedCount={selectedProfiles.length}
          onSave={handleProfileSubmit}
          saveLabel="Save SWOT links"
        >
          <div style={{ maxHeight: '480px', overflowY: 'auto', paddingRight: 'var(--space-sm)' }}>
            <CheckboxGroup title="Attitude" items={attitude} prefix="att" onChange={handleProfileChange} selected={selectedProfiles} />
            <CheckboxGroup title="Strength" items={strength} prefix="str" onChange={handleProfileChange} selected={selectedProfiles} />
            <CheckboxGroup title="Weakness" items={weakness} prefix="wk" onChange={handleProfileChange} selected={selectedProfiles} />
            <CheckboxGroup title="Opportunity" items={opportunity} prefix="op" onChange={handleProfileChange} selected={selectedProfiles} />
            <CheckboxGroup title="Threat" items={threat} prefix="thr" onChange={handleProfileChange} selected={selectedProfiles} />
            <CheckboxGroup title="Profile headers" items={profiles} prefix="prof" onChange={handleProfileChange} selected={selectedProfiles} />
          </div>
        </SectionCard>

        <SectionCard
          accent="purple"
          title="Advanced Profile"
          description="Link goals, values, resolutions, constraints, other factors and advanced profile headers."
          expanded={showAdvancedProfiles}
          onToggle={() => setShowAdvancedProfiles(!showAdvancedProfiles)}
          selectedCount={selectedAdvancedProfiles.length}
          onSave={handleAdvancedProfileSubmit}
          saveLabel="Save advanced links"
        >
          <div style={{ maxHeight: '480px', overflowY: 'auto', paddingRight: 'var(--space-sm)' }}>
            <CheckboxGroup title="Goals" items={goals} prefix="goal" onChange={handleAdvancedProfileChange} selected={selectedAdvancedProfiles} />
            <CheckboxGroup title="Values" items={values} prefix="val" onChange={handleAdvancedProfileChange} selected={selectedAdvancedProfiles} />
            <CheckboxGroup title="Resolutions" items={resolutions} prefix="res" onChange={handleAdvancedProfileChange} selected={selectedAdvancedProfiles} />
            <CheckboxGroup title="Constraints" items={constraints} prefix="con" onChange={handleAdvancedProfileChange} selected={selectedAdvancedProfiles} />
            <CheckboxGroup title="Other factors" items={otherfactors} prefix="oth" onChange={handleAdvancedProfileChange} selected={selectedAdvancedProfiles} />
            <CheckboxGroup title="Advanced profiles" items={advancedProfiles} prefix="aprof" onChange={handleAdvancedProfileChange} selected={selectedAdvancedProfiles} />
          </div>
        </SectionCard>

        <SectionCard
          accent="green"
          title="Soft Skills"
          description="Link skills with ratings, comments and descriptions to this decision."
          expanded={showSkillOptions}
          onToggle={() => setShowSkillOptions(!showSkillOptions)}
          selectedCount={selectedSkills.length}
          onSave={handleSkillSubmit}
          saveLabel="Save skill links"
        >
          <div style={{ maxHeight: '480px', overflowY: 'auto', paddingRight: 'var(--space-sm)' }}>
            {skills.length === 0 ? (
              <div className="no-profile-data">No skills found.</div>
            ) : (
              skills.map((skill) => {
                const skillId = `skill-${skill.skill_id}`;
                const checked = selectedSkills.includes(String(skill.skill_id));
                return (
                  <label
                    key={skillId}
                    htmlFor={skillId}
                    className="swot-card attitude"
                    style={{
                      display: 'flex',
                      gap: 'var(--space-md)',
                      alignItems: 'flex-start',
                      cursor: 'pointer',
                      marginBottom: 'var(--space-sm)',
                      background: checked ? 'var(--primary-light)' : 'var(--bg-primary)',
                      borderLeftColor: checked ? 'var(--primary)' : 'var(--border-color)',
                    }}
                  >
                    <input
                      type="checkbox"
                      id={skillId}
                      value={skill.skill_id}
                      checked={checked}
                      onChange={handleSkillChange}
                      style={{ accentColor: 'var(--primary)', marginTop: '4px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: 'var(--text-main)', fontSize: 'var(--font-size-base)' }}>
                        {skill.skill_name}
                      </strong>
                      <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginTop: 'var(--space-xs)' }}>
                        <span className="status-active" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                          Rating: {skill.rating}
                        </span>
                        {skill.comments && (
                          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                            💬 {skill.comments}
                          </span>
                        )}
                      </div>
                      {skill.description && (
                        <p style={{ margin: 'var(--space-sm) 0 0', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                          {skill.description}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </SectionCard>
      </div>

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default withAuth(AddLink);