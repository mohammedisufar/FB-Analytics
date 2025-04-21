import api from './api';

const authService = {
  // Login with email and password
  login: async (email, password) => {
    return await api.post('/auth/login', { email, password });
  },
  
  // Register a new user
  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },
  
  // Logout user
  logout: async () => {
    return await api.post('/auth/logout');
  },
  
  // Get current user profile
  getCurrentUser: async () => {
    return await api.get('/auth/me');
  },
  
  // Update user profile
  updateProfile: async (userData) => {
    return await api.put('/auth/me', userData);
  },
  
  // Request password reset
  requestPasswordReset: async (email) => {
    return await api.post('/auth/password/reset', { email });
  },
  
  // Complete password reset
  completePasswordReset: async (token, newPassword) => {
    return await api.put('/auth/password/reset', { token, newPassword });
  },
  
  // Connect Facebook account
  connectFacebook: async (code) => {
    return await api.post('/auth/facebook/connect', { code });
  },
  
  // Disconnect Facebook account
  disconnectFacebook: async () => {
    return await api.delete('/auth/facebook/disconnect');
  }
};

export default authService;
