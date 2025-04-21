const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Facebook API integration service
class FacebookApiService {
  constructor() {
    this.baseUrl = 'https://graph.facebook.com/v18.0';
    this.adLibraryUrl = 'https://www.facebook.com/ads/library/api';
  }

  // Get Facebook user profile with access token
  async getUserProfile(accessToken) {
    try {
      const response = await axios.get(`${this.baseUrl}/me`, {
        params: {
          fields: 'id,name,email,picture',
          access_token: accessToken
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching Facebook user profile:', error.response?.data || error.message);
      throw new Error('Failed to fetch Facebook user profile');
    }
  }

  // Get user's ad accounts
  async getAdAccounts(accessToken) {
    try {
      const response = await axios.get(`${this.baseUrl}/me/adaccounts`, {
        params: {
          fields: 'id,name,account_id,account_status,business_name,currency,timezone_name',
          access_token: accessToken
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching ad accounts:', error.response?.data || error.message);
      throw new Error('Failed to fetch ad accounts');
    }
  }

  // Get campaigns for an ad account
  async getCampaigns(adAccountId, accessToken) {
    try {
      const response = await axios.get(`${this.baseUrl}/act_${adAccountId}/campaigns`, {
        params: {
          fields: 'id,name,objective,status,buying_type,special_ad_categories,spend_cap,daily_budget,lifetime_budget,start_time,end_time,created_time,updated_time',
          access_token: accessToken
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching campaigns:', error.response?.data || error.message);
      throw new Error('Failed to fetch campaigns');
    }
  }

  // Get ad sets for a campaign
  async getAdSets(campaignId, accessToken) {
    try {
      const response = await axios.get(`${this.baseUrl}/${campaignId}/adsets`, {
        params: {
          fields: 'id,name,status,targeting,optimization_goal,billing_event,bid_strategy,bid_amount,daily_budget,lifetime_budget,start_time,end_time',
          access_token: accessToken
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching ad sets:', error.response?.data || error.message);
      throw new Error('Failed to fetch ad sets');
    }
  }

  // Get ads for an ad set
  async getAds(adSetId, accessToken) {
    try {
      const response = await axios.get(`${this.baseUrl}/${adSetId}/ads`, {
        params: {
          fields: 'id,name,status,creative,tracking_specs,created_time,updated_time',
          access_token: accessToken
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching ads:', error.response?.data || error.message);
      throw new Error('Failed to fetch ads');
    }
  }

  // Get insights for an ad account
  async getAccountInsights(adAccountId, accessToken, params = {}) {
    try {
      const defaultParams = {
        time_range: JSON.stringify({
          since: '2023-01-01',
          until: '2023-12-31'
        }),
        time_increment: 1,
        fields: 'impressions,clicks,spend,cpc,ctr,reach,frequency,actions',
        access_token: accessToken
      };
      
      const queryParams = { ...defaultParams, ...params };
      
      const response = await axios.get(`${this.baseUrl}/act_${adAccountId}/insights`, {
        params: queryParams
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching account insights:', error.response?.data || error.message);
      throw new Error('Failed to fetch account insights');
    }
  }

  // Get insights for a campaign
  async getCampaignInsights(campaignId, accessToken, params = {}) {
    try {
      const defaultParams = {
        time_range: JSON.stringify({
          since: '2023-01-01',
          until: '2023-12-31'
        }),
        time_increment: 1,
        fields: 'impressions,clicks,spend,cpc,ctr,reach,frequency,actions',
        access_token: accessToken
      };
      
      const queryParams = { ...defaultParams, ...params };
      
      const response = await axios.get(`${this.baseUrl}/${campaignId}/insights`, {
        params: queryParams
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching campaign insights:', error.response?.data || error.message);
      throw new Error('Failed to fetch campaign insights');
    }
  }

  // Get demographic breakdown for a campaign
  async getDemographicBreakdown(campaignId, accessToken) {
    try {
      const response = await axios.get(`${this.baseUrl}/${campaignId}/insights`, {
        params: {
          fields: 'impressions,clicks,spend',
          breakdowns: 'age,gender',
          access_token: accessToken
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching demographic breakdown:', error.response?.data || error.message);
      throw new Error('Failed to fetch demographic breakdown');
    }
  }

  // Get placement breakdown for a campaign
  async getPlacementBreakdown(campaignId, accessToken) {
    try {
      const response = await axios.get(`${this.baseUrl}/${campaignId}/insights`, {
        params: {
          fields: 'impressions,clicks,spend,ctr',
          breakdowns: 'publisher_platform,platform_position',
          access_token: accessToken
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching placement breakdown:', error.response?.data || error.message);
      throw new Error('Failed to fetch placement breakdown');
    }
  }

  // Get device breakdown for a campaign
  async getDeviceBreakdown(campaignId, accessToken) {
    try {
      const response = await axios.get(`${this.baseUrl}/${campaignId}/insights`, {
        params: {
          fields: 'impressions,clicks,spend,ctr',
          breakdowns: 'device_platform,impression_device',
          access_token: accessToken
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching device breakdown:', error.response?.data || error.message);
      throw new Error('Failed to fetch device breakdown');
    }
  }

  // Search Ad Library
  async searchAdLibrary(params = {}) {
    try {
      const defaultParams = {
        ad_type: 'POLITICAL_AND_ISSUE_ADS',
        ad_reached_countries: 'US',
        fields: 'id,ad_creation_time,ad_creative_bodies,ad_creative_link_captions,ad_creative_link_descriptions,ad_creative_link_titles,ad_delivery_start_time,ad_delivery_stop_time,ad_snapshot_url,demographic_distribution,funding_entity,impressions,page_id,page_name,region_distribution,spend',
        access_token: params.access_token
      };
      
      const queryParams = { ...defaultParams, ...params };
      
      const response = await axios.get(`${this.adLibraryUrl}/search`, {
        params: queryParams
      });
      
      return response.data;
    } catch (error) {
      console.error('Error searching Ad Library:', error.response?.data || error.message);
      throw new Error('Failed to search Ad Library');
    }
  }

  // Get Ad Library details for a specific ad
  async getAdLibraryDetails(adId, accessToken) {
    try {
      const response = await axios.get(`${this.baseUrl}/${adId}`, {
        params: {
          fields: 'id,creative,effective_status,insights{impressions,clicks,spend,ctr},targeting',
          access_token: accessToken
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching Ad Library details:', error.response?.data || error.message);
      throw new Error('Failed to fetch Ad Library details');
    }
  }

  // Create a campaign
  async createCampaign(adAccountId, campaignData, accessToken) {
    try {
      const response = await axios.post(`${this.baseUrl}/act_${adAccountId}/campaigns`, {
        ...campaignData,
        access_token: accessToken
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating campaign:', error.response?.data || error.message);
      throw new Error('Failed to create campaign');
    }
  }

  // Update a campaign
  async updateCampaign(campaignId, campaignData, accessToken) {
    try {
      const response = await axios.post(`${this.baseUrl}/${campaignId}`, {
        ...campaignData,
        access_token: accessToken
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating campaign:', error.response?.data || error.message);
      throw new Error('Failed to update campaign');
    }
  }

  // Delete a campaign
  async deleteCampaign(campaignId, accessToken) {
    try {
      const response = await axios.delete(`${this.baseUrl}/${campaignId}`, {
        params: {
          access_token: accessToken
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error deleting campaign:', error.response?.data || error.message);
      throw new Error('Failed to delete campaign');
    }
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code, redirectUri, appId, appSecret) {
    try {
      const response = await axios.get(`${this.baseUrl}/oauth/access_token`, {
        params: {
          client_id: appId,
          client_secret: appSecret,
          redirect_uri: redirectUri,
          code: code
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error exchanging code for token:', error.response?.data || error.message);
      throw new Error('Failed to exchange code for token');
    }
  }

  // Get long-lived access token
  async getLongLivedToken(shortLivedToken, appId, appSecret) {
    try {
      const response = await axios.get(`${this.baseUrl}/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: appId,
          client_secret: appSecret,
          fb_exchange_token: shortLivedToken
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting long-lived token:', error.response?.data || error.message);
      throw new Error('Failed to get long-lived token');
    }
  }

  // Store Facebook account in database
  async storeFacebookAccount(userId, facebookData, accessToken, tokenExpiresAt) {
    try {
      // Check if account already exists
      let facebookAccount = await prisma.facebookAccount.findFirst({
        where: {
          userId,
          facebookUserId: facebookData.id
        }
      });
      
      if (facebookAccount) {
        // Update existing account
        facebookAccount = await prisma.facebookAccount.update({
          where: {
            id: facebookAccount.id
          },
          data: {
            accessToken,
            tokenExpiresAt,
            name: facebookData.name,
            email: facebookData.email,
            profilePictureUrl: facebookData.picture?.data?.url
          }
        });
      } else {
        // Create new account
        facebookAccount = await prisma.facebookAccount.create({
          data: {
            userId,
            facebookUserId: facebookData.id,
            accessToken,
            tokenExpiresAt,
            name: facebookData.name,
            email: facebookData.email,
            profilePictureUrl: facebookData.picture?.data?.url
          }
        });
      }
      
      return facebookAccount;
    } catch (error) {
      console.error('Error storing Facebook account:', error);
      throw new Error('Failed to store Facebook account');
    }
  }

  // Store ad accounts in database
  async storeAdAccounts(facebookAccountId, adAccounts) {
    try {
      const storedAdAccounts = [];
      
      for (const adAccount of adAccounts.data) {
        // Check if ad account already exists
        let existingAdAccount = await prisma.adAccount.findFirst({
          where: {
            facebookAccountId,
            facebookAdAccountId: adAccount.id
          }
        });
        
        if (existingAdAccount) {
          // Update existing ad account
          existingAdAccount = await prisma.adAccount.update({
            where: {
              id: existingAdAccount.id
            },
            data: {
              name: adAccount.name,
              currency: adAccount.currency,
              timezone: adAccount.timezone_name,
              businessName: adAccount.business_name,
              businessId: adAccount.business_id
            }
          });
          
          storedAdAccounts.push(existingAdAccount);
        } else {
          // Create new ad account
          const newAdAccount = await prisma.adAccount.create({
            data: {
              facebookAccountId,
              facebookAdAccountId: adAccount.id,
              name: adAccount.name,
              currency: adAccount.currency,
              timezone: adAccount.timezone_name,
              businessName: adAccount.business_name,
              businessId: adAccount.business_id
            }
          });
          
          storedAdAccounts.push(newAdAccount);
        }
      }
      
      return storedAdAccounts;
    } catch (error) {
      console.error('Error storing ad accounts:', error);
      throw new Error('Failed to store ad accounts');
    }
  }
}

module.exports = new FacebookApiService();
