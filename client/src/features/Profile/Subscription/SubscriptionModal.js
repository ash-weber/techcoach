import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Divider,
  Button,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { toast } from 'react-toastify';

const SubscriptionModal = ({ open, onClose, onRecurringRedirect }) => {
  const [loading, setLoading] = useState(false);
  const [applePayAvailable, setApplePayAvailable] = useState(false);
  const googlePayContainerRef = useRef(null);
  const applePayContainerRef = useRef(null);

  const handleCapture = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/subscription/capture-order`,
        { orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('1-Month access activated successfully!');
      onClose();
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error('Payment capture failed.');
    }
  };


  useEffect(() => {
    if (!open || !window.google || !window.paypal?.Googlepay) return;

    const initGooglePay = async () => {
      try {
        const googlepay = window.paypal.Googlepay();
        const { allowedPaymentMethods } = await googlepay.config();

        

        const paymentsClient = new window.google.payments.api.PaymentsClient({
          environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'TEST'
        });

        const isReadyToPay = await paymentsClient.isReadyToPay({
          apiVersion: 2,
          apiVersionMinor: 0,
          allowedPaymentMethods
        });

        if (isReadyToPay.result && googlePayContainerRef.current) {
          googlePayContainerRef.current.innerHTML = '';
          const button = paymentsClient.createButton({
            onClick: async () => {
              try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const res = await axios.post(
                  `${process.env.REACT_APP_API_URL}/api/subscription/create-order`,
                  {},
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                const orderId = res.data.orderId;

                const paymentDataRequest = Object.assign({}, await googlepay.config(), {
                  transactionInfo: {
                    totalPriceStatus: 'FINAL',
                    totalPrice: '1.00',
                    currencyCode: 'USD',
                    countryCode: 'US'
                  }
                });

                const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
                
                const confirmResponse = await googlepay.confirmOrder({
                  orderId,
                  paymentMethodData: paymentData.paymentMethodData
                });

                if (confirmResponse.status === 'APPROVED') {
                  await handleCapture(orderId);
                }
              } catch (err) {
                console.error(err);
                toast.error('Google Pay checkout cancelled or failed.');
              } finally {
                setLoading(false);
              }
            },
            buttonColor: 'black',
            buttonType: 'pay',
            buttonSizeMode: 'fill'
          });

          googlePayContainerRef.current.appendChild(button);
        }
      } catch (err) {
        console.error('Error mounting Google Pay:', err);
      }
    };

    initGooglePay();
  }, [open]);

  useEffect(() => {
    if (window.ApplePaySession && window.ApplePaySession.canMakePayments()) {
      setApplePayAvailable(true);
    }
  }, []);

  const handleApplePayClick = async () => {
    try {
      if (!window.paypal?.Applepay) {
        toast.error('Apple Pay SDK not ready');
        return;
      }
      setLoading(true);
      const applepay = window.paypal.Applepay();
      const applePayConfig = await applepay.config();

      const paymentRequest = {
        countryCode: applePayConfig.countryCode,
        currencyCode: 'USD',
        merchantCapabilities: applePayConfig.merchantCapabilities,
        supportedNetworks: applePayConfig.supportedNetworks,
        total: {
          label: '1-Month Decision Coach Access',
          amount: '1.00',
          type: 'final'
        }
      };

      const session = new window.ApplePaySession(4, paymentRequest);

      session.onvalidatemerchant = async (event) => {
        const validatedMerchant = await applepay.validateMerchant({
          validationUrl: event.validationURL
        });
        session.completeMerchantValidation(validatedMerchant);
      };

      session.onpaymentauthorized = async (event) => {
        try {
          const token = localStorage.getItem('token');
          const orderRes = await axios.post(
            `${process.env.REACT_APP_API_URL}/api/subscription/create-order`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const orderId = orderRes.data.orderId;

          await applepay.confirmOrder({
            orderId: orderId,
            token: event.payment.token,
            billingContact: event.payment.billingContact
          });

          await handleCapture(orderId);
          session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
        } catch (e) {
          session.completePayment(window.ApplePaySession.STATUS_FAILURE);
        }
      };

      session.begin();
    } catch (err) {
      console.error(err);
      toast.error('Could not initiate Apple Pay');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Choose Payment Method
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Choose automated recurring subscription or a 1-month pass.
        </Typography>

        {loading && (
          <Box display="flex" justifyContent="center" py={2}>
            <CircularProgress size={28} />
          </Box>
        )}

        <Button
          variant="contained"
          fullWidth
          sx={{ backgroundColor: '#0070BA', '&:hover': { backgroundColor: '#005ea6' }, py: 1.2, textTransform: 'none', fontWeight: 600 }}
          onClick={onRecurringRedirect}
          disabled={loading}
        >
          PayPal Auto-Renewal ($1 / Month)
        </Button>

        <Divider>
          <Typography variant="caption" color="text.secondary">OR 1-MONTH PASS</Typography>
        </Divider>

        <Box 
          ref={googlePayContainerRef} 
          sx={{ width: '100%', height: 42, display: 'flex', justifyContent: 'center' , color:'black'}} 
        />

        {applePayAvailable ? (
          <Button
            variant="contained"
            fullWidth
            onClick={handleApplePayClick}
            disabled={loading}
            sx={{
              backgroundColor: '#000',
              color: '#fff',
              '&:hover': { backgroundColor: '#222' },
              py: 1.2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
             Pay ($1.00 / 1 Month)
          </Button>
        ) : (
          <Typography variant="caption" align="center" color="text.secondary">
            (Apple Pay requires Safari on iOS or macOS)
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;