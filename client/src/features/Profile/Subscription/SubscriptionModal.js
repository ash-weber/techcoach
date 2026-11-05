import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Divider,
  Button
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

import GooglePayButton from './GooglePayButton';
import ApplePayButton from './ApplePayButton';

const SubscriptionModal = ({ open, onClose, onRecurringRedirect }) => {

  const handlePaymentSuccess = () => {
    onClose();
    window.location.reload();
  };

  const handlePaymentError = (err) => {
    console.error('Payment failed:', err);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>

      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        Choose Payment Method

        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          pb: 3
        }}
      >

        <Typography variant="body2" color="text.secondary">
          Choose automated recurring subscription or a 1-month pass.
        </Typography>

        <Button
          variant="contained"
          fullWidth
          onClick={onRecurringRedirect}
          sx={{
            backgroundColor: '#0070BA',
            '&:hover': { backgroundColor: '#005ea6' },
            py: 1.2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          PayPal Auto-Renewal
        </Button>

        <Divider>
          <Typography variant="caption" color="text.secondary">
            OR 1-MONTH PASS
          </Typography>
        </Divider>


        <GooglePayButton
          amount="1.00"
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />

        <ApplePayButton
          amount="1.00"
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />

      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;