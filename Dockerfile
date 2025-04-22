# Build stage
FROM node:22.14-alpine AS builder

WORKDIR /app

# Copy yarn configuration and lock file
COPY .yarn ./.yarn
COPY .yarnrc.yml ./
COPY yarn.lock ./
COPY package.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Install dependencies
RUN yarn install --immutable

# Copy source code
COPY src ./src

# Build the application
RUN yarn build

# Runtime stage
FROM node:22.14-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init=1.2.5-r3

# Copy yarn configuration and lock file
COPY .yarn ./.yarn
COPY .yarnrc.yml ./
COPY yarn.lock ./
COPY package.json ./

# Install production dependencies only
RUN yarn workspaces focus --all --production

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Run with dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
