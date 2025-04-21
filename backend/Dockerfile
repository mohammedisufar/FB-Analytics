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

# Copy prisma schema and generate client
COPY prisma/ ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application
COPY src/ ./src/
COPY .env.example ./

# Expose the port the app will run on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
