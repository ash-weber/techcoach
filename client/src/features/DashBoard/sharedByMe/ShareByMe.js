// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { getSharedDecisionDetails } from '../Group/Network_Call';
// import withAuth from '../withAuth';
// import './Nav/Nav.css';
// import { Card, Typography, Grid, CircularProgress, Box, CardContent, Button, Select, MenuItem } from '@mui/material';
// import { Link } from 'react-router-dom';

// const ShareWithMe = () => {
//   const [sharedDecisionDetails, setSharedDecisionDetails] = useState({ sharedDecisions: [], decisions: [], tasks: [] });
//   const [loading, setLoading] = useState(true);
//   const [showPendingDecisions, setShowPendingDecisions] = useState(false);
//   const [selectedTag, setSelectedTag] = useState('');
//   const [searchQuery, setSearchQuery] = useState('');
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchSharedDecisionsDetails = async () => {
//       try {
//         const details = await getSharedDecisionDetails();
//         setSharedDecisionDetails(details);
//         setLoading(false);
//       } catch (error) {
//         console.error("Failed to fetch shared decisions details", error);
//         setLoading(false);
//       }
//     };
//     fetchSharedDecisionsDetails();
//   }, []);

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (!sharedDecisionDetails || !sharedDecisionDetails.sharedDecisions || sharedDecisionDetails.sharedDecisions.length === 0) {
//     return (
//       <div className='mt-5 sharebutton'>
//         <center>
//           <Grid container spacing={3} justifyContent="center">
//             <Grid item xs={12} md={8}>
//               <Card className="share-card">
//                 <CardContent>
//                   <Typography variant="h6" gutterBottom className="share-message">
//                     To share a decision, open one of your decisions and share with your Inner Circle
//                   </Typography>
//                   <Link to='/innerCircleDisplay'>
//                     <Button variant="contained" color="primary" className="share-button">
//                       Click me
//                     </Button>
//                   </Link>
//                 </CardContent>
//               </Card>
//             </Grid>
//           </Grid>
//         </center>
//       </div>
//     );
//   }

//   const getUserName = (userId) => {
//     const user = sharedDecisionDetails.tasks.find(task => task.user_id === userId);
//     return user ? user.displayname : 'Unknown User';
//   };

//   const getDecisionName = (decisionId) => {
//     const decision = sharedDecisionDetails.decisions.find(decision => decision.decision_id === decisionId);
//     return decision ? decision.decision_name : 'Unknown Decision';
//   };

//   const getTagNames = (decisionId) => {
//     const decision = sharedDecisionDetails?.decisions?.find(decision => decision.decision_id === decisionId);
//     if (!decision || !decision.tags) return [];

//     return decision.tags.map(tag => tag.tag_name);
//   };

//   const handleCardClick = (decisionId) => {
//     navigate(`/views/${decisionId}`);
//   };

//   const decisionMap = new Map(sharedDecisionDetails.decisions.map(decision => [decision.decision_id, decision.decision_name]));

//     const filterDecisions = (sharedDecisions, decisions) => {
//       return sharedDecisions
//       .filter(sharedDecision => {
//         const decision = decisions.find(d => d.decision_id === sharedDecision.decisionId);

//         if (showPendingDecisions) {
//           return decision && decision.decision_taken_date === null;
//         }
//         return true;
//       })
//         .filter(decision => {
//           const decisionName = decisionMap.get(decision.decisionId);
//           return decisionName && decisionName.toLowerCase().includes(searchQuery.toLowerCase());
//         })
//         .filter(decision =>{
//           const tags = decisionMap.get(decision.decisionId);
//           return tags && tags.toLowerCase().includes(searchQuery.toLowerCase());
//         })
//         .filter(decision => {
//           const tags = decisions.find(d => d.decision_id === decision.decisionId)?.tags;
//           if (selectedTag && selectedTag !== 'All Tags') {
//             return tags?.some(tag => tag.tag_type === selectedTag || tag.tag_name === selectedTag);
//           }
//           return true;
//         })
//         .map(decision => ({
//           ...decision,
//           decision_name: decisionMap.get(decision.decisionId),
//           tag_names: getTagNames(decision.decisionId) 
//         }));
//     };

//   const filteredDecisions = filterDecisions(sharedDecisionDetails.sharedDecisions, sharedDecisionDetails.decisions);

//   return (
//     <Grid style={{ margin: "1rem" }}>
//       <Grid item xs={12} md={6} className='entertype'>
//         <input
//           type='text'
//           placeholder='Search Decision Name'
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           style={{width:'400px' }}
//         /> 
//         <Select
//           value={selectedTag}
//           onChange={e => setSelectedTag(e.target.value)}
//           displayEmpty
//           inputProps={{ 'aria-label': 'Select Tag' }}
//           sx={{
//             width: '100%',
//             maxWidth: '10rem',
//             fontSize: '0.8rem',
//             '@media (max-width: 600px)': {
//               maxWidth: '8rem'
//             }
//           }}
//         >
//           <MenuItem value="">All Tags</MenuItem>
//           <MenuItem value="Advanced Tags">Advanced Tags</MenuItem>
//           <MenuItem value="Sharpen the Saw">Sharpen the Saw</MenuItem>
//           <MenuItem value="Outcome">Outcome</MenuItem>
//           <MenuItem value="Time Span">Time Span</MenuItem>
//           <MenuItem value="Urgency">Urgency</MenuItem>
//           <MenuItem value="Financial Outcome">Financial Outcome</MenuItem>
//           <MenuItem value="Decision Maturity">Decision Maturity</MenuItem>
//         </Select>
//         <Button
//           className='bg-light rounded mt-2'
//           onClick={() => setShowPendingDecisions(!showPendingDecisions)}
//         >
//           {showPendingDecisions ? 'Show All Decisions' : 'Show Pending Decisions'}
//         </Button>
//       </Grid>

//       <Grid container spacing={2} className='mt-2 share-decisions'>
//         {filteredDecisions.map(sharedDecision => (
//           <Grid item xs={12} sm={6} md={4} key={sharedDecision.id}>
//             <Card onClick={() => handleCardClick(sharedDecision.decisionId)} style={{ cursor: 'pointer', border: "0.01rem solid #3F5362" }}>
//               <CardContent>
//                 <Typography variant="h6" component="div">
//                   {getDecisionName(sharedDecision.decisionId)}
//                 </Typography>
//                 <Typography variant="body2" color="textSecondary">
//                   Tags: {getTagNames(sharedDecision.decisionId).join(',')}
//                 </Typography>
//                 <Typography variant="body2" color="textSecondary">
//                   Shared with: {getUserName(sharedDecision.groupMember)}
//                 </Typography>
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>
//     </Grid>
//   );
// };

// const NoRecordsCard = ({ message }) => {
//   const cardStyle = {
//     marginBottom: 12,
//     border: '1px solid #526D82',
//     borderRadius: '8px',
//     backgroundColor: '#ffffff',
//     width: '70%',
//     height: '70%',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: '15px',
//     textAlign: 'center'
//   };

//   return (
//     <Card style={cardStyle}>
//       <Typography variant="body1">{message}</Typography>
//     </Card>
//   );
// };

// export default withAuth(ShareWithMe);


// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { getSharedDecisionDetails } from '../Group/Network_Call';
// import { getdecisionSharedDecisionCirclebyuser } from '../Decision_Circle/Networkk_Call';
// import withAuth from '../withAuth';
// import './Nav/Nav.css';
// import { Card, Typography, Grid, CircularProgress, Box, CardContent, Button, Select, MenuItem } from '@mui/material';
// import { Link } from 'react-router-dom';

// const ShareWithMe = () => {
//   const [sharedDecisionDetails, setSharedDecisionDetails] = useState({ sharedDecisions: [], decisions: [], tasks: [] });
//   const [sharedDecisionCircleDetails, setSharedDecisionCircleDetails] = useState({ decisions: [] });
//   const [loading, setLoading] = useState(true);
//   const [showPendingDecisions, setShowPendingDecisions] = useState(false);
//   const [selectedTag, setSelectedTag] = useState('');
//   const [searchQuery, setSearchQuery] = useState('');
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchSharedDecisionsDetails = async () => {
//       try {
//         const details = await getSharedDecisionDetails();
//         setSharedDecisionDetails(details);

//         setLoading(false);
//       } catch (error) {
//         console.error("Failed to fetch shared decisions details", error);
//         setLoading(false);
//       }
//     };
//     fetchSharedDecisionsDetails();
//   }, []);


//   useEffect(() => {
//     const fetchSharedDecisionsCircleDetails = async () => {
//       try {
//         const response = await getdecisionSharedDecisionCirclebyuser();
//         setSharedDecisionCircleDetails({decisions:response});

//         setLoading(false);
//       } catch (error) {
//         console.error("Failed to fetch shared decisions details", error);
//         setLoading(false);
//       }
//     };
//     fetchSharedDecisionsCircleDetails();
//   }, []);

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (!sharedDecisionDetails || !sharedDecisionDetails.sharedDecisions || sharedDecisionDetails.sharedDecisions.length === 0) {
//     return (
//       <div className='mt-5 sharebutton'>
//         <center>
//           <Grid container spacing={3} justifyContent="center">
//             <Grid item xs={12} md={8}>
//               <Card className="share-card">
//                 <CardContent>
//                   <Typography variant="h6" gutterBottom className="share-message">
//                     To share a decision, open one of your decisions and share with your Inner Circle
//                   </Typography>
//                   <Link to='/innerCircleDisplay'>
//                     <Button variant="contained" color="primary" className="share-button">
//                       Click me
//                     </Button>
//                   </Link>
//                 </CardContent>
//               </Card>
//             </Grid>
//           </Grid>
//         </center>
//       </div>
//     );
//   }

//   const getUserName = (userId) => {
//     const user = sharedDecisionDetails.tasks.find(task => task.user_id === userId);
//     return user ? user.displayname : 'Unknown User';
//   };

//   const getDecisionName = (decisionId) => {
//     const decision = sharedDecisionDetails.decisions.find(decision => decision.decision_id === decisionId);
//     return decision ? decision.decision_name : 'Unknown Decision';
//   };

//   const getTagNames = (decisionId) => {
//     const decision = sharedDecisionDetails?.decisions?.find(decision => decision.decision_id === decisionId);
//     if (!decision || !decision.tags) return [];

//     return decision.tags.map(tag => tag.tag_name);
//   };


//   const handleCardClick = (decisionId) => {
//     navigate(`/views/${decisionId}`);
//   };

//   const decisionMap = new Map(sharedDecisionDetails.decisions.map(decision => [decision.decision_id, decision.decision_name]));

//   const filterDecisions = (sharedDecisions, decisions) => {
//     return sharedDecisions
//       .filter(sharedDecision => {
//         const decision = decisions.find(d => d.decision_id === sharedDecision.decisionId);

//         if (showPendingDecisions) {
//           return decision && decision.decision_taken_date === null;
//         }
//         return true;
//       })
//       .filter(decision => {
//         const decisionName = decisionMap.get(decision.decisionId);
//         return decisionName && decisionName.toLowerCase().includes(searchQuery.toLowerCase());
//       })
//       .filter(decision => {
//         const tags = decisionMap.get(decision.decisionId);
//         return tags && tags.toLowerCase().includes(searchQuery.toLowerCase());
//       })
//       .filter(decision => {
//         const tags = decisions.find(d => d.decision_id === decision.decisionId)?.tags;
//         if (selectedTag && selectedTag !== 'All Tags') {
//           return tags?.some(tag => tag.tag_type === selectedTag || tag.tag_name === selectedTag);
//         }
//         return true;
//       })
//       .map(decision => ({
//         ...decision,
//         decision_name: decisionMap.get(decision.decisionId),
//         tag_names: getTagNames(decision.decisionId)
//       }));
//   };

//   const filteredDecisions = filterDecisions(sharedDecisionDetails.sharedDecisions, sharedDecisionDetails.decisions);

//   return (
//     <Grid style={{ margin: "1rem" }}>
//       <Grid item xs={12} md={6} className='entertype'>
//         <input
//           type='text'
//           placeholder='Search Decision Name'
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           style={{ width: '400px' }}
//         />
//         <Select
//           value={selectedTag}
//           onChange={e => setSelectedTag(e.target.value)}
//           displayEmpty
//           inputProps={{ 'aria-label': 'Select Tag' }}
//           sx={{
//             width: '100%',
//             maxWidth: '10rem',
//             fontSize: '0.8rem',
//             '@media (max-width: 600px)': {
//               maxWidth: '8rem'
//             }
//           }}
//         >
//           <MenuItem value="">All Tags</MenuItem>
//           <MenuItem value="Advanced Tags">Advanced Tags</MenuItem>
//           <MenuItem value="Sharpen the Saw">Sharpen the Saw</MenuItem>
//           <MenuItem value="Outcome">Outcome</MenuItem>
//           <MenuItem value="Time Span">Time Span</MenuItem>
//           <MenuItem value="Urgency">Urgency</MenuItem>
//           <MenuItem value="Financial Outcome">Financial Outcome</MenuItem>
//           <MenuItem value="Decision Maturity">Decision Maturity</MenuItem>
//         </Select>
//         <Button
//           className='bg-light rounded mt-2'
//           onClick={() => setShowPendingDecisions(!showPendingDecisions)}
//         >
//           {showPendingDecisions ? 'Show All Decisions' : 'Show Pending Decisions'}
//         </Button>
//       </Grid>

//       <Grid container spacing={2} className='mt-2 share-decisions'>
//         {filteredDecisions.map(sharedDecision => (
//           <Grid item xs={12} sm={6} md={4} key={sharedDecision.id}>
//             <Card onClick={() => handleCardClick(sharedDecision.decisionId)} style={{ cursor: 'pointer', border: "0.01rem solid #3F5362" }}>
//               <CardContent>
//                 <Typography variant="h6" component="div">
//                   {getDecisionName(sharedDecision.decisionId)}
//                 </Typography>
//                 <Typography variant="body2" color="textSecondary">
//                   Tags: {getTagNames(sharedDecision.decisionId).join(',')}
//                 </Typography>
//                 <Typography variant="body2" color="textSecondary">
//                   Shared with: {getUserName(sharedDecision.groupMember)}
//                 </Typography>
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>

//       <Grid container spacing={2} className='mt-2 share-decisions'>
//         {sharedDecisionCircleDetails.decisions && sharedDecisionCircleDetails.decisions.length > 0 ? (
//           sharedDecisionCircleDetails.decisions.map((decision, index) => (
//             <Grid item xs={12} sm={6} md={4} key={index}>
//               <Card onClick={() => handleCardClick(decision.decision_id)} style={{ cursor: 'pointer', border: '0.01rem solid #3F5362' }}>
//                 <CardContent>
//                   <Typography variant="h6" component="div">
//                     {decision.decision_name}
//                   </Typography>
//                   <Typography variant="body2" color="textSecondary">
//                     Tags: {decision.tags ? decision.tags.map(tag => tag.tag_name).join(', ') : 'No Tags'}
//                   </Typography>
//                   <Typography variant="body2" color="textSecondary">
//                     Shared Group Name: {(decision.group_name)}
//                   </Typography>
//                   <Typography variant="body2" color="textSecondary">
//                     <b>Shared with: {(decision.shared_with_names)}</b>
//                   </Typography>
//                 </CardContent>
//               </Card>
//             </Grid>
//           ))
//         ) : (
//           <Grid item xs={12}>
//             <Typography variant="h6" align="center">
//               No decisions found for the shared decision circle.
//             </Typography>
//           </Grid>
//         )}
//       </Grid>

//     </Grid>
//   );
// };

// const NoRecordsCard = ({ message }) => {
//   const cardStyle = {
//     marginBottom: 12,
//     border: '1px solid #526D82',
//     borderRadius: '8px',
//     backgroundColor: '#ffffff',
//     width: '70%',
//     height: '70%',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: '15px',
//     textAlign: 'center'
//   };

//   return (
//     <Card style={cardStyle}>
//       <Typography variant="body1">{message}</Typography>
//     </Card>
//   );
// };

// export default withAuth(ShareWithMe);

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSharedDecisionDetails } from '../../../api/InnerCircle/Network_Call';
import { getUserSharedDecisions } from '../../../api/DecisionCircle/Network_Call';
import withAuth from '../../../utils/withAuth';
import {
  Card,
  Typography,
  Grid,
  CircularProgress,
  Box,
  CardContent,
  Button,
  Avatar,
  Tooltip,
  IconButton,
} from '@mui/material';
import { Link } from 'react-router-dom';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import "../../../assets/styles/pages/SharedDecision.css";

const ShareByMe = () => {
  const [sharedDecisionDetails, setSharedDecisionDetails] = useState({
    sharedDecisions: [],
    decisions: [],
    tasks: [],
  });
  const [sharedDecisionCircleDetails, setSharedDecisionCircleDetails] = useState({
    decisions: [],
  });
  const [loading, setLoading] = useState(true);
  const [showPendingDecisions, setShowPendingDecisions] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateSortOrder, setDateSortOrder] = useState('desc');
  const [selectedUser, setSelectedUser] = useState(null);
  const [autocompleteValue, setAutocompleteValue] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSharedDecisionsDetails = async () => {
      try {
        const details = await getSharedDecisionDetails();
        setSharedDecisionDetails(details || { sharedDecisions: [], decisions: [], tasks: [] });
      } catch (error) {
        console.error("Failed to fetch shared decisions details", error);
        setSharedDecisionDetails({ sharedDecisions: [], decisions: [], tasks: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchSharedDecisionsDetails();
  }, []);

  useEffect(() => {
    const fetchSharedDecisionsCircleDetails = async () => {
      try {
        const response = await getUserSharedDecisions();
        setSharedDecisionCircleDetails({ decisions: response || [] });
      } catch (error) {
        console.error("Failed to fetch shared decision circle details", error);
        setSharedDecisionCircleDetails({ decisions: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchSharedDecisionsCircleDetails();
  }, []);

  const getUserName = (userId) => {
    const user = sharedDecisionDetails?.tasks?.find(task => task.user_id === userId);
    return user ? user.displayname : 'Unknown User';
  };

  const getDecisionName = (decisionId) => {
    const decision = sharedDecisionDetails?.decisions?.find(decision => decision.decision_id === decisionId);
    return decision ? decision.decision_name : 'Unknown Decision';
  };

  const getTagNames = (decisionId) => {
    const decision = sharedDecisionDetails?.decisions?.find(decision => decision.decision_id === decisionId);
    return decision?.tags?.map(tag => tag.tag_name) || [];
  };

  const handleCardClick = (decisionId) => {
    navigate(`/views/${decisionId}`);
  };

  const decisionMap = new Map(
    (sharedDecisionDetails?.decisions || []).map(decision => [
      decision.decision_id,
      decision.decision_name,
    ])
  );

  // Get unique users for the "Sort by Name" dropdown
  const getUniqueUsers = (decisions) => {
    const users = [];
    const emails = new Set();
    (decisions || []).forEach((decision) => {
      const user = sharedDecisionDetails?.tasks?.find(
        (task) => task.user_id === decision.groupMember
      );
      if (user && !emails.has(user.email)) {
        emails.add(user.email);
        users.push(user);
      }
    });
    return users;
  };

  const handleAutocompleteChange = (event) => {
    setAutocompleteValue(event.target.value);
    const selected = getUniqueUsers(sharedDecisionDetails?.sharedDecisions).find(
      (user) => `${user.displayname} (${user.email})` === event.target.value
    );
    setSelectedUser(selected);
  };

  const filterDecisions = (sharedDecisions = [], decisions = []) => {
    return sharedDecisions
      .filter((sharedDecision) => {
        const decision = decisions.find((d) => d.decision_id === sharedDecision.decisionId);
        if (showPendingDecisions) {
          return decision && decision.decision_taken_date === null;
        }
        return true;
      })
      .filter((decision) => {
        const decisionName = decisionMap.get(decision.decisionId);
        return decisionName && decisionName.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .filter((decision) => {
        if (selectedUser) {
          const user = sharedDecisionDetails?.tasks?.find(
            (task) => task.user_id === decision.groupMember
          );
          return user?.email === selectedUser.email;
        }
        return true;
      })
      .filter((decision) => {
        const tags = decisions.find((d) => d.decision_id === decision.decisionId)?.tags;
        if (selectedTag && selectedTag !== 'All Tags') {
          return tags?.some((tag) => tag.tag_type === selectedTag || tag.tag_name === selectedTag);
        }
        return true;
      })
      .sort((a, b) => {
        const decisionA = decisions.find((d) => d.decision_id === a.decisionId);
        const decisionB = decisions.find((d) => d.decision_id === b.decisionId);
        const dateA = new Date(decisionA?.creation_date || 0).getTime();
        const dateB = new Date(decisionB?.creation_date || 0).getTime();
        return dateSortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      })
      .map((decision) => ({
        ...decision,
        decision_name: decisionMap.get(decision.decisionId),
        tag_names: getTagNames(decision.decisionId),
      }));
  };

  const filteredDecisions = filterDecisions(
    sharedDecisionDetails?.sharedDecisions || [],
    sharedDecisionDetails?.decisions || []
  );

  const showNoInnerCircleDecisionsCard = sharedDecisionDetails?.sharedDecisions?.length === 0;
  const showNoDecisionCircleDecisionsCard = sharedDecisionCircleDetails?.decisions?.length === 0;

  if (loading) {
    return (
      <Box className="sharedDecision-page">
        <Box className="sharedDecision-loading">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box className="sharedDecision-page">
      <h2 className="sharedDecision-heading">Share By Me</h2>
      <p className="sharedDecision-subheading">
        Review the decisions you've shared with your Inner Circle and Decision Circle.
      </p>

      <Box
        className="sharedDecision-toolbar"
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "0.75rem",
          margin: "1rem 0",
        }}
      >
        <input
          type="text"
          placeholder="Search Decision Name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sharedDecision-user-select"
          style={{
            maxWidth: "260px",
            minWidth: "200px",
            flex: "1 1 200px",
          }}
        />

        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="sharedDecision-user-select"
          style={{ maxWidth: "200px", flex: "1 1 160px" }}
        >
          <option value="">All Tags</option>
          <option value="Advanced Tags">Advanced Tags</option>
          <option value="Sharpen the Saw">Sharpen the Saw</option>
          <option value="Outcome">Outcome</option>
          <option value="Time Span">Time Span</option>
          <option value="Urgency">Urgency</option>
          <option value="Financial Outcome">Financial Outcome</option>
          <option value="Decision Maturity">Decision Maturity</option>
        </select>

        <select
          className="sharedDecision-user-select"
          value={autocompleteValue}
          onChange={handleAutocompleteChange}
          style={{ maxWidth: "290px", flex: "1 1 220px" }}
        >
          <option value="">Sort by Name</option>
          {getUniqueUsers(sharedDecisionDetails?.sharedDecisions).map((user, index) => (
            <option key={index} value={`${user.displayname} (${user.email})`}>
              {user.displayname} ({user.email})
            </option>
          ))}
        </select>

        <Button
          onClick={() => setShowPendingDecisions(!showPendingDecisions)}
          variant="contained"
          sx={{
            minHeight: "42px",
            padding: "0.6rem 1.1rem",
            borderRadius: "var(--radius-sm)",
            fontFamily: "inherit",
            fontSize: "0.85rem",
            fontWeight: 650,
            textTransform: "none",
            boxShadow: "none",
            backgroundColor: showPendingDecisions
              ? "var(--brand-primary)"
              : "var(--surface-card)",
            color: showPendingDecisions ? "#fff" : "var(--text-main)",
            border: "1px solid var(--surface-border)",
            "&:hover": {
              backgroundColor: showPendingDecisions
                ? "var(--brand-primary-hover)"
                : "var(--brand-primary-light)",
            },
          }}
        >
          {showPendingDecisions ? 'Show All Decisions' : 'Show Pending Decisions'}
        </Button>

        <Tooltip
          title={dateSortOrder === "desc" ? "Newest to Oldest" : "Oldest to Newest"}
        >
          <IconButton
            className="sharedDecision-toolbar"
            onClick={() => setDateSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
            sx={{
              width: "42px",
              height: "42px",
              border: "1px solid var(--surface-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-muted)",
              "&:hover": {
                borderColor: "var(--brand-primary)",
                backgroundColor: "var(--brand-primary-light)",
                color: "var(--brand-primary)",
              },
            }}
          >
            <SwapVertIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Typography variant="h5" className="sharedDecision-comments-title" sx={{ mt: 3 }}>
        Inner Circle Decisions
      </Typography>

      {showNoInnerCircleDecisionsCard ? (
        <Box className="sharedDecision-empty">
          <Typography variant="h6" gutterBottom>
            To share a decision, open one of your decisions and share with your Inner Circle
          </Typography>
          <Link to="/inner-circle" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              color="primary"
              sx={{
                marginTop: "1rem",
                padding: "0.6rem 1.4rem",
                borderRadius: "var(--radius-sm)",
                textTransform: "none",
                fontWeight: 650,
                backgroundColor: "var(--brand-primary)",
                "&:hover": { backgroundColor: "var(--brand-primary-hover)" },
              }}
            >
              Share a Decision
            </Button>
          </Link>
        </Box>
      ) : filteredDecisions.length === 0 ? (
        <Box className="sharedDecision-empty">
          <Typography variant="body1">No decisions match your filters.</Typography>
        </Box>
      ) : (
        <Grid container spacing={2} className="mt-2">
          {filteredDecisions.map((sharedDecision) => {
            const user = sharedDecisionDetails?.tasks?.find(
              (task) => task.user_id === sharedDecision.groupMember
            );
            const tags = getTagNames(sharedDecision.decisionId);
            return (
              <Grid item xs={12} sm={6} md={4} key={sharedDecision.id}>
                <Card
                  className="sharedDecision-card"
                  variant="outlined"
                  onClick={() => handleCardClick(sharedDecision.decisionId)}
                  sx={{ cursor: "pointer" }}
                >
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item>
                        <Avatar sx={{ bgcolor: "#526D82", color: "white" }}>
                          {user?.displayname?.[0] || "U"}
                        </Avatar>
                      </Grid>
                      <Grid item xs>
                        <Typography variant="h6">
                          {sharedDecision.decision_name || getDecisionName(sharedDecision.decisionId)}
                        </Typography>
                        <Typography variant="body2">
                          {user?.displayname || "Unknown User"} | {user?.email || ""}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Typography variant="body1" mt={2} fontWeight="bold">
                      Tags:
                    </Typography>
                    <Typography variant="body2" sx={{ ml: "16px", mb: 1 }}>
                      {tags.length > 0 ? tags.join(", ") : "No Tags"}
                    </Typography>

                    <Typography variant="body2" color="textSecondary">
                      Shared with: <b>{getUserName(sharedDecision.groupMember)}</b>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Typography variant="h5" className="sharedDecision-comments-title" sx={{ mt: 4 }}>
        Decision Circle Decisions
      </Typography>

      {showNoDecisionCircleDecisionsCard ? (
        <Box className="sharedDecision-empty">
          <Typography variant="h6" align="center">
            No decisions found for the shared decision circle.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2} className="mt-2">
          {sharedDecisionCircleDetails?.decisions?.map((decision, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                className="sharedDecision-card"
                variant="outlined"
                onClick={() => handleCardClick(decision.decision_id)}
                sx={{ cursor: "pointer" }}
              >
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Avatar sx={{ bgcolor: "#526D82", color: "white" }}>
                        {decision.decision_name?.[0] || "D"}
                      </Avatar>
                    </Grid>
                    <Grid item xs>
                      <Typography variant="h6">{decision.decision_name}</Typography>
                      <Typography variant="body2">
                        {decision.group_name || "No Group Name"}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Typography variant="body1" mt={2} fontWeight="bold">
                    Tags:
                  </Typography>
                  <Typography variant="body2" sx={{ ml: "16px", mb: 1 }}>
                    {decision.tags?.map((tag) => tag.tag_name).join(", ") || "No Tags"}
                  </Typography>

                  <Typography variant="body2" color="textSecondary">
                    <b>Shared with: {decision.shared_with_names || "No Shared Names"}</b>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default withAuth(ShareByMe);