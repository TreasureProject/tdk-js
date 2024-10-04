# syntax = docker/dockerfile:1
FROM --platform=linux/amd64 node:20-alpine as base
# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Install packages needed to build node modules
RUN apk update && \
    apk add --no-cache build-base pkgconfig python3 py3-pip
# Copy application code
COPY . .

# Install dependencies
RUN npm install --include=dev

# Build packages
RUN pnpm build:auth
RUN pnpm build:core

# Build application
RUN pnpm build:api

# Remove development dependencies
RUN npm prune --omit=dev

# Start the server
EXPOSE 8080
CMD [ "npm", "run", "start:api" ]
