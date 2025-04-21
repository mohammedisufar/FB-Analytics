const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Create initial admin user and roles
async function seedAuthData() {
  try {
    console.log('Seeding authentication data...');
    
    // Create roles
    const adminRole = await prisma.role.upsert({
      where: { name: 'Admin' },
      update: {},
      create: {
        name: 'Admin',
        description: 'Full system access',
        isSystem: true
      }
    });
    
    const managerRole = await prisma.role.upsert({
      where: { name: 'Manager' },
      update: {},
      create: {
        name: 'Manager',
        description: 'Can manage campaigns and team members',
        isSystem: true
      }
    });
    
    const analystRole = await prisma.role.upsert({
      where: { name: 'Analyst' },
      update: {},
      create: {
        name: 'Analyst',
        description: 'View-only access to campaigns and analytics',
        isSystem: true
      }
    });
    
    const creatorRole = await prisma.role.upsert({
      where: { name: 'Creator' },
      update: {},
      create: {
        name: 'Creator',
        description: 'Can create and edit ads',
        isSystem: true
      }
    });
    
    const clientRole = await prisma.role.upsert({
      where: { name: 'Client' },
      update: {},
      create: {
        name: 'Client',
        description: 'Limited access to specific campaigns',
        isSystem: true
      }
    });
    
    console.log('Roles created');
    
    // Create permissions
    const permissions = [
      // User management permissions
      { name: 'users:read', resource: 'users', action: 'read', description: 'View users' },
      { name: 'users:write', resource: 'users', action: 'write', description: 'Create/update users' },
      { name: 'users:delete', resource: 'users', action: 'delete', description: 'Delete users' },
      
      // Ad account permissions
      { name: 'adAccounts:read', resource: 'adAccounts', action: 'read', description: 'View ad accounts' },
      { name: 'adAccounts:write', resource: 'adAccounts', action: 'write', description: 'Create/update ad accounts' },
      { name: 'adAccounts:delete', resource: 'adAccounts', action: 'delete', description: 'Delete ad accounts' },
      
      // Campaign permissions
      { name: 'campaigns:read', resource: 'campaigns', action: 'read', description: 'View campaigns' },
      { name: 'campaigns:write', resource: 'campaigns', action: 'write', description: 'Create/update campaigns' },
      { name: 'campaigns:delete', resource: 'campaigns', action: 'delete', description: 'Delete campaigns' },
      
      // Analytics permissions
      { name: 'analytics:read', resource: 'analytics', action: 'read', description: 'View analytics' },
      { name: 'analytics:export', resource: 'analytics', action: 'export', description: 'Export analytics' },
      
      // Ad library permissions
      { name: 'adLibrary:read', resource: 'adLibrary', action: 'read', description: 'View ad library' },
      { name: 'adLibrary:write', resource: 'adLibrary', action: 'write', description: 'Create/update ad collections' },
      
      // Billing permissions
      { name: 'billing:read', resource: 'billing', action: 'read', description: 'View billing information' },
      { name: 'billing:write', resource: 'billing', action: 'write', description: 'Update billing information' }
    ];
    
    for (const permission of permissions) {
      await prisma.permission.upsert({
        where: { name: permission.name },
        update: {},
        create: permission
      });
    }
    
    console.log('Permissions created');
    
    // Assign permissions to roles
    
    // Admin role - all permissions
    for (const permission of permissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: (await prisma.permission.findUnique({ where: { name: permission.name } })).id
          }
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: (await prisma.permission.findUnique({ where: { name: permission.name } })).id
        }
      });
    }
    
    // Manager role permissions
    const managerPermissions = [
      'users:read', 'users:write',
      'adAccounts:read', 'adAccounts:write',
      'campaigns:read', 'campaigns:write', 'campaigns:delete',
      'analytics:read', 'analytics:export',
      'adLibrary:read', 'adLibrary:write',
      'billing:read'
    ];
    
    for (const permissionName of managerPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: managerRole.id,
            permissionId: (await prisma.permission.findUnique({ where: { name: permissionName } })).id
          }
        },
        update: {},
        create: {
          roleId: managerRole.id,
          permissionId: (await prisma.permission.findUnique({ where: { name: permissionName } })).id
        }
      });
    }
    
    // Analyst role permissions
    const analystPermissions = [
      'adAccounts:read',
      'campaigns:read',
      'analytics:read', 'analytics:export',
      'adLibrary:read'
    ];
    
    for (const permissionName of analystPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: analystRole.id,
            permissionId: (await prisma.permission.findUnique({ where: { name: permissionName } })).id
          }
        },
        update: {},
        create: {
          roleId: analystRole.id,
          permissionId: (await prisma.permission.findUnique({ where: { name: permissionName } })).id
        }
      });
    }
    
    // Creator role permissions
    const creatorPermissions = [
      'adAccounts:read',
      'campaigns:read', 'campaigns:write',
      'analytics:read',
      'adLibrary:read', 'adLibrary:write'
    ];
    
    for (const permissionName of creatorPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: creatorRole.id,
            permissionId: (await prisma.permission.findUnique({ where: { name: permissionName } })).id
          }
        },
        update: {},
        create: {
          roleId: creatorRole.id,
          permissionId: (await prisma.permission.findUnique({ where: { name: permissionName } })).id
        }
      });
    }
    
    // Client role permissions
    const clientPermissions = [
      'campaigns:read',
      'analytics:read'
    ];
    
    for (const permissionName of clientPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: clientRole.id,
            permissionId: (await prisma.permission.findUnique({ where: { name: permissionName } })).id
          }
        },
        update: {},
        create: {
          roleId: clientRole.id,
          permissionId: (await prisma.permission.findUnique({ where: { name: permissionName } })).id
        }
      });
    }
    
    console.log('Role permissions assigned');
    
    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        passwordHash,
        firstName: 'Admin',
        lastName: 'User',
        isEmailVerified: true,
        status: 'active'
      }
    });
    
    // Assign admin role to admin user
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: adminRole.id
        }
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: adminRole.id
      }
    });
    
    console.log('Admin user created');
    
    // Create demo user
    const demoPasswordHash = await bcrypt.hash('demo123', salt);
    
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@example.com' },
      update: {},
      create: {
        email: 'demo@example.com',
        passwordHash: demoPasswordHash,
        firstName: 'Demo',
        lastName: 'User',
        isEmailVerified: true,
        status: 'active'
      }
    });
    
    // Assign manager role to demo user
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: demoUser.id,
          roleId: managerRole.id
        }
      },
      update: {},
      create: {
        userId: demoUser.id,
        roleId: managerRole.id
      }
    });
    
    console.log('Demo user created');
    
    console.log('Authentication data seeding completed');
  } catch (error) {
    console.error('Error seeding authentication data:', error);
  }
}

module.exports = { seedAuthData };
