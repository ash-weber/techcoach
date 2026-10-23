import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getdecisionCirclesByUserAndMember } from "./Networkk_Call";
import { Box, Typography } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import "./ShareCircleGroup.css";
import { notifyTeamsChannel } from "../../Utility/teamsWebhook";

const ShareCircleGroup = () => {
  const [circleIcon, setCircleIcon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [decision, setDecision] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  const handleCloseCircle = () => {
    setCircleIcon(true);
    navigate(-1);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/getInfo_Referred/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const responseData = response.data;
        if (
          responseData &&
          responseData.decisionData &&
          responseData.decisionData.length > 0
        ) {
          const {
            decision_name,
            decision_due_date,
            decision_taken_date,
            user_statement,
            tags = [],
            decision_reason = [],
          } = responseData.decisionData[0];
          const formattedDecisionDueDate = decision_due_date
            ? new Date(decision_due_date).toISOString().split("T")[0]
            : "";
          const formattedDecisionTakenDate = decision_taken_date
            ? new Date(decision_taken_date).toISOString().split("T")[0]
            : "";

          setDecision({
            decision_name,
            decision_due_date: formattedDecisionDueDate,
            decision_taken_date: formattedDecisionTakenDate,
            user_statement,
            tagsArray: tags.map((tag) => ({
              id: tag.id,
              tag_name: tag.tag_name,
              tag_type: tag.tag_type,
            })),
            decision_reason: decision_reason.map(
              (reasonObj) => reasonObj.decision_reason_text,
            ),
          });
        } else {
          console.error("Invalid response format:", responseData);
        }
      } catch (error) {
        console.error("Error fetching decision data:", error.message);
      }
    };

    if (id) fetchData();
  }, [id]);

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const data = await getdecisionCirclesByUserAndMember();
        // Remove duplicate group names
        const uniqueGroups = data.groups.reduce((acc, current) => {
          if (!acc.some((group) => group.group_name === current.group_name)) {
            acc.push(current);
          }
          return acc;
        }, []);
        setGroups(uniqueGroups);
      } catch (error) {
        toast.error("Failed to fetch groups");
        console.log("Fetching error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [id]);

  const handleShareDecision = async (group_id) => {
    setLoading(true);
    try {
      const decision_id = id;
      const token = localStorage.getItem("token");

      await axios.post(
        `${process.env.REACT_APP_API_URL}/group/decisionshareDecisionCircle`,
        {
          group_id,
          decision_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Decision shared successfully!");

      const currentGroup = groups.find((g) => g.group_id === group_id);

      if (
        currentGroup &&
        Array.isArray(currentGroup.members) &&
        currentGroup.members.length > 0
      ) {
        const recipientEmails = currentGroup.members
          .map((member) => member.member_email)
          .filter(Boolean);

        const notificationPromises = recipientEmails.map((email) =>
          notifyTeamsChannel("SHARED", decision, email),
        );

        const results = await Promise.allSettled(notificationPromises);

        results.forEach((res, index) => {
          if (res.status === "rejected") {
            console.warn(
              `Failed to notify ${recipientEmails[index]}:`,
              res.reason,
            );
          }
        });
      }

    } catch (error) {
      console.error("Error sharing decision:", error);
      toast.error("Error sharing decision");
    } finally {
      setLoading(false);
    }
  };

  const handleGroupSelect = (event) => {
    setSelectedGroup(event.target.value);
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.group_name &&
      group.group_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="share-circle-group mt-5 rounded">
      <div className="icon-close-card">
        <h4>Share Decision</h4>
        <IoClose onClick={handleCloseCircle} />
      </div>
      <div className="circle-group-details">
        <h5>Decision Circle Group Details</h5>
        <div className="">
          <label htmlFor="group-select">Select a Group</label>
          <select
            id="group-select"
            value={selectedGroup}
            onChange={handleGroupSelect}
          >
            <option value="" disabled>
              Select a group
            </option>
            {filteredGroups.map((group) => (
              <option key={group.group_id} value={group.group_id}>
                {group.group_name}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="selectgroup"
            placeholder="search circle name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {selectedGroup && (
          <div className="group-container mt-3">
            <h6>Select Decision Circle</h6>
            <div className="group-items">
              {groups
                .filter((group) => group.group_id === Number(selectedGroup))
                .map((group) => (
                  <div key={group.group_id} className="group-item">
                    <input
                      type="checkbox"
                      onClick={() => handleShareDecision(group.group_id)}
                    />
                    <h5>{group.group_name}</h5>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
      <div>
        <h5 className="mt-2">Decision Details</h5>
      </div>
      <div>
        <Box
          sx={{
            padding: "1rem",
            backgroundColor: "lightblue",
            margin: { xs: "1rem", md: "2rem" },
            borderRadius: "0.5rem",
          }}
        >
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">
              <b>Decision Name:</b> {decision.decision_name}
            </Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">
              <b>Decision Details:</b> {decision.user_statement}
            </Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">
              <b>Decision Reasons:</b>{" "}
              {decision.decision_reason && decision.decision_reason.join(", ")}
            </Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">
              <b>Decision Due Date:</b> {decision.decision_due_date}
            </Typography>
          </Box>

          {decision.decision_taken_date && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                <b>Decision Taken Date:</b> {decision.decision_taken_date}
              </Typography>
            </Box>
          )}

          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">
              <b>Selected Tags:</b>{" "}
              {decision.tagsArray &&
                decision.tagsArray.map((tag) => tag.tag_name).join(", ")}
            </Typography>
          </Box>
        </Box>
        <ToastContainer />
      </div>
    </div>
  );
};

export default ShareCircleGroup;
