import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import facebookService from '../../services/facebookService';

// Async thunks
export const getFacebookAuthUrl = createAsyncThunk(
  'facebook/getAuthUrl',
  async (_, { rejectWithValue }) => {
    try {
      const response = await facebookService.getAuthUrl();
      return response.data.authUrl;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get Facebook auth URL');
    }
  }
);

export const handleFacebookCallback = createAsyncThunk(
  'facebook/handleCallback',
  async (code, { rejectWithValue }) => {
    try {
      const response = await facebookService.handleCallback(code);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to connect Facebook account');
    }
  }
);

export const getFacebookAccounts = createAsyncThunk(
  'facebook/getAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await facebookService.getAccounts();
      return response.data.facebookAccounts;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get Facebook accounts');
    }
  }
);

export const disconnectFacebookAccount = createAsyncThunk(
  'facebook/disconnectAccount',
  async (accountId, { rejectWithValue }) => {
    try {
      await facebookService.disconnectAccount(accountId);
      return accountId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to disconnect Facebook account');
    }
  }
);

export const syncAdAccounts = createAsyncThunk(
  'facebook/syncAdAccounts',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await facebookService.syncAdAccounts(accountId);
      return {
        accountId,
        adAccounts: response.data.adAccounts
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to sync ad accounts');
    }
  }
);

export const getCampaigns = createAsyncThunk(
  'facebook/getCampaigns',
  async (adAccountId, { rejectWithValue }) => {
    try {
      const response = await facebookService.getCampaigns(adAccountId);
      return {
        adAccountId,
        campaigns: response.data.campaigns
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get campaigns');
    }
  }
);

export const getInsights = createAsyncThunk(
  'facebook/getInsights',
  async ({ adAccountId, params }, { rejectWithValue }) => {
    try {
      const response = await facebookService.getInsights(adAccountId, params);
      return {
        adAccountId,
        insights: response.data.insights
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get insights');
    }
  }
);

export const searchAdLibrary = createAsyncThunk(
  'facebook/searchAdLibrary',
  async (params, { rejectWithValue }) => {
    try {
      const response = await facebookService.searchAdLibrary(params);
      return response.data.results;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search Ad Library');
    }
  }
);

export const getAdDetails = createAsyncThunk(
  'facebook/getAdDetails',
  async (adId, { rejectWithValue }) => {
    try {
      const response = await facebookService.getAdDetails(adId);
      return response.data.ad;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get ad details');
    }
  }
);

// Initial state
const initialState = {
  authUrl: null,
  accounts: [],
  selectedAccount: null,
  adAccounts: {},
  campaigns: {},
  insights: {},
  adLibraryResults: [],
  adDetails: null,
  loading: false,
  error: null
};

// Facebook slice
const facebookSlice = createSlice({
  name: 'facebook',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedAccount: (state, action) => {
      state.selectedAccount = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get auth URL
      .addCase(getFacebookAuthUrl.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFacebookAuthUrl.fulfilled, (state, action) => {
        state.loading = false;
        state.authUrl = action.payload;
      })
      .addCase(getFacebookAuthUrl.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle callback
      .addCase(handleFacebookCallback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleFacebookCallback.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = [...state.accounts, action.payload.facebookAccount];
        state.selectedAccount = action.payload.facebookAccount;
      })
      .addCase(handleFacebookCallback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get accounts
      .addCase(getFacebookAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFacebookAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload;
        if (action.payload.length > 0 && !state.selectedAccount) {
          state.selectedAccount = action.payload[0];
        }
      })
      .addCase(getFacebookAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Disconnect account
      .addCase(disconnectFacebookAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(disconnectFacebookAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = state.accounts.filter(account => account.id !== action.payload);
        if (state.selectedAccount && state.selectedAccount.id === action.payload) {
          state.selectedAccount = state.accounts.length > 0 ? state.accounts[0] : null;
        }
      })
      .addCase(disconnectFacebookAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Sync ad accounts
      .addCase(syncAdAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncAdAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.adAccounts[action.payload.accountId] = action.payload.adAccounts;
      })
      .addCase(syncAdAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get campaigns
      .addCase(getCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns[action.payload.adAccountId] = action.payload.campaigns;
      })
      .addCase(getCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get insights
      .addCase(getInsights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInsights.fulfilled, (state, action) => {
        state.loading = false;
        state.insights[action.payload.adAccountId] = action.payload.insights;
      })
      .addCase(getInsights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Search Ad Library
      .addCase(searchAdLibrary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchAdLibrary.fulfilled, (state, action) => {
        state.loading = false;
        state.adLibraryResults = action.payload;
      })
      .addCase(searchAdLibrary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get ad details
      .addCase(getAdDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.adDetails = action.payload;
      })
      .addCase(getAdDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setSelectedAccount } = facebookSlice.actions;

export default facebookSlice.reducer;
