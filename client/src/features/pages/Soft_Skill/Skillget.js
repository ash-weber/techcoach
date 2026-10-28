
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Skillget.css";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdDescription } from "react-icons/md";
import withAuth from "../../../utils/withAuth";

const Skillget = () => {
  const [skills, setSkills] = useState([]);

  const fetchSkills = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/skill/get`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSkills(response.data.skills);
    } catch (err) {
      toast.error("Error fetching skill data");
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.REACT_APP_API_URL}/skill/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchSkills();
      toast.success("Soft skill data deleted successfully");
    } catch (err) {
      toast.error("Error deleting soft skill data");
    }
  };

  const handleDeleteAll = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.REACT_APP_API_URL}/skill`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchSkills();
      toast.success("All soft skills have been deleted successfully");
    } catch (err) {
      toast.error("Error deleting all soft skills");
    }
  };

  const toggleDescription = (index) => {
    const values = [...skills];
    values[index].showDescription = !values[index].showDescription;
    setSkills(values);
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const filteredSkills = skills.filter(
    (skill) => skill.rating !== null && skill.comments !== null
  );

  return (
    <div className="skillget">
      <h3 className="center mt-5">Soft Skills - Self Assessment</h3>

     
      <div className="setup-profile">
        <h5 className="profile-text">
          Setup your Technical Profile here:{" "}
          <a
            href="https://www.app.careersheets.in/user/profile"
            target="_blank"
            rel="noopener noreferrer"
            className="profile-link"
          >
            Career Sheets
          </a>
        </h5>
      </div>

      <div>
        <Link to="/softskill">
          <button className="softskill-head">Add Skills</button>
        </Link>
      </div>

      <div className="skill-table-main">
        <table className="skill-table">
          <thead>
            <tr>
              <th>Skill Name</th>
              <th>Rating</th>
              <th>Assessment Notes and Action Plan</th>
              <th>Improvement</th>
            </tr>
          </thead>
          <tbody>
            {filteredSkills.map((skill, index) => (
              <tr key={skill.id}>
                <td>
                  {skill.skill_name}
                  <MdDescription
                    className="show-description-icon"
                    onClick={() => toggleDescription(index)}
                  />
                  {skill.showDescription && (
                    <p className="description">
                      Description: {skill.description}
                    </p>
                  )}
                </td>
                <td>{skill.rating}</td>
                <td>{skill.comments}</td>
                <td className="action">
                  <Link to={`/editskill/${skill.id}`}>
                    <button className="edit">Edit</button>
                  </Link>
                  <button
                    className="delete"
                    onClick={() => handleDelete(skill.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="deleteall" onClick={handleDeleteAll}>
        Delete All
      </button>

      <ToastContainer />
    </div>
  );
};

export default withAuth(Skillget);
