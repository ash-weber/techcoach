import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import Group from './GroupSelection';  
import AcceptOrNot from './AcceptOrNot';  
import withAuth from '../../utils/withAuth';

const ShareModal = ({ showModal, handleClose, innerGroup, innerCircleDetails, decision, id }) => {
    return (
        <Modal show={showModal} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Share Decision</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {(innerGroup === false || innerGroup === null) && (innerCircleDetails === null || innerCircleDetails.error === "No groups found for this user") ? (
                    <Group />
                ) : (
                    <AcceptOrNot innerCircleDetails={innerCircleDetails} decision={decision} id={id}/>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default withAuth(ShareModal);