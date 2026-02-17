# Base image
FROM node:18-slim

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy root config files
COPY package.json package-lock.json ./

# Copy workspaces
COPY backend ./backend
COPY frontend ./frontend
COPY shared ./shared

# Install ALL dependencies (including devDependencies for build)
# We use --legacy-peer-deps or simply remove the lockfile to avoid the rollup-linux-x64-gnu bug
RUN rm -f package-lock.json && npm install

# Set build context variable
ENV DATABASE_URL="file:///app/backend/prisma/dev.db"

# Build: Prisma generate + compile both workspaces
RUN cd backend && npx prisma generate && cd .. && npm run build

# Expose the API port
EXPOSE 3001

# Final Production Environment Variables
ENV NODE_ENV=production
ENV PORT=3001

# Run migrations/seed and start
# We ensure the prisma folder exists and is writable
# We also log the DB URL being used for push to verify context
CMD ["sh", "-c", "mkdir -p backend/prisma && echo 'Running DB Push against: '$DATABASE_URL && cd backend && npx prisma db push --accept-data-loss && cd .. && npm start --workspace=backend"]
