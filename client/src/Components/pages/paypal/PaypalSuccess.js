import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const PaypalSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const subscriptionId = params.get('subscription_id');

    if (!subscriptionId) {
      toast.error('Invalid PayPal response');
      navigate('/');
      return;
    }

    confirmSubscription(subscriptionId);
  }, []);

  const confirmSubscription = async (subscriptionId) => {
    try {
      const token = localStorage.getItem('token');

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/subscription/confirm`,
        { subscriptionId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success('Subscription activated successfully');
      navigate('/dashboard');

    } catch (error) {
      console.error(error);
      toast.error('Subscription confirmation failed');
      navigate('/dashboard');
    }
  };

  return <h3>Activating your subscription, please wait…</h3>;
};

export default PaypalSuccess;
