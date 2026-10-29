import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { Pagination, CircularProgress } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import withAuth from '../../../utils/withAuth';
import { notifyTeamsChannel } from '../../../utils/teamsWebhook';
import TableView from './TableView';
import TimelineView from './TimelineView';
import TabularView from './TabularView';
import 'react-toastify/dist/ReactToastify.css';
import '../../../assets/styles/pages/Decision.css';

const RECORDS_PER_PAGE = 10;

const Decision = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPending, setShowPending] = useState(false);
  const [comments, setComments] = useState({});
  const [view, setView] = useState('table');
  const [expandedDecision, setExpandedDecision] = useState(null);
  const [selectedTag, setSelectedTag] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [subscription, setSubscription] = useState({
    monthlyCount: 0,
    limit: 20,
    subscriptionRequired: false,
    isSubscribed: false,
  });
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    loadData();
    loadSubscription();
  }, []);


  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });

  const loadData = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/`,
        { headers: authHeader() }
      );
      const list = res.data.decisionData;
      if (!Array.isArray(list)) return;
      const sorted = [...list].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setData(sorted);
      sorted.forEach((d) => fetchComments(d.decision_id));
    } catch (err) {
      console.error('Error fetching data:', err.message);
    }
  };

  const fetchComments = async (decisionId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/group/comments`,
        { headers: authHeader(), params: { decisionId } }
      );
      setComments((prev) => ({ ...prev, [decisionId]: res.data.comments }));
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const loadSubscription = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/decisions/monthly-count`,
        { headers: authHeader() }
      );
      setSubscription(res.data);
    } catch (err) {
      console.error('Subscription info error', err);
    }
  };


  const startSubscription = async () => {
    try {
      setSubLoading(true);
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/subscription/create`,
        {},
        { headers: authHeader() }
      );
      window.location.href = res.data.approvalUrl;
    } catch (err) {
      console.error(err);
      toast.error('Failed to start subscription');
      setSubLoading(false);
    }
  };

  const handleSortByDueDate = () => {
    setData((prev) => {
      const sorted = [...prev].sort((a, b) => {
        const da = new Date(a.decision_due_date);
        const db = new Date(b.decision_due_date);
        return sortDirection === 'asc' ? da - db : db - da;
      });
      return sorted;
    });
    setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
  };

  const deleteDecision = async (id) => {
    if (!window.confirm('Delete this decision?')) return;
    try {
      const toDelete = data.find((d) => d.decision_id === id);
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/details/${id}`,
        { headers: authHeader() }
      );
      await notifyTeamsChannel('DELETED', toDelete);
      toast.success('Decision deleted');
      setData((prev) => prev.filter((d) => d.decision_id !== id));
      await loadSubscription();
    } catch (err) {
      console.error(err);
      toast.error('Error deleting decision');
    }
  };


  const filteredData = data
    .filter((d) => (showPending ? !d.decision_taken_date : true))
    .filter((d) => {
      const name = d.decision_name?.toLowerCase() ?? '';
      const matchName = name.includes(selectedTag.toLowerCase());
      const matchTag = d.tags?.some(
        (t) =>
          t.tag_name &&
          t.tag_name.toLowerCase().includes(selectedTag.toLowerCase())
      );
      return matchName || matchTag;
    });

  const startIdx = (currentPage - 1) * RECORDS_PER_PAGE;
  const currentRecords = filteredData.slice(
    startIdx,
    startIdx + RECORDS_PER_PAGE
  );


  const canAdd =
    !subscription.subscriptionRequired || subscription.isSubscribed;

  return (
    <div className="decisions-page" style={{ padding: '1.5rem' }}>
      <button
        className="decision-btn decision-btn--primary"
        onClick={() => {
          if (!canAdd) {
            toast.info('Monthly limit reached. Please subscribe.');
          } else {
            window.location.href = '/decision/add';
          }
        }}
      >
        Add Decision
        {!subscription.isSubscribed && subscription.subscriptionRequired && (
          <LockIcon fontSize="small" />
        )}
      </button>

      {subscription.isSubscribed && (
        <p className="subscription-status">Subscription Active ✓</p>
      )}

      {!subscription.isSubscribed && subscription.subscriptionRequired && (
        <button
          className="decision-btn decision-btn--success"
          onClick={startSubscription}
          disabled={subLoading}
          style={{ marginBottom: '1rem' }}
        >
          {subLoading ? (
            <>
              <CircularProgress size={18} sx={{ color: 'white' }} />
              Redirecting…
            </>
          ) : (
            'Subscribe $1 / Month'
          )}
        </button>
      )}

      <div className="decisions-toolbar">
        <div className="decisions-toolbar__group">
          {['table', 'timeline', 'tabular'].map((v) => (
            <button
              key={v}
              className={
                'decision-btn ' +
                (view === v ? 'decision-btn--active' : '')
              }
              onClick={() => setView(v)}
            >
              {v === 'table'
                ? 'Table View'
                : v === 'timeline'
                ? 'Timeline View'
                : 'How Am I Doing?'}
            </button>
          ))}
        </div>

        {(view === 'table' || view === 'timeline') && (
          <div className="decisions-toolbar__group">
            <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Show pending decisions
            </label>
            <label className="custom-switch">
              <input
                type="checkbox"
                checked={showPending}
                onChange={() => setShowPending((v) => !v)}
              />
              <span className="slider" />
            </label>

            {view === 'table' && (
              <input
                className="decision-search"
                placeholder="Search by name or tag…"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              />
            )}
            {view === 'timeline' && (
              <select
                className="decision-search"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                <option value="">All Tags</option>
                <option>Advanced Tags</option>
                <option>Sharpen the Saw</option>
                <option>Time Span</option>
                <option>Outcome</option>
                <option>Decision Maturity</option>
                <option>Financial Outcome</option>
              </select>
            )}
          </div>
        )}
      </div>

      {(data.length === 0 || data.some((d) => !d.decision_name)) && (
        <div className="decision-banner decision-banner--warning">
          ⚠️ Note: Some decision titles may appear blank due to recent updates.
          We are actively working to resolve this issue.
        </div>
      )}

      {view === 'table' && (
        <TableView
          records={currentRecords}
          comments={comments}
          startIndex={startIdx}
          sortDirection={sortDirection}
          onSortByDueDate={handleSortByDueDate}
          onDelete={deleteDecision}
        />
      )}

      {view === 'timeline' && (
        <TimelineView
          decisions={filteredData}
          expandedId={expandedDecision}
          onToggle={(id) =>
            setExpandedDecision((cur) => (cur === id ? null : id))
          }
          comments={comments}
        />
      )}

      {view === 'tabular' && <TabularView data={data} />}

      {view === 'table' && (
        <div className="decision-pagination">
          <Pagination
            count={Math.ceil(filteredData.length / RECORDS_PER_PAGE)}
            page={currentPage}
            onChange={(_, p) => setCurrentPage(p)}
            sx={{
              '& .MuiPaginationItem-page.Mui-selected': {
                backgroundColor: 'var(--brand-primary)',
                color: 'white',
              },
            }}
          />
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default withAuth(Decision);