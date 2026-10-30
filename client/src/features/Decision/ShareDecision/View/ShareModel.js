import React, { useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AcceptOrNot from "./AcceptOrNot";
import withAuth from "../../../../utils/withAuth";
import "../../../../assets/styles/pages/Decision.css";

const ShareModal = ({
  showModal,
  handleClose,
  innerGroup,
  innerCircleDetails,
  decision,
  id,
}) => {
  const navigate = useNavigate();

  const shouldNavigate =
    (innerGroup === false || innerGroup === null) &&
    (innerCircleDetails === null ||
      innerCircleDetails.error === "No groups found for this user");

  useEffect(() => {
    if (showModal && shouldNavigate) {
      handleClose();
      navigate("/inner-circle/add?type_of_group=inner_circle");
    }
  }, [showModal, shouldNavigate, navigate, handleClose]);

  return (
    <Modal
      show={showModal}
      onHide={handleClose}
      className="share-modal"
      centered
    >
      <Modal.Header closeButton className="share-modal__header">
        <Modal.Title className="share-modal__title">Share Decision</Modal.Title>
      </Modal.Header>

      <Modal.Body className="share-modal__body">
        {!shouldNavigate && (
          <AcceptOrNot
            innerCircleDetails={innerCircleDetails}
            decision={decision}
            id={id}
          />
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
