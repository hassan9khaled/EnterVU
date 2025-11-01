# STAGE 1: Build the React app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json from the frontend folder
COPY frontend/package*.json ./

# Copy the required API spec from the backend into the src/data directory
COPY backend/app/assets/EnterVU_API_V2.json ./src/data/EnterVU_API_V2.json

# Install dependencies
RUN npm install

# Copy the rest of the frontend source code
COPY frontend/ .

# Build the static files
RUN npm run build

# STAGE 2: Serve the static files with Nginx
FROM nginx:alpine

# Copy the built static files from the 'builder' stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (Nginx default)
EXPOSE 80