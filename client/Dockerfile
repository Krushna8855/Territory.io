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
ARG VITE_SOCKET_URL
ENV VITE_SOCKET_URL=\$VITE_SOCKET_URL
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
}" > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
