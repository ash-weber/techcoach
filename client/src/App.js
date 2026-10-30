import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.js";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import Layout from "./components/layout/Layout.js";
import Login from "./features/Login/Login.js";

import Admin from "./features/Admin/Admin.js";
import AdminView from "./features/Admin/AdminView.js";

import Decision from "./features/Decision/Table/index.js";
import DecisionForm from "./features/Decision/Form/index.js";
import DecisionView from "./features/Decision/Views/index.js";

import Profile from "./features/Profile/index.js";
import InnerCircle from "./features/Inner_Circle/Form/InnerGroup.js";
import DisplayInnerCircle from "./features/Group/DisplayInnerCircle.js";
import Notification from "./features/Notification/Notification.js";
import ProfileTab from "./features/pages/Profile_Table/ProfileTab.js";
import SharedDecision from "./features/DashBoard/sharedWithMe/SharedDecisions.js";
import DashboardRedirect from "./features/DashBoard/DashboardRedirect.js";
import ShareByMe from "./features/DashBoard/sharedByMe/ShareByMe.js";
import SoftSkill from "./features/pages/Soft_Skill/Soft_Skill.js";
import Skillget from "./features/pages/Soft_Skill/Skillget.js";
import EditSkill from "./features/pages/Soft_Skill/EditSkill.js";
import AddLink from "./features/pages/Decision-Link/AddLink.js";
import GetLink from "./features/pages/Decision-Link/GetLink.js";
import DecisionCircle from "./features/Decision_Circle/DecisionCircle.js";
import GetGroup from "./features/Decision_Circle/View/index.js";
import DecisionGroup from "./features/Decision_Circle/DecisionGroup.js";
import ShowUsers from "./features/Decision_Circle/ShowUsers.js";

import DecisionCircleView from "./features/Decision/ShareDecision/Share/ShareCircle.js";
import DecisionCircleShare from "./features/Decision/ShareDecision/Share/ShareCircleGroup.js";


import MemberSharedDecisions from "./features/Decision_Circle/ShareWithMe/MemberSharedDecisions.js";
import AdvancedProfile from "./features/pages/Profile_Table/AdvancedProfile.js";
import AdvancedProfileTable from "./features/pages/Profile_Table/AdvancedProfileTable.js";
import PaypalSuccess from "./features/pages/paypal/PaypalSuccess.js";
import PaypalCancel from "./features/pages/paypal/PaypalCancel.js";

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
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/view/:id" element={<AdminView />} />


        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="/shared-decisions" element={<SharedDecision />} />
        <Route path="/shared-by-me" element={<ShareByMe />} />

        <Route path="/decision" element={<Decision />} />
        <Route path="/decision/add" element={<DecisionForm />} />
        <Route path="/decision/edit/:id" element={<DecisionForm />} />
        <Route path="/decision/view/:id" element={<DecisionView />} />
        <Route path="/decision/decision-circle/view/:id" element={<DecisionCircleView />} />
        <Route path="/decision/decision-circle/share/:id" element={<DecisionCircleShare />} />

        <Route path="/notification" element={<Notification />} />


        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<ProfileTab />} />
        <Route path="/profile/advanced-profile" element={<AdvancedProfile />} />
        <Route
          path="/profile/advanced-profile/add"
          element={<AdvancedProfileTable />}
        />
        <Route path="/profile/soft-skill" element={<Skillget />} />
        <Route path="/profile/soft-skill/add" element={<SoftSkill />} />
        <Route path="/profile/soft-skill/edit/:id" element={<EditSkill />} />
        <Route path="/profile/linked-decision" element={<GetLink />} />
        <Route path="/profile/linked-decision/add/:id" element={<AddLink />} />


        <Route path="/inner-circle" element={<DisplayInnerCircle />} />
        <Route path="/inner-circle/add" element={<InnerCircle />} />


        <Route path="/decision-circle" element={<GetGroup />} />
        <Route path="/decision-circle/add" element={<DecisionCircle />} />
        <Route path="/decision-circle/edit/:id" element={<DecisionCircle />} />
        <Route path="/decision-circle/view/:groupId" element={<ShowUsers />} />
        <Route path="/decision-circle/add/member/:id" element={<DecisionGroup />} />
        <Route
          path="/decision-circle/shared-with-me/:groupId"
          element={<MemberSharedDecisions />}
        />
        
                
        <Route path="/paypal/success" element={<PaypalSuccess />} />
        <Route path="/paypal/cancel" element={<PaypalCancel />} />

        <Route path="/decisiongroup" element={<DecisionGroup />} />

                
      </Route>
    </Routes>
  );
}

export default App;
