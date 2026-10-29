import React, { useEffect, useState } from "react";
import {
  Button,
  Typography,
  Card,
  CardContent,
  Avatar,
  Tooltip,
  Box,
} from "@mui/material";
import {
  acceptOrRejectInnerCircle,
  getInnerCircleAcceptNotification,
} from "../../api/InnerCircle/Network_Call";
import { ToastContainer, toast } from "react-toastify";
import withAuth from "../../utils/withAuth";
import "../../assets/styles/pages/Notification.css";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [response, setResponse] = useState(null);

  const getNotification = async () => {
    try {
      const innerCircleResponse = await getInnerCircleAcceptNotification();
      setNotifications(
        innerCircleResponse.notAcceptedMembers.filter(
          (notification) =>
            innerCircleResponse.groupDetails[notification.group_id].userDetails,
        ),
      );
      setResponse(innerCircleResponse);
    } catch (error) {
      console.error("Error in fetching the notifications:", error);
      toast("An error occurred while fetching the notifications");
    }
  };

  const handleAction = async (groupId, status) => {
    try {
      await acceptOrRejectInnerCircle(groupId, status);
      toast("Status Updated Successfully");
      getNotification();
    } catch (error) {
      console.error(
        `Error ${status ? "accepting" : "rejecting"} notification:`,
        error,
      );
      toast(
        `An error occurred while ${status ? "accepting" : "rejecting"} the notification`,
      );
    }
  };

  useEffect(() => {
    getNotification();
  }, []);

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "";
  };

  return (
    <div className="notification-page">
      <h3 className="notification-title">Inner Circle Notifications</h3>

      {notifications.length === 0 ? (
        <Typography className="notification-empty">
          No Inner Circle notifications
        </Typography>
      ) : (
        notifications.map((notification) => (
          <Card
            key={notification.id}
            variant="outlined"
            className="notification-card"
          >
            <CardContent>
              {response && response.groupDetails[notification.group_id] && (
                <Box className="notification-requester">
                  <Avatar className="notification-avatar">
                    {getInitials(
                      response.groupDetails[notification.group_id].userDetails
                        .displayname,
                    )}
                  </Avatar>
                  <Typography className="notification-requester-name">
                    {
                      response.groupDetails[notification.group_id].userDetails
                        .displayname
                    }
                  </Typography>
                  <Typography className="notification-requester-text">
                    is requesting you to join their inner circle
                  </Typography>
                </Box>
              )}

              {response && response.acceptedDetails[notification.group_id] && (
                <Box className="notification-members">
                  <Typography className="notification-members-label">
                    Members of that inner circle:
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Tooltip
                      title={
                        response.acceptedDetails[notification.group_id]
                          .userDetails.displayname
                      }
                      key={
                        response.acceptedDetails[notification.group_id]
                          .userDetails.user_id
                      }
                    >
                      <Avatar
                        alt={
                          response.acceptedDetails[notification.group_id]
                            .userDetails.displayname
                        }
                        className="notification-member-avatar"
                      >
                        {getInitials(
                          response.acceptedDetails[notification.group_id]
                            .userDetails.displayname,
                        )}
                      </Avatar>
                    </Tooltip>
                  </Box>
                </Box>
              )}

              <Box className="notification-actions">
                <Button
                  className="btn-accept"
                  onClick={() =>
                    handleAction(notification.group_id, "Accepted")
                  }
                >
                  Accept
                </Button>
                <Button
                  className="btn-reject"
                  onClick={() =>
                    handleAction(notification.group_id, "Not Accepted")
                  }
                >
                  Reject
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
      <ToastContainer />
    </div>
  );
};

export default withAuth(Notification);
