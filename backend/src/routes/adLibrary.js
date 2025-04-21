const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authenticate = require('../middleware/authenticate');

const prisma = new PrismaClient();

// Apply authentication middleware to all routes
router.use(authenticate);

// Search ad library
router.get('/search', async (req, res) => {
  try {
    const { query, adType, country, dateRange, page = 1, limit = 20 } = req.query;
    
    // In a real implementation, we would search the ad library database
    // For now, we'll return sample data
    
    // Sample search results
    const searchResults = {
      ads: [
        {
          id: 'ad1',
          pageId: 'page1',
          pageName: 'Brand A',
          content: {
            title: 'Summer Sale',
            body: 'Get 50% off on all products this summer!',
            imageUrl: 'https://example.com/ad1.jpg',
            linkUrl: 'https://example.com/summer-sale'
          },
          startDate: '2023-06-01',
          endDate: '2023-08-31',
          status: 'ACTIVE'
        },
        {
          id: 'ad2',
          pageId: 'page2',
          pageName: 'Brand B',
          content: {
            title: 'New Product Launch',
            body: 'Introducing our revolutionary new product. Try it today!',
            imageUrl: 'https://example.com/ad2.jpg',
            linkUrl: 'https://example.com/new-product'
          },
          startDate: '2023-07-15',
          endDate: null,
          status: 'ACTIVE'
        },
        {
          id: 'ad3',
          pageId: 'page3',
          pageName: 'Brand C',
          content: {
            title: 'Limited Time Offer',
            body: 'Buy one, get one free. Limited time only!',
            imageUrl: 'https://example.com/ad3.jpg',
            linkUrl: 'https://example.com/limited-offer'
          },
          startDate: '2023-05-01',
          endDate: '2023-05-31',
          status: 'INACTIVE'
        }
      ],
      pagination: {
        total: 3,
        page: 1,
        limit: 20,
        pages: 1
      }
    };
    
    res.json(searchResults);
  } catch (error) {
    console.error('Search ad library error:', error);
    res.status(500).json({ message: 'Server error while searching ad library' });
  }
});

// Get ad details from library
router.get('/ads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, we would fetch the ad from the database
    // For now, we'll return sample data
    
    // Sample ad details
    const adDetails = {
      id,
      pageId: 'page1',
      pageName: 'Brand A',
      content: {
        title: 'Summer Sale',
        body: 'Get 50% off on all products this summer!',
        imageUrl: 'https://example.com/ad1.jpg',
        linkUrl: 'https://example.com/summer-sale',
        callToAction: 'Shop Now'
      },
      startDate: '2023-06-01',
      endDate: '2023-08-31',
      status: 'ACTIVE',
      impressions: 125000,
      demographics: {
        ageGender: [
          { age: '18-24', gender: 'male', percentage: 15 },
          { age: '18-24', gender: 'female', percentage: 18 },
          { age: '25-34', gender: 'male', percentage: 22 },
          { age: '25-34', gender: 'female', percentage: 25 },
          { age: '35-44', gender: 'male', percentage: 10 },
          { age: '35-44', gender: 'female', percentage: 8 },
          { age: '45+', gender: 'male', percentage: 1 },
          { age: '45+', gender: 'female', percentage: 1 }
        ],
        regions: [
          { region: 'California', percentage: 25 },
          { region: 'New York', percentage: 20 },
          { region: 'Texas', percentage: 15 },
          { region: 'Florida', percentage: 10 },
          { region: 'Other', percentage: 30 }
        ]
      }
    };
    
    res.json({ ad: adDetails });
  } catch (error) {
    console.error('Get ad details error:', error);
    res.status(500).json({ message: 'Server error while fetching ad details' });
  }
});

// Get user's ad collections
router.get('/collections', async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get user's collections
    const collections = await prisma.adCollection.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ collections });
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({ message: 'Server error while fetching collections' });
  }
});

// Create a new collection
router.post('/collections', async (req, res) => {
  try {
    const userId = req.userId;
    const { name, description, isPublic = false } = req.body;
    
    // Create collection
    const collection = await prisma.adCollection.create({
      data: {
        userId,
        name,
        description,
        isPublic
      }
    });
    
    res.status(201).json({ collection });
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(500).json({ message: 'Server error while creating collection' });
  }
});

// Get collection details
router.get('/collections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    // Find collection
    const collection = await prisma.adCollection.findFirst({
      where: {
        id,
        OR: [
          { userId },
          { isPublic: true }
        ]
      },
      include: {
        adCollectionItems: {
          include: {
            adLibraryItem: true
          }
        }
      }
    });
    
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    res.json({ collection });
  } catch (error) {
    console.error('Get collection error:', error);
    res.status(500).json({ message: 'Server error while fetching collection' });
  }
});

// Update a collection
router.put('/collections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { name, description, isPublic } = req.body;
    
    // Check if collection exists and belongs to user
    const existingCollection = await prisma.adCollection.findFirst({
      where: {
        id,
        userId
      }
    });
    
    if (!existingCollection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    // Update collection
    const updatedCollection = await prisma.adCollection.update({
      where: { id },
      data: {
        name,
        description,
        isPublic
      }
    });
    
    res.json({ collection: updatedCollection });
  } catch (error) {
    console.error('Update collection error:', error);
    res.status(500).json({ message: 'Server error while updating collection' });
  }
});

// Delete a collection
router.delete('/collections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    // Check if collection exists and belongs to user
    const existingCollection = await prisma.adCollection.findFirst({
      where: {
        id,
        userId
      }
    });
    
    if (!existingCollection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    // Delete collection
    await prisma.adCollection.delete({
      where: { id }
    });
    
    res.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    console.error('Delete collection error:', error);
    res.status(500).json({ message: 'Server error while deleting collection' });
  }
});

// Add ad to collection
router.post('/collections/:id/ads', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { adLibraryItemId, notes } = req.body;
    
    // Check if collection exists and belongs to user
    const existingCollection = await prisma.adCollection.findFirst({
      where: {
        id,
        userId
      }
    });
    
    if (!existingCollection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    // Check if ad exists in library
    let adLibraryItem = await prisma.adLibraryItem.findUnique({
      where: { id: adLibraryItemId }
    });
    
    if (!adLibraryItem) {
      // In a real implementation, we would fetch the ad from Facebook Ad Library
      // For now, we'll create a placeholder
      adLibraryItem = await prisma.adLibraryItem.create({
        data: {
          id: adLibraryItemId,
          facebookAdId: `fb_${adLibraryItemId}`,
          pageId: 'page1',
          pageName: 'Sample Page',
          content: {
            title: 'Sample Ad',
            body: 'This is a sample ad',
            imageUrl: 'https://example.com/sample.jpg'
          }
        }
      });
    }
    
    // Check if ad is already in collection
    const existingItem = await prisma.adCollectionItem.findUnique({
      where: {
        collectionId_adLibraryItemId: {
          collectionId: id,
          adLibraryItemId
        }
      }
    });
    
    if (existingItem) {
      return res.status(400).json({ message: 'Ad is already in this collection' });
    }
    
    // Add ad to collection
    const collectionItem = await prisma.adCollectionItem.create({
      data: {
        collectionId: id,
        adLibraryItemId,
        notes
      }
    });
    
    res.status(201).json({ collectionItem });
  } catch (error) {
    console.error('Add ad to collection error:', error);
    res.status(500).json({ message: 'Server error while adding ad to collection' });
  }
});

// Remove ad from collection
router.delete('/collections/:id/ads/:adId', async (req, res) => {
  try {
    const { id, adId } = req.params;
    const userId = req.userId;
    
    // Check if collection exists and belongs to user
    const existingCollection = await prisma.adCollection.findFirst({
      where: {
        id,
        userId
      }
    });
    
    if (!existingCollection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    // Remove ad from collection
    await prisma.adCollectionItem.delete({
      where: {
        collectionId_adLibraryItemId: {
          collectionId: id,
          adLibraryItemId: adId
        }
      }
    });
    
    res.json({ message: 'Ad removed from collection successfully' });
  } catch (error) {
    console.error('Remove ad from collection error:', error);
    res.status(500).json({ message: 'Server error while removing ad from collection' });
  }
});

module.exports = router;
