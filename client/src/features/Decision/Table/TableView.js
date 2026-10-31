import React from 'react';
import { Link } from 'react-router-dom';
import { IconButton, CircularProgress } from '@mui/material';
import { MdDelete, MdModeEdit, MdLink } from 'react-icons/md';
import { FaShareAlt } from 'react-icons/fa';
import { GrFormView } from 'react-icons/gr';
import { formatDate } from '../../../utils/formatDate';

const TableView = ({
  records,
  comments,
  startIndex,
  sortDirection,
  onSortByDueDate,
  onDelete,
}) => {
  return (
    <div className="decision-table-wrap">
      <table className="decision-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Decision Names</th>
            <th className="is-sortable" onClick={onSortByDueDate}>
              Due Date {sortDirection === 'asc' ? '▲' : '▼'}
            </th>
            <th>Taken Date</th>
            <th>Details</th>
            <th>Tags</th>
            <th>Reasons</th>
            <th>Comments</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {records.map((decision, index) => {
            const overdue =
              new Date(decision.decision_due_date) < new Date() &&
              !decision.decision_taken_date;
            return (
              <tr
                key={decision.decision_id}
                className={overdue ? 'is-overdue' : ''}
              >
                <td>{startIndex + index + 1}</td>
                <td>{decision.decision_name}</td>
                <td>{formatDate(decision.decision_due_date)}</td>
                <td>{formatDate(decision.decision_taken_date)}</td>
                <td>{decision.user_statement}</td>
                <td>
                  {decision.tags?.map((tag) => (
                    <span className="decision-tag" key={tag.id}>
                      {tag.tag_name}
                    </span>
                  ))}
                </td>
                <td>
                  {decision.decision_reason?.length
                    ? decision.decision_reason
                        .map((r) => r.decision_reason_text)
                        .join(', ')
                    : ''}
                </td>
                <td>
                  {comments[decision.decision_id] ? (
                    comments[decision.decision_id].length > 0
                      ? `${comments[decision.decision_id].length} comments`
                      : 'No Comments Found'
                  ) : (
                    <CircularProgress size={20} />
                  )}
                </td>
                <td>
                  <div className="decision-actions">
                    <Link
                      to={`/decision/edit/${decision.decision_id}`}
                      className="decision-action-icon"
                    >
                      <MdModeEdit />
                    </Link>
                    <button
                      className="decision-action-icon"
                      onClick={() => onDelete(decision.decision_id)}
                    >
                      <MdDelete />
                    </button>
                    <Link
                      to={`/decision/view/${decision.decision_id}`}
                      className="decision-action-icon"
                    >
                      <GrFormView />
                    </Link>
                    <Link
                      to={`/decision/decision-circle/view/${decision.decision_id}`}
                      className="decision-action-icon"
                    >
                      <FaShareAlt />
                    </Link>
                    <Link
                      to={`/profile/linked-decision/add/${decision.decision_id}?name=${decision.decision_name}`}
                      className="decision-action-icon"
                    >
                      <MdLink />
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TableView;