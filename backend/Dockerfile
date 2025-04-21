# Backend Dockerfile
FROM node:20-alpine

# Install OpenSSL
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Debug: List contents
RUN ls -la

# Copy package files first for better caching
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Debug: List contents after npm install
RUN ls -la

# Copy prisma schema and generate client
COPY backend/prisma/ ./prisma/

# Debug: List contents after copying prisma
RUN ls -la && ls -la prisma/

# Set environment variables for Prisma
ENV DATABASE_URL="postgresql://Mohammed:Dubai@1214@two84gg48w48k0884kc4g4ok:5432/fb_ads_analytics"
ENV NODE_ENV="production"

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application
COPY backend/src/ ./src/
COPY backend/.env.example ./.env

# Debug: List final contents
RUN ls -la

# Expose the port the app will run on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
