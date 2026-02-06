import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { Pagination, IconButton, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, CircularProgress, Select, MenuItem } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { MdDelete, MdModeEdit, MdLink } from 'react-icons/md';
import { FaShareAlt } from "react-icons/fa";
import { GrFormView } from 'react-icons/gr';
import { DataGrid } from '@mui/x-data-grid';
import 'react-toastify/dist/ReactToastify.css';
import Chip from '@mui/material/Chip';
import './Readd.css';
import withAuth from '../../withAuth';
import TrendChart from './Views/TrendChart';
import { formatDate } from '../../../Utility/utils';
import LockIcon from '@mui/icons-material/Lock';

const Readd = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [showPendingDecisions, setShowPendingDecisions] = useState(false);
  const [comments, setComments] = useState({});
  const [view, setView] = useState('table');
  const [expandedDecision, setExpandedDecision] = useState(null);
  const [selectedTag, setSelectedTag] = useState('');
  const [sortCriteria, setSortCriteria] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [subscriptionInfo, setSubscriptionInfo] = useState({
    monthlyCount: 0,
    limit: 10,
    subscriptionRequired: false,
    isSubscribed: false
  });
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);


  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const responseData = response.data;
        if (Array.isArray(responseData.decisionData)) {
          const sortedData = responseData.decisionData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setData(sortedData);
          sortedData.forEach(decision => {
            fetchComments(decision.decision_id);
          });
        } else {
          console.error('Invalid response format:', responseData);
        }
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };

    const loadSubscriptionInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/decisions/monthly-count`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSubscriptionInfo(res.data);
      } catch (err) {
        console.error('Subscription info error', err);
      }
    };

    loadData();
    loadSubscriptionInfo();
  }, []);


  // console.log("dataa", data);


  const fetchComments = async decisionId => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/comments`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          decisionId: decisionId
        }
      });
      setComments(prevComments => ({
        ...prevComments,
        [decisionId]: response.data.comments
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };


  const handleSortByDueDate = () => {
    const sortedData = [...data].sort((a, b) => {
      const dateA = new Date(a.decision_due_date);
      const dateB = new Date(b.decision_due_date);
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });
    setData(sortedData);
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const startSubscription = async () => {
    try {
      setSubscriptionLoading(true);

      const token = localStorage.getItem('token');

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/subscription/create`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      window.location.href = res.data.approvalUrl;

    } catch (error) {
      console.error(error);
      toast.error('Failed to start subscription');
      setSubscriptionLoading(false);
    }
  };

  const filteredData = data
    .filter(decision => (showPendingDecisions ? !decision.decision_taken_date : true))
    .filter(decision => {
      const decisionNameMatch = decision.decision_name &&
        typeof decision.decision_name === 'string' &&
        decision.decision_name.toLowerCase().includes(selectedTag.toLowerCase());

      const tagMatch = decision.tags &&
        Array.isArray(decision.tags) &&
        decision.tags.some(tag => tag.tag_name &&
          typeof tag.tag_name === 'string' &&
          tag.tag_name.toLowerCase().includes(selectedTag.toLowerCase())
        );

      return decisionNameMatch || tagMatch;
    });



  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);

  const renderTableView = () => (
    <TableContainer component={Paper} sx={{ marginTop: 2 }}>
      <Table>
        <TableHead sx={{ backgroundColor: '#526D82' }}>
          <TableRow>
            <TableCell sx={{ color: 'white' }}>#</TableCell>
            <TableCell sx={{ color: 'white' }}>Decision Namess</TableCell>
            <TableCell sx={{ color: 'white', cursor: 'pointer' }} onClick={handleSortByDueDate}>
              Due Date {sortDirection === 'asc' ? '▲' : '▼'}
            </TableCell>
            <TableCell sx={{ color: 'white' }}>Taken Date</TableCell>
            <TableCell sx={{ color: 'white' }}>Details</TableCell>
            <TableCell sx={{ color: 'white' }}>Tags</TableCell>
            <TableCell sx={{ color: 'white' }}>Reasons</TableCell>
            <TableCell sx={{ color: 'white' }}>Comments</TableCell>
            <TableCell sx={{ color: 'white' }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {console.log("currentRecords", currentRecords)}
          {currentRecords.map((decision, index) => {
            const isPastDueDate = new Date(decision.decision_due_date) < new Date() && !decision.decision_taken_date;
            return (
              <TableRow key={decision.decision_id} sx={{ backgroundColor: isPastDueDate ? '#ffcccc' : 'inherit' }}>
                <TableCell>{indexOfFirstRecord + index + 1}</TableCell>
                <TableCell>{decision.decision_name}</TableCell>
                {/* <TableCell>{new Date(decision.decision_due_date).toLocaleDateString()}</TableCell> 
                  <TableCell>
                  {decision.decision_taken_date
                    ? new Date(decision.decision_taken_date).toLocaleDateString()
                    : '--'}
                </TableCell> */}
              
<TableCell> {formatDate(decision.decision_due_date)} </TableCell>
<TableCell> {formatDate(decision.decision_taken_date)}</TableCell>
            
                <TableCell>{decision.user_statement}</TableCell>
                <TableCell>
                  {decision.tags.map(tag => (
                    <Chip key={tag.id} label={tag.tag_name} />
                  ))}
                </TableCell>
                <TableCell>
                  {decision.decision_reason && (
                    <Typography variant="body2">
                      {decision.decision_reason.map(reason => reason.decision_reason_text).join(', ')}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {comments[decision.decision_id] ? (
                    comments[decision.decision_id].length > 0 ? (
                      <Box sx={{ display: 'flex' }}>
                        <Typography variant="body2">
                          {comments[decision.decision_id].length} comments
                        </Typography>
                      </Box>
                    ) : (
                      'No Comments Found'
                    )
                  ) : (
                    <CircularProgress size={24} />
                  )}
                </TableCell>
                <TableCell>
                  <IconButton
                    component={Link}
                    to={`/decision/${decision.decision_id}`}
                    style={{ color: '#526D82' }}
                  >
                    <MdModeEdit />
                  </IconButton>
                  <IconButton onClick={() => deleteDecision(decision.decision_id)} style={{ color: '#526D82' }}>
                    <MdDelete />
                  </IconButton>
                  <IconButton
                    component={Link}
                    to={`/views/${decision.decision_id}`}
                    style={{ color: '#526D82' }}
                  >
                    <GrFormView />
                  </IconButton>
                  <IconButton
                    component={Link}
                    to={`/sharecircle/${decision.decision_id}`}
                    style={{ color: '#526D82' }}
                  >
                    <FaShareAlt className='fs-5' />
                  </IconButton>
                  <IconButton
                    component={Link}
                    to={`/link/${decision.decision_id}?name=${decision.decision_name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#526D82' }}
                  >
                    <MdLink />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderTabularView = () => {
    const tagCounts = {};
    const tagTypes = {};

    data.forEach((decision) => {
      if (decision.tags) {
        decision.tags.forEach((tag) => {
          if (tagCounts[tag.tag_name]) {
            tagCounts[tag.tag_name]++;
          } else {
            tagCounts[tag.tag_name] = 1;
            tagTypes[tag.tag_name] = tag.tag_type || 'Unknown';
          }
        });
      }
    });

    const totalTags = Object.values(tagCounts).reduce((sum, count) => sum + count, 0);

    const sortedTags = Object.keys(tagCounts).sort((a, b) => {
      if (sortCriteria === 'name') {
        return a.localeCompare(b);
      } else {
        return tagCounts[b] - tagCounts[a];
      }
    });

    const rows = sortedTags.map((tag, index) => ({
      id: index,
      tag: tag,
      count: tagCounts[tag],
      tagType: tagTypes[tag],
      percentage: ((tagCounts[tag] / totalTags) * 100).toFixed(2),
    }));

    const columns = [
      {
        field: 'tag',
        headerName: 'Tag Name',
        width: 200,
        headerClassName: 'super-app-theme--header',
      },
      {
        field: 'count',
        headerName: 'Decisions Count',
        width: 150,
        headerClassName: 'super-app-theme--header',
      },
      {
        field: 'tagType',
        headerName: 'Tag Type',
        width: 200,
        headerClassName: 'super-app-theme--header',
        sortable: false,
      },
    ];


    const pieData = rows.map(row => ({
      name: row.tag,
      value: row.count,
      tagType: row.tagType,
      percentage: row.percentage,
    }));

    const advancedTagsData = pieData.filter(data => data.tagType === 'Advanced Tags');
    const decisionMaturityTagsData = pieData.filter(data => data.tagType === 'Decision Maturity');
    const sharpenthesawData = pieData.filter(data => data.tagType === 'Sharpen the Saw');
    const OutcomeData = pieData.filter(data => data.tagType === 'Outcome');
    const TimeSpanData = pieData.filter(data => data.tagType === 'Time Span');
    const UrgencyData = pieData.filter(data => data.tagType === 'Urgency');
    const FinancialData = pieData.filter(data => data.tagType === 'Financial Outcome');
    // const otherTagsData = pieData.filter(data => data.tagType !== 'Advanced Tags' && data.tagType !== 'Decision Maturity');

    const COLORS = [
      '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384',
      '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
      '#FF5370', '#7E57C2', '#78909C', '#8D6E63', '#D4E157'
    ];

    return (
      <div className='container-fluid'>
        <div className='decision-factor-button'>
          <Link to='/getall'>
          <Button>Decision Factors</Button>
          </Link>
        </div>
        <div className='row'>
          <div className='col-12 col-lg-6 d-flex mt-3 justify-content-center'>
            <TableContainer component={Paper} sx={{ padding: 2, maxWidth: '585px', borderRadius: '10px', marginBottom: '20px' }}>
              <DataGrid
                rows={rows.slice(0, 50)}
                columns={columns}
                autoHeight
                pageSize={50}
                rowsPerPageOptions={[50]}
                hideFooter
                sx={{
                  '& .super-app-theme--header': {
                    backgroundColor: '#526D82',
                    '&:hover': {
                      backgroundColor: 'rgb(197, 200, 202)',
                    },
                  },
                  '& .MuiDataGrid-cell': {
                    textAlign: 'baseline',
                  },
                }}
              />
            </TableContainer>
          </div>

          <div className='col-12 col-lg-6'>
            <div className='row'>
              <div className='col-12 col-md-6 d-flex justify-content-center'>
                <div className='d-flex flex-column align-items-center'>
                  <h3>Advanced Tags:</h3>
                  <PieChart width={350} height={450}>
                    <Pie
                      data={advancedTagsData}
                      cx={150}
                      cy={150}
                      outerRadius={100}
                      paddingAngle={1}
                      dataKey="value"
                    >
                      {advancedTagsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={({ payload }) => payload[0] ? `${payload[0].name}: ${payload[0].value} (${payload[0].payload.percentage}%)` : null} />
                    <Legend />
                  </PieChart>
                </div>
              </div>

              <div className='col-12 col-md-6 d-flex justify-content-center'>
                <div className='d-flex flex-column align-items-center'>
                  <h3>Time Span Tags:</h3>
                  <PieChart width={300} height={300}>
                    <Pie
                      data={TimeSpanData}
                      cx={150}
                      cy={150}
                      outerRadius={100}
                      paddingAngle={1}
                      dataKey="value"
                    >
                      {TimeSpanData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={({ payload }) => payload[0] ? `${payload[0].name}: ${payload[0].value} (${payload[0].payload.percentage}%)` : null} />
                    <Legend layout="horizontal" align="right" />
                  </PieChart>
                </div>
              </div>
            </div>

            <div className='row'>
              <div className='col-12 col-md-6 d-flex justify-content-center'>
                <div className='d-flex flex-column align-items-center'>
                  <h3>Sharpen The Saw Tags:</h3>
                  <PieChart width={300} height={350}>
                    <Pie
                      data={sharpenthesawData}
                      cx={150}
                      cy={150}
                      outerRadius={100}
                      paddingAngle={1}
                      dataKey="value"
                    >
                      {sharpenthesawData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={({ payload }) => payload[0] ? `${payload[0].name}: ${payload[0].value} (${payload[0].payload.percentage}%)` : null} />
                    <Legend layout="horizontal" align="right" />
                  </PieChart>
                </div>
              </div>

              <div className='col-12 col-md-6 d-flex justify-content-center'>
                <div className='d-flex flex-column align-items-center'>
                  <h3>Outcome Tags:</h3>
                  <PieChart width={300} height={300}>
                    <Pie
                      data={OutcomeData}
                      cx={150}
                      cy={150}
                      outerRadius={100}
                      paddingAngle={1}
                      dataKey="value"
                    >
                      {OutcomeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={({ payload }) => payload[0] ? `${payload[0].name}: ${payload[0].value} (${payload[0].payload.percentage}%)` : null} />
                    <Legend />
                  </PieChart>
                </div>
              </div>
            </div>

            <div className='row'>
              <div className='col-12 col-md-6 d-flex justify-content-center'>
                <div className='d-flex flex-column align-items-center'>
                  <h3>Urgency Tags:</h3>
                  <PieChart width={300} height={300}>
                    <Pie
                      data={UrgencyData}
                      cx={150}
                      cy={150}
                      outerRadius={100}
                      paddingAngle={1}
                      dataKey="value"
                    >
                      {UrgencyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={({ payload }) => payload[0] ? `${payload[0].name}: ${payload[0].value} (${payload[0].payload.percentage}%)` : null} />
                    <Legend />
                  </PieChart>
                </div>
              </div>

              <div className='col-12 col-md-6 d-flex justify-content-center'>
                <div className='d-flex flex-column align-items-center'>
                  <h3>Decision Driver Tags:</h3>
                  <PieChart width={300} height={350}>
                    <Pie
                      data={decisionMaturityTagsData}
                      cx={150}
                      cy={150}
                      outerRadius={110}
                      paddingAngle={1}
                      dataKey="value"
                    >
                      {decisionMaturityTagsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={({ payload }) => payload[0] ? `${payload[0].name}: ${payload[0].value} (${payload[0].payload.percentage}%)` : null} />
                    <Legend />
                  </PieChart>
                </div>
              </div>

              <div className='row'>
                <div className='col-12 col-md-6 d-flex justify-content-center'>
                  <div className='d-flex flex-column align-items-center'>
                    <h3>Financial Tags:</h3>
                    <PieChart width={300} height={300}>
                      <Pie
                        data={FinancialData}
                        cx={150}
                        cy={150}
                        outerRadius={100}
                        paddingAngle={1}
                        dataKey="value"
                      >
                        {FinancialData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={({ payload }) => payload[0] ? `${payload[0].name}: ${payload[0].value} (${payload[0].payload.percentage}%)` : null} />
                      <Legend />
                    </PieChart>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <TrendChart />
        </div>
      </div>
    );
  };

  const renderTimelineView = () => {
    const filteredDecisions = data
      .filter(decision => (showPendingDecisions ? !decision.decision_taken_date : true))
      .filter(decision => {
        if (selectedTag === 'Advanced Tags') {
          return decision.tags.some(tag => tag.tag_type === 'Advanced Tags');
        }
        if (selectedTag === 'Sharpen the Saw') {
          return decision.tags.some(tag => tag.tag_type === 'Sharpen the Saw');
        }
        if (selectedTag === 'Outcome') {
          return decision.tags.some(tag => tag.tag_type === 'Outcome');
        }
        if (selectedTag === 'Time Span') {
          return decision.tags.some(tag => tag.tag_type === 'Time Span');
        }
        if (selectedTag === 'Urgency') {
          return decision.tags.some(tag => tag.tag_type === 'Urgency');
        }
        if (selectedTag === 'Financial Outcome') {
          return decision.tags.some(tag => tag.tag_type === 'Financial Outcome');
        }
        if (selectedTag === 'Decision Maturity') {
          return decision.tags.some(tag => tag.tag_type === 'Decision Maturity');
        }
        if (selectedTag !== '' && selectedTag !== 'All Tags') {
          return decision.tags.some(tag => tag.tag_name === selectedTag);
        }
        return true;
      });
    const decisionsByMonth = filteredDecisions.reduce((acc, decision) => {
      const decisionDate = decision.decision_taken_date
        ? new Date(decision.decision_taken_date)
        : new Date(decision.decision_due_date);
      const month = decisionDate.toLocaleString('default', { month: 'long', year: 'numeric' });

      if (!acc[month]) acc[month] = [];
      acc[month].push(decision);
      return acc;
    }, {});

    const sortedMonths = Object.keys(decisionsByMonth).sort((a, b) => {
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');
      return new Date(`${yearB}-${new Date(`${monthB} 1, ${yearB}`).getMonth() + 1}-01`) - new Date(`${yearA}-${new Date(`${monthA} 1, ${yearA}`).getMonth() + 1}-01`);
    });

    return (
      <Box sx={{ position: 'relative', marginTop: 2 }}>
        <Box sx={{ position: 'absolute', left: '50%', top: '0%', bottom: '0%', width: '4px', backgroundColor: '#526D82', transform: 'translateX(-50%)', borderRadius: '0.1rem', zIndex: 1 }} />
        {sortedMonths.map((month, index) => (

          <Box key={month} sx={{ marginBottom: 4 }}>
            <Typography variant="h6" sx={{ color: '#526D82', textAlign: 'center', marginBottom: 2, backgroundColor: '#DDE6ED', borderRadius: '4px', padding: '4px', zIndex: 2, position: 'relative' }}>
              {month}
            </Typography>

            {decisionsByMonth[month].map((decision) => (

              <Box
                key={decision.decision_id}
                sx={{
                  display: 'flex',
                  justifyContent: index % 2 === 0 ? 'flex-start' : 'flex-end',
                  position: 'relative',
                  marginBottom: 2
                }}
              >
                <Box
                  sx={{
                    width: '45%',
                    backgroundColor: expandedDecision === decision.decision_id ? '#526D82' : 'white',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #526D82',
                    position: 'relative',
                    cursor: 'pointer',
                    boxShadow: expandedDecision === decision.decision_id ? '0px 0px 10px 2px rgba(82, 109, 130, 0.7)' : 'none'
                  }}
                  onClick={() => setExpandedDecision(expandedDecision === decision.decision_id ? null : decision.decision_id)}
                >
                  <Typography variant="body2" sx={{ marginLeft: 2 }}>
                    {decision.decision_name}
                  </Typography>
                </Box>
                {expandedDecision === decision.decision_id && (
                  <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', zIndex: 3 }}>
                    <Typography variant="h6" sx={{ color: '#526D82', marginBottom: '0.5rem' }}>Decision Details</Typography>
                    <Typography variant="body2">Decision Due Date: {new Date(decision.decision_due_date).toLocaleDateString()}</Typography>
                    <Typography variant="body2">Decision Taken Date: {decision.decision_taken_date ? new Date(decision.decision_taken_date).toLocaleDateString() : '--'}</Typography>
                    <Typography variant="body2">Decision Details: {decision.user_statement}</Typography>
                    <Typography variant="body2">Tags: {decision.tags.map(tag => (
                      <Chip key={tag.id} label={tag.tag_name} />
                    ))}</Typography>
                    <Typography variant="body2">Decision Reasons:</Typography>
                    {decision.decision_reason && decision.decision_reason.map(reason => (
                      <Typography variant="body2" key={reason.id}>
                        {reason.decision_reason_text}
                      </Typography>
                    ))}
                    <Typography variant="body2">Comments: {comments[decision.decision_id] ? comments[decision.decision_id].length : 0}</Typography>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    );
  };
  const handlePageChange = (event, pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const deleteDecision = async id => {
    if (window.confirm('Are you sure that you want to delete this decision?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/details/${id}`);
        toast.success('Decision deleted successfully');
        setData(prevData => prevData.filter(decision => decision.decision_id !== id));
      } catch (error) {
        console.error('Error deleting decision:', error);
        toast.error('An error occurred while deleting the decision');
      }
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Button
        variant="contained"
        onClick={() => {
          if (subscriptionInfo.subscriptionRequired && !subscriptionInfo.isSubscribed) {
            toast.info('Monthly limit reached. Please subscribe to continue.');
          } else {
            window.location.href = '/decision';
          }
        }}
        sx={{
          backgroundColor: '#526D82',
          color: 'white',
          '&:hover': { backgroundColor: '#405060' },
          marginBottom: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        Add Decision
        {subscriptionInfo.subscriptionRequired && !subscriptionInfo.isSubscribed && (
          <LockIcon fontSize="small" />
        )}
      </Button>

      <Typography variant="body2" sx={{ mb: 1, color: '#526D82' }}>
        Decisions this month: {subscriptionInfo.monthlyCount} / {subscriptionInfo.limit}
      </Typography>

      {subscriptionInfo.subscriptionRequired && !subscriptionInfo.isSubscribed && (
        <Button
          variant="contained"
          color="success"
          onClick={startSubscription}
          disabled={subscriptionLoading}
          sx={{ mb: 2, minWidth: 180 }}
        >
          {subscriptionLoading ? (
            <>
              <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
              Redirecting…
            </>
          ) : (
            'Subscribe $1 / Month'
          )}
        </Button>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <Box>
          <Button
            variant={view === 'table' ? 'contained' : 'outlined'}
            onClick={() => setView('table')}
            sx={{
              backgroundColor: view === 'table' ? '#526D82' : undefined,
              color: view === 'table' ? 'white' : '#526D82',
              '&:hover': {
                backgroundColor: view === 'table' ? '#405060' : undefined
              },
              marginRight: 2
            }}
          >
            Table View
          </Button>
          <Button
            variant={view === 'timeline' ? 'contained' : 'outlined'}
            onClick={() => setView('timeline')}
            sx={{
              backgroundColor: view === 'timeline' ? '#526D82' : undefined,
              color: view === 'timeline' ? 'white' : '#526D82',
              '&:hover': {
                backgroundColor: view === 'timeline' ? '#405060' : undefined
              },
              marginRight: 2
            }}
          >
            Timeline View
          </Button>
          <Button
            variant={view === 'tabular' ? 'contained' : 'outlined'}
            onClick={() => setView('tabular')}
            sx={{
              backgroundColor: view === 'tabular' ? '#526D82' : undefined,
              color: view === 'tabular' ? 'white' : '#526D82',
              '&:hover': {
                backgroundColor: view === 'tabular' ? '#405060' : undefined
              }
            }}
          >
            How Am I Doing?
          </Button>
        </Box>
        {(view === 'timeline' || view === 'table') && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ marginRight: '0.5rem', marginLeft: '1rem', color: '#5c5c5b' }}>Show pending decisions</label>
            <label className="custom-switch">
              <input
                type="checkbox"
                checked={showPendingDecisions}
                onChange={() => setShowPendingDecisions(!showPendingDecisions)}
              />
              <span className="slider"></span>
            </label>
            {view === 'table' && (
              <Box
                component="input"
                placeholder="Search by decision name or tag name"
                value={selectedTag}
                onChange={e => setSelectedTag(e.target.value)}
                sx={{
                  marginLeft: 2,
                  borderRadius: '0.5rem',
                  border: '0.1rem solid #526D82',
                  padding: '0.4rem',
                  width: '100%',
                  maxWidth: '15rem',
                  fontSize: '0.8rem',
                  '&:focus': {
                    outline: 'none'
                  }
                }}
              />
            )}
            {view === 'timeline' && (
              <Select
                value={selectedTag}
                onChange={e => setSelectedTag(e.target.value)}
                displayEmpty
                inputProps={{ 'aria-label': 'Select Tag' }}
                sx={{
                  marginLeft: 2,
                  borderRadius: '0.5rem',
                  border: '0.1rem solid #526D82',
                  padding: '0.01rem',
                  width: '100%',
                  maxWidth: '15rem',
                  fontSize: '0.8rem',
                  '@media (max-width: 600px)': {
                    maxWidth: '5rem'
                  },
                  '&:focus': {
                    outline: 'none'
                  }
                }}
              >
                <MenuItem value="">All Tags</MenuItem>
                <MenuItem value="Advanced Tags">Advanced Tags</MenuItem>
                <MenuItem value="Sharpen the Saw">Sharpen the Saw</MenuItem>
                <MenuItem value="Time Span">Time Span</MenuItem>
                <MenuItem value='Outcome'>OutCome</MenuItem>
                <MenuItem value='Decision Maturity'>Decision Maturity</MenuItem>
                <MenuItem value='Financial Outcome'>Financial Outcome</MenuItem>

              </Select>

            )}
          </Box>
        )}
      </Box>
      {view === 'table' && renderTableView()}
      {view === 'timeline' && renderTimelineView()}
      {view === 'tabular' && renderTabularView()}
      {(view === 'table') && (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
          <Pagination
            count={Math.ceil(filteredData.length / recordsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            sx={{
              '& .MuiPaginationItem-page.Mui-selected': {
                backgroundColor: '#526D82',
                color: 'white'
              }
            }}
          />
        </Box>
      )}
      <ToastContainer />
    </Box>
  );
};

export default withAuth(Readd);