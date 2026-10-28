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
import { getSharedDecisionDetails } from '../Group/Network_Call';
import { getUserSharedDecisions } from '../Decision_Circle/Networkk_Call';
import withAuth from '../../utils/withAuth';
import { Card, Typography, Grid, CircularProgress, Box, CardContent, Button, Select, MenuItem } from '@mui/material';
import { Link } from 'react-router-dom';

const ShareWithMe = () => {
  const [sharedDecisionDetails, setSharedDecisionDetails] = useState({ sharedDecisions: [], decisions: [], tasks: [] });
  const [sharedDecisionCircleDetails, setSharedDecisionCircleDetails] = useState({ decisions: [] });
  const [loading, setLoading] = useState(true);
  const [showPendingDecisions, setShowPendingDecisions] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Fetch shared decision details
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

  // Fetch decision circle details
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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

  const decisionMap = new Map((sharedDecisionDetails?.decisions || []).map(decision => [decision.decision_id, decision.decision_name]));

  const filterDecisions = (sharedDecisions = [], decisions = []) => {
    return sharedDecisions
      .filter(sharedDecision => {
        const decision = decisions.find(d => d.decision_id === sharedDecision.decisionId);
        if (showPendingDecisions) {
          return decision && decision.decision_taken_date === null;
        }
        return true;
      })
      .filter(decision => {
        const decisionName = decisionMap.get(decision.decisionId);
        return decisionName && decisionName.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .filter(decision => {
        const tags = decisions.find(d => d.decision_id === decision.decisionId)?.tags;
        if (selectedTag && selectedTag !== 'All Tags') {
          return tags?.some(tag => tag.tag_type === selectedTag || tag.tag_name === selectedTag);
        }
        return true;
      })
      .map(decision => ({
        ...decision,
        decision_name: decisionMap.get(decision.decisionId),
        tag_names: getTagNames(decision.decisionId)
      }));
  };

  const filteredDecisions = filterDecisions(
    sharedDecisionDetails?.sharedDecisions || [],
    sharedDecisionDetails?.decisions || []
  );

  const showNoInnerCircleDecisionsCard = sharedDecisionDetails?.sharedDecisions?.length === 0;
  const showNoDecisionCircleDecisionsCard = sharedDecisionCircleDetails?.decisions?.length === 0;

  return (
    <Grid style={{ margin: "1rem" }}>
      <Grid item xs={12} md={6} className="entertype">
        <input
          type="text"
          placeholder="Search Decision Name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '400px' }}
        />
        <Select
          value={selectedTag}
          onChange={e => setSelectedTag(e.target.value)}
          displayEmpty
          inputProps={{ 'aria-label': 'Select Tag' }}
          sx={{ width: '100%', maxWidth: '10rem', fontSize: '0.8rem' }}
        >
          <MenuItem value="">All Tags</MenuItem>
          <MenuItem value="Advanced Tags">Advanced Tags</MenuItem>
          <MenuItem value="Sharpen the Saw">Sharpen the Saw</MenuItem>
          <MenuItem value="Outcome">Outcome</MenuItem>
          <MenuItem value="Time Span">Time Span</MenuItem>
          <MenuItem value="Urgency">Urgency</MenuItem>
          <MenuItem value="Financial Outcome">Financial Outcome</MenuItem>
          <MenuItem value="Decision Maturity">Decision Maturity</MenuItem>
        </Select>
        <Button
          className="bg-light rounded mt-2"
          onClick={() => setShowPendingDecisions(!showPendingDecisions)}
        >
          {showPendingDecisions ? 'Show All Decisions' : 'Show Pending Decisions'}
        </Button>
      </Grid>

      <Typography variant="h5" className="mt-4 mb-2">
        Inner Circle Decisions
      </Typography>

      {showNoInnerCircleDecisionsCard ? (
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={8}>
            <Card className="share-card">
              <CardContent>
                <Typography variant="h6" gutterBottom className="share-message">
                  To share a decision, open one of your decisions and share with your Inner Circle
                </Typography>
                <Link to="/innerCircleDisplay">
                  <Button variant="contained" color="primary" className="share-button">
                    Click me
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={2} className="mt-2 share-decisions">
          {filteredDecisions.map((sharedDecision) => (
            <Grid item xs={12} sm={6} md={4} key={sharedDecision.id}>
              <Card
                onClick={() => handleCardClick(sharedDecision.decisionId)}
                style={{ cursor: 'pointer', border: '0.01rem solid #3F5362' }}
              >
                <CardContent>
                  <Typography variant="h6" component="div">
                    {getDecisionName(sharedDecision.decisionId)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Tags: {getTagNames(sharedDecision.decisionId).join(',')}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Shared with: {getUserName(sharedDecision.groupMember)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Typography variant="h5" className="mt-4 mb-2">
        Decision Circle Decisions
      </Typography>
      {showNoDecisionCircleDecisionsCard ? (
        <Grid container spacing={2} className="mt-2 share-decisions">
          <Typography variant="h6" align="center">
            No decisions found for the shared decision circle.
          </Typography>
        </Grid>
      ) : (
        <Grid container spacing={2} className="mt-2">
          {sharedDecisionCircleDetails?.decisions?.map((decision, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                onClick={() => handleCardClick(decision.decision_id)}
                style={{ cursor: 'pointer', border: '0.01rem solid #3F5362' }}
              >
                <CardContent>
                  <Typography variant="h6" component="div">
                    {decision.decision_name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Tags: {decision.tags?.map((tag) => tag.tag_name).join(', ') || 'No Tags'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Shared Group Name: {decision.group_name || 'No Group Name'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <b>Shared with: {decision.shared_with_names || 'No Shared Names'}</b>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Grid>
  );
};

export default withAuth(ShareWithMe);
