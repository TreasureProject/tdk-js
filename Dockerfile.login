# syntax = docker/dockerfile:1

ARG NODE_VERSION=20.11.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Remix"

# Remix app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y build-essential pkg-config python-is-python3

# Copy application code
COPY --link . .

# Install dependencies
RUN npm install --include=dev

# Create environment file
RUN --mount=type=secret,id=dotenv,dst=env \
    tr ' ' '\n' < env > ./packages/login/.env

# Build application
RUN npm run build:login

# Remove development dependencies
RUN npm prune --omit=dev

# Start the server
EXPOSE 3000
CMD [ "npm", "start:login" ]
