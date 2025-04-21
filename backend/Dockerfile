# Backend Dockerfile
FROM node:20-alpine

# Install OpenSSL
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Debug: List contents before setup
RUN ls -la

# Copy package files first for better caching
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Debug: List contents after package install
RUN ls -la

# Copy backend files
COPY backend/ .

# Debug: List contents after copying
RUN ls -la && ls -la prisma/

# Generate Prisma client with explicit schema path
RUN npx prisma generate --schema=./prisma/schema.prisma

# Expose the port the app will run on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
