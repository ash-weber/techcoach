// import React, { useEffect, useState } from 'react';
// import './AddLink.css';
// import axios from 'axios';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import withAuth from '../../withAuth';
// import { useNavigate, Link, useParams,useLocation } from 'react-router-dom';

// const AddLink = () => {
//   const [profiles, setProfiles] = useState([]);
//   const [skills, setSkills] = useState([]);
//   const [selectedProfiles, setSelectedProfiles] = useState([]);
//   const [selectedSkills, setSelectedSkills] = useState([]);
//   const [showProfileOptions, setShowProfileOptions] = useState(false);
//   const [showSkillOptions, setShowSkillOptions] = useState(false);

//   const { id } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const params = new URLSearchParams(location.search);
//   const decision_name = params.get('name');


//   const fetchProfiles = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/data/master-profiles`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setProfiles(response.data.profiles);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const fetchSkills = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${process.env.REACT_APP_API_URL}/skill/master-skills`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setSkills(response.data.skills);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   useEffect(() => {
//     fetchProfiles();
//     fetchSkills();
//   }, [id]);

//   const handleSWOTClick = () => {
//     setShowProfileOptions(!showProfileOptions);
//   };

//   const handleSoftSkillClick = () => {
//     setShowSkillOptions(!showSkillOptions);
//   };

//   const handleProfileChange = (e) => {
//     const { value, checked } = e.target;
//     if (checked) {
//       setSelectedProfiles([...selectedProfiles, value]);
//     } else {
//       setSelectedProfiles(selectedProfiles.filter((id) => id !== value));
//     }
//   };

//   const handleSkillChange = (e) => {
//     const { value, checked } = e.target;
//     if (checked) {
//       setSelectedSkills([...selectedSkills, value]);
//     } else {
//       setSelectedSkills(selectedSkills.filter((id) => id !== value));
//     }
//   };

//   const handleProfileSubmit = async (event) => {
//     event.preventDefault();
//     try {
//       const token = localStorage.getItem('token');
//       await axios.post(`${process.env.REACT_APP_API_URL}/api/links`, {
//         v_ids: selectedProfiles,
//         decision_id: id,
//       }, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       toast.success("Profiles Linked Successfully");
//       navigate('/getall');
//     } catch (err) {
//       console.log(err);
//       toast.error("Error adding profile link");
//     }
//   };

//   const handleSkillSubmit = async (event) => {
//     event.preventDefault();
//     try {
//       const token = localStorage.getItem('token');
//       await axios.post(`${process.env.REACT_APP_API_URL}/api/link`, {
//         skill_ids: selectedSkills,
//         decision_id: id,
//       }, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       toast.success("Skill link added successfully");
//       navigate('/getall');
//     } catch (err) {
//       console.error('Error adding skill link:', err);
//       toast.error("Error adding skill link");
//     }
//   };

//   return (
//     <div className='addlink'>
//         <center>
//         <div className='bg-secondary text-white rounded p-2'>
//         <h4>{decision_name}</h4>
//         <input
//           type="text"
//           placeholder="Decision Name"
//           value={id}
//           readOnly
//         />
//         </div>
//         </center>
//       <div>
//         <div>
//           <button type="button" className='swot' onClick={handleSWOTClick}>SWOT Analysis</button>
//           {showProfileOptions && (
//             <div className='options'>
//               {profiles.map((profile) => (
//                 <div key={profile.header_id}>
//                   <label htmlFor={`profile-${profile.header_id}`}>
//                     <input
//                       type="checkbox"
//                       id={`profile-${profile.header_id}`}
//                       value={profile.header_id}
//                       onChange={handleProfileChange}
//                     />
//                     {profile.header_name}
//                   </label>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//         <button type='submit' onClick={handleProfileSubmit} className='savebtn'>Save SWOT Link</button>
//       </div>
//       <div>
//         <div>
//           <button type='button' className='soft-skill' onClick={handleSoftSkillClick}>Soft-Skills Analysis</button>
//           {showSkillOptions && (
//             <div className='options-container'>
//               {skills.map((skill) => (
//                 <div key={skill.skill_id}>
//                   <label htmlFor={`skill-${skill.skill_id}`}>
//                     <input
//                       type="checkbox"
//                       id={`skill-${skill.skill_id}`}
//                       value={skill.skill_id}
//                       onChange={handleSkillChange}
//                     />
//                     {skill.skill_name}
//                   </label>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//         <button type='submit' className='savebtn' onClick={handleSkillSubmit}>Save Soft-Skill Link</button>
//       </div>
//       <div>
//         <Link to='/getall'>
//           <button className='getpage'>
//             Go to GetLink Page
//           </button>
//         </Link>
//       </div>
//       <ToastContainer />
//     </div>
//   );
// };

// export default withAuth(AddLink);

/* 
import React, { useEffect, useState } from 'react';
import './AddLink.css';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import withAuth from '../../withAuth';
import { IoIosInformationCircle } from "react-icons/io";
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom';

const AddLink = () => {
  const [profiles, setProfiles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [advancedProfiles, setAdvancedProfiles] = useState([]);
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedAdvancedProfiles,setSelectedAdvancedProfiles] = useState([]);
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [showSkillOptions, setShowSkillOptions] = useState(false);
  const [showAdvancedProfiles,setShowAdvancedProfiles] = useState(false);
  const [attitude, setAttitude] = useState([]);
  const [strength, setStrength] = useState([]);
  const [weakness, setWeakness] = useState([]);
  const [opportunity, setOpportunity] = useState([]);
  const [threat, setThreat] = useState([]);
  const [goals,setGoals] = useState([]);
  const [values,setValues] = useState([]);
  const [resolutions,setResolutions] = useState([]);
  const [constraints,setConstraints] = useState([]);
  const [otherfactors,setOtherfactors] = useState([]);

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const decision_name = params.get('name');

  const fetchProfiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/data`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Ensure profiles is an array
      setProfiles(Array.isArray(response.data.profiles) ? response.data.profiles : []);
      setAttitude(Array.isArray(response.data.attitude) ? response.data.attitude : []);
      setStrength(Array.isArray(response.data.strength) ? response.data.strength : []);
      setWeakness(Array.isArray(response.data.weakness) ? response.data.weakness : []);
      setOpportunity(Array.isArray(response.data.opportunity) ? response.data.opportunity : []);
      setThreat(Array.isArray(response.data.threat) ? response.data.threat : []);
    } catch (err) {
      setProfiles([]);
      setAttitude([]);
      setStrength([]);
      setWeakness([]);
      setOpportunity([]);
      setThreat([]);
    }
  };

  const fecthAdvancedProfiles = async () =>{
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/data/advanced`,{
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setAdvancedProfiles(Array.isArray(response.data.advancedProfiles) ? response.data.advancedProfiles : []);
      setGoals(Array.isArray(response.data.goals) ? response.data.goals : []);
      setValues(Array.isArray(response.data.values) ? response.data.values : []);
      setResolutions(Array.isArray(response.data.resolutions) ? response.data.resolutions : []);
      setConstraints(Array.isArray(response.data.constraints) ? response.data.constraints : []);
      setOtherfactors(Array.isArray(response.data.otherfactors) ? response.data.otherfactors : []);
    } catch (error) {
      setAdvancedProfiles([]);
    }
  }

  const fetchSkills = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/skill/get`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSkills(response.data.skills || []);
      // setShowSkillOptions(true);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchProfiles();
    fecthAdvancedProfiles();
    fetchSkills();
  }, [id]);

  const handleSWOTClick = () => {
    setShowProfileOptions(!showProfileOptions);
  };

  const handleSoftSkillClick = () => {
    setShowSkillOptions(!showSkillOptions);
    if (!showSkillOptions) {
      fetchSkills();
    }
  };

  const handleAdvancedProfileClick = () =>{
    setShowAdvancedProfiles(!showAdvancedProfiles);
  }

  const handleProfileChange = (e) => {
    const { value, checked } = e.target;
    setSelectedProfiles((prev) =>
      checked ? [...prev, value] : prev.filter((id) => id !== value)
    );
  };

  const handleSkillChange = (e) => {
    const { value, checked } = e.target;
    setSelectedSkills((prev) =>
      checked ? [...prev, value] : prev.filter((id) => id !== value)
    );
  };

  const handleAdvancedProfileChange = (e) =>{
    const { value,checked } = e.target;
    setSelectedAdvancedProfiles((prev)=>
      checked ? [...prev, value] : prev.filter((id) => id !== value)
    )
  }

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/links`, {
        v_ids: selectedProfiles,
        decision_id: id,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Profiles Linked Successfully");
      navigate('/getall');
    } catch (err) {
      toast.error("Error adding profile link");
    }
  };

  const handleAdvancedProfileSubmit = async (event) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/link/advancedLink`, {
        v_ids: selectedAdvancedProfiles,
        decision_id: id,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Profiles Linked Successfully");
      navigate('/getall');
    } catch (err) {
      toast.error("Error adding profile link");
    }
  };

  const handleSkillSubmit = async (event) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/link`, {
        skill_ids: selectedSkills,
        decision_id: id,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Skill link added successfully");
      navigate('/getall');
    } catch (err) {
      console.error('Error adding skill link:', err);
      toast.error("Error adding skill link");
    }
  };

  return (
      <div className='addlink'>
      <center>
        <div className='bg-secondary text-white rounded p-2'>
          <h4>{decision_name}</h4>
          <input
            type="text"
            placeholder="Decision Name"
            value={id}
            readOnly
          />
        </div>
      </center>
      <div>
        <div>
          <div className='d-flex gap-2' style={{maxWidth:'400px'}}>
            <IoIosInformationCircle className='fs-4' />
            <p> To link your decisions to your Profile data like SWOT, please click "Get Profile Data" </p>
          </div>
          <button type="button" className='swot' onClick={handleSWOTClick}>Get Profile Data</button>
          {showProfileOptions && (
            <div className='options'>
              {Array.isArray(profiles) && profiles.map((profile) => (
                <div key={profile.header_id}>
                  <label htmlFor={`profile-${profile.header_id}`}>
                    <input
                      type="checkbox"
                      id={`profile-${profile.header_id}`}
                      value={profile.header_id}
                      onChange={handleProfileChange}
                    />
                    {profile.header_name}
                  </label>
                </div>
              ))}
              <div className='swot-list ml-3'>
                <h5>Attitude</h5>
                <div className='checkbox-container'>
                  {Array.isArray(attitude) && attitude.map((item) => (
                    <div key={item.id}>
                      <input
                        type="checkbox"
                        onChange={handleProfileChange}
                        value={item.id}
                      />
                      <span>{item.value}</span>
                    </div>
                  ))}
                </div>
                <h5>Strength</h5>
                <div className='checkbox-container'>
                  {Array.isArray(strength) && strength.map((item) => (
                    <div key={item.id}>
                      <input
                        type="checkbox"
                        onChange={handleProfileChange}
                        value={item.id}
                      />
                      <span>{item.value}</span>
                    </div>
                  ))}
                </div>
                <h5>Weakness</h5>
                <div className='checkbox-container'>
                  {Array.isArray(weakness) && weakness.map((item) => (
                    <div key={item.id}>
                      <input
                        type="checkbox"
                        onChange={handleProfileChange}
                        value={item.id}
                      />
                      <span>{item.value}</span>
                    </div>
                  ))}
                </div>
                <h5>Opportunity</h5>
                <div className='checkbox-container'>
                  {Array.isArray(opportunity) && opportunity.map((item) => (
                    <div key={item.id}>
                      <input
                        type="checkbox"
                        onChange={handleProfileChange}
                        value={item.id}
                      />
                      <span>{item.value}</span>
                    </div>
                  ))}
                </div>
                <h5>Threat</h5>
                <div className='checkbox-container'>
                  {Array.isArray(threat) && threat.map((item) => (
                    <div key={item.id}>
                      <input
                        type="checkbox"
                        onChange={handleProfileChange}
                        value={item.id}
                      />
                      <span>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <button type='submit' onClick={handleProfileSubmit} className='savebtn'>Save SWOT Link</button>
      </div>
      <div>
        <div>
          <div className='d-flex gap-2' style={{maxWidth:'400px'}}>
            <IoIosInformationCircle className='fs-4' />
            <p> To link your decisions to your Profile data like AdvancedProfile, please click "Get Advanced-Profile Data" </p>
          </div>
          <button type="button" className='swot' onClick={handleAdvancedProfileClick}>Get Advanced-Profile Data</button>
          {showAdvancedProfiles && (
            <div className='options'>
              {Array.isArray(advancedProfiles) && advancedProfiles.map((profile) => (
                <div key={profile.header_id}>
                  <label htmlFor={`profile-${profile.header_id}`}>
                    <input
                      type="checkbox"
                      id={`profile-${profile.header_id}`}
                      value={profile.header_id}
                      onChange={handleAdvancedProfileChange}
                    />
                    {profile.header_name}
                  </label>
                </div>
              ))}
              <div className='swot-list ml-3'>
                <h5>Goals</h5>
                <div className='checkbox-container'>
                  {Array.isArray(goals) && goals.map((item) => (
                    <div key={item.id}>
                      <input
                        type="checkbox"
                        onChange={handleAdvancedProfileChange}
                        value={item.id}
                      />
                      <span>{item.value}</span>
                    </div>
                  ))}
                </div>
                <h5>Values</h5>
                <div className='checkbox-container'>
                  {Array.isArray(values) && values.map((item) => (
                    <div key={item.id}>
                      <input
                        type="checkbox"
                        onChange={handleAdvancedProfileChange}
                        value={item.id}
                      />
                      <span>{item.value}</span>
                    </div>
                  ))}
                </div>
                <h5>Resolution</h5>
                <div className='checkbox-container'>
                  {Array.isArray(resolutions) && resolutions.map((item) => (
                    <div key={item.id}>
                      <input
                        type="checkbox"
                        onChange={handleAdvancedProfileChange}
                        value={item.id}
                      />
                      <span>{item.value}</span>
                    </div>
                  ))}
                </div>
                <h5>constraints</h5>
                <div className='checkbox-container'>
                  {Array.isArray(constraints) && constraints.map((item) => (
                    <div key={item.id}>
                      <input
                        type="checkbox"
                        onChange={handleAdvancedProfileChange}
                        value={item.id}
                      />
                      <span>{item.value}</span>
                    </div>
                  ))}
                </div>
                <h5>Other Factors</h5>
                <div className='checkbox-container'>
                  {Array.isArray(otherfactors) && otherfactors.map((item) => (
                    <div key={item.id}>
                      <input
                        type="checkbox"
                        onChange={handleAdvancedProfileChange}
                        value={item.id}
                      />
                      <span>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <button type='submit' onClick={handleAdvancedProfileSubmit} className='savebtn'>Save AdvancedProfile Link</button>
      </div>
      <div>
        <div>
          <div className='d-flex gap-2' style={{maxWidth:'400px'}}>
          <IoIosInformationCircle className='fs-4' />
          <p> To link your decisions to your Soft Skills, please click Get Soft Skills Data" </p>
          </div>
          <button type='button' className='soft-skill' onClick={handleSoftSkillClick}>Get Soft Skills Data</button>
          {showSkillOptions && (
            <div className='options-container ml-3'>
              {Array.isArray(skills) && skills.map((skill) => (
                <div key={skill.skill_id}>
                  <label htmlFor={`skill-${skill.skill_id}`}>
                    <input
                      type="checkbox"
                      id={`skill-${skill.skill_id}`}
                      value={skill.skill_id}
                      onChange={handleSkillChange}
                    />
                    <strong>{skill.skill_name}</strong><br />
                    <span>Rating: {skill.rating}</span><br />
                    <span>Comments: {skill.comments}</span><br />
                    <span>Description: {skill.description} </span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
        <button type='submit' className='savebtn' onClick={handleSkillSubmit}>Save Soft-Skill Link</button>
      </div>
      <div>
        <div className='d-flex gap-2'style={{maxWidth:'400px'}}>
        <IoIosInformationCircle className='fs-4' />
        <p> To link your decisions to your Profile data like SWOT, please click "Get Profile Data" </p>
        </div>
        <Link to='/getall'>
          <button className='getpage'>
            View Linked Decisions
          </button>
        </Link>
      </div>
      <ToastContainer />
      </div>   
  );
};

export default withAuth(AddLink);
 */


import React, { useEffect, useState, useMemo } from 'react';
import './AddLink.css';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import withAuth from '../../../utils/withAuth';
import { IoIosInformationCircle } from "react-icons/io";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom';


const CheckboxGroup = ({ title, items, prefix, onChange, selected }) => {
  const [open, setOpen] = useState(true);
  if (!items || items.length === 0) return null;

  return (
    <div className="cb-group">
      <button
        type="button"
        className="cb-group-header"
        onClick={() => setOpen(!open)}
      >
        <span>{title} <span className="cb-count">({items.length})</span></span>
        {open ? <FiChevronUp /> : <FiChevronDown />}
      </button>
      {open && (
        <div className="cb-list">
          {items.map((item) => {
            const id = `${prefix}-${item.id ?? item.header_id}`;
            const value = item.id ?? item.header_id;
            return (
              <label key={id} htmlFor={id} className="cb-item">
                <input
                  type="checkbox"
                  id={id}
                  value={value}
                  checked={selected.includes(String(value))}
                  onChange={onChange}
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
  icon,
  title,
  description,
  expanded,
  onToggle,
  selectedCount,
  onSave,
  saveLabel,
  children,
  accent,
}) => (
  <div className={`section-card accent-${accent}`}>
    <div className="section-card-header">
      <div>
        <h3 className="section-title">{title}</h3>
        <p className="section-desc">{description}</p>
      </div>
      <button type="button" className="expand-btn" onClick={onToggle}>
        {expanded ? 'Hide' : 'Select items'}
      </button>
    </div>

    {expanded && <div className="section-body">{children}</div>}

    <div className="section-footer">
      <span className="selected-badge">
        {selectedCount} selected
      </span>
      <button
        type="button"
        className="save-btn"
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
    } catch (err) {
      console.log(err);
    }
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
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSkills = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/skill/get`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSkills(response.data.skills || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchProfiles(), fetchAdvancedProfiles(), fetchSkills()]);
      setLoading(false);
    };
    loadAll();
  }, [id]);

  const toggle = (setter, value) => setter((prev) =>
    prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
  );

  const handleProfileChange = (e) => toggle(setSelectedProfiles, e.target.value);
  const handleAdvancedProfileChange = (e) => toggle(setSelectedAdvancedProfiles, e.target.value);
  const handleSkillChange = (e) => toggle(setSelectedSkills, e.target.value);

  const handleProfileSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/links`,
        { v_ids: selectedProfiles, decision_id: id },
        { headers: { Authorization: `Bearer ${token}` } });
      toast.success('SWOT links saved');
      navigate('/getall');
    } catch (err) {
      toast.error('Error saving SWOT links');
    }
  };

  const handleAdvancedProfileSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/link/advancedLink`,
        { v_ids: selectedAdvancedProfiles, decision_id: id },
        { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Advanced profile links saved');
      navigate('/getall');
    } catch (err) {
      toast.error('Error saving advanced profile links');
    }
  };

  const handleSkillSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/link`,
        { skill_ids: selectedSkills, decision_id: id },
        { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Skill links saved');
      navigate('/getall');
    } catch (err) {
      toast.error('Error saving skill links');
    }
  };

  const totalSelected =
    selectedProfiles.length + selectedAdvancedProfiles.length + selectedSkills.length;

  return (
    <div className="addlink-wrapper">
      <header className="addlink-header">
        <div>
          <h1 className="addlink-title">{decision_name || 'Link Data'}</h1>
          <p className="addlink-subtitle">
            Decision ID: <code>{id}</code>
          </p>
        </div>
        <Link to="/getall" className="view-linked-btn">
          View linked decisions →
        </Link>
      </header>

      <div className="addlink-info">
        <IoIosInformationCircle />
        <span>
          Expand any card below to select the data you want to link to this decision.
          Your selection is saved per card.
        </span>
      </div>

      {loading ? (
        <div className="addlink-loading">Loading your data…</div>
      ) : (
        <div className="section-grid">
          <SectionCard
            accent="blue"
            title="SWOT Profile"
            description="Strengths, weaknesses, opportunities, threats"
            expanded={showProfileOptions}
            onToggle={() => setShowProfileOptions(!showProfileOptions)}
            selectedCount={selectedProfiles.length}
            onSave={handleProfileSubmit}
            saveLabel="Save SWOT links"
          >
            <div className="cb-scroll">
              <CheckboxGroup title="Attitude" items={attitude} prefix="att" onChange={handleProfileChange} selected={selectedProfiles} />
              <CheckboxGroup title="Strength" items={strength} prefix="str" onChange={handleProfileChange} selected={selectedProfiles} />
              <CheckboxGroup title="Weakness" items={weakness} prefix="wk" onChange={handleProfileChange} selected={selectedProfiles} />
              <CheckboxGroup title="Opportunity" items={opportunity} prefix="op" onChange={handleProfileChange} selected={selectedProfiles} />
              <CheckboxGroup title="Threat" items={threat} prefix="thr" onChange={handleProfileChange} selected={selectedProfiles} />
              <CheckboxGroup title="Profiles" items={profiles} prefix="prof" onChange={handleProfileChange} selected={selectedProfiles} />
            </div>
          </SectionCard>

          <SectionCard
            accent="purple"
            title="Advanced Profile"
            description="Goals, values, resolutions, constraints"
            expanded={showAdvancedProfiles}
            onToggle={() => setShowAdvancedProfiles(!showAdvancedProfiles)}
            selectedCount={selectedAdvancedProfiles.length}
            onSave={handleAdvancedProfileSubmit}
            saveLabel="Save advanced links"
          >
            <div className="cb-scroll">
              <CheckboxGroup title="Goals" items={goals} prefix="goal" onChange={handleAdvancedProfileChange} selected={selectedAdvancedProfiles} />
              <CheckboxGroup title="Values" items={values} prefix="val" onChange={handleAdvancedProfileChange} selected={selectedAdvancedProfiles} />
              <CheckboxGroup title="Resolutions" items={resolutions} prefix="res" onChange={handleAdvancedProfileChange} selected={selectedAdvancedProfiles} />
              <CheckboxGroup title="Constraints" items={constraints} prefix="con" onChange={handleAdvancedProfileChange} selected={selectedAdvancedProfiles} />
              <CheckboxGroup title="Other factors" items={otherfactors} prefix="oth" onChange={handleAdvancedProfileChange} selected={selectedAdvancedProfiles} />
              <CheckboxGroup title="Advanced Profiles" items={advancedProfiles} prefix="aprof" onChange={handleAdvancedProfileChange} selected={selectedAdvancedProfiles} />
            </div>
          </SectionCard>

          <SectionCard
            accent="green"
            title="Soft Skills"
            description="Ratings, comments, and descriptions"
            expanded={showSkillOptions}
            onToggle={() => setShowSkillOptions(!showSkillOptions)}
            selectedCount={selectedSkills.length}
            onSave={handleSkillSubmit}
            saveLabel="Save skill links"
          >
            <div className="cb-scroll">
              {skills.length === 0 && <p className="empty-msg">No skills found.</p>}
              {skills.map((skill) => {
                const id = `skill-${skill.skill_id}`;
                const checked = selectedSkills.includes(String(skill.skill_id));
                return (
                  <label key={id} htmlFor={id} className={`skill-item ${checked ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      id={id}
                      value={skill.skill_id}
                      checked={checked}
                      onChange={handleSkillChange}
                    />
                    <div className="skill-body">
                      <strong>{skill.skill_name}</strong>
                      <div className="skill-meta">
                        <span className="skill-pill">Rating: {skill.rating}</span>
                        {skill.comments && <span>💬 {skill.comments}</span>}
                      </div>
                      {skill.description && (
                        <p className="skill-desc">{skill.description}</p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </SectionCard>
        </div>
      )}

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default withAuth(AddLink);