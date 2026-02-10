# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Install all dependencies (including devDependencies if needed for build)
RUN npm ci

COPY . .

# Production Stage
FROM node:18-alpine

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Create app directory owned by node user
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Copy dependencies from builder
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package*.json ./

# Copy source code
COPY --from=builder --chown=node:node /app .

# Expose port (must match PORT env)
EXPOSE 3000

# Start command
CMD ["node", "server.js"]
