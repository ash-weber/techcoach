import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import Group from './GroupSelection';
import AcceptOrNot from './AcceptOrNot';
import withAuth from '../../../../utils/withAuth';
import '../../../../assets/styles/pages/Decision.css';

const ShareModal = ({ showModal, handleClose, innerGroup, innerCircleDetails, decision, id }) => {
  return (
    <Modal show={showModal} onHide={handleClose} className="share-modal" centered>
      <Modal.Header closeButton className="share-modal__header">
        <Modal.Title className="share-modal__title">Share Decision</Modal.Title>
      </Modal.Header>
      <Modal.Body className="share-modal__body">
        {(innerGroup === false || innerGroup === null) &&
        (innerCircleDetails === null || innerCircleDetails.error === 'No groups found for this user') ? (
          <Group />
        ) : (
          <AcceptOrNot innerCircleDetails={innerCircleDetails} decision={decision} id={id} />
        )}
      </Modal.Body>
      <Modal.Footer className="share-modal__footer">
        <button className="decision-btn" onClick={handleClose}>
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default withAuth(ShareModal);