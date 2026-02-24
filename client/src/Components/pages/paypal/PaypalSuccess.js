import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const PaypalSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('processing'); // processing | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const subscriptionId = params.get('subscription_id');

    if (!subscriptionId) {
      setStatus('error');
      setMessage('Invalid PayPal response.');
      setLoading(false);
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

      setStatus('success');
      setMessage('Your subscription has been activated successfully.');

    } catch (error) {
      console.error(error);

      setStatus('error');
      setMessage('Subscription confirmation failed. Please contact support.');

    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="60vh"
    >
      <Paper elevation={3} sx={{ padding: 4, textAlign: 'center', maxWidth: 400 }}>
        
        {/* Processing */}
        {loading && (
          <>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6">
              Activating your subscription...
            </Typography>
          </>
        )}

        {/* Success */}
        {!loading && status === 'success' && (
          <>
            <CheckCircleIcon
              sx={{ fontSize: 60, color: 'green', mb: 2 }}
            />

            <Typography variant="h6" sx={{ mb: 1 }}>
              Subscription Active
            </Typography>

            <Typography variant="body2" sx={{ mb: 3 }}>
              {message}
            </Typography>

            <Button
              variant="contained"
              className='btn-primary'
              component={Link}
              to="/dashboard"
            >
              Go to Dashboard
            </Button>
          </>
        )}

        {/* Error */}
        {!loading && status === 'error' && (
          <>
            <ErrorIcon
              sx={{ fontSize: 60, color: 'red', mb: 2 }}
            />

            <Typography variant="h6" sx={{ mb: 1 }}>
              Subscription Failed
            </Typography>

            <Typography variant="body2" sx={{ mb: 3 }}>
              {message}
            </Typography>

            <Button
              variant="contained"
              className='btn-primary'
              component={Link}
              to="/dashboard"
            >
              Go to Dashboard
            </Button>
          </>
        )}

      </Paper>
    </Box>
  );
};

export default PaypalSuccess;
