# Stage 1: Build the application
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files and install all dependencies (including devDependencies for build)
COPY package.json package-lock.json ./
RUN npm ci

# Copy necessary configuration files
COPY .sequelizerc ./
COPY tsconfig.json ./

# Copy the source code
COPY src ./src

# Build the TypeScript code
RUN npm run build

# Optional: Prune devDependencies if needed for any intermediate steps (not strictly necessary here)
# RUN npm prune --production

# Stage 2: Production environment
FROM node:20-slim AS final

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Copy package files from builder stage
COPY --from=builder /app/package.json /app/package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev
# Install sequelize-cli separately as it's needed for migrations at runtime but is a devDependency
RUN npm install sequelize-cli

# Copy compiled code from builder stage
COPY --from=builder /app/dist ./dist

# Copy migrations, seeders, and sequelize config needed by sequelize-cli at runtime
COPY --from=builder /app/.sequelizerc ./
COPY --from=builder /app/src/config/config.json ./src/config/
COPY --from=builder /app/src/migrations ./src/migrations/
COPY --from=builder /app/src/seeders ./src/seeders/

# Create a non-root user and switch to it
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

# Expose the port the app runs on
EXPOSE ${PORT}

# Command to run migrations and start the application
# Using npx ensures sequelize-cli is found
CMD ["sh", "-c", "npx sequelize-cli db:migrate && node dist/server.js"]

