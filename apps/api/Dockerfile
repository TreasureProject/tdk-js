# syntax = docker/dockerfile:1
FROM --platform=linux/amd64 node:20-alpine as base
#FROM --platform=linux/amd64 node:20-slim as base

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Install packages needed to build node modules
# RUN apt-get update -qq && \
#     apt-get install -y build-essential pkg-config python-is-python3
RUN apk update && \
    apk add --no-cache build-base pkgconfig python3 py3-pip
# Copy application code
COPY . .

# Install dependencies
RUN npm install --include=dev

# Build application
RUN npm run build:api

# Remove development dependencies
RUN npm prune --omit=dev

# Start the server
EXPOSE 8080
CMD [ "npm", "run", "start:api" ]
