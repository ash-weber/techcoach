import React, { useEffect, useState } from 'react';
import withAuth from '../../utils/withAuth';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  postdecisionGroup,
  putDecisionGroup,
  getDecisionGroup,
} from '../../api/DecisionCircle/Network_Call';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  MdOutlineGroups,
  MdOutlineSave,
  MdOutlineArrowBack,
  MdOutlineCreateNewFolder,
  MdOutlineEdit,
} from 'react-icons/md';
import '../../assets/styles/pages/DecisionCircle.css';

const DecisionCircle = () => {
  const [circleName, setCircleName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const fetchDecisionGroup = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const existingGroup = await getDecisionGroup(id);
      setCircleName(existingGroup.group_name || '');
    } catch (error) {
      console.error('Error fetching decision group:', error);
      toast.error('Failed to load decision group');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCircle = async () => {
    const trimmed = circleName.trim();
    if (!trimmed) {
      return toast.error('Circle name cannot be empty');
    }

    setSaving(true);
    try {
      if (isEdit) {
        await putDecisionGroup(id, trimmed);
        toast.success('Decision group updated successfully');
      } else {
        await postdecisionGroup(trimmed);
        toast.success('Decision group created successfully');
      }
      navigate('/decision-circle');
    } catch (error) {
      console.error('Failed to create/update decision group:', error);
      toast.error('Failed to Create/Update');
    } finally {
      setSaving(false);
    }
  };

  const handleCircleNameChange = (event) => {
    setCircleName(event.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSaveCircle();
  };

  useEffect(() => {
    fetchDecisionGroup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="dc-form-page">
      {/* ---------- Back Link ---------- */}
      <Link to="/decision-circle" className="dc-back-link">
        <MdOutlineArrowBack /> Back to Decision Circles
      </Link>

      {/* ---------- Card ---------- */}
      <div className="dc-form-card">
        <header className="dc-form-card__head">
          <div className="dc-form-card__icon">
            {isEdit ? <MdOutlineEdit /> : <MdOutlineCreateNewFolder />}
          </div>
          <div>
            <h1 className="dc-form-card__title">
              {isEdit ? 'Edit Decision Circle' : 'Create Decision Circle'}
            </h1>
            <p className="dc-form-card__subtitle">
              {isEdit
                ? 'Update the name of your decision circle.'
                : 'Give your decision circle a clear, memorable name.'}
            </p>
          </div>
        </header>

        <form
          className="dc-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveCircle();
          }}
        >
          <div className="form-group">
            <label htmlFor="circle-name">
              Circle Name <span className="required">*</span>
            </label>
            <input
              id="circle-name"
              type="text"
              placeholder="e.g. Product Strategy 2025"
              value={circleName}
              onChange={handleCircleNameChange}
              onKeyDown={handleKeyDown}
              disabled={loading || saving}
              autoFocus
              maxLength={80}
            />
            <span className="dc-form-hint">
              {circleName.length}/80 characters
            </span>
          </div>

          <div className="dc-form-actions">
            <Link to="/decision-circle" className="decision-btn">
              Cancel
            </Link>
            <button
              type="submit"
              className="decision-btn decision-btn--primary"
              disabled={saving || loading || !circleName.trim()}
            >
              {saving ? (
                <>Saving…</>
              ) : (
                <>
                  <MdOutlineSave />
                  {isEdit ? 'Update Circle' : 'Create Circle'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ---------- Quick Action ---------- */}
      <div className="dc-form-footer">
        <Link to="/decision-circle" className="dc-form-footer__link">
          <MdOutlineGroups /> View all decision circles
        </Link>
      </div>

      <ToastContainer position="top-right" theme="colored" />
    </div>
  );
};

export default withAuth(DecisionCircle);