import React from 'react';
import { Link } from 'react-router-dom';

const Row = ({ label, value }) =>
  value ? (
    <div className="view-info__row">
      <b>{label}:</b> <span>{value}</span>
    </div>
  ) : null;

const DecisionInfoCard = ({ decision }) => (
  <div className="view-info">
    <Row label="Decision Name" value={decision.decision_name} />
    <Row label="Decision Details" value={decision.user_statement} />
    <Row
      label="Decision Reasons"
      value={decision.decision_reason?.join(', ')}
    />
    <Row label="Decision Due Date" value={decision.decision_due_date} />
    <Row label="Decision Taken Date" value={decision.decision_taken_date} />
    {decision.tagsArray?.length > 0 && (
      <div className="view-info__row">
        <b>Selected Tags:</b>
        <div className="view-info__tags">
          {decision.tagsArray.map((t) => (
            <span key={t.id} className="decision-tag">
              {t.tag_name}
            </span>
          ))}
        </div>
      </div>
    )}
    <div style={{ marginTop: 'var(--space-md)' }}>
      <Link to="/decision">
        <button className="decision-btn">Go back</button>
      </Link>
    </div>
  </div>
);

export default DecisionInfoCard;