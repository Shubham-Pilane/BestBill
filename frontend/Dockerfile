# Stage 1: Build the React application
# Upgrade to Node 20 as required by Tailwind 4 and React Router 7
FROM node:20-slim as build
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

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
