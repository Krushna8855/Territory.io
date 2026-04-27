# Use Node 20 as the base image
FROM node:20-slim

# Set the working directory
WORKDIR /app

# Copy package files for both server and shared dependencies
COPY server/package*.json ./server/
COPY shared/ ./shared/

# Install server dependencies
WORKDIR /app/server
RUN npm install

# Copy the rest of the server source code
COPY server/ ./

# Expose the backend port
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
