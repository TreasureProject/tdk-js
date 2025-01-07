# syntax = docker/dockerfile:1
FROM --platform=linux/amd64 node:22-alpine as base
# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Install packages needed to build node modules
RUN apk update && \
    apk add --no-cache build-base openssl pkgconfig python3 py3-pip
# Copy application code
COPY . .

# Install pnpm
RUN npm install -g pnpm

# Install dependencies including dev dependencies
RUN pnpm install --prod=false

# Build application
RUN pnpm build:api

# Remove development dependencies
RUN pnpm prune --prod

# Start the server
EXPOSE 8080
CMD [ "pnpm", "start:api" ]
