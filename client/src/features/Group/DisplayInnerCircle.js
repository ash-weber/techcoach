import React, { useEffect, useState } from 'react';
import { getInnerCircleDetails, removeMemberFromInner, getAddMemberNameListFetch, addMemberToInnerCircle, innerCircleInvitation, innerCircleAddInvitation } from '../../api/InnerCircle/Network_Call';
import { Container, ListGroup, Button, Spinner, Card, Alert } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import ShareModal from '../Decision/ShareDecision/View/ShareModel';
import withAuth from '../../utils/withAuth';
// import { decomposeColor } from '@mui/material';

const DisplayInnerCircle = () => {
    const [innerCircleDetails, setInnerCircleDetails] = useState(null);
    const [potentialMembers, setPotentialMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingAdd, setLoadingAdd] = useState(false);
    const [loadingRemove, setLoadingRemove] = useState({});
    const [loadingInvite, setLoadingInvite] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const fetchInnerCircleDetails = async () => {
            try {
                const details = await getInnerCircleDetails();
                setInnerCircleDetails(details);
            } catch (error) {
                console.error("Failed to fetch inner circle details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInnerCircleDetails();
    }, []);

    useEffect(() => {
        const fetchPotentialMembers = async () => {
            try {
                if (innerCircleDetails) {
                    const existingMemberIds = innerCircleDetails.members?.map(member => member.user_id) || [];
                    const membersList = await getAddMemberNameListFetch(existingMemberIds);
                    setPotentialMembers(membersList.result);
                }
            } catch (error) {
                console.error("Failed to fetch potential members list", error);
            }
        };

        if (innerCircleDetails) {
            fetchPotentialMembers();
        }
    }, [innerCircleDetails]);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleRemoveMember = async (userId) => {
        setLoadingRemove(prev => ({ ...prev, [userId]: true }));
        try {
            await removeMemberFromInner(userId, innerCircleDetails.group.id);
            toast("Removed Successfully");
            setInnerCircleDetails(prevDetails => ({
                ...prevDetails,
                members: prevDetails.members.filter(member => member.user_id !== userId)
            }));
        } catch (error) {
            console.error("Failed to remove member", error);
        } finally {
            setLoadingRemove(prev => ({ ...prev, [userId]: false }));
        }
    };

    useEffect(() => {
        if (innerCircleDetails && innerCircleDetails.error) {
            if (innerCircleDetails.error === "No members found for this group") {
                setErrorMessage("No members in this inner circle");
            } else if (innerCircleDetails.error === "No groups found for this user") {
                setErrorMessage("Inner Circle is Not Created yet");
            }
        }
    }, [innerCircleDetails]);

    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    const getVariant = (status) => {
        switch (status) {
            case 'Accepted':
                return 'success';
            case '':
                return 'warning';
            default:
                return '';
        }
    };

    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const isValidGmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleAddMember = async (userId) => {
        setLoadingAdd(true);
        try {
            await addMemberToInnerCircle(userId, innerCircleDetails.group.id);
            await innerCircleAddInvitation(searchQuery);
            toast("Added Successfully");
            const updatedDetails = await getInnerCircleDetails();
            setInnerCircleDetails(updatedDetails);
            setPotentialMembers(prev => prev.filter(member => member.user_id !== userId));
        } catch (error) {
            console.error("Failed to add member", error);
        } finally {
            setLoadingAdd(false);
        }
    };

    const filteredMembers = potentialMembers.filter(member => member.email === searchQuery);
    const existingMemberEmails = innerCircleDetails?.members?.map(member => member.email) || [];
    // const isValidGmail = searchQuery.endsWith('@gmail.com') || searchQuery.endsWith('@greenestep.com');


    const inviteButtonStyle = {
        color: "black",
        border: "0.1rem solid #DC3545",
        backgroundColor: "#DC3545",
        color: "white",
        padding: "0.5rem",
        width: windowWidth >= 768 ? '30%' : '100%'
    };

    const handleInvite = async (email, groupId) => {
        if (!isValidGmail(email)) {
            toast.error('Please enter a valid email address');
            return;
        }
        setLoadingInvite(true);
        try {
            const response = await innerCircleInvitation({ email, groupId });

            if (response.message === "Mail Sent Successfully") {
                toast('Invited successfully');
                const updatedDetails = await getInnerCircleDetails();
                setInnerCircleDetails(updatedDetails);
            }

        } catch (error) {
            console.error('Error in Inviting:', error);
            if (error.response && error.response.data && error.response.data.error) {
                toast.error(error.response.data.error);
            } else {
                toast.error('An error occurred while sending the invite.');
            }
        } finally {
            setLoadingInvite(false);
        }
    };

    return (
        <div style={{ margin: "1rem" }}>
            <Card style={{
                maxWidth: "85rem",
                margin: "2rem auto",
                transform: isHovered ? 'scale(1)' : 'none'
            }}>
                <Card.Body>
                    <Card.Title>Inner Circle Details</Card.Title>
                    <br />
                    {errorMessage && errorMessage !== "No members in this inner circle" && (
                        <Alert variant="danger">
                            {errorMessage}
                            <button
                                onClick={handleShow}
                                style={{ backgroundColor: '#526D82', color: '#ffffff', padding: "0.5rem", borderRadius: "0.5rem", border: "none", width: "100%", marginTop: "1rem" }}
                            >
                                Create Inner Circle
                            </button>
                        </Alert>
                    )}
                    {loading ? (
                        <Container className="text-center">
                            <Spinner animation="border" />
                            <p>Loading...</p>
                        </Container>
                    ) : (
                        (!errorMessage || errorMessage === "No members in this inner circle") && innerCircleDetails && (
                            <div>
                                <h5>Members:</h5>
                                <ListGroup>
                                    {innerCircleDetails.members && innerCircleDetails.members.length > 0 ? (
                                        innerCircleDetails.members.map(member => (
                                            <ListGroup.Item
                                                key={member.user_id}
                                                variant={getVariant(member.status)}
                                            >
                                                {member.displayname} ({member.email}) - {member.status === "Accepted" ? "Accepted" : "Not Accepted"}
                                                <Button
                                                    size="sm"
                                                    className="float-right"
                                                    onClick={() => handleRemoveMember(member.user_id)}
                                                    disabled={loadingRemove[member.user_id]}
                                                    style={{ margin: '1rem', color: "black", border: "0.1rem solid #DC3545", backgroundColor: "#DC3545", color: "White", padding: "0.5rem" }}
                                                >
                                                    {loadingRemove[member.user_id] ? (
                                                        <Spinner
                                                            as="span"
                                                            animation="border"
                                                            size="sm"
                                                            role="status"
                                                            aria-hidden="true"
                                                        />
                                                    ) : (
                                                        'Remove'
                                                    )}
                                                </Button>
                                            </ListGroup.Item>
                                        ))
                                    ) : (
                                        <ListGroup.Item>No members found</ListGroup.Item>
                                    )}
                                </ListGroup>
                                <br />
                                <h5>Add Member:</h5>
                                <input
                                    type="text"
                                    placeholder="Search by email"
                                    value={searchQuery}
                                    onChange={handleSearchInputChange}
                                    style={{ marginBottom: '1rem' }}
                                />
                                {isValidGmail(searchQuery) && (
                                    <ListGroup>
                                        {filteredMembers.map(member => (
                                            <ListGroup.Item key={member.user_id}>
                                                {member.displayname} ({member.email})
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    className="float-right"
                                                    onClick={() => handleAddMember(member.user_id)}
                                                    disabled={loadingAdd}
                                                    style={{ margin: '1rem', color: "black", border: "0.1rem solid #DC3545", backgroundColor: "#DC3545", color: "White", padding: "0.5rem" }}
                                                >
                                                    {loadingAdd ? (
                                                        <Spinner
                                                            as="span"
                                                            animation="border"
                                                            size="sm"
                                                            role="status"
                                                            aria-hidden="true"
                                                        />
                                                    ) : (
                                                        'Add'
                                                    )}
                                                </Button>
                                            </ListGroup.Item>
                                        ))}
                                        {!existingMemberEmails.includes(searchQuery) && filteredMembers.length === 0 && (
                                            <Button
                                                onClick={() => handleInvite(searchQuery, innerCircleDetails.group.id)}
                                                style={inviteButtonStyle}
                                                disabled={loadingInvite}
                                            >
                                                {loadingInvite ? (
                                                    <Spinner
                                                        as="span"
                                                        animation="border"
                                                        size="sm"
                                                        role="status"
                                                        aria-hidden="true"
                                                    />
                                                ) : (
                                                    'Invite the Member for Decision App'
                                                )}
                                            </Button>
                                        )}
                                        {existingMemberEmails.includes(searchQuery) && (
                                            <div className="alert alert-warning" role="alert" style={{ marginTop: '10px' }}>
                                                Already Added Member
                                            </div>
                                        )}
                                    </ListGroup>
                                )}
                            </div>
                        )
                    )}
                </Card.Body>
            </Card>

            <ShareModal
                showModal={showModal}
                handleClose={handleClose}
                innerGroup={null}
                innerCircleDetails={null}
                decision={null}
                id={null}
            />

            <ToastContainer />
        </div>
    );
};

export default withAuth(DisplayInnerCircle);
