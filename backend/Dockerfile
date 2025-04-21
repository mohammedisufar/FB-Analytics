# Backend Dockerfile
FROM node:20-alpine

# Install OpenSSL
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Set environment variables for Prisma
ENV DATABASE_URL="postgresql://Mohammed:Dubai@1214@two84gg48w48k0884kc4g4ok:5432/fb_ads_analytics"
ENV NODE_ENV="production"

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Expose the port the app will run on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
