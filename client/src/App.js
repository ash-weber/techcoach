import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.js";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import Layout from "./components/layout/Layout.js";

// Import the login page
import Login from "./features/Login/Login.js";

// Import admin pages
import Admin from "./features/Admin/Admin.js";
import AdminView from "./features/Admin/AdminView.js";

// Import dashboard pages
import DashboardRedirect from "./features/DashBoard/DashboardRedirect.js";
import SharedDecision from "./features/DashBoard/sharedWithMe/SharedDecisions.js";
import ShareByMe from "./features/DashBoard/sharedByMe/ShareByMe.js";

// Import decision-related pages
import Decision from "./features/Decision/Table/index.js";
import DecisionForm from "./features/Decision/Form/index.js";
import DecisionView from "./features/Decision/Views/index.js";

// Import decision-circle sharing components
import DecisionCircleView from "./features/Decision/ShareDecision/Share/ShareCircle.js";
import DecisionCircleShare from "./features/Decision/ShareDecision/Share/ShareCircleGroup.js";

// Import profile pages
import ProfileView from "./features/Profile/View/index.js";
import ProfileForm from "./features/Profile/Form/index.js";

// Import advanced profile pages
import AdvancedProfileView from "./features/Profile/AdvancedProfile/View/index.js";
import AdvancedProfileForm from "./features/Profile/AdvancedProfile/Form/index.js";

// Import soft-skill pages
import SoftSkillView from "./features/Profile/Soft_Skill/View/index.js";
import SoftSkillForm from "./features/Profile/Soft_Skill/Form/index.js";
import EditSkill from "./features/Profile/Soft_Skill/Form/EditSkill.js";

// Import linked-decision pages
import LinkView from "./features/Profile/LinkedDecisions/View/index.js";
import LinkForm from "./features/Profile/LinkedDecisions/Form/index.js";

// Import notification page
import Notification from "./features/Notification/Notification.js";

// Import inner-circle pages
import InnerCircleView from "./features/Inner_Circle/View/index.js";
import InnerCircleForm from "./features/Inner_Circle/Form/index.js";

// Import decision-circle management pages
import DecisionCircleAll from "./features/Decision_Circle/View/index.js";
import DecisionCircleForm from "./features/Decision_Circle/Form/index.js";
import DecisionCircle from "./features/Decision_Circle/View/DecisionCircle.js";
import DecisionCircleAddMember from "./features/Decision_Circle/Form/DecisionCircleAddMember.js";
import DecisionCircleDecisions from "./features/Decision_Circle/ShareWithMe/DecisionCircleDecisions.js";

// Import PayPal payment result pages
import PaypalSuccess from "./features/Paypal/PaypalSuccess.js";
import PaypalCancel from "./features/Paypal/PaypalCancel.js";

function App() {
  useEffect(() => {
    const setAuthToken = () => {
      const token = localStorage.getItem("token");
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
    };
    const setupAxiosInterceptors = () => {
      axios.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response && error.response.status === 401) {
            toast.error("Session expired. Please log in again.", {
              position: "top-right",
              autoClose: 5000,
            });

            localStorage.removeItem("token");

            localStorage.removeItem("user_id");

            window.location.href = "/";
          }
          return Promise.reject(error);
        },
      );
    };
    setAuthToken();
    setupAxiosInterceptors();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<Layout />}>
        {/* ==================== ADMIN ROUTES ==================== */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/view/:id" element={<AdminView />} />

        {/* ==================== DASHBOARD ROUTES ==================== */}
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="/shared-decisions" element={<SharedDecision />} />
        <Route path="/shared-by-me" element={<ShareByMe />} />

        {/* ==================== DECISION ROUTES ==================== */}
        <Route path="/decision" element={<Decision />} />
        <Route path="/decision/add" element={<DecisionForm />} />
        <Route path="/decision/edit/:id" element={<DecisionForm />} />
        <Route path="/decision/view/:id" element={<DecisionView />} />
        <Route
          path="/decision/decision-circle/view/:id"
          element={<DecisionCircleView />}
        />
        <Route
          path="/decision/decision-circle/share/:id"
          element={<DecisionCircleShare />}
        />

        {/* ==================== NOTIFICATION ROUTE ==================== */}
        <Route path="/notification" element={<Notification />} />

        {/* ==================== PROFILE ROUTES ==================== */}
        <Route path="/profile" element={<ProfileView />} />
        <Route path="/profile/edit" element={<ProfileForm />} />

        {/* ==================== ADVANCED PROFILE ROUTES ==================== */}
        <Route
          path="/profile/advanced-profile"
          element={<AdvancedProfileView />}
        />
        <Route
          path="/profile/advanced-profile/add"
          element={<AdvancedProfileForm />}
        />

        {/* ==================== SOFT-SKILL ROUTES ==================== */}

        <Route path="/profile/soft-skill" element={<SoftSkillView />} />
        <Route path="/profile/soft-skill/add" element={<SoftSkillForm />} />
        <Route path="/profile/soft-skill/edit/:id" element={<EditSkill />} />

        {/* ==================== LINKED-DECISION ROUTES ==================== */}
        <Route path="/profile/linked-decision" element={<LinkView />} />
        <Route path="/profile/linked-decision/add/:id" element={<LinkForm />} />

        {/* ==================== INNER-CIRCLE ROUTES ==================== */}
        <Route path="/inner-circle" element={<InnerCircleView />} />
        <Route path="/inner-circle/add" element={<InnerCircleForm />} />

        {/* ==================== DECISION-CIRCLE ROUTES ==================== */}
        <Route path="/decision-circle" element={<DecisionCircleAll />} />
        <Route path="/decision-circle/add" element={<DecisionCircleForm />} />
        <Route
          path="/decision-circle/edit/:id"
          element={<DecisionCircleForm />}
        />
        <Route
          path="/decision-circle/view/:groupId"
          element={<DecisionCircle />}
        />
        <Route
          path="/decision-circle/add/member/:id"
          element={<DecisionCircleAddMember />}
        />
        <Route
          path="/decision-circle/shared-with-me/:groupId"
          element={<DecisionCircleDecisions />}
        />

        {/* ==================== PAYPAL PAYMENT ROUTES ==================== */}
        <Route path="/paypal/success" element={<PaypalSuccess />} />
        <Route path="/paypal/cancel" element={<PaypalCancel />} />
      </Route>
    </Routes>
  );
}

export default App;
