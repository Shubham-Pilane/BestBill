# Use a lightweight Node.js image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Install dependencies separately to leverage Docker cache
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Set production environment
ENV NODE_ENV=production

# Cloud Run injects PORT env var (default 8080)
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
