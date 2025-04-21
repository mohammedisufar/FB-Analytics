# Coolify Deployment Guide for Facebook Ads Analytics

This guide provides simplified instructions for deploying the Facebook Ads Analytics application using Coolify, designed specifically for users without extensive technical expertise.

## Prerequisites

Before starting, make sure you have:
- A Coolify account
- A server where Coolify is installed (or use Coolify Cloud)
- Your Facebook Developer credentials
- Your Stripe API keys

## Step-by-Step Deployment Guide

### Step 1: Prepare Your Repository

1. Create a GitHub or GitLab account if you don't have one
2. Create a new repository and upload all the application files
3. Make sure your repository includes:
   - `docker-compose.yml`
   - Frontend and backend `Dockerfile`s
   - `.env.example`

### Step 2: Set Up Coolify

1. Log in to your Coolify dashboard
2. If you haven't connected your server yet:
   - Go to "Servers" and click "New Server"
   - Follow the instructions to connect your server to Coolify

### Step 3: Create a Database

1. In Coolify dashboard, go to "Resources" and click "New Resource"
2. Select "Database" as the resource type
3. Choose "PostgreSQL" as the database type
4. Fill in the form:
   - Name: `fb-ads-analytics-db`
   - Username: Create a username
   - Password: Generate a secure password
   - Database Name: `fb_ads_analytics`
5. Click "Create" and wait for the database to be provisioned
6. Once created, click on the database and note the connection details

### Step 4: Deploy the Backend

1. In Coolify dashboard, go to "Resources" and click "New Resource"
2. Select "Application" as the resource type
3. Choose your Git provider (GitHub, GitLab, etc.)
4. Select the repository containing your application
5. Configure the backend:
   - Name: `fb-ads-analytics-backend`
   - Build Method: Dockerfile
   - Dockerfile Location: `backend/Dockerfile`
   - Port: 5000
6. Set up environment variables:
   - Click "Environment Variables"
   - Add the following variables (replace with your values):
     ```
     DATABASE_URL=postgresql://username:password@db-host:5432/fb_ads_analytics
     JWT_SECRET=your_secure_jwt_secret
     STRIPE_SECRET_KEY=your_stripe_secret_key
     STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
     FRONTEND_URL=https://your-frontend-domain.com
     NODE_ENV=production
     PORT=5000
     ```
7. Click "Deploy" and wait for the build to complete

### Step 5: Deploy the Frontend

1. In Coolify dashboard, go to "Resources" and click "New Resource"
2. Select "Application" as the resource type
3. Choose your Git provider again
4. Select the same repository
5. Configure the frontend:
   - Name: `fb-ads-analytics-frontend`
   - Build Method: Dockerfile
   - Dockerfile Location: `frontend/Dockerfile`
   - Port: 3000
6. Set up environment variables:
   - Click "Environment Variables"
   - Add the following variables (replace with your values):
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
     NODE_ENV=production
     ```
7. Click "Deploy" and wait for the build to complete

### Step 6: Set Up Domains

1. For the backend:
   - Go to your backend application in Coolify
   - Click "Settings" > "Domains"
   - Add your domain (e.g., `api.yourdomain.com`)
   - Enable HTTPS

2. For the frontend:
   - Go to your frontend application in Coolify
   - Click "Settings" > "Domains"
   - Add your domain (e.g., `yourdomain.com`)
   - Enable HTTPS

### Step 7: Initialize the Database

1. Go to your backend application in Coolify
2. Click "Terminal" to open a terminal session
3. Run the following commands:
   ```
   npx prisma migrate deploy
   node src/utils/seedAuth.js
   ```
4. This will set up your database schema and create an initial admin user

### Step 8: Final Configuration

1. Set up Stripe webhooks:
   - Go to the Stripe Dashboard > Developers > Webhooks
   - Add an endpoint: `https://api.yourdomain.com/api/payments/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
   - Get the webhook signing secret and update your backend environment variable

2. Configure Facebook App:
   - Go to Facebook Developers Console
   - Add your domain to the app settings
   - Add OAuth redirect URI: `https://api.yourdomain.com/api/auth/facebook/callback`

## Troubleshooting

### If the application doesn't start:
1. Check the logs in Coolify by clicking on your application and then "Logs"
2. Make sure all environment variables are set correctly
3. Verify that your database is running and accessible

### If you can't connect to the database:
1. Check if the database is running in Coolify
2. Verify the DATABASE_URL environment variable is correct
3. Make sure the database is accessible from your backend application

### If Facebook integration doesn't work:
1. Verify your Facebook App credentials
2. Check that your domain is properly configured in the Facebook Developer Console
3. Make sure the redirect URI is correctly set

## Maintenance

- To update your application, simply push changes to your repository and redeploy in Coolify
- To backup your database, use the backup feature in Coolify's database management
- Monitor your application's performance in the Coolify dashboard

## Support

If you encounter any issues with Coolify deployment, you can:
1. Check Coolify's documentation at https://coolify.io/docs
2. Join Coolify's community Discord for support
3. Contact Coolify's support team directly

For issues specific to the Facebook Ads Analytics application, refer to the main documentation or contact the application support team.
