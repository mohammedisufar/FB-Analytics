const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authenticate = require('../middleware/authenticate');

const prisma = new PrismaClient();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all ad accounts for the current user
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get Facebook accounts for the user
    const facebookAccounts = await prisma.facebookAccount.findMany({
      where: { userId },
      include: {
        adAccounts: true
      }
    });
    
    // Extract ad accounts from all Facebook accounts
    const adAccounts = facebookAccounts.flatMap(account => account.adAccounts);
    
    res.json({ adAccounts });
  } catch (error) {
    console.error('Get ad accounts error:', error);
    res.status(500).json({ message: 'Server error while fetching ad accounts' });
  }
});

// Get a specific ad account
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    // Find the ad account
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
    
    res.json({ adAccount });
  } catch (error) {
    console.error('Get ad account error:', error);
    res.status(500).json({ message: 'Server error while fetching ad account' });
  }
});

// Update ad account settings
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { name } = req.body;
    
    // Check if ad account exists and belongs to user
    const existingAdAccount = await prisma.adAccount.findFirst({
      where: {
        id,
        facebookAccount: {
          userId
        }
      }
    });
    
    if (!existingAdAccount) {
      return res.status(404).json({ message: 'Ad account not found' });
    }
    
    // Update ad account
    const updatedAdAccount = await prisma.adAccount.update({
      where: { id },
      data: { name }
    });
    
    res.json({ adAccount: updatedAdAccount });
  } catch (error) {
    console.error('Update ad account error:', error);
    res.status(500).json({ message: 'Server error while updating ad account' });
  }
});

// Get campaigns for an ad account
router.get('/:id/campaigns', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    // Check if ad account exists and belongs to user
    const existingAdAccount = await prisma.adAccount.findFirst({
      where: {
        id,
        facebookAccount: {
          userId
        }
      }
    });
    
    if (!existingAdAccount) {
      return res.status(404).json({ message: 'Ad account not found' });
    }
    
    // Get campaigns
    const campaigns = await prisma.campaign.findMany({
      where: { adAccountId: id },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ campaigns });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ message: 'Server error while fetching campaigns' });
  }
});

// Get insights for an ad account
router.get('/:id/insights', async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const userId = req.userId;
    
    // Check if ad account exists and belongs to user
    const existingAdAccount = await prisma.adAccount.findFirst({
      where: {
        id,
        facebookAccount: {
          userId
        }
      }
    });
    
    if (!existingAdAccount) {
      return res.status(404).json({ message: 'Ad account not found' });
    }
    
    // Parse dates
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
    const end = endDate ? new Date(endDate) : new Date();
    
    // Get insights
    const insights = await prisma.insight.findMany({
      where: {
        adAccountId: id,
        objectType: 'ACCOUNT',
        date: {
          gte: start,
          lte: end
        }
      },
      orderBy: { date: 'asc' }
    });
    
    res.json({ insights });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ message: 'Server error while fetching insights' });
  }
});

// Get users with access to ad account
router.get('/:id/users', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    // Check if ad account exists and belongs to user
    const existingAdAccount = await prisma.adAccount.findFirst({
      where: {
        id,
        facebookAccount: {
          userId
        }
      }
    });
    
    if (!existingAdAccount) {
      return res.status(404).json({ message: 'Ad account not found' });
    }
    
    // Get ad account users
    const adAccountUsers = await prisma.adAccountUser.findMany({
      where: { adAccountId: id }
    });
    
    res.json({ adAccountUsers });
  } catch (error) {
    console.error('Get ad account users error:', error);
    res.status(500).json({ message: 'Server error while fetching ad account users' });
  }
});

module.exports = router;
