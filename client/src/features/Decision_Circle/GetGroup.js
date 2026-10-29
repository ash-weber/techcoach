import React, { useEffect, useState } from 'react';
import { getAlldecisionGroup, deleteDecisionGroup, getUserDecisionCircles } from '../../api/DecisionCircle/Network_Call';
import { MdEdit, MdDeleteForever, MdGroupAdd, MdGroupRemove } from "react-icons/md";
import { FaUsersViewfinder } from "react-icons/fa6";
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const GetGroup = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userCircles, setUserCircles] = useState([]);
    const [error, setError] = useState('');

    const { id } = useParams();
    const searchParams = new URLSearchParams(window.location.search);
    const groupName = searchParams.get("group_name");
    const navigate = useNavigate();



    const fetchGroups = async () => {
        setLoading(true);
        try {
            const data = await getAlldecisionGroup();
            setGroups(data);
            // toast.success('Groups fetched successfully');
        } catch (error) {
            // toast.error('Failed to fetch groups');
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const loadUserCircles = async () => {
        setLoading(true);
        try {
            const data = await getUserDecisionCircles();
            setUserCircles(data.decisionCircles || []);
        } catch (error) {
            setError('Failed to fetch user decision circles.');
            console.error('Error fetching user decision circles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGroup = async (id) => {
        if (window.confirm('Are you sure that you want to delete this decision-circle group')) {
            try {
                await deleteDecisionGroup(id);
                fetchGroups();
                setGroups(prevGroups => prevGroups.filter(group => group.id !== id));
                toast.success('Group deleted successfully');
            } catch (error) {
                toast.error('Failed to delete group');
            }
        }
    };

    useEffect(() => {
        fetchGroups();
        loadUserCircles();
    }, []);


    return (
        <div className="getGroup">
         <Link to='/decision-circle'><button  className='bg-secondary rounded border-0 outline-0 text-white p-1'>Add Decision Circle</button></Link>
            {loading ? (
                <p>Loading groups...</p>
            ) : groups.length === 0 ? (
                <div className='nogroup'>
                    <p>Please create a Decision Circle</p>
                    <Link to='/decision-circle'><button className='nogroup-button'>Click me</button></Link>
                </div>
            ) : (
                <div className="row sub-getGroup">
                    <h5 className='f-5 mt-3'>Decision Circle Created by Me</h5>
                    {groups.map(group => (
                        <div key={group.id} className="circle-items">
                            <div className="getGroupName">
                                <div className='editgroupname'>
                                    <h3>{group.group_name}</h3>
                                    <div className='mdedit'>
                                        <MdEdit className='mdedit-icon' onClick={() => navigate(`/decision-circle/${group.id}`)} />
                                        <MdDeleteForever className='mdedit-icon1' onClick={() => handleDeleteGroup(group.id)} />
                                    </div>
                                </div>

                                <Link to={`/getdecisioncircle/${group.id}?group_name=${group.group_name}`}><FaUsersViewfinder className='show-icon' />
                                </Link>
                                <div className='group-button'>
                                    <Link to={`/decisiongroup/${group.group_name}?id=${group.id}`}><MdGroupAdd className='add-icon' />
                                    </Link>
                                    <Link to={`/getdecisioncircle/${group.id}?group_name=${group.group_name}`}><MdGroupRemove className='remove-icon' />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div>
                <h5 className='f-5'> Decision Circle Created By Others</h5>
                <div className='circles'>
                    {userCircles.map(circle => (
                        <div key={circle.id} className="circle-item">
                            <div className="getcircles">
                                <h5 className='f-5'>{circle.group_name}</h5>
                                <p className='admin'>admin:{circle.created_by}</p>
                                <Link to={`/getmembershareddecisions/${circle.id}?group_name=${circle.group_name}`}>
                                    <FaUsersViewfinder className='show-icon' />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default GetGroup;
