// import React, { useState, useEffect } from 'react';
// import { Avatar, Checkbox, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction, Paper, Typography, Box, Grid, Button } from '@mui/material';
// import { useNavigate, useParams, useLocation } from 'react-router-dom';
// import withAuth from '../withAuth';
// import { getUserListForDecisionCircle, sendDecisionCircleInvitation } from './Networkk_Call';
// import axios from 'axios';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const DecisionGroup = () => {
//   const [users, setUsers] = useState([]);
//   const [selectedUsers, setSelectedUsers] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');

//   const { id } = useParams();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchNames = async () => {
//       try {
//         const users = await getUserListForDecisionCircle();
//         setUsers(users);
//       } catch (error) {
//         console.error('Error fetching user list:', error);
//       }
//     };
//     fetchNames();
//   }, []);

//   const handleCheckboxChange = (event, user) => {
//     if (event.target.checked) {
//       setSelectedUsers((prev) => [...prev, user]);
//     } else {
//       setSelectedUsers((prev) =>
//         prev.filter((selectedUser) => selectedUser.user_id !== user.user_id)
//       );
//     }
//   };

//   const handleSubmit = async () => {
//     if (!id) {
//       toast.error('Group ID is not specified.');
//       return;
//     }

//     if (selectedUsers.length === 0) {
//       toast.error('No users selected.');
//       return;
//     }

//     const members = selectedUsers.map(user => (user.user_id ));

//     try {
//       const token = localStorage.getItem('token');
//       const userId = localStorage.getItem('user_id');

//     if (!userId) {
//       toast.error('User ID is not available.');
//       return;
//     }
//       const response = await axios.post(
//         `${process.env.REACT_APP_API_URL}/group/decisionCircleCreation`,
//         {
//           created_by: userId,
//         type_of_group: 'decision_circle',
//         group_name: id,
//         members:members
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       toast.success('Decision circle created successfully!');

//       // Send individual invitations
//       for (const user of selectedUsers) {
//         try {
//           await sendDecisionCircleInvitation(user.email);
//           toast.success(`Invitation sent to ${user.email} successfully`);
//         } catch (invitationError) {
//           toast.error(`Failed to invite ${user.email}`);
//           console.error(`Error sending invitation to ${user.email}:`, invitationError);
//         }
//       }

//       navigate('/getdecisioncircle');
//     } catch (error) {
//       toast.error('Error creating decision circle');
//       console.error('Error creating decision circle:', error.response ? error.response.data : error.message);
//     }
//   };

//   const handleSearchInputChange = (e) => {
//     setSearchQuery(e.target.value.toLowerCase());
//   };

//   return (
//     <div>
//       <center>
//         <div style={{ maxWidth: '500px' }}>
//           <input type="text" id="group_id" value={id || ''} readOnly />
//         </div>
//       </center>
//       <Box sx={{ margin: '1rem', display: 'flex', justifyContent: 'center' }}>
//         <Grid container spacing={2} sx={{ maxWidth: '1000px' }}>
//           <Grid item xs={12} md={6}>
//             <Typography variant="h6">List of Members</Typography>
//             <input
//               placeholder="Search by email"
//               fullWidth
//               value={searchQuery}
//               onChange={handleSearchInputChange}
//               style={{
//                 width: "100%",
//                 borderRadius: "0.5rem",
//                 padding: "1rem"
//               }}
//             />
//             <List>
//               {users
//                 .filter(user => user.email===searchQuery)
//                 .map((user) => (
//                   <ListItem key={user.user_id} button>
//                     <ListItemAvatar>
//                       <Avatar sx={{ backgroundColor: "#526D82", border: "0.2rem solid white" }}>
//                         {user.displayname.charAt(0)}
//                       </Avatar>
//                     </ListItemAvatar>
//                     <ListItemText primary={user.displayname} secondary={user.email} />
//                     <ListItemSecondaryAction>
//                       <Checkbox
//                         edge="end"
//                         onChange={(event) => handleCheckboxChange(event, user)}
//                         checked={selectedUsers.some(selectedUser => selectedUser.user_id === user.user_id)}
//                       />
//                     </ListItemSecondaryAction>
//                   </ListItem>
//               ))}
//             </List>
//           </Grid>
//           <Grid item xs={12} md={6}>
//             <Typography variant="h6">Selected Members:</Typography>
//             <Paper elevation={3} sx={{ padding: 2, mt: 2 }}>
//               {selectedUsers.length > 0 ? (
//                 <>
//                   <Box
//                     display="flex"
//                     justifyContent="center"
//                     alignItems="center"
//                     flexWrap="wrap"
//                     sx={{ marginTop: '2rem' }}
//                   >
//                     {selectedUsers.slice(0, 5).map((user, index) => (
//                       <Avatar
//                         key={index}
//                         sx={{
//                           backgroundColor: '#526D82',
//                           width: 40,
//                           height: 40,
//                           marginLeft: index === 0 ? 0 : '-10px',
//                           zIndex: selectedUsers.length - index,
//                           border: '0.2rem solid white',
//                         }}
//                       >
//                         {user.displayname.charAt(0)}
//                       </Avatar>
//                     ))}
//                     {selectedUsers.length > 5 && (
//                       <Typography sx={{ marginLeft: '10px' }}>
//                         +{selectedUsers.length - 5}
//                       </Typography>
//                     )}
//                   </Box>
//                   <Box mt={2}>
//                     {selectedUsers.map((user, index) => (
//                       <Typography key={index}>{user.displayname}</Typography>
//                     ))}
//                   </Box>
//                   <Box mt={2} display="flex" justifyContent="flex-end">
//                     <Button
//                       variant="contained"
//                       sx={{
//                         backgroundColor: '#526D82',
//                         borderRadius: '0.5rem',
//                         color: 'white',
//                       }}
//                       onClick={handleSubmit}
//                     >
//                       Submit
//                     </Button>
//                   </Box>
//                 </>
//               ) : (
//                 <Typography>No members selected</Typography>
//               )}
//             </Paper>
//           </Grid>
//         </Grid>
//       </Box>
//       <ToastContainer />
//     </div>
//   );
// };

// export default withAuth(DecisionGroup);

import React, { useState, useEffect } from "react";
import {
  Avatar,
  Checkbox,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
} from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import withAuth from "../../utils/withAuth";
import {
  getUserListForDecisionCircle,
  sendDecisionCircleInvitation,
} from "../../api/DecisionCircle/Network_Call";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const MIN_LOCAL_PART_CHARS = 3;
const MIN_LOCAL_PART_RATIO = 0.6;

const DecisionGroup = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [availableDomains, setAvailableDomains] = useState([]);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
  const fetchNames = async () => {
    try {
      const users = await getUserListForDecisionCircle();
      setUsers(users);

      const domains = [
        ...new Set(
          users
            .map((u) => u.email?.split("@")[1]?.toLowerCase())
            .filter(Boolean)
        ),
      ].sort();

      setAvailableDomains(domains);
    } catch (error) {
      console.error("Error fetching user list:", error);
    }
  };

  fetchNames();
}, []);

  const handleCheckboxChange = (event, user) => {
    if (event.target.checked) {
      setSelectedUsers((prev) => [...prev, user]);
    } else {
      setSelectedUsers((prev) =>
        prev.filter((selectedUser) => selectedUser.user_id !== user.user_id),
      );
    }
  };

  const handleSubmit = async () => {
    if (!id) {
      toast.error("Group ID is not specified.");
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error("No users selected.");
      return;
    }

    const members = selectedUsers.map((user) => user.user_id);

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("user_id");

      if (!userId) {
        toast.error("User ID is not available.");
        return;
      }
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/group/decisionCircleCreation`,
        {
          created_by: userId,
          type_of_group: "decision_circle",
          group_name: id,
          members: members,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Decision circle created successfully!");

      for (const user of selectedUsers) {
        try {
          await sendDecisionCircleInvitation(user.email);
          toast.success(`Invitation sent to ${user.email} successfully`);
        } catch (invitationError) {
          toast.error(`Failed to invite ${user.email}`);
          console.error(
            `Error sending invitation to ${user.email}:`,
            invitationError,
          );
        }
      }

      navigate("/getdecisioncircle");
    } catch (error) {
      toast.error("Error creating decision circle");
      console.error(
        "Error creating decision circle:",
        error.response ? error.response.data : error.message,
      );
    }
  };

  const handleSearchInputChange = (e) => {
    const raw = e.target.value;
    const lower = raw.toLowerCase();

    if (lower.includes("@")) {
      const domainPart = lower.split("@")[1]?.trim();
      if (domainPart && availableDomains.includes(domainPart)) {
        setSelectedDomain(domainPart);
      }
    }

    setSearchQuery(lower);
  };

  const getFilteredUsers = () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const [typedLocal, typedDomain] = q.split("@");
    const domainFilter = typedDomain || selectedDomain;

    const matched = users.filter((u) => {
      if (!u.email) return false;
      const email = u.email.toLowerCase();
      const [localPart, emailDomain] = email.split("@");

      if (domainFilter && emailDomain !== domainFilter) return false;

      const required = Math.max(
        MIN_LOCAL_PART_CHARS,
        Math.ceil(localPart.length * MIN_LOCAL_PART_RATIO),
      );
      const typed = typedLocal || "";
      return typed.length >= required && localPart.startsWith(typed);
    });

    return matched;
  };

  return (
    <div>
      <center>
        <div style={{ maxWidth: "500px" }}>
          <input type="text" id="group_id" value={id || ""} readOnly />
        </div>
      </center>
      <Box sx={{ margin: "1rem", display: "flex", justifyContent: "center" }}>
        <Grid container spacing={2} sx={{ maxWidth: "1000px" }}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5 }}>
              Select Domain
            </Typography>
            <select
              value={selectedDomain}
              onChange={(e) => {
                setSelectedDomain(e.target.value);
                // optional: clear search so the 60% rule re-applies fresh
                // setSearchQuery("");
              }}
              style={{
                width: "100%",
                borderRadius: "0.5rem",
                padding: "0.9rem",
                marginBottom: "0.75rem",
                border: "1px solid #ccc",
              }}
            >
              <option value="">All domains</option>
              {availableDomains.map((d) => (
                <option key={d} value={d}>
                  @{d}
                </option>
              ))}
            </select>

            <Typography variant="h6">List of Members</Typography>
            <input
              placeholder="Search by email"
              fullWidth
              value={searchQuery}
              onChange={handleSearchInputChange}
              style={{
                width: "100%",
                borderRadius: "0.5rem",
                padding: "1rem",
              }}
            />
            <List>
              {getFilteredUsers().map((user) => (
                <ListItem key={user.user_id} button>
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        backgroundColor: "#526D82",
                        border: "0.2rem solid white",
                      }}
                    >
                      {user.displayname.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.displayname}
                    secondary={user.email}
                  />
                  <ListItemSecondaryAction>
                    <Checkbox
                      edge="end"
                      onChange={(event) => handleCheckboxChange(event, user)}
                      checked={selectedUsers.some(
                        (selectedUser) => selectedUser.user_id === user.user_id,
                      )}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              {getFilteredUsers().length === 0 && searchQuery.trim() && (
                <Typography sx={{ p: 2, color: "gray" }}>
                  Type at least 60% of the name to see matches
                  {selectedDomain ? ` in @${selectedDomain}` : ""}.
                </Typography>
              )}
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Selected Members:</Typography>
            <Paper elevation={3} sx={{ padding: 2, mt: 2 }}>
              {selectedUsers.length > 0 ? (
                <>
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    flexWrap="wrap"
                    sx={{ marginTop: "2rem" }}
                  >
                    {selectedUsers.slice(0, 5).map((user, index) => (
                      <Avatar
                        key={index}
                        sx={{
                          backgroundColor: "#526D82",
                          width: 40,
                          height: 40,
                          marginLeft: index === 0 ? 0 : "-10px",
                          zIndex: selectedUsers.length - index,
                          border: "0.2rem solid white",
                        }}
                      >
                        {user.displayname.charAt(0)}
                      </Avatar>
                    ))}
                    {selectedUsers.length > 5 && (
                      <Typography sx={{ marginLeft: "10px" }}>
                        +{selectedUsers.length - 5}
                      </Typography>
                    )}
                  </Box>
                  <Box mt={2}>
                    {selectedUsers.map((user, index) => (
                      <Typography key={index}>{user.displayname}</Typography>
                    ))}
                  </Box>
                  <Box mt={2} display="flex" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: "#526D82",
                        borderRadius: "0.5rem",
                        color: "white",
                      }}
                      onClick={handleSubmit}
                    >
                      Submit
                    </Button>
                  </Box>
                </>
              ) : (
                <Typography>No members selected</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
      <ToastContainer />
    </div>
  );
};

export default withAuth(DecisionGroup);
