
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Dashboard from "../DashBoard/Dashboard";

const DashboardRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

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

    if (token || userId) {
      navigate("/dashboard", { replace: true });
    }
  }, [location.search, navigate]);

  return <Dashboard />;
};

export default DashboardRedirect;
