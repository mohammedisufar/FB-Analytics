import api from './api';

const facebookService = {
  // Get Facebook login URL
  getAuthUrl: async () => {
    return await api.get('/facebook/auth-url');
  },
  
  // Handle Facebook OAuth callback
  handleCallback: async (code) => {
    return await api.post('/facebook/callback', { code });
  },
  
  // Get user's Facebook accounts
  getAccounts: async () => {
    return await api.get('/facebook/accounts');
  },
  
  // Disconnect Facebook account
  disconnectAccount: async (accountId) => {
    return await api.delete(`/facebook/accounts/${accountId}`);
  },
  
  // Sync ad accounts for a Facebook account
  syncAdAccounts: async (accountId) => {
    return await api.post(`/facebook/accounts/${accountId}/sync`);
  },
  
  // Get campaigns for an ad account
  getCampaigns: async (adAccountId) => {
    return await api.get(`/facebook/ad-accounts/${adAccountId}/campaigns`);
  },
  
  // Get insights for an ad account
  getInsights: async (adAccountId, params) => {
    return await api.get(`/facebook/ad-accounts/${adAccountId}/insights`, { params });
  },
  
  // Search Ad Library
  searchAdLibrary: async (params) => {
    return await api.get('/facebook/ad-library/search', { params });
  },
  
  // Get Ad Library details for a specific ad
  getAdDetails: async (adId) => {
    return await api.get(`/facebook/ad-library/ads/${adId}`);
  }
};

export default facebookService;
