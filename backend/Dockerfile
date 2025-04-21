# Backend Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files first
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose the port the app will run on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
