import React, { useEffect, useState } from 'react';
import withAuth from '../../utils/withAuth';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { postdecisionGroup, putDecisionGroup,getDecisionGroup } from '../../api/DecisionCircle/Network_Call';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const DecisionCircle = () => {
  const [circleName, setCircleName] = useState('');
  const navigate = useNavigate();
  const {id} = useParams();


  const fetchDecisionGroup = async () =>{
    try {
      const existingGroup = await getDecisionGroup(id);
      setCircleName(existingGroup.group_name)
    } catch (error) {
      console.error('Error fetching decision group:', error);
    }
  }


  const handleSaveCircle = async () => {
    try {
      if (id) {
        const updatedData = ( circleName);
        const result = await putDecisionGroup(id,updatedData);
        toast.success('Decision group updated successfully');
      } else {
        const result = await postdecisionGroup(circleName);
        toast.success('Decision group created successfully')
      }
      navigate('/getdecisioncircle');
    } catch (error) {
      console.error('Failed to create/update decision group:', error);
      toast.error('Failed to Create/Update')
    }
  };

  const handleCircleNameChange = (event) => {
    setCircleName(event.target.value);
  };

  useEffect(()=>{
    fetchDecisionGroup();
  },[id]);

  return (
    <>
      <div>
        <center>
          <div className='circle mt-4'>
            <h4>Decision Circle</h4>
            <div>
              <p>Enter Circle Name :</p>
              <input
                type='text'
                placeholder='Enter Circle Name'
                value={circleName}
                onChange={handleCircleNameChange}
              />
              <button className='bg-secondary rounded border-0 outline-0 text-white ml-2' onClick={handleSaveCircle}>
                {id ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
          <Link to='/getdecisioncircle'>
            <button className='creategroup'>
              Get Circle Names
            </button>
          </Link>
        </center>
      </div>
      <ToastContainer />
    </>
  );
};

export default withAuth(DecisionCircle);
