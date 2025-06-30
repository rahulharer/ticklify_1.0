# Stage 1: Build Angular app using Node 20
FROM node:20 AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the entire project and build the app
COPY . .
RUN npm run build --configuration production

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Clean default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built Angular app from builder
COPY --from=builder /app/dist/<your-app-name> /usr/share/nginx/html

# Optional: custom Nginx config for Angular routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
