import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const getSubscriptionPlans = createAsyncThunk(
  'subscription/getPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/payments/plans');
      return response.data.plans;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subscription plans');
    }
  }
);

export const getCurrentSubscription = createAsyncThunk(
  'subscription/getCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/payments/subscription');
      return response.data.subscription;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch current subscription');
    }
  }
);

export const createCheckoutSession = createAsyncThunk(
  'subscription/createCheckout',
  async (planId, { rejectWithValue }) => {
    try {
      const response = await api.post('/payments/create-checkout-session', { planId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create checkout session');
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  'subscription/cancel',
  async (subscriptionId, { rejectWithValue }) => {
    try {
      const response = await api.post('/payments/cancel-subscription', { subscriptionId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel subscription');
    }
  }
);

export const getBillingHistory = createAsyncThunk(
  'subscription/getBillingHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/payments/billing-history');
      return response.data.invoices;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch billing history');
    }
  }
);

export const updatePaymentMethod = createAsyncThunk(
  'subscription/updatePaymentMethod',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/payments/update-payment-method');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update payment method');
    }
  }
);

// Initial state
const initialState = {
  plans: [],
  currentSubscription: null,
  billingHistory: [],
  checkoutSession: null,
  setupIntent: null,
  loading: false,
  error: null
};

// Subscription slice
const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCheckoutSession: (state) => {
      state.checkoutSession = null;
    },
    clearSetupIntent: (state) => {
      state.setupIntent = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get subscription plans
      .addCase(getSubscriptionPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubscriptionPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload;
      })
      .addCase(getSubscriptionPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get current subscription
      .addCase(getCurrentSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubscription = action.payload;
      })
      .addCase(getCurrentSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create checkout session
      .addCase(createCheckoutSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCheckoutSession.fulfilled, (state, action) => {
        state.loading = false;
        state.checkoutSession = action.payload;
      })
      .addCase(createCheckoutSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Cancel subscription
      .addCase(cancelSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state) => {
        state.loading = false;
        // We'll fetch the updated subscription separately
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get billing history
      .addCase(getBillingHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBillingHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.billingHistory = action.payload;
      })
      .addCase(getBillingHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update payment method
      .addCase(updatePaymentMethod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaymentMethod.fulfilled, (state, action) => {
        state.loading = false;
        state.setupIntent = action.payload;
      })
      .addCase(updatePaymentMethod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearCheckoutSession, clearSetupIntent } = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
