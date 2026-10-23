import React, { useEffect, useState } from "react";
import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import DoneIcon from "@mui/icons-material/Done";
import { useNavigate } from "react-router-dom";
import {
  shareDecisionInInnerCircle,
  getSharedMembers,
  mailToInnerCircleDecisionShare,
} from "./Network_Call";
import { ToastContainer, toast } from "react-toastify";
import withAuth from "../withAuth";
import { notifyTeamsChannel } from "../../Utility/teamsWebhook";

const AcceptOrNot = ({ innerCircleDetails, decision, id }) => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [sharedMembers, setSharedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  console.log("innerrrr", decision);

  const handleMemberClick = (memberId) => {
    setSelectedMember((prevSelectedMember) =>
      prevSelectedMember === memberId ? null : memberId,
    );
  };

  const handleSubmit = async () => {
    const payload = {
      decisionId: id,
      groupId: innerCircleDetails.group.id,
      memberId: selectedMember,
    };

    try {
      const response = await shareDecisionInInnerCircle(payload);
      if (response.status === 200) {
        toast("Decision shared successfully!");
        setSelectedMember(null);
        await getSharedMembersList();

        const selectedMemberDetails = innerCircleDetails.members.find(
          (member) => member.user_id === selectedMember,
        );
        const memberEmail = selectedMemberDetails?.email;

        if (selectedMemberDetails) {
          const memberName = selectedMemberDetails.displayname;

          console.log("aceptttttttttttt or not", decision);

          const decisionSummary = {
            decisionName: decision.decision_name,
            userStatement: decision.user_statement,
            reasons: decision.decision_reason.join(", "),
            dueDate: decision.decision_due_date,
            takenDate: decision.decision_taken_date,
          };

          const responseToMail = await mailToInnerCircleDecisionShare(
            memberEmail,
            decisionSummary,
          );

          await notifyTeamsChannel("SHARED", decision, memberEmail);

          console.log("response from the mail", responseToMail);
        }
      } else {
        toast("Failed to share decision.");
      }
    } catch (error) {
      console.error("Error sharing decision:", error);
      toast("An error occurred while sharing the decision.");
    }
  };

  console.log("selected memebr", selectedMember);

  const getSharedMembersList = async () => {
    const payload = {
      groupId: innerCircleDetails.group.id,
      decisionId: id,
    };

    try {
      const response = await getSharedMembers(payload);
      console.log("response from shared member list", response);
      setSharedMembers(response);
    } catch (error) {
      console.error("Error in fetching the shared members:", error);
      toast("An error occurred while fetching the shared member decision");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSharedMembersList();
  }, [innerCircleDetails.group.id]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <div>
      <Typography variant="h5">Inner Circle Details</Typography>
      {innerCircleDetails && innerCircleDetails.members ? (
        <List>
          {innerCircleDetails.members.map((member) => {
            const sharedMember = sharedMembers.find(
              (shared) => shared.groupMember === member.user_id,
            );
            const isClickable = member.status === "Accepted" && !sharedMember;

            return (
              <ListItem
                key={member.user_id}
                button={isClickable}
                onClick={() => isClickable && handleMemberClick(member.user_id)}
                selected={selectedMember === member.user_id}
                style={{
                  cursor: isClickable ? "pointer" : "default",
                  backgroundColor: sharedMember ? "#d3d3d3" : "white",
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    style={{ backgroundColor: "#526D82", color: "white" }}
                  >
                    {member.displayname.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={member.displayname}
                  secondary={member.email}
                />
                {selectedMember === member.user_id && (
                  <CheckIcon color="primary" />
                )}
                {sharedMember && <DoneIcon color="action" />}
                <Typography
                  variant="caption"
                  color={member.status === "Accepted" ? "primary" : "error"}
                >
                  {member.status === "Accepted"
                    ? "Accepted"
                    : "Not Acceptedcd "}
                </Typography>
              </ListItem>
            );
          })}
        </List>
      ) : (
        <Typography>No members in this inner circle</Typography>
      )}
      <Typography variant="h5">Decision Details</Typography>
      <Typography>
        <strong>Name:</strong> {decision.decision_name}
      </Typography>
      <Typography>
        <strong>Details:</strong> {decision.user_statement}
      </Typography>
      <Typography>
        <strong>Reasons:</strong>{" "}
        {decision.decision_reason && decision.decision_reason.join(", ")}
      </Typography>
      <Typography>
        <strong>Due Date:</strong> {decision.decision_due_date}
      </Typography>
      <Typography>
        <strong>Taken Date:</strong> {decision.decision_taken_date}
      </Typography>
      {selectedMember && (
        <Box mt={2}>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Share Decision
          </Button>
        </Box>
      )}
      <ToastContainer />
    </div>
  );
};

export default withAuth(AcceptOrNot);
