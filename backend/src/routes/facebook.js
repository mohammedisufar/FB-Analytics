const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authenticate = require('../middleware/authenticate');
const { checkPermission } = require('../middleware/permissions');
const facebookApiService = require('../services/facebookApiService');

const prisma = new PrismaClient();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get Facebook login URL
router.get('/auth-url', (req, res) => {
  try {
    const appId = process.env.FACEBOOK_APP_ID;
    const redirectUri = process.env.FACEBOOK_REDIRECT_URI;
    const scope = 'email,ads_management,ads_read,business_management';
    
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code`;
    
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating Facebook auth URL:', error);
    res.status(500).json({ message: 'Failed to generate Facebook auth URL' });
  }
});

// Handle Facebook OAuth callback
router.post('/callback', async (req, res) => {
  try {
    const userId = req.userId;
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }
    
    // Exchange code for access token
    const tokenData = await facebookApiService.exchangeCodeForToken(
      code,
      process.env.FACEBOOK_REDIRECT_URI,
      process.env.FACEBOOK_APP_ID,
      process.env.FACEBOOK_APP_SECRET
    );
    
    // Get long-lived access token
    const longLivedTokenData = await facebookApiService.getLongLivedToken(
      tokenData.access_token,
      process.env.FACEBOOK_APP_ID,
      process.env.FACEBOOK_APP_SECRET
    );
    
    const accessToken = longLivedTokenData.access_token;
    const expiresIn = longLivedTokenData.expires_in || 60 * 24 * 60 * 60; // Default to 60 days
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
    
    // Get user profile
    const facebookUserData = await facebookApiService.getUserProfile(accessToken);
    
    // Store Facebook account in database
    const facebookAccount = await facebookApiService.storeFacebookAccount(
      userId,
      facebookUserData,
      accessToken,
      tokenExpiresAt
    );
    
    // Get ad accounts
    const adAccounts = await facebookApiService.getAdAccounts(accessToken);
    
    // Store ad accounts in database
    await facebookApiService.storeAdAccounts(facebookAccount.id, adAccounts);
    
    res.json({
      message: 'Facebook account connected successfully',
      facebookAccount: {
        id: facebookAccount.id,
        name: facebookAccount.name,
        email: facebookAccount.email,
        profilePictureUrl: facebookAccount.profilePictureUrl,
        adAccounts: adAccounts.data.map(account => ({
          id: account.id,
          name: account.name
        }))
      }
    });
  } catch (error) {
    console.error('Error handling Facebook callback:', error);
    res.status(500).json({ message: 'Failed to connect Facebook account' });
  }
});

// Get user's Facebook accounts
router.get('/accounts', async (req, res) => {
  try {
    const userId = req.userId;
    
    const facebookAccounts = await prisma.facebookAccount.findMany({
      where: { userId },
      include: {
        adAccounts: true
      }
    });
    
    res.json({ facebookAccounts });
  } catch (error) {
    console.error('Error fetching Facebook accounts:', error);
    res.status(500).json({ message: 'Failed to fetch Facebook accounts' });
  }
});

// Disconnect Facebook account
router.delete('/accounts/:id', checkPermission('users:write'), async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    
    // Check if account exists and belongs to user
    const facebookAccount = await prisma.facebookAccount.findFirst({
      where: {
        id,
        userId
      }
    });
    
    if (!facebookAccount) {
      return res.status(404).json({ message: 'Facebook account not found' });
    }
    
    // Delete Facebook account
    await prisma.facebookAccount.delete({
      where: { id }
    });
    
    res.json({ message: 'Facebook account disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting Facebook account:', error);
    res.status(500).json({ message: 'Failed to disconnect Facebook account' });
  }
});

// Sync ad accounts for a Facebook account
router.post('/accounts/:id/sync', checkPermission('adAccounts:write'), async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    
    // Check if account exists and belongs to user
    const facebookAccount = await prisma.facebookAccount.findFirst({
      where: {
        id,
        userId
      }
    });
    
    if (!facebookAccount) {
      return res.status(404).json({ message: 'Facebook account not found' });
    }
    
    // Get ad accounts from Facebook
    const adAccounts = await facebookApiService.getAdAccounts(facebookAccount.accessToken);
    
    // Store ad accounts in database
    const storedAdAccounts = await facebookApiService.storeAdAccounts(facebookAccount.id, adAccounts);
    
    res.json({
      message: 'Ad accounts synced successfully',
      adAccounts: storedAdAccounts
    });
  } catch (error) {
    console.error('Error syncing ad accounts:', error);
    res.status(500).json({ message: 'Failed to sync ad accounts' });
  }
});

// Get campaigns for an ad account
router.get('/ad-accounts/:id/campaigns', checkPermission('campaigns:read'), async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    
    // Check if ad account exists and belongs to user
    const adAccount = await prisma.adAccount.findFirst({
      where: {
        id,
        facebookAccount: {
          userId
        }
      },
      include: {
        facebookAccount: true
      }
    });
    
    if (!adAccount) {
      return res.status(404).json({ message: 'Ad account not found' });
    }
    
    // Get campaigns from Facebook
    const campaigns = await facebookApiService.getCampaigns(
      adAccount.facebookAdAccountId.replace('act_', ''),
      adAccount.facebookAccount.accessToken
    );
    
    res.json({ campaigns: campaigns.data });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ message: 'Failed to fetch campaigns' });
  }
});

// Get insights for an ad account
router.get('/ad-accounts/:id/insights', checkPermission('analytics:read'), async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { startDate, endDate, timeIncrement } = req.query;
    
    // Check if ad account exists and belongs to user
    const adAccount = await prisma.adAccount.findFirst({
      where: {
        id,
        facebookAccount: {
          userId
        }
      },
      include: {
        facebookAccount: true
      }
    });
    
    if (!adAccount) {
      return res.status(404).json({ message: 'Ad account not found' });
    }
    
    // Prepare params for insights API
    const params = {};
    
    if (startDate && endDate) {
      params.time_range = JSON.stringify({
        since: startDate,
        until: endDate
      });
    }
    
    if (timeIncrement) {
      params.time_increment = timeIncrement;
    }
    
    // Get insights from Facebook
    const insights = await facebookApiService.getAccountInsights(
      adAccount.facebookAdAccountId.replace('act_', ''),
      adAccount.facebookAccount.accessToken,
      params
    );
    
    res.json({ insights: insights.data });
  } catch (error) {
    console.error('Error fetching account insights:', error);
    res.status(500).json({ message: 'Failed to fetch account insights' });
  }
});

// Search Ad Library
router.get('/ad-library/search', checkPermission('adLibrary:read'), async (req, res) => {
  try {
    const userId = req.userId;
    const { query, adType, country, dateRange } = req.query;
    
    // Get user's Facebook account with valid token
    const facebookAccount = await prisma.facebookAccount.findFirst({
      where: {
        userId,
        accessToken: {
          not: null
        },
        tokenExpiresAt: {
          gt: new Date()
        }
      }
    });
    
    if (!facebookAccount) {
      return res.status(400).json({ message: 'No valid Facebook account found' });
    }
    
    // Prepare params for Ad Library API
    const params = {
      access_token: facebookAccount.accessToken
    };
    
    if (query) {
      params.search_terms = query;
    }
    
    if (adType) {
      params.ad_type = adType;
    }
    
    if (country) {
      params.ad_reached_countries = country;
    }
    
    if (dateRange) {
      params.ad_delivery_date_min = dateRange.split(',')[0];
      params.ad_delivery_date_max = dateRange.split(',')[1];
    }
    
    // Search Ad Library
    const searchResults = await facebookApiService.searchAdLibrary(params);
    
    res.json({ results: searchResults.data });
  } catch (error) {
    console.error('Error searching Ad Library:', error);
    res.status(500).json({ message: 'Failed to search Ad Library' });
  }
});

// Get Ad Library details for a specific ad
router.get('/ad-library/ads/:id', checkPermission('adLibrary:read'), async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    
    // Get user's Facebook account with valid token
    const facebookAccount = await prisma.facebookAccount.findFirst({
      where: {
        userId,
        accessToken: {
          not: null
        },
        tokenExpiresAt: {
          gt: new Date()
        }
      }
    });
    
    if (!facebookAccount) {
      return res.status(400).json({ message: 'No valid Facebook account found' });
    }
    
    // Get ad details from Facebook
    const adDetails = await facebookApiService.getAdLibraryDetails(id, facebookAccount.accessToken);
    
    res.json({ ad: adDetails });
  } catch (error) {
    console.error('Error fetching Ad Library details:', error);
    res.status(500).json({ message: 'Failed to fetch Ad Library details' });
  }
});

module.exports = router;
