const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authenticate = require('../middleware/authenticate');

const prisma = new PrismaClient();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all campaigns for the current user
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const { adAccountId } = req.query;
    
    // Build query
    const whereClause = {};
    
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
    
    // Get campaigns
    const campaigns = await prisma.campaign.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ campaigns });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ message: 'Server error while fetching campaigns' });
  }
});

// Get a specific campaign
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    // Find the campaign
    const campaign = await prisma.campaign.findFirst({
      where: {
        id,
        adAccount: {
          facebookAccount: {
            userId
          }
        }
      },
      include: {
        adAccount: true
      }
    });
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    res.json({ campaign });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ message: 'Server error while fetching campaign' });
  }
});

// Create a new campaign
router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    const { 
      adAccountId, 
      name, 
      objective, 
      status, 
      dailyBudget, 
      lifetimeBudget, 
      startTime, 
      endTime 
    } = req.body;
    
    // Check if ad account exists and belongs to user
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
    
    // In a real implementation, we would create the campaign on Facebook first
    // and then store the result in our database
    // For now, we'll just create it in our database
    
    // Generate a fake Facebook campaign ID
    const facebookCampaignId = `fb_${Date.now()}`;
    
    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        adAccountId,
        facebookCampaignId,
        name,
        objective,
        status: status || 'PAUSED',
        dailyBudget: dailyBudget ? parseFloat(dailyBudget) : null,
        lifetimeBudget: lifetimeBudget ? parseFloat(lifetimeBudget) : null,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        buyingType: 'AUCTION',
        specialAdCategories: []
      }
    });
    
    res.status(201).json({ campaign });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ message: 'Server error while creating campaign' });
  }
});

// Update a campaign
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { 
      name, 
      status, 
      dailyBudget, 
      lifetimeBudget, 
      startTime, 
      endTime 
    } = req.body;
    
    // Check if campaign exists and belongs to user
    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        id,
        adAccount: {
          facebookAccount: {
            userId
          }
        }
      }
    });
    
    if (!existingCampaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // In a real implementation, we would update the campaign on Facebook first
    // For now, we'll just update it in our database
    
    // Update campaign
    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: {
        name,
        status,
        dailyBudget: dailyBudget ? parseFloat(dailyBudget) : undefined,
        lifetimeBudget: lifetimeBudget ? parseFloat(lifetimeBudget) : undefined,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined
      }
    });
    
    res.json({ campaign: updatedCampaign });
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ message: 'Server error while updating campaign' });
  }
});

// Delete a campaign
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    // Check if campaign exists and belongs to user
    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        id,
        adAccount: {
          facebookAccount: {
            userId
          }
        }
      }
    });
    
    if (!existingCampaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // In a real implementation, we would delete or archive the campaign on Facebook first
    // For now, we'll just delete it from our database
    
    // Delete campaign
    await prisma.campaign.delete({
      where: { id }
    });
    
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ message: 'Server error while deleting campaign' });
  }
});

// Get ad sets for a campaign
router.get('/:id/adsets', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    // Check if campaign exists and belongs to user
    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        id,
        adAccount: {
          facebookAccount: {
            userId
          }
        }
      }
    });
    
    if (!existingCampaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Get ad sets
    const adSets = await prisma.adSet.findMany({
      where: { campaignId: id },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ adSets });
  } catch (error) {
    console.error('Get ad sets error:', error);
    res.status(500).json({ message: 'Server error while fetching ad sets' });
  }
});

// Get insights for a campaign
router.get('/:id/insights', async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const userId = req.userId;
    
    // Check if campaign exists and belongs to user
    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        id,
        adAccount: {
          facebookAccount: {
            userId
          }
        }
      }
    });
    
    if (!existingCampaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Parse dates
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
    const end = endDate ? new Date(endDate) : new Date();
    
    // Get insights
    const insights = await prisma.insight.findMany({
      where: {
        objectId: id,
        objectType: 'CAMPAIGN',
        date: {
          gte: start,
          lte: end
        }
      },
      orderBy: { date: 'asc' }
    });
    
    res.json({ insights });
  } catch (error) {
    console.error('Get campaign insights error:', error);
    res.status(500).json({ message: 'Server error while fetching campaign insights' });
  }
});

module.exports = router;
