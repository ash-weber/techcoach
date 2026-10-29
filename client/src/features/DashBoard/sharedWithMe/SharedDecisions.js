import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";

import InnerCircleDecision from "./InnerCircleDecisions";
import SharedDecisionCircle from "./DecisionCircleDecisions";

import "../../../assets/styles/pages/SharedDecision.css";

const SharedDecisions = () => {
  const [activeTab, setActiveTab] = useState("inner");

  return (
    <Box className="sharedDecision-page">
      <Box className="sharedDecision-button">
        <Button
          className={activeTab === "inner" ? "sharedDecision-inner" : ""}
          variant="outlined"
          onClick={() => setActiveTab("inner")}
        >
          Inner Circle Decisions
        </Button>

        <Button
          className={activeTab === "circle" ? "sharedDecision-decision" : ""}
          variant="outlined"
          onClick={() => setActiveTab("circle")}
        >
          Decision Circle Decisions
        </Button>
      </Box>

      {activeTab === "inner" ? (
        <InnerCircleDecision />
      ) : (
        <SharedDecisionCircle />
      )}
    </Box>
  );
};

export default SharedDecisions;
