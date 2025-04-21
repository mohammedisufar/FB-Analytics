# Facebook Ads Analytics Application Deployment Guide

This document provides instructions for deploying the Facebook Ads Analytics application to a production environment.

## Prerequisites

Before deploying the application, ensure you have the following:

- Docker and Docker Compose installed on your server
- A domain name pointing to your server
- SSL certificates for your domain
- Stripe account with API keys
- Facebook Developer account with a registered application
- PostgreSQL database (can be deployed with Docker as configured)

## Environment Configuration

1. Copy the `.env.example` file to `.env`:
   ```
   cp .env.example .env
   ```

2. Edit the `.env` file and fill in all required values:
   - Database credentials
   - JWT secret key
   - Stripe API keys
   - Facebook API credentials
   - Server configuration

## Deployment Options

### Option 1: Manual Deployment with Docker Compose

1. Build and start the containers:
   ```
   docker-compose up -d
   ```

2. Initialize the database (first time only):
   ```
   docker-compose exec backend npx prisma migrate deploy
   docker-compose exec backend node src/utils/seedAuth.js
   ```

3. Access the application at your configured domain.

### Option 2: Automated Deployment with GitHub Actions

1. Set up the following secrets in your GitHub repository:
   - `DOCKERHUB_USERNAME`: Your Docker Hub username
   - `DOCKERHUB_TOKEN`: Your Docker Hub access token
   - `SERVER_HOST`: Your server's hostname or IP
   - `SERVER_USERNAME`: SSH username for your server
   - `SERVER_SSH_KEY`: SSH private key for authentication

2. Push your code to the main branch, and the GitHub Actions workflow will automatically:
   - Run tests
   - Build Docker images
   - Push images to Docker Hub
   - Deploy to your server

## Post-Deployment Steps

1. Set up Stripe webhooks:
   - Go to the Stripe Dashboard > Developers > Webhooks
   - Add an endpoint with your domain: `https://your-domain.com/api/payments/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
   - Get the webhook signing secret and update your `.env` file

2. Configure Facebook App:
   - Add OAuth redirect URI: `https://your-domain.com/api/auth/facebook/callback`
   - Configure valid domains in your Facebook App settings

3. Set up SSL with Let's Encrypt:
   ```
   certbot --nginx -d your-domain.com
   ```

## Monitoring and Maintenance

- View logs:
  ```
  docker-compose logs -f
  ```

- Update the application:
  ```
  git pull
  docker-compose down
  docker-compose up -d --build
  ```

- Database backup:
  ```
  docker-compose exec db pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} > backup.sql
  ```

## Scaling Considerations

For higher traffic applications:

1. Use a managed database service instead of the containerized PostgreSQL
2. Set up a load balancer in front of multiple backend instances
3. Implement Redis for caching and session management
4. Consider using Kubernetes for container orchestration instead of Docker Compose

## Troubleshooting

- If the application doesn't start, check the logs:
  ```
  docker-compose logs
  ```

- If you encounter database connection issues:
  ```
  docker-compose exec backend npx prisma migrate status
  ```

- For Facebook API issues, verify your app credentials and permissions in the Facebook Developer Console

## Security Considerations

- Regularly update dependencies
- Set up automated security scanning
- Implement rate limiting for API endpoints
- Use strong, unique passwords for all services
- Rotate API keys periodically
