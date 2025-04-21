const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Middleware to check if user has required permissions
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      // Get user roles
      const userRoles = await prisma.userRole.findMany({
        where: { userId },
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      });
      
      // Extract permissions from roles
      const userPermissions = userRoles.flatMap(userRole => 
        userRole.role.rolePermissions.map(rp => rp.permission.name)
      );
      
      // Check if user has the required permission
      if (!userPermissions.includes(requiredPermission)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
      
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ message: 'Server error during permission check' });
    }
  };
};

// Middleware to get user permissions
const getUserPermissions = async (req, res, next) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      req.userPermissions = [];
      return next();
    }
    
    // Get user roles
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });
    
    // Extract permissions from roles
    const userPermissions = userRoles.flatMap(userRole => 
      userRole.role.rolePermissions.map(rp => rp.permission.name)
    );
    
    // Add permissions to request
    req.userPermissions = [...new Set(userPermissions)];
    
    next();
  } catch (error) {
    console.error('Get user permissions error:', error);
    req.userPermissions = [];
    next();
  }
};

module.exports = { checkPermission, getUserPermissions };
