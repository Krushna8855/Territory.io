# Build Stage
FROM node:20-slim AS build
WORKDIR /app

# Copy package files
COPY client/package*.json ./client/
COPY shared/ ./shared/

# Install client dependencies
WORKDIR /app/client
RUN npm install

# Copy source and build
COPY client/ ./
RUN npm run build

# Production Stage
FROM nginx:stable-alpine

# Copy built files from build stage
COPY --from=build /app/client/dist /usr/share/nginx/html

# Copy a basic nginx config to handle SPA routing
RUN printf "server { \n\
    listen 80; \n\
    location / { \n\
        root /usr/share/nginx/html; \n\
        index index.html index.htm; \n\
        try_files \$uri \$uri/ /index.html; \n\
    } \n\
    location /api { \n\
        proxy_pass http://server:3001; \n\
    } \n\
    location /socket.io { \n\
        proxy_pass http://server:3001; \n\
        proxy_http_version 1.1; \n\
        proxy_set_header Upgrade \$http_upgrade; \n\
        proxy_set_header Connection \"upgrade\"; \n\
    } \n\
}" > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
