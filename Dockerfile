# Build stage
FROM node:15-alpine AS builder

WORKDIR /app

# Install compatible yarn version (force overwrite)
RUN npm install -g yarn@1.22.10 --force

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript
RUN yarn build

# Runtime stage
FROM node:15-alpine

WORKDIR /app

# Install compatible yarn version (force overwrite)
RUN npm install -g yarn@1.22.10 --force

# Copy package files
COPY package.json yarn.lock ./

# Install production dependencies only
RUN yarn install --production --frozen-lockfile

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/views ./views
COPY --from=builder /app/public ./public

# Create images directory
RUN mkdir -p public/images

# Expose port (Railway detects PORT env var)
EXPOSE 3000

# Start the application
CMD ["node", "dist/server.js"]
