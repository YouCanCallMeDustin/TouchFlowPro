FROM node:20-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Only copy package.json files - NO lockfile so npm resolves Linux-native deps fresh
COPY package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Cache bust: change this value to force a fresh npm install (bypasses Docker layer cache)
ARG CACHEBUST=2
RUN npm install

# Copy source
COPY . .

# Build: Prisma generate + compile both workspaces
RUN cd backend && npx prisma generate && cd .. && npm run build

# Expose the API port
EXPOSE 3001

# Production Environment Variables
ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/backend/prisma/dev.db"
ENV PORT=3001

# Run migrations/seed and start
# We ensure the prisma folder exists and is writable
CMD ["sh", "-c", "mkdir -p backend/prisma && cd backend && npx prisma db push --accept-data-loss && cd .. && npm start --workspace=backend"]
