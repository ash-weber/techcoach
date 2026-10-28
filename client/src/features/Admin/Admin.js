import React, { useEffect, useState } from 'react';
import './Admin.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast,ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import withAuth from '../../utils/withAuth';

const Admin = () => {
    const [userdatas, setUserDatas] = useState([]);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUserDatas(response.data)
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteAccount = async (id) => {
        const confirmation = window.confirm("Are you sure you want to delete your account? ");
        if (confirmation) {
          try {
            const token = localStorage.getItem('token');
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/account/${id}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            toast.success('Account deleted successfully');
            navigate('/admin');
          } catch (error) {
            console.error('Error deleting account:', error.message);
          }
        }
    };

    return (
        <div className='admin'>
            <h2>Admin Page</h2>
            <div className='table-container'>
                <table className='admin-table'>
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>User Name</th>
                            <th>Email</th>
                            <th>Profile Picture</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userdatas.map((userdata, index) => (
                            <tr key={userdata.user_id}>
                                <td>{index + 1}</td>
                                <td>{userdata.displayname}</td>
                                <td>{userdata.email}</td>
                                <td>
                                    <img
                                        src={userdata.profilePicture}
                                        alt={userdata.displayname}
                                        width="50"
                                        height="50"
                                        style={{ borderRadius: '50%' }}
                                    />
                                </td>
                                <td className='admin-button'>
                                    <Link to={`/adminView/${userdata.user_id}`}>
                                        <button className='view'>View</button>
                                    </Link>
                                    <button className='delete' onClick={() => handleDeleteAccount(userdata.user_id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ToastContainer />
        </div>
    )
}

export default withAuth(Admin);