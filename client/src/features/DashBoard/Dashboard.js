import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Grid, Box, CircularProgress, Typography } from "@mui/material";
import {
  AssignmentTurnedIn,
  HourglassEmpty,
  Insights,
  Share,
} from "@mui/icons-material";
import ModelTrainingIcon from "@mui/icons-material/ModelTraining";
import { MdFormatListBulletedAdd } from "react-icons/md";
import { getSharedDecisionDetails } from "../Group/Network_Call";
import withAuth from "../../utils/withAuth";
import "../../assets/styles/pages/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    const userId = queryParams.get("user_id");

    if (token) {
      localStorage.setItem("token", token);
    }
    if (userId) {
      localStorage.setItem("user_id", userId);
    }
  }, [location.search]);

  const [data, setData] = useState([]);
  const [searchTerm] = useState("");
  const [showPendingDecisions, setShowPendingDecisions] = useState(false);
  const [pendingDecisionsData, setPendingDecisionsData] = useState([]);
  const [receivedDecisionsCount, setReceivedDecisionsCount] = useState(0);
  const [sharedByDecisionsCount, setSharedByDecisionsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sharedDecisionDetails, setSharedDecisionDetails] = useState(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchSharedDecisionsDetails = async () => {
      try {
        const details = await getSharedDecisionDetails();

        const token = localStorage.getItem("token");

        const userResp = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setUserName(userResp.data.tasks[0].displayname);
        setSharedDecisionDetails(details);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch inner circle details", error);
        setLoading(false);
      }
    };
    fetchSharedDecisionsDetails();
  }, []);

  useEffect(() => {
    const fetchReceivedDecisionsCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/group/getSharedDecisionsCount`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setReceivedDecisionsCount(response.data.decisionCount);
      } catch (error) {
        console.error("Error fetching received decision count:", error);
      }
    };
    fetchReceivedDecisionsCount();
  }, []);

  useEffect(() => {
    const fetchSharedByDecisionsCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/group/getSharedByDecisionsCount`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setSharedByDecisionsCount(response.data.decisionCount);
      } catch (error) {
        console.error("Error fetching shared by decision count:", error);
      }
    };
    fetchSharedByDecisionsCount();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const responseData = response.data;
        if (Array.isArray(responseData.decisionData)) {
          setData(responseData.decisionData);
        } else {
          console.error("Invalid response format:", responseData);
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const pendingDecisions = data.filter(
      (decision) => !decision.decision_taken_date,
    );
    setPendingDecisionsData(pendingDecisions);
  }, [data]);

  const filteredData = data.filter((decision) => {
    const decisionNameMatch =
      decision.decision_name &&
      decision.decision_name.toLowerCase().includes(searchTerm.toLowerCase());
    const tagMatch =
      Array.isArray(decision.tags) &&
      decision.tags.some(
        (tag) =>
          tag.tag_name &&
          tag.tag_name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const isPending = !decision.decision_taken_date;
    return decisionNameMatch || tagMatch || isPending;
  });

  const liveDecisionsCount = filteredData.length;
  const pendingDecisionsCount = pendingDecisionsData.length;

  const togglePendingDecisions = () => {
    setShowPendingDecisions(!showPendingDecisions);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-heading">Hi {userName},</h1>
          <p className="dashboard-subheading">
            Your next decision starts here. Explore possibilities, gain
            insights, and make every choice count.{" "}
          </p>
        </div>
      </div>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <div className="metric-card" onClick={() => navigate("/readd")}>
            <div className="metric-card-left">
              <div className="metric-icon-box">
                <AssignmentTurnedIn />
              </div>
              <h3 className="metric-title">Total Decisions</h3>
            </div>
            <span className="metric-count">{liveDecisionsCount}</span>
          </div>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <div className="metric-card" onClick={togglePendingDecisions}>
            <div className="metric-card-left">
              <div className="metric-icon-box">
                <HourglassEmpty />
              </div>
              <h3 className="metric-title">Pending Decisions</h3>
            </div>
            <span className="metric-count">{pendingDecisionsCount}</span>
          </div>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <div
            className="metric-card"
            onClick={() => navigate("/shared-decisions")}
          >
            <div className="metric-card-left">
              <div className="metric-icon-box">
                <ModelTrainingIcon />
              </div>
              <h3 className="metric-title">Shared with me</h3>
            </div>
            <span className="metric-count">{receivedDecisionsCount}</span>
          </div>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <div className="metric-card" onClick={() => navigate("/sharedByMe")}>
            <div className="metric-card-left">
              <div className="metric-icon-box">
                <Share />
              </div>
              <h3 className="metric-title">Shared by me</h3>
            </div>
            <span className="metric-count">{sharedByDecisionsCount}</span>
          </div>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <div className="metric-card" onClick={() => navigate("/decision")}>
            <div className="metric-card-left">
              <div className="metric-icon-box">
                <MdFormatListBulletedAdd style={{ fontSize: "24px" }} />
              </div>
              <h3 className="metric-title">Log a Decision</h3>
            </div>
            <span style={{ color: "#2563eb", fontWeight: 600 }}>+ New</span>
          </div>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <div
            className="metric-card"
            onClick={() =>
              window.open(
                "https://decision-coach-insights.onrender.com/login",
                "_blank",
                "noopener,noreferrer",
              )
            }
          >
            <div className="metric-card-left">
              <div className="metric-icon-box">
                <Insights style={{ fontSize: "24px" }} />
              </div>
              <h3 className="metric-title">Insights</h3>
            </div>
            <span style={{ color: "#64748b", fontSize: "0.9rem" }}>Open ↗</span>
          </div>
        </Grid>
      </Grid>

      {showPendingDecisions && (
        <div className="pending-section">
          <h2 className="pending-section-title">Pending Decisions</h2>
          <div className="modern-table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Decision Name</th>
                  <th>Decision Due Date</th>
                  <th>Decision Details</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingDecisionsData.length > 0 ? (
                  pendingDecisionsData.map((decision, index) => (
                    <tr key={decision.decision_id || index}>
                      <td style={{ fontWeight: 600 }}>
                        {decision.decision_name}
                      </td>
                      <td>
                        {decision.decision_due_date
                          ? new Date(
                              decision.decision_due_date,
                            ).toLocaleDateString()
                          : "No due date"}
                      </td>
                      <td>{decision.user_statement || "—"}</td>
                      <td>
                        <button
                          className="edit-action-btn"
                          onClick={() =>
                            navigate(`/decision/${decision.decision_id}`)
                          }
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      style={{
                        textAlign: "center",
                        color: "#94a3b8",
                        padding: "2rem",
                      }}
                    >
                      No pending decisions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default withAuth(Dashboard);
