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

# Set environment variables for Prisma
ENV PRISMA_SCHEMA_ENGINE_BINARY="/app/node_modules/@prisma/engines/schema-engine-linux-musl-openssl-3.0.x"
ENV PRISMA_QUERY_ENGINE_LIBRARY="/app/node_modules/@prisma/engines/libquery_engine-linux-musl-openssl-3.0.x.so.node"
ENV PRISMA_CLI_QUERY_ENGINE_TYPE="binary"

# Generate Prisma client
RUN npx prisma generate

# Expose the port the app will run on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
