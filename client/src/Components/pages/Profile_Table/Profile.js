import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FaUserEdit } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import withAuth from '../../withAuth';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Profile.css';


const Profile = () => {
  const [formData, setFormData] = useState({});
  const [userData, setUserData] = useState({});
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState({
    isSubscribed: false,
    status: "INACTIVE",
    lastPaymentTime: null,
    nextBillingTime: null
  });

  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userResp = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const user = userResp.data.tasks && userResp.data.tasks.length ? userResp.data.tasks[0] : {};
        console.log('asas', userResp);
        setUserData(user);

        const formResp = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/data`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setFormData(formResp.data);
        console.log('Fetched profile data:', formResp.data);

        const decisionsResp = await axios.get(`${process.env.REACT_APP_API_URL}/api/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const subResp = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/subscription/status`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setSubscription(subResp.data);
        if (Array.isArray(decisionsResp.data.decisionData)) {
          setDecisions(decisionsResp.data.decisionData);
        } else {
          console.error("Invalid response format:", decisionsResp.data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error.message);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const startSubscription = async () => {

    try {

      setSubscriptionLoading(true);

      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/subscription/create`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      window.location.href = res.data.approvalUrl;

    }
    catch {

      toast.error("Failed to start subscription");

      setSubscriptionLoading(false);

    }

  };

  const renderLines = (data) => {
    if (Array.isArray(data)) {
      return data.map((item, index) => (
        <div key={index} className="profile-line">
          {item.value ? item.value.trim() : ''}
        </div>
      ));
    }
    return <div className="profile-line">{data}</div>;
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm("Are you sure you want to delete your account? Your data is protected through Encryption. At any point you want us to delete your data, you can use the delete account option. We recommend that you download a copy of the data before you delete your account This action cannot be undone.");
    if (confirmation) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/user/data`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        localStorage.removeItem('token');
        window.location.reload();
        navigate("/");
      } catch (error) {
        console.error('Error deleting account:', error.message);
      }
    }
  };

  const handleDownloadData = () => {
    const decisionData = decisions.map(decision => ({
      'Decision Name': decision.decision_name,
      'Decision Due Date': new Date(decision.decision_due_date).toLocaleDateString(),
      'Decision Taken Date': decision.decision_taken_date ? new Date(decision.decision_taken_date).toLocaleDateString() : '--',
      'Decision Details': decision.user_statement,
      'Tags': decision.tags ? decision.tags.map(tag => tag.tag_name).join(', ') : '',
      'Decision Reasons': decision.decision_reason ? decision.decision_reason.map(reason => reason.decision_reason_text).join(', ') : ''
    }));

    const worksheetDecisions = XLSX.utils.json_to_sheet(decisionData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheetDecisions, 'Decisions Data');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'decisions_data.xlsx');
    if (data) {
      toast('downloaded successfully')
    }
  };


  const handleDownloadProfile = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('Profile Data:', 20, 20);

    const extractData = (data) => {
      if (Array.isArray(data)) {
        return data.map(item => (item.value ? item.value.trim() : '')).join('\n\n');
      }
      return data ? data.trim() : 'N/A';
    };

    const profileData = [
      { category: 'Strength', details: extractData(formData.strength), color: [13, 97, 16] },
      { category: 'Weakness', details: extractData(formData.weakness), color: [41, 128, 185] },
      { category: 'Opportunity', details: extractData(formData.opportunity), color: [153, 77, 28] },
      { category: 'Threat', details: extractData(formData.threat), color: [165, 42, 42] }
    ];

    let yPos = 40;
    const cellWidth = (doc.internal.pageSize.width - 60) / 2;
    const cellHeight = 50; // Adjust cell height as needed
    const rowSpacing = 80; // Adjust vertical spacing between rows
    const colSpacing = 10; // Adjust horizontal spacing between columns

    profileData.forEach((item, index) => {
      const rowIndex = Math.floor(index / 2);
      const colIndex = index % 2;

      const xPos = 20 + (colIndex * (cellWidth + colSpacing));

      // Set cell properties
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(item.color[0], item.color[1], item.color[2]);
      doc.text(item.category, xPos, yPos + (rowIndex * (cellHeight + rowSpacing)) - 10);

      // Create autoTable for each cell
      doc.autoTable({
        startY: yPos + (rowIndex * (cellHeight + rowSpacing)),
        margin: { left: xPos },
        head: [[item.category]],
        body: item.details.split('\n\n').map(detail => [detail]),
        theme: 'grid',
        headStyles: {
          fillColor: item.color,
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          cellPadding: 4,
          textColor: 'black',
          fontSize: 12,
          valign: 'middle',
          lineWidth: 0.1,
          cellWidth: cellWidth - 10
        },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        rowStyles: {
          0: { fillColor: [240, 240, 240] },
          1: { fillColor: [245, 230, 235] }
        }
      });
    });

    doc.save('profile_data.pdf');
    toast('Profile data downloaded successfully');
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className='spinner'></div>
      </div>
    );
  }

  return (
    <div className="card1">
      <div >
        <h3>Profile</h3>
        <div className="profile-top-section">

          {/* Profile Picture */}
          <div className="profile-picture-container">

            {userData.profilePicture ? (

              <img
                src={userData.profilePicture}
                alt="Profile"
                className="profile-picture"
              />

            ) : (

              <div className="profile-placeholder">
                {userData.displayname?.charAt(0).toUpperCase()}
              </div>

            )}

          </div>


          {/* User Basic Info */}
          <div className="profile-basic-info">

            <h3 className="profile-name">
              {userData.displayname
                ? userData.displayname.charAt(0).toUpperCase() + userData.displayname.slice(1)
                : ""}
            </h3>

            <p className="profile-email">
              {userData.email}
            </p>

            <div className='details'>
              
              <Link to='/profiletab'>
              Edit Profile
              </Link>
            </div>

          </div>


          {/* Linked Decisions Button */}
          <div className="profile-action-container">

            <Link to="/getall" className="linked-decisions-btn">

              View Linked Decisions

            </Link>

          </div>

        </div>
        <div className="profile-header-container">

          <div className="subscription-card">

            <h3>Subscription</h3>

            <div className="subscription-row">
              <span>Status:</span>

              <span className={
                subscription.isSubscribed
                  ? "status-active"
                  : "status-inactive"
              }>
                {subscription.isSubscribed ? "Active" : "Inactive"}
              </span>
            </div>


            {subscription.lastPaymentTime && (
              <div className="subscription-row">
                <span>Last Payment:</span>
                <span>
                  {new Date(subscription.lastPaymentTime).toLocaleDateString()}
                </span>
              </div>
            )}


            {subscription.nextBillingTime && (
              <div className="subscription-row">
                <span>Next Billing:</span>
                <span>
                  {new Date(subscription.nextBillingTime).toLocaleDateString()}
                </span>
              </div>
            )}


            {!subscription.isSubscribed && (
              <button
                className="subscribe-btn"
                onClick={startSubscription}
                disabled={subscriptionLoading}
              >
                {subscriptionLoading
                  ? "Redirecting..."
                  : "Subscribe $1 / Month"}
              </button>
            )}

          </div>

        </div>

        {Object.keys(formData).length ? (

          <div className="swot-container">

            {/* Header */}
            <div className="swot-header">

              <div>

                <p className="swot-desc">
                  Your ability to take better decisions is influenced by your Self Awareness.
                  This section helps you align your strengths and weaknesses with your decisions.
                </p>
              </div>

              <a
                href="https://academy.greenestep.com/courses/swot-analysis/"
                target="_blank"
                rel="noopener noreferrer"
                className="swot-link"
              >
                Learn SWOT Analysis
              </a>

            </div>


            {/* SWOT Grid */}
            <div className="swot-grid">

              {formData.attitude && (
                <div className="swot-card attitude">
                  <h4>Attitude</h4>
                  {renderLines(formData.attitude)}
                </div>
              )}

              {formData.strength && (
                <div className="swot-card strength">
                  <h4>Strength</h4>
                  {renderLines(formData.strength)}
                </div>
              )}

              {formData.weakness && (
                <div className="swot-card weakness">
                  <h4>Weakness</h4>
                  {renderLines(formData.weakness)}
                </div>
              )}

              {formData.opportunity && (
                <div className="swot-card opportunity">
                  <h4>Opportunity</h4>
                  {renderLines(formData.opportunity)}
                </div>
              )}

              {formData.threat && (
                <div className="swot-card threat">
                  <h4>Threat</h4>
                  {renderLines(formData.threat)}
                </div>
              )}

            </div>

          </div>

        ) : (

          <div className="no-profile-data">
            No profile data available
          </div>

        )}
      </div>
      
      <div className="profile-actions-container">

        {/* Download Section */}
        <div className="download-section">

          <div className="action-buttons">

            <button
              className="action-btn download-btn"
              onClick={handleDownloadData}
            >
              Download Decision Data
            </button>

            <button
              className="action-btn download-btn"
              onClick={handleDownloadProfile}
            >
              Download Profile Data
            </button>

          </div>

        </div>


        {/* Danger Section */}
        <div className="danger-section">

          <button
            className="action-btn delete-btn"
            onClick={handleDeleteAccount}
          >
            Delete Account
          </button>

        </div>

        <ToastContainer />

      </div>
    </div>
  );
};

export default withAuth(Profile);