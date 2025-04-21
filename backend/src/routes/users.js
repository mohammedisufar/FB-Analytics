const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate');
const { checkPermission } = require('../middleware/permissions');

const prisma = new PrismaClient();

// Get all users (admin only)
router.get('/', authenticate, checkPermission('users:read'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });
    
    // Format user data to include roles
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      createdAt: user.createdAt,
      roles: user.userRoles.map(ur => ur.role.name)
    }));
    
    res.json({ users: formattedUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get user by ID (admin or self)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    // Check if user is requesting their own data or has admin permission
    if (id !== userId) {
      const hasPermission = await checkPermission('users:read')(req, res, () => true);
      if (!hasPermission) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
    }
    
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
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
        },
        facebookAccounts: true,
        subscriptions: {
          where: {
            OR: [
              { endDate: null },
              { endDate: { gt: new Date() } }
            ]
          },
          include: {
            plan: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Extract permissions from roles
    const permissions = user.userRoles.flatMap(userRole => 
      userRole.role.rolePermissions.map(rp => rp.permission.name)
    );
    
    // Format user data
    const formattedUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      createdAt: user.createdAt,
      roles: user.userRoles.map(ur => ({
        id: ur.role.id,
        name: ur.role.name
      })),
      permissions: [...new Set(permissions)],
      facebookAccounts: user.facebookAccounts.map(account => ({
        id: account.id,
        name: account.name,
        email: account.email
      })),
      subscription: user.subscriptions[0] || null
    };
    
    res.json({ user: formattedUser });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// Create user (admin only)
router.post('/', authenticate, checkPermission('users:write'), async (req, res) => {
  try {
    const { email, password, firstName, lastName, roleIds } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        isActive: true
      }
    });
    
    // Assign roles if provided
    if (roleIds && roleIds.length > 0) {
      const userRoles = roleIds.map(roleId => ({
        userId: user.id,
        roleId
      }));
      
      await prisma.userRole.createMany({
        data: userRoles
      });
    } else {
      // Assign default FREE_USER role
      const freeUserRole = await prisma.role.findFirst({
        where: { name: 'FREE_USER' }
      });
      
      if (freeUserRole) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: freeUserRole.id
          }
        });
      }
    }
    
    res.status(201).json({ 
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// Update user (admin or self)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { firstName, lastName, email, isActive, roleIds } = req.body;
    
    // Check if user is updating their own data or has admin permission
    const isUpdatingSelf = id === userId;
    let hasAdminPermission = false;
    
    if (!isUpdatingSelf) {
      hasAdminPermission = await checkPermission('users:write')(req, res, () => true);
      if (!hasAdminPermission) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prepare update data
    const updateData = {};
    
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    
    // Only admin can update email and active status
    if (hasAdminPermission) {
      if (email !== undefined) updateData.email = email;
      if (isActive !== undefined) updateData.isActive = isActive;
    }
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    });
    
    // Update roles if provided and user has admin permission
    if (roleIds && roleIds.length > 0 && hasAdminPermission) {
      // Delete existing roles
      await prisma.userRole.deleteMany({
        where: { userId: id }
      });
      
      // Assign new roles
      const userRoles = roleIds.map(roleId => ({
        userId: id,
        roleId
      }));
      
      await prisma.userRole.createMany({
        data: userRoles
      });
    }
    
    res.json({ 
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        isActive: updatedUser.isActive
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Change password (self only)
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;
    
    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

// Reset password (admin only)
router.post('/:id/reset-password', authenticate, checkPermission('users:write'), async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    // Validate required fields
    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticate, checkPermission('users:write'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete user roles
    await prisma.userRole.deleteMany({
      where: { userId: id }
    });
    
    // Delete user
    await prisma.user.delete({
      where: { id }
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Get all roles (admin only)
router.get('/roles/all', authenticate, checkPermission('roles:read'), async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    });
    
    // Format role data to include permissions
    const formattedRoles = roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.rolePermissions.map(rp => ({
        id: rp.permission.id,
        name: rp.permission.name,
        description: rp.permission.description
      }))
    }));
    
    res.json({ roles: formattedRoles });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Failed to fetch roles' });
  }
});

// Get all permissions (admin only)
router.get('/permissions/all', authenticate, checkPermission('roles:read'), async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany();
    
    res.json({ permissions });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ message: 'Failed to fetch permissions' });
  }
});

module.exports = router;
