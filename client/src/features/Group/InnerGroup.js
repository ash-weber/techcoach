import React, { useState, useEffect } from 'react';
import { Avatar, Checkbox, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction, Paper, Typography, Box,Grid, Button } from '@mui/material';
import { getUserListForInnerCircle, innerCircleCreation } from '../../api/InnerCircle/Network_Call';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import withAuth from '../../utils/withAuth';

const InnerGroup = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const type_of_group = queryParams.get('type_of_group');

    useEffect(() => {
        const fetchNames = async () => {
            const users = await getUserListForInnerCircle();
            setUsers(users);
        };
        fetchNames();
    }, []);

    const handleCheckboxChange = (event, user) => {
        if (event.target.checked) {
            setSelectedUsers([...selectedUsers, user]);
        } else {
            setSelectedUsers(selectedUsers.filter(selectedUser => selectedUser.user_id !== user.user_id));
        }
    };

    const handleSubmit = async () => {
        const groupData = {
            type_of_group: type_of_group,
            members: selectedUsers.map(user => ({
                user_id: user.user_id
            }))
        };

        const response = await innerCircleCreation(groupData);
        if(response.status === 200) {
            navigate('/inner-circle');
        }
    };

    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    return (
        <Box sx={{ margin: '1rem', display: 'flex', justifyContent: 'center' }}>
            <Grid container spacing={2} sx={{ maxWidth: '1000px' }}>
                <Grid item xs={12} md={6}>
                    <Typography variant="h6">List of Members</Typography>
                    <input
                        label="Search by email"
                        variant="outlined"
                        fullWidth
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        style={{
                            width:"100%",
                            borderRadius:"0.5rem",
                            padding:"1rem"
                        }}
                    />
                    <List>
                        {users.filter(user => user.email === searchQuery).map((user) => (
                            <ListItem key={user.user_id} button>
                                <ListItemAvatar>
                                    <Avatar sx={{ backgroundColor: "#526D82", border: "0.2rem solid white" }}>{user.displayname.charAt(0)}</Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={user.displayname} secondary={user.email} />
                                <ListItemSecondaryAction>
                                    <Checkbox
                                        edge="end"
                                        onChange={(event) => handleCheckboxChange(event, user)}
                                        name={user.displayname}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="h6">Selected Names:</Typography>
                    <Paper elevation={3} sx={{ padding: 2, mt: 2 }}>
                        {selectedUsers.length > 0 ? (
                            <>
                                <Box display="flex" justifyContent="center" alignItems="center" flexWrap="wrap" sx={{ marginTop: "2rem" }}>
                                    {selectedUsers.slice(0, 5).map((user, index) => (
                                        <Avatar
                                            key={index}
                                            sx={{
                                                backgroundColor: "#526D82",
                                                width: 40,
                                                height: 40,
                                                position: "relative",
                                                left: `-${index * 10}px`,
                                                zIndex: selectedUsers.length - index,
                                                border: "0.2rem solid white"
                                            }}
                                        >
                                            {user.displayname.charAt(0)}
                                        </Avatar>
                                    ))}
                                    {selectedUsers.length > 5 && (
                                        <>
                                            +{selectedUsers.length - 5}
                                        </>
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
                                            color: "white"
                                        }} 
                                        onClick={handleSubmit}
                                    >
                                        Submit
                                    </Button>
                                </Box>
                            </>
                        ) : (
                            <Typography>No names selected</Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default withAuth(InnerGroup);