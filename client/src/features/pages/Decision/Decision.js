import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Decision.css';
import withAuth from '../../../utils/withAuth';
import { notifyTeamsChannel } from '../../../utils/teamsWebhook';

const Decision = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showAdvancedTags, setShowAdvancedTags] = useState(false);
  const [formData, setFormData] = useState({
    decision_name: '',
    decision_due_date: '',
    decision_taken_date: '',
    user_statement: '',
    tags: '',
    user_id: '',
    decision_reason: [''],
  });
  const [errors, setErrors] = useState({});
  const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(false);
  const [isDataSaved, setIsDataSaved] = useState(false); // New state for tracking save status
  const [loading,setLoading] = useState(false);
  const dropdownHeight = 200;
  const dropdownWidth = 650;
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      const token = localStorage.getItem('token');
      axios.get(`${process.env.REACT_APP_API_URL}/api/details/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((resp) => {
          const { decisionData } = resp.data;
          if (decisionData && decisionData.length > 0) {
            const decision = decisionData[0];
            const { decision_name, decision_due_date, decision_taken_date, user_statement, user_id, tags, decision_reason } = decision;

            const formatDate = (dateString) => dateString ? dateString.split('T')[0] : '';

            const formattedDecisionDueDate = formatDate(decision_due_date);
            const formattedDecisionTakenDate = formatDate(decision_taken_date);

            const uniqueDecisionReasons = Array.from(new Set(decision_reason.map(reasonObj => reasonObj.decision_reason_text)));


            setFormData(prevState => ({
              ...prevState,
              decision_name,
              decision_due_date: formattedDecisionDueDate,
              decision_taken_date: formattedDecisionTakenDate,
              user_id,
              user_statement,
              tags: tags.map(tag => (typeof tag === 'object' ? tag.tag_name : tag)),
              decision_reason: uniqueDecisionReasons,
            }));
            setSelectedTags(tags.map(tag => (typeof tag === 'object' ? tag.tag_name : tag)));
          } else {
            toast.error("Decision details not found");
          }
        })
        .catch((error) => {
          if (error.response && error.response.status === 404) {
            toast.error("Decision not found");
          } else {
            console.error(error);
            toast.error("An error occurred while fetching decision details");
          }
        });
    }
  }, [id]);

  const tags = [
    "Personal", "Career", "Work", "Family", "Money", "Health", "Spiritual",
    "Long Term", "Short Term", "Routine", "Safety", "Gone Bad", "Regretting",
    "Best", "Good", "Hobby", "Travel", "Hasty", "Time Sensitive",
    "Financial Loss", "Financial Gain"
  ];

  const advancedTags = [
    "Board", "Brand", "Consultant", "Corporate Governance", "Customer", "Employee", "Expense", "Hiring",
    "Investment", "Legal Compliance", "Operational", "Partner", "Policy", "Product", "Project", "Prospect",
    "Sales", "Services", "Statutory Compliance", "Supplier"
  ];

  const decisionDriverTags = [
    "Fully Data Driven", "Not Data Driven", "Partially Data Driven",
  ];

  const filteredTags = tags.filter(tag =>
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAdvancedTags = advancedTags.filter(tag =>
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDecisionDriverTags = decisionDriverTags.filter(tag =>
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    let formattedValue = value;

    if (id === 'decision_due_date' || id === 'decision_taken_date') {
      const isValidDate = /\d{4}-\d{2}-\d{2}/.test(value);
      if (!isValidDate) {
        return;
      }
      formattedValue = value;
    }

    setFormData((prevData) => ({
      ...prevData,
      [id]: formattedValue,
    }));
  };

  const handleTagSelection = (tag) => {
    setSelectedTags(prevTags => {
      if (prevTags.includes(tag)) {
        return prevTags.filter(t => t !== tag);
      } else {
        return [...prevTags, tag];
      }
    });
  };

  const handleReasonChange = (index, value) => {
    setFormData(prevState => {
      const updatedReasons = [...prevState.decision_reason];
      updatedReasons[index] = value;
      return {
        ...prevState,
        decision_reason: updatedReasons
      };
    });
  };

  const handleAddReason = () => {
    setFormData(prevState => ({
      ...prevState,
      decision_reason: [...prevState.decision_reason, '']
    }));
  };

  const removeReason = (indexToRemove) => {
    const updatedReasons = [...formData.decision_reason];
    updatedReasons.splice(indexToRemove, 1);
    setFormData({
      ...formData,
      decision_reason: updatedReasons,
    });
  }

  const clearDecisionTakenDate = () => {
    setFormData(prevState => ({
      ...prevState,
      decision_taken_date: ''
    }));
  }

  const validateForm = () => {
    const errors = {};

    if (!formData.decision_name.trim()) {
      errors.decision_name = 'Decision name is required';
    }
    if (!formData.decision_due_date.trim()) {
      errors.decision_due_date = 'Due date is required';
    }
    if (!formData.user_statement.trim()) {
      errors.user_statement = 'Enter the details About the decision';
    }
    if (selectedTags.length === 0) {
      errors.selectedTags = 'Select at least one tag';
    }
    if (formData.decision_reason.some(reason => !reason.trim())) {
      errors.decision_reason = 'At least one reason must be filled';
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    if (loading) return;

    if (!validateForm()) {
      return;
    }

    setLoading(true); 

    const { decision_name, decision_taken_date, decision_due_date, user_statement, decision_reason } = formData;

    const data = {
      decision_name,
      decision_due_date,
      decision_taken_date,
      user_statement,
      user_id: '',
      tags: selectedTags.join(','),
      decision_reason: decision_reason.map(reason => ({ decision_reason_text: reason })),
    };


    try {
      if (!id) {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/details`, data);

        await notifyTeamsChannel('CREATED', data);

        toast.success("Decision added successfully");
        setIsDataSaved(true); 
      } else {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/details/${id}`, data);

        await notifyTeamsChannel('UPDATED', data);

        toast.success("Decision updated successfully");
        setIsDataSaved(true);
      }
      setTimeout(() => {
        navigate('/readd');
      }, 1000);
    } catch (error) {
      console.error("Error:", error.message);
      toast.error("An error occurred while saving the decision");
      setIsSaveButtonDisabled(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/readd');
  };

  return (
    <div>
      <h3 className='header'>Details</h3>
      <div className='form'>
        <form onSubmit={handleSubmit}>
          <div>
            <div className='form-group'>
              <label htmlFor='decision_name'>Decision Name <span className="required" style={{ color: "red" }}>*</span></label>
              <input
                type='text'
                id='decision_name'
                value={formData.decision_name}
                onChange={handleInputChange}
                placeholder='Enter the decision name'
                style={{ width: "100%" }}
              />
              {errors.decision_name && <span className="error">{errors.decision_name}</span>}
            </div>
            <div className='form-group'>
              <label htmlFor='decision_due_date'>Decision Due Date <span className="required" style={{ color: "red" }}>*</span></label>
              <input
                type='date'
                id='decision_due_date'
                value={formData.decision_due_date}
                onChange={handleInputChange}
                placeholder='yyyy-mm-dd'
                style={{ width: "100%" }}
              />
              {errors.decision_due_date && <span className="error">{errors.decision_due_date}</span>}
            </div>
            <div className='form-group'>
              <label htmlFor='decision_taken_date'>Decision Taken Date</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: "1rem" }}>
                <input
                  type='date'
                  id='decision_taken_date'
                  value={formData.decision_taken_date}
                  onChange={handleInputChange}
                  placeholder='yyyy-mm-dd'
                  style={{ width: "100%" }}
                />
                <button
                  type="button"
                  onClick={clearDecisionTakenDate}
                  className='btnn'
                >
                  Clear
                </button>
              </div>
              {errors.decision_taken_date && <span className="error">{errors.decision_taken_date}</span>}
            </div>
            <div className='form-group'>
              <label htmlFor='user_statement'>Decision Details <span className="required" style={{ color: "red" }}>*</span></label>
              <input
                type='text'
                id='user_statement'
                value={formData.user_statement}
                onChange={handleInputChange}
                placeholder='Enter the statement'
                style={{ width: "100%" }}
              />
              {errors.user_statement && <span className="error">{errors.user_statement}</span>}
            </div>
            <div className='form-group'>
              <label>Decision Reasons <span className="required" style={{ color: "red" }}>*</span></label>
              {formData.decision_reason && formData.decision_reason.map((reason, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <input
                    type='text'
                    value={reason}
                    onChange={e => handleReasonChange(index, e.target.value)}
                    placeholder='Enter the decision reason'
                    style={{ width: '100%' }}
                  />
                  <button
                    className='btnn1'
                    type='button'
                    onClick={() => removeReason(index)}
                  >
                    Remove
                  </button>
                  {errors.decision_reason && <span className="error">{errors.decision_reason}</span>}
                </div>
              ))}
              <button className='btnn2' type='button' onClick={handleAddReason}>Add Another Reason</button>
            </div>
            <div className='form-group'>
              <label>Select Tags <span className="required" style={{ color: "red" }}>*</span></label>
              <input
                type="text"
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: "100%", marginBottom: '5px' }}
              />
              {errors.selectedTags && <span className="error">{errors.selectedTags}</span>}
              <div
                className='tag-container'
                style={{
                  maxHeight: dropdownHeight,
                  maxWidth: dropdownWidth,
                  overflowY: 'auto',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  marginBottom: '10px',
                  margin: 'auto',
                }}
              >
                {filteredTags.map((tag, index) => (
                  <div key={index} className='tag-item' style={{ flexBasis: '17%' }}>
                    <label className='tag-label' htmlFor={tag}>
                      <input
                        type="checkbox"
                        id={tag}
                        checked={selectedTags.includes(tag)}
                        onChange={() => handleTagSelection(tag)}
                      /> {tag}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className='form-group'>
              <button
                type="button"
                onClick={() => setShowAdvancedTags(!showAdvancedTags)}
                className='btnn3'
              >
                {showAdvancedTags ? "Hide Advanced Tags" : "Show Advanced Tags"}
              </button>
            </div>
            {showAdvancedTags && (
              <>
                <div className='form-group'>
                  <label>Advanced Tags:</label>
                  <div
                    className='tag-container'
                    style={{
                      maxHeight: dropdownHeight,
                      maxWidth: dropdownWidth,
                      overflowY: 'auto',
                      border: '1px solid #ccc',
                      borderRadius: '5px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      justifyContent: 'center',
                      marginBottom: '10px',
                      margin: 'auto',
                    }}
                  >
                    {filteredAdvancedTags.map((tag, index) => (
                      <div key={index} className='tag-item' style={{ flexBasis: '17%' }} >
                        <label className='tag-label' htmlFor={tag}>
                          <input
                            type="checkbox"
                            id={tag}
                            checked={selectedTags.includes(tag)}
                            onChange={() => handleTagSelection(tag)}
                          /> {tag}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className='form-group'>
                  <label>Decision Driver Tags:</label>
                  <div
                    className='tag-container'
                    style={{
                      maxHeight: dropdownHeight,
                      maxWidth: dropdownWidth,
                      overflowY: 'auto',
                      border: '1px solid #ccc',
                      borderRadius: '5px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '5px',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      marginBottom: '10px',
                      margin: 'auto',
                    }}
                  >
                    {filteredDecisionDriverTags.map((tag, index) => (
                      <div key={index} className='tag-item' style={{ flexBasis: '25%' }} >
                        <label className='tag-label' htmlFor={tag}>
                          <input
                            type="checkbox"
                            id={tag}
                            checked={selectedTags.includes(tag)}
                            onChange={() => handleTagSelection(tag)}
                          /> {tag}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
            <button
              type="submit"
              className='btnn4'
              disabled={isSaveButtonDisabled || isDataSaved }
            >
              {loading ? 'Saving...' : (id ? 'Update' : 'Save')}
              </button>

            <button
              type="button"
              className='cancel-button'
              disabled={loading}
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default withAuth(Decision);
