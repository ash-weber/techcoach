import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSharedDecisionDetails } from '../../../api/InnerCircle/Network_Call';
import withAuth from '../../../utils/withAuth';
import { Card, CardContent, Typography, Grid } from '@mui/material';

const ReceivedDecisionsTab = () => {
    const [sharedDecisionDetails, setSharedDecisionDetails] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSharedDecisionsDetails = async () => {
            try {
                const details = await getSharedDecisionDetails();
                setSharedDecisionDetails(details);
            } catch (error) {
                console.error("Failed to fetch inner circle details", error);
            }
        };
        fetchSharedDecisionsDetails();
    }, []);

    if (!sharedDecisionDetails) {
        return <div>Loading...</div>;
    }

    const { sharedDecisions, tasks, decisions } = sharedDecisionDetails;

    const getUserName = (userId) => {
        const user = tasks.find(task => task.user_id === userId);
        return user ? user.displayname : 'Unknown User';
    };

    const getDecisionName = (decisionId) => {
        const decision = decisions.find(decision => decision.decision_id === decisionId);
        return decision ? decision.decision_name : 'Unknown Decision';
    };

    const handleCardClick = (decisionId) => {
        navigate(`/views/${decisionId}`);
    };

    return (
        <div style={{ margin: "1rem" }}>
            <Grid container spacing={2}>
                {sharedDecisions.map(sharedDecision => (
                    <Grid item xs={12} sm={6} md={4} key={sharedDecision.id} >
                        <Card onClick={() => handleCardClick(sharedDecision.decisionId)} style={{ cursor: 'pointer', border:"0.01rem solid #3F5362" }}>
                            <CardContent>
                                <Typography variant="h6" component="div">
                                    {getDecisionName(sharedDecision.decisionId)}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Shared With: {getUserName(sharedDecision.groupMember)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </div>
    );
};

export default withAuth(ReceivedDecisionsTab);
