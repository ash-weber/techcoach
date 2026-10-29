import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { useParams } from 'react-router-dom';

const AdminView = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [decisionCount, setDecisionCount] = useState(null);
    const [lastLogin, setLastLogin] = useState(null);
    const { id } = useParams();


    // Fetch user details
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUserDetails(response.data)
            } catch (error) {
                console.log(error);

            }
        }
        fetchData();
    }, [id]);


    // Fetch decision count
    const fetchDecisionCount = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/decision/count/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setDecisionCount(response.data)
        } catch (error) {
            console.log(error);

        }
    }

    // Fetch last login date
    const fetchLastLogin = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/login/last/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
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

    return (
        <div>
            <h4>User Decision count & Login Date</h4>
            <div className='table-container'>
                <table className='admin-table'>
                    <thead>
                        <tr>
                            <th>S.no</th>
                            <th>User Name</th>
                            <th>Email</th>
                            <th>Total Decision</th>
                            <th>Last Login Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userDetails ? (
                            <tr key={userDetails.user_id}>
                                <td>1</td>
                                <td>{userDetails.displayname}</td>
                                <td>{userDetails.email}</td>
                                <td>{decisionCount ? decisionCount.total_decisions : 'Loading'}</td>
                                <td>{lastLogin ? new Date(lastLogin.lastLoginDate).toLocaleString() : 'Loading'}</td>
                            </tr>
                        ) : (
                            <tr>
                                <td colSpan="5">Loading user data...</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div >
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
