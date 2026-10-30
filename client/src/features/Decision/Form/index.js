import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import withAuth from '../../../utils/withAuth';
import { notifyTeamsChannel } from '../../../utils/teamsWebhook';
import TagPicker from './TagPicker';
import '../../../assets/styles/pages/Decision.css';

const TAGS = [
  'Personal', 'Career', 'Work', 'Family', 'Money', 'Health', 'Spiritual',
  'Long Term', 'Short Term', 'Routine', 'Safety', 'Gone Bad', 'Regretting',
  'Best', 'Good', 'Hobby', 'Travel', 'Hasty', 'Time Sensitive',
  'Financial Loss', 'Financial Gain',
];
const ADVANCED_TAGS = [
  'Board', 'Brand', 'Consultant', 'Corporate Governance', 'Customer',
  'Employee', 'Expense', 'Hiring', 'Investment', 'Legal Compliance',
  'Operational', 'Partner', 'Policy', 'Product', 'Project', 'Prospect',
  'Sales', 'Services', 'Statutory Compliance', 'Supplier',
];
const DRIVER_TAGS = ['Fully Data Driven', 'Not Data Driven', 'Partially Data Driven'];

const DecisionForm = () => {
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
  const [isSaveButtonDisabled] = useState(false);
  const [isDataSaved, setIsDataSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem('token');
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/details/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((resp) => {
        const { decisionData } = resp.data;
        if (!decisionData?.length) return toast.error('Decision details not found');
        const d = decisionData[0];
        const fmt = (s) => (s ? s.split('T')[0] : '');
        const uniqueReasons = Array.from(
          new Set(d.decision_reason.map((r) => r.decision_reason_text))
        );
        setFormData((prev) => ({
          ...prev,
          decision_name: d.decision_name,
          decision_due_date: fmt(d.decision_due_date),
          decision_taken_date: fmt(d.decision_taken_date),
          user_id: d.user_id,
          user_statement: d.user_statement,
          tags: d.tags.map((t) => (typeof t === 'object' ? t.tag_name : t)),
          decision_reason: uniqueReasons,
        }));
        setSelectedTags(
          d.tags.map((t) => (typeof t === 'object' ? t.tag_name : t))
        );
      })
      .catch((err) => {
        if (err.response?.status === 404) toast.error('Decision not found');
        else {
          console.error(err);
          toast.error('An error occurred while fetching decision details');
        }
      });
  }, [id]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    if (
      (id === 'decision_due_date' || id === 'decision_taken_date') &&
      !/\d{4}-\d{2}-\d{2}/.test(value)
    ) {
      return;
    }
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleTagSelection = (tag) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  const handleReasonChange = (index, value) =>
    setFormData((prev) => {
      const reasons = [...prev.decision_reason];
      reasons[index] = value;
      return { ...prev, decision_reason: reasons };
    });

  const handleAddReason = () =>
    setFormData((prev) => ({
      ...prev,
      decision_reason: [...prev.decision_reason, ''],
    }));

  const removeReason = (i) => {
    const reasons = [...formData.decision_reason];
    reasons.splice(i, 1);
    setFormData({ ...formData, decision_reason: reasons });
  };

  const clearDecisionTakenDate = () =>
    setFormData((prev) => ({ ...prev, decision_taken_date: '' }));

  const validateForm = () => {
    const errs = {};
    if (!formData.decision_name.trim()) errs.decision_name = 'Decision name is required';
    if (!formData.decision_due_date.trim()) errs.decision_due_date = 'Due date is required';
    if (!formData.user_statement.trim()) errs.user_statement = 'Enter the details about the decision';
    if (selectedTags.length === 0) errs.selectedTags = 'Select at least one tag';
    if (formData.decision_reason.some((r) => !r.trim()))
      errs.decision_reason = 'At least one reason must be filled';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validateForm()) return;
    setLoading(true);

    const { decision_name, decision_due_date, decision_taken_date, user_statement, decision_reason } = formData;
    const payload = {
      decision_name,
      decision_due_date,
      decision_taken_date,
      user_statement,
      user_id: '',
      tags: selectedTags.join(','),
      decision_reason: decision_reason.map((r) => ({ decision_reason_text: r })),
    };

    try {
      if (!id) {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/details`, payload);
        await notifyTeamsChannel('CREATED', payload);
        toast.success('Decision added successfully');
      } else {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/details/${id}`, payload);
        await notifyTeamsChannel('UPDATED', payload);
        toast.success('Decision updated successfully');
      }
      setIsDataSaved(true);
      setTimeout(() => navigate('/decision'), 1000);
    } catch (err) {
      console.error('Error:', err.message);
      toast.error('An error occurred while saving the decision');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate('/decision');

  const match = (t) => t.toLowerCase().includes(searchTerm.toLowerCase());
  const filteredTags = TAGS.filter(match);
  const filteredAdvanced = ADVANCED_TAGS.filter(match);
  const filteredDrivers = DRIVER_TAGS.filter(match);

  return (
    <div className="decision-form-page">
      <h3 className="header">Details</h3>

      <div className="decision-form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="decision_name">
              Decision Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="decision_name"
              value={formData.decision_name}
              onChange={handleInputChange}
              placeholder="Enter the decision name"
            />
            {errors.decision_name && <span className="error">{errors.decision_name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="decision_due_date">
              Decision Due Date <span className="required">*</span>
            </label>
            <input
              type="date"
              id="decision_due_date"
              value={formData.decision_due_date}
              onChange={handleInputChange}
            />
            {errors.decision_due_date && <span className="error">{errors.decision_due_date}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="decision_taken_date">Decision Taken Date</label>
            <div className="date-with-clear">
              <input
                type="date"
                id="decision_taken_date"
                value={formData.decision_taken_date}
                onChange={handleInputChange}
              />
              <button type="button" onClick={clearDecisionTakenDate} className="btnn">
                Clear
              </button>
            </div>
            {errors.decision_taken_date && <span className="error">{errors.decision_taken_date}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="user_statement">
              Decision Details <span className="required">*</span>
            </label>
            <input
              type="text"
              id="user_statement"
              value={formData.user_statement}
              onChange={handleInputChange}
              placeholder="Enter the statement"
            />
            {errors.user_statement && <span className="error">{errors.user_statement}</span>}
          </div>

          <div className="form-group">
            <label>
              Decision Reasons <span className="required">*</span>
            </label>
            {formData.decision_reason.map((reason, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => handleReasonChange(index, e.target.value)}
                  placeholder="Enter the decision reason"
                />
                <button type="button" className="btnn1" onClick={() => removeReason(index)}>
                  Remove
                </button>
              </div>
            ))}
            {errors.decision_reason && <span className="error">{errors.decision_reason}</span>}
            <button type="button" className="btnn2" onClick={handleAddReason}>
              + Add Another Reason
            </button>
          </div>

          <div className="form-group">
            <label>
              Select Tags <span className="required">*</span>
            </label>
            <input
              type="text"
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginBottom: '0.5rem' }}
            />
            {errors.selectedTags && <span className="error">{errors.selectedTags}</span>}
            <TagPicker tags={filteredTags} selected={selectedTags} onToggle={handleTagSelection} />
          </div>

          <div className="form-group">
            <button
              type="button"
              className="btnn3"
              onClick={() => setShowAdvancedTags((v) => !v)}
            >
              {showAdvancedTags ? 'Hide Advanced Tags' : 'Show Advanced Tags'}
            </button>
          </div>

          {showAdvancedTags && (
            <>
              <div className="form-group">
                <label>Advanced Tags</label>
                <TagPicker
                  tags={filteredAdvanced}
                  selected={selectedTags}
                  onToggle={handleTagSelection}
                />
              </div>

              <div className="form-group">
                <label>Decision Driver Tags</label>
                <TagPicker
                  tags={filteredDrivers}
                  selected={selectedTags}
                  onToggle={handleTagSelection}
                />
              </div>
            </>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="btnn4"
              disabled={isSaveButtonDisabled || isDataSaved || loading}
            >
              {loading ? 'Saving…' : id ? 'Update' : 'Save'}
            </button>
            <button
              type="button"
              className="cancel-button"
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

export default withAuth(DecisionForm);