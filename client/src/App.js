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
import Decision from "./features/pages/Decision/Decision.js";
import Readd from "./features/pages/Decision/Readd.js";
import View from "./features/pages/Decision/View.js";
import Profile from "./features/pages/Profile_Table/Profile.js";
import InnerCircle from "./features/Group/InnerGroup.js";
import MultipleMemberGroup from "./features/Group/MultipleMemberGroup.js";
import DisplayInnerCircle from "./features/Group/DisplayInnerCircle.js";
import AcceptOrNot from "./features/Group/AcceptOrNot.js";
import Notification from "./features/Notification/Notification.js";
import ProfileTab from "./features/pages/Profile_Table/ProfileTab.js";
import SharedDecision from "./features/Group/SharedWithMe/SharedDecisions.js";
import DashboardRedirect from "./features/DashBoard/DashboardRedirect.js";
import ReceivedDecisionsTab from "./features/DashBoard/ReceivedDecisionsTab.js";
import ShareWithMe from "./features/DashBoard/ShareWithMe.js";
import SoftSkill from "./features/pages/Soft_Skill/Soft_Skill.js";
import Skillget from "./features/pages/Soft_Skill/Skillget.js";
import EditSkill from "./features/pages/Soft_Skill/EditSkill.js";
import AddLink from "./features/pages/Decision-Link/AddLink.js";
import GetLink from "./features/pages/Decision-Link/GetLink.js";
import DecisionCircle from "./features/Decision_Circle/DecisionCircle.js";
import GetGroup from "./features/Decision_Circle/GetGroup.js";
import ShareCircle from "./features/Decision_Circle/ShareCircle.js";
import DecisionGroup from "./features/Decision_Circle/DecisionGroup.js";
import ShowUsers from "./features/Decision_Circle/ShowUsers.js";
import ShareCircleGroup from "./features/Decision_Circle/ShareCircleGroup.js";
import MemberSharedDecisions from "./features/Decision_Circle/MemberSharedDecisions.js";
import SharedDecisionCircle from "./features/Decision_Circle/SharedDecisionCircle.js";
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
        <Route path="/adminView/:id" element={<AdminView />} />
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="/decision" element={<Decision />} />
        <Route path="/decision-circle" element={<DecisionCircle />} />
        <Route path="/innerCircle" element={<InnerCircle />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/softskill" element={<SoftSkill />} />

        <Route path="/profiletab" element={<ProfileTab />} />
        <Route path="/advancedProfile" element={<AdvancedProfile />} />
        <Route
          path="/advancedProfileTable"
          element={<AdvancedProfileTable />}
        />

        <Route path="/skillget" element={<Skillget />} />
        <Route path="/editskill/:id" element={<EditSkill />} />

        <Route path="/link/:id" element={<AddLink />} />
        <Route path="/getall" element={<GetLink />} />

        <Route path="/softskill" element={<SoftSkill />} />
        <Route path="/skillget" element={<Skillget />} />
        <Route path="/editskill/:id" element={<EditSkill />} />
        <Route path="/getall" element={<GetLink />} />

        <Route path="/decision" element={<Decision />} />
        <Route path="/decision/:id" element={<Decision />} />
        <Route path="/readd" element={<Readd />} />
        <Route path="/views/:id" element={<View />} />

        <Route path="/decision-circle/:id" element={<DecisionCircle />} />
        <Route path="/getdecisioncircle" element={<GetGroup />} />
        <Route path="/decisiongroup" element={<DecisionGroup />} />
        <Route path="/decisiongroup/:id" element={<DecisionGroup />} />
        <Route path="/getdecisioncircle/:groupId" element={<ShowUsers />} />
        <Route path="/sharecircle/:id" element={<ShareCircle />} />
        <Route path="/shareCircleDisplay/:id" element={<ShareCircleGroup />} />
        <Route
          path="/getmembershareddecisions/:groupId"
          element={<MemberSharedDecisions />}
        />

        <Route path="/shared-decisions" element={<SharedDecision />} />
        <Route path="/sharedByMe" element={<ShareWithMe />} />
        <Route path="/receivedDecisions" element={<ReceivedDecisionsTab />} />
        <Route
          path="/sharedDecisionCircle"
          element={<SharedDecisionCircle />}
        />
        <Route path="/paypal/success" element={<PaypalSuccess />} />
        <Route path="/paypal/cancel" element={<PaypalCancel />} />

        <Route path="/group" element={<MultipleMemberGroup />} />
        <Route path="/innerCircleDisplay" element={<DisplayInnerCircle />} />
        <Route path="/shareAcceptOrNot" element={<AcceptOrNot />} />

        <Route path="/notification" element={<Notification />} />
      </Route>
    </Routes>
  );
}

export default App;
