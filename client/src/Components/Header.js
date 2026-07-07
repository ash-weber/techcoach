import React, { useState, useEffect } from 'react';
import './Header.css';
import { Link, useNavigate } from 'react-router-dom';
import tech from './assets/tech.png';
import { getInnerCircleAcceptNotification } from '../Components/Group/Network_Call';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin,setIsAdmin] = useState(false);
    const navigate = useNavigate();
    const [response, setResponse] = useState(null);
    const [notAcceptedMembersCount, setNotAcceptedMembersCount] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            fetchUserType(token);
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    const fetchUserType = async () =>{
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/type`,{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('UserType',response.data)
            setIsAdmin(response.data.isAdmin || false);
        } catch (error) {
            console.error('Error fetching User type:',error);
            if (error.response && error.response.status === 401) {
                toast.error('Session timed out. Please log in again.');
                localStorage.removeItem('token'); 
                localStorage.removeItem('user_id');
                setIsLoggedIn(false);
                navigate('/'); 
            } else {
                toast.error('An error occurred. Please try again.');
            }
            setIsAdmin(false);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            const response = await getInnerCircleAcceptNotification();
            console.log("response from notification", response);
            setResponse(response);
            if (response && response.notAcceptedMembers && response.groupDetails) {
                const count = response.notAcceptedMembers.filter(member =>
                    response.groupDetails[member.group_id] && response.groupDetails[member.group_id].userDetails !== null
                ).length;
                setNotAcceptedMembersCount(count);
            }
        };

        if (isLoggedIn) {
            fetchData();
        }
    }, [isLoggedIn]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        setIsLoggedIn(false);
        navigate("/");
    };

    return (
        <div>
            <nav className="navbar navbar-expand-lg f-5">
                <div className="container">
                    <a href="/dashboard" className="image-link">
                        <img src={tech} alt='' className='image' />
                    </a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarScroll" aria-controls="navbarScroll" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarScroll">
                        <ul className="navbar-nav ms-auto">
                            {isLoggedIn ? (
                                <>
                                {isAdmin && (
                                        <li className="nav-item">
                                            <Link to='/admin' className="nav-link">Admin</Link>
                                        </li>
                                    )}

                                    <li className="nav-item">
                                        <Link to='/dashboard' className="nav-link">Dashboard</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to='/readd' className="nav-link">Decision</Link>
                                    </li>
                                    <li className="nav-item">
                                        <a href="http://decisioncoach.techcoach4u.com" target="_blank" rel="noopener noreferrer" className="nav-link">Guide</a>
                                    </li>
                                    <li className="nav-item">
                                        <Link to='/getdecisioncircle' className="nav-link">Decision Circle</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to='/innerCircleDisplay' className="nav-link">Inner Circle</Link>
                                    </li>

                                    <li className="nav-item" style={{ marginRight: "0.5rem" }}>
                                        <Link to='/notification' className="nav-link position-relative">
                                            Notifications
                                            {notAcceptedMembersCount > 0 && (
                                                <span className="position-absolute top-10 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "0.6rem" }}>
                                                    {notAcceptedMembersCount}
                                                    <span className="visually-hidden">New alerts</span>
                                                </span>
                                            )}
                                        </Link>
                                    </li>

                                    

                                    <li className="nav-item dropdown">
                                        <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                            Profile
                                        </a>
                                        <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                                            <li>
                                                <Link to='/profile' className="dropdown-item">Profile</Link>
                                            </li>
                                            <li>
                                                <Link to='/advancedProfile' className="dropdown-item">Advanced-Profile</Link>
                                            </li>
                                            <li>
                                                <Link to='/skillget' className="dropdown-item">Soft Skills</Link>
                                            </li>
                                            <li>
                                                <Link to='/' onClick={handleLogout} className="dropdown-item">Logout</Link>
                                            </li>
                                        </ul>
                                    </li>
                                    <li className="nav-item">
                                        <Link to='https://decision-coach-insights.onrender.com/login' className="nav-link" target="_blank" >Insights</Link>
                                    </li>
                                </>
                            ) : (
                                <li className="nav-item">
                                    <Link to='/' className="nav-link">Home</Link>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default Header;
