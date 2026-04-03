# Stage 1: Build is the same
FROM node:20-slim as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Strong Nginx configuration
FROM nginx:stable-alpine
# Copy the built files
COPY --from=build /app/dist /usr/share/nginx/html

# Create a custom Nginx config inside the Dockerfile to avoid any 404 errors
RUN echo 'server { \
    listen 8080; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
