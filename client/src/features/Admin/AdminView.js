import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { useParams } from 'react-router-dom';

const AdminView = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [decisionCount, setDecisionCount] = useState(null);
    const [lastLogin, setLastLogin] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserDetails(response.data)
            } catch (error) {
                console.log(error);
            }
        }
        fetchData();
    }, [id]);

    const fetchDecisionCount = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/decision/count/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDecisionCount(response.data)
        } catch (error) {
            console.log(error);
        }
    }

    const fetchLastLogin = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/login/last/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLastLogin(response.data)
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchDecisionCount();
        fetchLastLogin();
    }, [id]);

    if (!userDetails) {
        return (
            <div className="admin">
                <h2>User Details</h2>
                <div className="admin-detail-card">
                    <p className="admin-detail-loading">Loading user data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin">
            <h2>User Details</h2>

            <div className="admin-detail-card">
                <div className="admin-detail-header">
                    <img
                        src={userDetails.profilePicture}
                        alt={userDetails.displayname}
                        width="72"
                        height="72"
                        className="admin-detail-avatar"
                    />
                    <div>
                        <h3 className="admin-detail-name">{userDetails.displayname}</h3>
                        <p className="admin-detail-email">{userDetails.email}</p>
                    </div>
                </div>

                <div className="admin-detail-grid">
                    <div className="admin-detail-item">
                        <span className="admin-detail-label">Total Decisions</span>
                        <span className="admin-detail-value">
                            {decisionCount ? decisionCount.total_decisions : 'Loading...'}
                        </span>
                    </div>

                    <div className="admin-detail-item">
                        <span className="admin-detail-label">Last Login Date</span>
                        <span className="admin-detail-value">
                            {lastLogin ? new Date(lastLogin.lastLoginDate).toLocaleString() : 'Loading...'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminView

// import React, { useState, useEffect } from 'react'
// import axios from 'axios';
// import './Admin.css';
// import { useParams } from 'react-router-dom';

// const AdminView = () => {
//     const [userDetails, setUserDetails] = useState(null);
//     const [decisionCount, setDecisionCount] = useState(null);
//     const [lastLogin, setLastLogin] = useState(null);
//     const { id } = useParams();

//     // Fetch user details
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const token = localStorage.getItem('token');
//                 const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/${id}`, {
//                     headers: {
//                         Authorization: `Bearer ${token}`
//                     }
//                 });
//                 setUserDetails(response.data);
//             } catch (error) {
//                 console.log(error);
//             }
//         };
//         fetchData();
//     }, [id]);

//     // Fetch decision count
//     const fetchDecisionCount = async () => {
//         try {
//             const token = localStorage.getItem('token');
//             const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/decision/count/${id}`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`
//                 }
//             });
//             setDecisionCount(response.data);
//         } catch (error) {
//             console.log(error);
//         }
//     };

//     // Fetch last login date
//     const fetchLastLogin = async () => {
//         try {
//             const token = localStorage.getItem('token');
//             const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/login/last/${id}`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`
//                 }
//             });
//             setLastLogin(response.data);
//         } catch (error) {
//             console.log(error);
//         }
//     };

//     useEffect(() => {
//         fetchDecisionCount();
//         fetchLastLogin();
//     }, [id]);

//     return (
//         <div>
//             <h4>User Decision Count & Last Login Date</h4>
//             <div className='table-container'>
//                 <table className='admin-table'>
//                     <thead>
//                         <tr>
//                             <th>S.no</th>
//                             <th>User Name</th>
//                             <th>Email</th>
//                             <th>Total Decision</th>
//                             <th>Last Login Date</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {userDetails ? (
//                             <tr key={userDetails.user_id}>
//                                 <td>1</td>
//                                 <td>{userDetails.displayname}</td>
//                                 <td>{userDetails.email}</td>
//                                 <td>{decisionCount ? decisionCount.total_decisions : 'Loading'}</td>
//                                 <td>{lastLogin ? new Date(lastLogin.lastLoginDate).toLocaleString() : 'Loading'}</td>
//                             </tr>
//                         ) : (
//                             <tr>
//                                 <td colSpan="5">Loading user data...</td>
//                             </tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };

// export default AdminView;
