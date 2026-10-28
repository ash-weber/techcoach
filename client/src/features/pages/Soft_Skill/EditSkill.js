import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EditSkill.css';
import { useNavigate, useParams } from 'react-router-dom';
import { MdDescription } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import withAuth from '../../../utils/withAuth';

const EditSkill = () => {
    const [skill, setSkill] = useState(null);
    const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchSkill = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/skill/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setSkill(response.data.skill[0]);
            } catch (err) {
                toast.error('Error fetching skill data');
            }
        };

        fetchSkill();
    }, [id]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setSkill(prevSkill => ({
            ...prevSkill,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSaveButtonDisabled(true); // Disable the Save button initially
        setLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${process.env.REACT_APP_API_URL}/skill/${id}`, skill, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success("Soft Skill Updated Successfully");
            setTimeout(() => {
                navigate('/skillget');
            }, 1500);
        } catch (err) {
            toast.error('Error updating skill data');
            setIsSaveButtonDisabled(false); 
        } finally {
            setLoading(false);
        }
    };

    const toggleDescription = () => {
        setSkill(prevSkill => ({
            ...prevSkill,
            showDescription: !prevSkill.showDescription
        }));
    };

    if (!skill) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h3 className='center'>Edit Soft-Skills</h3>
            <form className='formm' onSubmit={handleSubmit}>
                <center>
                    <table className='table'>
                        <thead>
                            <tr>
                                <th>S.no</th>
                                <th>Skill Name</th>
                                <th>Rating (1-10)</th>
                                <th>Our Comments</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1.</td>
                                <td>
                                    <div className='skill-container'>
                                        <span>{skill.skill_name}</span>
                                        <MdDescription
                                            className='show-description-icon'
                                            onClick={toggleDescription}
                                        />
                                        {skill.showDescription && (
                                            <p className='description'>
                                                Description: {skill.description}
                                            </p>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <input
                                        type='number'
                                        min='1'
                                        max='10'
                                        name='rating'
                                        value={skill.rating}
                                        onChange={handleChange}
                                    />
                                </td>
                                <td>
                                    <textarea
                                        className='textarea'
                                        name='comments'
                                        value={skill.comments}
                                        onChange={handleChange}
                                    ></textarea>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </center>
                <button type='submit'
                    disabled={loading || isSaveButtonDisabled}
                    className='btn btn-primary bg-secondary'>Update</button>
            </form>
            <ToastContainer />
        </div>
    );
};

export default withAuth(EditSkill);
