const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authenticate = require('../middleware/authenticate');

const prisma = new PrismaClient();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get insights with various filters
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const { 
      adAccountId, 
      campaignId, 
      adSetId, 
      adId, 
      startDate, 
      endDate, 
      objectType 
    } = req.query;
    
    // Build query
    const whereClause = {};
    
    // Parse dates
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
    const end = endDate ? new Date(endDate) : new Date();
    
    whereClause.date = {
      gte: start,
      lte: end
    };
    
    // Filter by object type
    if (objectType) {
      whereClause.objectType = objectType.toUpperCase();
    }
    
    // Filter by specific object
    if (adAccountId) {
      // Check if ad account belongs to user
      const adAccount = await prisma.adAccount.findFirst({
        where: {
          id: adAccountId,
          facebookAccount: {
            userId
          }
        }
      });
      
      if (!adAccount) {
        return res.status(404).json({ message: 'Ad account not found' });
      }
      
      whereClause.adAccountId = adAccountId;
    } else {
      // Get all ad accounts for user
      const adAccounts = await prisma.adAccount.findMany({
        where: {
          facebookAccount: {
            userId
          }
        },
        select: {
          id: true
        }
      });
      
      whereClause.adAccountId = {
        in: adAccounts.map(account => account.id)
      };
    }
    
    // Filter by campaign, ad set, or ad
    if (campaignId) {
      whereClause.objectId = campaignId;
      whereClause.objectType = 'CAMPAIGN';
    } else if (adSetId) {
      whereClause.objectId = adSetId;
      whereClause.objectType = 'ADSET';
    } else if (adId) {
      whereClause.objectId = adId;
      whereClause.objectType = 'AD';
    }
    
    // Get insights
    const insights = await prisma.insight.findMany({
      where: whereClause,
      orderBy: { date: 'asc' }
    });
    
    res.json({ insights });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ message: 'Server error while fetching insights' });
  }
});

// Get performance metrics
router.get('/performance', async (req, res) => {
  try {
    const userId = req.userId;
    const { 
      adAccountId, 
      startDate, 
      endDate, 
      breakdown 
    } = req.query;
    
    // Check if ad account belongs to user
    if (adAccountId) {
      const adAccount = await prisma.adAccount.findFirst({
        where: {
          id: adAccountId,
          facebookAccount: {
            userId
          }
        }
      });
      
      if (!adAccount) {
        return res.status(404).json({ message: 'Ad account not found' });
      }
    }
    
    // Parse dates
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
    const end = endDate ? new Date(endDate) : new Date();
    
    // In a real implementation, we would query the database for aggregated metrics
    // For now, we'll return sample data
    
    // Sample performance data
    const performanceData = {
      impressions: 1245789,
      clicks: 45239,
      ctr: 3.63,
      spend: 12458.92,
      cpc: 0.28,
      conversions: 1892,
      costPerConversion: 6.58,
      roas: 3.2
    };
    
    res.json({ performance: performanceData });
  } catch (error) {
    console.error('Get performance metrics error:', error);
    res.status(500).json({ message: 'Server error while fetching performance metrics' });
  }
});

// Get demographic breakdowns
router.get('/demographics', async (req, res) => {
  try {
    const userId = req.userId;
    const { 
      adAccountId, 
      campaignId, 
      startDate, 
      endDate 
    } = req.query;
    
    // Check if ad account belongs to user
    if (adAccountId) {
      const adAccount = await prisma.adAccount.findFirst({
        where: {
          id: adAccountId,
          facebookAccount: {
            userId
          }
        }
      });
      
      if (!adAccount) {
        return res.status(404).json({ message: 'Ad account not found' });
      }
    }
    
    // Check if campaign belongs to user
    if (campaignId) {
      const campaign = await prisma.campaign.findFirst({
        where: {
          id: campaignId,
          adAccount: {
            facebookAccount: {
              userId
            }
          }
        }
      });
      
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }
    }
    
    // Parse dates
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
    const end = endDate ? new Date(endDate) : new Date();
    
    // In a real implementation, we would query the database for demographic data
    // For now, we'll return sample data
    
    // Sample demographic data
    const demographicData = {
      ageGender: [
        { age: '18-24', gender: 'male', impressions: 125000, clicks: 4500, spend: 1200 },
        { age: '18-24', gender: 'female', impressions: 145000, clicks: 5200, spend: 1350 },
        { age: '25-34', gender: 'male', impressions: 210000, clicks: 7800, spend: 2100 },
        { age: '25-34', gender: 'female', impressions: 230000, clicks: 8500, spend: 2300 },
        { age: '35-44', gender: 'male', impressions: 180000, clicks: 6500, spend: 1800 },
        { age: '35-44', gender: 'female', impressions: 190000, clicks: 7000, spend: 1900 },
        { age: '45-54', gender: 'male', impressions: 85000, clicks: 3000, spend: 850 },
        { age: '45-54', gender: 'female', impressions: 90000, clicks: 3200, spend: 900 },
        { age: '55+', gender: 'male', impressions: 45000, clicks: 1500, spend: 450 },
        { age: '55+', gender: 'female', impressions: 50000, clicks: 1700, spend: 500 }
      ],
      regions: [
        { region: 'California', impressions: 250000, clicks: 9000, spend: 2500 },
        { region: 'New York', impressions: 200000, clicks: 7200, spend: 2000 },
        { region: 'Texas', impressions: 180000, clicks: 6500, spend: 1800 },
        { region: 'Florida', impressions: 150000, clicks: 5400, spend: 1500 },
        { region: 'Illinois', impressions: 120000, clicks: 4300, spend: 1200 }
      ]
    };
    
    res.json({ demographics: demographicData });
  } catch (error) {
    console.error('Get demographic breakdowns error:', error);
    res.status(500).json({ message: 'Server error while fetching demographic breakdowns' });
  }
});

// Get placement breakdowns
router.get('/placements', async (req, res) => {
  try {
    const userId = req.userId;
    const { 
      adAccountId, 
      campaignId, 
      startDate, 
      endDate 
    } = req.query;
    
    // Check permissions similar to demographics endpoint
    
    // Sample placement data
    const placementData = [
      { placement: 'Facebook Feed', impressions: 500000, clicks: 18000, spend: 5000, ctr: 3.6 },
      { placement: 'Instagram Feed', impressions: 400000, clicks: 16000, spend: 4000, ctr: 4.0 },
      { placement: 'Facebook Stories', impressions: 150000, clicks: 4500, spend: 1500, ctr: 3.0 },
      { placement: 'Instagram Stories', impressions: 180000, clicks: 5400, spend: 1800, ctr: 3.0 },
      { placement: 'Facebook Marketplace', impressions: 80000, clicks: 2400, spend: 800, ctr: 3.0 },
      { placement: 'Facebook Search', impressions: 60000, clicks: 2100, spend: 600, ctr: 3.5 }
    ];
    
    res.json({ placements: placementData });
  } catch (error) {
    console.error('Get placement breakdowns error:', error);
    res.status(500).json({ message: 'Server error while fetching placement breakdowns' });
  }
});

// Get device breakdowns
router.get('/devices', async (req, res) => {
  try {
    const userId = req.userId;
    const { 
      adAccountId, 
      campaignId, 
      startDate, 
      endDate 
    } = req.query;
    
    // Check permissions similar to demographics endpoint
    
    // Sample device data
    const deviceData = [
      { device: 'Mobile', platform: 'iOS', impressions: 450000, clicks: 16200, spend: 4500, ctr: 3.6 },
      { device: 'Mobile', platform: 'Android', impressions: 400000, clicks: 14000, spend: 4000, ctr: 3.5 },
      { device: 'Desktop', platform: 'Windows', impressions: 250000, clicks: 8750, spend: 2500, ctr: 3.5 },
      { device: 'Desktop', platform: 'Mac', impressions: 120000, clicks: 4800, spend: 1200, ctr: 4.0 },
      { device: 'Tablet', platform: 'iPad', impressions: 80000, clicks: 2800, spend: 800, ctr: 3.5 },
      { device: 'Tablet', platform: 'Android', impressions: 50000, clicks: 1750, spend: 500, ctr: 3.5 }
    ];
    
    res.json({ devices: deviceData });
  } catch (error) {
    console.error('Get device breakdowns error:', error);
    res.status(500).json({ message: 'Server error while fetching device breakdowns' });
  }
});

module.exports = router;
