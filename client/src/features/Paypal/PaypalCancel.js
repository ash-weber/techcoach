import { Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PaypalCancel = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        gap: 2
      }}
    >
      <Typography variant="h4" color="error">
        Payment Cancelled
      </Typography>

      <Typography variant="body1">
        You cancelled the PayPal subscription process.
      </Typography>

      <Typography variant="body2" color="text.secondary">
        No money was charged. You can subscribe anytime to continue adding decisions.
      </Typography>

      <Button
        variant="contained"
        sx={{ backgroundColor: '#526D82' }}
        onClick={() => navigate('/dashboard')}
      >
        Go Back to Dashboard
      </Button>
    </Box>
  );
};

export default PaypalCancel;
