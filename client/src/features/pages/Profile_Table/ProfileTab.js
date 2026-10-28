import React, { useEffect, useState } from "react";
import "./ProfileTab.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import withAuth from "../../../utils/withAuth";
import { CircularProgress } from "@mui/material";
   
const ProfileTab = () => {
  const [formData, setFormData] = useState({
    attitude: [""],
    strength: [""],
    weakness: [""],
    opportunity: [""],
    threat: [""],
  });
  const [loading, setLoading] = useState(true);
  const [isNewProfile, setIsNewProfile] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/user/data`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          const { attitude, strength, weakness, opportunity, threat } =
            response.data;
          if (response.data) {
            setFormData({
              attitude: attitude
                ? attitude.map((item) => ({ id: item.id, value: item.value }))
                : [{ id: null, value: "" }],
              strength: strength
                ? strength.map((item) => ({ id: item.id, value: item.value }))
                : [{ id: null, value: "" }],
              weakness: weakness
                ? weakness.map((item) => ({ id: item.id, value: item.value }))
                : [{ id: null, value: "" }],
              opportunity: opportunity
                ? opportunity.map((item) => ({
                    id: item.id,
                    value: item.value,
                  }))
                : [{ id: null, value: "" }],
              threat: threat
                ? threat.map((item) => ({ id: item.id, value: item.value }))
                : [{ id: null, value: "" }],
            });
            setIsNewProfile(false);
            setLoading(false);
          } else {
            throw new Error("Data format is incorrect");
          }
        })
        .catch((err) => {
          if (err.response) {
            if (err.response.status === 404) {
              toast.info(
                "No existing profile found. Please create a new profile."
              );
              setIsNewProfile(true);
            } else {
              console.error("Error response:", err.response.data);
              toast.error(`Error: ${err.response.statusText}`);
            }
          } else {
            console.error("Error message:", err.message);
            toast.error("An error occurred. Please try again.");
          }
        });
    } else {
      toast.error("No token found. Please log in.");
    }
  }, []);

  const addField = (type) => {
    setFormData((prevData) => ({
      ...prevData,
      [type]: [...prevData[type], { id: null, value: "" }],
    }));
  };

  const removeField = (type, index) => {
    setFormData((prevData) => {
      const updatedFields = [...prevData[type]];
      updatedFields.splice(index, 1);
      return {
        ...prevData,
        [type]: updatedFields,
      };
    });
  };

  const handleChange = (index, type, value) => {
    setFormData((prevData) => {
      const updatedFields = [...prevData[type]];
      updatedFields[index] = { ...updatedFields[index], value };
      return {
        ...prevData,
        [type]: updatedFields,
      };
    });
  };

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     [name]: value
  //   }));
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      attitude: formData.attitude.map((item) => ({
        id: item.id,
        value: item.value,
      })),
      strength: formData.strength.map((item) => ({
        id: item.id,
        value: item.value,
      })),
      weakness: formData.weakness.map((item) => ({
        id: item.id,
        value: item.value,
      })),
      opportunity: formData.opportunity.map((item) => ({
        id: item.id,
        value: item.value,
      })),
      threat: formData.threat.map((item) => ({
        id: item.id,
        value: item.value,
      })),
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please log in.");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (isNewProfile) {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/user/data`,
          data,
          config
        );
        toast.success("Profile Created successfully");
      } else {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/user/data`,
          data,
          config
        );
        toast.success("Profile Updated successfully");
      }
      navigate("/profile");
      setFormData({
        attitude: [""],
        strength: [""],
        weakness: [""],
        opportunity: [""],
        threat: [""],
      });
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const renderAdditionalFields = (type) => {
    if (!formData[type]) {
      return null;
    }
    return formData[type].map((field, index) => (
      <div className="additional-field" key={index}>
        <input
          type="text"
          value={field.value}
          onChange={(e) => handleChange(index, type, e.target.value)}
          placeholder={type.charAt(0).toUpperCase() + type.slice(1)}
        />
        <button
          type="button"
          className="remove-button"
          onClick={() => removeField(type, index)}
        >
          Remove
        </button>
      </div>
    ));
  };

  return (
    <>
      <div className="profile-page">
        <h3 className="profile-title">Profile Details</h3>
        {loading === false ? (
          <>
            <form onSubmit={handleSubmit} className="profile-header">
              <center>
                <div>
                  <label>Attitude:</label>
                  {renderAdditionalFields("attitude")}
                  <button
                    type="button"
                    className="add-button"
                    onClick={() => addField("attitude")}
                  >
                    Add
                  </button>
                </div>
                <div>
                  <label>Strength:</label>
                  {renderAdditionalFields("strength")}
                  <button
                    type="button"
                    className="add-button"
                    onClick={() => addField("strength")}
                  >
                    Add
                  </button>
                </div>
                <div>
                  <label>Weakness:</label>
                  {renderAdditionalFields("weakness")}
                  <button
                    type="button"
                    className="add-button"
                    onClick={() => addField("weakness")}
                  >
                    Add
                  </button>
                </div>
                <div>
                  <label>Opportunity:</label>
                  {renderAdditionalFields("opportunity")}
                  <button
                    type="button"
                    className="add-button"
                    onClick={() => addField("opportunity")}
                  >
                    Add
                  </button>
                </div>
                <div>
                  <label>Threat:</label>
                  {renderAdditionalFields("threat")}
                  <button
                    type="button"
                    className="add-button"
                    onClick={() => addField("threat")}
                  >
                    Add
                  </button>
                </div>
                <br />
                <input
                  type="submit"
                  className="submit-button"
                  value={isNewProfile ? "Save" : "Update"}
                  disabled={loading}
                />
              </center>
            </form>
          </>
        ) : (
          <div style={{display:"flex", justifyContent:"center", alignItems:"center"}}>
          <CircularProgress />
          </div>
        )}
        <ToastContainer />
      </div>
    </>
  );
};

export default withAuth(ProfileTab);
