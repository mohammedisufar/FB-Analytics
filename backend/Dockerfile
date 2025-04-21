# Backend Dockerfile
FROM node:20-alpine

# Install OpenSSL
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY backend/src ./src
COPY backend/prisma ./prisma
COPY backend/.env.example ./.env

# Set environment variables
ENV NODE_ENV="production"
ENV DATABASE_URL="postgresql://Mohammed:Dubai@1214@two84gg48w48k0884kc4g4ok:5432/fb_ads_analytics"

# Install Prisma CLI globally
RUN npm install -g prisma

# Generate Prisma client
RUN prisma generate

# Expose the port the app will run on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
