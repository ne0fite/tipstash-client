# Stage 1: Build the Angular application
FROM node:21-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package*.json ./

RUN apk add --no-cache yarn

# Install dependencies
RUN yarn install

# Copy the rest of the application code
COPY . .

# Build the Angular application
RUN yarn build

# Stage 2: Serve the application using NGINX
FROM nginx:alpine

# Copy the built Angular application from the previous stage
COPY --from=build /app/dist/tipstash/browser /usr/share/nginx/html

# Copy custom NGINX configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start NGINX server
CMD ["nginx", "-g", "daemon off;"]
