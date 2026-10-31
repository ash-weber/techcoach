import React, { useEffect, useState } from 'react';
import {
    getInnerCircleDetails,
    removeMemberFromInner,
    getAddMemberNameListFetch,
    addMemberToInnerCircle,
    innerCircleInvitation,
    innerCircleAddInvitation
} from '../../api/InnerCircle/Network_Call';
import { Container, ListGroup, Button, Spinner, Card, Alert } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import ShareModal from '../Decision/ShareDecision/View/ShareModel';
import withAuth from '../../utils/withAuth';
import '../../assets/styles/pages/InnerCircle.css';

const DisplayInnerCircle = () => {
    const [innerCircleDetails, setInnerCircleDetails] = useState(null);
    const [potentialMembers, setPotentialMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingAdd, setLoadingAdd] = useState(false);
    const [loadingRemove, setLoadingRemove] = useState({});
    const [loadingInvite, setLoadingInvite] = useState(false);

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
        <div className="inner-circle-container">
            <Card className="inner-circle-card">
                <Card.Body>
                    <Card.Title>Inner Circle Details</Card.Title>

                    {errorMessage && errorMessage !== "No members in this inner circle" && (
                        <Alert variant="danger" className="inner-circle-alert">
                            {errorMessage}
                            <button
                                className="inner-circle-create-btn"
                                onClick={handleShow}
                            >
                                Create Inner Circle
                            </button>
                        </Alert>
                    )}

                    {loading ? (
                        <Container className="inner-circle-loading">
                            <Spinner animation="border" />
                            <p>Loading...</p>
                        </Container>
                    ) : (
                        (!errorMessage || errorMessage === "No members in this inner circle") && innerCircleDetails && (
                            <div>
                                <h5 className="inner-circle-section-title">Members:</h5>
                                <ListGroup className="inner-circle-list">
                                    {innerCircleDetails.members && innerCircleDetails.members.length > 0 ? (
                                        innerCircleDetails.members.map(member => (
                                            <ListGroup.Item
                                                key={member.user_id}
                                                className={`inner-circle-list-item ${
                                                    member.status === 'Accepted' ? 'is-accepted' : 'is-pending'
                                                }`}
                                            >
                                                <div className="member-info">
                                                    <span className="member-name">{member.displayname}</span>
                                                    {' '}
                                                    <span className="member-email">({member.email})</span>
                                                    {' - '}
                                                    <span className="member-status">
                                                        {member.status === "Accepted" ? "Accepted" : "Not Accepted"}
                                                    </span>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    className="inner-circle-btn-danger"
                                                    onClick={() => handleRemoveMember(member.user_id)}
                                                    disabled={loadingRemove[member.user_id]}
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
                                        <div className="inner-circle-list-empty">No members found</div>
                                    )}
                                </ListGroup>

                                <br />
                                <h5 className="inner-circle-section-title">Add Member:</h5>
                                <input
                                    type="text"
                                    className="inner-circle-search"
                                    placeholder="Search by email"
                                    value={searchQuery}
                                    onChange={handleSearchInputChange}
                                />

                                {isValidGmail(searchQuery) && (
                                    <ListGroup className="inner-circle-list">
                                        {filteredMembers.map(member => (
                                            <ListGroup.Item
                                                key={member.user_id}
                                                className="inner-circle-list-item"
                                            >
                                                <div className="member-info">
                                                    <span className="member-name">{member.displayname}</span>
                                                    {' '}
                                                    <span className="member-email">({member.email})</span>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    className="inner-circle-btn-danger"
                                                    onClick={() => handleAddMember(member.user_id)}
                                                    disabled={loadingAdd}
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
                                                className="inner-circle-invite-btn"
                                                onClick={() => handleInvite(searchQuery, innerCircleDetails.group.id)}
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
                                            <div className="inner-circle-warning" role="alert">
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