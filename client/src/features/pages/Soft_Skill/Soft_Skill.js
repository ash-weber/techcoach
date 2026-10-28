import React, { useEffect, useState } from 'react';
import './Soft_Skill.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MdDescription } from 'react-icons/md';
import { ToastContainer, toast } from 'react-toastify';
import withAuth from '../../../utils/withAuth';

const SoftSkill = () => {
  const [skills, setSkills] = useState([]);
  const [selectedSkillIndex, setSelectedSkillIndex] = useState(null);
  const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchSkills = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/skill/master-skills`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSkills(response.data.skills.map(skill => ({ ...skill, showDescription: false, rating: '', comments: '' })));
    } catch (err) {
      console.log(err);
    }
  };

  const fetchgetSkills = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/skill/get`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const filteredSkills = response.data.skills.filter(skill => skill.rating === null && skill.comments === null);
      setSkills(filteredSkills);
    } catch (err) {
      toast.error('Error fetching skill data');
    }
  };

  useEffect(() => {
    fetchSkills();
    fetchgetSkills();
  }, []);

  const handleSkillSelection = (index) => {
    setSelectedSkillIndex(index);
    setIsSaveButtonDisabled(false);
  };

  const handleChange = (index, event) => {
    const values = [...skills];
    if (event.target.name === 'rating') {
      values[index][event.target.name] = parseInt(event.target.value, 10);
    } else if (event.target.name === 'comments') {
      values[index][event.target.name] = event.target.value;
    }
    setSkills(values);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if(selectedSkillIndex === null || isSaveButtonDisabled) {
      return
    }

    const selectedSkill = skills[selectedSkillIndex];
    setLoading(true);
    setIsSaveButtonDisabled(true); // Disable the Save button

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/skill`, { 
        skill_name: selectedSkill.skill_name, 
        rating: selectedSkill.rating, 
        comments: selectedSkill.comments 
      });
      toast("Soft Skill Added Successfully");
      setTimeout(() => {
        navigate('/skillget');
      }, 1500);
    } catch (err) {
      toast("Error adding Soft Skill data");
      setIsSaveButtonDisabled(false);
    } finally {
      setLoading(false);
    }
  };


  const toggleDescription = (index) => {
    const values = [...skills];
    values[index].showDescription = !values[index].showDescription;
    setSkills(values);
  };

  const getConfidenceLevel = (rating) => {
    if (rating >= 1 && rating <= 4) return 'Not very confident';
    if (rating >= 5 && rating <= 8) return 'Slightly Confident';
    if (rating >= 9 && rating <= 10) return 'Highly Confident';
    return '';
  };

  return (
    <div>
      <h3 className='center mt-5'>Soft Skills - Self Assessment</h3>
      <form className='skill-form'>
        
        <table className='skill-addTable'>
          <thead>
            <tr>
              <th>Select</th>
              <th>Skill Name</th>
              <th>Rating (1-10)</th>
              <th>Confidence Level</th>
              <th>Assessment Notes and Action Plan</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((skill, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="radio"
                    name="selectedSkill"
                    value={index}
                    checked={selectedSkillIndex === index}
                    onChange={() => handleSkillSelection(index)}
                  />
                </td>
                <td>
                  <div className='skill-option'>
                    <span>{skill.skill_name}  <span className="required" style={{ color: "red" }}>*</span></span>
                    <MdDescription
                      className='show-description-icon'
                      onClick={() => toggleDescription(index)}
                    />
                    {skill.showDescription && (
                      <p className='description'>
                        Description: {skill.description}
                      </p>
                    )}
                  </div>
                </td>
                <td>
                  <input
                    type='number'
                    min='1'
                    max='10'
                    name='rating'
                    value={skill.rating || ''}
                    onChange={(event) => handleChange(index, event)}
                    disabled={selectedSkillIndex !== index}
                  />
                </td>
                <td>{getConfidenceLevel(skill.rating)}</td>
                <td>
                  <textarea
                    className='textarea'
                    name='comments'
                    value={skill.comments || ''}
                    onChange={(event) => handleChange(index, event)}
                    disabled={selectedSkillIndex !== index}
                  ></textarea>
                </td>
                <td>
                  <button className='bg-success p-1 m-1 rounded'
                  disabled={loading || isSaveButtonDisabled}
                  onClick={handleSave}
                  >
                  {loading ? 'Submitting...' : 'Save'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </form>
      <ToastContainer />
    </div>
  );
};

export default withAuth(SoftSkill);
