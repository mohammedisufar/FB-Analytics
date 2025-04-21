import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Grid, 
  Divider,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import { loadStripe } from '@stripe/stripe-js';
import Layout from '../components/Layout';
import withAuth from '../utils/withAuth';
import { getSubscriptionPlans, getCurrentSubscription } from '../redux/slices/subscriptionSlice';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const PricingPage = () => {
  const dispatch = useDispatch();
  const { 
    plans, 
    currentSubscription, 
    loading, 
    error 
  } = useSelector((state) => state.subscription);
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  
  // Fetch subscription plans and current subscription on component mount
  useEffect(() => {
    dispatch(getSubscriptionPlans());
    dispatch(getCurrentSubscription());
  }, [dispatch]);
  
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setConfirmDialogOpen(true);
  };
  
  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };
  
  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false);
  };
  
  const handleSubscribe = async () => {
    try {
      // Create checkout session
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
        }),
      });
      
      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
    
    handleCloseConfirmDialog();
  };
  
  const handleCancelSubscription = async () => {
    try {
      // Cancel subscription
      await fetch('/api/payments/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: currentSubscription.id,
        }),
      });
      
      // Refresh current subscription
      dispatch(getCurrentSubscription());
    } catch (error) {
      console.error('Error canceling subscription:', error);
    }
    
    handleCloseCancelDialog();
  };
  
  const isCurrentPlan = (plan) => {
    return currentSubscription && currentSubscription.plan.id === plan.id;
  };
  
  const isFreePlan = (plan) => {
    return plan.price === 0;
  };
  
  const getFeatureList = (plan) => {
    switch (plan.name) {
      case 'Free':
        return [
          { feature: 'Connect 1 Facebook Ad Account', included: true },
          { feature: 'Basic Analytics Dashboard', included: true },
          { feature: 'Campaign Management', included: true },
          { feature: 'Ad Library Search (Limited)', included: true },
          { feature: 'Email Support', included: false },
          { feature: 'Advanced Analytics', included: false },
          { feature: 'Custom Reports', included: false },
          { feature: 'Multiple Users', included: false }
        ];
      case 'Pro':
        return [
          { feature: 'Connect 5 Facebook Ad Accounts', included: true },
          { feature: 'Advanced Analytics Dashboard', included: true },
          { feature: 'Campaign Management', included: true },
          { feature: 'Ad Library Search (Unlimited)', included: true },
          { feature: 'Email Support', included: true },
          { feature: 'Custom Reports', included: true },
          { feature: 'Multiple Users (Up to 3)', included: true },
          { feature: 'API Access', included: false }
        ];
      case 'Enterprise':
        return [
          { feature: 'Connect Unlimited Facebook Ad Accounts', included: true },
          { feature: 'Advanced Analytics Dashboard', included: true },
          { feature: 'Campaign Management', included: true },
          { feature: 'Ad Library Search (Unlimited)', included: true },
          { feature: 'Priority Support', included: true },
          { feature: 'Custom Reports', included: true },
          { feature: 'Multiple Users (Unlimited)', included: true },
          { feature: 'API Access', included: true },
          { feature: 'White Labeling', included: true },
          { feature: 'Dedicated Account Manager', included: true }
        ];
      default:
        return [];
    }
  };
  
  return (
    <Layout>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Subscription Plans
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {currentSubscription && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Current Subscription
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body1">
                    <strong>Plan:</strong> {currentSubscription.plan.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body1">
                    <strong>Status:</strong> {' '}
                    <Chip 
                      label={currentSubscription.status} 
                      color={currentSubscription.status === 'ACTIVE' ? 'success' : 'error'} 
                      size="small" 
                    />
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body1">
                    <strong>Price:</strong> ${currentSubscription.plan.price}/{currentSubscription.plan.billingInterval.toLowerCase()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      sx={{ mr: 2 }}
                      href="/billing"
                    >
                      Billing History
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      sx={{ mr: 2 }}
                      href="/update-payment"
                    >
                      Update Payment Method
                    </Button>
                    {currentSubscription.status === 'ACTIVE' && (
                      <Button 
                        variant="outlined" 
                        color="error"
                        onClick={() => setCancelDialogOpen(true)}
                      >
                        Cancel Subscription
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {plans.map((plan) => (
              <Grid item xs={12} md={4} key={plan.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    border: isCurrentPlan(plan) ? '2px solid #4caf50' : 'none'
                  }}
                >
                  {isCurrentPlan(plan) && (
                    <Box sx={{ bgcolor: 'success.main', color: 'white', py: 1, textAlign: 'center' }}>
                      <Typography variant="subtitle2">
                        Current Plan
                      </Typography>
                    </Box>
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Typography variant="h5" component="div" gutterBottom>
                        {plan.name}
                      </Typography>
                      <Typography variant="h3" component="div" gutterBottom>
                        ${plan.price}
                        <Typography variant="body1" component="span" color="text.secondary">
                          /{plan.billingInterval.toLowerCase()}
                        </Typography>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {plan.description}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <List dense>
                      {getFeatureList(plan).map((item, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            {item.included ? (
                              <CheckIcon color="success" />
                            ) : (
                              <CloseIcon color="error" />
                            )}
                          </ListItemIcon>
                          <ListItemText primary={item.feature} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                  <Box sx={{ p: 2 }}>
                    <Button 
                      variant={isCurrentPlan(plan) ? "outlined" : "contained"} 
                      color="primary"
                      fullWidth
                      disabled={isCurrentPlan(plan)}
                      onClick={() => handleSelectPlan(plan)}
                    >
                      {isFreePlan(plan) ? 'Select Free Plan' : 'Subscribe'}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      {/* Confirm Subscription Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Subscription</DialogTitle>
        <DialogContent>
          {selectedPlan && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="h6" gutterBottom>
                {selectedPlan.name} Plan - ${selectedPlan.price}/{selectedPlan.billingInterval.toLowerCase()}
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedPlan.description}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                By clicking "Subscribe", you agree to our Terms of Service and authorize us to charge your payment method on a recurring basis. You can cancel anytime.
              </Typography>
              {isFreePlan(selectedPlan) ? (
                <Typography variant="body2" color="text.secondary">
                  You are selecting the Free plan. No payment will be required.
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  You will be redirected to Stripe to complete your payment.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSubscribe}
          >
            {isFreePlan(selectedPlan) ? 'Select Free Plan' : 'Subscribe'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Cancel Subscription Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCloseCancelDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cancel Subscription</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body1" paragraph>
              Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              If you change your mind, you can resubscribe at any time.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog}>Keep Subscription</Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleCancelSubscription}
          >
            Cancel Subscription
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default withAuth(PricingPage);
