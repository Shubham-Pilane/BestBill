# Stage 1: Build the React application
FROM node:18-slim as build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source files and build
COPY . .
RUN npm run build

# Stage 2: Serve the build with Nginx
FROM nginx:stable-alpine
# Copy build files from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port (Cloud Run will look at this, but usually port 80 is mapped)
EXPOSE 80

# Cloud Run needs the port to be configurable via PORT env var in some cases,
# but Nginx runs on 80 by default. This is the simplest way.
CMD ["nginx", "-g", "daemon off;"]
